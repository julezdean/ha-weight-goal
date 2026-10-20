import { LitElement, css, html, nothing, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { DOMAIN } from "../const";
import { formatDate, formatNumber } from "../lib/format";
import { todayInZone, zonedMidnight } from "../lib/plan";
import { localize } from "../localize";
import { sharedStyles } from "../shared-styles";
import { errorMessage } from "./wg-actions";
import type { GoalModel } from "../lib/goal";
import type { GoalSummary, HomeAssistant } from "../types";

/** Where goals are added, changed and deleted: the integration's own page. */
const INTEGRATION_PATH = `/config/integrations/integration/${DOMAIN}`;

/**
 * Every goal of the person, with the outcome of the finished ones.
 *
 * Only a view and a switch. Adding, changing and deleting goals happens in
 * Home Assistant's own dialogs on the integration page, which already know
 * how to ask for a name, validate it and confirm a deletion; the card links
 * there instead of growing a second copy of them.
 */
@customElement("wg-goals")
export class WgGoals extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @property({ attribute: false }) public model?: GoalModel;

  @state() private _error: string | null = null;

  protected override render(): TemplateResult | typeof nothing {
    const model = this.model;
    const hass = this.hass;
    if (!model || !hass || !model.context.entities.active_goal) {
      return nothing;
    }
    // Latest start first: the goal someone is most likely to look for is the
    // current one, and the list only grows at that end.
    const goals = [...model.goals].reverse();

    return html`
      <details>
        <summary>
          <ha-icon icon="mdi:flag-checkered"></ha-icon>
          <span>${localize(hass, "goals.title")}</span>
          <span class="count muted">${goals.length}</span>
        </summary>
        ${goals.length
          ? html`<ul>
              ${goals.map((goal) => this._renderGoal(goal))}
            </ul>`
          : html`<p class="hint muted">${localize(hass, "goals.empty")}</p>`}
        ${this._error
          ? html`<div class="error" role="alert">${this._error}</div>`
          : nothing}
        <p class="hint muted">
          <a href=${INTEGRATION_PATH} @click=${this._navigate}
            >${localize(hass, "goals.manage")}</a
          >
        </p>
      </details>
    `;
  }

  private _renderGoal(goal: GoalSummary): TemplateResult {
    const hass = this.hass!;
    const unit = this.model?.unit ?? "kg";
    return html`<li class=${goal.active ? "active" : ""}>
      <div class="line">
        <span class="name">
          ${goal.name}
          ${goal.active
            ? html`<span class="tag">${localize(hass, "goals.active")}</span>`
            : nothing}
        </span>
        ${this._renderOutcome(goal)}
      </div>
      <div class="line">
        <span class="muted details">
          <span class="nowrap">${this._period(goal)}</span>
          <span class="nowrap"
            >${formatNumber(hass, goal.startWeight, 1)} →
            ${formatNumber(hass, goal.targetWeight, 1)} ${unit}</span
          >
        </span>
        ${goal.active
          ? nothing
          : html`<button class="control small" @click=${() => this._activate(goal)}>
              ${localize(hass, "goals.activate")}
            </button>`}
      </div>
    </li>`;
  }

  private _period(goal: GoalSummary): string {
    const hass = this.hass;
    const zone = hass?.config?.time_zone ?? "UTC";
    const day = (iso: string | null): string =>
      formatDate(hass, iso ? zonedMidnight(iso, zone) : null, true);
    return `${day(goal.startDate)} – ${day(goal.endDate)}`;
  }

  /** The outcome once the goal is over, or where it stands until then. */
  private _renderOutcome(goal: GoalSummary): TemplateResult {
    const hass = this.hass!;
    const result = goal.result;
    if (result) {
      const key = result.reached ? "goals.reached" : "goals.missed";
      return html`<span class="outcome ${result.reached ? "reached" : ""}">
        <ha-icon
          icon=${result.reached ? "mdi:check-circle-outline" : "mdi:close-circle-outline"}
        ></ha-icon>
        ${localize(hass, key, {
          value: formatNumber(hass, result.weight, 1),
          unit: this.model?.unit ?? "kg",
        })}
      </span>`;
    }
    const today = todayInZone(hass.config?.time_zone);
    let key: "goals.planned" | "goals.running" | "goals.no_reading" = "goals.running";
    if (goal.startDate && today < goal.startDate) {
      key = "goals.planned";
    } else if (goal.endDate && today > goal.endDate) {
      key = "goals.no_reading";
    }
    return html`<span class="outcome muted">${localize(hass, key)}</span>`;
  }

  private async _activate(goal: GoalSummary): Promise<void> {
    const entityId = this.model?.context.entities.active_goal;
    if (!this.hass || !entityId) {
      return;
    }
    try {
      await this.hass.callService(
        "select",
        "select_option",
        { option: goal.name },
        { entity_id: entityId },
      );
      this._error = null;
    } catch (error) {
      this._error = errorMessage(this.hass, error);
    }
  }

  /** Stay inside the frontend instead of reloading the whole page. */
  private _navigate = (event: MouseEvent): void => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.button !== 0) {
      return;
    }
    event.preventDefault();
    history.pushState(null, "", INTEGRATION_PATH);
    window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: false } }));
  };

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
      .count {
        font-size: 12px;
      }
      ul {
        display: grid;
        gap: 8px;
        margin: 0;
        padding: 4px 0 8px;
        list-style: none;
      }
      li {
        display: grid;
        gap: 2px;
        padding: 8px 10px;
        border-radius: 10px;
        background: var(--secondary-background-color, #f2f2f2);
      }
      li.active {
        box-shadow: inset 3px 0 0 var(--primary-color, #03a9f4);
      }
      .line {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        min-width: 0;
      }
      .name {
        font-size: 14px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .details {
        display: flex;
        flex-wrap: wrap;
        column-gap: 10px;
        font-size: 12px;
        min-width: 0;
      }
      /* Wraps between the period and the weights, never inside either. */
      .nowrap {
        white-space: nowrap;
      }
      .outcome {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        flex: 0 0 auto;
        font-size: 12px;
        white-space: nowrap;
      }
      .outcome ha-icon {
        --mdc-icon-size: 16px;
        color: var(--secondary-text-color, #727272);
      }
      .outcome.reached ha-icon {
        color: var(--success-color, #43a047);
      }
      .tag {
        margin-left: 6px;
        padding: 1px 6px;
        border-radius: 8px;
        background: var(--card-background-color, #fff);
        font-size: 11px;
        white-space: nowrap;
      }
      button.control.small {
        flex: 0 0 auto;
        min-height: 36px;
        padding: 0 12px;
        background: var(--card-background-color, #fff);
        font-size: 13px;
      }
      .hint {
        margin: 0 0 8px;
        font-size: 12px;
        line-height: 1.4;
      }
      .hint a {
        color: var(--primary-color, #03a9f4);
      }
      .error {
        margin-bottom: 8px;
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
    "wg-goals": WgGoals;
  }
}
