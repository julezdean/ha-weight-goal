import { describe, expect, it } from "vitest";

import type { Goal } from "../src/lib/plan";
import type { Measurement } from "../src/types";
import { chartWindow, fetchDays } from "../src/lib/window";

const DAY = 86_400_000;

const NOW = Date.UTC(2026, 8, 2); // 2 September 2026
const BEGIN = Date.UTC(2026, 5, 14); // 14 June 2026
const FINISH = Date.UTC(2026, 8, 21); // 21 September 2026

const GOAL: Goal = {
  startWeight: 80,
  targetWeight: 74,
  begin: BEGIN,
  finish: FINISH,
};

/** Readings that reach a week further back than the goal does. */
const POINTS: Measurement[] = [
  { t: BEGIN - 7 * DAY, v: 80.4 },
  { t: BEGIN, v: 80 },
  { t: NOW, v: 74 },
];

describe("chartWindow", () => {
  it("starts a goal range at the goal, not at the earliest reading", () => {
    const { from } = chartWindow("goal", GOAL, POINTS, NOW);
    expect(from).toBe(BEGIN);
  });

  it("is the default range", () => {
    expect(chartWindow(undefined, GOAL, POINTS, NOW)).toEqual(
      chartWindow("goal", GOAL, POINTS, NOW),
    );
  });

  it("keeps the goal end visible even before it is reached", () => {
    const { to } = chartWindow("goal", GOAL, POINTS, NOW);
    expect(to).toBe(FINISH);
  });

  it("follows readings that run past the goal end", () => {
    const late = [...POINTS, { t: FINISH + 3 * DAY, v: 73.8 }];
    expect(chartWindow("goal", GOAL, late, NOW).to).toBe(FINISH + 3 * DAY);
  });

  it("counts a number as trailing days", () => {
    expect(chartWindow(30, GOAL, POINTS, NOW)).toEqual({
      from: NOW - 30 * DAY,
      to: NOW,
    });
  });

  it("shows everything it has for any other range", () => {
    // This is where the run up before the goal belongs.
    expect(chartWindow("all", GOAL, POINTS, NOW).from).toBe(BEGIN - 7 * DAY);
  });

  it("falls back to everything when there is no goal", () => {
    expect(chartWindow("goal", null, POINTS, NOW).from).toBe(BEGIN - 7 * DAY);
  });

  it("never collapses to a zero width window", () => {
    const one = [{ t: NOW, v: 74 }];
    const { from, to } = chartWindow("all", null, one, NOW);
    expect(to).toBeGreaterThan(from);
  });
});

describe("fetchDays", () => {
  it("loads a week beyond the goal so the average has a full window", () => {
    // 80 days of goal so far, plus the buffer.
    expect(fetchDays("goal", 7, GOAL, NOW)).toBe(87);
  });

  it("grows the buffer with the average window", () => {
    // Otherwise a 30 day average starts wrong at the left edge of the chart.
    expect(fetchDays("goal", 30, GOAL, NOW)).toBe(110);
  });

  it("keeps the week when the average is shorter or off", () => {
    expect(fetchDays("goal", 3, GOAL, NOW)).toBe(87);
    expect(fetchDays("goal", 0, GOAL, NOW)).toBe(87);
    expect(fetchDays("goal", undefined, GOAL, NOW)).toBe(87);
  });

  it("reads a number as the days to show, plus one", () => {
    expect(fetchDays(90, 7, GOAL, NOW)).toBe(91);
  });

  it("asks for a year when there is no goal to measure against", () => {
    expect(fetchDays("goal", 7, null, NOW)).toBe(365);
  });

  it("never asks for less than a month or more than ten years", () => {
    const today: Goal = { ...GOAL, begin: NOW };
    expect(fetchDays("goal", 7, today, NOW)).toBe(30);

    const ancient: Goal = { ...GOAL, begin: NOW - 20 * 365 * DAY };
    expect(fetchDays("goal", 7, ancient, NOW)).toBe(3650);
  });
});
