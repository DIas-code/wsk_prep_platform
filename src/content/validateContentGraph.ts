import type { Lesson, Module, ModuleRegistry, Task } from "../types";

export type IssueKind =
  | "unknown-module"
  | "missing-lesson"
  | "missing-task"
  | "lesson-module-mismatch"
  | "task-module-mismatch"
  | "duplicate-step-id"
  | "duplicate-section-id";

export interface Issue {
  kind: IssueKind;
  /** Dotted path identifying where the problem lives, e.g. "module:maui-sqlserver.lessonOrder[1]". */
  where: string;
  message: string;
}

export interface GraphValidationResult {
  errors: Issue[];
}

/**
 * Validates cross-references between modules, lessons, and tasks — things the
 * JSON Schema can't express (dangling ids, module-ownership mismatches,
 * duplicate step / section ids within a container).
 */
export function validateContentGraph(
  registry: ModuleRegistry,
  modules: readonly Module[],
  lessons: readonly Lesson[],
  tasks: readonly Task[],
): GraphValidationResult {
  const errors: Issue[] = [];
  const registered = new Set(registry.modules);
  const lessonsByModule = groupBy(lessons, (l) => l.moduleId);
  const tasksById = new Map(tasks.map((t) => [t.id, t]));
  const lessonsById = new Map(lessons.map((l) => [l.id, l]));

  for (const mod of modules) {
    const base = `module:${mod.id}`;

    if (!registered.has(mod.id)) {
      errors.push({
        kind: "unknown-module",
        where: base,
        message: `module "${mod.id}" is not listed in modules.json`,
      });
    }

    mod.lessonOrder.forEach((lid, i) => {
      const lesson = lessonsById.get(lid);
      if (!lesson) {
        errors.push({
          kind: "missing-lesson",
          where: `${base}.lessonOrder[${i}]`,
          message: `lessonOrder references missing lesson "${lid}"`,
        });
        return;
      }
      if (lesson.moduleId !== mod.id) {
        errors.push({
          kind: "lesson-module-mismatch",
          where: `${base}.lessonOrder[${i}]`,
          message: `lesson "${lid}" belongs to module "${lesson.moduleId}", not "${mod.id}"`,
        });
      }
    });

    mod.taskIds.forEach((tid, i) => {
      const task = tasksById.get(tid);
      if (!task) {
        errors.push({
          kind: "missing-task",
          where: `${base}.taskIds[${i}]`,
          message: `taskIds references missing task "${tid}"`,
        });
        return;
      }
      if (task.relatedModule !== mod.id) {
        errors.push({
          kind: "task-module-mismatch",
          where: `${base}.taskIds[${i}]`,
          message: `task "${tid}" claims relatedModule "${task.relatedModule}", not "${mod.id}"`,
        });
      }
    });
  }

  for (const lesson of lessons) {
    const base = `lesson:${lesson.id}`;

    lesson.relatedTaskIds.forEach((tid, i) => {
      if (!tasksById.has(tid)) {
        errors.push({
          kind: "missing-task",
          where: `${base}.relatedTaskIds[${i}]`,
          message: `relatedTaskIds references missing task "${tid}"`,
        });
      }
    });

    for (const block of lesson.practice) {
      const seen = new Set<string>();
      block.steps.forEach((step, i) => {
        if (seen.has(step.id)) {
          errors.push({
            kind: "duplicate-step-id",
            where: `${base}.practice[${block.id}].steps[${i}]`,
            message: `duplicate step id "${step.id}" within block "${block.id}"`,
          });
        }
        seen.add(step.id);
      });
    }
  }

  for (const task of tasks) {
    const base = `task:${task.id}`;
    const siblingLessons = lessonsByModule.get(task.relatedModule) ?? [];
    const siblingIds = new Set(siblingLessons.map((l) => l.id));

    task.relatedLessons.forEach((lid, i) => {
      if (!siblingIds.has(lid)) {
        errors.push({
          kind: "missing-lesson",
          where: `${base}.relatedLessons[${i}]`,
          message: `relatedLessons "${lid}" is not a lesson of module "${task.relatedModule}"`,
        });
      }
    });

    checkSectionIds(task.sections, base, errors);
  }

  return { errors };
}

function checkSectionIds(
  sections: readonly { id: string; children?: readonly unknown[] }[] | undefined,
  base: string,
  errors: Issue[],
): void {
  if (!sections) return;
  const seen = new Set<string>();
  sections.forEach((s, i) => {
    if (seen.has(s.id)) {
      errors.push({
        kind: "duplicate-section-id",
        where: `${base}.sections[${i}]`,
        message: `duplicate section id "${s.id}" among siblings`,
      });
    }
    seen.add(s.id);
    const children = s.children as
      | { id: string; children?: readonly unknown[] }[]
      | undefined;
    checkSectionIds(children, `${base}.sections[${s.id}]`, errors);
  });
}

function groupBy<T, K>(items: readonly T[], key: (t: T) => K): Map<K, T[]> {
  const out = new Map<K, T[]>();
  for (const item of items) {
    const k = key(item);
    const bucket = out.get(k);
    if (bucket) bucket.push(item);
    else out.set(k, [item]);
  }
  return out;
}
