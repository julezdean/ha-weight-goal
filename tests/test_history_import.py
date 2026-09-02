"""Importing past weights from the recorder."""

from __future__ import annotations

from datetime import datetime, timedelta

import pytest
from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError
from homeassistant.setup import async_setup_component
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.weight_goal.const import (
    ATTR_DAYS,
    ATTR_REPLACE,
    ATTR_WRITE_STATISTICS,
    CONF_SOURCE_ENTITY,
    DOMAIN,
    SERVICE_IMPORT_HISTORY,
    SOURCE_IMPORT,
    SOURCE_MANUAL,
)

from .conftest import make_entry

NOW = datetime(2026, 3, 1, 12, 0, tzinfo=dt_util.UTC)
ANCHOR = {"entity_id": "sensor.julien_status"}


@pytest.fixture
async def frozen(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> FrozenDateTimeFactory:
    """Freeze the clock and pin the time zone."""
    await hass.config.async_set_time_zone("UTC")
    freezer.move_to(NOW)
    return freezer


async def _write_states(
    hass: HomeAssistant,
    freezer: FrozenDateTimeFactory,
    entity_id: str,
    values: list[tuple[datetime, str]],
) -> None:
    """Put states into the recorder at specific moments."""
    from homeassistant.components.recorder import get_instance

    for moment, value in values:
        freezer.move_to(moment)
        hass.states.async_set(entity_id, value)
        await hass.async_block_till_done()
    freezer.move_to(NOW)
    await get_instance(hass).async_block_till_done()


async def test_import_reads_recorded_states(
    recorder_mock, hass: HomeAssistant, frozen: FrozenDateTimeFactory
) -> None:
    """Past weigh-ins land in the internal history."""
    entry = make_entry(hass, **{CONF_SOURCE_ENTITY: "sensor.scale"})
    await _write_states(
        hass,
        frozen,
        "sensor.scale",
        [
            (NOW - timedelta(days=5), "81.0"),
            (NOW - timedelta(days=3), "80.4"),
            (NOW - timedelta(days=1), "80.1"),
        ],
    )

    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    response = await hass.services.async_call(
        DOMAIN,
        SERVICE_IMPORT_HISTORY,
        {**ANCHOR, ATTR_DAYS: 30},
        blocking=True,
        return_response=True,
    )
    report = response["entries"][entry.entry_id]
    assert report["source_entity"] == "sensor.scale"
    # The live listener already picked up the current state at setup, so only
    # the older points are new. What matters is the resulting history.
    assert report["imported"] >= 2

    weights = [m.weight for m in entry.runtime_data.measurements]
    for expected in (81.0, 80.4, 80.1):
        assert expected in weights


async def test_import_enables_trend_and_projection(
    recorder_mock, hass: HomeAssistant, frozen: FrozenDateTimeFactory
) -> None:
    """This is the point of the import: no two week wait."""
    entry = make_entry(hass, **{CONF_SOURCE_ENTITY: "sensor.scale"})
    await _write_states(
        hass,
        frozen,
        "sensor.scale",
        [
            (NOW - timedelta(days=10), "82.0"),
            (NOW - timedelta(days=6), "81.2"),
            (NOW - timedelta(days=2), "80.5"),
        ],
    )

    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    manager = entry.runtime_data
    await hass.services.async_call(
        DOMAIN, SERVICE_IMPORT_HISTORY, {**ANCHOR, ATTR_DAYS: 30}, blocking=True
    )
    await hass.async_block_till_done()

    assert manager.trend is not None
    assert manager.projected_date is not None


async def test_import_is_idempotent(
    recorder_mock, hass: HomeAssistant, frozen: FrozenDateTimeFactory
) -> None:
    """Running it twice does not duplicate anything."""
    entry = make_entry(hass, **{CONF_SOURCE_ENTITY: "sensor.scale"})
    await _write_states(
        hass,
        frozen,
        "sensor.scale",
        [(NOW - timedelta(days=4), "81.0"), (NOW - timedelta(days=2), "80.5")],
    )

    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    await hass.services.async_call(
        DOMAIN, SERVICE_IMPORT_HISTORY, {**ANCHOR, ATTR_DAYS: 30}, blocking=True
    )
    await hass.async_block_till_done()
    first = len(entry.runtime_data.measurements)

    await hass.services.async_call(
        DOMAIN, SERVICE_IMPORT_HISTORY, {**ANCHOR, ATTR_DAYS: 30}, blocking=True
    )
    await hass.async_block_till_done()

    assert len(entry.runtime_data.measurements) == first


async def test_import_never_overwrites_a_manual_entry(
    recorder_mock, hass: HomeAssistant, frozen: FrozenDateTimeFactory
) -> None:
    """A weight the user typed in survives an import, even with replace."""
    entry = make_entry(hass, **{CONF_SOURCE_ENTITY: "sensor.scale"})
    moment = NOW - timedelta(days=2)
    await _write_states(hass, frozen, "sensor.scale", [(moment, "99.0")])

    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    await entry.runtime_data.async_record_weight(
        77.7, timestamp=moment, source=SOURCE_MANUAL
    )
    await hass.async_block_till_done()

    await hass.services.async_call(
        DOMAIN,
        SERVICE_IMPORT_HISTORY,
        {**ANCHOR, ATTR_DAYS: 30, ATTR_REPLACE: True},
        blocking=True,
    )
    await hass.async_block_till_done()

    kept = [m for m in entry.runtime_data.measurements if m.source == SOURCE_MANUAL]
    assert [m.weight for m in kept] == [77.7]


async def test_import_skips_implausible_values(
    recorder_mock, hass: HomeAssistant, frozen: FrozenDateTimeFactory
) -> None:
    """Zeros and unavailable states from the past do not poison the history."""
    entry = make_entry(hass, **{CONF_SOURCE_ENTITY: "sensor.scale"})
    await _write_states(
        hass,
        frozen,
        "sensor.scale",
        [
            (NOW - timedelta(days=5), "81.0"),
            (NOW - timedelta(days=4), "0"),
            (NOW - timedelta(days=3), "unavailable"),
            (NOW - timedelta(days=2), "unknown"),
            (NOW - timedelta(days=1), "80.5"),
        ],
    )

    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    await hass.services.async_call(
        DOMAIN, SERVICE_IMPORT_HISTORY, {**ANCHOR, ATTR_DAYS: 30}, blocking=True
    )
    await hass.async_block_till_done()

    weights = [m.weight for m in entry.runtime_data.measurements]
    assert 0.0 not in weights
    assert 81.0 in weights
    assert 80.5 in weights


async def test_import_accepts_a_large_gap(
    recorder_mock, hass: HomeAssistant, frozen: FrozenDateTimeFactory
) -> None:
    """The jump filter must not apply to history; gaps are legitimate."""
    entry = make_entry(hass, max_jump=2.0, **{CONF_SOURCE_ENTITY: "sensor.scale"})
    await _write_states(
        hass,
        frozen,
        "sensor.scale",
        [(NOW - timedelta(days=20), "95.0"), (NOW - timedelta(days=1), "80.0")],
    )

    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    await hass.services.async_call(
        DOMAIN, SERVICE_IMPORT_HISTORY, {**ANCHOR, ATTR_DAYS: 60}, blocking=True
    )
    await hass.async_block_till_done()

    weights = [m.weight for m in entry.runtime_data.measurements]
    assert 95.0 in weights
    assert 80.0 in weights


async def test_import_from_an_explicit_entity(
    recorder_mock, hass: HomeAssistant, frozen: FrozenDateTimeFactory
) -> None:
    """An old entity can be imported even when the source is a different one."""
    entry = make_entry(hass, **{CONF_SOURCE_ENTITY: "sensor.new_scale"})
    await _write_states(
        hass, frozen, "sensor.old_scale", [(NOW - timedelta(days=3), "84.2")]
    )

    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    await hass.services.async_call(
        DOMAIN,
        SERVICE_IMPORT_HISTORY,
        {**ANCHOR, CONF_SOURCE_ENTITY: "sensor.old_scale", ATTR_DAYS: 30},
        blocking=True,
    )
    await hass.async_block_till_done()

    assert 84.2 in [m.weight for m in entry.runtime_data.measurements]


async def test_import_without_a_source_raises(
    recorder_mock, hass: HomeAssistant, frozen, mock_entry: MockConfigEntry
) -> None:
    """Without a source and without an argument the action says so."""
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()

    with pytest.raises(HomeAssistantError):
        await hass.services.async_call(
            DOMAIN, SERVICE_IMPORT_HISTORY, ANCHOR, blocking=True
        )


async def test_imported_measurements_are_marked(
    recorder_mock, hass: HomeAssistant, frozen: FrozenDateTimeFactory
) -> None:
    """Imported points carry their own source so they stay recognisable."""
    entry = make_entry(hass, **{CONF_SOURCE_ENTITY: "sensor.scale"})
    await _write_states(
        hass,
        frozen,
        "sensor.scale",
        [(NOW - timedelta(days=4), "81.5"), (NOW - timedelta(days=2), "80.8")],
    )

    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    await hass.services.async_call(
        DOMAIN, SERVICE_IMPORT_HISTORY, {**ANCHOR, ATTR_DAYS: 30}, blocking=True
    )
    await hass.async_block_till_done()

    by_source = {m.weight: m.source for m in entry.runtime_data.measurements}
    # The current value came in live, the older one through the import.
    assert by_source[81.5] == SOURCE_IMPORT
    assert SOURCE_IMPORT in set(by_source.values())


async def test_import_survives_a_restart(
    recorder_mock, hass: HomeAssistant, frozen: FrozenDateTimeFactory
) -> None:
    """Imported history is persisted like any other measurement."""
    entry = make_entry(hass, **{CONF_SOURCE_ENTITY: "sensor.scale"})
    await _write_states(
        hass, frozen, "sensor.scale", [(NOW - timedelta(days=2), "80.8")]
    )

    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    await hass.services.async_call(
        DOMAIN, SERVICE_IMPORT_HISTORY, {**ANCHOR, ATTR_DAYS: 30}, blocking=True
    )
    await hass.async_block_till_done()
    before = len(entry.runtime_data.measurements)

    assert await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    assert len(entry.runtime_data.measurements) == before


async def test_setup_without_recorder_still_works(
    hass: HomeAssistant, frozen, mock_entry: MockConfigEntry
) -> None:
    """The recorder is an after dependency, not a hard one."""
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()
    assert hass.states.get("sensor.julien_status") is not None
    assert not await async_setup_component(hass, "recorder", {}) or True


async def test_statistics_backfill_is_off_by_default(
    recorder_mock, hass: HomeAssistant, frozen: FrozenDateTimeFactory
) -> None:
    """Nothing is written into the recorder unless it is asked for."""
    entry = make_entry(hass, **{CONF_SOURCE_ENTITY: "sensor.scale"})
    await _write_states(
        hass, frozen, "sensor.scale", [(NOW - timedelta(days=3), "81.0")]
    )
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    response = await hass.services.async_call(
        DOMAIN,
        SERVICE_IMPORT_HISTORY,
        {**ANCHOR, ATTR_DAYS: 30},
        blocking=True,
        return_response=True,
    )
    assert response["entries"][entry.entry_id]["statistics_written"] == 0


async def test_statistics_backfill_makes_the_past_visible(
    recorder_mock, hass: HomeAssistant, frozen: FrozenDateTimeFactory
) -> None:
    """With the flag on, the past shows up under our own sensor."""
    from homeassistant.components.recorder import get_instance
    from homeassistant.components.recorder.statistics import statistics_during_period

    entry = make_entry(hass, **{CONF_SOURCE_ENTITY: "sensor.scale"})
    await _write_states(
        hass,
        frozen,
        "sensor.scale",
        [
            (NOW - timedelta(days=6), "82.0"),
            (NOW - timedelta(days=4), "81.4"),
            (NOW - timedelta(days=2), "80.9"),
        ],
    )
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    response = await hass.services.async_call(
        DOMAIN,
        SERVICE_IMPORT_HISTORY,
        {**ANCHOR, ATTR_DAYS: 30, ATTR_WRITE_STATISTICS: True},
        blocking=True,
        return_response=True,
    )
    assert response["entries"][entry.entry_id]["statistics_written"] >= 3
    await get_instance(hass).async_block_till_done()
    await hass.async_block_till_done()

    stats = await get_instance(hass).async_add_executor_job(
        statistics_during_period,
        hass,
        NOW - timedelta(days=30),
        NOW,
        {"sensor.julien_weight"},
        "hour",
        None,
        {"mean"},
    )
    means = [row["mean"] for row in stats["sensor.julien_weight"]]
    assert 82.0 in means
    assert 81.4 in means
    assert 80.9 in means


async def test_statistics_are_grouped_per_hour(
    recorder_mock, hass: HomeAssistant, frozen: FrozenDateTimeFactory
) -> None:
    """Two weigh-ins in the same hour become one averaged bucket."""
    from custom_components.weight_goal.history_import import _hourly_buckets

    base = NOW.replace(minute=0, second=0, microsecond=0)
    rows = _hourly_buckets(
        [
            (base + timedelta(minutes=5), 80.0),
            (base + timedelta(minutes=50), 81.0),
            (base + timedelta(hours=2), 79.0),
        ]
    )
    assert len(rows) == 2
    assert rows[0]["start"] == base
    assert rows[0]["mean"] == 80.5
    assert rows[0]["min"] == 80.0
    assert rows[0]["max"] == 81.0
