import { css, html, nothing, type TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";

import { CARD_TYPE } from "../const";
import { sharedStyles } from "../shared-styles";
import { WeightGoalBaseCard } from "./base";
import type { ChartOptions, WeightGoalCardConfig } from "../types";

import "../components/wg-actions";
import "../components/wg-badges";
import "../components/wg-chart";
import "../components/wg-goal-editor";
import "../components/wg-header";
import "../components/wg-hero";
import "../components/wg-progress";

@customElement(CARD_TYPE)
export class WeightGoalCard extends WeightGoalBaseCard<WeightGoalCardConfig> {
  public static getStubConfig(
    _hass: unknown,
    entities: string[],
  ): Partial<WeightGoalCardConfig> {
    const status = entities.find((id) => id.endsWith("_status"));
    return { type: `custom:${CARD_TYPE}`, entity: status ?? entities[0] };
  }

  public static async getConfigElement(): Promise<HTMLElement> {
    await import("../editors/weight-goal-card-editor");
    return document.createElement(`${CARD_TYPE}-editor`);
  }

  protected chartOptions(): ChartOptions {
    const config = this._config ?? ({} as WeightGoalCardConfig);
    // Both the flat form (`range: 90`) and the nested one (`chart: {range: 90}`)
    // are accepted; the nested one wins so it can override a shared default.
    const flat: ChartOptions = {
      source: config.source,
      range: config.range,
      average: config.average,
      line: config.line,
      height: config.height,
      y_axis: config.y_axis,
      show: config.show,
      styles: config.styles,
    };
    const nested = config.chart ?? {};
    return {
      ...flat,
      ...nested,
      y_axis: { ...(flat.y_axis ?? {}), ...(nested.y_axis ?? {}) },
      show: { ...(flat.show ?? {}), ...(nested.show ?? {}) },
      styles: { ...(flat.styles ?? {}), ...(nested.styles ?? {}) },
    };
  }

  protected needsMeasurements(): boolean {
    return this._config?.show_chart !== false;
  }

  public getCardSize(): number {
    let size = 2;
    if (this._config?.show_chart !== false) size += 3;
    if (this._config?.show_progress !== false) size += 1;
    if (this._config?.show_actions !== false) size += 1;
    return size;
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

    const showChart = config.show_chart !== false;
    const showActions = config.show_actions !== false;

    return html`
      <ha-card>
        <div class="content">
          ${config.show_header === false
            ? nothing
            : html`<wg-header
                .hass=${this.hass}
                .model=${model}
                .name=${config.name ?? model.context.name}
                .icon=${config.icon}
                ?compact=${config.header === "compact"}
              ></wg-header>`}

          ${config.show_hero === false
            ? nothing
            : html`<wg-hero .hass=${this.hass} .model=${model}></wg-hero>`}

          ${config.show_badges === false
            ? nothing
            : html`<wg-badges
                .hass=${this.hass}
                .model=${model}
                .badges=${config.badges}
              ></wg-badges>`}

          ${showChart
            ? html`
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
              `
            : nothing}

          ${config.show_progress === false
            ? nothing
            : html`<wg-progress .hass=${this.hass} .model=${model}></wg-progress>`}

          ${showActions
            ? html`<wg-actions
                .hass=${this.hass}
                .model=${model}
                .showRecord=${config.show_record !== false}
                .showRestart=${config.show_restart !== false}
              ></wg-actions>`
            : nothing}

          ${config.show_goal_editor === false
            ? nothing
            : html`<wg-goal-editor
                .hass=${this.hass}
                .model=${model}
                .open=${model.status === "no_goal"}
              ></wg-goal-editor>`}
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
        gap: 14px;
        padding: 16px;
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
    "weight-goal-card": WeightGoalCard;
  }
}
