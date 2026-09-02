/**
 * One place that reads the goal out of Home Assistant's states.
 *
 * The cards and the chart all need the same handful of values; reading them
 * once keeps the "what if this entity is missing" handling in a single spot.
 */

import { buildGoal, directionOf, type Goal } from "./plan";
import {
  attributeOf,
  numberOf,
  stateOf,
  textOf,
  timestampOf,
  unitOf,
} from "./format";
import type { HassEntityState } from "../types";

/** Present and offered, whether or not it currently holds a value. */
function isPresent(state: HassEntityState | undefined): boolean {
  return !!state && state.state !== "unavailable";
}
import type {
  Direction,
  GoalContext,
  HomeAssistant,
  Status,
} from "../types";

export interface GoalModel {
  context: GoalContext;
  status: Status;
  direction: Direction | null;
  tolerance: number;
  /** From the status attributes; absent on integration versions before 0.2. */
  goalMode: "target" | "rate" | null;
  trendWindowDays: number | null;

  unit: string;
  currentWeight: number | null;
  lastMeasurement: number | null;
  measurementSource: string | null;

  startWeight: number | null;
  targetWeight: number | null;
  ratePerWeek: number | null;
  startDate: string | null;
  endDate: string | null;

  plannedToday: number | null;
  deviation: number | null;
  trend: number | null;
  remaining: number | null;
  weightProgress: number | null;
  timeProgress: number | null;
  projectedDate: number | null;

  manualWeight: number | null;
  manualPending: boolean;
  manualAvailable: boolean;
  recordAvailable: boolean;
  startTodayArmed: boolean;

  goal: Goal | null;
  /** Everything that must invalidate a cached measurement series. */
  stamp: string;
}

export function readGoal(
  hass: HomeAssistant,
  context: GoalContext,
): GoalModel {
  const e = context.entities;
  const statusState = stateOf(hass, e.status);
  const status = (textOf(hass, e.status) ?? "no_goal") as Status;

  const startWeight = numberOf(hass, e.start_weight);
  const targetWeight = numberOf(hass, e.target_weight);
  const startDate = textOf(hass, e.start_date);
  const endDate = textOf(hass, e.end_date);

  const goal = buildGoal(
    startWeight,
    targetWeight,
    startDate,
    endDate,
    hass.config?.time_zone ?? "UTC",
  );

  const attrDirection = attributeOf<Direction>(hass, e.status, "direction");
  const manualState = stateOf(hass, e.manual_weight);
  const lastMeasurement = timestampOf(hass, e.last_measurement);

  return {
    context,
    status,
    direction: attrDirection ?? (goal ? directionOf(goal) : null),
    tolerance: attributeOf<number>(hass, e.status, "tolerance") ?? 0.5,
    goalMode: attributeOf<"target" | "rate">(hass, e.status, "goal_mode") ?? null,
    trendWindowDays:
      attributeOf<number>(hass, e.status, "trend_window_days") ?? null,

    unit: unitOf(hass, e.weight ?? e.start_weight),
    currentWeight: numberOf(hass, e.weight),
    lastMeasurement,
    measurementSource: attributeOf<string>(hass, e.weight, "source") ?? null,

    startWeight,
    targetWeight,
    ratePerWeek: numberOf(hass, e.rate_per_week),
    startDate,
    endDate,

    plannedToday: numberOf(hass, e.target_weight_today),
    deviation: numberOf(hass, e.deviation),
    trend: numberOf(hass, e.trend),
    remaining: numberOf(hass, e.remaining),
    weightProgress: numberOf(hass, e.weight_progress),
    timeProgress: numberOf(hass, e.time_progress),
    projectedDate: timestampOf(hass, e.projected_date),

    manualWeight: numberOf(hass, e.manual_weight),
    manualPending: attributeOf<boolean>(hass, e.manual_weight, "pending") === true,
    // A button that was never pressed reads `unknown`, and a number that was
    // never set reads `unknown` too. Only `unavailable` means "not offered".
    manualAvailable: isPresent(manualState),
    recordAvailable: isPresent(stateOf(hass, e.record_weight)),
    startTodayArmed: isPresent(stateOf(hass, e.confirm_start_today)),

    goal,
    stamp: [
      statusState?.state,
      lastMeasurement,
      startWeight,
      targetWeight,
      startDate,
      endDate,
    ].join("|"),
  };
}

/** Entity ids the card has to watch for changes. */
export function trackedEntities(context: GoalContext): string[] {
  return Object.values(context.entities).filter(Boolean) as string[];
}
