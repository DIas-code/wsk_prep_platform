import { describe, expect, it } from "vitest";

import { ViteContentLoader } from "./ViteContentLoader";

import validModule from "../../content/csharp-maui/module.json" with { type: "json" };
import validLesson from "../../content/csharp-maui/lessons/01-intro-to-maui.json" with { type: "json" };
import validTask from "../../content/csharp-maui/tasks/task-session-1-kmg-assets.json" with { type: "json" };

function makeFiles(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    "/content/modules.json": { version: 1, modules: ["csharp-maui"] },
    "/content/csharp-maui/module.json": validModule,
    "/content/csharp-maui/lessons/01-intro-to-maui.json": validLesson,
    "/content/csharp-maui/tasks/task-session-1-kmg-assets.json": validTask,
    ...overrides,
  };
}

describe("ViteContentLoader — happy path", () => {
  it("loads a valid module, lesson, and task", async () => {
    const l = new ViteContentLoader(makeFiles());
    await expect(l.loadModule("csharp-maui")).resolves.toMatchObject({ id: "csharp-maui" });
    await expect(l.loadLesson("csharp-maui", "01-intro-to-maui")).resolves.toMatchObject({
      id: "01-intro-to-maui",
    });
    await expect(l.loadTask("csharp-maui", "task-session-1-kmg-assets")).resolves.toMatchObject({
      id: "task-session-1-kmg-assets",
    });
  });

  it("memoizes: calling loadModule twice returns the same instance", async () => {
    const l = new ViteContentLoader(makeFiles());
    const a = await l.loadModule("csharp-maui");
    const b = await l.loadModule("csharp-maui");
    expect(a).toBe(b);
  });
});

describe("ViteContentLoader — validation failures", () => {
  it("throws when module.json is malformed (missing title)", async () => {
    const { title: _omit, ...broken } = validModule as Record<string, unknown>;
    const l = new ViteContentLoader(
      makeFiles({ "/content/csharp-maui/module.json": broken }),
    );
    await expect(l.loadModule("csharp-maui")).rejects.toThrow(/title/);
  });

  it("throws when module is not registered in modules.json", async () => {
    const l = new ViteContentLoader(makeFiles());
    await expect(l.loadModule("ghost-module")).rejects.toThrow(/not registered/);
  });

  it("throws when lesson id in JSON doesn't match filename", async () => {
    const files = makeFiles({
      "/content/csharp-maui/lessons/01-intro-to-maui.json": {
        ...validLesson,
        id: "different-id",
      },
    });
    const l = new ViteContentLoader(files);
    await expect(l.loadLesson("csharp-maui", "01-intro-to-maui")).rejects.toThrow(
      /filename/,
    );
  });

  it("throws when task relatedModule doesn't match its folder", async () => {
    const files = makeFiles({
      "/content/csharp-maui/tasks/task-session-1-kmg-assets.json": {
        ...validTask,
        relatedModule: "sql-ssms",
      },
    });
    const l = new ViteContentLoader(files);
    await expect(
      l.loadTask("csharp-maui", "task-session-1-kmg-assets"),
    ).rejects.toThrow(/relatedModule/);
  });
});

describe("ViteContentLoader.listLessons / listTasks — ordering & orphans (1.3)", () => {
  it("returns lessons in lessonOrder (not alphabetical)", async () => {
    const moduleWithThreeLessons = {
      ...validModule,
      lessonOrder: ["03-third", "01-first", "02-second"],
    };
    const lessonFor = (id: string) => ({
      ...validLesson,
      id,
      moduleId: "csharp-maui",
      title: id,
      practice: [],
      relatedTaskIds: [],
    });
    const files = makeFiles({
      "/content/csharp-maui/module.json": moduleWithThreeLessons,
      "/content/csharp-maui/lessons/01-first.json": lessonFor("01-first"),
      "/content/csharp-maui/lessons/02-second.json": lessonFor("02-second"),
      "/content/csharp-maui/lessons/03-third.json": lessonFor("03-third"),
    });
    // Remove the default lesson/task so the module folder is clean.
    delete files["/content/csharp-maui/lessons/01-intro-to-maui.json"];
    delete files["/content/csharp-maui/tasks/task-session-1-kmg-assets.json"];
    const withEmptyTaskIds = {
      ...moduleWithThreeLessons,
      taskIds: [],
    };
    files["/content/csharp-maui/module.json"] = withEmptyTaskIds;

    const l = new ViteContentLoader(files);
    const lessons = await l.listLessons("csharp-maui");
    expect(lessons.map((x) => x.id)).toEqual(["03-third", "01-first", "02-second"]);
  });

  it("throws when a lesson file exists but is not listed in lessonOrder (orphan)", async () => {
    const files = makeFiles({
      "/content/csharp-maui/lessons/02-orphan.json": {
        ...validLesson,
        id: "02-orphan",
      },
    });
    const l = new ViteContentLoader(files);
    await expect(l.listLessons("csharp-maui")).rejects.toThrow(/02-orphan/);
  });

  it("throws when a task file exists but is not listed in taskIds (orphan)", async () => {
    const files = makeFiles({
      "/content/csharp-maui/tasks/task-999-orphan.json": {
        ...validTask,
        id: "task-999-orphan",
      },
    });
    const l = new ViteContentLoader(files);
    await expect(l.listTasks("csharp-maui")).rejects.toThrow(/task-999-orphan/);
  });

  it("throws when lessonOrder references a lesson whose file is missing", async () => {
    const files = makeFiles({
      "/content/csharp-maui/module.json": {
        ...validModule,
        lessonOrder: ["01-intro-to-maui", "02-missing"],
      },
    });
    const l = new ViteContentLoader(files);
    await expect(l.listLessons("csharp-maui")).rejects.toThrow(/02-missing/);
  });
});
