import { describe, expect, it } from "vitest";

import {
  buildAreaPath,
  buildPath,
  buildScale,
  movingAverage,
  nearestIndex,
  normalise,
} from "../src/lib/series";
import type { Measurement } from "../src/types";

const DAY = 86_400_000;

function daily(values: number[], start = 0): Measurement[] {
  return values.map((v, i) => ({ t: start + i * DAY, v }));
}

describe("movingAverage", () => {
  it("averages over a time window, not a sample count", () => {
    // Two readings on day 0, one on day 5. With a 3 day window the last point
    // must not see the first two.
    const points: Measurement[] = [
      { t: 0, v: 80 },
      { t: 3600_000, v: 82 },
      { t: 5 * DAY, v: 70 },
    ];
    const average = movingAverage(points, 3);
    expect(average).toHaveLength(3);
    expect(average[1].v).toBeCloseTo(81, 9);
    expect(average[2].v).toBeCloseTo(70, 9);
  });

  it("emits the leading points with a partial window", () => {
    const average = movingAverage(daily([80, 78, 76]), 7);
    expect(average[0].v).toBeCloseTo(80, 9);
    expect(average[2].v).toBeCloseTo(78, 9);
  });

  it("returns nothing for a window of zero", () => {
    expect(movingAverage(daily([80, 78]), 0)).toEqual([]);
  });

  it("handles an empty series", () => {
    expect(movingAverage([], 7)).toEqual([]);
  });
});

describe("normalise", () => {
  it("sorts and drops unusable readings", () => {
    const input = [
      { t: 2 * DAY, v: 78 },
      { t: DAY, v: Number.NaN },
      { t: 0, v: 80 },
    ];
    const out = normalise(input);
    expect(out.map((m) => m.v)).toEqual([80, 78]);
  });
});

describe("buildPath", () => {
  const points = [
    { x: 0, y: 10 },
    { x: 10, y: 5 },
    { x: 20, y: 6 },
    { x: 30, y: 2 },
  ];

  it("handles the degenerate cases", () => {
    expect(buildPath([], "linear")).toBe("");
    expect(buildPath([{ x: 1, y: 2 }], "smooth")).toBe("M1,2");
  });

  it("draws straight segments", () => {
    expect(buildPath(points, "linear")).toBe("M0,10 L10,5 L20,6 L30,2");
  });

  it("draws steps", () => {
    expect(buildPath(points, "step")).toBe("M0,10 H10 V5 H20 V6 H30 V2");
  });

  it("never leaves the range of a segment when smoothing", () => {
    const path = buildPath(points, "smooth");
    const ys = [...path.matchAll(/[-\d.]+,([-\d.]+)/g)].map((m) => Number(m[1]));
    expect(Math.min(...ys)).toBeGreaterThanOrEqual(2);
    expect(Math.max(...ys)).toBeLessThanOrEqual(10);
  });

  it("falls back to straight lines with fewer than three points", () => {
    const two = [
      { x: 0, y: 0 },
      { x: 5, y: 5 },
    ];
    expect(buildPath(two, "smooth")).toBe("M0,0 L5,5");
  });
});

describe("buildAreaPath", () => {
  it("closes the polygon", () => {
    const path = buildAreaPath(
      [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ],
      [
        { x: 0, y: 5 },
        { x: 10, y: 5 },
      ],
    );
    expect(path.startsWith("M0,0")).toBe(true);
    expect(path.endsWith("Z")).toBe(true);
  });

  it("needs two points on each side", () => {
    expect(buildAreaPath([{ x: 0, y: 0 }], [{ x: 0, y: 1 }])).toBe("");
  });
});

describe("buildScale", () => {
  it("rounds the ends outwards by default", () => {
    const scale = buildScale([73.2, 84.6]);
    expect(scale.min).toBeLessThanOrEqual(73.2);
    expect(scale.max).toBeGreaterThanOrEqual(84.6);
    expect(scale.step).toBeGreaterThan(0);
  });

  it("fits the data exactly in tight mode", () => {
    const scale = buildScale([77.4, 78.1, 79.25], { mode: "tight" });
    expect(scale.min).toBe(77.4);
    expect(scale.max).toBe(79.25);
    expect(scale.ticks[0]).toBe(77.4);
    expect(scale.ticks[scale.ticks.length - 1]).toBe(79.25);
  });

  it("honours a fixed minimum with an automatic maximum", () => {
    const scale = buildScale([77, 79], { min: 70 });
    expect(scale.min).toBe(70);
    expect(scale.max).toBeGreaterThanOrEqual(79);
  });

  it("honours a fixed maximum with an automatic minimum", () => {
    const scale = buildScale([77, 79], { max: 90 });
    expect(scale.max).toBe(90);
    expect(scale.min).toBeLessThanOrEqual(77);
  });

  it("honours both ends, even when they cut the data off", () => {
    const scale = buildScale([60, 100], { min: 75, max: 85 });
    expect(scale.min).toBe(75);
    expect(scale.max).toBe(85);
  });

  it("does not invert when max is below min", () => {
    const scale = buildScale([77, 79], { min: 80, max: 70 });
    expect(scale.max).toBeGreaterThan(scale.min);
  });

  it("opens a window around a single value", () => {
    const scale = buildScale([75], { mode: "tight" });
    expect(scale.max).toBeGreaterThan(scale.min);
    expect(scale.min).toBeLessThan(75);
    expect(scale.max).toBeGreaterThan(75);
  });

  it("survives an empty series and nonsense values", () => {
    expect(buildScale([]).max).toBeGreaterThan(buildScale([]).min);
    const scale = buildScale([Number.NaN, Number.POSITIVE_INFINITY, 5]);
    expect(Number.isFinite(scale.min)).toBe(true);
    expect(Number.isFinite(scale.max)).toBe(true);
  });

  it("keeps ticks inside the range, in order and without duplicates", () => {
    const scale = buildScale([73.2, 84.6], { mode: "tight", ticks: 5 });
    expect(scale.ticks[0]).toBe(scale.min);
    expect(scale.ticks[scale.ticks.length - 1]).toBe(scale.max);
    for (let i = 1; i < scale.ticks.length; i++) {
      expect(scale.ticks[i]).toBeGreaterThan(scale.ticks[i - 1]);
    }
  });

  it("asks for enough decimals that two labels never read the same", () => {
    const scale = buildScale([77.0, 77.6], { mode: "tight" });
    const labels = scale.ticks.map((v) => v.toFixed(scale.decimals));
    expect(new Set(labels).size).toBe(labels.length);
  });
});

describe("nearestIndex", () => {
  it("finds the closest reading", () => {
    const points = daily([80, 79, 78]);
    expect(nearestIndex(points, DAY * 0.4)).toBe(0);
    expect(nearestIndex(points, DAY * 1.6)).toBe(2);
  });

  it("returns -1 for an empty series", () => {
    expect(nearestIndex([], 0)).toBe(-1);
  });
});
