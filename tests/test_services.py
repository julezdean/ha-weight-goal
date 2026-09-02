"""Service tests."""

from __future__ import annotations

from datetime import datetime

import pytest
from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ServiceValidationError
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.weight_goal.const import (
    CONF_END_DATE,
    CONF_GOAL_MODE,
    CONF_RATE_PER_WEEK,
    CONF_START_DATE,
    CONF_START_WEIGHT,
    CONF_TARGET_WEIGHT,
    DOMAIN,
    MODE_RATE,
    SERVICE_GET_MEASUREMENTS,
    SERVICE_IGNORE_LAST_MEASUREMENT,
    SERVICE_RECORD_WEIGHT,
    SERVICE_RESET_GOAL,
    SERVICE_SET_GOAL,
    STATUS_NO_GOAL,
)

from .conftest import make_entry

START = datetime(2026, 3, 1, 12, 0, tzinfo=dt_util.UTC)
ANCHOR = {"entity_id": "sensor.julien_status"}


@pytest.fixture
async def frozen(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> FrozenDateTimeFactory:
    """Freeze the clock and pin the time zone."""
    await hass.config.async_set_time_zone("UTC")
    freezer.move_to(START)
    return freezer


async def test_services_are_registered(
    hass: HomeAssistant, frozen, mock_entry: MockConfigEntry
) -> None:
    """All documented services exist."""
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()
    for service in (
        SERVICE_RECORD_WEIGHT,
        SERVICE_SET_GOAL,
        SERVICE_RESET_GOAL,
        SERVICE_IGNORE_LAST_MEASUREMENT,
        SERVICE_GET_MEASUREMENTS,
    ):
        assert hass.services.has_service(DOMAIN, service)


async def test_record_weight(
    hass: HomeAssistant, frozen, mock_entry: MockConfigEntry
) -> None:
    """A weight can be recorded from an automation."""
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()

    await hass.services.async_call(
        DOMAIN, SERVICE_RECORD_WEIGHT, {**ANCHOR, "weight": 79.4}, blocking=True
    )
    await hass.async_block_till_done()

    assert hass.states.get("sensor.julien_weight").state == "79.4"
    assert mock_entry.runtime_data.last_measurement.source == "service"


async def test_record_weight_with_timestamp(
    hass: HomeAssistant, frozen, mock_entry: MockConfigEntry
) -> None:
    """Backdated measurements land in the right place in the history."""
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()

    await hass.services.async_call(
        DOMAIN, SERVICE_RECORD_WEIGHT, {**ANCHOR, "weight": 80.0}, blocking=True
    )
    await hass.services.async_call(
        DOMAIN,
        SERVICE_RECORD_WEIGHT,
        {**ANCHOR, "weight": 81.0, "timestamp": "2026-02-20T08:00:00+00:00"},
        blocking=True,
    )
    await hass.async_block_till_done()

    weights = [m.weight for m in mock_entry.runtime_data.measurements]
    assert weights == [81.0, 80.0]
    assert mock_entry.runtime_data.current_weight == 80.0


async def test_set_goal_is_atomic(
    hass: HomeAssistant, frozen, mock_entry: MockConfigEntry
) -> None:
    """Several goal values change in one write, with the rate derived once."""
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()

    await hass.services.async_call(
        DOMAIN,
        SERVICE_SET_GOAL,
        {
            **ANCHOR,
            CONF_START_WEIGHT: 90.0,
            CONF_TARGET_WEIGHT: 83.0,
            CONF_START_DATE: "2026-03-01",
            CONF_END_DATE: "2026-04-04",
        },
        blocking=True,
    )
    await hass.async_block_till_done()

    assert mock_entry.options[CONF_START_WEIGHT] == 90.0
    assert mock_entry.options[CONF_TARGET_WEIGHT] == 83.0
    # 35 days including the last one, so exactly five weeks.
    assert mock_entry.options[CONF_RATE_PER_WEEK] == pytest.approx(-1.4)


async def test_set_goal_refuses_the_derived_value(
    hass: HomeAssistant, frozen, mock_entry: MockConfigEntry
) -> None:
    """In target mode the rate is calculated and cannot be set."""
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()

    with pytest.raises(ServiceValidationError):
        await hass.services.async_call(
            DOMAIN,
            SERVICE_SET_GOAL,
            {**ANCHOR, CONF_RATE_PER_WEEK: -0.75},
            blocking=True,
        )


async def test_rate_mode_derives_the_target(hass: HomeAssistant, frozen) -> None:
    """In rate mode the target weight follows from the rate."""
    entry = make_entry(hass, **{CONF_GOAL_MODE: MODE_RATE, CONF_RATE_PER_WEEK: -0.7})
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    await hass.services.async_call(
        DOMAIN, SERVICE_SET_GOAL, {**ANCHOR, CONF_RATE_PER_WEEK: -0.8}, blocking=True
    )
    await hass.async_block_till_done()

    # Ten weeks at -0.8 kg from 80 kg.
    assert entry.options[CONF_TARGET_WEIGHT] == pytest.approx(72.0)
    assert hass.states.get("number.julien_target_weight").state == "72.0"


async def test_target_number_is_read_only_in_rate_mode(
    hass: HomeAssistant, frozen
) -> None:
    """Writing the derived number entity raises a clear error."""
    entry = make_entry(hass, **{CONF_GOAL_MODE: MODE_RATE, CONF_RATE_PER_WEEK: -0.5})
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    with pytest.raises(ServiceValidationError):
        await hass.services.async_call(
            "number",
            "set_value",
            {"entity_id": "number.julien_target_weight", "value": 70.0},
            blocking=True,
        )


async def test_reset_goal_keeps_the_measurements(
    hass: HomeAssistant, frozen, mock_entry: MockConfigEntry
) -> None:
    """Resetting clears the goal but not the recorded weights."""
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()
    await mock_entry.runtime_data.async_record_weight(80.0)
    await hass.async_block_till_done()

    await hass.services.async_call(DOMAIN, SERVICE_RESET_GOAL, ANCHOR, blocking=True)
    await hass.async_block_till_done()

    assert hass.states.get("sensor.julien_status").state == STATUS_NO_GOAL
    assert hass.states.get("sensor.julien_weight").state == "80.0"
    assert CONF_TARGET_WEIGHT not in mock_entry.options


async def test_ignore_last_measurement(
    hass: HomeAssistant, frozen, mock_entry: MockConfigEntry
) -> None:
    """A bad reading can be taken out of the trend and the status."""
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()
    await mock_entry.runtime_data.async_record_weight(80.0)
    await mock_entry.runtime_data.async_record_weight(120.0)
    await hass.async_block_till_done()
    assert mock_entry.runtime_data.current_weight == 120.0

    await hass.services.async_call(
        DOMAIN, SERVICE_IGNORE_LAST_MEASUREMENT, ANCHOR, blocking=True
    )
    await hass.async_block_till_done()

    assert mock_entry.runtime_data.current_weight == 80.0


async def test_get_measurements_returns_a_response(
    hass: HomeAssistant, frozen, mock_entry: MockConfigEntry
) -> None:
    """The card can read the internal history through a response service."""
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()
    await mock_entry.runtime_data.async_record_weight(80.0)
    await hass.async_block_till_done()

    response = await hass.services.async_call(
        DOMAIN,
        SERVICE_GET_MEASUREMENTS,
        ANCHOR,
        blocking=True,
        return_response=True,
    )
    entries = response["entries"]
    assert mock_entry.entry_id in entries
    measurements = entries[mock_entry.entry_id]["measurements"]
    assert measurements[0]["weight"] == 80.0
    assert measurements[0]["source"] == "manual"


async def test_service_without_a_matching_target(
    hass: HomeAssistant, frozen, mock_entry: MockConfigEntry
) -> None:
    """Targeting a foreign entity is refused instead of silently doing nothing."""
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()
    hass.states.async_set("sensor.somewhere_else", "1")

    with pytest.raises(ServiceValidationError):
        await hass.services.async_call(
            DOMAIN,
            SERVICE_RECORD_WEIGHT,
            {"entity_id": "sensor.somewhere_else", "weight": 80.0},
            blocking=True,
        )
