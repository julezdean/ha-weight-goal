"""Start today is a two step action with an expiry."""

from __future__ import annotations

from datetime import datetime, timedelta

import pytest
from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_fire_time_changed,
)

from custom_components.weight_goal.const import (
    ARM_TIMEOUT_SECONDS,
    CONF_END_DATE,
    CONF_RATE_PER_WEEK,
    CONF_START_DATE,
    CONF_START_WEIGHT,
)

NOW = datetime(2026, 3, 1, 12, 0, tzinfo=dt_util.UTC)


@pytest.fixture
async def frozen(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> FrozenDateTimeFactory:
    """Freeze the clock and pin the time zone."""
    await hass.config.async_set_time_zone("UTC")
    freezer.move_to(NOW)
    return freezer


async def _press(hass: HomeAssistant, entity_id: str) -> None:
    await hass.services.async_call(
        "button", "press", {"entity_id": entity_id}, blocking=True
    )


async def test_first_press_changes_nothing(
    hass: HomeAssistant, frozen, mock_entry: MockConfigEntry
) -> None:
    """A stray tap must not move the start of the goal."""
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()
    await mock_entry.runtime_data.async_record_weight(78.3)
    await hass.async_block_till_done()

    await _press(hass, "button.julien_start_today")
    await hass.async_block_till_done()

    assert mock_entry.options[CONF_START_WEIGHT] == 80.0
    assert mock_entry.options[CONF_START_DATE] == "2026-03-01"


async def test_confirm_applies_the_change(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory, mock_entry: MockConfigEntry
) -> None:
    """The second press does the work, and leaves the end date alone."""
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()
    await mock_entry.runtime_data.async_record_weight(78.3)
    await hass.async_block_till_done()

    frozen.move_to(datetime(2026, 3, 15, 9, 0, tzinfo=dt_util.UTC))
    await _press(hass, "button.julien_start_today")
    await hass.async_block_till_done()
    await _press(hass, "button.julien_confirm_start_today")
    await hass.async_block_till_done()

    assert mock_entry.options[CONF_START_WEIGHT] == 78.3
    assert mock_entry.options[CONF_START_DATE] == "2026-03-15"
    assert mock_entry.options[CONF_END_DATE] == "2026-05-09"
    assert mock_entry.options[CONF_RATE_PER_WEEK] == pytest.approx(-0.4125, abs=0.0001)


async def test_confirm_button_is_unavailable_until_armed(
    hass: HomeAssistant, frozen, mock_entry: MockConfigEntry
) -> None:
    """Nothing staged, nothing to confirm."""
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()
    assert (
        hass.states.get("button.julien_confirm_start_today").state == "unavailable"
    )

    await _press(hass, "button.julien_start_today")
    await hass.async_block_till_done()
    assert (
        hass.states.get("button.julien_confirm_start_today").state != "unavailable"
    )


async def test_the_pending_change_expires(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory, mock_entry: MockConfigEntry
) -> None:
    """A confirmation left alone goes away instead of waiting forever."""
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()

    await _press(hass, "button.julien_start_today")
    await hass.async_block_till_done()
    assert mock_entry.runtime_data.start_today_armed is True

    when = NOW + timedelta(seconds=ARM_TIMEOUT_SECONDS + 5)
    frozen.move_to(when)
    async_fire_time_changed(hass, when)
    await hass.async_block_till_done()

    assert mock_entry.runtime_data.start_today_armed is False
    assert (
        hass.states.get("button.julien_confirm_start_today").state == "unavailable"
    )
    assert mock_entry.options[CONF_START_DATE] == "2026-03-01"


async def test_preview_shows_what_would_change(
    hass: HomeAssistant, frozen, mock_entry: MockConfigEntry
) -> None:
    """The confirm button says what it is about to do."""
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()
    await mock_entry.runtime_data.async_record_weight(78.3)
    await hass.async_block_till_done()

    await _press(hass, "button.julien_start_today")
    await hass.async_block_till_done()

    attrs = hass.states.get("button.julien_confirm_start_today").attributes
    assert attrs["new_start_weight"] == 78.3
    assert attrs["new_start_date"] == "2026-03-01"
    assert attrs["current_start_weight"] == 80.0


async def test_confirming_twice_applies_once(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory, mock_entry: MockConfigEntry
) -> None:
    """The second confirm has nothing left to do."""
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()
    await mock_entry.runtime_data.async_record_weight(78.3)
    await hass.async_block_till_done()

    await _press(hass, "button.julien_start_today")
    await hass.async_block_till_done()
    await _press(hass, "button.julien_confirm_start_today")
    await hass.async_block_till_done()

    assert mock_entry.runtime_data.start_today_armed is False

    frozen.move_to(datetime(2026, 3, 20, 9, 0, tzinfo=dt_util.UTC))
    await _press(hass, "button.julien_confirm_start_today")
    await hass.async_block_till_done()

    # Still the date of the first confirmation.
    assert mock_entry.options[CONF_START_DATE] == "2026-03-01"


async def test_arming_does_not_survive_a_restart(
    hass: HomeAssistant, frozen, mock_entry: MockConfigEntry
) -> None:
    """A pending confirmation is deliberately transient."""
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()
    await _press(hass, "button.julien_start_today")
    await hass.async_block_till_done()

    assert await hass.config_entries.async_unload(mock_entry.entry_id)
    await hass.async_block_till_done()
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()

    assert mock_entry.runtime_data.start_today_armed is False
