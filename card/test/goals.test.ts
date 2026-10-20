// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";

import "../src/components/wg-goal-editor";
import "../src/components/wg-goals";
import { readGoal, readGoals } from "../src/lib/goal";
import type { GoalContext, HomeAssistant } from "../src/types";

const SELECT = "select.julien_active_goal";

const GOALS = [
  {
    id: "a",
    name: "Winter",
    active: false,
    goal_mode: "target",
    start_weight: 82,
    target_weight: 80,
    rate_per_week: -0.18,
    start_date: "2025-12-01",
    end_date: "2026-02-15",
    result: { weight: 79.6, timestamp: "2026-02-09T12:00:00+00:00", reached: true },
  },
  {
    id: "b",
    name: "Spring",
    active: true,
    goal_mode: "rate",
    start_weight: 80,
    target_weight: 75,
    rate_per_week: -0.5,
    start_date: "2026-03-01",
    end_date: "2026-05-09",
    result: null,
  },
  {
    id: "c",
    name: "Broken",
    active: false,
    goal_mode: "target",
    start_weight: null,
    target_weight: 70,
    rate_per_week: null,
    start_date: null,
    end_date: null,
    result: null,
  },
];

function buildHass(goals: unknown, active = "Spring"): HomeAssistant {
  return {
    locale: { language: "en" },
    config: { time_zone: "UTC" },
    states: {
      [SELECT]: {
        entity_id: SELECT,
        state: active,
        attributes: { goals },
        last_changed: "",
        last_updated: "",
      },
    },
    callService: vi.fn().mockResolvedValue({}),
  } as unknown as HomeAssistant;
}

const CONTEXT: GoalContext = {
  name: "Julien",
  entities: { active_goal: SELECT },
  target: "sensor.julien_status",
};

afterEach(() => {
  document.body.innerHTML = "";
});

async function render<T extends HTMLElement>(tag: string, props: object): Promise<T> {
  const el = document.createElement(tag) as T;
  Object.assign(el, props);
  document.body.appendChild(el);
  await (el as unknown as { updateComplete: Promise<unknown> }).updateComplete;
  return el;
}

describe("reading the goal list", () => {
  it("reads every goal from the select", () => {
    const goals = readGoals(buildHass(GOALS), SELECT);
    expect(goals.map((goal) => goal.name)).toEqual(["Winter", "Spring", "Broken"]);
    expect(goals[0].result).toEqual({
      weight: 79.6,
      timestamp: Date.parse("2026-02-09T12:00:00Z"),
      reached: true,
    });
    expect(goals[1].goalMode).toBe("rate");
    expect(goals[2].startWeight).toBeNull();
  });

  it("is empty for an integration without a goal list", () => {
    expect(readGoals(buildHass(undefined), SELECT)).toEqual([]);
    expect(readGoals(buildHass(GOALS), undefined)).toEqual([]);
  });

  it("offers the chart only the other goals with a complete plan", () => {
    const model = readGoal(buildHass(GOALS), CONTEXT);
    expect(model.otherGoals.map(({ summary }) => summary.name)).toEqual(["Winter"]);
    const winter = model.otherGoals[0].goal;
    expect(winter.begin).toBe(Date.parse("2025-12-01T00:00:00Z"));
    // The end day counts in full.
    expect(winter.finish).toBe(Date.parse("2026-02-16T00:00:00Z"));
  });
});

describe("the goal list section", () => {
  it("lists the latest goal first and marks the active one", async () => {
    const hass = buildHass(GOALS);
    const model = readGoal(hass, CONTEXT);
    const el = await render("wg-goals", { hass, model });
    const rows = [...el.shadowRoot!.querySelectorAll("li")];
    expect(rows.map((row) => row.querySelector(".name")!.textContent!.trim())).toEqual([
      expect.stringMatching(/^Broken/),
      expect.stringMatching(/^Spring\s+active$/),
      expect.stringMatching(/^Winter/),
    ]);
    expect(rows[1].classList.contains("active")).toBe(true);
    // Only the goals that are not active can be activated.
    expect(rows[1].querySelector("button")).toBeNull();
    expect(rows[2].textContent).toContain("Reached at 79.6 kg");
  });

  it("activates a goal through the select", async () => {
    const hass = buildHass(GOALS);
    const model = readGoal(hass, CONTEXT);
    const el = await render("wg-goals", { hass, model });
    const winter = [...el.shadowRoot!.querySelectorAll("li")][2];
    winter.querySelector("button")!.click();
    expect(hass.callService).toHaveBeenCalledWith(
      "select",
      "select_option",
      { option: "Winter" },
      { entity_id: SELECT },
    );
  });

  it("is absent on an integration without a goal list", async () => {
    const hass = buildHass(GOALS);
    const model = readGoal(hass, { ...CONTEXT, entities: {} });
    const el = await render("wg-goals", { hass, model });
    expect(el.shadowRoot!.querySelector("details")).toBeNull();
  });
});

describe("the goal editor without an active goal", () => {
  it("says so instead of showing empty fields", async () => {
    const goals = GOALS.map((goal) => ({ ...goal, active: false }));
    const hass = buildHass(goals, "none");
    const model = readGoal(hass, CONTEXT);
    const el = await render("wg-goal-editor", { hass, model, open: true });
    expect(el.shadowRoot!.querySelector(".grid")).toBeNull();
    expect(el.shadowRoot!.textContent).toContain("No goal is active");
  });
});
