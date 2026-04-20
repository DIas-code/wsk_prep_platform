import type { Lesson, Module, ModuleId, ModuleRegistry, Task } from "../types";
import type { ContentLoader } from "./loader";
import { parseRegistry } from "./registry";
import { validateLesson, validateModule, validateTask } from "./validators";

const REGISTRY_PATH = "/content/modules.json";

/**
 * Content loader backed by a Vite `import.meta.glob` map (or an equivalent
 * path→rawJson map for tests). Keys are absolute project paths, e.g.
 *   /content/modules.json
 *   /content/<moduleId>/module.json
 *   /content/<moduleId>/lessons/<lessonId>.json
 *   /content/<moduleId>/tasks/<taskId>.json
 *
 * Values are the parsed JSON (no `{ default: … }` wrapper — unwrap at the Vite
 * entry point before constructing).
 */
export class ViteContentLoader implements ContentLoader {
  private readonly files: Readonly<Record<string, unknown>>;
  private registryCache?: ModuleRegistry;
  private readonly moduleCache = new Map<ModuleId, Module>();
  private readonly lessonCache = new Map<string, Lesson>();
  private readonly taskCache = new Map<string, Task>();

  constructor(files: Record<string, unknown>) {
    this.files = files;
  }

  getRegistry(): ModuleRegistry {
    if (this.registryCache) return this.registryCache;
    if (!(REGISTRY_PATH in this.files)) {
      throw new Error(`content: ${REGISTRY_PATH} not found in glob map`);
    }
    this.registryCache = parseRegistry(this.files[REGISTRY_PATH]);
    return this.registryCache;
  }

  async loadModule(id: ModuleId): Promise<Module> {
    const cached = this.moduleCache.get(id);
    if (cached) return cached;
    this.ensureRegistered(id);
    const path = `/content/${id}/module.json`;
    const raw = this.files[path];
    if (raw === undefined) {
      throw new Error(`content: module.json not found for "${id}" at ${path}`);
    }
    const mod = validateModule(raw);
    if (mod.id !== id) {
      throw new Error(`content: module at ${path} has id "${mod.id}" but folder is "${id}"`);
    }
    this.moduleCache.set(id, mod);
    return mod;
  }

  async loadLesson(moduleId: ModuleId, lessonId: string): Promise<Lesson> {
    const key = `${moduleId}/${lessonId}`;
    const cached = this.lessonCache.get(key);
    if (cached) return cached;
    this.ensureRegistered(moduleId);
    const path = `/content/${moduleId}/lessons/${lessonId}.json`;
    const raw = this.files[path];
    if (raw === undefined) {
      throw new Error(`content: lesson "${lessonId}" not found at ${path}`);
    }
    const lesson = validateLesson(raw);
    if (lesson.id !== lessonId) {
      throw new Error(
        `content: lesson at ${path} has id "${lesson.id}" but filename is "${lessonId}"`,
      );
    }
    if (lesson.moduleId !== moduleId) {
      throw new Error(
        `content: lesson "${lessonId}" claims moduleId "${lesson.moduleId}" but lives under "${moduleId}"`,
      );
    }
    this.lessonCache.set(key, lesson);
    return lesson;
  }

  async loadTask(moduleId: ModuleId, taskId: string): Promise<Task> {
    const key = `${moduleId}/${taskId}`;
    const cached = this.taskCache.get(key);
    if (cached) return cached;
    this.ensureRegistered(moduleId);
    const path = `/content/${moduleId}/tasks/${taskId}.json`;
    const raw = this.files[path];
    if (raw === undefined) {
      throw new Error(`content: task "${taskId}" not found at ${path}`);
    }
    const task = validateTask(raw);
    if (task.id !== taskId) {
      throw new Error(`content: task at ${path} has id "${task.id}" but filename is "${taskId}"`);
    }
    if (task.relatedModule !== moduleId) {
      throw new Error(
        `content: task "${taskId}" claims relatedModule "${task.relatedModule}" but lives under "${moduleId}"`,
      );
    }
    this.taskCache.set(key, task);
    return task;
  }

  async listLessons(moduleId: ModuleId): Promise<Lesson[]> {
    const mod = await this.loadModule(moduleId);
    this.assertNoOrphans(moduleId, "lessons", mod.lessonOrder);
    return Promise.all(mod.lessonOrder.map((id) => this.loadLesson(moduleId, id)));
  }

  async listTasks(moduleId: ModuleId): Promise<Task[]> {
    const mod = await this.loadModule(moduleId);
    this.assertNoOrphans(moduleId, "tasks", mod.taskIds);
    return Promise.all(mod.taskIds.map((id) => this.loadTask(moduleId, id)));
  }

  private ensureRegistered(id: ModuleId): void {
    const reg = this.getRegistry();
    if (!reg.modules.includes(id)) {
      throw new Error(`content: module "${id}" is not registered in modules.json`);
    }
  }

  private assertNoOrphans(
    moduleId: ModuleId,
    folder: "lessons" | "tasks",
    allowed: readonly string[],
  ): void {
    const prefix = `/content/${moduleId}/${folder}/`;
    const suffix = ".json";
    const onDisk = Object.keys(this.files)
      .filter((p) => p.startsWith(prefix) && p.endsWith(suffix))
      .map((p) => p.slice(prefix.length, -suffix.length));
    const set = new Set(allowed);
    const orphans = onDisk.filter((id) => !set.has(id));
    if (orphans.length > 0) {
      throw new Error(
        `content: ${moduleId} has ${folder} files not listed in module.json: ${orphans.join(", ")}`,
      );
    }
  }
}
