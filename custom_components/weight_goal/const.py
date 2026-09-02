"""Constants for the Road to Weight Goal integration."""

from __future__ import annotations

from typing import Final

DOMAIN: Final = "weight_goal"

# --- Configuration keys (stored in ConfigEntry.options) -----------------------

CONF_SOURCE_ENTITY: Final = "source_entity"
CONF_GOAL_MODE: Final = "goal_mode"
CONF_MIN_WEIGHT: Final = "min_weight"
CONF_MAX_WEIGHT: Final = "max_weight"
CONF_TOLERANCE: Final = "tolerance"
CONF_TREND_WINDOW_DAYS: Final = "trend_window_days"
CONF_OVERDUE_DAYS: Final = "overdue_days"
CONF_MAX_JUMP: Final = "max_jump"
CONF_ALLOW_MANUAL: Final = "allow_manual_entry"
CONF_RECALCULATION_INTERVAL: Final = "recalculation_interval"

CONF_START_WEIGHT: Final = "start_weight"
CONF_TARGET_WEIGHT: Final = "target_weight"
CONF_RATE_PER_WEEK: Final = "rate_per_week"
CONF_START_DATE: Final = "start_date"
CONF_END_DATE: Final = "end_date"

CONF_SCRIPT_MEASUREMENT: Final = "script_measurement"
CONF_SCRIPT_STATUS_CHANGED: Final = "script_status_changed"
CONF_SCRIPT_GOAL_REACHED: Final = "script_goal_reached"
CONF_SCRIPT_GOAL_ENDED: Final = "script_goal_ended"
CONF_SCRIPT_OVERDUE: Final = "script_overdue"

# --- Goal modes ---------------------------------------------------------------

MODE_TARGET: Final = "target"
MODE_RATE: Final = "rate"
GOAL_MODES: Final = [MODE_TARGET, MODE_RATE]

# --- Defaults -----------------------------------------------------------------

DEFAULT_GOAL_MODE: Final = MODE_TARGET
DEFAULT_MIN_WEIGHT: Final = 20.0
DEFAULT_MAX_WEIGHT: Final = 300.0
DEFAULT_TOLERANCE: Final = 0.5
DEFAULT_TREND_WINDOW_DAYS: Final = 7
DEFAULT_OVERDUE_DAYS: Final = 3
DEFAULT_MAX_JUMP: Final = 0.0
DEFAULT_ALLOW_MANUAL: Final = True
DEFAULT_RECALCULATION_INTERVAL: Final = 0

# --- Internal tuning ----------------------------------------------------------

#: Ring buffer size for the internal measurement history. Only used to compute
#: the trend and the projection; the long term history lives in the recorder.
MAX_MEASUREMENTS: Final = 400

#: Window used for the projection. Deliberately independent of
#: ``CONF_TREND_WINDOW_DAYS`` so that switching the trend sensor off does not
#: silently disable the projection as well.
PROJECTION_WINDOW_DAYS: Final = 14

#: A status only returns to ``on_track`` once the deviation is back inside this
#: fraction of the tolerance band. Prevents flapping around the threshold.
HYSTERESIS_FACTOR: Final = 0.5

#: Missed timers older than this are dropped instead of fired on start up.
CATCHUP_GRACE_HOURS: Final = 24

#: Anything further out than this is reported as unknown.
MAX_PROJECTION_DAYS: Final = 3650

RATE_LIMIT_PER_WEEK: Final = 5.0

STORAGE_VERSION: Final = 1

# --- Entity keys --------------------------------------------------------------

KEY_START_WEIGHT: Final = "start_weight"
KEY_TARGET_WEIGHT: Final = "target_weight"
KEY_RATE_PER_WEEK: Final = "rate_per_week"
KEY_MANUAL_WEIGHT: Final = "manual_weight"
KEY_START_DATE: Final = "start_date"
KEY_END_DATE: Final = "end_date"
KEY_WEIGHT: Final = "weight"
KEY_TARGET_WEIGHT_TODAY: Final = "target_weight_today"
KEY_DEVIATION: Final = "deviation"
KEY_TREND: Final = "trend"
KEY_WEIGHT_PROGRESS: Final = "weight_progress"
KEY_TIME_PROGRESS: Final = "time_progress"
KEY_REMAINING: Final = "remaining"
KEY_PROJECTED_DATE: Final = "projected_date"
KEY_STATUS: Final = "status"
KEY_LAST_MEASUREMENT: Final = "last_measurement"
KEY_START_TODAY: Final = "start_today"
KEY_RECORD_WEIGHT: Final = "record_weight"
KEY_CONFIRM_START_TODAY: Final = "confirm_start_today"

# --- Statuses -----------------------------------------------------------------

STATUS_NO_GOAL: Final = "no_goal"
STATUS_AHEAD: Final = "ahead"
STATUS_ON_TRACK: Final = "on_track"
STATUS_BEHIND: Final = "behind"
STATUS_REACHED: Final = "reached"
STATUS_ENDED: Final = "ended"

STATUSES: Final = [
    STATUS_NO_GOAL,
    STATUS_AHEAD,
    STATUS_ON_TRACK,
    STATUS_BEHIND,
    STATUS_REACHED,
    STATUS_ENDED,
]

# --- Directions ---------------------------------------------------------------

DIRECTION_LOSE: Final = "lose"
DIRECTION_MAINTAIN: Final = "maintain"
DIRECTION_GAIN: Final = "gain"

# --- Services -----------------------------------------------------------------

SERVICE_RECORD_WEIGHT: Final = "record_weight"
SERVICE_SET_GOAL: Final = "set_goal"
SERVICE_RESET_GOAL: Final = "reset_goal"
SERVICE_IGNORE_LAST_MEASUREMENT: Final = "ignore_last_measurement"
SERVICE_GET_MEASUREMENTS: Final = "get_measurements"
SERVICE_IMPORT_HISTORY: Final = "import_history"
SERVICE_DELETE_MEASUREMENT: Final = "delete_measurement"

ATTR_WEIGHT: Final = "weight"
ATTR_TIMESTAMP: Final = "timestamp"
ATTR_DAYS: Final = "days"
ATTR_REPLACE: Final = "replace"
ATTR_WRITE_STATISTICS: Final = "write_statistics"
ATTR_TOLERANCE_MINUTES: Final = "tolerance_minutes"

#: Default window used to match a timestamp against a stored measurement.
DEFAULT_MATCH_MINUTES: Final = 5

#: How long a pending "start today" stays confirmable.
ARM_TIMEOUT_SECONDS: Final = 120

# --- Events -------------------------------------------------------------------

EVENT_MEASUREMENT_RECORDED: Final = f"{DOMAIN}_measurement_recorded"
EVENT_STATUS_CHANGED: Final = f"{DOMAIN}_status_changed"
EVENT_GOAL_REACHED: Final = f"{DOMAIN}_goal_reached"
EVENT_GOAL_ENDED: Final = f"{DOMAIN}_goal_ended"
EVENT_MEASUREMENT_OVERDUE: Final = f"{DOMAIN}_measurement_overdue"

# --- Measurement sources ------------------------------------------------------

SOURCE_MANUAL: Final = "manual"
SOURCE_SENSOR: Final = "sensor"
SOURCE_SERVICE: Final = "service"
SOURCE_IMPORT: Final = "import"

