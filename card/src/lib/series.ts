/**
 * Turning measurements into something drawable.
 *
 * Everything here works on plain `{x, y}` pixel points so it can be unit
 * tested without a DOM.
 */

import type { Measurement } from "../types";

export interface Point {
  x: number;
  y: number;
}

const DAY_MS = 86_400_000;

/**
 * Trailing moving average over a time window, not over a sample count.
 *
 * Daily weights arrive irregularly — a missed day, two readings on one
 * morning — so averaging the last N *points* would silently change the window
 * length. Averaging everything within the last N *days* does not.
 *
 * The first points have less than a full window behind them and are still
 * emitted; leaving them out would make the average line start days after the
 * measurements, which reads as missing data rather than as a short window.
 */
export function movingAverage(
  measurements: readonly Measurement[],
  days: number,
): Measurement[] {
  if (days <= 0 || measurements.length === 0) {
    return [];
  }
  const window = days * DAY_MS;
  const out: Measurement[] = [];
  let head = 0;
  let sum = 0;

  for (let i = 0; i < measurements.length; i++) {
    sum += measurements[i].v;
    while (measurements[i].t - measurements[head].t > window) {
      sum -= measurements[head].v;
      head += 1;
    }
    out.push({ t: measurements[i].t, v: sum / (i - head + 1) });
  }
  return out;
}

/** Sort by time and drop anything unusable. */
export function normalise(measurements: readonly Measurement[]): Measurement[] {
  return measurements
    .filter((m) => Number.isFinite(m.t) && Number.isFinite(m.v))
    .slice()
    .sort((a, b) => a.t - b.t);
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function linearPath(points: readonly Point[]): string {
  return points
    .map((p, i) => `${i === 0 ? "M" : "L"}${round(p.x)},${round(p.y)}`)
    .join(" ");
}

function stepPath(points: readonly Point[]): string {
  const parts = [`M${round(points[0].x)},${round(points[0].y)}`];
  for (let i = 1; i < points.length; i++) {
    parts.push(`H${round(points[i].x)}`, `V${round(points[i].y)}`);
  }
  return parts.join(" ");
}

/**
 * Catmull-Rom converted to cubic Bézier, with the control points clamped to
 * the segment they belong to.
 *
 * Without the clamp a run of readings like 79.0, 78.2, 78.3 bulges below 78.2
 * between the last two points. On a weight chart that invented dip looks like a
 * real measurement, so the curve is not allowed to leave the range its two end
 * points span.
 */
function smoothPath(points: readonly Point[]): string {
  if (points.length < 3) {
    return linearPath(points);
  }
  const parts = [`M${round(points[0].x)},${round(points[0].y)}`];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 >= points.length ? points.length - 1 : i + 2];

    const low = Math.min(p1.y, p2.y);
    const high = Math.max(p1.y, p2.y);
    const clamp = (y: number): number => Math.min(high, Math.max(low, y));

    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = clamp(p1.y + (p2.y - p0.y) / 6);
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = clamp(p2.y - (p3.y - p1.y) / 6);

    parts.push(
      `C${round(c1x)},${round(c1y)} ${round(c2x)},${round(c2y)} ` +
        `${round(p2.x)},${round(p2.y)}`,
    );
  }
  return parts.join(" ");
}

export function buildPath(
  points: readonly Point[],
  shape: "linear" | "smooth" | "step",
): string {
  if (points.length === 0) {
    return "";
  }
  if (points.length === 1) {
    return `M${round(points[0].x)},${round(points[0].y)}`;
  }
  if (shape === "step") {
    return stepPath(points);
  }
  if (shape === "smooth") {
    return smoothPath(points);
  }
  return linearPath(points);
}

/** A closed polygon between an upper and a lower series, for the band. */
export function buildAreaPath(
  upper: readonly Point[],
  lower: readonly Point[],
): string {
  if (upper.length < 2 || lower.length < 2) {
    return "";
  }
  const down = linearPath(upper);
  const back = lower
    .slice()
    .reverse()
    .map((p) => `L${round(p.x)},${round(p.y)}`)
    .join(" ");
  return `${down} ${back} Z`;
}

export interface Scale {
  min: number;
  max: number;
  step: number;
  /** Values to draw a grid line and a label at, low to high. */
  ticks: number[];
  /** Decimals the labels need so two ticks never print the same text. */
  decimals: number;
}

/** Round a step up to 1, 2, 5 or 10 times a power of ten. */
function niceStep(raw: number): number {
  if (!Number.isFinite(raw) || raw <= 0) {
    return 1;
  }
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const normalised = raw / magnitude;
  const factor = normalised > 5 ? 10 : normalised > 2 ? 5 : normalised > 1 ? 2 : 1;
  return factor * magnitude;
}

function tidy(value: number): number {
  return Number(value.toFixed(6));
}

export interface ScaleOptions {
  /** Fixed lower bound. Anything else is derived from the data. */
  min?: number | null;
  max?: number | null;
  /**
   * `nice` rounds the ends outwards to readable numbers, `tight` uses the
   * smallest and largest value exactly.
   */
  mode?: "nice" | "tight";
  ticks?: number;
}

/**
 * Build the vertical axis.
 *
 * `tight` exists because rounding outwards costs vertical space, and on a
 * weight chart the interesting movement is often a couple of kilograms inside a
 * much larger goal range. Fixing one end and leaving the other automatic is
 * allowed: a floor at a target weight with a free top is a common way to look
 * at this.
 */
export function buildScale(
  values: readonly number[],
  options: ScaleOptions = {},
): Scale {
  const finite = values.filter((value) => Number.isFinite(value));
  let low = finite.length ? Math.min(...finite) : 0;
  let high = finite.length ? Math.max(...finite) : 1;

  if (high - low < 1e-9) {
    // A single reading, or none: open a small window around it so the line has
    // somewhere to sit instead of collapsing onto one pixel row.
    const pad = Math.max(Math.abs(high) * 0.02, 0.5);
    low -= pad;
    high += pad;
  }

  const count = Math.max(1, options.ticks ?? 4);

  if (options.mode !== "tight") {
    const step = niceStep((high - low) / count);
    low = Math.floor(low / step) * step;
    high = Math.ceil(high / step) * step;
  }

  if (typeof options.min === "number" && Number.isFinite(options.min)) {
    low = options.min;
  }
  if (typeof options.max === "number" && Number.isFinite(options.max)) {
    high = options.max;
  }
  if (high <= low) {
    // A configured max below the min would invert the chart; give it a usable
    // span upwards from the min instead of drawing nonsense.
    high = low + Math.max(niceStep(Math.abs(low) * 0.02), 1);
  }

  low = tidy(low);
  high = tidy(high);
  const step = niceStep((high - low) / count);
  const decimals = step >= 1 ? 0 : step >= 0.1 ? 1 : 2;

  const ticks: number[] = [low];
  const margin = step * 0.4;
  for (
    let value = Math.ceil((low + margin) / step) * step;
    value < high - margin;
    value += step
  ) {
    const rounded = tidy(value);
    if (rounded > low && rounded < high) {
      ticks.push(rounded);
    }
  }
  if (high > low) {
    ticks.push(high);
  }

  return { min: low, max: high, step, ticks, decimals };
}

/** Index of the measurement closest to `t`. */
export function nearestIndex(
  measurements: readonly Measurement[],
  t: number,
): number {
  if (measurements.length === 0) {
    return -1;
  }
  let best = 0;
  let bestDistance = Infinity;
  for (let i = 0; i < measurements.length; i++) {
    const distance = Math.abs(measurements[i].t - t);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = i;
    }
  }
  return best;
}
