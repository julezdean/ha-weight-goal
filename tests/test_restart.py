"""Restart behaviour: nothing that matters may be lost."""

from __future__ import annotations

from datetime import datetime, timedelta

import pytest
from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.weight_goal.const import (
    CONF_END_DATE,
    CONF_OVERDUE_DAYS,
    DOMAIN,
    EVENT_GOAL_ENDED,
    EVENT_MEASUREMENT_OVERDUE,
    STATUS_BEHIND,
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


async def _restart(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    """Unload and set the entry up again, as a Home Assistant restart would."""
    assert await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()


async def test_measurements_survive_a_restart(
    hass: HomeAssistant, frozen, mock_entry: MockConfigEntry, hass_storage
) -> None:
    """The internal history is reloaded from storage."""
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()

    await mock_entry.runtime_data.async_record_weight(80.0)
    await mock_entry.runtime_data.async_record_weight(81.2)
    await hass.async_block_till_done()

    assert f"{DOMAIN}.{mock_entry.entry_id}" in hass_storage

    await _restart(hass, mock_entry)

    manager = mock_entry.runtime_data
    assert [m.weight for m in manager.measurements] == [80.0, 81.2]
    assert manager.current_weight == 81.2
    assert hass.states.get("sensor.julien_weight").state == "81.2"


async def test_status_survives_a_restart(
    hass: HomeAssistant, frozen, mock_entry: MockConfigEntry
) -> None:
    """The state machine picks up where it left off, without re-firing events."""
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()
    await mock_entry.runtime_data.async_record_weight(82.0)
    await hass.async_block_till_done()
    assert hass.states.get("sensor.julien_status").state == STATUS_BEHIND

    events = []
    hass.bus.async_listen(EVENT_GOAL_ENDED, events.append)

    await _restart(hass, mock_entry)

    assert hass.states.get("sensor.julien_status").state == STATUS_BEHIND
    assert events == []


async def test_manual_weight_survives_a_restart(
    hass: HomeAssistant, frozen, mock_entry: MockConfigEntry
) -> None:
    """The manual entry field keeps its last value."""
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()

    await hass.services.async_call(
        "number",
        "set_value",
        {"entity_id": "number.julien_manual_weight", "value": 77.7},
        blocking=True,
    )
    await hass.async_block_till_done()

    await _restart(hass, mock_entry)
    assert hass.states.get("number.julien_manual_weight").state == "77.7"


async def test_goal_end_missed_inside_the_grace_period_is_replayed(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory
) -> None:
    """A goal that ended during a short outage still fires its event."""
    entry = make_entry(hass, **{CONF_END_DATE: "2026-03-10"})
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    await entry.runtime_data.async_record_weight(79.0)
    await hass.async_block_till_done()

    assert await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()

    events = []
    hass.bus.async_listen(EVENT_GOAL_ENDED, events.append)

    # Six hours after the missed moment, well inside the 24 hour grace period.
    frozen.move_to(datetime(2026, 3, 11, 6, 0, tzinfo=dt_util.UTC))
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    assert len(events) == 1


async def test_goal_end_missed_beyond_the_grace_period_is_dropped(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory
) -> None:
    """A long outage does not produce a burst of stale notifications."""
    entry = make_entry(hass, **{CONF_END_DATE: "2026-03-10"})
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    assert await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()

    events = []
    hass.bus.async_listen(EVENT_GOAL_ENDED, events.append)

    frozen.move_to(datetime(2026, 3, 20, 6, 0, tzinfo=dt_util.UTC))
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    assert events == []
    assert hass.states.get("sensor.julien_status").state == "ended"


async def test_overdue_reminder_is_caught_up(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory
) -> None:
    """A reminder that came due during a short outage still fires."""
    entry = make_entry(hass, **{CONF_OVERDUE_DAYS: 3})
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    await entry.runtime_data.async_record_weight(80.0)
    await hass.async_block_till_done()

    assert await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()

    events = []
    hass.bus.async_listen(EVENT_MEASUREMENT_OVERDUE, events.append)

    frozen.move_to(START + timedelta(days=3, hours=2))
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    assert len(events) == 1


async def test_overdue_zero_disables_the_reminder(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory
) -> None:
    """Zero switches the reminder off, timer and event alike."""
    entry = make_entry(hass, **{CONF_OVERDUE_DAYS: 0})
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    await entry.runtime_data.async_record_weight(80.0)
    await hass.async_block_till_done()

    assert await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()

    events = []
    hass.bus.async_listen(EVENT_MEASUREMENT_OVERDUE, events.append)

    frozen.move_to(START + timedelta(days=30))
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    assert events == []


async def test_options_change_keeps_the_entry_loaded(
    hass: HomeAssistant, frozen, mock_entry: MockConfigEntry
) -> None:
    """Applying options must not reload the entry and tear down the timers."""
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()

    manager_before = mock_entry.runtime_data
    await manager_before.async_record_weight(80.0)
    await hass.async_block_till_done()

    hass.config_entries.async_update_entry(
        mock_entry, options={**mock_entry.options, "tolerance": 2.0}
    )
    await hass.async_block_till_done()

    assert mock_entry.runtime_data is manager_before
    assert manager_before.tolerance == 2.0
    assert manager_before.current_weight == 80.0
