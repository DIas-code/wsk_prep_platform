import {
  PROGRESS_STORAGE_KEY,
  type LessonProgress,
  type ModuleId,
  type ModuleProgress,
  type ProgressState,
  type TaskProgress,
} from "../types";

const BROKEN_PREFIX = `${PROGRESS_STORAGE_KEY}.broken-`;
const BACKUP_PREFIX = `${PROGRESS_STORAGE_KEY}.backup-`;

function emptyState(): ProgressState {
  return { version: 1, modules: {}, updatedAt: new Date().toISOString() };
}

export function loadProgress(): ProgressState {
  if (typeof localStorage === "undefined") return emptyState();
  const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
  if (!raw) return emptyState();

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    archive(raw, BROKEN_PREFIX);
    localStorage.removeItem(PROGRESS_STORAGE_KEY);
    return emptyState();
  }

  const version = (parsed as { version?: unknown } | null)?.version;
  if (version !== 1) {
    archive(raw, BACKUP_PREFIX);
    localStorage.removeItem(PROGRESS_STORAGE_KEY);
    return emptyState();
  }

  if (!isProgressState(parsed)) {
    archive(raw, BROKEN_PREFIX);
    localStorage.removeItem(PROGRESS_STORAGE_KEY);
    return emptyState();
  }

  return parsed;
}

export function saveProgress(state: ProgressState): void {
  if (typeof localStorage === "undefined") return;
  const next: ProgressState = { ...state, updatedAt: new Date().toISOString() };
  localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(next));
}

function ensureModule(state: ProgressState, moduleId: ModuleId): {
  state: ProgressState;
  mod: ModuleProgress;
} {
  const existing = state.modules[moduleId];
  const mod: ModuleProgress = existing
    ? { lessons: { ...existing.lessons }, tasks: { ...existing.tasks } }
    : { lessons: {}, tasks: {} };
  const nextState: ProgressState = {
    ...state,
    modules: { ...state.modules, [moduleId]: mod },
  };
  return { state: nextState, mod };
}

export function updateLesson(
  moduleId: ModuleId,
  lessonId: string,
  patch: Partial<LessonProgress>,
): ProgressState {
  const loaded = loadProgress();
  const { state, mod } = ensureModule(loaded, moduleId);
  const prev = mod.lessons[lessonId] ?? { stepsDone: [] };
  mod.lessons[lessonId] = { ...prev, ...patch };
  saveProgress(state);
  return state;
}

export function updateTask(
  moduleId: ModuleId,
  taskId: string,
  patch: Partial<TaskProgress>,
): ProgressState {
  const loaded = loadProgress();
  const { state, mod } = ensureModule(loaded, moduleId);
  const prev = mod.tasks[taskId] ?? {};
  const clamped: Partial<TaskProgress> =
    patch.selfScore !== undefined
      ? { ...patch, selfScore: clamp(patch.selfScore, 0, 100) }
      : patch;
  mod.tasks[taskId] = { ...prev, ...clamped };
  saveProgress(state);
  return state;
}

/**
 * Start the timer for a task. Idempotent: if `startedAt` is already set, returns state
 * unchanged so a reload or re-render doesn't reset the student's clock.
 */
export function startTask(moduleId: ModuleId, taskId: string): ProgressState {
  const loaded = loadProgress();
  const existing = loaded.modules[moduleId]?.tasks[taskId]?.startedAt;
  if (existing) return loaded;
  const now = new Date().toISOString();
  const { state, mod } = ensureModule(loaded, moduleId);
  const prev = mod.tasks[taskId] ?? {};
  mod.tasks[taskId] = { ...prev, startedAt: now, attemptedAt: prev.attemptedAt ?? now };
  saveProgress(state);
  return state;
}

/** Clear the timer so the student can start over. Keeps criteria/deliverables untouched. */
export function resetTaskTimer(moduleId: ModuleId, taskId: string): ProgressState {
  const loaded = loadProgress();
  const { state, mod } = ensureModule(loaded, moduleId);
  const prev = mod.tasks[taskId];
  if (!prev?.startedAt) return loaded;
  const { startedAt: _omit, ...rest } = prev;
  mod.tasks[taskId] = rest;
  saveProgress(state);
  return state;
}

export function updateTaskCriteria(
  moduleId: ModuleId,
  taskId: string,
  criterionId: string,
  checked: boolean,
): ProgressState {
  return toggleTaskArray(moduleId, taskId, "criteriaChecked", criterionId, checked);
}

export function updateTaskDeliverable(
  moduleId: ModuleId,
  taskId: string,
  deliverableId: string,
  done: boolean,
): ProgressState {
  return toggleTaskArray(moduleId, taskId, "deliverablesDone", deliverableId, done);
}

function toggleTaskArray(
  moduleId: ModuleId,
  taskId: string,
  field: "criteriaChecked" | "deliverablesDone",
  id: string,
  on: boolean,
): ProgressState {
  const loaded = loadProgress();
  const { state, mod } = ensureModule(loaded, moduleId);
  const prev = mod.tasks[taskId] ?? {};
  const current = new Set(prev[field] ?? []);
  if (on) current.add(id);
  else current.delete(id);
  mod.tasks[taskId] = { ...prev, [field]: [...current] };
  saveProgress(state);
  return state;
}

/**
 * Serialize the current progress state to a pretty-printed JSON string so the
 * student can save it as a backup or move it between browsers.
 */
export function exportProgressJson(): string {
  return JSON.stringify(loadProgress(), null, 2);
}

/**
 * Replace the stored progress with the payload in `raw`. Throws a human-readable
 * error if the JSON is malformed or does not match the v1 schema — the caller
 * should surface the message to the user.
 */
export function importProgressJson(raw: string): ProgressState {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Файл не является корректным JSON");
  }
  if (!isProgressState(parsed)) {
    throw new Error("Файл не соответствует формату прогресса (ожидается version=1)");
  }
  saveProgress(parsed);
  return loadProgress();
}

/** % of lessons in the module marked complete (0-100). */
export function moduleCompletion(
  state: ProgressState,
  moduleId: ModuleId,
  totalLessons: number,
): number {
  if (totalLessons === 0) return 0;
  const mod = state.modules[moduleId];
  if (!mod) return 0;
  const done = Object.values(mod.lessons).filter((l) => !!l.completedAt).length;
  return Math.round((done / totalLessons) * 100);
}

function clamp(n: number, lo: number, hi: number): number {
  if (Number.isNaN(n)) return lo;
  return Math.max(lo, Math.min(hi, n));
}

function archive(raw: string, prefix: string): void {
  try {
    localStorage.setItem(`${prefix}${Date.now()}`, raw);
  } catch {
    // Storage full or blocked — drop the archive but keep the reset going.
  }
}

function isProgressState(x: unknown): x is ProgressState {
  if (!isPlainObject(x)) return false;
  if (x["version"] !== 1) return false;
  if (typeof x["updatedAt"] !== "string") return false;
  const modules = x["modules"];
  if (!isPlainObject(modules)) return false;
  for (const mod of Object.values(modules)) {
    if (!isModuleProgress(mod)) return false;
  }
  return true;
}

function isModuleProgress(x: unknown): x is ModuleProgress {
  if (!isPlainObject(x)) return false;
  const lessons = x["lessons"];
  const tasks = x["tasks"];
  if (!isPlainObject(lessons) || !isPlainObject(tasks)) return false;
  for (const l of Object.values(lessons)) {
    if (!isLessonProgress(l)) return false;
  }
  for (const t of Object.values(tasks)) {
    if (!isTaskProgress(t)) return false;
  }
  return true;
}

function isLessonProgress(x: unknown): x is LessonProgress {
  if (!isPlainObject(x)) return false;
  const steps = x["stepsDone"];
  if (!Array.isArray(steps) || !steps.every((s) => typeof s === "string")) return false;
  if (x["viewedAt"] !== undefined && typeof x["viewedAt"] !== "string") return false;
  if (x["completedAt"] !== undefined && typeof x["completedAt"] !== "string") return false;
  return true;
}

function isTaskProgress(x: unknown): x is TaskProgress {
  if (!isPlainObject(x)) return false;
  if (x["attemptedAt"] !== undefined && typeof x["attemptedAt"] !== "string") return false;
  if (x["startedAt"] !== undefined && typeof x["startedAt"] !== "string") return false;
  if (x["completedAt"] !== undefined && typeof x["completedAt"] !== "string") return false;
  if (x["selfScore"] !== undefined && typeof x["selfScore"] !== "number") return false;
  if (!isOptionalStringArray(x["criteriaChecked"])) return false;
  if (!isOptionalStringArray(x["deliverablesDone"])) return false;
  return true;
}

function isOptionalStringArray(x: unknown): boolean {
  if (x === undefined) return true;
  return Array.isArray(x) && x.every((v) => typeof v === "string");
}

function isPlainObject(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}
