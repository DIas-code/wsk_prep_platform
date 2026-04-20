# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

Architecture-only scaffold for a WorldSkills IT Software Solutions training platform. There is no UI, no build tooling beyond `tsconfig.json`, no package.json, no tests, and no runner yet. TypeScript is configured with `strict` + `noUncheckedIndexedAccess`, targeting ES2022 / ESNext modules / Bundler resolution (`outDir: dist`). `src/content/loader.ts` deliberately ships only an interface — the concrete loader is deferred until a UI layer (static import / fetch / fs) is chosen.

## Two-layer architecture

The whole point of the split is that non-developers can add teaching content without touching `src/`.

- `src/` — TypeScript: types (single source of truth), the `ContentLoader` contract, a module `registry`, and a `localStorage` progress wrapper.
- `content/` — pure JSON data files per module. `content/modules.json` lists enabled modules.
- `schemas/` — JSON Schemas for runtime validation of every content file. A loader implementation must validate against these and throw on failure — bad content must never reach the UI.

`ModuleId` is an open `string` (matching slug pattern `^[a-z0-9-]+$`). The single source of truth for which modules exist is `content/modules.json`; `src/content/registry.ts` exposes only a `parseRegistry(raw)` validator that a loader runs on that file. **Do not re-introduce a hardcoded `ENABLED_MODULES` constant** — the split existed before and caused two lists to drift.

## Content model relationships

```
Module ──► ordered lessonOrder[] ──► Lesson ──► relatedTaskIds[] ──► Task
                                                                       └── relatedLessons[] (back-reference)
```

- A **Module** is a course track with an ordered lesson list and an associated task id list.
- A **Lesson** contains `theory` (RichText — `{kind:"inline"|"file"}`) plus one or more `PracticeBlock`s of guided `PracticeStep`s. Each step may carry a `CodeExample` (`full`, optional `simplified`, `explanation`), hints, and a post-completion explanation.
- A **Task** is independent and graded, lives under `content/<module>/tasks/`, references its module and prep lessons, and is structured to hold real WorldSkills briefs: `overview` (markdown), nested `sections[]` with dotted ids (`"1"`, `"1.1"`, `"3.4"`) mirroring the original numbering, `attachments[]` (SQL dumps / CSVs / PDFs — inline, relative path, or external URL), `deliverables[]` (concrete outputs with `spec`), and a mandatory `assessmentCriteria[]` rubric. This mirrors the WorldSkills "external task envelope" model — tasks can be swapped without editing lessons, and a future autograder uses `assessmentCriteria[].id` as its check keys.

Progress keys for practice steps use the helper `stepProgressKey(practiceBlockId, stepId)` from `src/types/progress.ts`. Every `PracticeStep` must carry a stable `id` — using the index as a progress key would silently corrupt student progress when lessons are reordered.

Markdown is stored inline inside JSON strings on purpose (one schema, one loader). The `RichText` discriminator already allows swapping to external `.md` files later with no type changes.

## Progress tracking

Client-side only, via `src/progress/storage.ts`. All state lives under a single `localStorage` key `ws-platform:progress:v1` (`PROGRESS_STORAGE_KEY`), shape = `ProgressState` in `src/types/progress.ts`. `loadProgress` tolerates missing `localStorage` (SSR-safe) and resets on version mismatch or parse failure. Practice step completion is keyed by `${practiceBlockId}:${stepIndex}`.

## Content authoring requirements

**All lesson and task content must target the current LTS / latest stable release of the technology it teaches.** Do not pin an older version unless there is a specific WorldSkills rulebook reason (call it out in the lesson's `summary` if you have to).

Concretely, when writing content:

- **.NET / MAUI / ASP.NET Core** — use the current .NET LTS (at time of writing: .NET 10 LTS).
- **Node / web tooling** — current Node LTS.
- **Python** — the latest stable (Python has no LTS); mention the version in lesson summary.
- **SQL Server / MySQL** — latest supported GA version of each engine.
- **Android / Kotlin / Gradle** — current stable Android SDK + stable Gradle.

When authoring a lesson, bake the version into any project-create commands, sample `csproj`, or install instructions — do not leave them version-less. When bumping LTS later, update every affected lesson in one sweep (one PR, one commit per module).

## Adding content

- **New module**: create `content/<id>/` with `module.json`, `lessons/`, `tasks/`, and register the id in `content/modules.json` — nothing to touch in `src/`.
- **New lesson**: JSON file under `content/<module>/lessons/`, then list its id in that module's `lessonOrder`.
- **New task**: JSON file under `content/<module>/tasks/`, reference prep lesson ids in `relatedLessons`, and add the task id to the module's `taskIds`.
- **New content type** (quizzes, videos): add a schema + a loader method — existing types stay untouched.

## Commands

No build, lint, test, or run scripts are wired up. `tsc` can be run ad-hoc against `tsconfig.json` to type-check `src/**/*.ts`; there is no package.json, so install TypeScript globally or via `npx typescript` if you need it.
