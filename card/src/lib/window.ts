/**
 * How much time the chart shows, and how much of it has to be loaded.
 *
 * Both are plain arithmetic over the goal, the readings and the options, so
 * they live here rather than inside the chart element, where testing them
 * would need a DOM.
 */

import type { ChartRange, Measurement } from "../types";
import type { Goal } from "./plan";

const DAY_MS = 86_400_000;

/** The run up a moving average needs before it is honest at the left edge. */
const MIN_BUFFER_DAYS = 7;

export interface TimeWindow {
  from: number;
  to: number;
}

/**
 * The time window the x axis covers.
 *
 * `goal` is the goal period and nothing more. The option calls itself "whole
 * goal period", so starting it days earlier reads as a bug rather than as
 * context; readings from before the start are what `all` and a plain number of
 * days are for.
 */
export function chartWindow(
  range: ChartRange | undefined,
  goal: Goal | null | undefined,
  points: readonly Measurement[],
  now: number,
): TimeWindow {
  const chosen = range ?? "goal";

  if (chosen === "goal" && goal) {
    const last = points[points.length - 1]?.t ?? now;
    return { from: goal.begin, to: Math.max(goal.finish, last, now) };
  }

  if (typeof chosen === "number" && chosen > 0) {
    return { from: now - chosen * DAY_MS, to: now };
  }

  const from = points[0]?.t ?? now - 30 * DAY_MS;
  const to = Math.max(points[points.length - 1]?.t ?? now, now);
  return { from, to: to > from ? to : from + DAY_MS };
}

/**
 * Days of readings to request.
 *
 * More than the window shows on purpose: the moving average is built from the
 * whole series and only then clipped, so a chart that starts at the goal still
 * needs a full average window of readings from before it. Loading just the
 * goal period would leave the average wrong exactly where the chart begins,
 * which is why the buffer grows with `average` instead of staying at a week.
 */
export function fetchDays(
  range: ChartRange | undefined,
  average: number | undefined,
  goal: Goal | null | undefined,
  now: number,
): number {
  const chosen = range ?? "goal";
  if (typeof chosen === "number") {
    return Math.ceil(chosen) + 1;
  }
  if (!goal) {
    return 365;
  }
  const buffer = Math.max(MIN_BUFFER_DAYS, Math.ceil(average ?? 0));
  const days = Math.ceil((now - goal.begin) / DAY_MS) + buffer;
  return days > 0 ? Math.min(3650, Math.max(30, days)) : 365;
}
