import { describe, expect, it } from "vitest";

import { parseRegistry } from "./registry";

describe("parseRegistry", () => {
  it("accepts a valid registry", () => {
    const r = parseRegistry({ version: 1, modules: ["a", "b-c", "d2"] });
    expect(r.version).toBe(1);
    expect(r.modules).toEqual(["a", "b-c", "d2"]);
  });

  it.each([null, undefined, "string", 42, true, []])("rejects non-object input (%p)", (input) => {
    expect(() => parseRegistry(input)).toThrow(/JSON object/);
  });

  it.each([0, 2, "1", undefined])("rejects unsupported version %p", (v) => {
    expect(() => parseRegistry({ version: v, modules: [] })).toThrow(/version/);
  });

  it("rejects non-array modules", () => {
    expect(() => parseRegistry({ version: 1, modules: "a,b" })).toThrow(/array of strings/);
  });

  it("rejects non-string module entry", () => {
    expect(() => parseRegistry({ version: 1, modules: ["a", 2] })).toThrow(/array of strings/);
  });

  it.each(["Has Spaces", "UPPER", "foo_bar", "", "a/b"])("rejects bad slug %p", (slug) => {
    expect(() => parseRegistry({ version: 1, modules: [slug] })).toThrow(/pattern|id/i);
  });

  it("rejects duplicate module ids", () => {
    expect(() => parseRegistry({ version: 1, modules: ["a", "b", "a"] })).toThrow(/duplicate/);
  });
});
