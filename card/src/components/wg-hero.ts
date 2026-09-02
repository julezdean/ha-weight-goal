import { LitElement, css, html, nothing, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";

import { STATUS_COLOR } from "../const";
import { formatNumber } from "../lib/format";
import { resolveBadges, type ResolvedBadge } from "../lib/badges";
import { translator } from "../localize";
import { sharedStyles } from "../shared-styles";
import type { GoalModel } from "../lib/goal";
import type { BadgeConfig, HomeAssistant } from "../types";

@customElement("wg-hero")
export class WgHero extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @property({ attribute: false }) public model?: GoalModel;

  @property({ attribute: false }) public badges?: BadgeConfig[];

  protected override render(): TemplateResult | typeof nothing {
    const model = this.model;
    if (!model || !this.hass) {
      return nothing;
    }
    const t = translator(this.hass);
    const colour = STATUS_COLOR[model.status] ?? STATUS_COLOR.no_goal;
    const badges = resolveBadges(this.hass, model, this.badges);

    return html`
      <div class="hero">
        <button
          class="value"
          @click=${() => this._more(model.context.entities.weight)}
        >
          <span class="number"
            >${formatNumber(this.hass, model.currentWeight, 1)}</span
          >
          <span class="unit muted">${model.unit}</span>
        </button>
        ${model.deviation === null
          ? nothing
          : html`<div class="deviation" style=${`color:${colour}`}>
              <ha-icon
                icon=${model.deviation > 0
                  ? "mdi:arrow-up"
                  : model.deviation < 0
                    ? "mdi:arrow-down"
                    : "mdi:equal"}
              ></ha-icon>
              <span>
                ${model.deviation === 0
                  ? t("hero.on_plan")
                  : `${formatNumber(this.hass, Math.abs(model.deviation), 1)} ${
                      model.unit
                    } ${
                      model.deviation > 0
                        ? t("hero.above_plan")
                        : t("hero.below_plan")
                    }`}
              </span>
            </div>`}
      </div>

      ${badges.length === 0 && model.currentWeight === null
        ? html`<div class="chips">
            <span class="chip">
              <ha-icon icon="mdi:scale-bathroom"></ha-icon>
              ${t("hero.no_reading")}
            </span>
          </div>`
        : badges.length
          ? html`<div class="chips">
              ${badges.map((badge) => this._renderBadge(badge))}
            </div>`
          : nothing}
    `;
  }

  private _renderBadge(badge: ResolvedBadge) {
    // The chips show a value and an icon, not a label: repeating "Last
    // measurement" in front of "6 hours ago" costs a line on a phone. The name
    // is still there for a screen reader and on hover.
    const aria = badge.label ? `${badge.label}: ${badge.text}` : badge.text;
    return html`<button
      class="chip"
      title=${badge.label}
      aria-label=${aria}
      ?disabled=${!badge.entityId}
      @click=${() => this._more(badge.entityId)}
    >
      <ha-icon icon=${badge.icon}></ha-icon>
      <span>${badge.text}</span>
    </button>`;
  }

  private _more(entityId?: string): void {
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
  }

  public static override styles = [
    sharedStyles,
    css`
      .hero {
        display: flex;
        align-items: baseline;
        flex-wrap: wrap;
        gap: 4px 14px;
      }
      .value {
        display: inline-flex;
        align-items: baseline;
        gap: 4px;
        padding: 0;
        border: none;
        background: none;
        color: inherit;
        font: inherit;
        cursor: pointer;
      }
      .number {
        font-size: 34px;
        font-weight: 400;
        line-height: 1.1;
        letter-spacing: -0.5px;
      }
      .unit {
        font-size: 16px;
      }
      .deviation {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        font-size: 14px;
      }
      .deviation ha-icon {
        --mdc-icon-size: 17px;
      }
      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 10px;
      }
      button.chip {
        border: none;
        font: inherit;
        font-size: 12px;
        color: inherit;
        cursor: pointer;
      }
      button.chip:disabled {
        cursor: default;
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "wg-hero": WgHero;
  }
}
