import type { ModuleId } from "./module";

export interface LessonProgress {
  /** ISO timestamp of first view. */
  viewedAt?: string;
  /** ISO timestamp when the student marked the lesson complete. */
  completedAt?: string;
  /** Steps the student has ticked off, keyed by `${practiceBlockId}:${stepId}` — see `stepProgressKey`. */
  stepsDone: string[];
}

export interface TaskProgress {
  attemptedAt?: string;
  completedAt?: string;
  /** Optional self-reported score (0-100) for now; a grader can replace this later. */
  selfScore?: number;
  /** Ids of assessmentCriteria the student has ticked off. */
  criteriaChecked?: string[];
  /** Ids of deliverables the student has produced. */
  deliverablesDone?: string[];
}

export interface ModuleProgress {
  lessons: Record<string /* lessonId */, LessonProgress>;
  tasks: Record<string /* taskId */, TaskProgress>;
}

export interface ProgressState {
  version: 1;
  modules: Partial<Record<ModuleId, ModuleProgress>>;
  /** When the state was last written — useful if we ever add sync. */
  updatedAt: string;
}

export const PROGRESS_STORAGE_KEY = "ws-platform:progress:v1";

/** Canonical way to form a `stepsDone` entry — keeps callers consistent. */
export function stepProgressKey(practiceBlockId: string, stepId: string): string {
  return `${practiceBlockId}:${stepId}`;
}
