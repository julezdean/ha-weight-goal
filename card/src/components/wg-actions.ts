import { LitElement, css, html, nothing, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { attributeOf } from "../lib/format";
import { localize, translator } from "../localize";
import { sharedStyles } from "../shared-styles";
import type { GoalModel } from "../lib/goal";
import type { HomeAssistant } from "../types";

/**
 * Both actions here are deliberately two step in the integration, and the card
 * keeps it that way: typing a weight stages it, pressing "Save reading" records
 * it. Collapsing that into one control would hand back exactly the mistyped
 * reading the integration is built to avoid.
 */
@customElement("wg-actions")
export class WgActions extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @property({ attribute: false }) public model?: GoalModel;

  @state() private _draft: string | null = null;

  @state() private _error: string | null = null;

  @state() private _busy = false;

  protected override render(): TemplateResult | typeof nothing {
    const model = this.model;
    if (!model || !this.hass) {
      return nothing;
    }
    const t = translator(this.hass);
    const entities = model.context.entities;
    const canEnter = model.manualAvailable && !!entities.manual_weight;
    const canStartToday = !!entities.start_today && model.goal !== null;

    if (!canEnter && !canStartToday) {
      return nothing;
    }

    const min = attributeOf<number>(this.hass, entities.manual_weight, "min") ?? 20;
    const max = attributeOf<number>(this.hass, entities.manual_weight, "max") ?? 300;
    const shown =
      this._draft ?? (model.manualWeight === null ? "" : String(model.manualWeight));

    return html`
      ${this._error
        ? html`<div class="error" role="alert">
            <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
            <span>${this._error}</span>
          </div>`
        : nothing}

      <div class="actions">
        ${canEnter
          ? html`
              <input
                type="number"
                inputmode="decimal"
                step="0.1"
                min=${min}
                max=${max}
                .value=${shown}
                aria-label=${t("actions.weight_input", { unit: model.unit })}
                placeholder=${model.unit}
                ?disabled=${this._busy}
                @input=${this._onInput}
                @keydown=${this._onKeydown}
              />
              <button
                class="control primary"
                ?disabled=${this._busy || !this._hasDraft(model)}
                @click=${() => this._save(model)}
              >
                <ha-icon icon="mdi:check"></ha-icon>
                <span>${t("actions.save")}</span>
              </button>
            `
          : nothing}
        ${canStartToday
          ? model.startTodayArmed
            ? html`<button
                  class="control confirm"
                  @click=${() => this._press(model, "confirm_start_today")}
                >
                  <ha-icon icon="mdi:check-bold"></ha-icon>
                  <span>${t("actions.confirm_restart")}</span>
                </button>`
            : html`<button
                class="control"
                title=${t("actions.restart_title")}
                @click=${() => this._press(model, "start_today")}
              >
                <ha-icon icon="mdi:calendar-arrow-right"></ha-icon>
                <span>${t("actions.restart")}</span>
              </button>`
          : nothing}
      </div>
      ${model.startTodayArmed
        ? html`<p class="hint muted">
            Confirming sets the start weight to your latest reading and the
            start date to today. The end date stays.
          </p>`
        : nothing}
    `;
  }

  private _hasDraft(model: GoalModel): boolean {
    if (this._draft !== null && this._draft !== "") {
      return true;
    }
    return model.manualPending;
  }

  private _onInput = (event: Event): void => {
    this._draft = (event.target as HTMLInputElement).value;
    this._error = null;
  };

  private _onKeydown = (event: KeyboardEvent): void => {
    if (event.key === "Enter" && this.model) {
      event.preventDefault();
      void this._save(this.model);
    }
  };

  /**
   * Records straight through `weight_goal.record_weight` rather than writing
   * the number entity and then pressing the button. One call, so a failure
   * cannot leave a staged value behind.
   */
  private async _save(model: GoalModel): Promise<void> {
    const target = model.context.target;
    if (!this.hass || !target) {
      return;
    }
    const raw = this._draft ?? String(model.manualWeight ?? "");
    const weight = Number(raw.replace(",", "."));
    if (!Number.isFinite(weight)) {
      this._error = localize(this.hass, "actions.enter_number");
      return;
    }
    this._busy = true;
    this._error = null;
    try {
      await this.hass.callService(
        "weight_goal",
        "record_weight",
        { weight },
        { entity_id: target },
      );
      this._draft = null;
    } catch (error) {
      this._error = errorMessage(this.hass, error);
    } finally {
      this._busy = false;
    }
  }

  private async _press(model: GoalModel, key: "start_today" | "confirm_start_today"): Promise<void> {
    const entityId = model.context.entities[key];
    if (!this.hass || !entityId) {
      return;
    }
    this._busy = true;
    try {
      await this.hass.callService("button", "press", {}, { entity_id: entityId });
      this._error = null;
    } catch (error) {
      this._error = errorMessage(this.hass, error);
    } finally {
      this._busy = false;
    }
  }

  public static override styles = [
    sharedStyles,
    css`
      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      input {
        flex: 1 1 90px;
        min-width: 80px;
      }
      button.control {
        flex: 1 1 auto;
      }
      button.control.confirm {
        background: var(--success-color, #43a047);
        color: var(--text-primary-color, #fff);
      }
      button.control ha-icon {
        --mdc-icon-size: 18px;
      }
      .hint {
        margin: 8px 0 0;
        font-size: 12px;
        line-height: 1.4;
      }
      .error {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 8px;
        padding: 8px 10px;
        border-radius: 8px;
        background: var(--error-color, #db4437);
        color: var(--text-primary-color, #fff);
        font-size: 13px;
      }
      @container (max-width: 320px) {
        button.control span {
          display: none;
        }
        button.control {
          flex: 0 0 44px;
        }
      }
    `,
  ];
}

/**
 * Home Assistant's own error messages are already translated, so they are
 * preferred over anything the card could say; only the fallback is ours.
 */
export function errorMessage(
  hass: HomeAssistant | undefined,
  error: unknown,
): string {
  if (error && typeof error === "object" && "message" in error) {
    const message = String((error as { message: unknown }).message);
    if (message) {
      return message;
    }
  }
  return localize(hass, "actions.failed");
}

declare global {
  interface HTMLElementTagNameMap {
    "wg-actions": WgActions;
  }
}
