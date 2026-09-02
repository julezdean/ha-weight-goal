/**
 * The chart.
 *
 * Four layers, drawn back to front:
 *
 *   1. the tolerance band around the plan, so "on track" is a visible zone
 *   2. the plan line, straight from start weight to target weight
 *   3. the projection, dashed, from the last reading to `projected_date`
 *   4. the measurements, with an optional moving average on top
 *
 * Plain SVG rather than a charting library: the band between two sloping lines,
 * the theme variables and the per-series style options are all a few attributes
 * here, and none of them map cleanly onto a general purpose chart API.
 */

import { LitElement, css, html, nothing, svg, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

import { STATUS_COLOR } from "../const";
import { formatDate, formatNumber } from "../lib/format";
import { localize, translator } from "../localize";
import { plannedWeight } from "../lib/plan";
import {
  buildAreaPath,
  buildPath,
  buildScale,
  movingAverage,
  nearestIndex,
  normalise,
  type Point,
  type Scale,
} from "../lib/series";
import { chartWindow } from "../lib/window";
import type { GoalModel } from "../lib/goal";
import type {
  ChartOptions,
  HomeAssistant,
  LineShape,
  Measurement,
  SeriesStyle,
} from "../types";

const DEFAULT_STYLES: Record<string, Required<SeriesStyle>> = {
  weight: {
    color: "auto",
    width: 2,
    dash: "",
    opacity: 1,
    point_size: 3,
  },
  average: {
    color: "var(--primary-color, #03a9f4)",
    width: 2.5,
    dash: "",
    opacity: 1,
    point_size: 0,
  },
  plan: {
    color: "var(--secondary-text-color, #727272)",
    width: 2,
    dash: "6 4",
    opacity: 1,
    point_size: 0,
  },
  band: {
    color: "var(--primary-color, #03a9f4)",
    width: 0,
    dash: "",
    opacity: 0.1,
    point_size: 0,
  },
  projection: {
    color: "var(--disabled-text-color, #9e9e9e)",
    width: 2,
    dash: "2 6",
    opacity: 1,
    point_size: 0,
  },
};

@customElement("wg-chart")
export class WgChart extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @property({ attribute: false }) public model?: GoalModel;

  @property({ attribute: false }) public measurements: Measurement[] = [];

  @property({ attribute: false }) public options: ChartOptions = {};

  @property({ type: Boolean }) public loading = false;

  @state() private _width = 0;

  @state() private _hover: number | null = null;

  /** Unique per instance: two charts on one dashboard must not share a clip
   * path, or the second one is clipped to the first one's plot area. */
  private readonly _id = Math.random().toString(36).slice(2, 9);

  private _observer?: ResizeObserver;

  public override connectedCallback(): void {
    super.connectedCallback();
    this._observer = new ResizeObserver((entries) => {
      const width = Math.round(entries[0]?.contentRect.width ?? 0);
      if (width && width !== this._width) {
        this._width = width;
      }
    });
    this._observer.observe(this);
  }

  public override disconnectedCallback(): void {
    this._observer?.disconnect();
    this._observer = undefined;
    super.disconnectedCallback();
  }

  private get _height(): number {
    return this.options.height ?? 190;
  }

  private _style(name: keyof typeof DEFAULT_STYLES): Required<SeriesStyle> {
    const configured = (this.options.styles ?? {})[
      name as keyof NonNullable<ChartOptions["styles"]>
    ];
    return { ...DEFAULT_STYLES[name], ...(configured ?? {}) };
  }

  private _colour(name: keyof typeof DEFAULT_STYLES): string {
    const configured = this._style(name).color;
    if (configured !== "auto") {
      return configured;
    }
    return STATUS_COLOR[this.model?.status ?? "no_goal"] ?? STATUS_COLOR.on_track;
  }

  private _shown(key: keyof NonNullable<ChartOptions["show"]>, fallback: boolean): boolean {
    const value = this.options.show?.[key];
    return value === undefined ? fallback : value;
  }

  /** The time window the x axis covers. */
  private _window(points: Measurement[]): { from: number; to: number } {
    return chartWindow(this.options.range, this.model?.goal, points, Date.now());
  }

  private _renderEmpty(message: string): TemplateResult {
    return html`<div class="empty" style=${`height:${this._height}px`}>
      <ha-icon icon="mdi:chart-line"></ha-icon>
      <span>${message}</span>
    </div>`;
  }

  protected override render(): TemplateResult | typeof nothing {
    const model = this.model;
    if (!model || !this.hass) {
      return nothing;
    }

    const width = this._width;
    if (!width) {
      // First frame: the ResizeObserver has not reported yet.
      return html`<div class="empty" style=${`height:${this._height}px`}></div>`;
    }

    const all = normalise(this.measurements);
    if (!all.length && !model.goal) {
      return this._renderEmpty(
        localize(this.hass, this.loading ? "chart.loading" : "chart.empty"),
      );
    }

    const { from, to } = this._window(all);
    const points = all.filter((m) => m.t >= from && m.t <= to);
    const average = this.options.average ?? 0;
    // Averaged from the full series so the line does not restart at the window
    // edge with a partial window behind it.
    const averaged = average > 0 ? movingAverage(all, average).filter((m) => m.t >= from && m.t <= to) : [];

    const height = this._height;
    const showAxis = this._shown("axis", true);
    const padTop = 10;
    const padBottom = showAxis ? 22 : 8;
    const padRight = 8;

    const scale = this._verticalScale(model, points, averaged, from, to);
    const padLeft = showAxis ? this._axisWidth(scale) : 6;

    const plotWidth = Math.max(10, width - padLeft - padRight);
    const plotHeight = Math.max(10, height - padTop - padBottom);

    const x = (t: number): number =>
      padLeft + ((t - from) / Math.max(1, to - from)) * plotWidth;
    const y = (v: number): number =>
      padTop +
      plotHeight -
      ((v - scale.min) / Math.max(1e-9, scale.max - scale.min)) * plotHeight;

    const shape = (this.options.line ?? "smooth") as LineShape;
    const toPoints = (series: Measurement[]): Point[] =>
      series.map((m) => ({ x: x(m.t), y: y(m.v) }));

    // A fixed axis range, or a tight one, puts data outside the plot area.
    // Without a clip the lines would run over the labels and out of the card.
    const clipId = `wg-plot-${this._id}`;

    return html`
      <div class="wrap" @pointerleave=${this._clearHover}>
        <svg
          viewBox="0 0 ${width} ${height}"
          width=${width}
          height=${height}
          role="img"
          aria-label=${this._summary(model, points)}
          @pointermove=${(event: PointerEvent) =>
            this._onPointer(event, points, from, to, padLeft, plotWidth)}
          @pointerdown=${(event: PointerEvent) =>
            this._onPointer(event, points, from, to, padLeft, plotWidth)}
        >
          <defs>
            <clipPath id=${clipId}>
              <rect
                x=${padLeft}
                y=${padTop - 2}
                width=${plotWidth}
                height=${plotHeight + 4}
              ></rect>
            </clipPath>
          </defs>
          ${this._renderGrid(scale, padLeft, padRight, width, y, showAxis)}
          <g clip-path=${`url(#${clipId})`}>
            ${this._renderBand(model, from, to, x, y)}
            ${this._renderPlan(model, from, to, x, y)}
            ${this._renderProjection(model, points, x, y)}
            ${this._renderSeries(toPoints(points), toPoints(averaged), shape)}
            ${this._renderPoints(points, x, y, model)}
          </g>
          ${this._renderToday(from, to, x, padTop, plotHeight)}
          ${showAxis ? this._renderTimeAxis(from, to, x, height) : nothing}
          ${this._renderCursor(points, x, y, padTop, plotHeight)}
        </svg>
        ${this._renderTooltip(points, model)}
        <table class="sr-only">
          <caption>${localize(this.hass, "chart.readings")}</caption>
          <tbody>
            ${points.slice(-12).map(
              (m) => html`<tr>
                <td>${formatDate(this.hass, m.t, true)}</td>
                <td>${formatNumber(this.hass, m.v, 1)} ${model.unit}</td>
              </tr>`,
            )}
          </tbody>
        </table>
      </div>
    `;
  }

  private _axisWidth(scale: Scale): number {
    // Room for the widest label the axis will actually print, rather than a
    // guess: with a tight axis these carry a decimal and a fixed guess clips.
    const widest = Math.max(
      ...scale.ticks.map(
        (value) => formatNumber(this.hass, value, scale.decimals).length,
      ),
      2,
    );
    return 14 + widest * 7;
  }

  private _verticalScale(
    model: GoalModel,
    points: Measurement[],
    averaged: Measurement[],
    from: number,
    to: number,
  ): Scale {
    const axis = this.options.y_axis ?? {};
    const values: number[] = [];
    for (const m of points) values.push(m.v);
    for (const m of averaged) values.push(m.v);

    if (model.goal && axis.include_goal !== false) {
      // Only the part of the plan that is actually on screen. Using the goal's
      // own start and target instead would stretch a 30 day view across the
      // whole goal range and flatten the readings into a straight line.
      const band = this._shown("band", true) ? model.tolerance : 0;
      for (const point of this._planPoints(model, from, to)) {
        values.push(point.v + band, point.v - band);
      }
    }
    if (!values.length) {
      values.push(model.currentWeight ?? 75);
    }

    return buildScale(values, {
      min: axis.min,
      max: axis.max,
      mode: axis.mode === "tight" ? "tight" : "nice",
      ticks: axis.ticks ?? 4,
    });
  }

  private _renderGrid(
    scale: Scale,
    padLeft: number,
    padRight: number,
    width: number,
    y: (v: number) => number,
    showAxis: boolean,
  ) {
    if (!this._shown("grid", true)) {
      return nothing;
    }
    const lines = scale.ticks.map((value) => {
      const position = y(value);
      return svg`
        <line class="grid" x1=${padLeft} x2=${width - padRight}
              y1=${position} y2=${position}></line>
        ${
          showAxis
            ? svg`<text class="axis" x=${padLeft - 6} y=${position + 3}
                        text-anchor="end">${formatNumber(this.hass, value, scale.decimals)}</text>`
            : nothing
        }
      `;
    });
    return svg`<g>${lines}</g>`;
  }

  private _renderBand(
    model: GoalModel,
    from: number,
    to: number,
    x: (t: number) => number,
    y: (v: number) => number,
  ) {
    if (!model.goal || !this._shown("band", true) || model.tolerance <= 0) {
      return nothing;
    }
    const style = this._style("band");
    const edges = this._planPoints(model, from, to);
    const upper = edges.map((p) => ({ x: x(p.t), y: y(p.v + model.tolerance) }));
    const lower = edges.map((p) => ({ x: x(p.t), y: y(p.v - model.tolerance) }));
    const path = buildAreaPath(upper, lower);
    if (!path) {
      return nothing;
    }
    return svg`<path d=${path} fill=${this._colour("band")}
                     fill-opacity=${style.opacity} stroke="none"></path>`;
  }

  /** The plan as a handful of vertices; it is straight, but it is clamped at
   * both ends of the goal window, so it needs the corner points. */
  private _planPoints(
    model: GoalModel,
    from: number,
    to: number,
  ): Array<{ t: number; v: number }> {
    const goal = model.goal!;
    const stops = [from, goal.begin, goal.finish, to]
      .filter((t) => t >= from && t <= to)
      .sort((a, b) => a - b);
    const unique = stops.filter((t, i) => i === 0 || t !== stops[i - 1]);
    return unique.map((t) => ({ t, v: plannedWeight(goal, t) }));
  }

  private _renderPlan(
    model: GoalModel,
    from: number,
    to: number,
    x: (t: number) => number,
    y: (v: number) => number,
  ) {
    if (!model.goal || !this._shown("plan", true)) {
      return nothing;
    }
    const style = this._style("plan");
    const points = this._planPoints(model, from, to).map((p) => ({
      x: x(p.t),
      y: y(p.v),
    }));
    return svg`
      <path d=${buildPath(points, "linear")} fill="none"
            stroke=${this._colour("plan")} stroke-width=${style.width}
            stroke-dasharray=${style.dash || nothing}
            stroke-opacity=${style.opacity}
            stroke-linecap="round"></path>
      <circle cx=${x(model.goal.finish)} cy=${y(model.goal.targetWeight)}
              r="3.5" fill=${this._colour("plan")}></circle>
    `;
  }

  private _renderProjection(
    model: GoalModel,
    points: Measurement[],
    x: (t: number) => number,
    y: (v: number) => number,
  ) {
    if (
      !this._shown("projection", true) ||
      !model.goal ||
      model.projectedDate === null ||
      !points.length
    ) {
      return nothing;
    }
    const style = this._style("projection");
    const last = points[points.length - 1];
    const path = buildPath(
      [
        { x: x(last.t), y: y(last.v) },
        { x: x(model.projectedDate), y: y(model.goal.targetWeight) },
      ],
      "linear",
    );
    return svg`<path d=${path} fill="none" stroke=${this._colour("projection")}
                     stroke-width=${style.width}
                     stroke-dasharray=${style.dash || nothing}
                     stroke-linecap="round"></path>`;
  }

  private _renderSeries(
    weight: Point[],
    average: Point[],
    shape: LineShape,
  ) {
    const weightStyle = this._style("weight");
    const averageStyle = this._style("average");
    const showAverage = this._shown("average", true) && average.length > 1;

    return svg`
      <path d=${buildPath(weight, shape)} fill="none"
            stroke=${this._colour("weight")}
            stroke-width=${weightStyle.width}
            stroke-dasharray=${weightStyle.dash || nothing}
            stroke-opacity=${showAverage ? weightStyle.opacity * 0.45 : weightStyle.opacity}
            stroke-linecap="round" stroke-linejoin="round"></path>
      ${
        showAverage
          ? svg`<path d=${buildPath(average, shape)} fill="none"
                      stroke=${this._colour("average")}
                      stroke-width=${averageStyle.width}
                      stroke-dasharray=${averageStyle.dash || nothing}
                      stroke-opacity=${averageStyle.opacity}
                      stroke-linecap="round" stroke-linejoin="round"></path>`
          : nothing
      }
    `;
  }

  private _renderPoints(
    points: Measurement[],
    x: (t: number) => number,
    y: (v: number) => number,
    model: GoalModel,
  ) {
    const style = this._style("weight");
    if (!this._shown("points", true) || style.point_size <= 0) {
      return nothing;
    }
    // Too many dots turn into a smear; thin them out rather than drawing them.
    const stride = Math.ceil(points.length / 120);
    const colour = this._colour("weight");
    const dots = points
      .filter((_, i) => i % stride === 0 || i === points.length - 1)
      .map((m) => {
        const outside =
          model.goal !== null &&
          Math.abs(m.v - plannedWeight(model.goal, m.t)) > model.tolerance;
        return svg`<circle cx=${x(m.t)} cy=${y(m.v)} r=${style.point_size}
                           fill=${outside ? "var(--card-background-color, #fff)" : colour}
                           stroke=${colour} stroke-width="1.5"></circle>`;
      });
    return svg`<g>${dots}</g>`;
  }

  private _renderToday(
    from: number,
    to: number,
    x: (t: number) => number,
    padTop: number,
    plotHeight: number,
  ) {
    const now = Date.now();
    if (!this._shown("today", true) || now < from || now > to) {
      return nothing;
    }
    return svg`<line class="today" x1=${x(now)} x2=${x(now)}
                     y1=${padTop} y2=${padTop + plotHeight}></line>`;
  }

  private _renderTimeAxis(
    from: number,
    to: number,
    x: (t: number) => number,
    height: number,
  ) {
    const count = this._width < 260 ? 2 : this._width < 420 ? 3 : 5;
    const labels = [];
    for (let i = 0; i <= count; i++) {
      const t = from + ((to - from) * i) / count;
      const anchor = i === 0 ? "start" : i === count ? "end" : "middle";
      labels.push(
        svg`<text class="axis" x=${x(t)} y=${height - 6}
                  text-anchor=${anchor}>${formatDate(this.hass, t)}</text>`,
      );
    }
    return svg`<g>${labels}</g>`;
  }

  private _renderCursor(
    points: Measurement[],
    x: (t: number) => number,
    y: (v: number) => number,
    padTop: number,
    plotHeight: number,
  ) {
    if (this._hover === null || !points[this._hover]) {
      return nothing;
    }
    const point = points[this._hover];
    return svg`
      <line class="cursor" x1=${x(point.t)} x2=${x(point.t)}
            y1=${padTop} y2=${padTop + plotHeight}></line>
      <circle cx=${x(point.t)} cy=${y(point.v)} r="5" fill="none"
              stroke=${this._colour("weight")} stroke-width="2"></circle>
    `;
  }

  private _renderTooltip(points: Measurement[], model: GoalModel) {
    if (this._hover === null || !points[this._hover]) {
      return nothing;
    }
    const point = points[this._hover];
    const planned = model.goal ? plannedWeight(model.goal, point.t) : null;
    const delta = planned === null ? null : point.v - planned;
    return html`<div
      class=${classMap({ tooltip: true, right: this._hover > points.length / 2 })}
      role="status"
    >
      <strong>${formatNumber(this.hass, point.v, 1)} ${model.unit}</strong>
      <span>${formatDate(this.hass, point.t, true)}</span>
      ${delta === null
        ? nothing
        : html`<span
            >${localize(this.hass, "chart.vs_plan", {
              value: `${delta > 0 ? "+" : ""}${formatNumber(this.hass, delta, 1)}`,
              unit: model.unit,
            })}</span
          >`}
    </div>`;
  }

  private _onPointer(
    event: PointerEvent,
    points: Measurement[],
    from: number,
    to: number,
    padLeft: number,
    plotWidth: number,
  ): void {
    if (!points.length) {
      return;
    }
    const box = (event.currentTarget as SVGElement).getBoundingClientRect();
    const ratio = (event.clientX - box.left - padLeft) / Math.max(1, plotWidth);
    const t = from + Math.min(1, Math.max(0, ratio)) * (to - from);
    const index = nearestIndex(points, t);
    if (index !== this._hover) {
      this._hover = index;
    }
  }

  private _clearHover = (): void => {
    this._hover = null;
  };

  /** What a screen reader gets instead of the picture. */
  private _summary(model: GoalModel, points: Measurement[]): string {
    const t = translator(this.hass);
    const unit = model.unit;
    const parts = [
      t("chart.summary_readings", { count: points.length }),
      model.currentWeight === null
        ? t("chart.summary_no_weight")
        : t("chart.summary_current", {
            value: formatNumber(this.hass, model.currentWeight, 1),
            unit,
          }),
    ];
    if (model.deviation !== null) {
      parts.push(
        t(model.deviation >= 0 ? "chart.summary_above" : "chart.summary_below", {
          value: formatNumber(this.hass, Math.abs(model.deviation), 1),
          unit,
        }),
      );
    }
    if (model.goal) {
      parts.push(
        t("chart.summary_plan", {
          start: formatNumber(this.hass, model.goal.startWeight, 1),
          target: formatNumber(this.hass, model.goal.targetWeight, 1),
          unit,
        }),
      );
    }
    return parts.join(", ");
  }

  public static override styles = css`
    :host {
      display: block;
      position: relative;
    }
    .wrap {
      position: relative;
      width: 100%;
    }
    svg {
      display: block;
      width: 100%;
      touch-action: pan-y;
      overflow: visible;
    }
    .grid {
      stroke: var(--divider-color, #e0e0e0);
      stroke-width: 1;
      opacity: 0.6;
    }
    .axis {
      fill: var(--secondary-text-color, #727272);
      font-size: 11px;
      font-family: inherit;
    }
    .today {
      stroke: var(--secondary-text-color, #727272);
      stroke-width: 1;
      stroke-dasharray: 3 3;
      opacity: 0.7;
    }
    .cursor {
      stroke: var(--secondary-text-color, #727272);
      stroke-width: 1;
      opacity: 0.5;
    }
    .empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 6px;
      color: var(--secondary-text-color, #727272);
      font-size: 13px;
    }
    .tooltip {
      position: absolute;
      top: 4px;
      left: 4px;
      display: flex;
      flex-direction: column;
      padding: 6px 8px;
      border-radius: 8px;
      background: var(--card-background-color, #fff);
      box-shadow: var(--ha-card-box-shadow, 0 2px 6px rgba(0, 0, 0, 0.2));
      border: 1px solid var(--divider-color, #e0e0e0);
      font-size: 12px;
      line-height: 1.35;
      pointer-events: none;
      white-space: nowrap;
      z-index: 1;
    }
    .tooltip.right {
      left: auto;
      right: 4px;
    }
    .tooltip span {
      color: var(--secondary-text-color, #727272);
    }
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
      white-space: nowrap;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "wg-chart": WgChart;
  }
}
