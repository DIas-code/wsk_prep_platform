import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { PROGRESS_STORAGE_KEY } from "../types";
import {
  loadProgress,
  saveProgress,
  updateLesson,
  updateTask,
  updateTaskCriteria,
  updateTaskDeliverable,
} from "./storage";

function keysMatching(prefix: string): string[] {
  const out: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(prefix)) out.push(k);
  }
  return out;
}

beforeEach(() => localStorage.clear());
afterEach(() => localStorage.clear());

describe("loadProgress — 3.1 runtime validation", () => {
  it("returns empty state when the payload shape is wrong and archives the raw value", () => {
    const raw = JSON.stringify({ version: 1, modules: "nope", updatedAt: "t" });
    localStorage.setItem(PROGRESS_STORAGE_KEY, raw);

    const state = loadProgress();
    expect(state.modules).toEqual({});

    const broken = keysMatching(`${PROGRESS_STORAGE_KEY}.broken-`);
    expect(broken.length).toBeGreaterThan(0);
    expect(localStorage.getItem(broken[0]!)).toBe(raw);
  });

  it("returns empty state when the JSON itself is unparseable", () => {
    localStorage.setItem(PROGRESS_STORAGE_KEY, "{not json");
    const state = loadProgress();
    expect(state.modules).toEqual({});
    expect(keysMatching(`${PROGRESS_STORAGE_KEY}.broken-`).length).toBeGreaterThan(0);
  });
});

describe("loadProgress — 3.2 version mismatch backup", () => {
  it("moves a wrong-version payload to a backup key before resetting", () => {
    const raw = JSON.stringify({ version: 0, modules: {}, updatedAt: "t" });
    localStorage.setItem(PROGRESS_STORAGE_KEY, raw);

    const state = loadProgress();
    expect(state.modules).toEqual({});

    const backup = keysMatching(`${PROGRESS_STORAGE_KEY}.backup-`);
    expect(backup.length).toBe(1);
    expect(localStorage.getItem(backup[0]!)).toBe(raw);
    expect(localStorage.getItem(PROGRESS_STORAGE_KEY)).toBeNull();
  });
});

describe("saveProgress — 3.3 non-mutating", () => {
  it("does not mutate its argument and accepts a frozen state", () => {
    const frozen = Object.freeze({
      version: 1 as const,
      modules: {},
      updatedAt: "2024-01-01T00:00:00Z",
    });
    expect(() => saveProgress(frozen)).not.toThrow();
    expect(frozen.updatedAt).toBe("2024-01-01T00:00:00Z");
  });
});

describe("updateTask — 3.3 selfScore clamped to [0, 100]", () => {
  it("clamps values above 100", () => {
    updateTask("m1", "task-1", { selfScore: 9999 });
    const state = loadProgress();
    expect(state.modules["m1"]?.tasks["task-1"]?.selfScore).toBe(100);
  });

  it("clamps negative values to 0", () => {
    updateTask("m1", "task-1", { selfScore: -5 });
    const state = loadProgress();
    expect(state.modules["m1"]?.tasks["task-1"]?.selfScore).toBe(0);
  });

  it("leaves a valid score untouched", () => {
    updateTask("m1", "task-1", { selfScore: 72 });
    const state = loadProgress();
    expect(state.modules["m1"]?.tasks["task-1"]?.selfScore).toBe(72);
  });
});

describe("updateLesson / round-trip", () => {
  it("round-trips stepsDone through storage", () => {
    updateLesson("m1", "l1", { stepsDone: ["b1:s1", "b1:s2"] });
    const state = loadProgress();
    expect(state.modules["m1"]?.lessons["l1"]?.stepsDone).toEqual(["b1:s1", "b1:s2"]);
  });
});

describe("updateTaskCriteria — 5.3 round-trip", () => {
  it("adds and removes criterion ids", () => {
    updateTaskCriteria("m1", "task-1", "c1", true);
    updateTaskCriteria("m1", "task-1", "c2", true);
    updateTaskCriteria("m1", "task-1", "c1", false);
    const state = loadProgress();
    expect(state.modules["m1"]?.tasks["task-1"]?.criteriaChecked).toEqual(["c2"]);
  });

  it("preserves unrelated fields on the task when toggling", () => {
    updateTask("m1", "task-1", { selfScore: 70 });
    updateTaskCriteria("m1", "task-1", "c1", true);
    const state = loadProgress();
    expect(state.modules["m1"]?.tasks["task-1"]?.selfScore).toBe(70);
    expect(state.modules["m1"]?.tasks["task-1"]?.criteriaChecked).toEqual(["c1"]);
  });
});

describe("updateTaskDeliverable — 5.4 round-trip", () => {
  it("adds and removes deliverable ids", () => {
    updateTaskDeliverable("m1", "task-1", "d1", true);
    updateTaskDeliverable("m1", "task-1", "d2", true);
    const state = loadProgress();
    expect(state.modules["m1"]?.tasks["task-1"]?.deliverablesDone).toEqual(["d1", "d2"]);
  });
});
