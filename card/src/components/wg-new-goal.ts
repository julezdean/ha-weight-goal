import { LitElement, css, html, nothing, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { DOMAIN } from "../const";
import { formatInput, parseDecimal } from "../lib/format";
import { todayInZone } from "../lib/plan";
import { translator } from "../localize";
import { sharedStyles } from "../shared-styles";
import { errorMessage } from "./wg-actions";
import type { GoalModel } from "../lib/goal";
import type { HomeAssistant } from "../types";

interface Draft {
  name: string;
  mode: "target" | "rate";
  startDate: string;
  startWeight: string;
  endDate: string;
  value: string;
  activate: boolean;
}

/**
 * Adding a goal from the dashboard.
 *
 * The integration page has the same dialog, but only an administrator can
 * reach it, and a goal is something everyone in the household may want to set
 * for themselves. This form sends `weight_goal.create_goal`, so the checks and
 * their messages are the integration's, not a second copy kept in the card.
 *
 * Start date and start weight are only suggested: today and the latest
 * reading are the usual answer, not the only one, which is why there is no
 * "new goal from today" that would fix them.
 */
@customElement("wg-new-goal")
export class WgNewGoal extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @property({ attribute: false }) public model?: GoalModel;

  @state() private _draft: Draft | null = null;

  @state() private _error: string | null = null;

  @state() private _busy = false;

  protected override render(): TemplateResult | typeof nothing {
    const hass = this.hass;
    const model = this.model;
    if (!hass || !model?.context.target) {
      return nothing;
    }
    const t = translator(hass);
    const draft = this._draft;
    if (!draft) {
      return html`<button class="control open" @click=${this._open}>
        <ha-icon icon="mdi:plus"></ha-icon>
        <span>${t("goals.new")}</span>
      </button>`;
    }

    const unit = model.unit;
    const rate = draft.mode === "rate";
    return html`
      <form class="form" @submit=${this._submit} novalidate>
        <label class="field wide">
          <span class="muted">${t("goals.form.name")}</span>
          <input
            type="text"
            autocomplete="off"
            .value=${draft.name}
            @input=${(e: Event) => this._set("name", (e.target as HTMLInputElement).value)}
          />
        </label>
        <label class="field wide">
          <span class="muted">${t("goals.form.mode")}</span>
          <select
            .value=${draft.mode}
            @change=${(e: Event) =>
              this._set("mode", (e.target as HTMLSelectElement).value as Draft["mode"])}
          >
            <option value="target" ?selected=${!rate}>${t("goals.form.mode_target")}</option>
            <option value="rate" ?selected=${rate}>${t("goals.form.mode_rate")}</option>
          </select>
        </label>
        <label class="field">
          <span class="muted">${t("goals.form.start_date")}</span>
          <input
            type="date"
            class=${hass.themes?.darkMode ? "dark" : ""}
            .value=${draft.startDate}
            @input=${(e: Event) => this._set("startDate", (e.target as HTMLInputElement).value)}
          />
        </label>
        <label class="field">
          <span class="muted">${t("goals.form.start_weight", { unit })}</span>
          <input
            type="text"
            inputmode="decimal"
            autocomplete="off"
            .value=${draft.startWeight}
            @input=${(e: Event) => this._set("startWeight", (e.target as HTMLInputElement).value)}
          />
        </label>
        <label class="field">
          <span class="muted">${t("goals.form.end_date")}</span>
          <input
            type="date"
            class=${hass.themes?.darkMode ? "dark" : ""}
            .value=${draft.endDate}
            @input=${(e: Event) => this._set("endDate", (e.target as HTMLInputElement).value)}
          />
        </label>
        <label class="field">
          <span class="muted"
            >${rate
              ? t("goals.form.rate", { unit })
              : t("goals.form.target_weight", { unit })}</span
          >
          <input
            type="text"
            inputmode=${rate ? "text" : "decimal"}
            autocomplete="off"
            .value=${draft.value}
            @input=${(e: Event) => this._set("value", (e.target as HTMLInputElement).value)}
          />
        </label>
        <label class="check wide">
          <input
            type="checkbox"
            .checked=${draft.activate}
            @change=${(e: Event) => this._set("activate", (e.target as HTMLInputElement).checked)}
          />
          <span>${t("goals.form.activate")}</span>
        </label>
        ${this._error
          ? html`<div class="error wide" role="alert">${this._error}</div>`
          : nothing}
        <div class="buttons wide">
          <button type="button" class="control" ?disabled=${this._busy} @click=${this._close}>
            ${t("goals.form.cancel")}
          </button>
          <button type="submit" class="control primary" ?disabled=${this._busy}>
            <ha-icon icon="mdi:check"></ha-icon>
            <span>${t("goals.form.save")}</span>
          </button>
        </div>
      </form>
    `;
  }

  private _open = (): void => {
    const hass = this.hass;
    const current = this.model?.currentWeight ?? null;
    this._draft = {
      name: "",
      mode: "target",
      startDate: todayInZone(hass?.config?.time_zone),
      startWeight: current === null ? "" : formatInput(hass, current),
      endDate: "",
      value: "",
      activate: true,
    };
    this._error = null;
  };

  private _close = (): void => {
    this._draft = null;
    this._error = null;
  };

  private _set<K extends keyof Draft>(key: K, value: Draft[K]): void {
    if (this._draft) {
      this._draft = { ...this._draft, [key]: value };
    }
  }

  private _submit = async (event: Event): Promise<void> => {
    event.preventDefault();
    const hass = this.hass;
    const draft = this._draft;
    const target = this.model?.context.target;
    if (!hass || !draft || !target) {
      return;
    }
    const t = translator(hass);
    const value = parseDecimal(draft.value);
    const startWeight = draft.startWeight.trim() ? parseDecimal(draft.startWeight) : null;
    // Only what the integration cannot say better itself: an empty or
    // unreadable number would otherwise arrive as a schema error in English.
    if (!draft.endDate || value === null || (draft.startWeight.trim() && startWeight === null)) {
      this._error = t("goals.form.incomplete");
      return;
    }

    const data: Record<string, unknown> = {
      name: draft.name,
      goal_mode: draft.mode,
      end_date: draft.endDate,
      activate: draft.activate,
      [draft.mode === "rate" ? "rate_per_week" : "target_weight"]: value,
    };
    if (draft.startDate) data.start_date = draft.startDate;
    if (startWeight !== null) data.start_weight = startWeight;

    this._busy = true;
    try {
      await hass.callService(DOMAIN, "create_goal", data, { entity_id: target });
      this._close();
    } catch (error) {
      this._error = errorMessage(hass, error);
    } finally {
      this._busy = false;
    }
  };

  public static override styles = [
    sharedStyles,
    css`
      button.control.open {
        width: 100%;
        margin-bottom: 8px;
      }
      button.control ha-icon {
        --mdc-icon-size: 18px;
      }
      .form {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px 10px;
        margin-bottom: 10px;
        padding: 10px;
        border-radius: 10px;
        background: var(--secondary-background-color, #f2f2f2);
      }
      .wide {
        grid-column: 1 / -1;
      }
      .field {
        display: grid;
        gap: 4px;
        min-width: 0;
        font-size: 12px;
      }
      .field input,
      .field select {
        width: 100%;
        min-width: 0;
      }
      select {
        min-height: 44px;
        box-sizing: border-box;
        padding: 0 10px;
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 10px;
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color, #212121);
        font: inherit;
        font-size: 14px;
      }
      input[type="date"] {
        color-scheme: light;
      }
      input[type="date"].dark {
        color-scheme: dark;
      }
      .check {
        display: flex;
        align-items: center;
        gap: 8px;
        min-height: 36px;
        font-size: 13px;
      }
      .check input {
        min-height: 0;
        width: 18px;
        height: 18px;
        margin: 0;
      }
      .buttons {
        display: flex;
        gap: 8px;
      }
      .buttons button {
        flex: 1 1 0;
      }
      /* The form sits on the colour of a plain button already. */
      .buttons button:not(.primary) {
        background: var(--card-background-color, #fff);
      }
      .error {
        padding: 8px 10px;
        border-radius: 8px;
        background: var(--error-color, #db4437);
        color: var(--text-primary-color, #fff);
        font-size: 13px;
      }
      /* Two columns of date fields do not fit a narrow card. */
      @container (max-width: 300px) {
        .form {
          grid-template-columns: 1fr;
        }
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "wg-new-goal": WgNewGoal;
  }
}
