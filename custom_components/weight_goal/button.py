"""Button entities for Road to Weight Goal."""

from __future__ import annotations

from homeassistant.components.button import ENTITY_ID_FORMAT, ButtonEntity
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from . import WeightGoalConfigEntry
from .const import DOMAIN, KEY_RECORD_WEIGHT
from .entity import WeightGoalEntity
from .manager import WeightGoalManager


async def async_setup_entry(
    hass: HomeAssistant,
    entry: WeightGoalConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Set up the button."""
    async_add_entities([RecordWeightButton(entry.runtime_data)])


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
