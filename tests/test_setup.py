"""Smoke test: does the entry set up at all?"""

from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry


async def test_setup(hass: HomeAssistant, mock_entry: MockConfigEntry) -> None:
    """The entry sets up and creates entities."""
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()
    ids = sorted(s.entity_id for s in hass.states.async_all())
    for entity_id in ids:
        print(entity_id, "=", hass.states.get(entity_id).state)
    assert ids
