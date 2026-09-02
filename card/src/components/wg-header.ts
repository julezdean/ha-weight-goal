import { LitElement, css, html, nothing, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";

import { STATUS_COLOR, STATUS_ICON } from "../const";
import { formatNumber, stateOf } from "../lib/format";
import { formatState, localize } from "../localize";
import { sharedStyles } from "../shared-styles";
import type { GoalModel } from "../lib/goal";
import type { HomeAssistant } from "../types";

@customElement("wg-header")
export class WgHeader extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @property({ attribute: false }) public model?: GoalModel;

  @property() public name = "";

  @property() public icon?: string;

  /** The one line form: the name and the current weight, nothing else. For a
   * card that is mostly chart, where the full header outweighs what it heads. */
  @property({ type: Boolean }) public compact = false;

  protected override render(): TemplateResult | typeof nothing {
    const model = this.model;
    if (!model) {
      return nothing;
    }
    const status = model.status;
    const colour = STATUS_COLOR[status] ?? STATUS_COLOR.no_goal;

    if (this.compact) {
      return html`
        <div class="compact">
          <span class="name" title=${this.name}>${this.name}</span>
          ${model.currentWeight === null
            ? nothing
            : html`<span class="now" style=${`color:${colour}`}
                >${formatNumber(this.hass, model.currentWeight, 1)}
                ${model.unit}</span
              >`}
        </div>
      `;
    }
    // The integration already translates its own status values, so the label
    // is whatever the more-info dialog would show rather than a second copy of
    // the same six words living in the card.
    const label =
      formatState(this.hass, stateOf(this.hass, model.context.entities.status)) ||
      status;

    return html`
      <div class="header">
        <div class="badge" style=${`background:${colour}`}>
          <ha-icon icon=${this.icon ?? "mdi:scale-bathroom"}></ha-icon>
        </div>
        <div class="titles">
          <span class="name" title=${this.name}>${this.name}</span>
          ${model.endDate
            ? html`<span class="muted sub"
                >${localize(this.hass, "header.until", {
                  date: formatState(
                    this.hass,
                    stateOf(this.hass, model.context.entities.end_date),
                  ) || model.endDate,
                })}</span
              >`
            : nothing}
        </div>
        <button
          class="status"
          style=${`color:${colour}`}
          @click=${this._openStatus}
          aria-label=${localize(this.hass, "header.status", { status: label })}
        >
          <ha-icon icon=${STATUS_ICON[status] ?? "mdi:information-outline"}></ha-icon>
          <span>${label}</span>
        </button>
      </div>
    `;
  }

  private _openStatus = (): void => {
    const entityId = this.model?.context.entities.status;
    if (!entityId) {
      return;
    }
    this.dispatchEvent(
      new CustomEvent("hass-more-info", {
        detail: { entityId },
        bubbles: true,
        composed: true,
      }),
    );
  };

  public static override styles = [
    sharedStyles,
    css`
      .header {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .compact {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 10px;
      }
      .compact .name {
        font-size: 15px;
      }
      .now {
        font-size: 15px;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
      }
      .badge {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 38px;
        height: 38px;
        flex: 0 0 auto;
        border-radius: 12px;
        color: var(--text-primary-color, #fff);
      }
      .badge ha-icon {
        --mdc-icon-size: 22px;
      }
      .titles {
        display: flex;
        flex-direction: column;
        min-width: 0;
        flex: 1 1 auto;
      }
      .name {
        font-size: 16px;
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .sub {
        font-size: 12px;
      }
      .status {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        flex: 0 0 auto;
        min-height: 36px;
        padding: 0 4px;
        border: none;
        background: none;
        font: inherit;
        font-size: 13px;
        cursor: pointer;
      }
      .status ha-icon {
        --mdc-icon-size: 18px;
      }
      @container (max-width: 300px) {
        .status span {
          display: none;
        }
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "wg-header": WgHeader;
  }
}
