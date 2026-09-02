/**
 * Types used across both cards.
 *
 * Only the parts of the Home Assistant frontend API that the cards actually
 * touch are declared here. Depending on `home-assistant-frontend` would pull a
 * very large package in for a handful of shapes.
 */

export interface HassEntityState {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
  last_changed: string;
  last_updated: string;
  context?: { id: string; user_id: string | null; parent_id: string | null };
}

export interface EntityRegistryDisplayEntry {
  entity_id: string;
  device_id?: string | null;
  area_id?: string | null;
  platform?: string;
  translation_key?: string;
  entity_category?: string | null;
  hidden?: boolean;
  display_precision?: number;
}

export interface DeviceRegistryDisplayEntry {
  id: string;
  name?: string | null;
  name_by_user?: string | null;
  manufacturer?: string | null;
  model?: string | null;
}

export interface HassConnection {
  sendMessagePromise<T>(message: Record<string, unknown>): Promise<T>;
}

export interface HomeAssistant {
  states: Record<string, HassEntityState>;
  entities: Record<string, EntityRegistryDisplayEntry>;
  devices: Record<string, DeviceRegistryDisplayEntry>;
  connection: HassConnection;
  language: string;
  locale?: { language: string; number_format?: string; time_zone?: string };
  themes?: { darkMode?: boolean };
  config: { time_zone: string; unit_system?: { mass?: string } };
  callService(
    domain: string,
    service: string,
    serviceData?: Record<string, unknown>,
    target?: Record<string, unknown>,
    notifyOnError?: boolean,
    returnResponse?: boolean,
  ): Promise<{ response?: unknown }>;
  formatEntityState?(state: HassEntityState, value?: string): string;
  localize(key: string, ...args: unknown[]): string;
}

/** Every entity key the integration creates, grouped by its domain. */
export const ENTITY_KEYS = {
  number: [
    "start_weight",
    "target_weight",
    "rate_per_week",
    "manual_weight",
  ],
  date: ["start_date", "end_date"],
  button: ["start_today", "confirm_start_today", "record_weight"],
  sensor: [
    "weight",
    "target_weight_today",
    "deviation",
    "trend",
    "weight_progress",
    "time_progress",
    "remaining",
    "projected_date",
    "status",
    "last_measurement",
  ],
} as const;

export type EntityKey =
  | (typeof ENTITY_KEYS.number)[number]
  | (typeof ENTITY_KEYS.date)[number]
  | (typeof ENTITY_KEYS.button)[number]
  | (typeof ENTITY_KEYS.sensor)[number];

/** Resolved entity ids, keyed by the integration's internal key. */
export type ResolvedEntities = Partial<Record<EntityKey, string>>;

export interface GoalContext {
  /** Entity ids that were found for this goal. */
  entities: ResolvedEntities;
  /** Device the entities belong to, when the registry knew one. */
  deviceId?: string;
  /** Display name for the header. */
  name: string;
  /** A sensor entity id, required as the target of every action. */
  target?: string;
}

export type Status =
  | "no_goal"
  | "on_track"
  | "ahead"
  | "behind"
  | "reached"
  | "ended";

export type Direction = "lose" | "maintain" | "gain";

export type MeasurementSource = "manual" | "sensor" | "service" | "import";

export interface Measurement {
  /** Epoch milliseconds. */
  t: number;
  /** Weight in the unit of the weight sensor. */
  v: number;
  source?: MeasurementSource | string;
}

// --- Card configuration -------------------------------------------------

export type LineShape = "linear" | "smooth" | "step";

export type ChartRange = "goal" | number | "all";

export interface SeriesStyle {
  /** Any CSS colour, a `var(--…)` reference, or `auto` for the status colour. */
  color?: string;
  width?: number;
  dash?: string;
  opacity?: number;
  point_size?: number;
}

export interface ChartVisibility {
  band?: boolean;
  plan?: boolean;
  projection?: boolean;
  points?: boolean;
  average?: boolean;
  today?: boolean;
  grid?: boolean;
  axis?: boolean;
}

export interface YAxisOptions {
  /** A number pins the bottom of the axis; leave it out for automatic. */
  min?: number;
  max?: number;
  /** `nice` rounds the automatic ends outwards, `tight` uses them exactly. */
  mode?: "nice" | "tight";
  /**
   * Whether the plan line and the tolerance band are allowed to widen the
   * axis. With `false` the axis follows the readings and the plan is clipped.
   */
  include_goal?: boolean;
  /** Rough number of grid lines. */
  ticks?: number;
}

export interface ChartOptions {
  source?: "measurements" | "history";
  range?: ChartRange;
  average?: number;
  line?: LineShape;
  height?: number;
  y_axis?: YAxisOptions;
  show?: ChartVisibility;
  styles?: {
    weight?: SeriesStyle;
    average?: SeriesStyle;
    plan?: SeriesStyle;
    band?: SeriesStyle;
    projection?: SeriesStyle;
  };
}

export interface BaseCardConfig {
  type: string;
  entity?: string;
  device_id?: string;
  entities?: ResolvedEntities;
  name?: string;
  icon?: string;
}

export type BuiltinBadge =
  | "last_measurement"
  | "projected_date"
  | "trend"
  | "deviation"
  | "remaining"
  | "target_weight_today"
  | "weight_progress"
  | "time_progress"
  | "start_weight"
  | "target_weight"
  | "rate_per_week"
  | "start_date"
  | "end_date"
  | "source";

export interface CustomBadge {
  entity: string;
  icon?: string;
  name?: string;
}

export type BadgeConfig = BuiltinBadge | CustomBadge;

export interface WeightGoalCardConfig extends BaseCardConfig, ChartOptions {
  show_header?: boolean;
  /** `compact` is the one line name and weight; `full` the icon, dates and
   * status. */
  header?: "full" | "compact";
  show_hero?: boolean;
  show_badges?: boolean;
  show_chart?: boolean;
  show_progress?: boolean;
  show_actions?: boolean;
  show_goal_editor?: boolean;
  badges?: BadgeConfig[];
  chart?: ChartOptions;
}

export interface LovelaceCard extends HTMLElement {
  hass?: HomeAssistant;
  setConfig(config: Record<string, unknown>): void;
  getCardSize?(): number | Promise<number>;
}

declare global {
  interface Window {
    customCards?: Array<{
      type: string;
      name: string;
      description: string;
      preview?: boolean;
      documentationURL?: string;
    }>;
    loadCardHelpers?: () => Promise<{
      createCardElement(config: Record<string, unknown>): LovelaceCard;
    }>;
  }
}
