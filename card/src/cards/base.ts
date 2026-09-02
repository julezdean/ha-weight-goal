/**
 * What both cards do the same way.
 *
 * `hass` changes on every state update in the whole instance, so the setter
 * compares the entities this card actually shows and only re-renders when one
 * of them changed identity. On a busy instance that is the difference between
 * a render per second and a render per weighing.
 */

import { LitElement, html, type PropertyValues, type TemplateResult } from "lit";
import { property, state } from "lit/decorators.js";

import { discover } from "../lib/discovery";
import { fetchMeasurements } from "../lib/measurements";
import { fetchDays } from "../lib/window";
import { readGoal, trackedEntities, type GoalModel } from "../lib/goal";
import { localize } from "../localize";
import type {
  BaseCardConfig,
  ChartOptions,
  GoalContext,
  HomeAssistant,
  Measurement,
} from "../types";

export abstract class WeightGoalBaseCard<
  TConfig extends BaseCardConfig,
> extends LitElement {
  @state() protected _config?: TConfig;

  @state() protected _model?: GoalModel;

  @state() protected _measurements: Measurement[] = [];

  @state() protected _loading = false;

  @state() protected _fetchError: string | null = null;

  private _hass?: HomeAssistant;

  private _context?: GoalContext;

  private _tracked: string[] = [];

  private _signature = "";

  private _requestedStamp: string | null = null;

  @property({ attribute: false })
  public set hass(hass: HomeAssistant | undefined) {
    this._hass = hass;
    if (!hass || !this._config) {
      return;
    }
    this._context = discover(hass, this._config);
    this._tracked = trackedEntities(this._context);

    const signature = this._tracked
      .map((entityId) => {
        const state = hass.states[entityId];
        return state ? `${entityId}=${state.state}@${state.last_updated}` : `${entityId}=∅`;
      })
      .join(",");

    if (signature === this._signature) {
      return;
    }
    this._signature = signature;
    this._model = readGoal(hass, this._context);
    void this._maybeLoad();
  }

  public get hass(): HomeAssistant | undefined {
    return this._hass;
  }

  protected abstract chartOptions(): ChartOptions;

  /** Whether this card needs the measurement series at all. */
  protected abstract needsMeasurements(): boolean;

  public setConfig(config: TConfig): void {
    if (!config.entity && !config.device_id && !config.entities) {
      throw new Error(
        "Set `entity` to one entity of a Road to Weight Goal device, for example sensor.<name>_status.",
      );
    }
    this._config = config;
    this._signature = "";
    this._requestedStamp = null;
    if (this._hass) {
      this.hass = this._hass;
    }
  }

  private async _maybeLoad(): Promise<void> {
    const hass = this._hass;
    const model = this._model;
    if (!hass || !model || !this.needsMeasurements()) {
      return;
    }
    const options = this.chartOptions();
    const days = fetchDays(options.range, options.average, model.goal, Date.now());

    const stamp = `${model.stamp}|${options.source ?? "measurements"}|${days ?? "all"}`;
    if (stamp === this._requestedStamp) {
      return;
    }
    this._requestedStamp = stamp;
    this._loading = true;

    try {
      const measurements = await fetchMeasurements(hass, {
        source: options.source === "history" ? "history" : "measurements",
        days,
        target: model.context.target,
        weightEntity: model.context.entities.weight,
        stamp: model.stamp,
      });
      // A newer request may have landed while this one was in flight.
      if (this._requestedStamp === stamp) {
        this._measurements = measurements;
        this._fetchError = null;
      }
    } catch (error) {
      if (this._requestedStamp === stamp) {
        this._fetchError =
          error && typeof error === "object" && "message" in error
            ? String((error as { message: unknown }).message)
            : localize(hass, "card.load_failed");
        this._requestedStamp = null;
      }
    } finally {
      if (this._requestedStamp === stamp || this._fetchError) {
        this._loading = false;
      }
    }
  }

  /** How far back to ask for, so the whole goal window is covered. */
  protected override shouldUpdate(changed: PropertyValues): boolean {
    return (
      changed.has("_config") ||
      changed.has("_model") ||
      changed.has("_measurements") ||
      changed.has("_loading") ||
      changed.has("_fetchError")
    );
  }

  /** A readable message instead of a broken card. */
  protected renderProblem(message: string): TemplateResult {
    return html`
      <ha-card>
        <div class="problem" role="alert">
          <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
          <span>${message}</span>
        </div>
      </ha-card>
    `;
  }

  protected missingGoalMessage(): string | null {
    const config = this._config;
    const hass = this._hass;
    if (!config || !hass) {
      return null;
    }
    const context = this._context;
    if (!context || !Object.keys(context.entities).length) {
      return localize(hass, "card.no_entities", {
        anchor: config.entity ?? config.device_id ?? "?",
      });
    }
    if (!context.target) {
      return localize(hass, "card.no_target");
    }
    return null;
  }
}
