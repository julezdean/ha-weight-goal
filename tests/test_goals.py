"""The goal list: adding, changing, switching and removing goals."""

from __future__ import annotations

from datetime import datetime, timedelta

import pytest
from freezegun.api import FrozenDateTimeFactory
from homeassistant import config_entries
from homeassistant.const import CONF_NAME
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType
from homeassistant.exceptions import ServiceValidationError
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_capture_events,
    async_fire_time_changed,
)

from custom_components.weight_goal.const import (
    CONF_ACTIVATE,
    CONF_ACTIVE_GOAL,
    CONF_END_DATE,
    CONF_GOAL_MODE,
    CONF_RATE_PER_WEEK,
    CONF_START_DATE,
    CONF_START_WEIGHT,
    CONF_TARGET_WEIGHT,
    CONF_TOLERANCE,
    DOMAIN,
    EVENT_GOAL_ENDED,
    MODE_RATE,
    MODE_TARGET,
    SERVICE_CREATE_GOAL,
    SERVICE_GET_MEASUREMENTS,
    STATUS_AHEAD,
    STATUS_ENDED,
    STATUS_NO_GOAL,
    STATUS_UPCOMING,
    STORAGE_VERSION,
    SUBENTRY_GOAL,
)

from .conftest import GOAL_ID, goal_data, make_entry

#: 1 March 2026, 12:00. The default goal "Spring" runs from 1 March to 9 May.
START = datetime(2026, 3, 1, 12, 0, tzinfo=dt_util.UTC)
ANCHOR = {"entity_id": "sensor.julien_status"}


@pytest.fixture
async def frozen(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> FrozenDateTimeFactory:
    """Freeze the clock at the start of the default goal."""
    await hass.config.async_set_time_zone("UTC")
    freezer.move_to(START)
    return freezer


async def _setup(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()


async def _add_goal(
    hass: HomeAssistant,
    entry: MockConfigEntry,
    name: str,
    values: dict,
    *,
    mode: str = MODE_TARGET,
    activate: bool = True,
) -> dict:
    result = await hass.config_entries.subentries.async_init(
        (entry.entry_id, SUBENTRY_GOAL),
        context={"source": config_entries.SOURCE_USER},
    )
    assert result["type"] is FlowResultType.FORM
    result = await hass.config_entries.subentries.async_configure(
        result["flow_id"],
        {CONF_NAME: name, CONF_GOAL_MODE: mode, CONF_ACTIVATE: activate},
    )
    if result["type"] is not FlowResultType.FORM or result["step_id"] != "values":
        return result
    result = await hass.config_entries.subentries.async_configure(
        result["flow_id"], values
    )
    await hass.async_block_till_done()
    return result


def _goal_id(entry: MockConfigEntry, name: str) -> str:
    return next(
        goal_id for goal_id, goal in entry.subentries.items() if goal.title == name
    )


def _state(hass: HomeAssistant, entity_id: str) -> str:
    return hass.states.get(entity_id).state


SUMMER = {
    CONF_START_WEIGHT: 75.0,
    CONF_TARGET_WEIGHT: 72.0,
    CONF_START_DATE: "2026-05-10",
    CONF_END_DATE: "2026-08-01",
}


# ---------------------------------------------------------------------------
# Migration
# ---------------------------------------------------------------------------


async def test_the_single_goal_of_version_1_becomes_the_active_goal(
    hass: HomeAssistant, frozen, hass_storage
) -> None:
    """Every entity reads what it read before, and the flags come along."""
    entry = MockConfigEntry(
        domain=DOMAIN,
        title="Julien",
        data={CONF_NAME: "Julien"},
        version=1,
        entry_id="testentry",
        options={
            CONF_GOAL_MODE: MODE_TARGET,
            CONF_TOLERANCE: 0.5,
            CONF_START_WEIGHT: 78.0,
            CONF_TARGET_WEIGHT: 73.0,
            CONF_START_DATE: "2026-02-01",
            CONF_END_DATE: "2026-02-20",
        },
    )
    entry.add_to_hass(hass)
    hass_storage[f"{DOMAIN}.testentry"] = {
        "version": STORAGE_VERSION,
        "minor_version": 1,
        "key": f"{DOMAIN}.testentry",
        "data": {"measurements": [], "goal_ended_fired": True},
    }
    events = async_capture_events(hass, EVENT_GOAL_ENDED)

    await _setup(hass, entry)

    assert entry.version == 2
    assert CONF_START_WEIGHT not in entry.options
    assert CONF_GOAL_MODE not in entry.options
    assert entry.options[CONF_TOLERANCE] == 0.5
    (goal_id,) = entry.subentries
    goal = entry.subentries[goal_id]
    assert goal.title == "2026-02-01 – 2026-02-20"
    assert goal.data[CONF_TARGET_WEIGHT] == 73.0
    assert goal.data[CONF_GOAL_MODE] == MODE_TARGET
    assert entry.options[CONF_ACTIVE_GOAL] == goal_id
    assert _state(hass, "number.julien_start_weight") == "78.0"
    assert _state(hass, "select.julien_active_goal") == goal.title
    # The end was announced by the old version; it is not announced again.
    assert _state(hass, "sensor.julien_status") == STATUS_ENDED
    assert events == []


async def test_an_entry_without_a_goal_migrates_to_an_empty_list(
    hass: HomeAssistant, frozen
) -> None:
    entry = MockConfigEntry(
        domain=DOMAIN,
        title="Julien",
        data={CONF_NAME: "Julien"},
        version=1,
        options={CONF_GOAL_MODE: MODE_RATE, CONF_TOLERANCE: 0.5},
    )
    entry.add_to_hass(hass)
    await _setup(hass, entry)

    assert entry.version == 2
    assert not entry.subentries
    assert CONF_ACTIVE_GOAL not in entry.options
    assert _state(hass, "sensor.julien_status") == STATUS_NO_GOAL
    assert _state(hass, "select.julien_active_goal") == "none"
    assert _state(hass, "number.julien_target_weight") == "unavailable"


# ---------------------------------------------------------------------------
# Adding and changing goals
# ---------------------------------------------------------------------------


async def test_a_new_goal_becomes_active_by_default(
    hass: HomeAssistant, frozen, mock_entry: MockConfigEntry
) -> None:
    await _setup(hass, mock_entry)
    result = await _add_goal(
        hass,
        mock_entry,
        "Summer",
        {**SUMMER, CONF_START_DATE: "2026-03-01"},
    )
    await hass.async_block_till_done()

    assert result["type"] is FlowResultType.CREATE_ENTRY
    summer = _goal_id(mock_entry, "Summer")
    assert mock_entry.options[CONF_ACTIVE_GOAL] == summer
    # The request to become active is not kept in the goal.
    assert CONF_ACTIVATE not in goal_data(mock_entry, summer)
    assert goal_data(mock_entry, summer)[CONF_RATE_PER_WEEK] == pytest.approx(
        -3 / ((153 + 1) / 7), abs=0.0001
    )
    assert _state(hass, "number.julien_target_weight") == "72.0"
    assert _state(hass, "select.julien_active_goal") == "Summer"
    # The old goal is still in the list.
    assert GOAL_ID in mock_entry.subentries


async def test_a_past_goal_can_be_added_without_activating_it(
    hass: HomeAssistant, frozen, mock_entry: MockConfigEntry
) -> None:
    await _setup(hass, mock_entry)
    await _add_goal(
        hass,
        mock_entry,
        "Winter",
        {
            CONF_START_WEIGHT: 82.0,
            CONF_TARGET_WEIGHT: 80.0,
            CONF_START_DATE: "2025-12-01",
            CONF_END_DATE: "2026-02-15",
        },
        activate=False,
    )
    await hass.async_block_till_done()

    assert mock_entry.options[CONF_ACTIVE_GOAL] == GOAL_ID
    select = hass.states.get("select.julien_active_goal")
    assert select.state == "Spring"
    # Earliest start first, after "no goal".
    assert select.attributes["options"] == ["none", "Winter", "Spring"]
    goals = select.attributes["goals"]
    assert [goal["name"] for goal in goals] == ["Winter", "Spring"]
    assert [goal["active"] for goal in goals] == [False, True]


async def test_a_rate_goal_derives_its_target(
    hass: HomeAssistant, frozen, mock_entry: MockConfigEntry
) -> None:
    await _setup(hass, mock_entry)
    await _add_goal(
        hass,
        mock_entry,
        "Steady",
        {
            CONF_START_WEIGHT: 80.0,
            CONF_RATE_PER_WEEK: -0.5,
            CONF_START_DATE: "2026-03-01",
            CONF_END_DATE: "2026-05-09",
        },
        mode=MODE_RATE,
    )
    await hass.async_block_till_done()

    data = goal_data(mock_entry, _goal_id(mock_entry, "Steady"))
    assert data[CONF_GOAL_MODE] == MODE_RATE
    assert data[CONF_TARGET_WEIGHT] == pytest.approx(75.0)
    assert hass.states.get("sensor.julien_status").attributes["goal_mode"] == MODE_RATE


@pytest.mark.parametrize(
    ("name", "error"),
    [("spring", "name_taken"), ("None", "reserved_name"), ("  ", "invalid_name")],
)
async def test_goal_names_must_be_usable_in_the_select(
    hass: HomeAssistant, frozen, mock_entry: MockConfigEntry, name: str, error: str
) -> None:
    await _setup(hass, mock_entry)
    result = await _add_goal(hass, mock_entry, name, SUMMER)
    assert result["type"] is FlowResultType.FORM
    assert result["errors"] == {CONF_NAME: error}


async def test_the_end_must_come_after_the_start(
    hass: HomeAssistant, frozen, mock_entry: MockConfigEntry
) -> None:
    await _setup(hass, mock_entry)
    result = await _add_goal(
        hass, mock_entry, "Backwards", {**SUMMER, CONF_END_DATE: "2026-05-01"}
    )
    assert result["type"] is FlowResultType.FORM
    assert result["errors"] == {CONF_END_DATE: "invalid_dates"}


async def test_reconfigure_changes_name_and_values(
    hass: HomeAssistant, frozen, mock_entry: MockConfigEntry
) -> None:
    await _setup(hass, mock_entry)
    result = await hass.config_entries.subentries.async_init(
        (mock_entry.entry_id, SUBENTRY_GOAL),
        context={"source": config_entries.SOURCE_RECONFIGURE, "subentry_id": GOAL_ID},
    )
    assert result["step_id"] == "reconfigure"
    # Renaming a goal to its own name is not a clash.
    result = await hass.config_entries.subentries.async_configure(
        result["flow_id"], {CONF_NAME: "Spring", CONF_GOAL_MODE: MODE_RATE}
    )
    assert result["step_id"] == "values"
    result = await hass.config_entries.subentries.async_configure(
        result["flow_id"],
        {
            CONF_START_WEIGHT: 80.0,
            CONF_RATE_PER_WEEK: -0.25,
            CONF_START_DATE: "2026-03-01",
            CONF_END_DATE: "2026-05-09",
        },
    )
    await hass.async_block_till_done()

    assert result["type"] is FlowResultType.ABORT
    assert result["reason"] == "reconfigure_successful"
    data = goal_data(mock_entry)
    assert data[CONF_GOAL_MODE] == MODE_RATE
    assert data[CONF_TARGET_WEIGHT] == pytest.approx(77.5)
    assert _state(hass, "number.julien_target_weight") == "77.5"


# ---------------------------------------------------------------------------
# Switching and removing
# ---------------------------------------------------------------------------


async def test_the_select_switches_the_active_goal(
    hass: HomeAssistant, frozen, mock_entry: MockConfigEntry
) -> None:
    await _setup(hass, mock_entry)
    await _add_goal(
        hass,
        mock_entry,
        "Sprint",
        {
            CONF_START_WEIGHT: 82.0,
            CONF_TARGET_WEIGHT: 78.0,
            CONF_START_DATE: "2026-02-01",
            CONF_END_DATE: "2026-03-31",
        },
        activate=False,
    )
    await mock_entry.runtime_data.async_record_weight(79.0)
    await hass.async_block_till_done()

    await hass.services.async_call(
        "select",
        "select_option",
        {"entity_id": "select.julien_active_goal", "option": "Sprint"},
        blocking=True,
    )
    await hass.async_block_till_done()

    assert _state(hass, "number.julien_start_weight") == "82.0"
    # 82 to 78 over 59 days, 28.5 days in: the plan is at about 80.07.
    assert _state(hass, "sensor.julien_status") == STATUS_AHEAD
    assert hass.states.get("sensor.julien_status").attributes["active_goal"] == "Sprint"

    await hass.services.async_call(
        "select",
        "select_option",
        {"entity_id": "select.julien_active_goal", "option": "none"},
        blocking=True,
    )
    await hass.async_block_till_done()
    assert _state(hass, "sensor.julien_status") == STATUS_NO_GOAL
    assert _state(hass, "number.julien_start_weight") == "unavailable"
    assert len(mock_entry.subentries) == 2


async def test_removing_the_active_goal_leaves_none_active(
    hass: HomeAssistant, frozen, mock_entry: MockConfigEntry
) -> None:
    await _setup(hass, mock_entry)
    hass.config_entries.async_remove_subentry(mock_entry, GOAL_ID)
    await hass.async_block_till_done()

    assert CONF_ACTIVE_GOAL not in mock_entry.options
    assert _state(hass, "sensor.julien_status") == STATUS_NO_GOAL
    assert _state(hass, "select.julien_active_goal") == "none"


async def test_set_goal_without_an_active_goal_is_refused(
    hass: HomeAssistant, frozen, mock_entry: MockConfigEntry
) -> None:
    await _setup(hass, mock_entry)
    await mock_entry.runtime_data.async_set_active_goal(None)
    await hass.async_block_till_done()

    with pytest.raises(Exception, match="no_active_goal|No goal is active"):
        await hass.services.async_call(
            DOMAIN, "set_goal", {**ANCHOR, CONF_START_WEIGHT: 81.0}, blocking=True
        )


# ---------------------------------------------------------------------------
# Status and events per goal
# ---------------------------------------------------------------------------


async def test_a_goal_that_has_not_begun_is_upcoming(
    hass: HomeAssistant, frozen, freezer: FrozenDateTimeFactory
) -> None:
    entry = make_entry(hass, **{CONF_START_DATE: "2026-03-10"})
    await _setup(hass, entry)
    await entry.runtime_data.async_record_weight(82.0)
    await hass.async_block_till_done()

    assert _state(hass, "sensor.julien_status") == STATUS_UPCOMING
    assert _state(hass, "sensor.julien_deviation") == "unknown"
    assert _state(hass, "sensor.julien_target_weight_today") == "unknown"
    assert _state(hass, "sensor.julien_weight_progress") == "unknown"

    freezer.move_to(START + timedelta(days=9))
    await entry.runtime_data.async_refresh()
    await hass.async_block_till_done()
    assert _state(hass, "sensor.julien_status") != STATUS_UPCOMING
    assert _state(hass, "sensor.julien_target_weight_today") != "unknown"


async def test_activating_a_goal_after_its_end_does_not_announce_the_end(
    hass: HomeAssistant, frozen, mock_entry: MockConfigEntry
) -> None:
    await _setup(hass, mock_entry)
    await _add_goal(
        hass,
        mock_entry,
        "Winter",
        {
            CONF_START_WEIGHT: 82.0,
            CONF_TARGET_WEIGHT: 80.0,
            CONF_START_DATE: "2025-12-01",
            CONF_END_DATE: "2026-02-15",
        },
        activate=False,
    )
    events = async_capture_events(hass, EVENT_GOAL_ENDED)

    await mock_entry.runtime_data.async_set_active_goal(
        _goal_id(mock_entry, "Winter")
    )
    await hass.async_block_till_done()

    assert _state(hass, "sensor.julien_status") == STATUS_ENDED
    assert events == []


async def test_the_end_of_the_active_goal_is_announced_with_its_name(
    hass: HomeAssistant, frozen, freezer: FrozenDateTimeFactory, mock_entry
) -> None:
    await _setup(hass, mock_entry)
    events = async_capture_events(hass, EVENT_GOAL_ENDED)

    freezer.move_to(datetime(2026, 5, 10, 0, 0, 1, tzinfo=dt_util.UTC))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()

    assert len(events) == 1
    assert events[0].data["goal"] == "Spring"


# ---------------------------------------------------------------------------
# Outcome
# ---------------------------------------------------------------------------


async def test_an_ended_goal_reports_its_last_weight(
    hass: HomeAssistant, frozen, mock_entry: MockConfigEntry
) -> None:
    await _setup(hass, mock_entry)
    manager = mock_entry.runtime_data
    for day, weight in ((5, 80.5), (20, 79.6), (40, 79.9)):
        await manager.async_record_weight(weight, timestamp=START - timedelta(days=day))
    await _add_goal(
        hass,
        mock_entry,
        "Winter",
        {
            CONF_START_WEIGHT: 81.0,
            CONF_TARGET_WEIGHT: 79.8,
            CONF_START_DATE: "2026-01-01",
            CONF_END_DATE: "2026-02-15",
        },
        activate=False,
    )
    await hass.async_block_till_done()

    goals = {g["name"]: g for g in manager.goals_payload()}
    winter = goals["Winter"]["result"]
    # 9 February is the last reading inside 1 January to 15 February.
    assert winter["weight"] == 79.6
    assert winter["timestamp"].startswith("2026-02-09")
    assert winter["reached"] is True
    # The active goal is still running and has no outcome yet.
    assert goals["Spring"]["result"] is None

    # When its readings have aged out of the history, the remembered outcome
    # stands in.
    cutoff = datetime(2026, 2, 16, tzinfo=dt_util.UTC)
    manager._state.measurements = [
        m for m in manager._state.measurements if m.timestamp >= cutoff
    ]
    goals = {g["name"]: g for g in manager.goals_payload()}
    assert goals["Winter"]["result"]["weight"] == 79.6


async def test_get_measurements_returns_the_goals(
    hass: HomeAssistant, frozen, mock_entry: MockConfigEntry
) -> None:
    await _setup(hass, mock_entry)
    response = await hass.services.async_call(
        DOMAIN, SERVICE_GET_MEASUREMENTS, ANCHOR, blocking=True, return_response=True
    )
    (entry,) = response["entries"].values()
    assert entry["goals"] == [
        {
            "id": GOAL_ID,
            "name": "Spring",
            "active": True,
            CONF_GOAL_MODE: MODE_TARGET,
            CONF_START_WEIGHT: 80.0,
            CONF_TARGET_WEIGHT: 75.0,
            CONF_RATE_PER_WEEK: -0.5,
            CONF_START_DATE: "2026-03-01",
            CONF_END_DATE: "2026-05-09",
            "result": None,
        }
    ]


# ---------------------------------------------------------------------------
# Creating a goal from an action
# ---------------------------------------------------------------------------


async def test_create_goal_fills_in_today_and_the_latest_weight(
    hass: HomeAssistant, frozen, mock_entry: MockConfigEntry
) -> None:
    """What the dialog suggests is what the action defaults to."""
    await _setup(hass, mock_entry)
    await mock_entry.runtime_data.async_record_weight(78.4)
    await hass.async_block_till_done()

    response = await hass.services.async_call(
        DOMAIN,
        SERVICE_CREATE_GOAL,
        {**ANCHOR, CONF_NAME: "Summer", CONF_TARGET_WEIGHT: 75.0, CONF_END_DATE: "2026-06-30"},
        blocking=True,
        return_response=True,
    )
    await hass.async_block_till_done()

    summer = _goal_id(mock_entry, "Summer")
    assert response == {"goals": {mock_entry.entry_id: summer}}
    data = goal_data(mock_entry, summer)
    assert data[CONF_START_DATE] == "2026-03-01"
    assert data[CONF_START_WEIGHT] == 78.4
    assert data[CONF_GOAL_MODE] == MODE_TARGET
    assert data[CONF_RATE_PER_WEEK] == pytest.approx(-3.4 / (122 / 7), abs=0.0001)
    assert mock_entry.options[CONF_ACTIVE_GOAL] == summer
    # The goal it replaced keeps its plan.
    assert goal_data(mock_entry)[CONF_START_WEIGHT] == 80.0


async def test_create_goal_in_rate_mode_without_activating(
    hass: HomeAssistant, frozen, mock_entry: MockConfigEntry
) -> None:
    await _setup(hass, mock_entry)
    await hass.services.async_call(
        DOMAIN,
        SERVICE_CREATE_GOAL,
        {
            **ANCHOR,
            CONF_NAME: "Steady",
            CONF_GOAL_MODE: MODE_RATE,
            CONF_START_WEIGHT: 80.0,
            CONF_RATE_PER_WEEK: -0.5,
            # A target is ignored when the rate is the input.
            CONF_TARGET_WEIGHT: 60.0,
            CONF_START_DATE: "2026-03-01",
            CONF_END_DATE: "2026-05-09",
            CONF_ACTIVATE: False,
        },
        blocking=True,
    )
    await hass.async_block_till_done()

    data = goal_data(mock_entry, _goal_id(mock_entry, "Steady"))
    assert data[CONF_TARGET_WEIGHT] == pytest.approx(75.0)
    assert mock_entry.options[CONF_ACTIVE_GOAL] == GOAL_ID


@pytest.mark.parametrize(
    ("data", "message"),
    [
        ({CONF_NAME: "spring", CONF_TARGET_WEIGHT: 75.0}, "name_taken"),
        ({CONF_NAME: "none", CONF_TARGET_WEIGHT: 75.0}, "reserved_name"),
        ({CONF_NAME: "Later"}, "missing_goal_value"),
        (
            {CONF_NAME: "Later", CONF_TARGET_WEIGHT: 75.0, CONF_START_DATE: "2026-07-01"},
            "invalid_dates",
        ),
    ],
)
async def test_create_goal_refuses_what_the_dialog_refuses(
    hass: HomeAssistant, frozen, mock_entry: MockConfigEntry, data: dict, message: str
) -> None:
    await _setup(hass, mock_entry)
    with pytest.raises(ServiceValidationError) as raised:
        await hass.services.async_call(
            DOMAIN,
            SERVICE_CREATE_GOAL,
            {**ANCHOR, CONF_START_WEIGHT: 80.0, CONF_END_DATE: "2026-06-30", **data},
            blocking=True,
        )
    assert raised.value.translation_key == message
    assert len(mock_entry.subentries) == 1


async def test_create_goal_needs_a_start_weight_before_the_first_reading(
    hass: HomeAssistant, frozen, mock_entry: MockConfigEntry
) -> None:
    await _setup(hass, mock_entry)
    with pytest.raises(ServiceValidationError) as raised:
        await hass.services.async_call(
            DOMAIN,
            SERVICE_CREATE_GOAL,
            {**ANCHOR, CONF_NAME: "Summer", CONF_TARGET_WEIGHT: 75.0, CONF_END_DATE: "2026-06-30"},
            blocking=True,
        )
    assert raised.value.translation_key == "no_start_weight"


async def test_the_retired_start_today_buttons_are_removed(
    hass: HomeAssistant, frozen, mock_entry: MockConfigEntry, entity_registry
) -> None:
    """Left behind by 0.11.0-beta.1, they would show as no longer provided."""
    for key in ("start_today", "confirm_start_today"):
        entity_registry.async_get_or_create(
            "button",
            DOMAIN,
            f"{mock_entry.entry_id}_{key}",
            config_entry=mock_entry,
            suggested_object_id=f"julien_{key}",
        )
    await _setup(hass, mock_entry)

    assert entity_registry.async_get("button.julien_start_today") is None
    assert entity_registry.async_get("button.julien_confirm_start_today") is None
    assert entity_registry.async_get("button.julien_record_weight") is not None
