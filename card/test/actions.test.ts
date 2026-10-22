// @vitest-environment happy-dom
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { DOUBLE_TAP_MS, HOLD_MS } from "../src/lib/actions";
import type { WeightGoalCard } from "../src/cards/weight-goal-card";
import type { HomeAssistant, WeightGoalCardConfig } from "../src/types";

const STATES: Record<string, string> = {
  "number.julien_start_weight": "80",
  "number.julien_target_weight": "74",
  "number.julien_rate_per_week": "-0.38",
  "number.julien_manual_weight": "unknown",
  "date.julien_start_date": "2026-06-14",
  "date.julien_end_date": "2026-12-20",
  "date.julien_manual_date": "2026-10-22",
  "button.julien_record_weight": "unknown",
  "sensor.julien_weight": "76.2",
  "sensor.julien_deviation": "0.3",
  "sensor.julien_trend": "-0.4",
  "sensor.julien_status": "on_track",
  "sensor.julien_last_measurement": "2026-10-22T06:00:00+00:00",
};

function buildHass(): HomeAssistant {
  const hass = {
    states: {},
    entities: {},
    devices: { dev1: { id: "dev1", name: "Julien", name_by_user: null } },
    locale: { language: "en" },
    language: "en",
    config: { time_zone: "Europe/Berlin" },
    localize: () => "",
    callService: vi.fn(async () => ({})),
    connection: { sendMessagePromise: vi.fn(async () => ({})) },
  } as unknown as HomeAssistant;
  for (const [entityId, state] of Object.entries(STATES)) {
    hass.states[entityId] = {
      entity_id: entityId,
      state,
      attributes: { min: -5, max: 300 },
      last_changed: "",
      last_updated: "",
    };
    hass.entities[entityId] = {
      entity_id: entityId,
      platform: "weight_goal",
      device_id: "dev1",
      translation_key: entityId.split(".")[1].replace("julien_", ""),
    };
  }
  return hass;
}

interface Fired {
  type: string;
  detail: Record<string, unknown>;
}

async function mount(
  extra: Partial<WeightGoalCardConfig> = {},
): Promise<{ card: WeightGoalCard; fired: Fired[] }> {
  const card = document.createElement("weight-goal-card") as WeightGoalCard;
  card.setConfig({
    type: "custom:weight-goal-card",
    entity: "sensor.julien_status",
    // No chart: nothing to fetch, and the gestures do not depend on it.
    show_chart: false,
    ...extra,
  });
  card.hass = buildHass();
  const fired: Fired[] = [];
  for (const type of ["hass-action", "hass-more-info"]) {
    card.addEventListener(type, (event) =>
      fired.push({ type, detail: (event as CustomEvent).detail }),
    );
  }
  document.body.appendChild(card);
  await card.updateComplete;
  for (const tag of ["wg-header", "wg-hero", "wg-badges", "wg-actions", "wg-goal-editor"]) {
    await (card.shadowRoot!.querySelector(tag) as unknown as { updateComplete?: Promise<unknown> })
      ?.updateComplete;
  }
  return { card, fired };
}

function haCard(card: WeightGoalCard): HTMLElement {
  return card.shadowRoot!.querySelector("ha-card") as HTMLElement;
}

function inner(card: WeightGoalCard, tag: string, selector: string): HTMLElement {
  const el = card.shadowRoot!.querySelector(tag)!.shadowRoot!.querySelector(selector);
  expect(el, `${tag} ${selector}`).not.toBeNull();
  return el as HTMLElement;
}

function pointer(target: Element, type: string, init: PointerEventInit = {}): void {
  target.dispatchEvent(
    new PointerEvent(type, {
      bubbles: true,
      composed: true,
      isPrimary: true,
      button: 0,
      pointerId: 1,
      clientX: 10,
      clientY: 10,
      ...init,
    }),
  );
}

/** What a finger does, down to the click the browser adds after `pointerup`. */
function press(target: Element, ms = 0): void {
  pointer(target, "pointerdown");
  if (ms) {
    vi.advanceTimersByTime(ms);
  }
  pointer(target, "pointerup");
  target.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true }));
}

beforeAll(async () => {
  (globalThis as { ResizeObserver?: unknown }).ResizeObserver = class {
    observe() {}
    disconnect() {}
  };
  await import("../src/cards/weight-goal-card");
});

afterEach(() => {
  document.body.innerHTML = "";
  vi.useRealTimers();
});

const POPUP = {
  action: "fire-dom-event",
  browser_mod: { service: "browser_mod.popup", data: { title: "Weight" } },
};

describe("without card actions", () => {
  it("keeps the sections' own more-info clicks", async () => {
    const { card, fired } = await mount();
    inner(card, "wg-hero", "button.value").click();
    inner(card, "wg-header", "button.status").click();
    inner(card, "wg-badges", "button.chip").click();

    expect(fired.map((f) => f.type)).toEqual([
      "hass-more-info",
      "hass-more-info",
      "hass-more-info",
    ]);
    expect(fired[0].detail.entityId).toBe("sensor.julien_weight");
    expect(fired[1].detail.entityId).toBe("sensor.julien_status");
  });

  it("is not a button and fires no action of its own", async () => {
    const { card, fired } = await mount();
    const root = haCard(card);
    expect(root.getAttribute("role")).toBeNull();
    expect(root.getAttribute("tabindex")).toBeNull();

    press(inner(card, "wg-hero", ".deviation"));
    root.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    expect(fired).toEqual([]);
  });
});

describe("with a tap_action", () => {
  it("fires hass-action for a tap anywhere on the card, and no more-info", async () => {
    const { card, fired } = await mount({ tap_action: POPUP });
    press(inner(card, "wg-hero", ".value"));
    press(inner(card, "wg-header", ".status"));
    press(inner(card, "wg-badges", ".chip"));

    expect(fired.map((f) => f.type)).toEqual(["hass-action", "hass-action", "hass-action"]);
    expect(fired[0].detail.action).toBe("tap");
    expect((fired[0].detail.config as WeightGoalCardConfig).tap_action).toEqual(POPUP);
  });

  it("turns the sections' links into plain text", async () => {
    const { card } = await mount({ tap_action: POPUP });
    expect(card.shadowRoot!.querySelector("wg-hero")!.shadowRoot!.querySelector("button")).toBeNull();
    expect(card.shadowRoot!.querySelector("wg-header")!.shadowRoot!.querySelector("button")).toBeNull();
    expect(card.shadowRoot!.querySelector("wg-badges")!.shadowRoot!.querySelector("button")).toBeNull();
  });

  it("is a focusable button that Enter taps", async () => {
    const { card, fired } = await mount({ tap_action: POPUP });
    const root = haCard(card);
    expect(root.getAttribute("role")).toBe("button");
    expect(root.getAttribute("tabindex")).toBe("0");
    expect(root.classList.contains("actionable")).toBe(true);

    root.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    expect(fired.map((f) => [f.type, f.detail.action])).toEqual([["hass-action", "tap"]]);
  });

  it("leaves the controls inside the card alone", async () => {
    const { card, fired } = await mount({ tap_action: POPUP });
    press(inner(card, "wg-actions", "button.control"));
    press(inner(card, "wg-actions", "input.weight"));
    press(inner(card, "wg-goal-editor", "input"));
    press(inner(card, "wg-goal-editor", "summary"));

    // Enter in the weight field saves the weight; it must not tap the card.
    inner(card, "wg-actions", "input.weight").dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true, composed: true }),
    );
    expect(fired.filter((f) => f.type === "hass-action")).toEqual([]);
  });

  it("leaves the chart its own touches, for the tooltip", async () => {
    const { card, fired } = await mount({ tap_action: POPUP, show_chart: true });
    const chart = card.shadowRoot!.querySelector("wg-chart")!;
    await (chart as unknown as { updateComplete: Promise<unknown> }).updateComplete;
    press(chart.shadowRoot!.firstElementChild ?? chart);
    expect(fired).toEqual([]);
  });

  it("does not tap when the finger moved, as in a scroll", async () => {
    const { card, fired } = await mount({ tap_action: POPUP });
    const target = inner(card, "wg-hero", ".value");
    pointer(target, "pointerdown");
    pointer(target, "pointermove", { clientY: 60 });
    pointer(target, "pointerup", { clientY: 60 });
    pointer(target, "pointerdown");
    pointer(target, "pointercancel");
    pointer(target, "pointerup");
    expect(fired).toEqual([]);
  });

  it("treats tap_action: none as no action, but still keeps the sections quiet", async () => {
    const { card, fired } = await mount({ tap_action: { action: "none" } });
    expect(haCard(card).getAttribute("role")).toBeNull();
    expect(card.shadowRoot!.querySelector("wg-hero")!.shadowRoot!.querySelector("button")).toBeNull();
    // Home Assistant decides what `none` does, which is nothing.
    press(inner(card, "wg-hero", ".value"));
    expect(fired.map((f) => f.type)).toEqual(["hass-action"]);
  });
});

describe("hold and double tap", () => {
  it("fires hold after a long press, and no tap", async () => {
    vi.useFakeTimers();
    const { card, fired } = await mount({
      tap_action: POPUP,
      hold_action: { action: "more-info" },
    });
    press(inner(card, "wg-hero", ".value"), HOLD_MS + 50);
    vi.advanceTimersByTime(DOUBLE_TAP_MS * 2);
    expect(fired.map((f) => f.detail.action)).toEqual(["hold"]);
  });

  it("still taps on a short press when a hold is set", async () => {
    vi.useFakeTimers();
    const { card, fired } = await mount({ hold_action: { action: "more-info" } });
    press(inner(card, "wg-hero", ".value"), HOLD_MS - 100);
    expect(fired.map((f) => f.detail.action)).toEqual(["tap"]);
  });

  it("reads a long press as a tap when no hold is set", async () => {
    vi.useFakeTimers();
    const { card, fired } = await mount({ tap_action: POPUP });
    press(inner(card, "wg-hero", ".value"), HOLD_MS + 50);
    expect(fired.map((f) => f.detail.action)).toEqual(["tap"]);
  });

  it("tells a double tap from two taps", async () => {
    vi.useFakeTimers();
    const { card, fired } = await mount({
      tap_action: POPUP,
      double_tap_action: { action: "navigate", navigation_path: "/history" },
    });
    const target = inner(card, "wg-hero", ".value");

    press(target);
    vi.advanceTimersByTime(DOUBLE_TAP_MS - 100);
    press(target);
    vi.advanceTimersByTime(DOUBLE_TAP_MS * 2);
    expect(fired.map((f) => f.detail.action)).toEqual(["double_tap"]);

    press(target);
    expect(fired).toHaveLength(1);
    vi.advanceTimersByTime(DOUBLE_TAP_MS + 10);
    expect(fired.map((f) => f.detail.action)).toEqual(["double_tap", "tap"]);
  });
});
