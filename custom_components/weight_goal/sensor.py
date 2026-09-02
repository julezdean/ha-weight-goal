"""Sensor entities for Road to Weight Goal."""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from datetime import datetime
from typing import Any

from homeassistant.components.sensor import (
    ENTITY_ID_FORMAT,
    SensorDeviceClass,
    SensorEntity,
    SensorEntityDescription,
    SensorStateClass,
)
from homeassistant.const import PERCENTAGE, UnitOfMass
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from . import WeightGoalConfigEntry
from .const import (
    KEY_DEVIATION,
    KEY_LAST_MEASUREMENT,
    KEY_TIME_PROGRESS,
    KEY_PROJECTED_DATE,
    KEY_REMAINING,
    KEY_STATUS,
    KEY_TARGET_WEIGHT_TODAY,
    KEY_WEIGHT_PROGRESS,
    KEY_TREND,
    KEY_WEIGHT,
    STATUSES,
)
from .entity import WeightGoalEntity
from .manager import WeightGoalManager


@dataclass(frozen=True, kw_only=True)
class WeightGoalSensorDescription(SensorEntityDescription):
    """Describes a Road to Weight Goal sensor."""

    value_fn: Callable[[WeightGoalManager], Any]
    attributes_fn: Callable[[WeightGoalManager], dict[str, Any]] | None = None
    available_fn: Callable[[WeightGoalManager], bool] = lambda _manager: True


def _last_measurement(manager: WeightGoalManager) -> datetime | None:
    last = manager.last_measurement
    return None if last is None else last.timestamp


def _weight_attributes(manager: WeightGoalManager) -> dict[str, Any]:
    last = manager.last_measurement
    return {"source": None if last is None else last.source}


def _status_attributes(manager: WeightGoalManager) -> dict[str, Any]:
    """Everything a dashboard needs that is not a value of its own.

    The status sensor is the entity a card is pointed at, so the settings a
    card has to know about ride along here rather than becoming entities. In
    particular ``goal_mode`` tells a card which of target weight and rate per
    week is the authoritative input, so it can render the derived one read only
    instead of offering an edit that would be rejected.
    """
    return {
        "direction": manager.direction,
        "tolerance": manager.tolerance,
        "goal_mode": manager.goal_mode,
        "min_weight": manager.min_weight,
        "max_weight": manager.max_weight,
        "trend_window_days": manager.trend_window_days,
    }


SENSORS: tuple[WeightGoalSensorDescription, ...] = (
    WeightGoalSensorDescription(
        key=KEY_WEIGHT,
        translation_key=KEY_WEIGHT,
        device_class=SensorDeviceClass.WEIGHT,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfMass.KILOGRAMS,
        suggested_display_precision=1,
        value_fn=lambda manager: manager.current_weight,
        attributes_fn=_weight_attributes,
    ),
    WeightGoalSensorDescription(
        key=KEY_TARGET_WEIGHT_TODAY,
        translation_key=KEY_TARGET_WEIGHT_TODAY,
        device_class=SensorDeviceClass.WEIGHT,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfMass.KILOGRAMS,
        suggested_display_precision=2,
        value_fn=lambda manager: manager.target_weight_today,
    ),
    WeightGoalSensorDescription(
        key=KEY_DEVIATION,
        translation_key=KEY_DEVIATION,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfMass.KILOGRAMS,
        suggested_display_precision=2,
        icon="mdi:scale-unbalanced",
        value_fn=lambda manager: manager.deviation,
    ),
    WeightGoalSensorDescription(
        key=KEY_TREND,
        translation_key=KEY_TREND,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfMass.KILOGRAMS,
        suggested_display_precision=2,
        icon="mdi:chart-line-variant",
        value_fn=lambda manager: manager.trend,
        available_fn=lambda manager: manager.trend_window_days > 0,
    ),
    WeightGoalSensorDescription(
        key=KEY_WEIGHT_PROGRESS,
        translation_key=KEY_WEIGHT_PROGRESS,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=PERCENTAGE,
        suggested_display_precision=0,
        icon="mdi:progress-check",
        value_fn=lambda manager: manager.weight_progress,
    ),
    WeightGoalSensorDescription(
        key=KEY_TIME_PROGRESS,
        translation_key=KEY_TIME_PROGRESS,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=PERCENTAGE,
        suggested_display_precision=0,
        icon="mdi:progress-clock",
        value_fn=lambda manager: manager.time_progress,
    ),
    WeightGoalSensorDescription(
        key=KEY_REMAINING,
        translation_key=KEY_REMAINING,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfMass.KILOGRAMS,
        suggested_display_precision=2,
        icon="mdi:flag-checkered",
        value_fn=lambda manager: manager.remaining,
    ),
    WeightGoalSensorDescription(
        key=KEY_PROJECTED_DATE,
        translation_key=KEY_PROJECTED_DATE,
        device_class=SensorDeviceClass.TIMESTAMP,
        icon="mdi:calendar-clock",
        value_fn=lambda manager: manager.projected_date,
    ),
    WeightGoalSensorDescription(
        key=KEY_STATUS,
        translation_key=KEY_STATUS,
        device_class=SensorDeviceClass.ENUM,
        options=list(STATUSES),
        value_fn=lambda manager: manager.status,
        attributes_fn=_status_attributes,
    ),
    WeightGoalSensorDescription(
        key=KEY_LAST_MEASUREMENT,
        translation_key=KEY_LAST_MEASUREMENT,
        device_class=SensorDeviceClass.TIMESTAMP,
        icon="mdi:clock-outline",
        value_fn=_last_measurement,
    ),
)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: WeightGoalConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Set up the sensors."""
    manager = entry.runtime_data
    async_add_entities(
        WeightGoalSensor(manager, description) for description in SENSORS
    )


class WeightGoalSensor(WeightGoalEntity, SensorEntity):
    """A computed value of the goal."""

    entity_id_format = ENTITY_ID_FORMAT
    entity_description: WeightGoalSensorDescription

    def __init__(
        self, manager: WeightGoalManager, description: WeightGoalSensorDescription
    ) -> None:
        """Initialise."""
        super().__init__(manager, description.key)
        self.entity_description = description

    @property
    def available(self) -> bool:
        """Whether this sensor is switched on at all."""
        return self.entity_description.available_fn(self._manager)

    @property
    def native_value(self) -> Any:
        """Return the current value."""
        return self.entity_description.value_fn(self._manager)

    @property
    def extra_state_attributes(self) -> dict[str, Any] | None:
        """Return extra attributes, if the description defines any."""
        if self.entity_description.attributes_fn is None:
            return None
        return self.entity_description.attributes_fn(self._manager)
