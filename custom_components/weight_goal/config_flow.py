"""Config and options flow for Road to Weight Goal."""

from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant.config_entries import (
    ConfigEntry,
    ConfigFlow,
    ConfigFlowResult,
    OptionsFlow,
)
from homeassistant.const import CONF_NAME
from homeassistant.core import callback
from homeassistant.helpers.selector import (
    ActionSelector,
    BooleanSelector,
    EntitySelector,
    EntitySelectorConfig,
    NumberSelector,
    NumberSelectorConfig,
    NumberSelectorMode,
    SelectSelector,
    SelectSelectorConfig,
    SelectSelectorMode,
    TextSelector,
)

from .const import (
    CONF_ALLOW_MANUAL,
    CONF_GOAL_MODE,
    CONF_MAX_JUMP,
    CONF_MAX_WEIGHT,
    CONF_MIN_WEIGHT,
    CONF_OVERDUE_DAYS,
    CONF_RECALCULATION_INTERVAL,
    CONF_SCRIPT_GOAL_ENDED,
    CONF_SCRIPT_GOAL_REACHED,
    CONF_SCRIPT_MEASUREMENT,
    CONF_SCRIPT_OVERDUE,
    CONF_SCRIPT_STATUS_CHANGED,
    CONF_SOURCE_ENTITY,
    CONF_TOLERANCE,
    CONF_TREND_WINDOW_DAYS,
    DEFAULT_ALLOW_MANUAL,
    DEFAULT_GOAL_MODE,
    DEFAULT_MAX_JUMP,
    DEFAULT_MAX_WEIGHT,
    DEFAULT_MIN_WEIGHT,
    DEFAULT_OVERDUE_DAYS,
    DEFAULT_RECALCULATION_INTERVAL,
    DEFAULT_TOLERANCE,
    DEFAULT_TREND_WINDOW_DAYS,
    DOMAIN,
    GOAL_MODES,
)

SCRIPT_OPTIONS = (
    CONF_SCRIPT_MEASUREMENT,
    CONF_SCRIPT_STATUS_CHANGED,
    CONF_SCRIPT_GOAL_REACHED,
    CONF_SCRIPT_GOAL_ENDED,
    CONF_SCRIPT_OVERDUE,
)


def _number(minimum: float, maximum: float, step: float, unit: str | None = None):
    return NumberSelector(
        NumberSelectorConfig(
            min=minimum,
            max=maximum,
            step=step,
            mode=NumberSelectorMode.BOX,
            unit_of_measurement=unit,
        )
    )


USER_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_NAME): TextSelector(),
        vol.Optional(CONF_SOURCE_ENTITY): EntitySelector(
            EntitySelectorConfig(domain=["sensor", "number", "input_number"])
        ),
        vol.Required(CONF_GOAL_MODE, default=DEFAULT_GOAL_MODE): SelectSelector(
            SelectSelectorConfig(
                options=list(GOAL_MODES),
                translation_key=CONF_GOAL_MODE,
                mode=SelectSelectorMode.DROPDOWN,
            )
        ),
    }
)


class WeightGoalConfigFlow(ConfigFlow, domain=DOMAIN):
    """Handle the initial configuration."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Ask for a name, the weight source and the goal mode."""
        errors: dict[str, str] = {}
        if user_input is not None:
            name = user_input[CONF_NAME].strip()
            if not name:
                errors[CONF_NAME] = "invalid_name"
            else:
                self._async_abort_entries_match({CONF_NAME: name})
                options = {
                    CONF_GOAL_MODE: user_input[CONF_GOAL_MODE],
                    CONF_MIN_WEIGHT: DEFAULT_MIN_WEIGHT,
                    CONF_MAX_WEIGHT: DEFAULT_MAX_WEIGHT,
                    CONF_TOLERANCE: DEFAULT_TOLERANCE,
                    CONF_TREND_WINDOW_DAYS: DEFAULT_TREND_WINDOW_DAYS,
                    CONF_OVERDUE_DAYS: DEFAULT_OVERDUE_DAYS,
                    CONF_MAX_JUMP: DEFAULT_MAX_JUMP,
                    CONF_RECALCULATION_INTERVAL: DEFAULT_RECALCULATION_INTERVAL,
                }
                source = user_input.get(CONF_SOURCE_ENTITY)
                # With a scale connected, manual entry starts off: an accidental
                # value is easy to produce and awkward to remove again.
                options[CONF_ALLOW_MANUAL] = not source
                if source:
                    options[CONF_SOURCE_ENTITY] = source
                return self.async_create_entry(
                    title=name, data={CONF_NAME: name}, options=options
                )

        return self.async_show_form(
            step_id="user", data_schema=USER_SCHEMA, errors=errors
        )

    @staticmethod
    @callback
    def async_get_options_flow(entry: ConfigEntry) -> WeightGoalOptionsFlow:
        """Return the options flow."""
        return WeightGoalOptionsFlow()


class WeightGoalOptionsFlow(OptionsFlow):
    """Handle the options."""

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Show the settings menu."""
        return self.async_show_menu(
            step_id="init", menu_options=["settings", "actions"]
        )

    async def async_step_settings(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Edit the behavioural settings."""
        options = self.config_entry.options
        if user_input is not None:
            merged = dict(options)
            merged.update(user_input)
            if merged[CONF_MIN_WEIGHT] >= merged[CONF_MAX_WEIGHT]:
                return self.async_show_form(
                    step_id="settings",
                    data_schema=self._settings_schema(merged),
                    errors={"base": "invalid_range"},
                )
            return self.async_create_entry(data=merged)

        return self.async_show_form(
            step_id="settings", data_schema=self._settings_schema(options)
        )

    def _settings_schema(self, options: dict[str, Any]) -> vol.Schema:
        return vol.Schema(
            {
                vol.Optional(
                    CONF_SOURCE_ENTITY,
                    description={"suggested_value": options.get(CONF_SOURCE_ENTITY)},
                ): EntitySelector(
                    EntitySelectorConfig(domain=["sensor", "number", "input_number"])
                ),
                vol.Required(
                    CONF_GOAL_MODE,
                    default=options.get(CONF_GOAL_MODE, DEFAULT_GOAL_MODE),
                ): SelectSelector(
                    SelectSelectorConfig(
                        options=list(GOAL_MODES),
                        translation_key=CONF_GOAL_MODE,
                        mode=SelectSelectorMode.DROPDOWN,
                    )
                ),
                vol.Required(
                    CONF_MIN_WEIGHT,
                    default=options.get(CONF_MIN_WEIGHT, DEFAULT_MIN_WEIGHT),
                ): _number(1, 500, 0.5, "kg"),
                vol.Required(
                    CONF_MAX_WEIGHT,
                    default=options.get(CONF_MAX_WEIGHT, DEFAULT_MAX_WEIGHT),
                ): _number(1, 500, 0.5, "kg"),
                vol.Required(
                    CONF_TOLERANCE,
                    default=options.get(CONF_TOLERANCE, DEFAULT_TOLERANCE),
                ): _number(0, 20, 0.1, "kg"),
                vol.Required(
                    CONF_TREND_WINDOW_DAYS,
                    default=options.get(
                        CONF_TREND_WINDOW_DAYS, DEFAULT_TREND_WINDOW_DAYS
                    ),
                ): _number(0, 90, 1, "d"),
                vol.Required(
                    CONF_OVERDUE_DAYS,
                    default=options.get(CONF_OVERDUE_DAYS, DEFAULT_OVERDUE_DAYS),
                ): _number(0, 90, 1, "d"),
                vol.Required(
                    CONF_MAX_JUMP, default=options.get(CONF_MAX_JUMP, DEFAULT_MAX_JUMP)
                ): _number(0, 50, 0.5, "kg"),
                vol.Required(
                    CONF_ALLOW_MANUAL,
                    default=options.get(CONF_ALLOW_MANUAL, DEFAULT_ALLOW_MANUAL),
                ): BooleanSelector(),
                vol.Required(
                    CONF_RECALCULATION_INTERVAL,
                    default=options.get(
                        CONF_RECALCULATION_INTERVAL, DEFAULT_RECALCULATION_INTERVAL
                    ),
                ): _number(0, 1440, 1, "min"),
            }
        )

    async def async_step_actions(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Edit the optional script actions."""
        options = self.config_entry.options
        if user_input is not None:
            merged = dict(options)
            for key in SCRIPT_OPTIONS:
                value = user_input.get(key)
                if value:
                    merged[key] = value
                else:
                    merged.pop(key, None)
            return self.async_create_entry(data=merged)

        schema = vol.Schema(
            {
                vol.Optional(
                    key, description={"suggested_value": options.get(key)}
                ): ActionSelector()
                for key in SCRIPT_OPTIONS
            }
        )
        return self.async_show_form(step_id="actions", data_schema=schema)
