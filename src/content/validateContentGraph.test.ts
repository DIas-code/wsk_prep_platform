import { describe, expect, it } from "vitest";

import type { Lesson, Module, ModuleRegistry, Task } from "../types";
import { validateContentGraph } from "./validateContentGraph";

function makeModule(over: Partial<Module> = {}): Module {
  return {
    id: "m1",
    title: "M1",
    description: "",
    lessonOrder: ["l1"],
    taskIds: ["task-t1"],
    ...over,
  };
}

function makeLesson(over: Partial<Lesson> = {}): Lesson {
  return {
    id: "l1",
    moduleId: "m1",
    title: "L1",
    summary: "",
    estimatedMinutes: 10,
    theory: { kind: "inline", value: "x" },
    practice: [],
    relatedTaskIds: [],
    ...over,
  };
}

function makeTask(over: Partial<Task> = {}): Task {
  return {
    id: "task-t1",
    title: "T1",
    summary: "s",
    overview: "o",
    difficulty: "easy",
    relatedModule: "m1",
    relatedLessons: [],
    sections: [{ id: "1", title: "s1", body: "b" }],
    assessmentCriteria: [{ id: "c1", text: "criterion" }],
    ...over,
  };
}

const okRegistry: ModuleRegistry = { version: 1, modules: ["m1"] };

describe("validateContentGraph — happy path", () => {
  it("returns no errors for a consistent graph", () => {
    const { errors } = validateContentGraph(
      okRegistry,
      [makeModule()],
      [makeLesson()],
      [makeTask()],
    );
    expect(errors).toEqual([]);
  });
});

describe("validateContentGraph — module → lessonOrder", () => {
  it("flags a lessonOrder entry with no matching lesson", () => {
    const { errors } = validateContentGraph(
      okRegistry,
      [makeModule({ lessonOrder: ["ghost"] })],
      [],
      [makeTask()],
    );
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatchObject({ kind: "missing-lesson", where: "module:m1.lessonOrder[0]" });
  });

  it("flags a lesson whose moduleId does not match its module", () => {
    const { errors } = validateContentGraph(
      okRegistry,
      [makeModule()],
      [makeLesson({ moduleId: "other" })],
      [makeTask()],
    );
    expect(errors.map((e) => e.kind)).toContain("lesson-module-mismatch");
  });
});

describe("validateContentGraph — module → taskIds", () => {
  it("flags a taskIds entry with no matching task", () => {
    const { errors } = validateContentGraph(
      okRegistry,
      [makeModule({ taskIds: ["task-ghost"] })],
      [makeLesson()],
      [],
    );
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatchObject({ kind: "missing-task" });
  });

  it("flags a task whose relatedModule does not match", () => {
    const { errors } = validateContentGraph(
      okRegistry,
      [makeModule()],
      [makeLesson()],
      [makeTask({ relatedModule: "other" })],
    );
    expect(errors.map((e) => e.kind)).toContain("task-module-mismatch");
  });
});

describe("validateContentGraph — lesson.relatedTaskIds & task.relatedLessons", () => {
  it("flags a lesson pointing at a nonexistent task", () => {
    const { errors } = validateContentGraph(
      okRegistry,
      [makeModule()],
      [makeLesson({ relatedTaskIds: ["task-ghost"] })],
      [makeTask()],
    );
    expect(errors.map((e) => e.kind)).toContain("missing-task");
  });

  it("flags a task.relatedLessons entry pointing at a lesson outside its module", () => {
    const foreignLesson = makeLesson({ id: "foreign", moduleId: "m2" });
    const { errors } = validateContentGraph(
      { version: 1, modules: ["m1", "m2"] },
      [makeModule(), makeModule({ id: "m2", lessonOrder: ["foreign"], taskIds: [] })],
      [makeLesson(), foreignLesson],
      [makeTask({ relatedLessons: ["foreign"] })],
    );
    expect(errors.map((e) => e.kind)).toContain("missing-lesson");
  });
});

describe("validateContentGraph — 2.2 duplicate ids", () => {
  it("flags duplicate practice-step ids within a block", () => {
    const lesson = makeLesson({
      practice: [
        {
          id: "b1",
          title: "t",
          goal: "g",
          steps: [
            { id: "s1", instruction: "i" },
            { id: "s1", instruction: "i" },
          ],
        },
      ],
    });
    const { errors } = validateContentGraph(
      okRegistry,
      [makeModule()],
      [lesson],
      [makeTask()],
    );
    expect(errors.map((e) => e.kind)).toContain("duplicate-step-id");
  });

  it("flags duplicate section ids at the same level", () => {
    const task = makeTask({
      sections: [
        { id: "1", title: "a", body: "b" },
        { id: "1", title: "c", body: "d" },
      ],
    });
    const { errors } = validateContentGraph(
      okRegistry,
      [makeModule()],
      [makeLesson()],
      [task],
    );
    expect(errors.map((e) => e.kind)).toContain("duplicate-section-id");
  });

  it("allows identical sub-section ids under different parents (nesting)", () => {
    const task = makeTask({
      sections: [
        {
          id: "1",
          title: "a",
          body: "b",
          children: [{ id: "1.1", title: "x", body: "" }],
        },
        {
          id: "2",
          title: "c",
          body: "d",
          children: [{ id: "2.1", title: "y", body: "" }],
        },
      ],
    });
    const { errors } = validateContentGraph(
      okRegistry,
      [makeModule()],
      [makeLesson()],
      [task],
    );
    expect(errors).toEqual([]);
  });
});
