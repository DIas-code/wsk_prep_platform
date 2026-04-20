import { describe, expect, it } from "vitest";

import { ViteContentLoader } from "./ViteContentLoader";

import validModule from "../../content/maui-sqlserver/module.json" with { type: "json" };
import validLesson from "../../content/maui-sqlserver/lessons/01-intro-to-maui.json" with { type: "json" };
import validTask from "../../content/maui-sqlserver/tasks/task-001-first-maui-app.json" with { type: "json" };

function makeFiles(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    "/content/modules.json": { version: 1, modules: ["maui-sqlserver"] },
    "/content/maui-sqlserver/module.json": validModule,
    "/content/maui-sqlserver/lessons/01-intro-to-maui.json": validLesson,
    "/content/maui-sqlserver/tasks/task-001-first-maui-app.json": validTask,
    ...overrides,
  };
}

describe("ViteContentLoader — happy path", () => {
  it("loads a valid module, lesson, and task", async () => {
    const l = new ViteContentLoader(makeFiles());
    await expect(l.loadModule("maui-sqlserver")).resolves.toMatchObject({ id: "maui-sqlserver" });
    await expect(l.loadLesson("maui-sqlserver", "01-intro-to-maui")).resolves.toMatchObject({
      id: "01-intro-to-maui",
    });
    await expect(l.loadTask("maui-sqlserver", "task-001-first-maui-app")).resolves.toMatchObject({
      id: "task-001-first-maui-app",
    });
  });

  it("memoizes: calling loadModule twice returns the same instance", async () => {
    const l = new ViteContentLoader(makeFiles());
    const a = await l.loadModule("maui-sqlserver");
    const b = await l.loadModule("maui-sqlserver");
    expect(a).toBe(b);
  });
});

describe("ViteContentLoader — validation failures", () => {
  it("throws when module.json is malformed (missing title)", async () => {
    const { title: _omit, ...broken } = validModule as Record<string, unknown>;
    const l = new ViteContentLoader(
      makeFiles({ "/content/maui-sqlserver/module.json": broken }),
    );
    await expect(l.loadModule("maui-sqlserver")).rejects.toThrow(/title/);
  });

  it("throws when module is not registered in modules.json", async () => {
    const l = new ViteContentLoader(makeFiles());
    await expect(l.loadModule("ghost-module")).rejects.toThrow(/not registered/);
  });

  it("throws when lesson id in JSON doesn't match filename", async () => {
    const files = makeFiles({
      "/content/maui-sqlserver/lessons/01-intro-to-maui.json": {
        ...validLesson,
        id: "different-id",
      },
    });
    const l = new ViteContentLoader(files);
    await expect(l.loadLesson("maui-sqlserver", "01-intro-to-maui")).rejects.toThrow(
      /filename/,
    );
  });

  it("throws when task relatedModule doesn't match its folder", async () => {
    const files = makeFiles({
      "/content/maui-sqlserver/tasks/task-001-first-maui-app.json": {
        ...validTask,
        relatedModule: "sql-ssms",
      },
    });
    const l = new ViteContentLoader(files);
    await expect(
      l.loadTask("maui-sqlserver", "task-001-first-maui-app"),
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
      moduleId: "maui-sqlserver",
      title: id,
      practice: [],
      relatedTaskIds: [],
    });
    const files = makeFiles({
      "/content/maui-sqlserver/module.json": moduleWithThreeLessons,
      "/content/maui-sqlserver/lessons/01-first.json": lessonFor("01-first"),
      "/content/maui-sqlserver/lessons/02-second.json": lessonFor("02-second"),
      "/content/maui-sqlserver/lessons/03-third.json": lessonFor("03-third"),
    });
    // Remove the default lesson/task so the module folder is clean.
    delete files["/content/maui-sqlserver/lessons/01-intro-to-maui.json"];
    delete files["/content/maui-sqlserver/tasks/task-001-first-maui-app.json"];
    const withEmptyTaskIds = {
      ...moduleWithThreeLessons,
      taskIds: [],
    };
    files["/content/maui-sqlserver/module.json"] = withEmptyTaskIds;

    const l = new ViteContentLoader(files);
    const lessons = await l.listLessons("maui-sqlserver");
    expect(lessons.map((x) => x.id)).toEqual(["03-third", "01-first", "02-second"]);
  });

  it("throws when a lesson file exists but is not listed in lessonOrder (orphan)", async () => {
    const files = makeFiles({
      "/content/maui-sqlserver/lessons/02-orphan.json": {
        ...validLesson,
        id: "02-orphan",
      },
    });
    const l = new ViteContentLoader(files);
    await expect(l.listLessons("maui-sqlserver")).rejects.toThrow(/02-orphan/);
  });

  it("throws when a task file exists but is not listed in taskIds (orphan)", async () => {
    const files = makeFiles({
      "/content/maui-sqlserver/tasks/task-999-orphan.json": {
        ...validTask,
        id: "task-999-orphan",
      },
    });
    const l = new ViteContentLoader(files);
    await expect(l.listTasks("maui-sqlserver")).rejects.toThrow(/task-999-orphan/);
  });

  it("throws when lessonOrder references a lesson whose file is missing", async () => {
    const files = makeFiles({
      "/content/maui-sqlserver/module.json": {
        ...validModule,
        lessonOrder: ["01-intro-to-maui", "02-missing"],
      },
    });
    const l = new ViteContentLoader(files);
    await expect(l.listLessons("maui-sqlserver")).rejects.toThrow(/02-missing/);
  });
});
