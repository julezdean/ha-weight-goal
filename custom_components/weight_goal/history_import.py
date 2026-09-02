"""Import past weights from the recorder into the internal history.

The internal ring buffer normally fills up as measurements arrive, which means
the trend and the projection stay unavailable for the first days after setup.
This module fills it from data Home Assistant already has.

Two sources are read and merged:

* Recorded states carry every individual weigh-in, but only as far back as the
  recorder keeps them, ten days by default.
* Long term statistics reach back much further but are aggregated, so an older
  day contributes one averaged value rather than the exact reading.

States win wherever both cover the same moment.
"""

from __future__ import annotations

import logging
from datetime import datetime, timedelta
from typing import TYPE_CHECKING, Any

from homeassistant.const import STATE_UNAVAILABLE, STATE_UNKNOWN
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError
from homeassistant.util import dt as dt_util

from .const import DOMAIN, KEY_WEIGHT, MAX_MEASUREMENTS, SOURCE_IMPORT

if TYPE_CHECKING:
    from .manager import WeightGoalManager

_LOGGER = logging.getLogger(__name__)

#: Statistics older than this are not worth importing for a weight goal.
MAX_IMPORT_DAYS = 3650


def _collect_states(
    hass: HomeAssistant, entity_id: str, start: datetime, end: datetime
) -> list[tuple[datetime, float]]:
    """Read individual recorded states. Runs in the recorder executor."""
    from homeassistant.components.recorder import history

    result = history.state_changes_during_period(
        hass,
        start,
        end,
        entity_id,
        no_attributes=True,
        include_start_time_state=False,
    )
    points: list[tuple[datetime, float]] = []
    for state in result.get(entity_id, []):
        if state.state in (STATE_UNKNOWN, STATE_UNAVAILABLE, "", None):
            continue
        try:
            points.append((state.last_changed, float(state.state)))
        except (TypeError, ValueError):
            continue
    return points


def _collect_statistics(
    hass: HomeAssistant, entity_id: str, start: datetime, end: datetime
) -> list[tuple[datetime, float]]:
    """Read one averaged value per day. Runs in the recorder executor."""
    from homeassistant.components.recorder.statistics import statistics_during_period

    rows = statistics_during_period(
        hass, start, end, {entity_id}, "day", None, {"mean"}
    )
    points: list[tuple[datetime, float]] = []
    for row in rows.get(entity_id, []):
        mean = row.get("mean")
        if mean is None:
            continue
        stamp = row.get("start")
        if stamp is None:
            continue
        moment = dt_util.utc_from_timestamp(stamp) if isinstance(
            stamp, (int, float)
        ) else stamp
        points.append((moment, float(mean)))
    return points


def _hourly_buckets(
    points: list[tuple[datetime, float]],
) -> list[dict[str, Any]]:
    """Group measurements into the hourly buckets the recorder expects.

    Long term statistics are stored per hour, aligned to the full hour in UTC.
    A weight measured at 07:42 therefore belongs to the 07:00 bucket.
    """
    buckets: dict[datetime, list[float]] = {}
    for moment, value in points:
        hour = dt_util.as_utc(moment).replace(minute=0, second=0, microsecond=0)
        buckets.setdefault(hour, []).append(value)

    rows: list[dict[str, Any]] = []
    for hour in sorted(buckets):
        values = buckets[hour]
        rows.append(
            {
                "start": hour,
                "mean": round(sum(values) / len(values), 3),
                "min": round(min(values), 3),
                "max": round(max(values), 3),
            }
        )
    return rows


def _write_statistics(
    manager: WeightGoalManager, points: list[tuple[datetime, float]]
) -> int:
    """Backfill long term statistics for our own weight sensor.

    The states table cannot be written retroactively, but long term statistics
    can. They are what every history graph reads for anything older than the
    recorder's short term retention, so this is what makes the past visible.
    """
    from homeassistant.components.recorder.models import StatisticMeanType
    from homeassistant.components.recorder.statistics import async_import_statistics

    entity_id = manager.weight_entity_id
    if entity_id is None:
        raise HomeAssistantError(
            translation_domain=DOMAIN, translation_key="no_weight_entity"
        )

    rows = _hourly_buckets(points)
    if not rows:
        return 0

    metadata = {
        "has_sum": False,
        "mean_type": StatisticMeanType.ARITHMETIC,
        "name": None,
        "source": "recorder",
        "statistic_id": entity_id,
        "unit_class": "mass",
        "unit_of_measurement": "kg",
    }
    async_import_statistics(manager.hass, metadata, rows)
    return len(rows)


async def async_import_history(
    manager: WeightGoalManager,
    *,
    source_entity: str | None = None,
    days: int = 365,
    replace: bool = False,
    write_statistics: bool = False,
) -> dict[str, Any]:
    """Import past weights and return a short report.

    Values outside the configured plausibility range are skipped. The largest
    accepted change is deliberately *not* applied: a gap in the recorded
    history legitimately produces a large step, and rejecting it would silently
    drop everything after it.
    """
    hass = manager.hass
    entity_id = source_entity or manager.source_entity
    if not entity_id:
        raise HomeAssistantError(
            translation_domain=DOMAIN, translation_key="no_source_entity"
        )

    days = max(1, min(days, MAX_IMPORT_DAYS))
    end = dt_util.utcnow()
    start = end - timedelta(days=days)

    try:
        from homeassistant.components.recorder import get_instance

        instance = get_instance(hass)
    except (ImportError, KeyError) as err:
        raise HomeAssistantError(
            translation_domain=DOMAIN, translation_key="no_recorder"
        ) from err

    statistics = await instance.async_add_executor_job(
        _collect_statistics, hass, entity_id, start, end
    )
    states = await instance.async_add_executor_job(
        _collect_states, hass, entity_id, start, end
    )

    # Merge on whole minutes; a recorded state always beats a daily average.
    merged: dict[int, tuple[datetime, float]] = {}
    for moment, value in statistics:
        merged[int(moment.timestamp() // 60)] = (moment, value)
    for moment, value in states:
        merged[int(moment.timestamp() // 60)] = (moment, value)

    low, high = manager.min_weight, manager.max_weight
    candidates = sorted(
        (
            (moment, round(value, 2))
            for moment, value in merged.values()
            if low <= value <= high
        ),
        key=lambda item: item[0],
    )
    skipped = len(merged) - len(candidates)

    imported = manager.merge_measurements(
        candidates, source=SOURCE_IMPORT, replace=replace
    )
    await manager.async_refresh(fire_events=False)

    written = _write_statistics(manager, candidates) if write_statistics else 0

    report = {
        "source_entity": entity_id,
        "from_states": len(states),
        "from_statistics": len(statistics),
        "skipped_implausible": skipped,
        "imported": imported,
        "total": len(manager.measurements),
        "statistics_written": written,
    }
    _LOGGER.info("%s: imported history from %s: %s", manager.entry.title, entity_id, report)
    return report


__all__ = ["async_import_history", "MAX_IMPORT_DAYS", "MAX_MEASUREMENTS", "KEY_WEIGHT"]
