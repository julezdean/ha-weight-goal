import { describe, expect, it } from "vitest";

import { discover } from "../src/lib/discovery";
import type { HomeAssistant } from "../src/types";

const KEYS = [
  ["number", "start_weight"],
  ["number", "target_weight"],
  ["number", "rate_per_week"],
  ["number", "manual_weight"],
  ["date", "start_date"],
  ["date", "end_date"],
  ["button", "start_today"],
  ["button", "confirm_start_today"],
  ["button", "record_weight"],
  ["sensor", "weight"],
  ["sensor", "target_weight_today"],
  ["sensor", "deviation"],
  ["sensor", "trend"],
  ["sensor", "weight_progress"],
  ["sensor", "time_progress"],
  ["sensor", "remaining"],
  ["sensor", "projected_date"],
  ["sensor", "status"],
  ["sensor", "last_measurement"],
] as const;

function buildHass(options: { translationKeys: boolean; deviceId?: string | null }) {
  const hass = {
    states: {},
    entities: {},
    devices: {
      dev1: { id: "dev1", name: "Julien", name_by_user: null },
    },
    config: { time_zone: "Europe/Berlin" },
  } as unknown as HomeAssistant;

  for (const [domain, key] of KEYS) {
    const entityId = `${domain}.julien_${key}`;
    hass.states[entityId] = {
      entity_id: entityId,
      state: "1",
      attributes: {},
      last_changed: "",
      last_updated: "",
    };
    hass.entities[entityId] = {
      entity_id: entityId,
      platform: "weight_goal",
      device_id: options.deviceId === undefined ? "dev1" : options.deviceId,
      ...(options.translationKeys ? { translation_key: key } : {}),
    };
  }
  return hass;
}

describe("discover", () => {
  it("finds every entity through the translation key", () => {
    const hass = buildHass({ translationKeys: true });
    const context = discover(hass, { entity: "sensor.julien_status" });
    expect(Object.keys(context.entities)).toHaveLength(KEYS.length);
    expect(context.entities.weight).toBe("sensor.julien_weight");
    expect(context.entities.start_weight).toBe("number.julien_start_weight");
    expect(context.name).toBe("Julien");
    expect(context.target).toBe("sensor.julien_status");
  });

  it("falls back to suffix matching without translation keys", () => {
    const hass = buildHass({ translationKeys: false });
    const context = discover(hass, { entity: "sensor.julien_status" });
    expect(Object.keys(context.entities)).toHaveLength(KEYS.length);
    // The interesting pair: both object ids end in `weight`.
    expect(context.entities.weight).toBe("sensor.julien_weight");
    expect(context.entities.start_weight).toBe("number.julien_start_weight");
    expect(context.entities.target_weight).toBe("number.julien_target_weight");
    expect(context.entities.target_weight_today).toBe(
      "sensor.julien_target_weight_today",
    );
  });

  it("falls back to the entity id prefix when the registry has no device", () => {
    const hass = buildHass({ translationKeys: false, deviceId: null });
    const context = discover(hass, { entity: "sensor.julien_status" });
    expect(context.entities.weight).toBe("sensor.julien_weight");
    expect(context.entities.end_date).toBe("date.julien_end_date");
  });

  it("ignores entities of other integrations on the same device", () => {
    const hass = buildHass({ translationKeys: true });
    hass.entities["sensor.julien_weight_scale"] = {
      entity_id: "sensor.julien_weight_scale",
      platform: "withings",
      device_id: "dev1",
      translation_key: "weight",
    };
    const context = discover(hass, { entity: "sensor.julien_status" });
    expect(context.entities.weight).toBe("sensor.julien_weight");
  });

  it("lets explicit overrides win", () => {
    const hass = buildHass({ translationKeys: true });
    const context = discover(hass, {
      entity: "sensor.julien_status",
      entities: { weight: "sensor.somewhere_else" },
    });
    expect(context.entities.weight).toBe("sensor.somewhere_else");
  });

  it("works from a device id alone", () => {
    const hass = buildHass({ translationKeys: true });
    const context = discover(hass, { device_id: "dev1" });
    expect(context.entities.status).toBe("sensor.julien_status");
    expect(context.target).toBe("sensor.julien_status");
  });

  it("returns an empty context for something unrelated", () => {
    const hass = buildHass({ translationKeys: true });
    const context = discover(hass, { entity: "light.kitchen" });
    expect(context.entities).toEqual({});
    expect(context.target).toBeUndefined();
  });
});
