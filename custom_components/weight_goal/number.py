"""Number entities for Road to Weight Goal."""

from __future__ import annotations

from homeassistant.components.number import (
    ENTITY_ID_FORMAT,
    NumberDeviceClass,
    NumberEntity,
    NumberMode,
)
from homeassistant.const import UnitOfMass
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from . import WeightGoalConfigEntry
from .const import (
    CONF_RATE_PER_WEEK,
    CONF_START_WEIGHT,
    CONF_TARGET_WEIGHT,
    DOMAIN,
    KEY_MANUAL_WEIGHT,
    KEY_RATE_PER_WEEK,
    KEY_START_WEIGHT,
    KEY_TARGET_WEIGHT,
    MODE_RATE,
    MODE_TARGET,
    RATE_LIMIT_PER_WEEK,
)
from .entity import WeightGoalEntity
from .manager import WeightGoalManager


async def async_setup_entry(
    hass: HomeAssistant,
    entry: WeightGoalConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Set up the number entities."""
    manager = entry.runtime_data
    async_add_entities(
        [
            StartWeightNumber(manager),
            TargetWeightNumber(manager),
            RatePerWeekNumber(manager),
            ManualWeightNumber(manager),
        ]
    )


class WeightGoalNumber(WeightGoalEntity, NumberEntity):
    """Base class for the number entities."""

    entity_id_format = ENTITY_ID_FORMAT
    _attr_mode = NumberMode.BOX


class _WeightNumber(WeightGoalNumber):
    """A number holding a weight in kilograms."""

    _attr_device_class = NumberDeviceClass.WEIGHT
    _attr_native_unit_of_measurement = UnitOfMass.KILOGRAMS
    _attr_native_step = 0.1
    _attr_suggested_display_precision = 1

    @property
    def native_min_value(self) -> float:
        """Lower bound from the options."""
        return self._manager.min_weight

    @property
    def native_max_value(self) -> float:
        """Upper bound from the options."""
        return self._manager.max_weight


class StartWeightNumber(_WeightNumber):
    """The weight the goal started from."""

    def __init__(self, manager: WeightGoalManager) -> None:
        """Initialise."""
        super().__init__(manager, KEY_START_WEIGHT)

    @property
    def native_value(self) -> float | None:
        """Return the configured start weight."""
        return self._manager.start_weight

    async def async_set_native_value(self, value: float) -> None:
        """Store a new start weight."""
        await self._manager.async_set_goal(**{CONF_START_WEIGHT: value})


class TargetWeightNumber(_WeightNumber):
    """The weight the goal aims for."""

    def __init__(self, manager: WeightGoalManager) -> None:
        """Initialise."""
        super().__init__(manager, KEY_TARGET_WEIGHT)

    @property
    def native_value(self) -> float | None:
        """Return the configured or derived target weight."""
        return self._manager.target_weight

    async def async_set_native_value(self, value: float) -> None:
        """Store a new target weight, if this is the authoritative input."""
        if self._manager.goal_mode != MODE_TARGET:
            raise ServiceValidationError(
                translation_domain=DOMAIN,
                translation_key="derived_value",
                translation_placeholders={"mode": self._manager.goal_mode},
            )
        await self._manager.async_set_goal(**{CONF_TARGET_WEIGHT: value})


class RatePerWeekNumber(WeightGoalNumber):
    """The planned weight change per week."""

    _attr_native_unit_of_measurement = f"{UnitOfMass.KILOGRAMS}/w"
    _attr_native_step = 0.01
    _attr_suggested_display_precision = 2
    _attr_native_min_value = -RATE_LIMIT_PER_WEEK
    _attr_native_max_value = RATE_LIMIT_PER_WEEK

    def __init__(self, manager: WeightGoalManager) -> None:
        """Initialise."""
        super().__init__(manager, KEY_RATE_PER_WEEK)

    @property
    def native_value(self) -> float | None:
        """Return the configured or derived rate."""
        return self._manager.rate_per_week

    async def async_set_native_value(self, value: float) -> None:
        """Store a new rate, if this is the authoritative input."""
        if self._manager.goal_mode != MODE_RATE:
            raise ServiceValidationError(
                translation_domain=DOMAIN,
                translation_key="derived_value",
                translation_placeholders={"mode": self._manager.goal_mode},
            )
        await self._manager.async_set_goal(**{CONF_RATE_PER_WEEK: value})


class ManualWeightNumber(_WeightNumber):
    """Holds a weight until the confirm button records it.

    Deliberately not a one step entry: an entity that records on every change
    turns a mistyped value into a measurement that then has to be hunted down
    and deleted again.
    """

    def __init__(self, manager: WeightGoalManager) -> None:
        """Initialise."""
        super().__init__(manager, KEY_MANUAL_WEIGHT)

    @property
    def available(self) -> bool:
        """Unavailable while a scale is the configured source."""
        return self._manager.manual_entry_enabled

    @property
    def native_value(self) -> float | None:
        """Return the staged weight."""
        return self._manager.manual_weight

    @property
    def extra_state_attributes(self) -> dict[str, bool]:
        """Expose whether this value still needs confirming."""
        return {"pending": self._manager.manual_pending}

    async def async_set_native_value(self, value: float) -> None:
        """Stage the value; the confirm button records it."""
        if not self._manager.manual_entry_enabled:
            raise ServiceValidationError(
                translation_domain=DOMAIN, translation_key="manual_entry_disabled"
            )
        await self._manager.async_stage_manual_weight(value)
