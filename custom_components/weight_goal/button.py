"""Button entities for Road to Weight Goal."""

from __future__ import annotations

from homeassistant.components.button import ENTITY_ID_FORMAT, ButtonEntity
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from . import WeightGoalConfigEntry
from .const import (
    DOMAIN,
    KEY_CONFIRM_START_TODAY,
    KEY_RECORD_WEIGHT,
    KEY_START_TODAY,
)
from .entity import WeightGoalEntity
from .manager import WeightGoalManager


async def async_setup_entry(
    hass: HomeAssistant,
    entry: WeightGoalConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Set up the buttons."""
    manager = entry.runtime_data
    async_add_entities(
        [
            StartTodayButton(manager),
            ConfirmStartTodayButton(manager),
            RecordWeightButton(manager),
        ]
    )


class StartTodayButton(WeightGoalEntity, ButtonEntity):
    """Stage a move of the goal start to today."""

    entity_id_format = ENTITY_ID_FORMAT
    _attr_icon = "mdi:calendar-arrow-right"

    def __init__(self, manager: WeightGoalManager) -> None:
        """Initialise."""
        super().__init__(manager, KEY_START_TODAY)

    async def async_press(self) -> None:
        """Stage the change; the confirm button applies it."""
        await self._manager.async_arm_start_today()


class ConfirmStartTodayButton(WeightGoalEntity, ButtonEntity):
    """Applies a staged start today."""

    entity_id_format = ENTITY_ID_FORMAT
    _attr_icon = "mdi:check"

    def __init__(self, manager: WeightGoalManager) -> None:
        """Initialise."""
        super().__init__(manager, KEY_CONFIRM_START_TODAY)

    @property
    def available(self) -> bool:
        """Only available while a change is waiting, and only briefly."""
        return self._manager.start_today_armed

    @property
    def extra_state_attributes(self) -> dict[str, object]:
        """Show what confirming would change."""
        return self._manager.start_today_preview

    async def async_press(self) -> None:
        """Set the start weight to the latest measurement and the date to today."""
        if not await self._manager.async_confirm_start_today():
            raise ServiceValidationError(
                translation_domain=DOMAIN, translation_key="nothing_to_confirm"
            )


class RecordWeightButton(WeightGoalEntity, ButtonEntity):
    """Confirms the weight staged in the manual weight entity."""

    entity_id_format = ENTITY_ID_FORMAT
    _attr_icon = "mdi:check"

    def __init__(self, manager: WeightGoalManager) -> None:
        """Initialise."""
        super().__init__(manager, KEY_RECORD_WEIGHT)

    @property
    def available(self) -> bool:
        """Only available while there is something to confirm."""
        return self._manager.manual_entry_enabled and self._manager.manual_pending

    async def async_press(self) -> None:
        """Record the staged weight."""
        if not await self._manager.async_confirm_manual_weight():
            raise ServiceValidationError(
                translation_domain=DOMAIN, translation_key="nothing_to_confirm"
            )
