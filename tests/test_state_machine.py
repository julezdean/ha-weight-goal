"""Every transition of the state machine."""

from __future__ import annotations

from datetime import datetime, timedelta

import pytest
from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_fire_time_changed,
)

from custom_components.weight_goal.const import (
    CONF_END_DATE,
    CONF_RATE_PER_WEEK,
    CONF_START_DATE,
    CONF_START_WEIGHT,
    CONF_TARGET_WEIGHT,
    CONF_TOLERANCE,
    DIRECTION_GAIN,
    DIRECTION_LOSE,
    DIRECTION_MAINTAIN,
    EVENT_GOAL_ENDED,
    EVENT_GOAL_REACHED,
    EVENT_STATUS_CHANGED,
    STATUS_AHEAD,
    STATUS_BEHIND,
    STATUS_ENDED,
    STATUS_NO_GOAL,
    STATUS_ON_TRACK,
    STATUS_REACHED,
)

from .conftest import make_entry

#: 1 March 2026, 12:00 local. The default goal runs from 1 March to 9 May,
#: 80 kg down to 75 kg, which is exactly 10 weeks at -0.5 kg per week.
START = datetime(2026, 3, 1, 12, 0, tzinfo=dt_util.UTC)


@pytest.fixture
async def frozen(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> FrozenDateTimeFactory:
    """Freeze the clock at the start of the goal and pin the time zone.

    The wall clock handling is tested separately in test_time.py; here a fixed
    zone keeps the expected numbers readable.
    """
    await hass.config.async_set_time_zone("UTC")
    freezer.move_to(START)
    return freezer


def status(hass: HomeAssistant) -> str:
    """Read the status sensor."""
    return hass.states.get("sensor.julien_status").state


async def record(hass: HomeAssistant, entry: MockConfigEntry, weight: float) -> None:
    """Record a weight through the manager."""
    await entry.runtime_data.async_record_weight(weight)
    await hass.async_block_till_done()


async def test_rate_is_derived_from_the_target(
    hass: HomeAssistant, frozen, mock_entry: MockConfigEntry
) -> None:
    """The end day counts in full, so ten weeks give exactly -0.5 kg/week."""
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()
    assert hass.states.get("number.julien_rate_per_week").state == "-0.5"


async def test_no_goal_when_the_range_is_invalid(hass: HomeAssistant, frozen) -> None:
    """An end date before the start date is refused, not silently clamped."""
    entry = make_entry(hass, **{CONF_END_DATE: "2026-02-01"})
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    assert status(hass) == STATUS_NO_GOAL
    assert hass.states.get("sensor.julien_target_weight_today").state == "unknown"


async def test_no_goal_to_on_track(
    hass: HomeAssistant, frozen, mock_entry: MockConfigEntry
) -> None:
    """A first measurement on plan puts the goal on track."""
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()
    await record(hass, mock_entry, 80.0)
    assert status(hass) == STATUS_ON_TRACK


async def test_on_track_to_ahead_and_back(
    hass: HomeAssistant, frozen, mock_entry: MockConfigEntry
) -> None:
    """Ahead needs the full tolerance, returning needs half of it."""
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()

    await record(hass, mock_entry, 80.0)
    assert status(hass) == STATUS_ON_TRACK

    await record(hass, mock_entry, 79.4)  # 0.6 kg below plan, tolerance is 0.5
    assert status(hass) == STATUS_AHEAD

    # Hysteresis: 0.4 kg below plan is inside the tolerance but outside half of
    # it, so the status stays.
    await record(hass, mock_entry, 79.6)
    assert status(hass) == STATUS_AHEAD

    await record(hass, mock_entry, 79.9)
    assert status(hass) == STATUS_ON_TRACK


async def test_on_track_to_behind(
    hass: HomeAssistant, frozen, mock_entry: MockConfigEntry
) -> None:
    """Gaining weight on a losing goal is behind."""
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()

    await record(hass, mock_entry, 80.0)
    await record(hass, mock_entry, 81.0)
    assert status(hass) == STATUS_BEHIND


async def test_direction_is_respected_for_a_gaining_goal(
    hass: HomeAssistant, frozen
) -> None:
    """The same deviation means the opposite thing when gaining."""
    entry = make_entry(
        hass, **{CONF_START_WEIGHT: 60.0, CONF_TARGET_WEIGHT: 65.0}
    )
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    assert entry.runtime_data.direction == DIRECTION_GAIN
    await entry.runtime_data.async_record_weight(61.0)
    await hass.async_block_till_done()
    assert status(hass) == STATUS_AHEAD

    await entry.runtime_data.async_record_weight(59.0)
    await hass.async_block_till_done()
    assert status(hass) == STATUS_BEHIND


async def test_maintain_goal_uses_the_absolute_deviation(
    hass: HomeAssistant, frozen
) -> None:
    """A maintain goal has no ahead; any drift beyond tolerance is behind."""
    entry = make_entry(hass, **{CONF_START_WEIGHT: 75.0, CONF_TARGET_WEIGHT: 75.0})
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    assert entry.runtime_data.direction == DIRECTION_MAINTAIN
    await entry.runtime_data.async_record_weight(75.2)
    await hass.async_block_till_done()
    assert status(hass) == STATUS_ON_TRACK

    await entry.runtime_data.async_record_weight(76.5)
    await hass.async_block_till_done()
    assert status(hass) == STATUS_BEHIND

    await entry.runtime_data.async_record_weight(73.0)
    await hass.async_block_till_done()
    assert status(hass) == STATUS_BEHIND


async def test_reached_fires_once(
    hass: HomeAssistant, frozen, mock_entry: MockConfigEntry
) -> None:
    """Hitting the target reports reached and fires exactly one event."""
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()

    events = []
    hass.bus.async_listen(EVENT_GOAL_REACHED, events.append)

    await record(hass, mock_entry, 75.0)
    assert status(hass) == STATUS_REACHED
    assert len(events) == 1

    await record(hass, mock_entry, 74.5)
    assert status(hass) == STATUS_REACHED
    assert len(events) == 1


async def test_reached_can_be_lost_again(
    hass: HomeAssistant, frozen, mock_entry: MockConfigEntry
) -> None:
    """Falling back out of the target re-arms the reached event."""
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()

    events = []
    hass.bus.async_listen(EVENT_GOAL_REACHED, events.append)

    await record(hass, mock_entry, 75.0)
    await record(hass, mock_entry, 79.0)
    assert status(hass) != STATUS_REACHED

    await record(hass, mock_entry, 74.0)
    assert status(hass) == STATUS_REACHED
    assert len(events) == 2


async def test_goal_end_timer(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory, mock_entry: MockConfigEntry
) -> None:
    """The end timer fires once, at midnight after the last goal day."""
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()
    await record(hass, mock_entry, 79.0)

    ended = []
    hass.bus.async_listen(EVENT_GOAL_ENDED, ended.append)

    when = datetime(2026, 5, 10, 0, 1, tzinfo=dt_util.UTC)
    frozen.move_to(when)
    async_fire_time_changed(hass, when)
    await hass.async_block_till_done()

    assert len(ended) == 1
    assert status(hass) == STATUS_ENDED


async def test_status_changed_event_carries_both_sides(
    hass: HomeAssistant, frozen, mock_entry: MockConfigEntry
) -> None:
    """The status event names the old and the new status."""
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()

    changes = []
    hass.bus.async_listen(EVENT_STATUS_CHANGED, changes.append)

    await record(hass, mock_entry, 80.0)
    await record(hass, mock_entry, 82.0)

    assert changes[-1].data["from_status"] == STATUS_ON_TRACK
    assert changes[-1].data["to_status"] == STATUS_BEHIND
    assert changes[-1].data["entry_id"] == mock_entry.entry_id


async def test_planned_weight_moves_with_the_days(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory, mock_entry: MockConfigEntry
) -> None:
    """Half way through the goal the plan is half way between the weights."""
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()

    manager = mock_entry.runtime_data
    # Half a day into a 70 day plan of -5 kg.
    assert manager.target_weight_today == pytest.approx(79.964, abs=0.005)

    # 35 of 70 days gone.
    frozen.move_to(datetime(2026, 4, 5, 0, 0, tzinfo=dt_util.UTC))
    assert manager.target_weight_today == pytest.approx(77.5, abs=0.01)


async def test_tolerance_option_changes_the_verdict(
    hass: HomeAssistant, frozen
) -> None:
    """A wider tolerance keeps the same weight on track."""
    entry = make_entry(hass, **{CONF_TOLERANCE: 2.0})
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    await entry.runtime_data.async_record_weight(81.5)
    await hass.async_block_till_done()
    assert status(hass) == STATUS_ON_TRACK


async def test_direction_attribute(
    hass: HomeAssistant, frozen, mock_entry: MockConfigEntry
) -> None:
    """The status sensor exposes the direction so cards need not guess."""
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()
    assert (
        hass.states.get("sensor.julien_status").attributes["direction"]
        == DIRECTION_LOSE
    )


async def test_start_today_leaves_the_end_date_alone(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory, mock_entry: MockConfigEntry
) -> None:
    """Pressing the button moves only the start weight and the start date."""
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()
    await record(hass, mock_entry, 78.3)

    frozen.move_to(datetime(2026, 3, 15, 9, 0, tzinfo=dt_util.UTC))
    # Two steps: the first press only stages the change.
    for entity_id in (
        "button.julien_start_today",
        "button.julien_confirm_start_today",
    ):
        await hass.services.async_call(
            "button", "press", {"entity_id": entity_id}, blocking=True
        )
    await hass.async_block_till_done()

    assert mock_entry.options[CONF_START_DATE] == "2026-03-15"
    assert mock_entry.options[CONF_START_WEIGHT] == 78.3
    assert mock_entry.options[CONF_END_DATE] == "2026-05-09"
    # The rate follows from the shortened remaining range.
    assert mock_entry.options[CONF_RATE_PER_WEEK] == pytest.approx(-0.4125, abs=0.0001)


async def test_implausible_and_jumping_values_are_rejected(
    hass: HomeAssistant, frozen
) -> None:
    """Out of range values never reach the history, and 0 disables the jump filter."""
    entry = make_entry(hass, max_jump=3.0)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    manager = entry.runtime_data

    assert await manager.async_record_weight(80.0) is True
    assert await manager.async_record_weight(0.0) is False
    assert await manager.async_record_weight(900.0) is False
    assert await manager.async_record_weight(90.0) is False  # jump of 10 kg
    assert await manager.async_record_weight(81.5) is True
    assert [m.weight for m in manager.measurements] == [80.0, 81.5]


async def test_source_sensor_unavailability_does_not_become_zero(
    hass: HomeAssistant, frozen, source_entry: MockConfigEntry
) -> None:
    """The bug that poisoned the YAML history cannot happen here."""
    hass.states.async_set("sensor.scale", "79.2")
    assert await hass.config_entries.async_setup(source_entry.entry_id)
    await hass.async_block_till_done()
    assert source_entry.runtime_data.current_weight == 79.2

    hass.states.async_set("sensor.scale", "unavailable")
    await hass.async_block_till_done()
    hass.states.async_set("sensor.scale", "unknown")
    await hass.async_block_till_done()

    assert source_entry.runtime_data.current_weight == 79.2
    assert hass.states.get("sensor.julien_weight").state == "79.2"


async def test_trend_zero_does_not_kill_the_projection(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory
) -> None:
    """Switching the trend off must not take the projection with it.

    The projection deliberately uses its own window. This is the coupling the
    brief warned about, so it gets its own test.
    """
    entry = make_entry(hass, trend_window_days=0)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    manager = entry.runtime_data

    await manager.async_record_weight(80.0)
    frozen.move_to(START + timedelta(days=7))
    await manager.async_record_weight(79.3)
    await hass.async_block_till_done()

    assert manager.trend is None
    assert hass.states.get("sensor.julien_trend").state == "unavailable"
    assert manager.projected_date is not None
    assert hass.states.get("sensor.julien_projected_date").state != "unknown"


async def test_weight_and_time_progress_are_independent(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory, mock_entry: MockConfigEntry
) -> None:
    """One says how far the weight has come, the other how far the clock has."""
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()
    manager = mock_entry.runtime_data

    # Half a day into a 70 day goal.
    assert manager.time_progress == pytest.approx(0.71, abs=0.05)

    await record(hass, mock_entry, 77.5)
    # 2.5 of 5 kg done.
    assert manager.weight_progress == pytest.approx(50.0, abs=0.01)

    # 35 of 70 days gone.
    frozen.move_to(datetime(2026, 4, 5, 0, 0, tzinfo=dt_util.UTC))
    assert manager.time_progress == pytest.approx(50.0, abs=0.01)
    assert manager.weight_progress == pytest.approx(50.0, abs=0.01)


async def test_weight_progress_is_clamped(
    hass: HomeAssistant, frozen, mock_entry: MockConfigEntry
) -> None:
    """Overshooting reads as 100, moving backwards as 0."""
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()
    manager = mock_entry.runtime_data

    await record(hass, mock_entry, 70.0)
    assert manager.weight_progress == 100.0

    await record(hass, mock_entry, 85.0)
    assert manager.weight_progress == 0.0


async def test_time_progress_is_clamped_at_both_ends(
    hass: HomeAssistant, frozen: FrozenDateTimeFactory, mock_entry: MockConfigEntry
) -> None:
    """Before the start it is 0, after the end it is 100."""
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()
    manager = mock_entry.runtime_data

    frozen.move_to(datetime(2026, 1, 1, 12, 0, tzinfo=dt_util.UTC))
    assert manager.time_progress == 0.0

    frozen.move_to(datetime(2026, 8, 1, 12, 0, tzinfo=dt_util.UTC))
    assert manager.time_progress == 100.0


async def test_progress_is_unknown_without_a_goal(hass: HomeAssistant, frozen) -> None:
    """No goal, no percentages."""
    entry = make_entry(hass, **{CONF_END_DATE: "2026-02-01"})
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    assert entry.runtime_data.time_progress is None
    assert entry.runtime_data.weight_progress is None
    assert hass.states.get("sensor.julien_time_progress").state == "unknown"


async def test_weight_progress_is_unknown_for_a_maintain_goal(
    hass: HomeAssistant, frozen
) -> None:
    """Start equals target, so there is no share to compute."""
    entry = make_entry(hass, **{CONF_START_WEIGHT: 75.0, CONF_TARGET_WEIGHT: 75.0})
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    await entry.runtime_data.async_record_weight(75.0)
    await hass.async_block_till_done()

    assert entry.runtime_data.weight_progress is None
    # Time still runs, though.
    assert entry.runtime_data.time_progress is not None
