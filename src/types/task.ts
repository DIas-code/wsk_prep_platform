import type { ModuleId } from "./module";

export type Difficulty = "easy" | "medium" | "hard" | "championship";

/**
 * Reference to a file the student needs (SQL dump, PDF brief, CSV seed, style guide).
 * Kept as a discriminated union so a loader knows where to fetch the bytes.
 */
export type TaskAttachmentSource =
  /** Raw content stored in the task JSON — fine for short snippets (schemas, sample rows). */
  | { format: "inline"; value: string }
  /** Path relative to the task JSON file — used for bulky data shipped alongside the task. */
  | { format: "file"; path: string }
  /** Absolute URL to an external document (PDF brief, public dataset). */
  | { format: "external"; url: string };

/** What kind of artifact is behind the attachment — drives UI affordance (viewer vs download). */
export type AttachmentKind =
  | "pdf"
  | "sql"
  | "csv"
  | "xml"
  | "json"
  | "image"
  | "markdown"
  | "text"
  | "binary";

export interface TaskAttachment {
  /** Human-readable label shown in the UI ("Session1-MySQL.sql", "KMG Style Guide"). */
  label: string;
  kind: AttachmentKind;
  source: TaskAttachmentSource;
  description?: string;
}

/**
 * One numbered requirement / step of a task.
 * Real WorldSkills tasks are nested (Session 6: 1.1, 1.2, ...), so children are supported.
 * `id` is the stable dotted number ("3.4") — used as the progress key and for cross-references.
 */
export interface TaskSection {
  id: string;
  title: string;
  /** Markdown body — instructions, constraints, rules. */
  body: string;
  children?: TaskSection[];
}

/** A concrete output the student must produce (CSV file, PDF report, working app, DB row). */
export interface TaskDeliverable {
  id: string;
  /** Filename or artifact name ("Session6_SalesForecast.csv", "Android APK"). */
  label: string;
  kind: "file" | "app" | "report" | "db-state" | "other";
  /** Optional schema/spec — column list, filename pattern, expected content outline. */
  spec?: string;
  notes?: string;
}

/** One line of the grading rubric — must be verifiable by a human or a future autograder. */
export interface TaskCriterion {
  id: string;
  /** Imperative statement ("Asset SN auto-generated in dd/gg/nnnn format with zero-padding"). */
  text: string;
  /** Optional scoring weight; unset = uniform weighting. */
  weight?: number;
  /** Optional tag for grouping on a dashboard ("ui", "db", "validation", "style-guide"). */
  tag?: string;
}

export interface Task {
  id: string;
  title: string;
  /** One-sentence hook for task lists. */
  summary: string;
  /** The full "Overview" paragraph — markdown. */
  overview: string;
  difficulty: Difficulty;
  relatedModule: ModuleId;
  relatedLessons: string[];
  /** Time budget in minutes (WorldSkills sessions are time-boxed). */
  timeLimitMinutes?: number;
  /** Ordered numbered requirements — supports nested sub-requirements. */
  sections: TaskSection[];
  /** Materials provided to the student (SQL dumps, CSVs, style guide PDFs). */
  attachments?: TaskAttachment[];
  /** Concrete outputs the student must produce. */
  deliverables?: TaskDeliverable[];
  /** Rubric used for grading — every item should be verifiable. */
  assessmentCriteria: TaskCriterion[];
  /** Original source documents / reference links. */
  sources?: TaskAttachment[];
  /** Free-form notes: tips, common pitfalls, hints the grader would reveal. */
  notes?: string;
}
