import Ajv2020, { type ValidateFunction } from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import moduleSchema from "../../schemas/module.schema.json" with { type: "json" };
import lessonSchema from "../../schemas/lesson.schema.json" with { type: "json" };
import taskSchema from "../../schemas/task.schema.json" with { type: "json" };

import type { Lesson, Module, Task } from "../types";

const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);

function compile<T>(schema: unknown, label: string): (raw: unknown) => T {
  const validate = ajv.compile(schema as object) as ValidateFunction<T>;
  return (raw: unknown): T => {
    if (validate(raw)) return raw;
    throw new ContentValidationError(label, validate.errors ?? []);
  };
}

export const validateModule = compile<Module>(moduleSchema, "module");
export const validateLesson = compile<Lesson>(lessonSchema, "lesson");
export const validateTask = compile<Task>(taskSchema, "task");

export class ContentValidationError extends Error {
  readonly label: string;
  readonly errors: readonly object[];

  constructor(label: string, errors: readonly object[]) {
    super(`${label}: ${formatErrors(errors)}`);
    this.name = "ContentValidationError";
    this.label = label;
    this.errors = errors;
  }
}

interface AjvErrorLike {
  instancePath?: string;
  message?: string;
  params?: Record<string, unknown>;
}

function formatErrors(errors: readonly object[]): string {
  if (errors.length === 0) return "validation failed (no details)";
  return errors
    .map((e) => {
      const err = e as AjvErrorLike;
      const path = err.instancePath || "(root)";
      const missing =
        err.params && typeof err.params["missingProperty"] === "string"
          ? ` missingProperty=${err.params["missingProperty"]}`
          : "";
      return `${path} ${err.message ?? ""}${missing}`.trim();
    })
    .join("; ");
}
