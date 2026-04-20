import type { ModuleId, ModuleRegistry } from "../types";

/**
 * Single source of truth is `content/modules.json`. The loader calls
 * `parseRegistry` on its raw contents and every consumer reads the result.
 *
 * Keeping this in one place (instead of a duplicated `ENABLED_MODULES`
 * constant) avoids the reality of the two lists drifting apart.
 */
export function parseRegistry(raw: unknown): ModuleRegistry {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("modules.json: expected a JSON object");
  }
  const obj = raw as Record<string, unknown>;
  if (obj["version"] !== 1) {
    throw new Error(`modules.json: unsupported version ${String(obj["version"])}`);
  }
  const modules = obj["modules"];
  if (!Array.isArray(modules) || !modules.every((m) => typeof m === "string")) {
    throw new Error("modules.json: `modules` must be an array of strings");
  }
  const ids = modules as ModuleId[];
  const seen = new Set<string>();
  for (const id of ids) {
    if (!/^[a-z0-9-]+$/.test(id)) {
      throw new Error(`modules.json: module id "${id}" must match /^[a-z0-9-]+$/`);
    }
    if (seen.has(id)) {
      throw new Error(`modules.json: duplicate module id "${id}"`);
    }
    seen.add(id);
  }
  return { version: 1, modules: ids };
}
