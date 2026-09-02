"""Wall clock handling across daylight saving changes."""

from __future__ import annotations

from datetime import date, datetime, time, timedelta

import pytest
from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.weight_goal.helpers import (
    goal_weeks,
    next_local_midnight,
    planned_weight,
    wall_clock,
)


def zone(name: str):
    """Load a time zone synchronously; fine outside the event loop."""
    return dt_util.get_time_zone(name)


def test_wall_clock_is_local_midnight() -> None:
    """Midnight means midnight on the wall, not in UTC."""
    berlin = zone("Europe/Berlin")
    moment = wall_clock(date(2026, 7, 1), berlin)
    assert moment.hour == 0
    assert moment.astimezone(dt_util.UTC).hour == 22  # CEST is UTC+2


def test_wall_clock_across_the_spring_change() -> None:
    """An hour disappears, but midnight itself is unaffected in Berlin."""
    berlin = zone("Europe/Berlin")
    # Arithmetic between two aware datetimes in the same zone is naive by
    # design, so the real elapsed time has to be measured in UTC.
    utc = lambda day: wall_clock(day, berlin).astimezone(dt_util.UTC)  # noqa: E731

    assert utc(date(2026, 3, 29)) - utc(date(2026, 3, 28)) == timedelta(hours=24)
    # The day the clocks go forward is one hour shorter.
    assert utc(date(2026, 3, 30)) - utc(date(2026, 3, 29)) == timedelta(hours=23)


def test_non_existent_time_moves_to_the_first_valid_one() -> None:
    """Where midnight itself is skipped, the first valid time is used.

    Lord Howe Island shifts at 02:00, so an explicit 02:30 on the change day
    does not exist and has to move forward.
    """
    lord_howe = zone("Australia/Lord_Howe")
    moment = wall_clock(date(2026, 10, 4), lord_howe, time(2, 30))
    # Round tripping through UTC must give back the same wall clock time.
    assert moment.astimezone(dt_util.UTC).astimezone(lord_howe) == moment
    assert moment.hour >= 2


def test_ambiguous_time_resolves_to_the_first_occurrence() -> None:
    """A repeated wall clock time fires once, on its first pass."""
    berlin = zone("Europe/Berlin")
    moment = wall_clock(date(2026, 10, 25), berlin, time(2, 30))
    assert moment.utcoffset() == timedelta(hours=2)  # still CEST


def test_next_local_midnight_is_strictly_in_the_future() -> None:
    """The daily timer never schedules itself into the past."""
    berlin = zone("Europe/Berlin")
    now = datetime(2026, 7, 1, 0, 0, tzinfo=berlin).astimezone(dt_util.UTC)
    nxt = next_local_midnight(now, berlin)
    assert nxt > now
    assert nxt.astimezone(berlin).date() == date(2026, 7, 2)


def test_goal_weeks_counts_the_end_day() -> None:
    """A Monday to Sunday goal is one week, not six sevenths."""
    assert goal_weeks(date(2026, 3, 2), date(2026, 3, 8)) == 1.0
    assert goal_weeks(date(2026, 3, 2), date(2026, 3, 1)) is None
    assert goal_weeks(date(2026, 3, 2), date(2026, 3, 2)) is None
    assert goal_weeks(None, date(2026, 3, 2)) is None


def test_planned_weight_is_not_shifted_by_a_dst_change() -> None:
    """A plan spanning the spring change still ends exactly on target."""
    berlin = zone("Europe/Berlin")
    start = date(2026, 3, 1)
    end = date(2026, 4, 30)
    finish = wall_clock(end + timedelta(days=1), berlin)
    assert planned_weight(80.0, 75.0, start, end, finish, berlin) == pytest.approx(75.0)
    begin = wall_clock(start, berlin)
    assert planned_weight(80.0, 75.0, start, end, begin, berlin) == pytest.approx(80.0)


def test_planned_weight_is_clamped_outside_the_range() -> None:
    """Before the start and after the end the plan holds its value."""
    berlin = zone("Europe/Berlin")
    start = date(2026, 3, 1)
    end = date(2026, 4, 30)
    early = wall_clock(date(2026, 1, 1), berlin)
    late = wall_clock(date(2026, 12, 1), berlin)
    assert planned_weight(80.0, 75.0, start, end, early, berlin) == 80.0
    assert planned_weight(80.0, 75.0, start, end, late, berlin) == 75.0


async def test_timers_are_rearmed_on_a_time_zone_change(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, mock_entry: MockConfigEntry
) -> None:
    """Changing the core time zone reschedules everything."""
    await hass.config.async_set_time_zone("UTC")
    freezer.move_to(datetime(2026, 3, 1, 12, 0, tzinfo=dt_util.UTC))

    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()

    manager = mock_entry.runtime_data
    before = manager._timers["rollover"]  # noqa: SLF001 - internal on purpose

    await hass.config.async_update(time_zone="Pacific/Auckland")
    await hass.async_block_till_done()

    assert manager._timers["rollover"] is not before  # noqa: SLF001
    assert manager.zone.key == "Pacific/Auckland"
