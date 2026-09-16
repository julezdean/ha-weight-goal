// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";

import "../src/components/wg-actions";
import "../src/components/wg-badges";
import "../src/components/wg-goal-editor";
import "../src/components/wg-header";
import "../src/components/wg-hero";
import type { GoalModel } from "../src/lib/goal";
import type { HomeAssistant } from "../src/types";

const ENTITIES = {
  weight: "sensor.julien_weight",
  start_weight: "number.julien_start_weight",
  target_weight: "number.julien_target_weight",
  rate_per_week: "number.julien_rate_per_week",
  start_date: "date.julien_start_date",
  manual_weight: "number.julien_manual_weight",
  manual_date: "date.julien_manual_date",
  start_today: "button.julien_start_today",
  end_date: "date.julien_end_date",
  last_measurement: "sensor.julien_last_measurement",
  trend: "sensor.julien_trend",
};

function build(goalMode: string | null): { hass: HomeAssistant; model: GoalModel } {
  const states: Record<string, string> = {
    [ENTITIES.weight]: "74",
    [ENTITIES.start_weight]: "80",
    [ENTITIES.target_weight]: "74",
    [ENTITIES.rate_per_week]: "-0.38",
    [ENTITIES.start_date]: "2026-06-14",
    [ENTITIES.manual_weight]: "unknown",
    [ENTITIES.manual_date]: "2026-09-17",
    [ENTITIES.start_today]: "unknown",
    [ENTITIES.end_date]: "2026-09-20",
    [ENTITIES.last_measurement]: new Date().toISOString(),
    [ENTITIES.trend]: "-0.6",
  };
  const hass = {
    locale: { language: "en" },
    config: { time_zone: "Europe/Berlin" },
    states: Object.fromEntries(
      Object.entries(states).map(([entityId, state]) => [
        entityId,
        {
          entity_id: entityId,
          state,
          attributes: { friendly_name: `Julien ${entityId.split(".")[1]}`, min: 20, max: 300 },
          last_changed: "",
          last_updated: "",
        },
      ]),
    ),
  } as unknown as HomeAssistant;

  const model = {
    unit: "kg",
    status: "on_track",
    currentWeight: 74,
    deviation: 0.1,
    goalMode,
    measurementSource: "sensor",
    manualAvailable: true,
    manualWeight: null,
    manualDate: null,
    manualPending: false,
    startTodayArmed: false,
    goal: { begin: 0, finish: 1 },
    context: { name: "Julien", entities: ENTITIES, target: ENTITIES.weight },
  } as unknown as GoalModel;

  return { hass, model };
}

async function render<T extends HTMLElement>(tag: string, props: object): Promise<T> {
  const el = document.createElement(tag) as T;
  Object.assign(el, props);
  document.body.appendChild(el);
  await (el as unknown as { updateComplete: Promise<unknown> }).updateComplete;
  return el;
}

describe("badges as their own section", () => {
  it("renders the chips", async () => {
    const { hass, model } = build("target");
    const el = await render("wg-badges", { hass, model });
    expect(el.shadowRoot!.querySelectorAll("button.chip").length).toBeGreaterThan(0);
  });

  it("leaves the hero to the weight alone", async () => {
    // The whole point of the split: hiding the big number must not take the
    // chips with it.
    const { hass, model } = build("target");
    const el = await render("wg-hero", { hass, model });
    expect(el.shadowRoot!.querySelector(".chips")).toBeNull();
    expect(el.shadowRoot!.querySelector(".number")).not.toBeNull();
  });

  it("says so when there is nothing to show at all", async () => {
    const { hass, model } = build("target");
    const el = await render("wg-badges", {
      hass,
      model: { ...model, currentWeight: null },
      badges: [],
    });
    expect(el.shadowRoot!.textContent).toContain("No reading yet");
  });
});

describe("the derived goal field", () => {
  it("is disabled, labelled and explained", async () => {
    const { hass, model } = build("target");
    const el = await render("wg-goal-editor", { hass, model, open: true });
    const root = el.shadowRoot!;

    const rate = root.querySelector<HTMLInputElement>('input[step="0.01"]')!;
    expect(rate.disabled).toBe(true);
    expect(root.textContent).toContain("calculated");

    // A dangling aria-describedby is worse than none: it promises an
    // explanation that a screen reader then cannot find.
    const describedBy = rate.getAttribute("aria-describedby")!;
    expect(root.querySelector(`#${describedBy}`)).not.toBeNull();
  });

  it("follows the mode, so rate mode locks the target instead", async () => {
    const { hass, model } = build("rate");
    const root = (await render("wg-goal-editor", { hass, model, open: true })).shadowRoot!;
    const inputs = root.querySelectorAll<HTMLInputElement>('input[type="number"]');
    const [start, target, rate] = inputs;

    expect(start.disabled).toBe(false);
    expect(target.disabled).toBe(true);
    expect(rate.disabled).toBe(false);
  });

  it("keeps both editable when the integration does not say", async () => {
    // An older integration exposes no goal_mode; guessing which field is
    // derived would lock the wrong one.
    const { hass, model } = build(null);
    const root = (await render("wg-goal-editor", { hass, model, open: true })).shadowRoot!;
    for (const input of root.querySelectorAll<HTMLInputElement>('input[type="number"]')) {
      expect(input.disabled).toBe(false);
    }
    expect(root.querySelector("#derived")).toBeNull();
  });
});

describe("the header", () => {
  it("is the icon, the end date and the status by default", async () => {
    const { hass, model } = build("target");
    const root = (await render("wg-header", { hass, model, name: "Julien" })).shadowRoot!;
    expect(root.querySelector(".badge")).not.toBeNull();
    expect(root.querySelector("button.status")).not.toBeNull();
  });

  it("is one line of name and weight when compact", async () => {
    // What the separate chart card used to provide: a heading small enough to
    // sit over a card that is mostly chart.
    const { hass, model } = build("target");
    const root = (await render("wg-header", {
      hass,
      model,
      name: "Julien",
      compact: true,
    })).shadowRoot!;

    expect(root.querySelector(".compact")).not.toBeNull();
    expect(root.querySelector(".badge")).toBeNull();
    expect(root.querySelector("button.status")).toBeNull();
    expect(root.textContent).toContain("Julien");
    expect(root.textContent).toContain("74");
  });
});

describe("the two actions", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  const save = (root: ShadowRoot) =>
    [...root.querySelectorAll("button.control")].find((b) =>
      b.textContent?.includes("Save reading"),
    );
  const restart = (root: ShadowRoot) =>
    [...root.querySelectorAll("button.control")].find((b) =>
      b.textContent?.includes("Restart today"),
    );

  it("shows both by default", async () => {
    const { hass, model } = build("target");
    const root = (await render("wg-actions", { hass, model })).shadowRoot!;
    expect(save(root)).toBeTruthy();
    expect(restart(root)).toBeTruthy();
  });

  it("hides the reading entry on its own", async () => {
    // A scale user never types a weight; the restart button still belongs.
    const { hass, model } = build("target");
    const root = (await render("wg-actions", {
      hass,
      model,
      showRecord: false,
    })).shadowRoot!;
    expect(root.querySelector('input[type="number"]')).toBeNull();
    expect(save(root)).toBeUndefined();
    expect(restart(root)).toBeTruthy();
  });

  it("hides the restart on its own", async () => {
    const { hass, model } = build("target");
    const root = (await render("wg-actions", {
      hass,
      model,
      showRestart: false,
    })).shadowRoot!;
    expect(restart(root)).toBeUndefined();
    expect(save(root)).toBeTruthy();
  });

  it("renders nothing at all with both off", async () => {
    // There is no outer switch any more: the two toggles are the whole story,
    // and both off has to mean no action row rather than an empty one.
    const { hass, model } = build("target");
    const el = await render("wg-actions", {
      hass,
      model,
      showRecord: false,
      showRestart: false,
    });
    expect(el.shadowRoot!.querySelector(".actions")).toBeNull();
  });

  // 00:30 in Berlin, still the sixteenth in UTC. Every date below is the
  // Berlin one, so a test that passes has used the instance's zone.
  const MIDNIGHT_IN_BERLIN = "2026-09-16T22:30:00Z";

  /** The card renders, types into both fields and presses save. */
  async function enter(
    model: GoalModel,
    hass: HomeAssistant,
    weight: string,
    day?: string,
  ): Promise<ReturnType<typeof vi.fn>> {
    const calls = vi.fn(() => Promise.resolve({}));
    const withService = { ...hass, callService: calls } as typeof hass;
    const root = (
      await render("wg-actions", { hass: withService, model })
    ).shadowRoot!;

    if (day !== undefined) {
      const field = root.querySelector('input[type="date"]') as HTMLInputElement;
      field.value = day;
      field.dispatchEvent(new Event("input"));
    }
    const field = root.querySelector('input[type="number"]') as HTMLInputElement;
    field.value = weight;
    field.dispatchEvent(new Event("input"));

    const button = [...root.querySelectorAll("button.control")].find((b) =>
      b.textContent?.includes("Save reading"),
    ) as HTMLButtonElement;
    await (root.host as unknown as { updateComplete: Promise<unknown> })
      .updateComplete;
    button.click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    return calls;
  }

  it("offers today, in the zone of the instance", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(MIDNIGHT_IN_BERLIN));
    const { hass, model } = build("target");
    const root = (await render("wg-actions", { hass, model })).shadowRoot!;
    const field = root.querySelector('input[type="date"]') as HTMLInputElement;
    expect(field.value).toBe("2026-09-17");
    // Nothing later than today: the field is for catching up.
    expect(field.getAttribute("max")).toBe("2026-09-17");
  });

  it("records today without inventing a time", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(MIDNIGHT_IN_BERLIN));
    const { hass, model } = build("target");
    const calls = await enter(model, hass, "74.2");
    expect(calls).toHaveBeenCalledWith(
      "weight_goal",
      "record_weight",
      { weight: 74.2 },
      expect.anything(),
    );
  });

  it("files an earlier day at noon", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(MIDNIGHT_IN_BERLIN));
    const { hass, model } = build("target");
    const calls = await enter(model, hass, "76.0", "2026-09-10");
    expect(calls).toHaveBeenCalledWith(
      "weight_goal",
      "record_weight",
      // No offset: Home Assistant reads it in its own zone, which is where
      // the integration puts a backdated reading as well.
      { weight: 76.0, timestamp: "2026-09-10T12:00:00" },
      expect.anything(),
    );
  });

  it("refuses a day that has not happened", async () => {
    // The input caps itself, but a typed date walks past `max`.
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(MIDNIGHT_IN_BERLIN));
    const { hass, model } = build("target");
    const calls = await enter(model, hass, "74.2", "2026-09-18");
    expect(calls).not.toHaveBeenCalled();
  });

  it("goes back to today after saving", async () => {
    // A day left standing would quietly backdate the next reading too.
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(MIDNIGHT_IN_BERLIN));
    const { hass, model } = build("target");
    const calls = vi.fn(() => Promise.resolve({}));
    const withService = { ...hass, callService: calls } as typeof hass;
    const el = await render("wg-actions", { hass: withService, model });
    const root = el.shadowRoot!;

    const day = root.querySelector('input[type="date"]') as HTMLInputElement;
    day.value = "2026-09-10";
    day.dispatchEvent(new Event("input"));
    const weight = root.querySelector('input[type="number"]') as HTMLInputElement;
    weight.value = "76.0";
    weight.dispatchEvent(new Event("input"));
    await (el as unknown as { updateComplete: Promise<unknown> }).updateComplete;

    ([...root.querySelectorAll("button.control")].find((b) =>
      b.textContent?.includes("Save reading"),
    ) as HTMLButtonElement).click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    await (el as unknown as { updateComplete: Promise<unknown> }).updateComplete;

    expect(
      (root.querySelector('input[type="date"]') as HTMLInputElement).value,
    ).toBe("2026-09-17");
  });

  it("follows a day staged through the entities", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(MIDNIGHT_IN_BERLIN));
    const { hass, model } = build("target");
    const root = (
      await render("wg-actions", {
        hass,
        model: { ...model, manualDate: "2026-09-12" },
      })
    ).shadowRoot!;
    expect(
      (root.querySelector('input[type="date"]') as HTMLInputElement).value,
    ).toBe("2026-09-12");
  });

  it("drops the day field when the dashboard asked it to", async () => {
    const { hass, model } = build("target");
    const root = (
      await render("wg-actions", { hass, model, showRecordDate: false })
    ).shadowRoot!;
    expect(root.querySelector('input[type="date"]')).toBeNull();
    // The weight and the button stay: only the day went away.
    expect(root.querySelector('input[type="number"]')).not.toBeNull();
  });

  it("records today even when the entity holds another day", async () => {
    // Hidden means today, not "obey a date nobody can see": a staged day that
    // still moved the reading would be the trap the visible field avoids.
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(MIDNIGHT_IN_BERLIN));
    const { hass, model } = build("target");
    const calls = vi.fn(() => Promise.resolve({}));
    const withService = { ...hass, callService: calls } as typeof hass;
    const el = await render("wg-actions", {
      hass: withService,
      model: { ...model, manualDate: "2026-09-12" },
      showRecordDate: false,
    });
    const root = el.shadowRoot!;

    const weight = root.querySelector('input[type="number"]') as HTMLInputElement;
    weight.value = "74.2";
    weight.dispatchEvent(new Event("input"));
    await (el as unknown as { updateComplete: Promise<unknown> }).updateComplete;

    ([...root.querySelectorAll("button.control")].find((b) =>
      b.textContent?.includes("Save reading"),
    ) as HTMLButtonElement).click();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(calls).toHaveBeenCalledWith(
      "weight_goal",
      "record_weight",
      { weight: 74.2 },
      expect.anything(),
    );
  });

  it("flips the calendar glyph with the theme, not with the system", async () => {
    // The browser draws that glyph and ignores the CSS color; on a dark theme
    // running on a light machine it would be black on near-black.
    const { hass, model } = build("target");
    const dark = { ...hass, themes: { darkMode: true } } as typeof hass;
    const root = (await render("wg-actions", { hass: dark, model })).shadowRoot!;
    expect(root.querySelector("input.day")!.classList.contains("dark")).toBe(true);

    const light = (await render("wg-actions", { hass, model })).shadowRoot!;
    expect(light.querySelector("input.day")!.classList.contains("dark")).toBe(false);
  });

  it("translates the restart hint", async () => {
    // The hint used to be hardcoded English while the translation for it sat
    // unused in both locale files.
    const { hass, model } = build("target");
    const german = { ...hass, locale: { language: "de" } } as typeof hass;
    const root = (await render("wg-actions", {
      hass: german,
      model: { ...model, startTodayArmed: true },
    })).shadowRoot!;
    expect(root.querySelector(".hint")!.textContent).toContain("Startgewicht");
  });
});
