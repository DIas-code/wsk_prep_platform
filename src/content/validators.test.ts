import { describe, expect, it } from "vitest";

import {
  ContentValidationError,
  validateLesson,
  validateModule,
  validateTask,
} from "./validators";

import validModule from "../../content/csharp-maui/module.json" with { type: "json" };
import validLesson from "../../content/csharp-maui/lessons/01-intro-to-maui.json" with { type: "json" };
import validTask from "../../content/csharp-maui/tasks/task-session-1-kmg-assets.json" with { type: "json" };

describe("validateModule", () => {
  it("accepts a well-formed module", () => {
    expect(() => validateModule(validModule)).not.toThrow();
  });

  it("rejects a module missing `title` and names the missing field", () => {
    const { title: _omitted, ...broken } = validModule as Record<string, unknown>;
    expect(() => validateModule(broken)).toThrow(ContentValidationError);
    try {
      validateModule(broken);
    } catch (e) {
      const err = e as ContentValidationError;
      expect(err.message).toContain("title");
    }
  });

  it("rejects an id with invalid characters", () => {
    expect(() => validateModule({ ...validModule, id: "Has Spaces" })).toThrow(/pattern|id/i);
  });
});

describe("validateLesson", () => {
  it("accepts a well-formed lesson", () => {
    expect(() => validateLesson(validLesson)).not.toThrow();
  });

  it("rejects a lesson missing `theory` and names the missing field", () => {
    const { theory: _omitted, ...broken } = validLesson as Record<string, unknown>;
    try {
      validateLesson(broken);
      throw new Error("expected throw");
    } catch (e) {
      expect(e).toBeInstanceOf(ContentValidationError);
      expect((e as ContentValidationError).message).toContain("theory");
    }
  });

  it("rejects theory with an unknown `kind`", () => {
    const broken = { ...validLesson, theory: { kind: "video", value: "x" } };
    expect(() => validateLesson(broken)).toThrow(ContentValidationError);
  });
});

describe("validateTask", () => {
  it("accepts a well-formed task", () => {
    expect(() => validateTask(validTask)).not.toThrow();
  });

  it("rejects a task missing `assessmentCriteria` and names the missing field", () => {
    const { assessmentCriteria: _omitted, ...broken } = validTask as Record<string, unknown>;
    try {
      validateTask(broken);
      throw new Error("expected throw");
    } catch (e) {
      expect(e).toBeInstanceOf(ContentValidationError);
      expect((e as ContentValidationError).message).toContain("assessmentCriteria");
    }
  });

  it("rejects a task with an empty sections array", () => {
    expect(() => validateTask({ ...validTask, sections: [] })).toThrow(ContentValidationError);
  });

  it("rejects a section id that does not match dotted-number pattern", () => {
    const broken = {
      ...validTask,
      sections: [{ id: "abc", title: "x", body: "y" }],
    };
    expect(() => validateTask(broken)).toThrow(ContentValidationError);
  });
});
