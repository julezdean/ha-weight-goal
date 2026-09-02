import { describe, expect, it } from "vitest";

import {
  addDays,
  buildGoal,
  directionOf,
  directionSign,
  plannedWeight,
  zonedMidnight,
} from "../src/lib/plan";

const TZ = "Europe/Berlin";

describe("zonedMidnight", () => {
  it("returns wall clock midnight in the given zone", () => {
    const winter = zonedMidnight("2026-01-15", TZ)!;
    expect(new Date(winter).toISOString()).toBe("2026-01-14T23:00:00.000Z");

    const summer = zonedMidnight("2026-07-15", TZ)!;
    expect(new Date(summer).toISOString()).toBe("2026-07-14T22:00:00.000Z");
  });

  it("handles the day the clocks change", () => {
    // 29 March 2026, the day Berlin goes to summer time.
    const shift = zonedMidnight("2026-03-29", TZ)!;
    expect(new Date(shift).toISOString()).toBe("2026-03-28T23:00:00.000Z");
  });

  it("rejects nonsense", () => {
    expect(zonedMidnight("", TZ)).toBeNull();
    expect(zonedMidnight("not-a-date", TZ)).toBeNull();
  });
});

describe("addDays", () => {
  it("crosses month and year boundaries", () => {
    expect(addDays("2026-02-28", 1)).toBe("2026-03-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
  });
});

describe("buildGoal", () => {
  it("needs both weights and both dates", () => {
    expect(buildGoal(null, 73, "2026-03-01", "2026-06-30", TZ)).toBeNull();
    expect(buildGoal(84, null, "2026-03-01", "2026-06-30", TZ)).toBeNull();
    expect(buildGoal(84, 73, null, "2026-06-30", TZ)).toBeNull();
    expect(buildGoal(84, 73, "2026-03-01", null, TZ)).toBeNull();
  });

  it("rejects a range shorter than a day", () => {
    expect(buildGoal(84, 73, "2026-06-30", "2026-06-29", TZ)).toBeNull();
  });

  it("accepts a single day goal, because the end day counts in full", () => {
    const goal = buildGoal(84, 83, "2026-06-30", "2026-06-30", TZ);
    expect(goal).not.toBeNull();
    expect(goal!.finish - goal!.begin).toBe(86_400_000);
  });

  it("runs to midnight after the end day", () => {
    const goal = buildGoal(84, 73, "2026-03-01", "2026-06-30", TZ)!;
    expect(goal.finish).toBe(zonedMidnight("2026-07-01", TZ));
  });
});

describe("plannedWeight", () => {
  const goal = buildGoal(80, 70, "2026-01-01", "2026-01-10", TZ)!;

  it("starts at the start weight and ends at the target", () => {
    expect(plannedWeight(goal, goal.begin)).toBeCloseTo(80, 9);
    expect(plannedWeight(goal, goal.finish)).toBeCloseTo(70, 9);
  });

  it("interpolates linearly", () => {
    const middle = goal.begin + (goal.finish - goal.begin) / 2;
    expect(plannedWeight(goal, middle)).toBeCloseTo(75, 9);
  });

  it("clamps outside the window", () => {
    expect(plannedWeight(goal, goal.begin - 86_400_000)).toBeCloseTo(80, 9);
    expect(plannedWeight(goal, goal.finish + 86_400_000)).toBeCloseTo(70, 9);
  });
});

describe("direction", () => {
  it("classifies the three cases", () => {
    expect(directionOf(buildGoal(84, 73, "2026-01-01", "2026-06-30", TZ)!)).toBe("lose");
    expect(directionOf(buildGoal(63, 70, "2026-01-01", "2026-06-30", TZ)!)).toBe("gain");
    expect(directionOf(buildGoal(73, 73, "2026-01-01", "2026-06-30", TZ)!)).toBe(
      "maintain",
    );
  });

  it("treats a difference under the epsilon as maintain", () => {
    expect(directionOf(buildGoal(73, 73.005, "2026-01-01", "2026-06-30", TZ)!)).toBe(
      "maintain",
    );
  });

  it("maps to a sign", () => {
    expect(directionSign("lose")).toBe(-1);
    expect(directionSign("gain")).toBe(1);
    expect(directionSign("maintain")).toBe(0);
  });
});
