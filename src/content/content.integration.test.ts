import { describe, expect, it } from "vitest";

import type { Lesson, Module, ModuleId, Task } from "../types";
import { parseRegistry } from "./registry";
import { validateContentGraph } from "./validateContentGraph";
import { validateLesson, validateModule, validateTask } from "./validators";

type JsonMap = Record<string, unknown>;

const registryMap = import.meta.glob("/content/modules.json", {
  eager: true,
  import: "default",
}) as JsonMap;
const moduleMap = import.meta.glob("/content/*/module.json", {
  eager: true,
  import: "default",
}) as JsonMap;
const lessonMap = import.meta.glob("/content/*/lessons/*.json", {
  eager: true,
  import: "default",
}) as JsonMap;
const taskMap = import.meta.glob("/content/*/tasks/*.json", {
  eager: true,
  import: "default",
}) as JsonMap;

function moduleIdFromPath(path: string): string {
  const m = /^\/content\/([^/]+)\//.exec(path);
  if (!m) throw new Error(`unexpected path: ${path}`);
  return m[1]!;
}

describe("content/ on disk — end-to-end integrity", () => {
  const registryRaw = registryMap["/content/modules.json"];
  if (!registryRaw) throw new Error("content/modules.json not found");
  const registry = parseRegistry(registryRaw);

  const modules: Module[] = [];
  const lessons: Lesson[] = [];
  const tasks: Task[] = [];

  for (const id of registry.modules) {
    const raw = moduleMap[`/content/${id}/module.json`];
    if (!raw) throw new Error(`content/${id}/module.json missing`);
    modules.push(validateModule(raw));
  }

  for (const [path, raw] of Object.entries(lessonMap)) {
    const id = moduleIdFromPath(path) as ModuleId;
    if (!registry.modules.includes(id)) continue;
    lessons.push(validateLesson(raw));
  }

  for (const [path, raw] of Object.entries(taskMap)) {
    const id = moduleIdFromPath(path) as ModuleId;
    if (!registry.modules.includes(id)) continue;
    tasks.push(validateTask(raw));
  }

  it("every module in modules.json parses against its schema", () => {
    expect(modules.length).toBe(registry.modules.length);
  });

  it("every lesson and task file on disk passes its schema", () => {
    expect(lessons.length).toBeGreaterThan(0);
    expect(tasks.length).toBeGreaterThan(0);
  });

  it("validateContentGraph reports no issues", () => {
    const result = validateContentGraph(registry, modules, lessons, tasks);
    if (result.errors.length > 0) {
      const pretty = result.errors
        .map((e) => `  - [${e.kind}] ${e.where}: ${e.message}`)
        .join("\n");
      throw new Error(`content graph has ${result.errors.length} issue(s):\n${pretty}`);
    }
  });

  it("every task lists at least 2 prep lessons (6.4 quality bar)", () => {
    for (const t of tasks) {
      expect(t.relatedLessons?.length ?? 0, `task ${t.id}`).toBeGreaterThanOrEqual(2);
    }
  });
});
