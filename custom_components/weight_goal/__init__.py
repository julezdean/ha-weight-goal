"""The Road to Weight Goal integration."""

from __future__ import annotations

import logging
from types import MappingProxyType

from homeassistant.config_entries import ConfigEntry, ConfigSubentry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv, entity_registry as er
from homeassistant.helpers.typing import ConfigType

from .const import (
    CONF_ACTIVE_GOAL,
    CONF_END_DATE,
    CONF_GOAL_MODE,
    CONF_START_DATE,
    CONF_START_WEIGHT,
    CONF_TARGET_WEIGHT,
    DEFAULT_GOAL_MODE,
    DOMAIN,
    GOAL_KEYS,
    SUBENTRY_GOAL,
)
from .helpers import normalise_goal
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
    Platform.SELECT,
    Platform.SENSOR,
]

type WeightGoalConfigEntry = ConfigEntry[WeightGoalManager]

#: Buttons of 0.11.0-beta.1 and earlier that moved the start of the goal to
#: today. They rewrote the plan of the days before, which is what the goal list
#: exists to prevent; a new goal is added instead.
_REMOVED_BUTTONS = ("start_today", "confirm_start_today")


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Register the services and the cards, independent of any config entry."""
    async_register_services(hass)
    await async_register_frontend(hass)
    return True


async def async_migrate_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Move the one goal of version 1 into the goal list of version 2.

    Version 1 kept a single goal in the options. It becomes the first goal of
    the list, named after its period, and stays active, so every entity reads
    what it read before. An incomplete goal is carried over as well: dropping
    values someone typed in is worse than a goal that still needs its end date.
    """
    if entry.version > 2:
        return False
    if entry.version == 1:
        options = dict(entry.options)
        goal = {key: options.pop(key) for key in GOAL_KEYS if key in options}
        goal.setdefault(CONF_GOAL_MODE, DEFAULT_GOAL_MODE)
        if any(key in goal for key in (CONF_START_WEIGHT, CONF_TARGET_WEIGHT)):
            subentry = ConfigSubentry(
                data=MappingProxyType(normalise_goal(goal)),
                subentry_type=SUBENTRY_GOAL,
                title=_period_title(goal),
                unique_id=None,
            )
            hass.config_entries.async_add_subentry(entry, subentry)
            options[CONF_ACTIVE_GOAL] = subentry.subentry_id
        hass.config_entries.async_update_entry(entry, options=options, version=2)
        _LOGGER.debug("%s: migrated to version 2", entry.title)
    return True


def _period_title(goal: dict) -> str:
    """Name for a migrated goal; it can be renamed like any other."""
    start = goal.get(CONF_START_DATE)
    end = goal.get(CONF_END_DATE)
    if start and end:
        return f"{start} – {end}"
    return start or end or "Goal"


async def async_setup_entry(hass: HomeAssistant, entry: WeightGoalConfigEntry) -> bool:
    """Set up a goal from a config entry."""
    _remove_retired_entities(hass, entry)
    manager = WeightGoalManager(hass, entry)
    await manager.async_setup()
    entry.runtime_data = manager

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    entry.async_on_unload(entry.add_update_listener(_async_options_updated))
    return True


def _remove_retired_entities(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Drop entities this version no longer provides.

    Left in the registry they would linger as "no longer provided" on the
    device page, with nothing to say what replaced them.
    """
    registry = er.async_get(hass)
    for key in _REMOVED_BUTTONS:
        entity_id = registry.async_get_entity_id(
            Platform.BUTTON, DOMAIN, f"{entry.entry_id}_{key}"
        )
        if entity_id is not None:
            registry.async_remove(entity_id)


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
