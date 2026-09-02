/**
 * Picking strings in the user's language.
 *
 * Two sources, on purpose:
 *
 * - Anything with an entity behind it — names, the status value, units — comes
 *   from Home Assistant, which already has the integration's own translations
 *   for all of it. Copying those into the card would mean maintaining the same
 *   words twice and having them drift.
 * - Only sentences the card owns are translated here.
 */

import { de } from "./de";
import { en, type TranslationKey } from "./en";
import type { HassEntityState, HomeAssistant } from "../types";

const TABLES: Record<string, Partial<Record<TranslationKey, string>>> = {
  en,
  de,
};

export function languageOf(hass: HomeAssistant | undefined): string {
  return hass?.locale?.language || hass?.language || "en";
}

/**
 * Look up a string, falling back from `de-CH` to `de` to English.
 *
 * Falling through to English rather than showing the raw key keeps a card in a
 * language nobody has translated yet readable instead of broken.
 */
export function localize(
  hass: HomeAssistant | undefined,
  key: TranslationKey,
  values: Record<string, string | number> = {},
): string {
  return localizeIn(languageOf(hass), key, values);
}

/**
 * Same lookup, but for a language given directly.
 *
 * The card picker entries are registered when the bundle loads, long before
 * any `hass` exists, so they can only go by the browser's language.
 */
export function localizeIn(
  language: string,
  key: TranslationKey,
  values: Record<string, string | number> = {},
): string {
  const table =
    TABLES[language] ?? TABLES[language.split("-")[0].toLowerCase()] ?? TABLES.en;

  let text = table[key] ?? en[key] ?? key;
  for (const [name, value] of Object.entries(values)) {
    text = text.split(`{${name}}`).join(String(value));
  }
  return text;
}

/** A bound `localize`, for components that translate more than one string. */
export function translator(
  hass: HomeAssistant | undefined,
): (key: TranslationKey, values?: Record<string, string | number>) => string {
  return (key, values) => localize(hass, key, values);
}

/**
 * The entity's own name, without the device name in front of it.
 *
 * The integration sets `has_entity_name`, so a friendly name reads
 * "Julien Letzte Messung". On a card that already shows the goal name in the
 * header, repeating it in every badge is noise.
 */
export function entityLabel(
  hass: HomeAssistant | undefined,
  entityId: string | undefined,
  deviceName?: string,
): string {
  if (!hass || !entityId) {
    return "";
  }
  const friendly = hass.states[entityId]?.attributes?.friendly_name as
    | string
    | undefined;
  if (!friendly) {
    return entityId;
  }
  if (deviceName && friendly.startsWith(`${deviceName} `)) {
    return friendly.slice(deviceName.length + 1);
  }
  return friendly;
}

/**
 * The state as Home Assistant would print it, translated and with its unit.
 *
 * `formatEntityState` is what the more-info dialog uses, so an enum such as the
 * status sensor comes back as "Im Plan" rather than `on_track`. It is optional
 * on older frontends, hence the fallback.
 */
export function formatState(
  hass: HomeAssistant | undefined,
  state: HassEntityState | undefined,
): string {
  if (!hass || !state) {
    return "";
  }
  if (typeof hass.formatEntityState === "function") {
    try {
      return hass.formatEntityState(state);
    } catch {
      // Fall through to the plain rendering below.
    }
  }
  const unit = state.attributes?.unit_of_measurement as string | undefined;
  return unit ? `${state.state} ${unit}` : state.state;
}

export type { TranslationKey };
