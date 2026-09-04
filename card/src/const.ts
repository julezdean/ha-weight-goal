export const DOMAIN = "weight_goal";

export const CARD_TYPE = "weight-goal-card";

export const CARD_VERSION = "0.5.1";

export const REPOSITORY = "https://github.com/julezdean/ha-weight-goal";

/** Status colours. Every status also has its own icon, so colour is never the
 * only thing carrying the meaning. */
export const STATUS_COLOR: Record<string, string> = {
  no_goal: "var(--disabled-text-color, #9e9e9e)",
  on_track: "var(--primary-color, #03a9f4)",
  ahead: "var(--success-color, #43a047)",
  behind: "var(--warning-color, #ffa726)",
  reached: "var(--success-color, #43a047)",
  ended: "var(--secondary-text-color, #727272)",
};

export const STATUS_ICON: Record<string, string> = {
  no_goal: "mdi:target-variant",
  on_track: "mdi:check-circle-outline",
  ahead: "mdi:rocket-launch-outline",
  behind: "mdi:alert-circle-outline",
  reached: "mdi:flag-checkered",
  ended: "mdi:calendar-check-outline",
};

export const UNAVAILABLE_STATES = new Set(["unavailable", "unknown"]);
