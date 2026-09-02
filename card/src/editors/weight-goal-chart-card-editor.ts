import { LitElement, css, html, nothing, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { CHART_CARD_TYPE } from "../const";
import { localize, translator } from "../localize";
import {
  anchorSchema,
  chartSchema,
  computeHelper,
  computeLabel,
  ensureFormLoaded,
  type FormSchema,
} from "./schema";
import type { HomeAssistant, WeightGoalChartCardConfig } from "../types";

@customElement(`${CHART_CARD_TYPE}-editor`)
export class WeightGoalChartCardEditor extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: WeightGoalChartCardConfig;

  @state() private _ready = false;

  public setConfig(config: WeightGoalChartCardConfig): void {
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
      { name: "show_title", selector: { boolean: {} } },
      ...chartSchema(t),
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
        .data=${{
          show_title: true,
          source: "measurements",
          range: "goal",
          line: "smooth",
          average: 7,
          height: 220,
          ...this._config,
          y_axis: {
            mode: "nice",
            include_goal: true,
            ...(this._config.y_axis ?? {}),
          },
          show: {
            band: true,
            plan: true,
            average: true,
            projection: true,
            points: true,
            today: true,
            grid: true,
            axis: true,
            ...(this._config.show ?? {}),
          },
        }}
        .schema=${this._schema()}
        .computeLabel=${(schema: { name: string; title?: string }) =>
          computeLabel(this.hass, schema)}
        .computeHelper=${(schema: { name: string }) =>
          computeHelper(this.hass, schema)}
        @value-changed=${this._changed}
      ></ha-form>
    `;
  }

  private _changed = (event: CustomEvent): void => {
    event.stopPropagation();
    const value = { ...(event.detail.value as WeightGoalChartCardConfig) };
    if (typeof value.range === "string" && /^\d+$/.test(value.range)) {
      value.range = Number(value.range);
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
    "weight-goal-chart-card-editor": WeightGoalChartCardEditor;
  }
}
