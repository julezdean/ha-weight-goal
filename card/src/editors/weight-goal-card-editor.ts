import { LitElement, css, html, nothing, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { CARD_TYPE } from "../const";
import { DEFAULT_BADGES } from "../lib/badges";
import { localize, translator } from "../localize";
import {
  anchorSchema,
  badgeSchema,
  chartSchema,
  computeHelper,
  computeLabel,
  ensureFormLoaded,
  type FormSchema,
} from "./schema";
import type { HomeAssistant, WeightGoalCardConfig } from "../types";

@customElement(`${CARD_TYPE}-editor`)
export class WeightGoalCardEditor extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: WeightGoalCardConfig;

  @state() private _ready = false;

  public setConfig(config: WeightGoalCardConfig): void {
    this._config = config;
  }

  public override connectedCallback(): void {
    super.connectedCallback();
    void ensureFormLoaded().then(() => {
      this._ready = true;
    });
  }

  private _schema(): FormSchema[] {
    const t = translator(this.hass);
    return [
      ...anchorSchema(),
      badgeSchema(this.hass),
      {
        name: "",
        type: "expandable",
        title: t("editor.sections"),
        schema: [
          {
            name: "",
            type: "grid",
            schema: [
              { name: "show_header", selector: { boolean: {} } },
              { name: "show_hero", selector: { boolean: {} } },
              { name: "show_badges", selector: { boolean: {} } },
              { name: "show_chart", selector: { boolean: {} } },
              { name: "show_progress", selector: { boolean: {} } },
              { name: "show_actions", selector: { boolean: {} } },
              { name: "show_goal_editor", selector: { boolean: {} } },
            ],
          },
          {
            name: "header",
            selector: {
              select: {
                mode: "dropdown",
                options: [
                  { value: "full", label: t("editor.header_full") },
                  { value: "compact", label: t("editor.header_compact") },
                ],
              },
            },
          },
        ],
      },
      {
        name: "",
        type: "expandable",
        title: t("editor.chart"),
        schema: chartSchema(t),
      },
    ];
  }

  protected override render(): TemplateResult | typeof nothing {
    if (!this.hass || !this._config) {
      return nothing;
    }
    if (!this._ready && !customElements.get("ha-form")) {
      return html`<p class="fallback">
        ${localize(this.hass, "editor.loading")}
      </p>`;
    }
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._defaults()}
        .schema=${this._schema()}
        .computeLabel=${(schema: { name: string; title?: string }) =>
          computeLabel(this.hass, schema)}
        .computeHelper=${(schema: { name: string }) =>
          computeHelper(this.hass, schema)}
        @value-changed=${this._changed}
      ></ha-form>
    `;
  }

  /** `ha-form` renders an unset boolean as off, which would read as "hidden"
   * for sections that are shown by default. */
  private _defaults(): WeightGoalCardConfig {
    const config = this._config!;
    return {
      show_header: true,
      header: "full",
      show_hero: true,
      show_badges: true,
      show_chart: true,
      show_progress: true,
      show_actions: true,
      show_goal_editor: true,
      source: "measurements",
      range: "goal",
      line: "smooth",
      average: 7,
      ...config,
      // Custom badges are objects, which the multi-select cannot represent.
      // Showing only the built-in ones keeps the picker honest; the object
      // form stays available in YAML and is restored on change.
      badges: (config.badges ?? DEFAULT_BADGES).filter(
        (badge) => typeof badge === "string",
      ),
      y_axis: { mode: "nice", include_goal: true, ...(config.y_axis ?? {}) },
      show: {
        band: true,
        plan: true,
        average: true,
        projection: true,
        points: true,
        today: true,
        grid: true,
        axis: true,
        ...(config.show ?? {}),
      },
    };
  }

  private _changed = (event: CustomEvent): void => {
    event.stopPropagation();
    const value = { ...(event.detail.value as WeightGoalCardConfig) };
    if (typeof value.range === "string" && /^\d+$/.test(value.range)) {
      value.range = Number(value.range);
    }
    // Custom badges were filtered out for the picker; put them back so editing
    // an unrelated field does not silently delete them.
    const custom = (this._config?.badges ?? []).filter(
      (badge) => typeof badge === "object",
    );
    if (custom.length) {
      value.badges = [...(value.badges ?? []), ...custom];
    }
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: value },
        bubbles: true,
        composed: true,
      }),
    );
  };

  public static override styles = css`
    .fallback {
      color: var(--secondary-text-color, #727272);
      font-size: 14px;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "weight-goal-card-editor": WeightGoalCardEditor;
  }
}
