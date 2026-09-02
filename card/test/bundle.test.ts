// @vitest-environment happy-dom
import { beforeAll, describe, expect, it } from "vitest";

describe("built bundle", () => {
  beforeAll(async () => {
    (globalThis as any).ResizeObserver = class { observe() {} disconnect() {} };
    // The built bundle, imported for its side effects. It has no types, and it
    // should not: this test exists to check what the browser actually loads.
    // @ts-expect-error -- untyped build output
    await import("../../custom_components/weight_goal/www/weight-goal-card.js");
  });

  it("registers both cards", () => {
    expect(customElements.get("weight-goal-card")).toBeTruthy();
    expect(customElements.get("weight-goal-chart-card")).toBeTruthy();
  });

  it("registers them in the picker", () => {
    expect((window as any).customCards.map((c: any) => c.type)).toEqual([
      "weight-goal-card",
      "weight-goal-chart-card",
    ]);
  });

  it("renders a problem message instead of throwing without config", async () => {
    const el: any = document.createElement("weight-goal-card");
    expect(() => el.setConfig({ type: "custom:weight-goal-card" })).toThrow();
    el.setConfig({ type: "custom:weight-goal-card", entity: "sensor.x_status" });
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot.innerHTML).toContain("ha-card");
  });

  // chartOptions() copies the chart settings field by field, so a new option
  // is silently dropped unless it is added there too. Both cards, both forms.
  it.each([
    ["weight-goal-card", false],
    ["weight-goal-card", true],
    ["weight-goal-chart-card", false],
  ])("passes every chart option through from %s (nested: %s)", (tag, nested) => {
    const chart = {
      source: "history",
      range: 30,
      average: 14,
      line: "linear",
      height: 300,
      y_axis: { min: 72, max: 86, mode: "tight", include_goal: false, ticks: 7 },
      show: { points: false },
      styles: { weight: { color: "#ff0000", width: 4 } },
    };
    const el: any = document.createElement(tag);
    el.setConfig({
      type: `custom:${tag}`,
      entity: "sensor.x_status",
      ...(nested ? { chart } : chart),
    });

    const options = el.chartOptions();
    expect(options.source).toBe("history");
    expect(options.range).toBe(30);
    expect(options.average).toBe(14);
    expect(options.line).toBe("linear");
    expect(options.height).toBe(300);
    expect(options.y_axis).toEqual(chart.y_axis);
    expect(options.show.points).toBe(false);
    expect(options.styles.weight.width).toBe(4);
  });
});
