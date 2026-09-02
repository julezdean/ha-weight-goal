"""Date entities for Road to Weight Goal."""

from __future__ import annotations

from datetime import date

from homeassistant.components.date import ENTITY_ID_FORMAT, DateEntity
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from . import WeightGoalConfigEntry
from .const import CONF_END_DATE, CONF_START_DATE, KEY_END_DATE, KEY_START_DATE
from .entity import WeightGoalEntity
from .manager import WeightGoalManager


async def async_setup_entry(
    hass: HomeAssistant,
    entry: WeightGoalConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Set up the date entities."""
    manager = entry.runtime_data
    async_add_entities([StartDate(manager), EndDate(manager)])


class WeightGoalDate(WeightGoalEntity, DateEntity):
    """Base class for the date entities."""

    entity_id_format = ENTITY_ID_FORMAT


class StartDate(WeightGoalDate):
    """First day of the goal."""

    def __init__(self, manager: WeightGoalManager) -> None:
        """Initialise."""
        super().__init__(manager, KEY_START_DATE)

    @property
    def native_value(self) -> date | None:
        """Return the start date."""
        return self._manager.start_date

    async def async_set_value(self, value: date) -> None:
        """Store a new start date."""
        await self._manager.async_set_goal(**{CONF_START_DATE: value.isoformat()})


class EndDate(WeightGoalDate):
    """Last day of the goal; it counts towards the goal in full."""

    def __init__(self, manager: WeightGoalManager) -> None:
        """Initialise."""
        super().__init__(manager, KEY_END_DATE)

    @property
    def native_value(self) -> date | None:
        """Return the end date."""
        return self._manager.end_date

    async def async_set_value(self, value: date) -> None:
        """Store a new end date."""
        await self._manager.async_set_goal(**{CONF_END_DATE: value.isoformat()})
