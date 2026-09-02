/**
 * The chips under the current weight.
 *
 * A badge is either one of the built-in keys, which maps to an entity of the
 * goal with an icon that suits it, or an object naming any entity at all. The
 * second form is the escape hatch: body fat from the same scale, a sleep
 * sensor, whatever belongs next to the weight on that dashboard.
 *
 * A badge whose entity is missing or has no value is dropped rather than shown
 * empty, so a list can name badges that only some goals have.
 */

import { formatRelative, formatSigned, isUsable, stateOf } from "./format";
import { entityLabel, formatState, localize } from "../localize";
import type { GoalModel } from "./goal";
import type { BadgeConfig, BuiltinBadge, HomeAssistant } from "../types";

export interface ResolvedBadge {
  /** Stable across renders, so Lit can keep the DOM. */
  key: string;
  icon: string;
  text: string;
  /** Read out and shown on hover; the badges themselves carry only a value. */
  label: string;
  entityId?: string;
}

interface BuiltinDefinition {
  /** Which entity of the goal it reads. */
  key: keyof GoalModel["context"]["entities"];
  icon: string;
  /** Timestamps read better as "6 hours ago" than as a date. */
  relative?: boolean;
  /** Deviation and trend only mean something with their sign. */
  signed?: boolean;
}

const BUILTIN: Record<Exclude<BuiltinBadge, "source">, BuiltinDefinition> = {
  last_measurement: { key: "last_measurement", icon: "mdi:clock-outline", relative: true },
  projected_date: { key: "projected_date", icon: "mdi:calendar-clock", relative: true },
  trend: { key: "trend", icon: "mdi:chart-line-variant", signed: true },
  deviation: { key: "deviation", icon: "mdi:plus-minus-variant", signed: true },
  remaining: { key: "remaining", icon: "mdi:flag-checkered" },
  target_weight_today: { key: "target_weight_today", icon: "mdi:target" },
  weight_progress: { key: "weight_progress", icon: "mdi:scale-balance" },
  time_progress: { key: "time_progress", icon: "mdi:calendar-range" },
  start_weight: { key: "start_weight", icon: "mdi:ray-start" },
  target_weight: { key: "target_weight", icon: "mdi:ray-end" },
  rate_per_week: { key: "rate_per_week", icon: "mdi:speedometer" },
  start_date: { key: "start_date", icon: "mdi:calendar-start" },
  end_date: { key: "end_date", icon: "mdi:calendar-end" },
};

export const BUILTIN_BADGES = [
  ...Object.keys(BUILTIN),
  "source",
] as BuiltinBadge[];

export const DEFAULT_BADGES: BuiltinBadge[] = [
  "last_measurement",
  "trend",
  "remaining",
  "projected_date",
];

const SOURCE_ICON: Record<string, string> = {
  manual: "mdi:pencil-outline",
  sensor: "mdi:scale-bathroom",
  service: "mdi:cog-outline",
  import: "mdi:database-import-outline",
};

function sourceBadge(
  hass: HomeAssistant,
  model: GoalModel,
): ResolvedBadge | null {
  const source = model.measurementSource;
  if (!source) {
    return null;
  }
  const key = `badge.source.${source}` as
    | "badge.source.manual"
    | "badge.source.sensor"
    | "badge.source.service"
    | "badge.source.import";
  const text = SOURCE_ICON[source] ? localize(hass, key) : source;
  return {
    key: "source",
    icon: SOURCE_ICON[source] ?? "mdi:help-circle-outline",
    text,
    label: text,
    entityId: model.context.entities.weight,
  };
}

function builtinBadge(
  hass: HomeAssistant,
  model: GoalModel,
  name: Exclude<BuiltinBadge, "source">,
): ResolvedBadge | null {
  const definition = BUILTIN[name];
  const entityId = model.context.entities[definition.key];
  const state = stateOf(hass, entityId);
  if (!entityId || !isUsable(state)) {
    return null;
  }

  let text: string;
  if (definition.relative) {
    const parsed = Date.parse(state!.state);
    if (!Number.isFinite(parsed)) {
      return null;
    }
    text = formatRelative(hass, parsed);
  } else if (definition.signed) {
    const value = Number(state!.state);
    if (!Number.isFinite(value)) {
      return null;
    }
    const unit = (state!.attributes.unit_of_measurement as string) ?? "";
    text = `${formatSigned(hass, value, 1)}${unit ? ` ${unit}` : ""}`;
  } else {
    text = formatState(hass, state);
  }

  return {
    key: name,
    icon: definition.icon,
    text,
    label: entityLabel(hass, entityId, model.context.name),
    entityId,
  };
}

function customBadge(
  hass: HomeAssistant,
  model: GoalModel,
  config: Exclude<BadgeConfig, string>,
): ResolvedBadge | null {
  const state = stateOf(hass, config.entity);
  if (!isUsable(state)) {
    return null;
  }
  return {
    key: config.entity,
    icon:
      config.icon ??
      (state!.attributes.icon as string | undefined) ??
      "mdi:information-outline",
    text: formatState(hass, state),
    label: config.name ?? entityLabel(hass, config.entity, model.context.name),
    entityId: config.entity,
  };
}

export function resolveBadges(
  hass: HomeAssistant,
  model: GoalModel,
  configured?: BadgeConfig[],
): ResolvedBadge[] {
  const list = configured ?? DEFAULT_BADGES;
  const out: ResolvedBadge[] = [];

  for (const entry of list) {
    if (typeof entry === "object" && entry?.entity) {
      const badge = customBadge(hass, model, entry);
      if (badge) {
        out.push(badge);
      }
      continue;
    }
    if (entry === "source") {
      const badge = sourceBadge(hass, model);
      if (badge) {
        out.push(badge);
      }
      continue;
    }
    if (typeof entry === "string" && entry in BUILTIN) {
      const badge = builtinBadge(hass, model, entry as Exclude<BuiltinBadge, "source">);
      if (badge) {
        out.push(badge);
      }
    }
  }
  return out;
}
