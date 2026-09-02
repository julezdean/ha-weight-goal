"""Services for Road to Weight Goal."""

from __future__ import annotations

from datetime import timedelta
from typing import TYPE_CHECKING, Any

import voluptuous as vol
from homeassistant.const import ATTR_ENTITY_ID
from homeassistant.core import (
    HomeAssistant,
    ServiceCall,
    ServiceResponse,
    SupportsResponse,
    callback,
)
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import config_validation as cv, entity_registry as er

from .const import (
    ATTR_DAYS,
    ATTR_REPLACE,
    ATTR_TIMESTAMP,
    ATTR_TOLERANCE_MINUTES,
    ATTR_WRITE_STATISTICS,
    ATTR_WEIGHT,
    CONF_END_DATE,
    CONF_RATE_PER_WEEK,
    CONF_START_DATE,
    CONF_SOURCE_ENTITY,
    CONF_START_WEIGHT,
    CONF_TARGET_WEIGHT,
    DEFAULT_MATCH_MINUTES,
    DOMAIN,
    MODE_RATE,
    MODE_TARGET,
    SERVICE_DELETE_MEASUREMENT,
    SERVICE_GET_MEASUREMENTS,
    SERVICE_IGNORE_LAST_MEASUREMENT,
    SERVICE_IMPORT_HISTORY,
    SERVICE_RECORD_WEIGHT,
    SERVICE_RESET_GOAL,
    SERVICE_SET_GOAL,
    SOURCE_SERVICE,
)
from .history_import import MAX_IMPORT_DAYS, async_import_history

if TYPE_CHECKING:
    from .manager import WeightGoalManager

BASE_SCHEMA = vol.Schema({vol.Required(ATTR_ENTITY_ID): cv.entity_ids})

RECORD_WEIGHT_SCHEMA = BASE_SCHEMA.extend(
    {
        vol.Required(ATTR_WEIGHT): vol.Coerce(float),
        vol.Optional(ATTR_TIMESTAMP): cv.datetime,
    }
)

SET_GOAL_SCHEMA = BASE_SCHEMA.extend(
    {
        vol.Optional(CONF_START_WEIGHT): vol.Coerce(float),
        vol.Optional(CONF_TARGET_WEIGHT): vol.Coerce(float),
        vol.Optional(CONF_RATE_PER_WEEK): vol.Coerce(float),
        vol.Optional(CONF_START_DATE): cv.date,
        vol.Optional(CONF_END_DATE): cv.date,
    }
)

GET_MEASUREMENTS_SCHEMA = BASE_SCHEMA.extend(
    {vol.Optional(ATTR_DAYS): vol.All(vol.Coerce(int), vol.Range(min=1, max=3650))}
)

DELETE_MEASUREMENT_SCHEMA = BASE_SCHEMA.extend(
    {
        vol.Required(ATTR_TIMESTAMP): cv.datetime,
        vol.Optional(
            ATTR_TOLERANCE_MINUTES, default=DEFAULT_MATCH_MINUTES
        ): vol.All(vol.Coerce(int), vol.Range(min=0, max=1440)),
    }
)

IMPORT_HISTORY_SCHEMA = BASE_SCHEMA.extend(
    {
        vol.Optional(CONF_SOURCE_ENTITY): cv.entity_id,
        vol.Optional(ATTR_DAYS, default=365): vol.All(
            vol.Coerce(int), vol.Range(min=1, max=MAX_IMPORT_DAYS)
        ),
        vol.Optional(ATTR_REPLACE, default=False): cv.boolean,
        vol.Optional(ATTR_WRITE_STATISTICS, default=False): cv.boolean,
    }
)


def _managers(hass: HomeAssistant, call: ServiceCall) -> list[WeightGoalManager]:
    """Resolve the targeted entities to their config entries."""
    registry = er.async_get(hass)
    managers: dict[str, WeightGoalManager] = {}

    for entity_id in call.data[ATTR_ENTITY_ID]:
        entry = registry.async_get(entity_id)
        if entry is None or entry.platform != DOMAIN or entry.config_entry_id is None:
            continue
        config_entry = hass.config_entries.async_get_entry(entry.config_entry_id)
        if config_entry is None or not hasattr(config_entry, "runtime_data"):
            continue
        managers[config_entry.entry_id] = config_entry.runtime_data

    if not managers:
        raise ServiceValidationError(
            translation_domain=DOMAIN, translation_key="no_target"
        )
    return list(managers.values())


@callback
def async_register_services(hass: HomeAssistant) -> None:
    """Register the services, once per Home Assistant run."""
    if hass.services.has_service(DOMAIN, SERVICE_RECORD_WEIGHT):
        return

    async def handle_record_weight(call: ServiceCall) -> None:
        for manager in _managers(hass, call):
            await manager.async_record_weight(
                call.data[ATTR_WEIGHT],
                timestamp=call.data.get(ATTR_TIMESTAMP),
                source=SOURCE_SERVICE,
            )

    async def handle_set_goal(call: ServiceCall) -> None:
        changes: dict[str, Any] = {
            key: value
            for key, value in call.data.items()
            if key
            in (
                CONF_START_WEIGHT,
                CONF_TARGET_WEIGHT,
                CONF_RATE_PER_WEEK,
                CONF_START_DATE,
                CONF_END_DATE,
            )
        }
        if not changes:
            raise ServiceValidationError(
                translation_domain=DOMAIN, translation_key="nothing_to_change"
            )
        for manager in _managers(hass, call):
            if CONF_TARGET_WEIGHT in changes and manager.goal_mode != MODE_TARGET:
                raise ServiceValidationError(
                    translation_domain=DOMAIN,
                    translation_key="derived_value",
                    translation_placeholders={"mode": manager.goal_mode},
                )
            if CONF_RATE_PER_WEEK in changes and manager.goal_mode != MODE_RATE:
                raise ServiceValidationError(
                    translation_domain=DOMAIN,
                    translation_key="derived_value",
                    translation_placeholders={"mode": manager.goal_mode},
                )
            await manager.async_set_goal(**changes)

    async def handle_reset_goal(call: ServiceCall) -> None:
        for manager in _managers(hass, call):
            await manager.async_reset_goal()

    async def handle_delete_measurement(call: ServiceCall) -> ServiceResponse:
        removed: list[dict[str, Any]] = []
        tolerance = timedelta(minutes=call.data[ATTR_TOLERANCE_MINUTES])
        for manager in _managers(hass, call):
            match = await manager.async_delete_measurement(
                call.data[ATTR_TIMESTAMP], tolerance
            )
            if match is not None:
                removed.append({"entry_id": manager.entry.entry_id, **match.as_dict()})
        if not removed:
            raise ServiceValidationError(
                translation_domain=DOMAIN, translation_key="no_measurement_found"
            )
        return {"removed": removed}

    async def handle_ignore_last(call: ServiceCall) -> None:
        for manager in _managers(hass, call):
            await manager.async_ignore_last_measurement()

    async def handle_get_measurements(call: ServiceCall) -> ServiceResponse:
        result: dict[str, Any] = {}
        for manager in _managers(hass, call):
            result[manager.entry.entry_id] = {
                "name": manager.entry.title,
                "measurements": list(
                    manager.measurements_payload(call.data.get(ATTR_DAYS))
                ),
            }
        return {"entries": result}

    async def handle_import_history(call: ServiceCall) -> ServiceResponse:
        result: dict[str, Any] = {}
        for manager in _managers(hass, call):
            result[manager.entry.entry_id] = await async_import_history(
                manager,
                source_entity=call.data.get(CONF_SOURCE_ENTITY),
                days=call.data[ATTR_DAYS],
                replace=call.data[ATTR_REPLACE],
                write_statistics=call.data[ATTR_WRITE_STATISTICS],
            )
        return {"entries": result}

    hass.services.async_register(
        DOMAIN, SERVICE_RECORD_WEIGHT, handle_record_weight, RECORD_WEIGHT_SCHEMA
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_IMPORT_HISTORY,
        handle_import_history,
        IMPORT_HISTORY_SCHEMA,
        supports_response=SupportsResponse.OPTIONAL,
    )
    hass.services.async_register(DOMAIN, SERVICE_SET_GOAL, handle_set_goal, SET_GOAL_SCHEMA)
    hass.services.async_register(DOMAIN, SERVICE_RESET_GOAL, handle_reset_goal, BASE_SCHEMA)
    hass.services.async_register(
        DOMAIN, SERVICE_IGNORE_LAST_MEASUREMENT, handle_ignore_last, BASE_SCHEMA
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_DELETE_MEASUREMENT,
        handle_delete_measurement,
        DELETE_MEASUREMENT_SCHEMA,
        supports_response=SupportsResponse.OPTIONAL,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_GET_MEASUREMENTS,
        handle_get_measurements,
        GET_MEASUREMENTS_SCHEMA,
        supports_response=SupportsResponse.ONLY,
    )
