import { describe, expect, it } from "vitest";

import { parseDecimal } from "../src/lib/format";

describe("parseDecimal", () => {
  it.each([
    ["73", 73],
    ["73,2", 73.2],
    ["73.2", 73.2],
    ["73,", 73],
    [",5", 0.5],
    ["-0,38", -0.38],
    [" 74.1 ", 74.1],
  ])("reads %j as %d", (raw, value) => {
    expect(parseDecimal(raw)).toBe(value);
  });

  it.each(["", " ", ",", "-", "7a", "1e3", "73,2,1", "73.2.1", "1,5.2"])(
    "refuses %j",
    (raw) => {
      expect(parseDecimal(raw)).toBeNull();
    },
  );
});
