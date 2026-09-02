import { describe, expect, it } from "vitest";

import { DEFAULT_BADGES, resolveBadges } from "../src/lib/badges";
import type { GoalModel } from "../src/lib/goal";
import type { HomeAssistant } from "../src/types";

function build(states: Record<string, { state: string; unit?: string; name?: string }>) {
  const hass = {
    locale: { language: "en" },
    states: {},
    config: { time_zone: "Europe/Berlin" },
  } as unknown as HomeAssistant;

  for (const [entityId, value] of Object.entries(states)) {
    hass.states[entityId] = {
      entity_id: entityId,
      state: value.state,
      attributes: {
        friendly_name: value.name ?? `Julien ${entityId.split(".")[1]}`,
        ...(value.unit ? { unit_of_measurement: value.unit } : {}),
      },
      last_changed: "",
      last_updated: "",
    };
  }

  const model = {
    unit: "kg",
    measurementSource: "sensor",
    context: {
      name: "Julien",
      entities: Object.fromEntries(
        Object.keys(states).map((id) => [id.split(".")[1].replace("julien_", ""), id]),
      ),
    },
  } as unknown as GoalModel;

  return { hass, model };
}

describe("resolveBadges", () => {
  it("shows the four defaults when everything is available", () => {
    const { hass, model } = build({
      "sensor.julien_last_measurement": { state: new Date().toISOString() },
      "sensor.julien_trend": { state: "-0.6", unit: "kg" },
      "sensor.julien_remaining": { state: "5.4", unit: "kg" },
      "sensor.julien_projected_date": { state: new Date().toISOString() },
    });
    const badges = resolveBadges(hass, model);
    expect(badges.map((b) => b.key)).toEqual(DEFAULT_BADGES);
  });

  it("drops a badge whose entity is unavailable or unknown", () => {
    const { hass, model } = build({
      "sensor.julien_trend": { state: "unavailable" },
      "sensor.julien_remaining": { state: "unknown" },
      "sensor.julien_last_measurement": { state: new Date().toISOString() },
    });
    expect(resolveBadges(hass, model).map((b) => b.key)).toEqual([
      "last_measurement",
    ]);
  });

  it("keeps the order the configuration asks for", () => {
    const { hass, model } = build({
      "sensor.julien_remaining": { state: "5.4", unit: "kg" },
      "sensor.julien_trend": { state: "-0.6", unit: "kg" },
    });
    const badges = resolveBadges(hass, model, ["remaining", "trend"]);
    expect(badges.map((b) => b.key)).toEqual(["remaining", "trend"]);
  });

  it("shows nothing for an empty list", () => {
    const { hass, model } = build({
      "sensor.julien_trend": { state: "-0.6", unit: "kg" },
    });
    expect(resolveBadges(hass, model, [])).toEqual([]);
  });

  it("signs the trend so a loss reads as a loss", () => {
    const { hass, model } = build({
      "sensor.julien_trend": { state: "-0.6", unit: "kg" },
    });
    expect(resolveBadges(hass, model, ["trend"])[0].text).toBe("-0.6 kg");
  });

  it("labels a badge with the entity name, without the device in front", () => {
    const { hass, model } = build({
      "sensor.julien_remaining": {
        state: "5.4",
        unit: "kg",
        name: "Julien Remaining",
      },
    });
    expect(resolveBadges(hass, model, ["remaining"])[0].label).toBe("Remaining");
  });

  it("supports a custom entity badge", () => {
    const { hass, model } = build({
      "sensor.julien_trend": { state: "-0.6", unit: "kg" },
    });
    hass.states["sensor.body_fat"] = {
      entity_id: "sensor.body_fat",
      state: "18.2",
      attributes: { friendly_name: "Body fat", unit_of_measurement: "%" },
      last_changed: "",
      last_updated: "",
    };
    const badges = resolveBadges(hass, model, [
      { entity: "sensor.body_fat", icon: "mdi:percent", name: "Fat" },
    ]);
    expect(badges).toHaveLength(1);
    expect(badges[0].icon).toBe("mdi:percent");
    expect(badges[0].label).toBe("Fat");
    expect(badges[0].text).toBe("18.2 %");
  });

  it("drops a custom badge pointing at nothing", () => {
    const { hass, model } = build({});
    expect(resolveBadges(hass, model, [{ entity: "sensor.gone" }])).toEqual([]);
  });

  it("ignores an unknown built-in name instead of throwing", () => {
    const { hass, model } = build({
      "sensor.julien_trend": { state: "-0.6", unit: "kg" },
    });
    const badges = resolveBadges(hass, model, [
      "not_a_badge" as never,
      "trend",
    ]);
    expect(badges.map((b) => b.key)).toEqual(["trend"]);
  });

  it("translates the source badge", () => {
    const { hass, model } = build({
      "sensor.julien_weight": { state: "78.4", unit: "kg" },
    });
    expect(resolveBadges(hass, model, ["source"])[0].text).toBe("From the scale");
  });
});
