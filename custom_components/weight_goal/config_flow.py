"""Config and options flow for Road to Weight Goal."""

from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant.config_entries import (
    ConfigEntry,
    ConfigFlow,
    ConfigFlowResult,
    ConfigSubentryFlow,
    OptionsFlow,
    SubentryFlowResult,
)
from homeassistant.const import CONF_NAME
from homeassistant.core import callback
from homeassistant.util import dt as dt_util
from homeassistant.helpers.selector import (
    ActionSelector,
    BooleanSelector,
    DateSelector,
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
    CONF_ACTIVATE,
    CONF_ALLOW_MANUAL,
    CONF_END_DATE,
    CONF_GOAL_MODE,
    CONF_MAX_JUMP,
    CONF_MAX_WEIGHT,
    CONF_MIN_WEIGHT,
    CONF_OVERDUE_DAYS,
    CONF_RATE_PER_WEEK,
    CONF_RECALCULATION_INTERVAL,
    CONF_SCRIPT_GOAL_ENDED,
    CONF_SCRIPT_GOAL_REACHED,
    CONF_SCRIPT_MEASUREMENT,
    CONF_SCRIPT_OVERDUE,
    CONF_SCRIPT_STATUS_CHANGED,
    CONF_SOURCE_ENTITY,
    CONF_START_DATE,
    CONF_START_WEIGHT,
    CONF_TARGET_WEIGHT,
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
    MODE_RATE,
    RATE_LIMIT_PER_WEEK,
    SUBENTRY_GOAL,
)
from .helpers import goal_name_error, goal_weeks, normalise_goal, parse_date

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
    }
)


class WeightGoalConfigFlow(ConfigFlow, domain=DOMAIN):
    """Handle the initial configuration."""

    VERSION = 2

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Ask for a name and the weight source; goals are added afterwards."""
        errors: dict[str, str] = {}
        if user_input is not None:
            name = user_input[CONF_NAME].strip()
            if not name:
                errors[CONF_NAME] = "invalid_name"
            else:
                self._async_abort_entries_match({CONF_NAME: name})
                options = {
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

    @classmethod
    @callback
    def async_get_supported_subentry_types(
        cls, config_entry: ConfigEntry
    ) -> dict[str, type[ConfigSubentryFlow]]:
        """Goals are the subentries of a person."""
        return {SUBENTRY_GOAL: GoalSubentryFlow}


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


class GoalSubentryFlow(ConfigSubentryFlow):
    """Add a goal to a person, or change one.

    Two steps, because the second one asks for either the target weight or the
    rate per week, depending on what the first one chose; offering both and
    ignoring one would be a form that lies about what it uses.
    """

    def __init__(self) -> None:
        """Initialise."""
        self._goal: dict[str, Any] = {}
        self._name = ""
        self._activate = True

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> SubentryFlowResult:
        """Name, goal mode and whether the new goal becomes active."""
        return await self._async_step_basics("user", user_input)

    async def async_step_reconfigure(
        self, user_input: dict[str, Any] | None = None
    ) -> SubentryFlowResult:
        """Same as adding, prefilled. Activating is the select's job here."""
        if user_input is None and not self._name:
            goal = self._get_reconfigure_subentry()
            self._goal = dict(goal.data)
            self._name = goal.title
        return await self._async_step_basics("reconfigure", user_input)

    async def _async_step_basics(
        self, step_id: str, user_input: dict[str, Any] | None
    ) -> SubentryFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            name = user_input[CONF_NAME].strip()
            if error := self._name_error(name):
                errors[CONF_NAME] = error
            else:
                self._name = name
                self._goal[CONF_GOAL_MODE] = user_input[CONF_GOAL_MODE]
                self._activate = user_input.get(CONF_ACTIVATE, False)
                return await self.async_step_values()

        fields: dict[Any, Any] = {
            vol.Required(CONF_NAME, default=self._name): TextSelector(),
            vol.Required(
                CONF_GOAL_MODE,
                default=self._goal.get(CONF_GOAL_MODE, DEFAULT_GOAL_MODE),
            ): SelectSelector(
                SelectSelectorConfig(
                    options=list(GOAL_MODES),
                    translation_key=CONF_GOAL_MODE,
                    mode=SelectSelectorMode.DROPDOWN,
                )
            ),
        }
        if step_id == "user":
            fields[vol.Required(CONF_ACTIVATE, default=True)] = BooleanSelector()
        return self.async_show_form(
            step_id=step_id, data_schema=vol.Schema(fields), errors=errors
        )

    def _name_error(self, name: str) -> str | None:
        """Names pick the goal in the active goal select, so they must differ."""
        own = self._reconfigure_subentry_id if self.source == "reconfigure" else None
        return goal_name_error(
            name,
            (
                goal.title
                for goal_id, goal in self._get_entry().subentries.items()
                if goal_id != own
            ),
        )

    async def async_step_values(
        self, user_input: dict[str, Any] | None = None
    ) -> SubentryFlowResult:
        """Start, end and either the target weight or the weekly rate."""
        rate_mode = self._goal.get(CONF_GOAL_MODE) == MODE_RATE
        errors: dict[str, str] = {}
        if user_input is not None:
            goal = {**self._goal, **user_input}
            goal.pop(CONF_RATE_PER_WEEK if not rate_mode else CONF_TARGET_WEIGHT, None)
            if goal_weeks(
                parse_date(goal.get(CONF_START_DATE)),
                parse_date(goal.get(CONF_END_DATE)),
            ) is None:
                errors[CONF_END_DATE] = "invalid_dates"
            else:
                return self._async_finish(normalise_goal(goal))

        entry = self._get_entry()
        manager = getattr(entry, "runtime_data", None)
        current = None if manager is None else manager.current_weight
        minimum = float(entry.options.get(CONF_MIN_WEIGHT, DEFAULT_MIN_WEIGHT))
        maximum = float(entry.options.get(CONF_MAX_WEIGHT, DEFAULT_MAX_WEIGHT))

        def suggested(key: str, fallback: Any = None) -> dict[str, Any]:
            value = self._goal.get(key, fallback)
            return {} if value is None else {"suggested_value": value}

        fields: dict[Any, Any] = {
            vol.Required(
                CONF_START_WEIGHT,
                description=suggested(CONF_START_WEIGHT, current),
            ): _number(minimum, maximum, 0.1, "kg"),
            vol.Required(
                CONF_START_DATE,
                description=suggested(CONF_START_DATE, dt_util.now().date().isoformat()),
            ): DateSelector(),
            vol.Required(
                CONF_END_DATE, description=suggested(CONF_END_DATE)
            ): DateSelector(),
        }
        if rate_mode:
            fields[
                vol.Required(
                    CONF_RATE_PER_WEEK, description=suggested(CONF_RATE_PER_WEEK)
                )
            ] = _number(-RATE_LIMIT_PER_WEEK, RATE_LIMIT_PER_WEEK, 0.01, "kg/w")
        else:
            fields[
                vol.Required(
                    CONF_TARGET_WEIGHT, description=suggested(CONF_TARGET_WEIGHT)
                )
            ] = _number(minimum, maximum, 0.1, "kg")
        return self.async_show_form(
            step_id="values", data_schema=vol.Schema(fields), errors=errors
        )

    @callback
    def _async_finish(self, goal: dict[str, Any]) -> SubentryFlowResult:
        if self.source == "reconfigure":
            return self.async_update_and_abort(
                self._get_entry(),
                self._get_reconfigure_subentry(),
                title=self._name,
                data=goal,
            )
        return self.async_create_entry(
            title=self._name, data={**goal, CONF_ACTIVATE: self._activate}
        )
