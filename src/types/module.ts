/**
 * A module id is any slug registered in `content/modules.json`.
 * Kept open so non-developers can add modules without touching `src/`.
 * The loader is expected to verify that every id seen in content resolves
 * against the registry.
 */
export type ModuleId = string;

export interface Module {
  id: ModuleId;
  title: string;
  description: string;
  /** Ordered list of lesson ids belonging to this module. */
  lessonOrder: string[];
  /** Ids of tasks associated with this module (task files live under content/<id>/tasks). */
  taskIds: string[];
  /** Optional icon / color hint for later UI; kept as plain strings to avoid coupling. */
  icon?: string;
  accent?: string;
}

export interface ModuleRegistry {
  version: 1;
  modules: ModuleId[];
}
