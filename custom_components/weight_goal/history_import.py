"""Import past weights from the recorder into the internal history.

The internal history normally fills up as measurements arrive, which means
the trend and the projection stay unavailable for the first days after setup.
This module fills it from data Home Assistant already has.

Two sources are read and merged:

* Recorded states carry every individual weigh-in, but only as far back as the
  recorder keeps them, ten days by default.
* Long term statistics reach back much further but are aggregated, so an older
  day contributes one averaged value rather than the exact reading.

A daily mean is only kept for a day without a reading of its own, and only
when it differs from the value before it; otherwise it is a day the sensor stood
still. Recorded states are full of the sensor repeating itself after a
reconnect, and those repeats are dropped as well. Both rules are
``tidy_history`` in the manager, which also runs on every start.
"""

from __future__ import annotations

import logging
from datetime import datetime, timedelta
from typing import TYPE_CHECKING, Any

from homeassistant.const import STATE_UNAVAILABLE, STATE_UNKNOWN
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError
from homeassistant.util import dt as dt_util

from .const import (
    DOMAIN,
    KEY_WEIGHT,
    MAX_MEASUREMENTS,
    RETENTION_DAYS,
    SOURCE_IMPORT,
    SOURCE_MANUAL,
    SOURCE_STATISTICS,
)

if TYPE_CHECKING:
    from .manager import WeightGoalManager

_LOGGER = logging.getLogger(__name__)

#: Anything older would be dropped by the retention the moment it arrived.
MAX_IMPORT_DAYS = RETENTION_DAYS


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

    low, high = manager.min_weight, manager.max_weight
    zone = manager.zone
    today = dt_util.now(zone).date()
    # States keep the precision the scale reported: rounded, a state that only
    # echoes a live reading of 72.658 would arrive as 72.66 and pass as new. A
    # mean is rounded to the gram, which also turns the mean of a day the scale
    # stood still back into exactly the value it stood at.
    plausible_states = [(m, v) for m, v in states if low <= v <= high]
    plausible_means = [(m, round(v, 3)) for m, v in statistics if low <= v <= high]
    skipped = (
        len(states) + len(statistics) - len(plausible_states) - len(plausible_means)
    )
    # Today's mean covers only part of the day; today's readings come live.
    plausible_means = [
        (m, v) for m, v in plausible_means if m.astimezone(zone).date() < today
    ]

    before = {id(m) for m in manager.measurements}
    # States first: on the same minute, an existing reading or a state always
    # beats a daily mean, whatever ``replace`` says.
    manager.merge_measurements(plausible_states, source=SOURCE_IMPORT, replace=replace)
    manager.merge_measurements(plausible_means, source=SOURCE_STATISTICS)
    dropped = manager.tidy()
    history = manager.measurements
    imported = sum(1 for m in history if id(m) not in before)
    await manager.async_refresh(fire_events=False)

    written = (
        _write_statistics(
            manager,
            [
                (m.timestamp, m.weight)
                for m in history
                if m.timestamp >= start and m.source != SOURCE_MANUAL
            ],
        )
        if write_statistics
        else 0
    )

    report = {
        "source_entity": entity_id,
        "from_states": len(states),
        "from_statistics": len(statistics),
        "skipped_implausible": skipped,
        "dropped": dropped,
        "imported": imported,
        "total": len(history),
        "statistics_written": written,
    }
    _LOGGER.info("%s: imported history from %s: %s", manager.entry.title, entity_id, report)
    return report


__all__ = ["async_import_history", "MAX_IMPORT_DAYS", "MAX_MEASUREMENTS", "KEY_WEIGHT"]
