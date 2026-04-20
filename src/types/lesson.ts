import type { ModuleId } from "./module";

/** Markdown content, either stored inline in the JSON or in an external .md file. */
export type RichText =
  | { kind: "inline"; value: string }
  | { kind: "file"; path: string };

/** A code example — always has a "full" version; the simplified one is optional. */
export interface CodeExample {
  language: "csharp" | "xaml" | "sql" | "python" | "json" | "bash";
  full: string;
  simplified?: string;
  explanation: string;
}

/** One step of a guided practice block. */
export interface PracticeStep {
  /** Stable id used as a progress key — must not be reused when steps are reordered. */
  id: string;
  instruction: string;
  code?: CodeExample;
  hints?: string[];
  /** Shown *after* the student marks the step done — reveals the "why". */
  explanation?: string;
}

/** A practice block is a sequence of steps the student works through. */
export interface PracticeBlock {
  id: string;
  title: string;
  goal: string;
  steps: PracticeStep[];
}

export interface Lesson {
  id: string;
  moduleId: ModuleId;
  title: string;
  /** One-sentence summary shown in lists. */
  summary: string;
  /** Estimated time in minutes — helps a student plan a session. */
  estimatedMinutes: number;
  theory: RichText;
  practice: PracticeBlock[];
  /** Ids of tasks the student should be ready for after this lesson. */
  relatedTaskIds: string[];
  /** Ids of lessons a student should complete first. */
  prerequisites?: string[];
}
