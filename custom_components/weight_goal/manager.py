"""Runtime manager for a single Road to Weight Goal config entry.

The manager owns everything that is not an entity: the measurement history,
the timers, the derived values and the state machine. Entities read from it and
write through it.

There is deliberately no ``DataUpdateCoordinator`` here. Nothing is polled: the
manager reacts to state changes of the source entity and to a small number of
scheduled points in time.
"""

from __future__ import annotations

import logging
from collections.abc import Iterable
from dataclasses import dataclass, field
from datetime import date, datetime, timedelta, tzinfo
from typing import Any

from homeassistant.config_entries import ConfigEntry, ConfigSubentry
from homeassistant.const import (
    EVENT_CORE_CONFIG_UPDATE,
    STATE_UNAVAILABLE,
    STATE_UNKNOWN,
)
from homeassistant.core import CALLBACK_TYPE, Event, HomeAssistant, callback
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.event import (
    async_track_point_in_time,
    async_track_state_change_event,
)
from homeassistant.helpers.script import Script
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .const import (
    ARM_TIMEOUT_SECONDS,
    CATCHUP_GRACE_HOURS,
    CONF_ACTIVATE,
    CONF_ACTIVE_GOAL,
    CONF_END_DATE,
    CONF_GOAL_MODE,
    CONF_ALLOW_MANUAL,
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
    DEFAULT_GOAL_MODE,
    DEFAULT_ALLOW_MANUAL,
    DEFAULT_MAX_JUMP,
    DEFAULT_MAX_WEIGHT,
    DEFAULT_MIN_WEIGHT,
    DEFAULT_OVERDUE_DAYS,
    DEFAULT_RECALCULATION_INTERVAL,
    DEFAULT_TOLERANCE,
    DEFAULT_TREND_WINDOW_DAYS,
    DOMAIN,
    EVENT_GOAL_ENDED,
    EVENT_GOAL_REACHED,
    EVENT_MEASUREMENT_OVERDUE,
    EVENT_MEASUREMENT_RECORDED,
    EVENT_STATUS_CHANGED,
    KEY_WEIGHT,
    MANUAL_BACKDATE_TIME,
    MAX_MEASUREMENTS,
    MAX_PROJECTION_DAYS,
    PROJECTION_WINDOW_DAYS,
    RETENTION_DAYS,
    SOURCE_IMPORT,
    SOURCE_MANUAL,
    SOURCE_SENSOR,
    SOURCE_SERVICE,
    SOURCE_STATISTICS,
    STATUS_AHEAD,
    STATUS_BEHIND,
    STATUS_ENDED,
    STATUS_NO_GOAL,
    STATUS_ON_TRACK,
    STATUS_REACHED,
    STATUS_UPCOMING,
    STORAGE_VERSION,
    SUBENTRY_GOAL,
)
from .helpers import (
    direction_of,
    direction_sign,
    goal_weeks,
    linear_rate,
    next_local_midnight,
    normalise_goal,
    parse_date,
    planned_weight,
    wall_clock,
)

_LOGGER = logging.getLogger(__name__)

#: Bumped when stored measurements need a one-off fix on load. 1: daily means
#: imported before 0.10.0 get their own source, see ``mark_daily_means``.
HISTORY_REVISION = 1


@dataclass
class Measurement:
    """A single recorded weight."""

    timestamp: datetime
    weight: float
    source: str

    def as_dict(self) -> dict[str, Any]:
        """Serialise for storage and for the service response."""
        return {
            "timestamp": self.timestamp.isoformat(),
            "weight": self.weight,
            "source": self.source,
        }

    @classmethod
    def from_dict(cls, raw: dict[str, Any]) -> Measurement | None:
        """Restore from storage, dropping unreadable rows."""
        stamp = dt_util.parse_datetime(raw.get("timestamp", ""))
        if stamp is None:
            return None
        try:
            weight = float(raw["weight"])
        except (KeyError, TypeError, ValueError):
            return None
        return cls(stamp, weight, raw.get("source", SOURCE_SENSOR))


@dataclass
class StoredState:
    """Everything that has to survive a restart."""

    measurements: list[Measurement] = field(default_factory=list)
    manual_weight: float | None = None
    manual_pending: bool = False
    manual_date: str | None = None
    status: str = STATUS_NO_GOAL
    #: Per goal, keyed by subentry id: which one off events have fired. Kept
    #: per goal so switching back to an old goal does not announce its end
    #: or its success a second time.
    goal_flags: dict[str, dict[str, bool]] = field(default_factory=dict)
    #: Per goal: the last weight inside its period, kept for when the
    #: measurements it came from have aged out of the history.
    goal_results: dict[str, dict[str, Any]] = field(default_factory=dict)
    overdue_fired_for: str | None = None
    last_rollover: str | None = None
    last_source_entity: str | None = None
    last_source_weight: float | None = None


#: Sources that are the weight sensor speaking, live or replayed from the
#: recorder. Only these can echo: the same value twice in a row from them is the
#: sensor reconnecting or Home Assistant restarting, not a second weigh-in.
_ECHOING_SOURCES = frozenset({SOURCE_SENSOR, SOURCE_IMPORT})

#: Sources that make a day "measured", so a daily mean for it is not needed.
#: Manual entries are left out on purpose: typing a weight by hand does not
#: say the scale was silent that day.
_DAY_COVERING_SOURCES = frozenset({SOURCE_SENSOR, SOURCE_IMPORT, SOURCE_SERVICE})


def _same(a: float, b: float) -> bool:
    return abs(a - b) < 1e-6


def tidy_history(measurements: list[Measurement], zone: tzinfo) -> list[Measurement]:
    """The history without echoes and without daily means it does not need.

    Expects the list oldest first. Drops, in this order:

    * a sensor or imported reading that repeats the previous one of either,
      which older versions recorded on every reconnect and restart, and which
      the recorder states that ``import_history`` reads are full of;
    * a daily mean for a day that has a reading of its own;
    * a daily mean that repeats the value before it, which is a day the sensor
      stood still rather than a day with a weigh-in.

    Manual entries and readings from automations are never touched.
    """
    kept: list[Measurement] = []
    previous: float | None = None
    for item in measurements:
        if item.source in _ECHOING_SOURCES:
            if previous is not None and _same(item.weight, previous):
                continue
            previous = item.weight
        kept.append(item)

    covered = {
        m.timestamp.astimezone(zone).date()
        for m in kept
        if m.source in _DAY_COVERING_SOURCES
    }
    result: list[Measurement] = []
    previous = None
    for item in kept:
        if item.source == SOURCE_STATISTICS and (
            item.timestamp.astimezone(zone).date() in covered
            or (previous is not None and _same(item.weight, previous))
        ):
            continue
        if item.source != SOURCE_MANUAL:
            previous = item.weight
        result.append(item)
    return result


def mark_daily_means(measurements: list[Measurement], zone: tzinfo) -> int:
    """Give daily means imported by older versions their own source.

    Before 0.10.0 a daily mean from the statistics was stored as ``import``,
    like a recorded state. The statistics start each day at local midnight, to
    the microsecond, and a recorded state practically never does, so that is
    what tells them apart. Uses the zone Home Assistant has now; a mean from
    before a time zone change is not recognised and simply stays an import.
    Returns how many were marked.
    """
    marked = 0
    for item in measurements:
        if item.source != SOURCE_IMPORT:
            continue
        local = item.timestamp.astimezone(zone)
        if (local.hour, local.minute, local.second, local.microsecond) == (0, 0, 0, 0):
            item.source = SOURCE_STATISTICS
            marked += 1
    return marked


class WeightGoalManager:
    """Owns the runtime state of one config entry."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        """Initialise the manager."""
        self.hass = hass
        self.entry = entry
        self._store = Store[dict[str, Any]](
            hass, STORAGE_VERSION, f"{DOMAIN}.{entry.entry_id}"
        )
        self._state = StoredState()
        self._listeners: list[CALLBACK_TYPE] = []
        self._unsubscribers: list[CALLBACK_TYPE] = []
        self._timers: dict[str, CALLBACK_TYPE] = {}
        self._start_today_armed_until: datetime | None = None
        self._ceiling_logged = False

    # ------------------------------------------------------------------
    # Options access
    # ------------------------------------------------------------------

    def _option(self, key: str, default: Any) -> Any:
        value = self.entry.options.get(key, default)
        return default if value is None else value

    @property
    def source_entity(self) -> str | None:
        """Entity id of the weight source, if any."""
        value = self.entry.options.get(CONF_SOURCE_ENTITY)
        return value or None

    @property
    def goal_mode(self) -> str:
        """Which of target weight and rate is the input of the active goal."""
        return self._goal_value(CONF_GOAL_MODE) or DEFAULT_GOAL_MODE

    @property
    def min_weight(self) -> float:
        """Lower plausibility bound."""
        return float(self._option(CONF_MIN_WEIGHT, DEFAULT_MIN_WEIGHT))

    @property
    def max_weight(self) -> float:
        """Upper plausibility bound."""
        return float(self._option(CONF_MAX_WEIGHT, DEFAULT_MAX_WEIGHT))

    @property
    def tolerance(self) -> float:
        """Half width of the on track band, in kg."""
        return float(self._option(CONF_TOLERANCE, DEFAULT_TOLERANCE))

    @property
    def trend_window_days(self) -> int:
        """Trend window in days. Zero switches the trend sensor off."""
        return int(self._option(CONF_TREND_WINDOW_DAYS, DEFAULT_TREND_WINDOW_DAYS))

    @property
    def overdue_days(self) -> int:
        """Days without a measurement before the overdue event. Zero is off."""
        return int(self._option(CONF_OVERDUE_DAYS, DEFAULT_OVERDUE_DAYS))

    @property
    def max_jump(self) -> float:
        """Reject measurements further than this from the previous one. Zero is off."""
        return float(self._option(CONF_MAX_JUMP, DEFAULT_MAX_JUMP))

    @property
    def manual_entry_enabled(self) -> bool:
        """Whether the manual weight entity accepts values.

        With a scale connected, manual entry is normally off: an accidental
        value is easy to produce and hard to remove. Without a scale it stays
        on regardless of the option, because otherwise there would be no way to
        record anything at all.
        """
        if not self.source_entity:
            return True
        return bool(self._option(CONF_ALLOW_MANUAL, DEFAULT_ALLOW_MANUAL))

    @property
    def recalculation_interval(self) -> int:
        """Extra recalculation interval in minutes. Zero is off."""
        return int(
            self._option(CONF_RECALCULATION_INTERVAL, DEFAULT_RECALCULATION_INTERVAL)
        )

    # ------------------------------------------------------------------
    # Goals
    # ------------------------------------------------------------------

    @property
    def goals(self) -> list[ConfigSubentry]:
        """Every goal of this person, earliest start first."""
        goals = [
            sub
            for sub in self.entry.subentries.values()
            if sub.subentry_type == SUBENTRY_GOAL
        ]
        return sorted(
            goals,
            key=lambda sub: (str(sub.data.get(CONF_START_DATE) or ""), sub.title),
        )

    @property
    def active_goal(self) -> ConfigSubentry | None:
        """The goal everything is computed against, if one is active."""
        goal_id = self.entry.options.get(CONF_ACTIVE_GOAL)
        goal = self.entry.subentries.get(goal_id) if goal_id else None
        if goal is None or goal.subentry_type != SUBENTRY_GOAL:
            return None
        return goal

    def _goal_value(self, key: str) -> Any:
        goal = self.active_goal
        return None if goal is None else goal.data.get(key)

    def _goal_number(self, key: str) -> float | None:
        raw = self._goal_value(key)
        return None if raw is None else float(raw)

    @property
    def start_weight(self) -> float | None:
        """Start weight of the active goal."""
        return self._goal_number(CONF_START_WEIGHT)

    @property
    def target_weight(self) -> float | None:
        """Configured or derived target weight of the active goal."""
        return self._goal_number(CONF_TARGET_WEIGHT)

    @property
    def rate_per_week(self) -> float | None:
        """Configured or derived weekly rate of the active goal."""
        return self._goal_number(CONF_RATE_PER_WEEK)

    @property
    def start_date(self) -> date | None:
        """Start date of the active goal."""
        return parse_date(self._goal_value(CONF_START_DATE))

    @property
    def end_date(self) -> date | None:
        """End date of the active goal."""
        return parse_date(self._goal_value(CONF_END_DATE))

    @property
    def started(self) -> bool:
        """Whether the active goal has begun.

        Before its first day there is no plan to be measured against: the line
        would sit flat on the start weight and call a weight from before the
        goal ahead or behind of it.
        """
        start = self.start_date
        return start is not None and dt_util.now(self.zone).date() >= start

    def _goal_flag(self, name: str) -> bool:
        goal = self.active_goal
        if goal is None:
            return False
        return bool(self._state.goal_flags.get(goal.subentry_id, {}).get(name))

    def _set_goal_flag(self, name: str, value: bool) -> None:
        goal = self.active_goal
        if goal is not None:
            self._state.goal_flags.setdefault(goal.subentry_id, {})[name] = value

    def goal_result(self, goal: ConfigSubentry) -> dict[str, Any] | None:
        """How a goal came out, once its last day is over.

        The weight is the last one recorded inside the goal period. When the
        history no longer reaches back that far the value remembered from an
        earlier look is used instead.
        """
        data = goal.data
        start = parse_date(data.get(CONF_START_DATE))
        end = parse_date(data.get(CONF_END_DATE))
        start_weight = data.get(CONF_START_WEIGHT)
        target = data.get(CONF_TARGET_WEIGHT)
        if start is None or end is None or start_weight is None or target is None:
            return None
        if dt_util.now(self.zone).date() <= end:
            return None

        begin = wall_clock(start, self.zone)
        finish = wall_clock(end + timedelta(days=1), self.zone)
        inside = [
            m for m in self._state.measurements if begin <= m.timestamp < finish
        ]
        if inside:
            result = {
                "weight": inside[-1].weight,
                "timestamp": inside[-1].timestamp.isoformat(),
            }
            self._state.goal_results[goal.subentry_id] = result
        else:
            result = self._state.goal_results.get(goal.subentry_id)
        if result is None:
            return None

        weight = float(result["weight"])
        sign = direction_sign(direction_of(float(start_weight), float(target)))
        if sign == 0:
            reached = abs(weight - float(target)) <= self.tolerance
        else:
            reached = (float(target) - weight) * sign <= 0
        return {**result, "reached": reached}

    def goals_payload(self) -> list[dict[str, Any]]:
        """Every goal with its values and its outcome, for cards and services."""
        active = self.active_goal
        return [
            {
                "id": goal.subentry_id,
                "name": goal.title,
                "active": active is not None
                and goal.subentry_id == active.subentry_id,
                CONF_GOAL_MODE: goal.data.get(CONF_GOAL_MODE, DEFAULT_GOAL_MODE),
                CONF_START_WEIGHT: goal.data.get(CONF_START_WEIGHT),
                CONF_TARGET_WEIGHT: goal.data.get(CONF_TARGET_WEIGHT),
                CONF_RATE_PER_WEEK: goal.data.get(CONF_RATE_PER_WEEK),
                CONF_START_DATE: goal.data.get(CONF_START_DATE),
                CONF_END_DATE: goal.data.get(CONF_END_DATE),
                "result": self.goal_result(goal),
            }
            for goal in self.goals
        ]

    @property
    def manual_weight(self) -> float | None:
        """Value currently held in the manual weight entity."""
        return self._state.manual_weight

    @property
    def manual_pending(self) -> bool:
        """Whether the manual weight is a draft waiting to be confirmed."""
        return self._state.manual_pending

    @property
    def manual_date(self) -> date:
        """Day the staged weight will be recorded for.

        Today unless a day was explicitly staged. "Today" is resolved on every
        read rather than stored, so the field is correct after midnight without
        anything having to reset it; the rollover timer writes the new state.
        """
        staged = parse_date(self._state.manual_date)
        return staged if staged is not None else dt_util.now(self.zone).date()

    # ------------------------------------------------------------------
    # Derived values
    # ------------------------------------------------------------------

    @property
    def zone(self) -> tzinfo:
        """Time zone Home Assistant is configured for.

        ``dt_util.async_get_time_zone`` is a coroutine and cannot be used from
        the synchronous properties below. ``get_default_time_zone`` returns the
        zone Home Assistant already resolved from its core configuration, and
        ``EVENT_CORE_CONFIG_UPDATE`` re-arms every timer when it changes.
        """
        return dt_util.get_default_time_zone()

    @property
    def measurements(self) -> list[Measurement]:
        """The internal measurement history, oldest first."""
        return list(self._state.measurements)

    @property
    def last_measurement(self) -> Measurement | None:
        """Most recent measurement, if any."""
        if not self._state.measurements:
            return None
        return self._state.measurements[-1]

    @property
    def current_weight(self) -> float | None:
        """Most recently recorded weight."""
        last = self.last_measurement
        return None if last is None else last.weight

    @property
    def has_goal(self) -> bool:
        """Whether a usable goal is configured."""
        return (
            self.start_weight is not None
            and self.target_weight is not None
            and goal_weeks(self.start_date, self.end_date) is not None
        )

    @property
    def direction(self) -> str | None:
        """Goal direction, or ``None`` without a goal."""
        if not self.has_goal:
            return None
        return direction_of(self.start_weight, self.target_weight)

    def planned_weight_at(self, moment: datetime) -> float | None:
        """Planned weight at a point in time."""
        if not self.has_goal:
            return None
        return planned_weight(
            self.start_weight,
            self.target_weight,
            self.start_date,
            self.end_date,
            moment,
            self.zone,
        )

    @property
    def target_weight_today(self) -> float | None:
        """Planned weight right now; unknown before the goal begins."""
        if not self.started:
            return None
        return self.planned_weight_at(dt_util.utcnow())

    @property
    def deviation(self) -> float | None:
        """Current weight minus planned weight."""
        planned = self.target_weight_today
        current = self.current_weight
        if planned is None or current is None:
            return None
        return current - planned

    @property
    def trend(self) -> float | None:
        """Weight change across the configured trend window."""
        if self.trend_window_days <= 0:
            return None
        return self._change_over(self.trend_window_days)

    @property
    def remaining(self) -> float | None:
        """Weight still to go, never negative."""
        if not self.has_goal or self.current_weight is None:
            return None
        sign = direction_sign(self.direction)
        if sign == 0:
            return abs(self.current_weight - self.target_weight)
        return max(0.0, (self.target_weight - self.current_weight) * sign)

    @property
    def weight_progress(self) -> float | None:
        """Share of the planned weight change already achieved, in percent.

        Clamped to 0-100, so overshooting the target reads as 100. Undefined
        for a maintain goal, where start and target are the same, and before
        the goal begins, when nothing done so far belongs to it.
        """
        if not self.has_goal or not self.started or self.current_weight is None:
            return None
        span = self.target_weight - self.start_weight
        if abs(span) < 1e-9:
            return None
        done = (self.current_weight - self.start_weight) / span
        return min(100.0, max(0.0, done * 100))

    @property
    def time_progress(self) -> float | None:
        """Share of the goal period that has elapsed, in percent.

        Read together with :attr:`weight_progress` this answers "am I on
        schedule" in percent, the same question :attr:`deviation` answers in
        kilograms.
        """
        if not self.has_goal:
            return None
        begin = wall_clock(self.start_date, self.zone)
        finish = wall_clock(self.end_date + timedelta(days=1), self.zone)
        span = (finish - begin).total_seconds()
        if span <= 0:
            return None
        elapsed = (dt_util.utcnow() - begin).total_seconds() / span
        return min(100.0, max(0.0, elapsed * 100))

    @property
    def projected_date(self) -> datetime | None:
        """When the target is reached at the current pace.

        Uses its own fixed window so switching the trend sensor off does not
        take the projection down with it.
        """
        if not self.has_goal or self.current_weight is None:
            return None
        sign = direction_sign(self.direction)
        if sign == 0:
            return None
        window = self._window(PROJECTION_WINDOW_DAYS)
        if len(window) < 2:
            return None
        per_day = linear_rate(
            (window[0].timestamp, window[0].weight),
            (window[-1].timestamp, window[-1].weight),
        )
        if per_day is None or per_day * sign <= 0:
            return None
        remaining = self.remaining
        if remaining is None:
            return None
        if remaining <= 0:
            return dt_util.utcnow()
        days = remaining / abs(per_day)
        if days > MAX_PROJECTION_DAYS:
            return None
        return dt_util.utcnow() + timedelta(days=days)

    @property
    def status(self) -> str:
        """Current status of the state machine."""
        return self._state.status

    def _window(self, days: int) -> list[Measurement]:
        cutoff = dt_util.utcnow() - timedelta(days=days)
        return [m for m in self._state.measurements if m.timestamp >= cutoff]

    def _change_over(self, days: int) -> float | None:
        window = self._window(days)
        if len(window) < 2:
            return None
        return window[-1].weight - window[0].weight

    # ------------------------------------------------------------------
    # State machine
    # ------------------------------------------------------------------

    def _evaluate_status(self) -> str:
        """Compute the status from the current facts and the previous status."""
        if not self.has_goal:
            return STATUS_NO_GOAL
        if not self.started:
            return STATUS_UPCOMING

        today = dt_util.now(self.zone).date()
        if today > self.end_date:
            return STATUS_ENDED

        current = self.current_weight
        if current is None:
            return STATUS_ON_TRACK if self._state.status == STATUS_NO_GOAL else (
                self._state.status if self._state.status != STATUS_ENDED else STATUS_ON_TRACK
            )

        sign = direction_sign(self.direction)
        if sign != 0 and (self.target_weight - current) * sign <= 0:
            return STATUS_REACHED

        deviation = self.deviation
        if deviation is None:
            return STATUS_ON_TRACK

        band = self.tolerance
        if sign == 0:
            return STATUS_ON_TRACK if abs(deviation) <= band else STATUS_BEHIND

        ahead_metric = deviation * sign
        if ahead_metric > band:
            return STATUS_AHEAD
        if ahead_metric < -band:
            return STATUS_BEHIND
        return STATUS_ON_TRACK

    async def async_refresh(self, *, fire_events: bool = True) -> None:
        """Recompute the status, emit follow ups and notify entities."""
        previous = self._state.status
        new_status = self._evaluate_status()

        if new_status != previous:
            self._state.status = new_status
            if fire_events:
                await self._async_dispatch(
                    EVENT_STATUS_CHANGED,
                    {"from_status": previous, "to_status": new_status},
                    CONF_SCRIPT_STATUS_CHANGED,
                )

        if new_status == STATUS_REACHED and not self._goal_flag("reached"):
            self._set_goal_flag("reached", True)
            if fire_events:
                await self._async_dispatch(
                    EVENT_GOAL_REACHED,
                    {
                        "weight": self.current_weight,
                        "target_weight": self.target_weight,
                    },
                    CONF_SCRIPT_GOAL_REACHED,
                )
        elif new_status not in (STATUS_REACHED, STATUS_ENDED):
            self._set_goal_flag("reached", False)

        # Looked at here so the remembered outcome of every goal stays current
        # while its readings are still in the history.
        for goal in self.goals:
            self.goal_result(goal)

        await self._async_save()
        self._notify()

    # ------------------------------------------------------------------
    # Measurements
    # ------------------------------------------------------------------

    async def async_stage_manual_weight(self, weight: float) -> None:
        """Hold a manually typed weight without recording it yet.

        Typing a number into an entity is easy to do by accident, so nothing
        reaches the history until the confirm button is pressed.
        """
        self._state.manual_weight = weight
        self._state.manual_pending = True
        await self._async_save()
        self._notify()

    async def async_stage_manual_date(self, day: date) -> None:
        """Hold the day the staged weight belongs to.

        A day in the future is refused rather than clamped: the field exists to
        catch up on readings, and silently turning tomorrow into today would
        record a measurement nobody asked for.

        Today is stored as "no day", so the field keeps following the calendar
        instead of freezing on the date it was set.
        """
        today = dt_util.now(self.zone).date()
        if day > today:
            raise ServiceValidationError(
                translation_domain=DOMAIN, translation_key="date_in_the_future"
            )
        self._state.manual_date = None if day == today else day.isoformat()
        await self._async_save()
        self._notify()

    def _manual_timestamp(self) -> datetime | None:
        """When a staged weight would be recorded, or ``None`` for now.

        Today keeps the current time: a reading taken this morning should not
        claim to be from noon, and a noon stamp written at 07:00 would sit in
        the future.
        """
        day = self.manual_date
        if day >= dt_util.now(self.zone).date():
            return None
        return wall_clock(day, self.zone, MANUAL_BACKDATE_TIME)

    async def async_confirm_manual_weight(self) -> bool:
        """Record the staged weight. Returns ``False`` when there is none."""
        if not self._state.manual_pending or self._state.manual_weight is None:
            return False
        weight = self._state.manual_weight
        stamp = self._manual_timestamp()
        staged_day = self._state.manual_date
        self._state.manual_pending = False
        # Cleared before recording, not after: recording saves on its way out,
        # so a day left standing here would be written to storage again and
        # come back after a restart. The day belonged to this one reading.
        self._state.manual_date = None
        recorded = await self.async_record_weight(
            weight, timestamp=stamp, source=SOURCE_MANUAL
        )
        if not recorded:
            # Rejected as implausible; leave it staged so the user can correct it.
            self._state.manual_pending = True
            self._state.manual_date = staged_day
            self._notify()
        return recorded

    async def async_record_weight(
        self,
        weight: float,
        *,
        timestamp: datetime | None = None,
        source: str = SOURCE_MANUAL,
    ) -> bool:
        """Record a measurement. Returns ``False`` when it was rejected."""
        stamp = dt_util.as_utc(timestamp) if timestamp else dt_util.utcnow()

        if not self.min_weight <= weight <= self.max_weight:
            _LOGGER.warning(
                "%s: ignoring implausible weight %.2f (outside %.1f-%.1f)",
                self.entry.title,
                weight,
                self.min_weight,
                self.max_weight,
            )
            return False

        previous = self._preceding(stamp)
        if previous is not None:
            if self.max_jump > 0 and abs(weight - previous.weight) > self.max_jump:
                _LOGGER.warning(
                    "%s: ignoring weight %.2f, jump of %.2f exceeds the configured "
                    "maximum of %.2f",
                    self.entry.title,
                    weight,
                    abs(weight - previous.weight),
                    self.max_jump,
                )
                return False
            if (
                abs(previous.weight - weight) < 1e-9
                and abs((stamp - previous.timestamp).total_seconds()) < 1
            ):
                return False

        entry = Measurement(stamp, weight, source)
        self._state.measurements.append(entry)
        self._state.measurements.sort(key=lambda m: m.timestamp)
        self._trim()
        if self._state.measurements and self._state.measurements[-1] is entry:
            # Only a reading that is now the newest one ends the silence. A
            # reading entered for an earlier day leaves the gap where it is,
            # and re-arming the reminder for it would report the same overdue
            # measurement twice.
            self._state.overdue_fired_for = None

        await self._async_dispatch(
            EVENT_MEASUREMENT_RECORDED,
            {"weight": weight, "timestamp": stamp.isoformat(), "source": source},
            CONF_SCRIPT_MEASUREMENT,
        )
        self._schedule_overdue()
        await self.async_refresh()
        return True

    def _preceding(self, stamp: datetime) -> Measurement | None:
        """The measurement a new one at ``stamp`` would follow.

        Not simply the newest one: a reading entered for an earlier day is
        judged against its own neighbour, not against today's weight. Otherwise
        catching up on a reading from months ago would trip the jump guard for
        exactly the distance the goal has made since.
        """
        earlier = [m for m in self._state.measurements if m.timestamp <= stamp]
        return earlier[-1] if earlier else None

    @property
    def weight_entity_id(self) -> str | None:
        """Entity id of our own weight sensor, from the registry.

        Resolved through the registry rather than guessed, so a user who
        renamed the entity still gets their statistics in the right place.
        """
        registry = er.async_get(self.hass)
        return registry.async_get_entity_id(
            "sensor", DOMAIN, f"{self.entry.entry_id}_{KEY_WEIGHT}"
        )

    def merge_measurements(
        self,
        points: list[tuple[datetime, float]],
        *,
        source: str = SOURCE_IMPORT,
        replace: bool = False,
    ) -> int:
        """Merge historical points into the internal history.

        Returns the number of points that were actually added. Existing
        measurements win on a collision unless ``replace`` is set, so running an
        import twice does not duplicate anything and does not overwrite values
        that were entered by hand.
        """
        existing: dict[int, Measurement] = {
            int(m.timestamp.timestamp() // 60): m for m in self._state.measurements
        }
        added = 0
        for moment, weight in points:
            stamp = dt_util.as_utc(moment)
            key = int(stamp.timestamp() // 60)
            if key in existing and not replace:
                continue
            if key in existing and existing[key].source == SOURCE_MANUAL:
                # Never overwrite something the user typed in.
                continue
            existing[key] = Measurement(stamp, weight, source)
            added += 1

        self._state.measurements = sorted(existing.values(), key=lambda m: m.timestamp)
        self._trim()
        return added

    def tidy(self) -> int:
        """Apply ``tidy_history`` to the stored history; returns how many went."""
        before = len(self._state.measurements)
        self._state.measurements = tidy_history(self._state.measurements, self.zone)
        return before - len(self._state.measurements)

    def _trim(self) -> None:
        """Drop what is older than the retention, and enforce the ceiling."""
        cutoff = dt_util.utcnow() - timedelta(days=RETENTION_DAYS)
        kept = [m for m in self._state.measurements if m.timestamp >= cutoff]
        if len(kept) > MAX_MEASUREMENTS:
            if not self._ceiling_logged:
                _LOGGER.warning(
                    "%s: more than %d measurements in %d days, dropping the oldest. "
                    "The source probably reports far more often than a scale would",
                    self.entry.title,
                    MAX_MEASUREMENTS,
                    RETENTION_DAYS,
                )
                self._ceiling_logged = True
            kept = kept[-MAX_MEASUREMENTS:]
        self._state.measurements = kept

    async def async_delete_measurement(
        self, moment: datetime, tolerance: timedelta
    ) -> Measurement | None:
        """Remove the measurement closest to ``moment`` within ``tolerance``.

        Returns the removed measurement, or ``None`` when nothing matched. The
        recorder keeps its own copy, so the point stays in the short term
        history graph; the trend, the projection and the status stop using it.
        """
        target = dt_util.as_utc(moment)
        best: Measurement | None = None
        for candidate in self._state.measurements:
            distance = abs(candidate.timestamp - target)
            if distance > tolerance:
                continue
            if best is None or distance < abs(best.timestamp - target):
                best = candidate
        if best is None:
            return None

        self._state.measurements.remove(best)
        if best.source == SOURCE_MANUAL and not any(
            m.source == SOURCE_MANUAL for m in self._state.measurements
        ):
            self._state.manual_weight = None
            self._state.manual_pending = False
            self._state.manual_date = None
        self._schedule_overdue()
        await self.async_refresh()
        return best

    async def async_ignore_last_measurement(self) -> bool:
        """Drop the most recent measurement from the internal history.

        The recorder keeps its own copy, so the point stays visible in long
        term history graphs; only the trend, the projection and the status stop
        using it.
        """
        if not self._state.measurements:
            return False
        self._state.measurements.pop()
        self._schedule_overdue()
        await self.async_refresh()
        return True

    # ------------------------------------------------------------------
    # Goal configuration
    # ------------------------------------------------------------------

    async def async_set_goal(self, **changes: Any) -> None:
        """Change values of the active goal atomically and normalise them."""
        goal = self.active_goal
        if goal is None:
            raise ServiceValidationError(
                translation_domain=DOMAIN, translation_key="no_active_goal"
            )
        data = dict(goal.data)
        for key, value in changes.items():
            if isinstance(value, date) and not isinstance(value, datetime):
                data[key] = value.isoformat()
            else:
                data[key] = value
        self.hass.config_entries.async_update_subentry(
            self.entry, goal, data=normalise_goal(data)
        )

    async def async_reset_goal(self) -> None:
        """Leave the goal list without an active goal.

        The goal itself stays in the list, with its outcome; removing it is
        what deleting the goal is for.
        """
        await self.async_set_active_goal(None)

    async def async_set_active_goal(self, goal_id: str | None) -> None:
        """Make another goal the active one, or none."""
        if goal_id is not None:
            goal = self.entry.subentries.get(goal_id)
            if goal is None or goal.subentry_type != SUBENTRY_GOAL:
                raise ServiceValidationError(
                    translation_domain=DOMAIN, translation_key="unknown_goal"
                )
        options = dict(self.entry.options)
        if goal_id is None:
            options.pop(CONF_ACTIVE_GOAL, None)
        else:
            options[CONF_ACTIVE_GOAL] = goal_id
        self.hass.config_entries.async_update_entry(self.entry, options=options)

    def _tidy_goals(self) -> bool:
        """Settle what goal flows and deletions left behind.

        A new goal asks to become active through a flag in its data, because
        its id is unknown until its flow has finished. A deleted goal can leave
        the active id pointing nowhere, and its remembered state behind.
        Returns whether the entry was changed, in which case another update is
        on its way.
        """
        changed = False
        options = dict(self.entry.options)
        for goal in self.goals:
            # Normalised as well: the flows always do, so a goal that is not
            # comes from a hand edit, and the entities should never show a
            # target and a rate that disagree.
            data = normalise_goal(goal.data)
            if data.pop(CONF_ACTIVATE, False):
                options[CONF_ACTIVE_GOAL] = goal.subentry_id
            if data != dict(goal.data):
                self.hass.config_entries.async_update_subentry(
                    self.entry, goal, data=data
                )
                changed = True

        active = options.get(CONF_ACTIVE_GOAL)
        if active is not None and active not in self.entry.subentries:
            options.pop(CONF_ACTIVE_GOAL)
        if options != dict(self.entry.options):
            self.hass.config_entries.async_update_entry(self.entry, options=options)
            changed = True

        known = set(self.entry.subentries)
        for remembered in (self._state.goal_flags, self._state.goal_results):
            for goal_id in [key for key in remembered if key not in known]:
                del remembered[goal_id]
        return changed

    @property
    def start_today_armed(self) -> bool:
        """Whether a pending start today is still confirmable."""
        if self._start_today_armed_until is None:
            return False
        return dt_util.utcnow() < self._start_today_armed_until

    @property
    def start_today_preview(self) -> dict[str, Any]:
        """What confirming would change, so the user can check before pressing."""
        return {
            "new_start_weight": self.current_weight,
            "new_start_date": dt_util.now(self.zone).date().isoformat(),
            "current_start_weight": self.start_weight,
            "current_start_date": None
            if self.start_date is None
            else self.start_date.isoformat(),
        }

    async def async_arm_start_today(self) -> None:
        """Stage a start today; it expires on its own if left alone.

        Moving the start of a goal overwrites the start weight, the start date
        and with them the derived rate. That is too much to happen on a single
        stray tap on a dashboard.
        """
        self._start_today_armed_until = dt_util.utcnow() + timedelta(
            seconds=ARM_TIMEOUT_SECONDS
        )
        self._cancel("start_today_arm")
        self._timers["start_today_arm"] = async_track_point_in_time(
            self.hass, self._handle_arm_expired, self._start_today_armed_until
        )
        self._notify()

    async def _handle_arm_expired(self, _now: datetime) -> None:
        self._start_today_armed_until = None
        self._notify()

    async def async_confirm_start_today(self) -> bool:
        """Apply a staged start today. Returns ``False`` when nothing is staged."""
        if not self.start_today_armed:
            return False
        self._start_today_armed_until = None
        self._cancel("start_today_arm")
        await self.async_start_today()
        self._notify()
        return True

    async def async_start_today(self) -> None:
        """Use the latest measurement and today as the start of the goal.

        Only the start weight and the start date change; the end date stays put.
        """
        changes: dict[str, Any] = {
            CONF_START_DATE: dt_util.now(self.zone).date().isoformat()
        }
        if self.current_weight is not None:
            changes[CONF_START_WEIGHT] = self.current_weight
        await self.async_set_goal(**changes)

    # ------------------------------------------------------------------
    # Set up and tear down
    # ------------------------------------------------------------------

    async def async_setup(self) -> None:
        """Load persisted state, catch up on missed work and arm the timers."""
        raw = await self._store.async_load()
        if raw:
            measurements = [
                m
                for m in (
                    Measurement.from_dict(item) for item in raw.get("measurements", [])
                )
                if m is not None
            ]
            measurements.sort(key=lambda m: m.timestamp)
            if raw.get("history_revision", 0) < HISTORY_REVISION:
                marked = mark_daily_means(measurements, self.zone)
                if marked:
                    _LOGGER.info(
                        "%s: marked %d imported daily means as statistics",
                        self.entry.title,
                        marked,
                    )
            cleaned = tidy_history(measurements, self.zone)
            if len(cleaned) < len(measurements):
                _LOGGER.info(
                    "%s: dropped %d repeated readings and unneeded daily means "
                    "from the history",
                    self.entry.title,
                    len(measurements) - len(cleaned),
                )
            self._state = StoredState(
                measurements=cleaned,
                manual_weight=raw.get("manual_weight"),
                manual_pending=bool(raw.get("manual_pending")),
                manual_date=raw.get("manual_date"),
                status=raw.get("status", STATUS_NO_GOAL),
                goal_flags={
                    str(key): dict(value)
                    for key, value in (raw.get("goal_flags") or {}).items()
                },
                goal_results={
                    str(key): dict(value)
                    for key, value in (raw.get("goal_results") or {}).items()
                },
                overdue_fired_for=raw.get("overdue_fired_for"),
                last_rollover=raw.get("last_rollover"),
                last_source_entity=raw.get("last_source_entity"),
                last_source_weight=raw.get("last_source_weight"),
            )
            self._trim()
            if "goal_flags" not in raw and (goal := self.active_goal) is not None:
                # Stored before goals had their own flags; they belonged to the
                # one goal there was, which the entry migration made active.
                self._state.goal_flags[goal.subentry_id] = {
                    "reached": bool(raw.get("goal_reached_fired")),
                    "ended": bool(raw.get("goal_ended_fired")),
                }
            if "last_source_entity" not in raw:
                # Stored by an older version, which did not remember what the
                # sensor last said. Its newest sensor reading is the same thing.
                last = next(
                    (
                        m
                        for m in reversed(self._state.measurements)
                        if m.source == SOURCE_SENSOR
                    ),
                    None,
                )
                if last is not None and self.source_entity:
                    self._state.last_source_entity = self.source_entity
                    self._state.last_source_weight = last.weight

        # A goal flow may have finished while the entry was not loaded.
        self._tidy_goals()

        self._subscribe_source()
        self._unsubscribers.append(
            self.hass.bus.async_listen(
                EVENT_CORE_CONFIG_UPDATE, self._handle_core_config_update
            )
        )

        await self._async_catch_up()
        self._schedule_all()
        await self.async_refresh(fire_events=False)

    async def async_shutdown(self) -> None:
        """Cancel everything this manager owns."""
        for cancel in self._timers.values():
            cancel()
        self._timers.clear()
        for unsub in self._unsubscribers:
            unsub()
        self._unsubscribers.clear()
        await self._async_save()

    async def async_options_updated(self) -> None:
        """Apply an options or goal change without reloading the entry."""
        if self._tidy_goals():
            return
        # A staged start today previews values that may just have changed.
        self._start_today_armed_until = None
        self._subscribe_source()
        self._schedule_all()
        await self.async_refresh()

    # ------------------------------------------------------------------
    # Entity notification
    # ------------------------------------------------------------------

    @callback
    def async_add_listener(self, update: CALLBACK_TYPE) -> CALLBACK_TYPE:
        """Register an entity callback and return the unsubscribe function."""
        self._listeners.append(update)

        @callback
        def remove() -> None:
            if update in self._listeners:
                self._listeners.remove(update)

        return remove

    @callback
    def _notify(self) -> None:
        for update in list(self._listeners):
            update()

    # ------------------------------------------------------------------
    # Source entity
    # ------------------------------------------------------------------

    def _subscribe_source(self) -> None:
        for unsub in [u for u in self._unsubscribers if getattr(u, "_wg_source", False)]:
            unsub()
            self._unsubscribers.remove(unsub)

        source = self.source_entity
        if not source:
            return

        unsub = async_track_state_change_event(
            self.hass, [source], self._handle_source_state
        )
        unsub._wg_source = True  # noqa: SLF001 - our own marker
        self._unsubscribers.append(unsub)

        state = self.hass.states.get(source)
        if state is not None:
            self.hass.async_create_task(self._async_consume_state(state))

    async def _handle_source_state(self, event: Event) -> None:
        state = event.data.get("new_state")
        if state is None:
            return
        await self._async_consume_state(state)

    async def _async_consume_state(self, state: Any) -> None:
        if state.state in (STATE_UNKNOWN, STATE_UNAVAILABLE, None, ""):
            return
        try:
            weight = float(state.state)
        except (TypeError, ValueError):
            _LOGGER.debug(
                "%s: source %s reported a non numeric state %r",
                self.entry.title,
                state.entity_id,
                state.state,
            )
            return
        if (
            self._state.last_source_entity == state.entity_id
            and self._state.last_source_weight is not None
            and abs(self._state.last_source_weight - weight) < 1e-9
        ):
            # The same value again is not a new weigh-in: the sensor came back
            # from unavailable, or Home Assistant started and read it once more.
            # Remembered per sensor rather than looked up in the history, so a
            # reading that was deleted or ignored does not return with it.
            return
        if await self.async_record_weight(
            weight, timestamp=state.last_changed, source=SOURCE_SENSOR
        ):
            self._state.last_source_entity = state.entity_id
            self._state.last_source_weight = weight

    # ------------------------------------------------------------------
    # Timers
    # ------------------------------------------------------------------

    def _cancel(self, name: str) -> None:
        if cancel := self._timers.pop(name, None):
            cancel()

    def _schedule_all(self) -> None:
        self._schedule_rollover()
        self._schedule_goal_end()
        self._schedule_overdue()
        self._schedule_recalculation()

    def _schedule_rollover(self) -> None:
        self._cancel("rollover")
        when = next_local_midnight(dt_util.utcnow(), self.zone)
        self._timers["rollover"] = async_track_point_in_time(
            self.hass, self._handle_rollover, when
        )

    async def _handle_rollover(self, _now: datetime) -> None:
        self._state.last_rollover = dt_util.now(self.zone).date().isoformat()
        self._schedule_rollover()
        await self.async_refresh()

    def _schedule_goal_end(self) -> None:
        self._cancel("goal_end")
        if self.end_date is None or self._goal_flag("ended"):
            return
        when = wall_clock(self.end_date + timedelta(days=1), self.zone)
        if when <= dt_util.utcnow():
            # A goal made active after its end. Its end is not news; only a
            # restart close to the end replays it, see _async_catch_up.
            self._set_goal_flag("ended", True)
            return
        self._timers["goal_end"] = async_track_point_in_time(
            self.hass, self._handle_goal_end, when
        )

    async def _handle_goal_end(self, _now: datetime) -> None:
        await self._async_fire_goal_ended()

    async def _async_fire_goal_ended(self) -> None:
        self._set_goal_flag("ended", True)
        await self._async_dispatch(
            EVENT_GOAL_ENDED,
            {
                "weight": self.current_weight,
                "target_weight": self.target_weight,
                "reached": self._state.status == STATUS_REACHED,
            },
            CONF_SCRIPT_GOAL_ENDED,
        )
        await self.async_refresh()

    def _schedule_overdue(self) -> None:
        self._cancel("overdue")
        if self.overdue_days <= 0:
            return
        last = self.last_measurement
        if last is None:
            return
        when = last.timestamp + timedelta(days=self.overdue_days)
        if when <= dt_util.utcnow():
            return
        self._timers["overdue"] = async_track_point_in_time(
            self.hass, self._handle_overdue, when
        )

    async def _handle_overdue(self, _now: datetime) -> None:
        await self._async_fire_overdue()

    async def _async_fire_overdue(self) -> None:
        last = self.last_measurement
        if last is None:
            return
        marker = last.timestamp.isoformat()
        if self._state.overdue_fired_for == marker:
            return
        self._state.overdue_fired_for = marker
        await self._async_dispatch(
            EVENT_MEASUREMENT_OVERDUE,
            {
                "last_measurement": marker,
                "days": self.overdue_days,
            },
            CONF_SCRIPT_OVERDUE,
        )
        await self._async_save()

    def _schedule_recalculation(self) -> None:
        self._cancel("recalculation")
        minutes = self.recalculation_interval
        if minutes <= 0:
            return
        when = dt_util.utcnow() + timedelta(minutes=minutes)
        self._timers["recalculation"] = async_track_point_in_time(
            self.hass, self._handle_recalculation, when
        )

    async def _handle_recalculation(self, _now: datetime) -> None:
        self._schedule_recalculation()
        await self.async_refresh()

    async def _handle_core_config_update(self, event: Event) -> None:
        """Re-arm every timer when the time zone changes."""
        if "time_zone" not in (event.data or {}):
            return
        self._schedule_all()
        await self.async_refresh()

    # ------------------------------------------------------------------
    # Catch up after downtime
    # ------------------------------------------------------------------

    async def _async_catch_up(self) -> None:
        """Handle points in time that fell into the downtime.

        The daily recalculation is idempotent and is simply performed. Events
        are only replayed when their moment is less than
        ``CATCHUP_GRACE_HOURS`` old; anything older is marked as handled so a
        long outage does not produce a burst of stale notifications.
        """
        now = dt_util.utcnow()
        grace = timedelta(hours=CATCHUP_GRACE_HOURS)

        if self.end_date is not None and not self._goal_flag("ended"):
            due = wall_clock(self.end_date + timedelta(days=1), self.zone)
            if due <= now:
                if now - due <= grace:
                    await self._async_fire_goal_ended()
                else:
                    self._set_goal_flag("ended", True)
                    _LOGGER.debug(
                        "%s: goal end at %s missed by more than %s hours, not replayed",
                        self.entry.title,
                        due.isoformat(),
                        CATCHUP_GRACE_HOURS,
                    )

        if self.overdue_days > 0 and (last := self.last_measurement) is not None:
            due = last.timestamp + timedelta(days=self.overdue_days)
            if due <= now and now - due <= grace:
                await self._async_fire_overdue()

        self._state.last_rollover = dt_util.now(self.zone).date().isoformat()

    # ------------------------------------------------------------------
    # Events and scripts
    # ------------------------------------------------------------------

    async def _async_dispatch(
        self, event_type: str, data: dict[str, Any], script_option: str
    ) -> None:
        goal = self.active_goal
        payload = {
            "entry_id": self.entry.entry_id,
            "name": self.entry.title,
            "goal": None if goal is None else goal.title,
            **data,
        }
        self.hass.bus.async_fire(event_type, payload)

        sequence = self.entry.options.get(script_option)
        if not sequence:
            return
        script = Script(
            self.hass,
            sequence,
            f"{self.entry.title} {script_option}",
            DOMAIN,
        )
        try:
            await script.async_run(payload, context=None)
        except Exception:  # noqa: BLE001 - a user script must not break the entry
            _LOGGER.exception(
                "%s: error while running the %s action", self.entry.title, script_option
            )

    # ------------------------------------------------------------------
    # Persistence
    # ------------------------------------------------------------------

    async def _async_save(self) -> None:
        await self._store.async_save(
            {
                "measurements": [m.as_dict() for m in self._state.measurements],
                "manual_weight": self._state.manual_weight,
                "manual_pending": self._state.manual_pending,
                "manual_date": self._state.manual_date,
                "status": self._state.status,
                "goal_flags": self._state.goal_flags,
                "goal_results": self._state.goal_results,
                "overdue_fired_for": self._state.overdue_fired_for,
                "last_rollover": self._state.last_rollover,
                "last_source_entity": self._state.last_source_entity,
                "last_source_weight": self._state.last_source_weight,
                "history_revision": HISTORY_REVISION,
            }
        )

    async def async_remove_storage(self) -> None:
        """Delete the persisted state; used when the entry is removed."""
        await self._store.async_remove()

    def measurements_payload(self, days: int | None = None) -> Iterable[dict[str, Any]]:
        """Measurement list for the service response."""
        items = self._state.measurements
        if days:
            cutoff = dt_util.utcnow() - timedelta(days=days)
            items = [m for m in items if m.timestamp >= cutoff]
        return [m.as_dict() for m in items]


