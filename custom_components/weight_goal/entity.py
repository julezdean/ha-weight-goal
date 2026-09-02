"""Shared entity base for Road to Weight Goal."""

from __future__ import annotations

import asyncio

from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity import Entity, async_generate_entity_id
from homeassistant.helpers.entity_platform import EntityPlatform
from homeassistant.util import slugify

from .const import DOMAIN
from .manager import WeightGoalManager


class WeightGoalEntity(Entity):
    """Base class for every entity of this integration."""

    _attr_has_entity_name = True
    _attr_should_poll = False

    #: Set by each platform module, for example ``"sensor.{}"``.
    entity_id_format: str = "{}"

    def __init__(self, manager: WeightGoalManager, key: str) -> None:
        """Initialise the entity."""
        self._manager = manager
        self._key = key
        entry = manager.entry
        self._attr_unique_id = f"{entry.entry_id}_{key}"
        self._attr_translation_key = key
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, entry.entry_id)},
            name=entry.title,
            manufacturer="Road to Weight Goal",
            entry_type=None,
        )

    def add_to_platform_start(
        self,
        hass: HomeAssistant,
        platform: EntityPlatform,
        parallel_updates: asyncio.Semaphore | None,
    ) -> None:
        """Pin the entity id to the internal English key.

        Without this Home Assistant derives the object id from the translated
        display name, so the same entity would be called
        ``sensor.abweichung_...`` on a German instance and
        ``sensor.deviation_...`` on an English one. The display name stays
        translated through ``translation_key``.
        """
        super().add_to_platform_start(hass, platform, parallel_updates)
        self.entity_id = async_generate_entity_id(
            self.entity_id_format,
            f"{slugify(self._manager.entry.title)}_{self._key}",
            hass=hass,
        )

    async def async_added_to_hass(self) -> None:
        """Subscribe to manager updates."""
        await super().async_added_to_hass()
        self.async_on_remove(self._manager.async_add_listener(self._handle_update))

    @callback
    def _handle_update(self) -> None:
        """Write the new state after the manager changed something."""
        self.async_write_ha_state()
