import { describe, expect, it } from "vitest";

import { sectionsSchema, type FormSchema } from "../src/editors/schema";

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
