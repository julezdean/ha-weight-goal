import { describe, expect, it } from "vitest";

import { de } from "../src/localize/de";
import { en } from "../src/localize/en";
import { entityLabel, formatState, localize } from "../src/localize";
import type { HomeAssistant } from "../src/types";

function hassWith(language: string): HomeAssistant {
  return { locale: { language }, states: {} } as unknown as HomeAssistant;
}

describe("string tables", () => {
  it("cover the same keys", () => {
    expect(Object.keys(de).sort()).toEqual(Object.keys(en).sort());
  });

  it("have no empty strings", () => {
    for (const [key, value] of Object.entries({ ...en, ...de })) {
      expect(value, key).not.toBe("");
    }
  });

  it("keep every placeholder that the English string uses", () => {
    const placeholders = (text: string) =>
      [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
    for (const key of Object.keys(en) as Array<keyof typeof en>) {
      expect(placeholders(de[key]), key).toEqual(placeholders(en[key]));
    }
  });
});

describe("localize", () => {
  it("uses the language from the locale", () => {
    expect(localize(hassWith("de"), "goal.title")).toBe("Ziel");
    expect(localize(hassWith("en"), "goal.title")).toBe("Goal");
  });

  it("falls back from a regional variant to the base language", () => {
    expect(localize(hassWith("de-CH"), "goal.title")).toBe("Ziel");
    expect(localize(hassWith("DE-de"), "goal.title")).toBe("Ziel");
  });

  it("falls back to English for a language nobody translated", () => {
    expect(localize(hassWith("fi"), "goal.title")).toBe(en["goal.title"]);
  });

  it("falls back to English without hass at all", () => {
    expect(localize(undefined, "goal.title")).toBe(en["goal.title"]);
  });

  it("prefers the locale over the profile language", () => {
    const hass = {
      language: "en",
      locale: { language: "de" },
    } as unknown as HomeAssistant;
    expect(localize(hass, "goal.title")).toBe("Ziel");
  });

  it("substitutes placeholders, including repeated ones", () => {
    expect(
      localize(hassWith("en"), "chart.summary_current", {
        value: "78.4",
        unit: "kg",
      }),
    ).toBe("currently 78.4 kg");
  });
});

describe("entityLabel", () => {
  const hass = {
    states: {
      "sensor.julien_last_measurement": {
        attributes: { friendly_name: "Julien Letzte Messung" },
      },
      "sensor.other": { attributes: { friendly_name: "Letzte Messung" } },
      "sensor.nameless": { attributes: {} },
    },
  } as unknown as HomeAssistant;

  it("strips the device name the integration puts in front", () => {
    expect(
      entityLabel(hass, "sensor.julien_last_measurement", "Julien"),
    ).toBe("Letzte Messung");
  });

  it("leaves a name alone when it does not start with the device", () => {
    expect(entityLabel(hass, "sensor.other", "Julien")).toBe("Letzte Messung");
  });

  it("does not cut a device name that only partly matches", () => {
    expect(
      entityLabel(hass, "sensor.julien_last_measurement", "Juli"),
    ).toBe("Julien Letzte Messung");
  });

  it("falls back to the entity id without a friendly name", () => {
    expect(entityLabel(hass, "sensor.nameless", "Julien")).toBe("sensor.nameless");
  });

  it("handles a missing entity", () => {
    expect(entityLabel(hass, undefined)).toBe("");
    expect(entityLabel(hass, "sensor.gone")).toBe("sensor.gone");
  });
});

describe("formatState", () => {
  const state = {
    entity_id: "sensor.x",
    state: "on_track",
    attributes: { unit_of_measurement: "kg" },
  } as never;

  it("uses formatEntityState when the frontend offers it", () => {
    const hass = {
      formatEntityState: () => "Im Plan",
    } as unknown as HomeAssistant;
    expect(formatState(hass, state)).toBe("Im Plan");
  });

  it("falls back to the raw state and unit", () => {
    const hass = {} as unknown as HomeAssistant;
    expect(formatState(hass, state)).toBe("on_track kg");
  });

  it("falls back when formatEntityState throws", () => {
    const hass = {
      formatEntityState: () => {
        throw new Error("nope");
      },
    } as unknown as HomeAssistant;
    expect(formatState(hass, state)).toBe("on_track kg");
  });
});
