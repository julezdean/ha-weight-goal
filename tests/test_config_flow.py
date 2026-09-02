"""Config flow tests."""

from __future__ import annotations

from homeassistant import config_entries
from homeassistant.const import CONF_NAME
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.weight_goal.const import (
    CONF_GOAL_MODE,
    CONF_MAX_WEIGHT,
    CONF_MIN_WEIGHT,
    CONF_OVERDUE_DAYS,
    CONF_RECALCULATION_INTERVAL,
    CONF_SCRIPT_GOAL_REACHED,
    CONF_SOURCE_ENTITY,
    CONF_TOLERANCE,
    CONF_TREND_WINDOW_DAYS,
    DOMAIN,
    MODE_RATE,
    MODE_TARGET,
)


async def test_user_flow_creates_entry(hass: HomeAssistant) -> None:
    """A name and a mode are enough to create an entry."""
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    assert result["type"] is FlowResultType.FORM
    assert result["step_id"] == "user"

    result = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        {
            CONF_NAME: "Julien",
            CONF_SOURCE_ENTITY: "sensor.scale",
            CONF_GOAL_MODE: MODE_TARGET,
        },
    )
    await hass.async_block_till_done()

    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert result["title"] == "Julien"
    assert result["options"][CONF_SOURCE_ENTITY] == "sensor.scale"
    assert result["options"][CONF_GOAL_MODE] == MODE_TARGET
    assert result["options"][CONF_MIN_WEIGHT] == 20.0
    assert result["options"][CONF_MAX_WEIGHT] == 300.0


async def test_user_flow_without_source(hass: HomeAssistant) -> None:
    """The weight source is optional; manual entry is always available."""
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {CONF_NAME: "Alex", CONF_GOAL_MODE: MODE_RATE}
    )
    await hass.async_block_till_done()

    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert CONF_SOURCE_ENTITY not in result["options"]


async def test_duplicate_name_aborts(hass: HomeAssistant) -> None:
    """The same name cannot be added twice."""
    MockConfigEntry(
        domain=DOMAIN, title="Julien", data={CONF_NAME: "Julien"}, options={}
    ).add_to_hass(hass)

    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {CONF_NAME: "Julien", CONF_GOAL_MODE: MODE_TARGET}
    )
    assert result["type"] is FlowResultType.ABORT
    assert result["reason"] == "already_configured"


async def test_empty_name_shows_error(hass: HomeAssistant) -> None:
    """A blank name is rejected with a field error, not an exception."""
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {CONF_NAME: "   ", CONF_GOAL_MODE: MODE_TARGET}
    )
    assert result["type"] is FlowResultType.FORM
    assert result["errors"] == {CONF_NAME: "invalid_name"}


async def test_options_settings(hass: HomeAssistant, mock_entry: MockConfigEntry) -> None:
    """Settings are written into the options."""
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()

    result = await hass.config_entries.options.async_init(mock_entry.entry_id)
    assert result["type"] is FlowResultType.MENU

    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"next_step_id": "settings"}
    )
    assert result["step_id"] == "settings"

    result = await hass.config_entries.options.async_configure(
        result["flow_id"],
        {
            CONF_GOAL_MODE: MODE_RATE,
            CONF_MIN_WEIGHT: 30.0,
            CONF_MAX_WEIGHT: 200.0,
            CONF_TOLERANCE: 1.0,
            CONF_TREND_WINDOW_DAYS: 14,
            CONF_OVERDUE_DAYS: 0,
            "max_jump": 0.0,
            CONF_RECALCULATION_INTERVAL: 0,
        },
    )
    await hass.async_block_till_done()

    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert mock_entry.options[CONF_TOLERANCE] == 1.0
    assert mock_entry.options[CONF_TREND_WINDOW_DAYS] == 14
    assert mock_entry.options[CONF_GOAL_MODE] == MODE_RATE


async def test_options_rejects_inverted_range(
    hass: HomeAssistant, mock_entry: MockConfigEntry
) -> None:
    """A minimum above the maximum is refused."""
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()

    result = await hass.config_entries.options.async_init(mock_entry.entry_id)
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"next_step_id": "settings"}
    )
    result = await hass.config_entries.options.async_configure(
        result["flow_id"],
        {
            CONF_GOAL_MODE: MODE_TARGET,
            CONF_MIN_WEIGHT: 200.0,
            CONF_MAX_WEIGHT: 30.0,
            CONF_TOLERANCE: 0.5,
            CONF_TREND_WINDOW_DAYS: 7,
            CONF_OVERDUE_DAYS: 3,
            "max_jump": 0.0,
            CONF_RECALCULATION_INTERVAL: 0,
        },
    )
    assert result["type"] is FlowResultType.FORM
    assert result["errors"] == {"base": "invalid_range"}


async def test_options_actions(hass: HomeAssistant, mock_entry: MockConfigEntry) -> None:
    """Script actions are stored and can be cleared again."""
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()

    result = await hass.config_entries.options.async_init(mock_entry.entry_id)
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"next_step_id": "actions"}
    )
    result = await hass.config_entries.options.async_configure(
        result["flow_id"],
        {CONF_SCRIPT_GOAL_REACHED: [{"service": "persistent_notification.create",
                                     "data": {"message": "done"}}]},
    )
    await hass.async_block_till_done()
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert CONF_SCRIPT_GOAL_REACHED in mock_entry.options
