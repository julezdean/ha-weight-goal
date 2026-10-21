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
  GoalSummary,
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
  manualDate: string | null;
  manualPending: boolean;
  manualAvailable: boolean;
  recordAvailable: boolean;

  goal: Goal | null;
  /** Every goal of the person, earliest start first; empty on integration
   * versions before the goal list. */
  goals: GoalSummary[];
  /** The goals that are not active and have a complete plan, for the chart. */
  otherGoals: Array<{ summary: GoalSummary; goal: Goal }>;
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

  const timeZone = hass.config?.time_zone ?? "UTC";
  const goal = buildGoal(startWeight, targetWeight, startDate, endDate, timeZone);

  const goals = readGoals(hass, e.active_goal);
  const otherGoals: GoalModel["otherGoals"] = [];
  for (const summary of goals) {
    if (summary.active) {
      continue;
    }
    const built = buildGoal(
      summary.startWeight,
      summary.targetWeight,
      summary.startDate,
      summary.endDate,
      timeZone,
    );
    if (built) {
      otherGoals.push({ summary, goal: built });
    }
  }

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
    manualDate: textOf(hass, e.manual_date),
    manualPending: attributeOf<boolean>(hass, e.manual_weight, "pending") === true,
    // A button that was never pressed reads `unknown`, and a number that was
    // never set reads `unknown` too. Only `unavailable` means "not offered".
    manualAvailable: isPresent(manualState),
    recordAvailable: isPresent(stateOf(hass, e.record_weight)),

    goal,
    goals,
    otherGoals,
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

function numberOrNull(value: unknown): number | null {
  const parsed = typeof value === "number" ? value : Number(value);
  return value === null || value === undefined || !Number.isFinite(parsed)
    ? null
    : parsed;
}

function textOrNull(value: unknown): string | null {
  return typeof value === "string" && value ? value : null;
}

/** The goal list from the `goals` attribute of the active goal select. */
export function readGoals(
  hass: HomeAssistant,
  entityId: string | undefined,
): GoalSummary[] {
  const raw = attributeOf<unknown>(hass, entityId, "goals");
  if (!Array.isArray(raw)) {
    return [];
  }
  const out: GoalSummary[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") {
      continue;
    }
    const row = item as Record<string, unknown>;
    const result = row.result as Record<string, unknown> | null | undefined;
    const weight = numberOrNull(result?.weight);
    const timestamp =
      typeof result?.timestamp === "string" ? Date.parse(result.timestamp) : NaN;
    out.push({
      id: String(row.id ?? ""),
      name: String(row.name ?? ""),
      active: row.active === true,
      goalMode: row.goal_mode === "rate" ? "rate" : "target",
      startWeight: numberOrNull(row.start_weight),
      targetWeight: numberOrNull(row.target_weight),
      ratePerWeek: numberOrNull(row.rate_per_week),
      startDate: textOrNull(row.start_date),
      endDate: textOrNull(row.end_date),
      result:
        weight === null || !Number.isFinite(timestamp)
          ? null
          : { weight, timestamp, reached: result?.reached === true },
    });
  }
  return out;
}

/** Entity ids the card has to watch for changes. */
export function trackedEntities(context: GoalContext): string[] {
  return Object.values(context.entities).filter(Boolean) as string[];
}
