/**
 * `ha-form` schemas.
 *
 * The schemas are built per render rather than defined once, because every
 * label and every dropdown option is translated and the language is only known
 * once `hass` is there.
 *
 * `ha-form` and its selectors are part of the Home Assistant frontend, not of
 * this bundle. They are registered lazily, so an editor has to force one
 * built-in card's config element to load before using them — see
 * `ensureFormLoaded`.
 */

import { BUILTIN_BADGES } from "../lib/badges";
import { DOMAIN } from "../const";
import { localize, type TranslationKey } from "../localize";
import type { HomeAssistant } from "../types";

export interface FormSchema {
  name: string;
  type?: string;
  title?: string;
  flatten?: boolean;
  required?: boolean;
  selector?: Record<string, unknown>;
  schema?: FormSchema[];
}

let formLoaded: Promise<void> | undefined;

export function ensureFormLoaded(): Promise<void> {
  if (!formLoaded) {
    formLoaded = (async () => {
      if (customElements.get("ha-form")) {
        return;
      }
      const helpers = await window.loadCardHelpers?.();
      if (!helpers) {
        return;
      }
      const card = helpers.createCardElement({ type: "entities", entities: [] });
      const factory = (
        card.constructor as { getConfigElement?: () => Promise<unknown> }
      ).getConfigElement;
      if (factory) {
        await factory();
      }
    })().catch(() => undefined);
  }
  return formLoaded;
}

type T = (key: TranslationKey) => string;

/** Labels come from `computeLabel`, so this one needs no translator. */
export function anchorSchema(): FormSchema[] {
  return [
    {
      name: "entity",
      required: true,
      selector: { entity: { integration: DOMAIN, domain: "sensor" } },
    },
    {
      name: "",
      type: "grid",
      schema: [
        { name: "name", selector: { text: {} } },
        { name: "icon", selector: { icon: {} } },
      ],
    },
  ];
}

/** Built-in badge keys, labelled with the name of the entity behind them. */
export function badgeSchema(hass: HomeAssistant | undefined): FormSchema {
  return {
    name: "badges",
    selector: {
      select: {
        multiple: true,
        mode: "list",
        options: BUILTIN_BADGES.map((badge) => ({
          value: badge,
          label: badgeLabel(hass, badge),
        })),
      },
    },
  };
}

/**
 * A badge's label is the name of the entity it shows, taken from Home
 * Assistant so it is already translated. `source` has no entity of its own.
 */
function badgeLabel(hass: HomeAssistant | undefined, badge: string): string {
  if (badge === "source") {
    return localize(hass, "badge.source.sensor");
  }
  const key = `component.${DOMAIN}.entity.sensor.${badge}.name`;
  const translated = hass?.localize?.(key);
  if (typeof translated === "string" && translated) {
    return translated;
  }
  for (const domain of ["number", "date"]) {
    const alternative = hass?.localize?.(
      `component.${DOMAIN}.entity.${domain}.${badge}.name`,
    );
    if (typeof alternative === "string" && alternative) {
      return alternative;
    }
  }
  return badge;
}

export function chartSchema(t: T): FormSchema[] {
  return [
    {
      name: "",
      type: "grid",
      schema: [
        {
          name: "source",
          selector: {
            select: {
              mode: "dropdown",
              options: [
                { value: "measurements", label: t("editor.source_measurements") },
                { value: "history", label: t("editor.source_history") },
              ],
            },
          },
        },
        {
          name: "range",
          selector: {
            select: {
              mode: "dropdown",
              custom_value: true,
              options: [
                { value: "goal", label: t("editor.range_goal") },
                { value: "30", label: t("editor.range_30") },
                { value: "90", label: t("editor.range_90") },
                { value: "365", label: t("editor.range_365") },
                { value: "all", label: t("editor.range_all") },
              ],
            },
          },
        },
        {
          name: "line",
          selector: {
            select: {
              mode: "dropdown",
              options: [
                { value: "smooth", label: t("editor.line_smooth") },
                { value: "linear", label: t("editor.line_linear") },
                { value: "step", label: t("editor.line_step") },
              ],
            },
          },
        },
        {
          name: "average",
          selector: {
            number: {
              min: 0,
              max: 60,
              step: 1,
              mode: "box",
              unit_of_measurement: "d",
            },
          },
        },
        {
          name: "height",
          selector: {
            number: {
              min: 100,
              max: 500,
              step: 10,
              mode: "box",
              unit_of_measurement: "px",
            },
          },
        },
      ],
    },
    {
      name: "y_axis",
      type: "expandable",
      title: t("editor.y_axis"),
      schema: [
        {
          name: "",
          type: "grid",
          schema: [
            {
              name: "mode",
              selector: {
                select: {
                  mode: "dropdown",
                  options: [
                    { value: "nice", label: t("editor.mode_nice") },
                    { value: "tight", label: t("editor.mode_tight") },
                  ],
                },
              },
            },
            { name: "include_goal", selector: { boolean: {} } },
            {
              name: "min",
              selector: { number: { min: 0, max: 500, step: 0.5, mode: "box" } },
            },
            {
              name: "max",
              selector: { number: { min: 0, max: 500, step: 0.5, mode: "box" } },
            },
            {
              name: "ticks",
              selector: { number: { min: 2, max: 10, step: 1, mode: "box" } },
            },
          ],
        },
      ],
    },
    {
      name: "show",
      type: "expandable",
      title: t("editor.layers"),
      schema: [
        {
          name: "",
          type: "grid",
          schema: [
            { name: "band", selector: { boolean: {} } },
            { name: "plan", selector: { boolean: {} } },
            { name: "average", selector: { boolean: {} } },
            { name: "projection", selector: { boolean: {} } },
            { name: "points", selector: { boolean: {} } },
            { name: "today", selector: { boolean: {} } },
            { name: "grid", selector: { boolean: {} } },
            { name: "axis", selector: { boolean: {} } },
          ],
        },
      ],
    },
  ];
}

/** Field name to translation key. Names are unique across both schemas. */
const LABEL_KEYS: Record<string, TranslationKey> = {
  entity: "editor.entity",
  name: "editor.name",
  icon: "editor.icon",
  badges: "editor.badges",
  source: "editor.source",
  range: "editor.range",
  line: "editor.line",
  average: "editor.average",
  height: "editor.height",
  mode: "editor.mode",
  include_goal: "editor.include_goal",
  min: "editor.min",
  max: "editor.max",
  ticks: "editor.ticks",
  band: "editor.band",
  plan: "editor.plan",
  projection: "editor.projection",
  points: "editor.points",
  today: "editor.today",
  grid: "editor.grid",
  axis: "editor.axis",
  show_header: "editor.show_header",
  show_hero: "editor.show_hero",
  show_chart: "editor.show_chart",
  show_progress: "editor.show_progress",
  show_actions: "editor.show_actions",
  show_goal_editor: "editor.show_goal_editor",
  show_title: "editor.show_title",
};

const HELPER_KEYS: Record<string, TranslationKey> = {
  entity: "editor.entity_help",
  badges: "editor.badges_help",
  source: "editor.source_help",
  average: "editor.average_help",
  range: "editor.range_help",
  mode: "editor.mode_help",
  include_goal: "editor.include_goal_help",
  min: "editor.axis_bound_help",
  max: "editor.axis_bound_help",
};

export function computeLabel(
  hass: HomeAssistant | undefined,
  schema: { name: string; title?: string },
): string {
  const key = LABEL_KEYS[schema.name];
  return key ? localize(hass, key) : (schema.title ?? schema.name);
}

export function computeHelper(
  hass: HomeAssistant | undefined,
  schema: { name: string },
): string | undefined {
  const key = HELPER_KEYS[schema.name];
  return key ? localize(hass, key) : undefined;
}
