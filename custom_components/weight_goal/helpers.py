"""Pure helpers for the Road to Weight Goal integration.

Everything in this module is free of Home Assistant state so it can be unit
tested on its own.
"""

from __future__ import annotations

from collections.abc import Iterable, Mapping
from datetime import date, datetime, time, timedelta, tzinfo
from typing import Any

from homeassistant.util import dt as dt_util

from .const import (
    ACTIVE_GOAL_NONE,
    CONF_END_DATE,
    CONF_GOAL_MODE,
    CONF_RATE_PER_WEEK,
    CONF_START_DATE,
    CONF_START_WEIGHT,
    CONF_TARGET_WEIGHT,
    DEFAULT_GOAL_MODE,
    DIRECTION_GAIN,
    DIRECTION_LOSE,
    DIRECTION_MAINTAIN,
    MODE_RATE,
)

#: A goal whose start and target differ by less than this is a "maintain" goal.
MAINTAIN_EPSILON = 0.01


def wall_clock(day: date, zone: tzinfo, at: time | None = None) -> datetime:
    """Return an aware datetime for a wall clock time on ``day``.

    Daylight saving handling:

    * Times that do not exist (the clock jumps over them) are moved forward to
      the first time that does exist on that day.
    * Ambiguous times (the clock passes them twice) resolve to the first
      occurrence, so a scheduled point in time fires exactly once.
    """
    wanted = datetime.combine(day, at or time.min)

    for offset_minutes in range(0, 24 * 60, 5):
        candidate_naive = wanted + timedelta(minutes=offset_minutes)
        if candidate_naive.date() != day and offset_minutes:
            break
        candidate = candidate_naive.replace(tzinfo=zone, fold=0)
        # A non-existent local time does not survive a UTC round trip.
        round_trip = candidate.astimezone(dt_util.UTC).astimezone(zone)
        if round_trip.replace(tzinfo=None) == candidate_naive:
            return candidate

    # Should not happen for any real time zone; fall back to plain attachment.
    return wanted.replace(tzinfo=zone, fold=0)


def next_local_midnight(now: datetime, zone: tzinfo) -> datetime:
    """Return the next wall clock midnight strictly after ``now``."""
    local_now = now.astimezone(zone)
    candidate = wall_clock(local_now.date(), zone)
    if candidate > now:
        return candidate
    return wall_clock(local_now.date() + timedelta(days=1), zone)


def parse_date(value: str | date | None) -> date | None:
    """Parse an ISO date, tolerating ``None`` and already parsed values."""
    if value is None:
        return None
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value
    try:
        return date.fromisoformat(value)
    except (TypeError, ValueError):
        return None


def goal_weeks(start: date | None, end: date | None) -> float | None:
    """Return the goal length in weeks, or ``None`` if the range is invalid.

    The end day counts towards the goal in full, so the span is one day longer
    than the plain difference. This is the same span
    :func:`planned_weight` interpolates over, which keeps the derived rate and
    the plotted plan line consistent.

    Calendar days are used rather than a fixed number of seconds, so a daylight
    saving change inside the range does not shift the result.
    """
    if start is None or end is None:
        return None
    if (end - start).days < 1:
        return None
    return ((end - start).days + 1) / 7


def goal_name_error(name: str, taken: Iterable[str]) -> str | None:
    """Why a goal name cannot be used, or ``None`` when it can.

    Names pick the goal in the active goal select, so they must differ from
    the other goals of the person, ignoring case, and from the option that
    stands for no goal. The key doubles as flow error and exception key.
    """
    if not name:
        return "invalid_name"
    if name.casefold() == ACTIVE_GOAL_NONE:
        return "reserved_name"
    if any(name.casefold() == other.casefold() for other in taken):
        return "name_taken"
    return None


def normalise_goal(goal: Mapping[str, Any]) -> dict[str, Any]:
    """Fill in the derived value so start, target, rate and dates agree.

    Whichever of target weight and rate the goal mode names is the input; the
    other one is computed from it, so the two can never drift apart. Without a
    start weight or a valid range there is nothing to derive from, and the goal
    is returned as it is.
    """
    merged = dict(goal)
    start_weight = merged.get(CONF_START_WEIGHT)
    weeks = goal_weeks(
        parse_date(merged.get(CONF_START_DATE)),
        parse_date(merged.get(CONF_END_DATE)),
    )
    if start_weight is None or weeks is None:
        return merged

    if merged.get(CONF_GOAL_MODE, DEFAULT_GOAL_MODE) == MODE_RATE:
        rate = merged.get(CONF_RATE_PER_WEEK)
        if rate is not None:
            merged[CONF_TARGET_WEIGHT] = round(
                float(start_weight) + float(rate) * weeks, 3
            )
    else:
        target = merged.get(CONF_TARGET_WEIGHT)
        if target is not None:
            merged[CONF_RATE_PER_WEEK] = round(
                (float(target) - float(start_weight)) / weeks, 4
            )
    return merged


def direction_of(start_weight: float, target_weight: float) -> str:
    """Classify the goal direction."""
    delta = target_weight - start_weight
    if delta < -MAINTAIN_EPSILON:
        return DIRECTION_LOSE
    if delta > MAINTAIN_EPSILON:
        return DIRECTION_GAIN
    return DIRECTION_MAINTAIN


def direction_sign(direction: str) -> int:
    """Return +1 for gaining, -1 for losing and 0 for maintaining."""
    if direction == DIRECTION_GAIN:
        return 1
    if direction == DIRECTION_LOSE:
        return -1
    return 0


def planned_weight(
    start_weight: float,
    target_weight: float,
    start: date,
    end: date,
    moment: datetime,
    zone: tzinfo,
) -> float:
    """Return the planned weight at ``moment``.

    The plan is a straight line between wall clock midnight of the start day and
    wall clock midnight of the day *after* the end day, so the whole end day
    counts towards the goal. The fraction is clamped to ``[0, 1]``.
    """
    begin = wall_clock(start, zone)
    finish = wall_clock(end + timedelta(days=1), zone)
    span = (finish - begin).total_seconds()
    if span <= 0:
        return target_weight
    fraction = (moment - begin).total_seconds() / span
    fraction = min(1.0, max(0.0, fraction))
    return start_weight + (target_weight - start_weight) * fraction


def linear_rate(
    first: tuple[datetime, float], last: tuple[datetime, float]
) -> float | None:
    """Return the change per day between two measurements."""
    seconds = (last[0] - first[0]).total_seconds()
    if seconds <= 0:
        return None
    return (last[1] - first[1]) / (seconds / 86400)
