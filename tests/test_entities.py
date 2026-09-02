"""Entity creation and language independence."""

from __future__ import annotations

import pytest
from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.weight_goal.const import DOMAIN

EXPECTED = {
    "number.julien_start_weight",
    "number.julien_target_weight",
    "number.julien_rate_per_week",
    "number.julien_manual_weight",
    "button.julien_record_weight",
    "date.julien_start_date",
    "date.julien_end_date",
    "button.julien_start_today",
    "button.julien_confirm_start_today",
    "sensor.julien_weight",
    "sensor.julien_target_weight_today",
    "sensor.julien_deviation",
    "sensor.julien_trend",
    "sensor.julien_weight_progress",
    "sensor.julien_time_progress",
    "sensor.julien_remaining",
    "sensor.julien_projected_date",
    "sensor.julien_status",
    "sensor.julien_last_measurement",
}


async def test_all_entities_created(
    hass: HomeAssistant, mock_entry: MockConfigEntry
) -> None:
    """Every documented entity exists and belongs to one device."""
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()

    registry = er.async_get(hass)
    entries = er.async_entries_for_config_entry(registry, mock_entry.entry_id)
    assert {entry.entity_id for entry in entries} == EXPECTED
    assert len({entry.device_id for entry in entries}) == 1


async def test_unique_ids_are_stable(
    hass: HomeAssistant, mock_entry: MockConfigEntry
) -> None:
    """Unique ids are derived from the entry id and the internal key."""
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()

    registry = er.async_get(hass)
    entry = registry.async_get("sensor.julien_deviation")
    assert entry is not None
    assert entry.unique_id == f"{mock_entry.entry_id}_deviation"
    assert entry.translation_key == "deviation"
    assert entry.platform == DOMAIN


@pytest.mark.parametrize("language", ["de", "en", "nl"])
async def test_entity_ids_are_language_independent(
    hass: HomeAssistant, mock_entry: MockConfigEntry, language: str
) -> None:
    """The entity ids stay English whatever the instance language is."""
    hass.config.language = language
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()

    ids = {state.entity_id for state in hass.states.async_all()}
    assert EXPECTED <= ids


async def test_translated_name_does_not_leak_into_entity_id(
    hass: HomeAssistant, mock_entry: MockConfigEntry
) -> None:
    """German display names are used but do not shape the entity id."""
    hass.config.language = "de"
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()

    state = hass.states.get("sensor.julien_deviation")
    assert state is not None
    assert state.attributes["friendly_name"] == "Julien Abweichung"
    assert "abweichung" not in state.entity_id


async def test_second_entry_gets_its_own_entities(hass: HomeAssistant) -> None:
    """Two people live side by side without colliding."""
    from .conftest import make_entry

    first = make_entry(hass, entry_id="one", title="Julien")
    second = make_entry(hass, entry_id="two", title="Alex")

    # Setting up the first entry sets up the component, which loads every entry
    # of the domain, so the second one must not be started again.
    assert await hass.config_entries.async_setup(first.entry_id)
    await hass.async_block_till_done()
    assert second.state is ConfigEntryState.LOADED

    ids = {state.entity_id for state in hass.states.async_all()}
    assert "sensor.julien_status" in ids
    assert "sensor.alex_status" in ids
