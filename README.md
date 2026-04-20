# WorldSkills IT Software Solutions — Training Platform

Architecture-only scaffold. No UI yet.

## Folder structure

```
worldskills-platform/
├── README.md
├── tsconfig.json
├── src/
│   ├── types/                 # TypeScript interfaces (single source of truth)
│   │   ├── module.ts
│   │   ├── lesson.ts
│   │   ├── task.ts
│   │   ├── progress.ts
│   │   └── index.ts
│   ├── content/
│   │   ├── loader.ts          # Loads + validates module/lesson/task files
│   │   └── registry.ts        # Registers available modules
│   └── progress/
│       └── storage.ts         # localStorage wrapper (read/write progress)
│
├── schemas/                   # JSON Schemas (runtime validation of content)
│   ├── module.schema.json
│   ├── lesson.schema.json
│   └── task.schema.json
│
└── content/                   # All teaching content — pure data, no code
    ├── modules.json           # List of enabled modules
    ├── maui-sqlserver/
    │   ├── module.json
    │   ├── lessons/
    │   │   └── 01-intro-to-maui.json
    │   └── tasks/
    │       └── task-001-first-maui-app.json
    ├── sql-ssms/
    │   ├── module.json
    │   ├── lessons/
    │   │   └── 01-select-basics.json
    │   └── tasks/
    │       └── task-001-top-customers.json
    └── python-analytics/
        ├── module.json
        ├── lessons/
        │   └── 01-pandas-intro.json
        └── tasks/
            └── task-001-sales-summary.json
```

Two clean layers:

- **`src/`** — TypeScript logic (types + content loading + progress).
- **`content/`** — pure data files. Anyone (non-developer) can add lessons/tasks without touching `src/`.

## How it connects

```
Module (maui-sqlserver)
   └── Lesson (01-intro-to-maui)
          ├── theory          (markdown)
          ├── practice blocks (step-by-step, hints, code)
          └── relatedTasks[]  ──► Task (task-001-first-maui-app)
                                     └── relatedLessons[] ──► back-reference
```

- A **Module** is a course track (e.g. `maui-sqlserver`). It lists its lessons in order.
- A **Lesson** teaches one topic. It contains theory + one or more practice blocks.
- A **Task** is an independent, graded problem. It references the module it belongs to and the lessons that prepare the student for it.
- Tasks live in a separate folder so they can be swapped/replaced without editing lessons — matching the WorldSkills model of external task envelopes.

## Student flow

```
open module  →  read lesson theory
             →  do practice blocks (guided, with hints + explanation)
             →  attempt related task (independent, like a real WorldSkills problem)
             →  progress saved to localStorage
```

## Content storage choices

| Content  | Format | Reason                                                                 |
|----------|--------|------------------------------------------------------------------------|
| Module   | JSON   | Small config file — ordered lesson list + metadata.                    |
| Lesson   | JSON   | Structured blocks (theory, practice, code) — JSON keeps validation simple. Theory field holds Markdown as a string. |
| Task     | JSON   | Must be machine-validatable against a schema (WorldSkills-style).      |
| Code     | Inline in lesson JSON | Each example is an object: `{ full, simplified?, explanation }`. |

Markdown *inside* a JSON string is deliberate: one schema, one loader. If a lesson's theory grows huge, we can later point `theory` at an external `.md` path — the interface supports both via a discriminator (`theory: { kind: "inline" | "file", value: string }`).

## Progress tracking

Stored in `localStorage` under a single key `ws-platform:progress:v1`. Shape defined by `ProgressState` in `src/types/progress.ts`. No server, no account — survives reloads, easy to reset.

## Extensibility

- **Add a module**: drop a folder under `content/`, register it in `content/modules.json`.
- **Add a lesson**: drop a JSON file under `content/<module>/lessons/`, list its id in `module.json`.
- **Add a task**: drop a JSON file under `content/<module>/tasks/`, reference lesson ids in `relatedLessons`.
- **Add a new content type later** (quizzes, videos): new schema + new loader function, no changes to existing types.

## What is intentionally NOT here

- No UI framework, no pages, no components.
- No build tooling beyond `tsconfig.json`.
- No task runner/auto-grader yet — task schema has `expectedResult` so a grader can be added later without schema changes.
