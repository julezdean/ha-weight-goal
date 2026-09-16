"""Date entities for Road to Weight Goal."""

from __future__ import annotations

from datetime import date

from homeassistant.components.date import ENTITY_ID_FORMAT, DateEntity
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from . import WeightGoalConfigEntry
from .const import (
    CONF_END_DATE,
    CONF_START_DATE,
    DOMAIN,
    KEY_END_DATE,
    KEY_MANUAL_DATE,
    KEY_START_DATE,
)
from .entity import WeightGoalEntity
from .manager import WeightGoalManager


async def async_setup_entry(
    hass: HomeAssistant,
    entry: WeightGoalConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Set up the date entities."""
    manager = entry.runtime_data
    async_add_entities([StartDate(manager), EndDate(manager), ManualDate(manager)])


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


class ManualDate(WeightGoalDate):
    """Day the staged weight is recorded for.

    Shows today until another day is picked, so the common case needs no
    thought and reading a weight off the entity is never ambiguous. Picking a
    day here changes nothing on its own; the confirm button still does the
    recording.
    """

    _attr_icon = "mdi:calendar-edit"

    def __init__(self, manager: WeightGoalManager) -> None:
        """Initialise."""
        super().__init__(manager, KEY_MANUAL_DATE)

    @property
    def available(self) -> bool:
        """Unavailable while a scale is the configured source."""
        return self._manager.manual_entry_enabled

    @property
    def native_value(self) -> date:
        """Return the staged day, or today."""
        return self._manager.manual_date

    async def async_set_value(self, value: date) -> None:
        """Stage the day; the confirm button records with it."""
        if not self._manager.manual_entry_enabled:
            raise ServiceValidationError(
                translation_domain=DOMAIN, translation_key="manual_entry_disabled"
            )
        await self._manager.async_stage_manual_date(value)
