import { LitElement, css, html, nothing, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";

import { STATUS_COLOR } from "../const";
import { formatNumber } from "../lib/format";
import { localize } from "../localize";
import { sharedStyles } from "../shared-styles";
import type { GoalModel } from "../lib/goal";
import type { HomeAssistant } from "../types";

/**
 * The two progress bars sit directly above one another on purpose: the gap
 * between them is the answer to "am I on schedule", in the same way the
 * deviation sensor answers it in kilograms.
 */
@customElement("wg-progress")
export class WgProgress extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @property({ attribute: false }) public model?: GoalModel;

  protected override render(): TemplateResult | typeof nothing {
    const model = this.model;
    if (!model || (model.weightProgress === null && model.timeProgress === null)) {
      return nothing;
    }
    const colour = STATUS_COLOR[model.status] ?? STATUS_COLOR.on_track;

    return html`
      ${this._bar(
        localize(this.hass, "progress.weight"),
        model.weightProgress,
        colour,
      )}
      ${this._bar(
        localize(this.hass, "progress.time"),
        model.timeProgress,
        "var(--secondary-text-color, #727272)",
      )}
    `;
  }

  private _bar(label: string, value: number | null, colour: string) {
    if (value === null) {
      return html`<div class="line">
        <span class="label muted">${label}</span>
        <span class="track"></span>
        <span class="value muted">–</span>
      </div>`;
    }
    const clamped = Math.min(100, Math.max(0, value));
    return html`<div class="line">
      <span class="label muted">${label}</span>
      <span
        class="track"
        role="progressbar"
        aria-label=${localize(this.hass, "progress.aria", { label })}
        aria-valuenow=${Math.round(clamped)}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <span class="fill" style=${`width:${clamped}%;background:${colour}`}></span>
      </span>
      <span class="value">${formatNumber(this.hass, clamped, 0)}%</span>
    </div>`;
  }

  public static override styles = [
    sharedStyles,
    css`
      .line {
        display: grid;
        grid-template-columns: 52px 1fr 42px;
        align-items: center;
        gap: 10px;
        font-size: 12px;
        padding: 3px 0;
      }
      .track {
        height: 8px;
        border-radius: 4px;
        background: var(--divider-color, #e0e0e0);
        overflow: hidden;
      }
      .fill {
        display: block;
        height: 100%;
        border-radius: 4px;
      }
      .value {
        text-align: right;
        font-variant-numeric: tabular-nums;
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "wg-progress": WgProgress;
  }
}
