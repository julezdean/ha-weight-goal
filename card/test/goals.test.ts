// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";

import "../src/components/wg-goal-editor";
import "../src/components/wg-goals";
import "../src/components/wg-new-goal";
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

describe("adding a goal from the card", () => {
  async function openForm(): Promise<{ hass: HomeAssistant; root: ShadowRoot; el: HTMLElement }> {
    const hass = buildHass(GOALS);
    const model = { ...readGoal(hass, CONTEXT), currentWeight: 78.4 };
    const el = await render<HTMLElement>("wg-new-goal", { hass, model });
    const root = el.shadowRoot!;
    (root.querySelector("button.open") as HTMLButtonElement).click();
    await (el as unknown as { updateComplete: Promise<unknown> }).updateComplete;
    return { hass, root, el };
  }

  async function type(el: HTMLElement, field: HTMLInputElement, value: string) {
    field.value = value;
    field.dispatchEvent(new Event("input"));
    await (el as unknown as { updateComplete: Promise<unknown> }).updateComplete;
  }

  async function submit(el: HTMLElement, root: ShadowRoot) {
    root.querySelector("form")!.dispatchEvent(new Event("submit", { cancelable: true }));
    await (el as unknown as { updateComplete: Promise<unknown> }).updateComplete;
    await Promise.resolve();
  }

  it("suggests today and the latest weight, but sends what is typed", async () => {
    const { hass, root, el } = await openForm();
    const inputs = [...root.querySelectorAll("input")] as HTMLInputElement[];
    const [name, startDate, startWeight, endDate, value] = inputs;
    expect(startWeight.value).toBe("78.4");
    expect(startDate.value).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    await type(el, name, "Summer");
    await type(el, startDate, "2026-11-01");
    await type(el, endDate, "2027-01-31");
    await type(el, value, "75,5");
    await submit(el, root);

    expect(hass.callService).toHaveBeenCalledWith(
      "weight_goal",
      "create_goal",
      {
        name: "Summer",
        goal_mode: "target",
        start_date: "2026-11-01",
        start_weight: 78.4,
        end_date: "2027-01-31",
        target_weight: 75.5,
        activate: true,
      },
      { entity_id: "sensor.julien_status" },
    );
    // Closed again once the goal exists.
    expect(root.querySelector("form")).toBeNull();
  });

  it("sends the rate when the goal is defined by it", async () => {
    const { hass, root, el } = await openForm();
    const select = root.querySelector("select")!;
    select.value = "rate";
    select.dispatchEvent(new Event("change"));
    await (el as unknown as { updateComplete: Promise<unknown> }).updateComplete;
    const inputs = [...root.querySelectorAll("input")] as HTMLInputElement[];
    await type(el, inputs[0], "Steady");
    await type(el, inputs[3], "2027-01-31");
    await type(el, inputs[4], "-0.25");
    (root.querySelector("input[type=checkbox]") as HTMLInputElement).click();
    await submit(el, root);

    const data = (hass.callService as ReturnType<typeof vi.fn>).mock.calls[0][2];
    expect(data.rate_per_week).toBe(-0.25);
    expect(data.target_weight).toBeUndefined();
    expect(data.goal_mode).toBe("rate");
    expect(data.activate).toBe(false);
  });

  it("asks for the missing numbers instead of sending them", async () => {
    const { hass, root, el } = await openForm();
    await submit(el, root);
    expect(hass.callService).not.toHaveBeenCalled();
    expect(root.querySelector(".error")!.textContent).toContain("end date");
  });

  it("shows what the integration refused and keeps the form open", async () => {
    const { hass, root, el } = await openForm();
    (hass.callService as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("Another goal already has this name."),
    );
    const inputs = [...root.querySelectorAll("input")] as HTMLInputElement[];
    await type(el, inputs[0], "Spring");
    await type(el, inputs[3], "2027-01-31");
    await type(el, inputs[4], "75");
    await submit(el, root);
    await (el as unknown as { updateComplete: Promise<unknown> }).updateComplete;
    expect(root.querySelector(".error")!.textContent).toContain("already has this name");
    expect(root.querySelector("form")).not.toBeNull();
  });
});
