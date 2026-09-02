import { css, html, nothing, type TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";

import { CHART_CARD_TYPE, STATUS_COLOR } from "../const";
import { formatNumber } from "../lib/format";
import { sharedStyles } from "../shared-styles";
import { WeightGoalBaseCard } from "./base";
import type { ChartOptions, WeightGoalChartCardConfig } from "../types";

import "../components/wg-chart";

/**
 * The chart on its own, for dashboards that already show the numbers elsewhere
 * or want the trajectory at a different size. Same component, same cache: two
 * cards for one goal make one request.
 */
@customElement(CHART_CARD_TYPE)
export class WeightGoalChartCard extends WeightGoalBaseCard<WeightGoalChartCardConfig> {
  public static getStubConfig(
    _hass: unknown,
    entities: string[],
  ): Partial<WeightGoalChartCardConfig> {
    const status = entities.find((id) => id.endsWith("_status"));
    return { type: `custom:${CHART_CARD_TYPE}`, entity: status ?? entities[0] };
  }

  public static async getConfigElement(): Promise<HTMLElement> {
    await import("../editors/weight-goal-chart-card-editor");
    return document.createElement(`${CHART_CARD_TYPE}-editor`);
  }

  protected chartOptions(): ChartOptions {
    const config = this._config ?? ({} as WeightGoalChartCardConfig);
    return {
      source: config.source,
      range: config.range,
      average: config.average,
      line: config.line,
      height: config.height ?? 220,
      y_axis: config.y_axis,
      show: config.show,
      styles: config.styles,
    };
  }

  protected needsMeasurements(): boolean {
    return true;
  }

  public getCardSize(): number {
    return 4;
  }

  protected override render(): TemplateResult {
    const problem = this.missingGoalMessage();
    if (problem) {
      return this.renderProblem(problem);
    }
    const model = this._model;
    const config = this._config;
    if (!model || !config || !this.hass) {
      return html`<ha-card></ha-card>`;
    }

    return html`
      <ha-card>
        <div class="content">
          ${config.show_title === false
            ? nothing
            : html`<div class="title">
                <span class="name">${config.name ?? model.context.name}</span>
                ${model.currentWeight === null
                  ? nothing
                  : html`<span
                      class="now"
                      style=${`color:${STATUS_COLOR[model.status] ?? ""}`}
                      >${formatNumber(this.hass, model.currentWeight, 1)}
                      ${model.unit}</span
                    >`}
              </div>`}
          ${this._fetchError
            ? html`<div class="notice" role="alert">${this._fetchError}</div>`
            : nothing}
          <wg-chart
            .hass=${this.hass}
            .model=${model}
            .measurements=${this._measurements}
            .options=${this.chartOptions()}
            .loading=${this._loading}
          ></wg-chart>
        </div>
      </ha-card>
    `;
  }

  public static override styles = [
    sharedStyles,
    css`
      ha-card {
        container-type: inline-size;
        overflow: hidden;
      }
      .content {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 16px;
      }
      .title {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 10px;
      }
      .name {
        font-size: 15px;
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .now {
        font-size: 15px;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
      }
      .notice {
        padding: 8px 10px;
        border-radius: 8px;
        background: var(--secondary-background-color, #f2f2f2);
        color: var(--secondary-text-color, #727272);
        font-size: 12px;
      }
      .problem {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 16px;
        color: var(--secondary-text-color, #727272);
        font-size: 14px;
        line-height: 1.45;
      }
      .problem ha-icon {
        flex: 0 0 auto;
        color: var(--warning-color, #ffa726);
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "weight-goal-chart-card": WeightGoalChartCard;
  }
}
