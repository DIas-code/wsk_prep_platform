import type { Lesson, Module, ModuleId, Task } from "../types";

/**
 * Contract for loading content. The concrete implementation is deferred
 * (static import, fetch, filesystem — chosen once a UI layer is picked).
 *
 * The loader is responsible for:
 *   1. Reading the raw JSON
 *   2. Validating it against the JSON Schema in /schemas
 *   3. Returning the typed object
 *
 * Validation failures should throw — bad content must never reach the UI.
 */
export interface ContentLoader {
  loadModule(id: ModuleId): Promise<Module>;
  loadLesson(moduleId: ModuleId, lessonId: string): Promise<Lesson>;
  loadTask(moduleId: ModuleId, taskId: string): Promise<Task>;

  listLessons(moduleId: ModuleId): Promise<Lesson[]>;
  listTasks(moduleId: ModuleId): Promise<Task[]>;
}
