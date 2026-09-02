"""The Road to Weight Goal integration."""

from __future__ import annotations

import logging

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.typing import ConfigType

from .const import DOMAIN
from .frontend import async_register_frontend
from .manager import WeightGoalManager
from .services import async_register_services

_LOGGER = logging.getLogger(__name__)

#: This integration is set up from the UI only; there is nothing to configure
#: in configuration.yaml.
CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)

PLATFORMS: list[Platform] = [
    Platform.BUTTON,
    Platform.DATE,
    Platform.NUMBER,
    Platform.SENSOR,
]

type WeightGoalConfigEntry = ConfigEntry[WeightGoalManager]


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Register the services and the cards, independent of any config entry."""
    async_register_services(hass)
    await async_register_frontend(hass)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: WeightGoalConfigEntry) -> bool:
    """Set up a goal from a config entry."""
    manager = WeightGoalManager(hass, entry)
    await manager.async_setup()
    entry.runtime_data = manager

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    entry.async_on_unload(entry.add_update_listener(_async_options_updated))
    return True


async def _async_options_updated(
    hass: HomeAssistant, entry: WeightGoalConfigEntry
) -> None:
    """Apply new options in place, without reloading the entry.

    Reloading would tear down the timers, so a goal end or an overdue reminder
    could be lost simply because a setting was touched.
    """
    await entry.runtime_data.async_options_updated()


async def async_unload_entry(hass: HomeAssistant, entry: WeightGoalConfigEntry) -> bool:
    """Unload a config entry."""
    unloaded = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unloaded:
        await entry.runtime_data.async_shutdown()
    return unloaded


async def async_remove_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Delete the persisted runtime state when the entry is removed."""
    manager = WeightGoalManager(hass, entry)
    await manager.async_remove_storage()


__all__ = ["DOMAIN", "WeightGoalConfigEntry"]
