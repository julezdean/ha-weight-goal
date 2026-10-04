"""How long the internal history keeps readings, and which ones it keeps."""

from __future__ import annotations

import logging
from datetime import datetime, timedelta

import pytest
from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.weight_goal import manager as manager_module
from custom_components.weight_goal.const import (
    CONF_SOURCE_ENTITY,
    DOMAIN,
    RETENTION_DAYS,
    SOURCE_MANUAL,
    SOURCE_SENSOR,
    STORAGE_VERSION,
)

from .conftest import make_entry

START = datetime(2026, 3, 1, 12, 0, tzinfo=dt_util.UTC)


@pytest.fixture
async def frozen(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> FrozenDateTimeFactory:
    """Freeze the clock and pin the time zone."""
    await hass.config.async_set_time_zone("UTC")
    freezer.move_to(START)
    return freezer


async def _setup(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()


async def _restart(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    """Unload and set the entry up again, as a Home Assistant restart would."""
    assert await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()
    await _setup(hass, entry)


def _scale(hass: HomeAssistant, value: str) -> None:
    hass.states.async_set("sensor.scale", value)


def _weights(entry: MockConfigEntry) -> list[tuple[float, str]]:
    return [(m.weight, m.source) for m in entry.runtime_data.measurements]


async def test_a_sensor_back_from_unavailable_is_not_a_new_reading(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory, source_entry: MockConfigEntry
) -> None:
    """The same value after unavailable is the sensor reconnecting, not a weigh-in."""
    _scale(hass, "79.2")
    await _setup(hass, source_entry)

    for _ in range(3):
        frozen.tick(timedelta(hours=2))
        _scale(hass, "unavailable")
        await hass.async_block_till_done()
        frozen.tick(timedelta(minutes=5))
        _scale(hass, "79.2")
        await hass.async_block_till_done()

    assert _weights(source_entry) == [(79.2, SOURCE_SENSOR)]


async def test_a_changed_value_is_recorded_even_if_seen_before(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory, source_entry: MockConfigEntry
) -> None:
    """Only the immediate repeat is dropped; going back to an older weight counts."""
    _scale(hass, "79.2")
    await _setup(hass, source_entry)
    for value in ("79.0", "79.2"):
        frozen.tick(timedelta(days=1))
        _scale(hass, value)
        await hass.async_block_till_done()

    assert [w for w, _ in _weights(source_entry)] == [79.2, 79.0, 79.2]


async def test_a_restart_does_not_record_the_sensor_again(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory, source_entry: MockConfigEntry
) -> None:
    """Start up reads the current state, which is the reading already stored."""
    _scale(hass, "79.2")
    await _setup(hass, source_entry)

    assert await hass.config_entries.async_unload(source_entry.entry_id)
    await hass.async_block_till_done()
    frozen.tick(timedelta(hours=3))
    # A real restart gives the state a new last_changed.
    _scale(hass, "unavailable")
    _scale(hass, "79.2")
    await _setup(hass, source_entry)

    assert _weights(source_entry) == [(79.2, SOURCE_SENSOR)]


async def test_an_ignored_sensor_reading_stays_gone_after_a_restart(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory, source_entry: MockConfigEntry
) -> None:
    """The sensor still shows the value, but it was already consumed once."""
    _scale(hass, "79.2")
    await _setup(hass, source_entry)
    frozen.tick(timedelta(days=1))
    _scale(hass, "85.0")
    await hass.async_block_till_done()
    assert await source_entry.runtime_data.async_ignore_last_measurement()

    await _restart(hass, source_entry)

    assert _weights(source_entry) == [(79.2, SOURCE_SENSOR)]


async def test_manual_readings_may_repeat(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory, mock_entry: MockConfigEntry
) -> None:
    """Typing the same weight on two days is two weigh-ins."""
    await _setup(hass, mock_entry)
    await mock_entry.runtime_data.async_record_weight(80.0)
    frozen.tick(timedelta(days=1))
    await mock_entry.runtime_data.async_record_weight(80.0)

    assert _weights(mock_entry) == [(80.0, SOURCE_MANUAL), (80.0, SOURCE_MANUAL)]


def _stored(*rows: tuple[datetime, float, str], **extra) -> dict:
    return {
        "version": STORAGE_VERSION,
        "minor_version": 1,
        "key": f"{DOMAIN}.testentry",
        "data": {
            "measurements": [
                {"timestamp": t.isoformat(), "weight": w, "source": s}
                for t, w, s in rows
            ],
            **extra,
        },
    }


async def test_repeats_stored_by_an_older_version_are_removed_on_load(
    hass: HomeAssistant, frozen, hass_storage
) -> None:
    """The echoes already in the history go; manual readings in between stay."""
    hour = timedelta(hours=1)
    hass_storage[f"{DOMAIN}.testentry"] = _stored(
        (START - 6 * hour, 80.0, SOURCE_SENSOR),
        (START - 5 * hour, 80.0, SOURCE_SENSOR),
        (START - 4 * hour, 80.0, SOURCE_MANUAL),
        (START - 3 * hour, 80.0, SOURCE_SENSOR),
        (START - 2 * hour, 79.5, SOURCE_SENSOR),
        (START - 1 * hour, 79.5, SOURCE_SENSOR),
    )
    entry = make_entry(hass, **{CONF_SOURCE_ENTITY: "sensor.scale"})
    # Still showing the last value, as after an update and restart.
    _scale(hass, "79.5")
    await _setup(hass, entry)

    assert _weights(entry) == [
        (80.0, SOURCE_SENSOR),
        (80.0, SOURCE_MANUAL),
        (79.5, SOURCE_SENSOR),
    ]
    stored = hass_storage[f"{DOMAIN}.testentry"]["data"]
    assert len(stored["measurements"]) == 3
    assert stored["last_source_entity"] == "sensor.scale"
    assert stored["last_source_weight"] == 79.5


async def test_more_than_four_hundred_readings_are_kept(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory, mock_entry: MockConfigEntry
) -> None:
    """The old cap of 400 is gone; a year of daily readings fits."""
    await _setup(hass, mock_entry)
    manager = mock_entry.runtime_data
    first = START - timedelta(days=500)
    points = [(first + timedelta(days=i), 80.0 - i * 0.001) for i in range(500)]
    assert manager.merge_measurements(points) == 500

    assert len(manager.measurements) == 500
    assert manager.measurements[0].timestamp == first


async def test_readings_older_than_the_retention_are_dropped(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory, mock_entry: MockConfigEntry
) -> None:
    """Age, not count, decides what goes."""
    await _setup(hass, mock_entry)
    manager = mock_entry.runtime_data
    keep = START - timedelta(days=RETENTION_DAYS - 1)
    drop = START - timedelta(days=RETENTION_DAYS + 1)
    manager.merge_measurements([(drop, 81.0), (keep, 80.5)])
    assert [m.timestamp for m in manager.measurements] == [keep]

    # Time passing moves the cut-off with it on the next reading.
    frozen.tick(timedelta(days=2))
    await manager.async_record_weight(80.0)
    assert [m.weight for m in manager.measurements] == [80.0]


async def test_the_ceiling_drops_the_oldest_and_logs_once(
    hass: HomeAssistant,
    frozen,
    mock_entry: MockConfigEntry,
    monkeypatch: pytest.MonkeyPatch,
    caplog: pytest.LogCaptureFixture,
) -> None:
    """A source reporting far too often cannot grow the storage without bound."""
    monkeypatch.setattr(manager_module, "MAX_MEASUREMENTS", 10)
    await _setup(hass, mock_entry)
    manager = mock_entry.runtime_data
    points = [(START - timedelta(minutes=i), 80.0) for i in range(15, 0, -1)]

    with caplog.at_level(logging.WARNING):
        manager.merge_measurements(points[:12])
        manager.merge_measurements(points)

    assert len(manager.measurements) == 10
    assert manager.measurements[0].timestamp == points[5][0]
    assert caplog.text.count("dropping the oldest") == 1
