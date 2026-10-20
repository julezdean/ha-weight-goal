"""Select entity for Road to Weight Goal: which goal is the active one."""

from __future__ import annotations

from typing import Any

from homeassistant.components.select import ENTITY_ID_FORMAT, SelectEntity
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from . import WeightGoalConfigEntry
from .const import ACTIVE_GOAL_NONE, DOMAIN, KEY_ACTIVE_GOAL
from .entity import WeightGoalEntity
from .manager import WeightGoalManager


async def async_setup_entry(
    hass: HomeAssistant,
    entry: WeightGoalConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Set up the select entity."""
    async_add_entities([ActiveGoalSelect(entry.runtime_data)])


class ActiveGoalSelect(WeightGoalEntity, SelectEntity):
    """Picks the goal the sensors, the status and the events follow.

    One entity rather than a switch per goal, so "only one goal is active" is
    a property of the entity instead of a rule switches have to keep between
    themselves.

    The goal list rides along as an attribute so a card can draw every goal
    without a service call. It is left out of the recorder: it changes with
    every edit of any goal, and its history says nothing the goals do not.
    """

    entity_id_format = ENTITY_ID_FORMAT
    _attr_icon = "mdi:flag-checkered"
    _unrecorded_attributes = frozenset({"goals"})

    def __init__(self, manager: WeightGoalManager) -> None:
        """Initialise."""
        super().__init__(manager, KEY_ACTIVE_GOAL)

    @property
    def options(self) -> list[str]:
        """No goal, then every goal by name, earliest start first."""
        return [ACTIVE_GOAL_NONE, *(goal.title for goal in self._manager.goals)]

    @property
    def current_option(self) -> str:
        """Name of the active goal."""
        goal = self._manager.active_goal
        return ACTIVE_GOAL_NONE if goal is None else goal.title

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Every goal with its values and outcome."""
        return {"goals": self._manager.goals_payload()}

    async def async_select_option(self, option: str) -> None:
        """Make the named goal active."""
        if option == ACTIVE_GOAL_NONE:
            await self._manager.async_set_active_goal(None)
            return
        for goal in self._manager.goals:
            if goal.title == option:
                await self._manager.async_set_active_goal(goal.subentry_id)
                return
        raise ServiceValidationError(
            translation_domain=DOMAIN, translation_key="unknown_goal"
        )
