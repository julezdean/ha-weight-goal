/**
 * Reading states safely and formatting them for display.
 *
 * Every getter tolerates a missing entity, `unavailable` and `unknown`, because
 * all of those are normal here: the trend sensor is unavailable when the trend
 * window is off, the projection is unknown when the pace points the wrong way,
 * and any entity can be missing if the user hid or removed it.
 */

import { UNAVAILABLE_STATES } from "../const";
import type { HassEntityState, HomeAssistant } from "../types";

export function stateOf(
  hass: HomeAssistant | undefined,
  entityId: string | undefined,
): HassEntityState | undefined {
  if (!hass || !entityId) {
    return undefined;
  }
  return hass.states?.[entityId];
}

export function isUsable(state: HassEntityState | undefined): boolean {
  return !!state && !UNAVAILABLE_STATES.has(state.state);
}

export function numberOf(
  hass: HomeAssistant | undefined,
  entityId: string | undefined,
): number | null {
  const state = stateOf(hass, entityId);
  if (!isUsable(state)) {
    return null;
  }
  const value = Number(state!.state);
  return Number.isFinite(value) ? value : null;
}

export function textOf(
  hass: HomeAssistant | undefined,
  entityId: string | undefined,
): string | null {
  const state = stateOf(hass, entityId);
  return isUsable(state) ? state!.state : null;
}

export function timestampOf(
  hass: HomeAssistant | undefined,
  entityId: string | undefined,
): number | null {
  const raw = textOf(hass, entityId);
  if (!raw) {
    return null;
  }
  const parsed = Date.parse(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export function attributeOf<T>(
  hass: HomeAssistant | undefined,
  entityId: string | undefined,
  attribute: string,
): T | undefined {
  const state = stateOf(hass, entityId);
  return state?.attributes?.[attribute] as T | undefined;
}

export function unitOf(
  hass: HomeAssistant | undefined,
  entityId: string | undefined,
  fallback = "kg",
): string {
  return (
    attributeOf<string>(hass, entityId, "unit_of_measurement") ?? fallback
  );
}

export function localeOf(hass: HomeAssistant | undefined): string {
  return hass?.locale?.language || hass?.language || "en";
}

export function formatNumber(
  hass: HomeAssistant | undefined,
  value: number | null,
  digits = 1,
): string {
  if (value === null || !Number.isFinite(value)) {
    return "–";
  }
  return new Intl.NumberFormat(localeOf(hass), {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

/** Always shows the sign, so a deviation reads as a direction at a glance. */
export function formatSigned(
  hass: HomeAssistant | undefined,
  value: number | null,
  digits = 1,
): string {
  if (value === null || !Number.isFinite(value)) {
    return "–";
  }
  return new Intl.NumberFormat(localeOf(hass), {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
    signDisplay: "exceptZero",
  }).format(value);
}

export function formatDate(
  hass: HomeAssistant | undefined,
  value: number | null,
  withYear = false,
): string {
  if (value === null) {
    return "–";
  }
  return new Intl.DateTimeFormat(localeOf(hass), {
    day: "numeric",
    month: "short",
    ...(withYear ? { year: "numeric" } : {}),
    timeZone: hass?.config?.time_zone,
  }).format(new Date(value));
}

const RELATIVE_STEPS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ["second", 60],
  ["minute", 60],
  ["hour", 24],
  ["day", 7],
  ["week", 4.348],
  ["month", 12],
  ["year", Infinity],
];

export function formatRelative(
  hass: HomeAssistant | undefined,
  value: number | null,
): string {
  if (value === null) {
    return "–";
  }
  const formatter = new Intl.RelativeTimeFormat(localeOf(hass), {
    numeric: "auto",
  });
  let delta = (value - Date.now()) / 1000;
  for (const [unit, size] of RELATIVE_STEPS) {
    if (Math.abs(delta) < size || size === Infinity) {
      return formatter.format(Math.round(delta), unit);
    }
    delta /= size;
  }
  return formatter.format(Math.round(delta), "year");
}
