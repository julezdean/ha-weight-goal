/**
 * The planned trajectory, ported from `helpers.py` of the integration.
 *
 * The card draws the same line the backend computes, so
 * `sensor.<name>_target_weight_today` and the point the plan line passes
 * through "now" must agree. Any change here has a counterpart in
 * `custom_components/weight_goal/helpers.py`.
 */

import type { Direction } from "../types";

/** Start and target closer than this make it a "maintain" goal. */
export const MAINTAIN_EPSILON = 0.01;

const DAY_MS = 86_400_000;

/**
 * Offset of a time zone from UTC at a given instant, in milliseconds.
 *
 * `Intl` is the only way to ask the browser about a zone it is not running in,
 * and Home Assistant's configured zone is frequently not the browser's.
 */
function zoneOffset(instant: number, timeZone: string): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts: Record<string, number> = {};
  for (const part of formatter.formatToParts(new Date(instant))) {
    if (part.type !== "literal") {
      parts[part.type] = Number(part.value);
    }
  }
  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );
  // Sub-second parts are dropped by the formatter; ignore them on both sides.
  return asUtc - Math.floor(instant / 1000) * 1000;
}

/**
 * Wall clock midnight of an ISO date (`YYYY-MM-DD`) in `timeZone`, as epoch ms.
 *
 * Two passes: the first guesses the offset from UTC midnight, the second uses
 * the offset that actually applies at the resulting instant. That resolves the
 * two days a year on which the offset changes.
 */
export function zonedMidnight(isoDate: string, timeZone: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate);
  if (!match) {
    return null;
  }
  const utcMidnight = Date.UTC(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
  );
  let guess = utcMidnight - zoneOffset(utcMidnight, timeZone);
  guess = utcMidnight - zoneOffset(guess, timeZone);
  return guess;
}

export function addDays(isoDate: string, days: number): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate);
  if (!match) {
    return isoDate;
  }
  const shifted = new Date(
    Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])) +
      days * DAY_MS,
  );
  return shifted.toISOString().slice(0, 10);
}

export interface Goal {
  startWeight: number;
  targetWeight: number;
  /** Epoch ms of wall clock midnight on the first day. */
  begin: number;
  /** Epoch ms of wall clock midnight after the last day. */
  finish: number;
}

/**
 * Build the goal window, or `null` when the configuration is incomplete.
 *
 * The end day counts towards the goal in full, so the window runs to midnight
 * of the following day — the same span `goal_weeks()` divides by.
 */
export function buildGoal(
  startWeight: number | null,
  targetWeight: number | null,
  startDate: string | null,
  endDate: string | null,
  timeZone: string,
): Goal | null {
  if (
    startWeight === null ||
    targetWeight === null ||
    !startDate ||
    !endDate ||
    !Number.isFinite(startWeight) ||
    !Number.isFinite(targetWeight)
  ) {
    return null;
  }
  const begin = zonedMidnight(startDate, timeZone);
  const finish = zonedMidnight(addDays(endDate, 1), timeZone);
  if (begin === null || finish === null || finish - begin < DAY_MS) {
    return null;
  }
  return { startWeight, targetWeight, begin, finish };
}

/** Planned weight at an instant, clamped to the goal window. */
export function plannedWeight(goal: Goal, instant: number): number {
  const span = goal.finish - goal.begin;
  if (span <= 0) {
    return goal.targetWeight;
  }
  const fraction = Math.min(1, Math.max(0, (instant - goal.begin) / span));
  return goal.startWeight + (goal.targetWeight - goal.startWeight) * fraction;
}

export function directionOf(goal: Goal): Direction {
  const delta = goal.targetWeight - goal.startWeight;
  if (delta < -MAINTAIN_EPSILON) {
    return "lose";
  }
  if (delta > MAINTAIN_EPSILON) {
    return "gain";
  }
  return "maintain";
}

export function directionSign(direction: Direction): number {
  if (direction === "gain") {
    return 1;
  }
  if (direction === "lose") {
    return -1;
  }
  return 0;
}
