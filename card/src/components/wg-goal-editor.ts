import { LitElement, css, html, nothing, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { attributeOf } from "../lib/format";
import { entityLabel, localize } from "../localize";
import { sharedStyles } from "../shared-styles";
import { errorMessage } from "./wg-actions";
import type { GoalModel } from "../lib/goal";
import type { HomeAssistant } from "../types";

/**
 * Editing the goal itself.
 *
 * Target weight and rate per week are two views of the same thing; the
 * integration decides which one is authoritative and derives the other. The
 * derived one is rendered read only and says so, using the `goal_mode`
 * attribute the status sensor exposes. On an older integration that attribute
 * is missing, in which case both stay editable and a rejected write is shown as
 * an error rather than guessed at.
 */
@customElement("wg-goal-editor")
export class WgGoalEditor extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @property({ attribute: false }) public model?: GoalModel;

  @property({ type: Boolean }) public open = false;

  @state() private _error: string | null = null;

  protected override render(): TemplateResult | typeof nothing {
    const model = this.model;
    if (!model || !this.hass) {
      return nothing;
    }
    const entities = model.context.entities;
    const mode = model.goalMode;

    return html`
      <details ?open=${this.open}>
        <summary>
          <ha-icon icon="mdi:target"></ha-icon>
          <span>${localize(this.hass, "goal.title")}</span>
        </summary>
        <div class="grid">
          ${this._numberRow(entities.start_weight, model.unit, false)}
          ${this._numberRow(entities.target_weight, model.unit, mode === "rate")}
          ${this._numberRow(
            entities.rate_per_week,
            `${model.unit}/w`,
            mode === "target",
            0.01,
          )}
          ${this._dateRow(entities.start_date)}
          ${this._dateRow(entities.end_date)}
        </div>
        ${mode === null
          ? nothing
          : html`<p id="derived" class="hint muted">
              ${localize(this.hass, "goal.derived_hint")}
            </p>`}
        ${this._error
          ? html`<div class="error" role="alert">${this._error}</div>`
          : nothing}
      </details>
    `;
  }

  /**
   * One field of the goal.
   *
   * `derived` and unavailable both disable the input, but only the first one
   * is worth explaining: a greyed out box with no reason next to it reads as a
   * bug, which is why the field says so and points at the hint below the grid.
   */
  private _numberRow(
    entityId: string | undefined,
    unit: string,
    derived: boolean,
    step = 0.1,
  ) {
    if (!entityId || !this.hass) {
      return nothing;
    }
    const state = this.hass.states[entityId];
    if (!state) {
      return nothing;
    }
    return html`<label class="field">
      <span class="muted">
        ${entityLabel(this.hass, entityId, this.model?.context.name)}
        ${derived
          ? html`<span class="tag">${localize(this.hass, "goal.derived")}</span>`
          : nothing}
      </span>
      <span class="input">
        <input
          type="number"
          step=${step}
          min=${attributeOf<number>(this.hass, entityId, "min") ?? 0}
          max=${attributeOf<number>(this.hass, entityId, "max") ?? 1000}
          .value=${state.state === "unknown" ? "" : state.state}
          ?disabled=${derived || state.state === "unavailable"}
          aria-describedby=${derived ? "derived" : nothing}
          @change=${(event: Event) =>
            this._setNumber(entityId, (event.target as HTMLInputElement).value)}
        />
        <span class="unit muted">${unit}</span>
      </span>
    </label>`;
  }

  private _dateRow(entityId: string | undefined) {
    if (!entityId || !this.hass?.states[entityId]) {
      return nothing;
    }
    const state = this.hass.states[entityId];
    return html`<label class="field">
      <span class="muted"
        >${entityLabel(this.hass, entityId, this.model?.context.name)}</span
      >
      <span class="input">
        <input
          type="date"
          .value=${state.state === "unknown" || state.state === "unavailable" ? "" : state.state}
          ?disabled=${state.state === "unavailable"}
          @change=${(event: Event) =>
            this._setDate(entityId, (event.target as HTMLInputElement).value)}
        />
      </span>
    </label>`;
  }

  private async _setNumber(entityId: string, raw: string): Promise<void> {
    const value = Number(raw.replace(",", "."));
    if (!this.hass || !Number.isFinite(value)) {
      return;
    }
    try {
      await this.hass.callService("number", "set_value", { value }, { entity_id: entityId });
      this._error = null;
    } catch (error) {
      this._error = errorMessage(this.hass, error);
    }
  }

  private async _setDate(entityId: string, value: string): Promise<void> {
    if (!this.hass || !value) {
      return;
    }
    try {
      await this.hass.callService("date", "set_value", { date: value }, { entity_id: entityId });
      this._error = null;
    } catch (error) {
      this._error = errorMessage(this.hass, error);
    }
  }

  public static override styles = [
    sharedStyles,
    css`
      details {
        border-top: 1px solid var(--divider-color, #e0e0e0);
        padding-top: 6px;
      }
      summary {
        display: flex;
        align-items: center;
        gap: 6px;
        min-height: 40px;
        font-size: 14px;
        cursor: pointer;
        list-style: none;
      }
      summary::-webkit-details-marker {
        display: none;
      }
      summary ha-icon {
        --mdc-icon-size: 18px;
        color: var(--secondary-text-color, #727272);
      }
      summary::after {
        content: "";
        margin-left: auto;
        width: 8px;
        height: 8px;
        border-right: 2px solid var(--secondary-text-color, #727272);
        border-bottom: 2px solid var(--secondary-text-color, #727272);
        transform: rotate(45deg) translateY(-2px);
      }
      details[open] summary::after {
        transform: rotate(-135deg) translateY(-2px);
      }
      .grid {
        display: grid;
        gap: 8px;
        padding: 4px 0 8px;
      }
      .field {
        display: grid;
        grid-template-columns: 1fr minmax(120px, 46%);
        align-items: center;
        gap: 10px;
        font-size: 13px;
      }
      .input {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .input input {
        width: 100%;
        min-width: 0;
      }
      .unit {
        font-size: 12px;
        flex: 0 0 auto;
      }
      .tag {
        margin-left: 6px;
        padding: 1px 6px;
        border-radius: 8px;
        background: var(--secondary-background-color, #f2f2f2);
        font-size: 11px;
        white-space: nowrap;
      }
      .hint {
        margin: 0 0 8px;
        font-size: 12px;
        line-height: 1.4;
      }
      .error {
        padding: 8px 10px;
        border-radius: 8px;
        background: var(--error-color, #db4437);
        color: var(--text-primary-color, #fff);
        font-size: 13px;
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "wg-goal-editor": WgGoalEditor;
  }
}
