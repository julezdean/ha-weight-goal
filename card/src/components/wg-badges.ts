import { LitElement, css, html, nothing, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";

import { resolveBadges, type ResolvedBadge } from "../lib/badges";
import { translator } from "../localize";
import { sharedStyles } from "../shared-styles";
import type { GoalModel } from "../lib/goal";
import type { BadgeConfig, HomeAssistant } from "../types";

/**
 * The row of chips under the goal.
 *
 * A section of its own rather than part of the hero. The hero is one number
 * and how far it is from the plan; the chips are whatever else is worth a
 * glance. Keeping them together made `show_hero` decide both, so hiding a
 * large number also silently dropped the badges.
 */
@customElement("wg-badges")
export class WgBadges extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @property({ attribute: false }) public model?: GoalModel;

  @property({ attribute: false }) public badges?: BadgeConfig[];

  protected override render(): TemplateResult | typeof nothing {
    const model = this.model;
    if (!model || !this.hass) {
      return nothing;
    }
    const t = translator(this.hass);
    const badges = resolveBadges(this.hass, model, this.badges);

    if (badges.length === 0) {
      // Nothing to show is usually nothing to render. The exception is a card
      // with no reading at all, where an empty row would leave the user
      // wondering whether it is still loading.
      return model.currentWeight === null
        ? html`<div class="chips">
            <span class="chip">
              <ha-icon icon="mdi:scale-bathroom"></ha-icon>
              ${t("badges.no_reading")}
            </span>
          </div>`
        : nothing;
    }

    return html`<div class="chips">
      ${badges.map((badge) => this._renderBadge(badge))}
    </div>`;
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
      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
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
    "wg-badges": WgBadges;
  }
}
