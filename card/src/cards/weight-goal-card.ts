import { css, html, nothing, type TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";

import { CARD_TYPE } from "../const";
import { sharedStyles } from "../shared-styles";
import { WeightGoalBaseCard } from "./base";
import {
  GestureHandler,
  hasAction,
  hasCardActions,
  isActionable,
  type ActionKind,
} from "../lib/actions";
import type { ChartOptions, WeightGoalCardConfig } from "../types";

import "../components/wg-actions";
import "../components/wg-badges";
import "../components/wg-chart";
import "../components/wg-goal-editor";
import "../components/wg-goals";
import "../components/wg-header";
import "../components/wg-hero";
import "../components/wg-progress";

@customElement(CARD_TYPE)
export class WeightGoalCard extends WeightGoalBaseCard<WeightGoalCardConfig> {
  private _gestures = new GestureHandler({
    enabled: () => hasCardActions(this._config),
    hold: () => hasAction(this._config?.hold_action),
    doubleTap: () => hasAction(this._config?.double_tap_action),
    fire: (action) => this._fireAction(action),
  });

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

  public override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._gestures.reset();
  }

  /**
   * Home Assistant carries the action out, from the card's own config: it
   * picks the `<action>_action` that belongs to the gesture, asks for
   * `confirmation`, and falls back to more-info of `entity` for a tap that has
   * none.
   */
  private _fireAction(action: ActionKind): void {
    if (!this._config) {
      return;
    }
    this.dispatchEvent(
      new CustomEvent("hass-action", {
        detail: { config: this._config, action },
        bubbles: true,
        composed: true,
      }),
    );
  }

  public getCardSize(): number {
    let size = 2;
    if (this._config?.show_chart !== false) size += 3;
    if (this._config?.show_progress !== false) size += 1;
    if (this._config?.show_record !== false) size += 1;
    if (this._config?.show_goals !== false) size += 1;
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
    // Rendered at all only when something can appear in it: an element that
    // returns nothing is still a flex item, and the column gap around it
    // would leave a hole where the actions are not.
    const showActions = config.show_record !== false;
    // Once the card has actions of its own they cover all of it, so the
    // sections stop opening more-info on their own: one tap, one dialog.
    const passive = hasCardActions(config);
    const actionable = isActionable(config);
    const g = this._gestures;

    return html`
      <ha-card
        class=${actionable ? "actionable" : ""}
        role=${actionable ? "button" : nothing}
        tabindex=${actionable ? "0" : nothing}
        aria-label=${actionable ? (config.name ?? model.context.name) : nothing}
        @pointerdown=${g.down}
        @pointermove=${g.move}
        @pointerup=${g.up}
        @pointercancel=${g.cancel}
        @contextmenu=${g.contextMenu}
        @keydown=${g.key}
      >
        <div class="content">
          ${config.show_header === false
            ? nothing
            : html`<wg-header
                .hass=${this.hass}
                .model=${model}
                .name=${config.name ?? model.context.name}
                .icon=${config.icon}
                ?compact=${config.header === "compact"}
                ?passive=${passive}
              ></wg-header>`}

          ${config.show_hero === false
            ? nothing
            : html`<wg-hero
                .hass=${this.hass}
                .model=${model}
                ?passive=${passive}
              ></wg-hero>`}

          ${config.show_badges === false
            ? nothing
            : html`<wg-badges
                .hass=${this.hass}
                .model=${model}
                .badges=${config.badges}
                ?passive=${passive}
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
                .showRecordDate=${config.show_record_date !== false}
              ></wg-actions>`
            : nothing}

          ${config.show_goal_editor === false
            ? nothing
            : html`<wg-goal-editor
                .hass=${this.hass}
                .model=${model}
                .open=${model.status === "no_goal"}
              ></wg-goal-editor>`}

          ${config.show_goals === false
            ? nothing
            : html`<wg-goals .hass=${this.hass} .model=${model}></wg-goals>`}
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
      ha-card.actionable {
        cursor: pointer;
      }
      ha-card.actionable:focus-visible {
        outline: 2px solid var(--primary-color, #03a9f4);
        outline-offset: 2px;
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
