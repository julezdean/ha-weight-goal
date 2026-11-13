// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";

import { anchorSchema, sectionsSchema, type FormSchema } from "../src/editors/schema";
import { WeightGoalCardEditor } from "../src/editors/weight-goal-card-editor";
import type { HomeAssistant, WeightGoalCardConfig } from "../src/types";

const t = (key: string): string => key;

function toggles(options: { manual: boolean; record: boolean }): string[] {
  const grid = sectionsSchema(t as never, options)[0] as FormSchema;
  return (grid.schema ?? []).map((field) => field.name);
}

describe("section switches", () => {
  it("offers both record switches while manual entry is on", () => {
    const names = toggles({ manual: true, record: true });
    expect(names).toContain("show_record");
    expect(names).toContain("show_record_date");
  });

  it("drops the day switch once the record row is off", () => {
    const names = toggles({ manual: true, record: false });
    expect(names).toContain("show_record");
    expect(names).not.toContain("show_record_date");
  });

  it("drops both without manual entry, whatever show_record says", () => {
    const names = toggles({ manual: false, record: true });
    expect(names).not.toContain("show_record");
    expect(names).not.toContain("show_record_date");
    expect(names).toContain("show_goals");
  });
});

describe("picking the person", () => {
  it("offers devices of the integration, not their entities", () => {
    const [anchor] = anchorSchema();
    expect(anchor.name).toBe("device_id");
    expect(anchor.selector).toEqual({ device: { integration: "weight_goal" } });
  });

  const hass = {
    states: {},
    entities: Object.fromEntries(
      ["julien_status", "julien_weight", "anna_weight", "anna_status"].map((id) => [
        `sensor.${id}`,
        {
          entity_id: `sensor.${id}`,
          platform: "weight_goal",
          device_id: id.split("_")[0],
          translation_key: id.split("_")[1],
        },
      ]),
    ),
  } as unknown as HomeAssistant;

  /** What the editor makes of a form value, for a card configured as `config`. */
  function change(
    config: WeightGoalCardConfig,
    value: Partial<WeightGoalCardConfig>,
  ): WeightGoalCardConfig {
    const editor = new WeightGoalCardEditor();
    editor.hass = hass;
    editor.setConfig(config);
    let written: WeightGoalCardConfig | undefined;
    editor.addEventListener("config-changed", (event) => {
      written = (event as CustomEvent).detail.config;
    });
    (editor as unknown as { _changed(event: CustomEvent): void })._changed(
      new CustomEvent("value-changed", { detail: { value: { ...config, ...value } } }),
    );
    return written!;
  }

  const byEntity = { type: "custom:weight-goal-card", entity: "sensor.julien_status" };

  it("leaves a card set up by entity as it was when something else changes", () => {
    const written = change(byEntity, { device_id: "julien", show_chart: false });
    expect(written.entity).toBe("sensor.julien_status");
    expect(written.device_id).toBeUndefined();
  });

  it("keeps the status sensor of another person once that one is picked", () => {
    const written = change(byEntity, { device_id: "anna" });
    expect(written.entity).toBe("sensor.anna_status");
    expect(written.device_id).toBeUndefined();
  });

  it("leaves another entity of the same person alone", () => {
    const written = change(
      { type: "custom:weight-goal-card", entity: "sensor.julien_weight" },
      { device_id: "julien", show_chart: false },
    );
    expect(written.entity).toBe("sensor.julien_weight");
  });

  it("turns a device id into the status sensor it stands for", () => {
    const written = change(
      { type: "custom:weight-goal-card", device_id: "anna" },
      { show_chart: false },
    );
    expect(written.entity).toBe("sensor.anna_status");
    expect(written.device_id).toBeUndefined();
  });

  it("keeps a device id it cannot name an entity for", () => {
    const written = change({ type: "custom:weight-goal-card" }, { device_id: "nobody" });
    expect(written.device_id).toBe("nobody");
  });
});
