# Development Roadmap

> **Current phase:** all code phases complete — last updated 2026-04-20.
> Done: Phases 0–7 + 8.1 CI + 8.3 Playwright smoke. 6.4.1 `csharp-maui` 16/16 lessons (added `16-packaging-publishing` MSIX+APK). 6.4.2 `sql-databases` 5/5. 6.4.3 `python-data-analysis` 12/12. All 6 session tasks have `relatedLessons`. **7.1 progress backup:** `exportProgressJson`/`importProgressJson` + `ProgressBackup` buttons on HomePage. **7.2 `/dashboard`:** `DashboardPage` at `/dashboard` with per-module lessons-done / tasks-attempted / avg self-score. **7.3 task timer:** `useCountdown` + `TaskTimer` panel with `startedAt` persisted. **Markdown renderer fixed** (`src/ui/Markdown.tsx`) — `inline` detection that works on react-markdown v9. **Content graph integration test** (`content.integration.test.ts`) walks disk content via `import.meta.glob`, runs schemas + `validateContentGraph`. CI workflow at `.github/workflows/ci.yml`. Playwright smoke at `e2e/smoke.spec.ts`. Test suite: 75 passing across 8 files; `npm run typecheck` and `npm run build` clean.
> Manual steps left for user: run `npm install` (adds `@playwright/test`), then once `npx playwright install chromium` before `npm run build && npm run test:e2e`. Phase 8.2 hosting — connect repo to Vercel/Cloudflare Pages (build `npm run build`, output `dist/`).

End-to-end plan from current scaffold to a deployed site that trains students on the six KazMunayGas WorldSkills sessions.

Each step = **what to do** + **how to verify**. Tests are written only where they pay off — see the policy below. UI is verified by eye in the dev server.

Stack: **Vite + React + TypeScript**, **Vitest** for unit tests, **Ajv** for JSON Schema validation, **Tailwind** for styles, **Playwright** for one end-to-end smoke.

## Testing policy

Write a unit test when:
- Logic has rules that are easy to break silently (schema validation, cross-reference checking, progress storage, content parsers).
- A regression would corrupt student data (anything writing to `localStorage`).
- A future contributor could plausibly change the behavior without noticing.

Skip unit tests for:
- React components — verify in the browser.
- Styling, layout, markdown rendering — verify visually.
- One-shot glue code that you'd have to run once anyway.

At the end of the project: **one Playwright smoke** that opens the site, clicks into each module and lesson, and fails if anything throws.

---

## Phase 0 — Tooling foundation

Not product work. Just makes the repo testable and runnable.

### 0.1 `package.json` + typecheck
- Add `package.json`, install `typescript` as devDep, add script `"typecheck": "tsc --noEmit"`.
- **Verify**: `npm run typecheck` exits 0 against current `src/`.

### 0.2 Vitest wired up
- Install `vitest`, add `"test": "vitest run"`.
- **Verify**: drop a one-line `sanity.test.ts` asserting `1 + 1 === 2` and see it pass.
- Configure `vitest.config.ts` with `environment: "jsdom"` (needed for `localStorage` tests later).

### 0.3 Ajv + schema compilation
- Create `src/content/validators.ts` exporting `validateModule`, `validateLesson`, `validateTask`, compiled from `schemas/*.json` with Ajv + `ajv-formats`.
- **Verify (unit)**: for each validator — a correct fixture passes, a fixture missing a required field fails, the reported error mentions the missing field.

---

## Phase 1 — Content loading

Turn the `ContentLoader` contract into something real.

### 1.1 `parseRegistry` hardening
- **Verify (unit)**: `parseRegistry` rejects each malformed input — non-object, wrong version, non-array modules, non-string id, bad slug, duplicate id.
- Fill gaps in the current implementation until every case throws.

### 1.2 `ViteContentLoader`
- Implement `ContentLoader` using `import.meta.glob("/content/**/*.json", { eager: true })`. Each `load*` method picks the matching file, runs the Ajv validator, returns the typed object. Bad content throws.
- **Verify (unit)**: load a valid module and a broken one — first returns the right object, second throws.
- Memoize the glob so repeated calls don't rebuild the map.

### 1.3 `listLessons` / `listTasks` ordered correctly
- Sort results by `module.lessonOrder` / `module.taskIds` (not alphabetical). Lessons/tasks missing from those arrays must throw.
- **Verify (unit)**: feed a module with a deliberately-shuffled `lessonOrder`; the returned array matches it exactly.

---

## Phase 2 — Cross-reference integrity

Defend against inconsistencies the schema can't express.

### 2.1 `validateContentGraph(registry, modules, lessons, tasks)`
- Returns `{ errors: Issue[] }` listing every broken edge:
  - `Module.lessonOrder` → lesson must exist and belong to that module.
  - `Module.taskIds` → task must exist and its `relatedModule` must match.
  - `Lesson.relatedTaskIds` → task must exist.
  - `Task.relatedLessons` → lesson must exist in the same module.
- **Verify (unit)**: one passing fixture + one fixture per error kind — each produces exactly the expected issue.

### 2.2 Unique ids within a container
- Within a lesson: practice-step ids unique per block.
- Within a task: section ids unique per parent.
- **Verify (unit)**: two fixtures with duplicate ids — both rejected.

---

## Phase 3 — Progress storage hardening

Before the UI starts writing here, fix the sharp edges.

### 3.1 Runtime-validated `loadProgress`
- Replace the `as ProgressState` cast with a real type guard. On shape mismatch, save the raw payload under `ws-platform:progress:v1.broken-${timestamp}` and return empty state.
- **Verify (unit)**: seed `localStorage` with `{"version":1,"modules":"nope"}` — `loadProgress` returns empty state and the broken key exists.

### 3.2 Version backup instead of silent wipe
- On `version !== 1`, move the raw value to a backup key before returning empty.
- **Verify (unit)**: seed `{version:0,...}`, call `loadProgress`, assert backup key holds the original payload.

### 3.3 Non-mutating save + clamped `selfScore`
- `saveProgress` must not mutate its argument.
- `updateTask` must clamp `selfScore` to `[0, 100]`.
- **Verify (unit)**: pass a frozen state through `saveProgress` — no throw. Pass `selfScore: 9999` — stored as `100`.

---

## Phase 4 — UI shell

First frontend pixels. Keep the slice thin — everything here is eyeballed.

### 4.1 Vite + React bootstrap
- `index.html` + `src/main.tsx` + a root `App` rendering "hello".
- **Verify**: `npm run dev` serves at `http://localhost:5173` and "hello" shows up.

### 4.2 Tailwind setup
- Install Tailwind, add `tailwind.config.ts`, `postcss.config.js`, import directives into `src/main.tsx`.
- **Verify**: apply a Tailwind class in `App` and see it take effect.

### 4.3 Module list route
- `/` route reads the registry via the loader and renders `<ModuleCard>` per module using `title` + `description` from `module.json`.
- **Verify**: dev server at `/` shows all three module cards.

### 4.4 Lesson viewer with markdown + code highlighting
- Route `/m/:moduleId/l/:lessonId`. Loads the lesson and renders `theory.value` through `react-markdown` + `shiki`.
- **Verify**: open the MAUI lesson and see headings, code blocks highlighted as XAML/C#.

### 4.5 Practice steps with persisted checkboxes
- Each step in a practice block has a checkbox. `onChange` → `updateLesson(moduleId, lessonId, { stepsDone: [...] })` using `stepProgressKey(blockId, stepId)`. On mount, checked state comes from `loadProgress`.
- **Verify**: tick a step, reload, it stays ticked. Open DevTools → Application → localStorage → see the key.

---

## Phase 5 — Task viewer

The hard surface — real WorldSkills briefs are dense.

### 5.1 Section tree renderer
- Route `/m/:moduleId/t/:taskId`. Renders `overview` + recursive `<Section>` component with dotted id numbering (`3`, `3.4`).
- **Verify**: seed a task with nested sections; the tree renders and dotted ids are visible.

### 5.2 Attachments panel
- Renders `attachments` and `sources`. Switches on `source.format`:
  - `inline` → show inline viewer + copy button.
  - `file` → download link (path resolved relative to task file).
  - `external` → external link with "↗" icon.
- **Verify**: open a task with one attachment of each kind; click each, verify it does the right thing.

### 5.3 Assessment criteria checklist
- Extend `TaskProgress` with `criteriaChecked: string[]`; add `updateTaskCriteria(moduleId, taskId, criterionId, checked)` to storage.
- **Verify (unit)**: round-trip through storage.
- **Verify (eye)**: tick 3 of 6 criteria in a task, reload, they stay ticked.

### 5.4 Deliverable checklist
- Mirror the criteria pattern — `deliverablesDone: string[]` in `TaskProgress`.
- **Verify**: tick two of three deliverables, progress bar shows ~67%.

---

## Phase 6 — Real KMG content

The 3 placeholder modules become real tracks.

### 6.1 Module split ✅ done
Final split in `content/modules.json`:
- `csharp-maui` — .NET 10 MAUI, UI and client-side logic (Sessions 1–5, Windows + Android targets).
- `sql-databases` — MS SQL Server via SSMS (T-SQL), cross-cutting data layer for every session that touches a database.
- `python-data-analysis` — Python 3.13 + pandas / scikit-learn / statsmodels (Session 6 analytics).

ASP.NET Core Web API was folded into `csharp-maui` (client + server live in the same session task and share the C#/.NET tooling). Any future split can add a new module without touching `src/`.

### 6.2 Import Session 1 as a task
Convert Session 1 from `tasks.md` (condensed brief, single source of truth — do not read the original bulky session materials) into `content/csharp-maui/tasks/task-session-1-kmg-assets.json`. Port all assessment criteria. Attachments (SQL dumps / style guide) are referenced via `format: "file"` with the path — no need to inline them.
- **Verify**: Ajv validates the JSON without errors; the task renders end-to-end in the dev server.

### 6.3 Import Sessions 2–6
Same recipe, one by one. Each is its own commit.
- **Verify** after each: `validateContentGraph` green + dev-server smoke click-through works.

### 6.4 Build out the curriculum (lesson-by-lesson)

Each module is a **linear course** a student can work through front-to-back, not a grab-bag of prep notes. One lesson = one focused topic, with theory + at least one `PracticeBlock` of 3–6 ordered steps + a runnable `CodeExample`. Lessons build on each other — later lessons may assume earlier ones, and `relatedTaskIds` points at the session tasks a lesson prepares the student for.

Target lesson counts are deliberate floors, not ceilings — the point is that a student going through the course *feels* like they are taking a real course, not skimming a cheat sheet.

#### 6.4.1 `csharp-maui` — target ≥ 16 lessons
Progression (each item = one lesson file, in `lessonOrder`):
1. .NET 10 + MAUI setup: SDK install, `dotnet new maui`, project anatomy, target frameworks.
2. XAML fundamentals: namespaces, elements vs. attributes, property syntax.
3. Layout containers: `Grid`, `VerticalStackLayout`, `HorizontalStackLayout`, `FlexLayout`.
4. Controls catalog: `Label`, `Button`, `Entry`, `Picker`, `DatePicker`, `Switch`.
5. Data binding basics: `BindingContext`, one-way vs. two-way, `INotifyPropertyChanged`.
6. MVVM with the community toolkit: `ObservableObject`, `[ObservableProperty]`, `[RelayCommand]`.
7. `CollectionView`: templates, grouping, empty state, selection (the MAUI analogue of RecyclerView).
8. Shell navigation: routes, query parameters, tabs, flyout.
9. HTTP + REST: `HttpClient`, `IHttpClientFactory`, cancellation, retry basics.
10. JSON with `System.Text.Json`: source generators, naming policies, custom converters.
11. XML parsing: `System.Xml.Linq` for the KMG XML feeds, schema-tolerant reads.
12. Filtering and search UI: dropdowns + search box wired through a view-model.
13. Local storage: `SQLite-net` / `Preferences`, when to pick which.
14. Dependency injection and app startup: `MauiProgram`, service lifetimes.
15. Platform-specific code: permissions, handlers, conditional compilation for Windows vs. Android.
16. Packaging and publishing: MSIX (Windows) + APK (Android), signing, release config.

- **Verify**: Ajv validates each lesson; `validateContentGraph` green; every Session 1–5 task has ≥ 2 lessons in `relatedLessons`.

#### 6.4.2 `sql-databases` — target 5 lessons (SSMS / T-SQL only)
Scope is deliberately narrow: SELECT-side skills up to JOINs, nothing further. No CTEs, no window functions, no DDL/DML, no transactions — those are out of scope for this module. Every lesson runs in SSMS against MS SQL Server (latest GA) in T-SQL.

Progression:
1. `SELECT` fundamentals — SSMS setup, picking a database, `SELECT ... FROM`, column aliases, `DISTINCT` (existing lesson — keep and extend practice steps).
2. `WHERE`, operators, `LIKE`, `IN`, `BETWEEN`, `NULL` semantics (`IS NULL` vs. `= NULL`).
3. `ORDER BY`, `TOP n` / `TOP n PERCENT`, basic pagination with `OFFSET ... FETCH`.
4. Aggregates (`COUNT`, `SUM`, `AVG`, `MIN`, `MAX`) + `GROUP BY` + `HAVING`.
5. Joins — `INNER JOIN` / `LEFT JOIN` / `RIGHT JOIN` / `FULL JOIN`; join keys vs. filters; multi-table joins.

- **Verify**: every session task that touches a DB has ≥ 2 lessons in `relatedLessons`; every lesson's `summary` names MS SQL Server + SSMS and the T-SQL version it targets.

#### 6.4.3 `python-data-analysis` — target ≥ 12 lessons
Progression:
1. Python + pandas intro (existing — extend practice steps).
2. Loading data: CSV, Excel, JSON; dtypes and parsing options.
3. Selecting and filtering: `loc`/`iloc`, boolean masks, `query`.
4. Cleaning: missing values, duplicates, type coercion, `astype`.
5. `groupby` + aggregation + `agg` with multiple functions.
6. Merging and joining DataFrames.
7. Time series basics: `DatetimeIndex`, `resample`, rolling windows.
8. Plotting with matplotlib (and pandas `.plot`) — titles, labels, legends.
9. Descriptive statistics + exploratory data analysis workflow.
10. K-means clustering with scikit-learn: fitting, inertia, elbow method, labeling.
11. ARIMA forecasting with `statsmodels`: stationarity, `(p,d,q)` selection, forecast + confidence intervals.
12. Reporting: exporting results back to Excel / CSV and one-shot notebook-to-HTML.

- **Verify**: the Session 6 task has ≥ 4 lessons in `relatedLessons` (cleaning, groupby, K-means, ARIMA at minimum); every lesson pins Python + library versions in its `summary`.

#### 6.4.4 Authoring quality bar (applies to every lesson)
- `theory.value` reads as a tutorial, not bullet notes — a student can understand the topic *without already knowing it*.
- Every lesson has ≥ 1 `PracticeBlock` with ≥ 3 `PracticeStep`s; each step has a stable non-numeric `id` (see `stepProgressKey` rationale in CLAUDE.md).
- Every `CodeExample` compiles / runs as-is on the pinned toolchain version.
- `summary` names the exact versions the lesson targets (e.g. ".NET 10 LTS, MAUI 10.0"). When LTS bumps, sweep every lesson in one PR.
- Russian + English technical terms are OK, but code identifiers stay English.

- **Verify (whole phase)**: `validateContentGraph` green; every session task has `relatedLessons` covering *all* skills its assessment criteria exercise; dev-server click-through from module → each lesson → linked task works without errors.

---

## Phase 7 — Grading UX polish

### 7.1 Progress export / import
- Button: download `ProgressState` as JSON. Button: upload a JSON file, replace state.
- **Verify**: export on device A, import on device B, progress carries over.

### 7.2 Completion dashboard
- Route `/dashboard`: total lessons done, tasks done, average self-score per module.
- **Verify (eye)**: numbers match what you ticked.

### 7.3 Timer for timed tasks
- `useCountdown(startedAt, limit)` hook. Persist `startedAt` inside `TaskProgress`. On expiry, banner "time up" appears but the UI keeps working.
- **Verify**: open a task with `timeLimitMinutes: 1`, watch it expire.

---

## Phase 8 — Deploy

### 8.1 CI pipeline
GitHub Actions workflow on push + PR: install → `typecheck` → `test` → run `validateContentGraph` as a script → `vite build`. Any red = CI fails.
- **Verify**: break a content JSON locally, push a branch, CI fails with the expected message.

### 8.2 Static hosting
Connect repo to Vercel (or Cloudflare Pages / Netlify). Build command `npm run build`, output directory `dist/`.
- **Verify**: production URL loads `/`, a lesson renders, a task renders.

### 8.3 Smoke E2E
One Playwright script: visit `/`, click into every module card, then every lesson link, then every task link. Fails on any unhandled error.
- **Verify**: script passes locally, then add it to CI as the last step.

---

## Done criteria

Platform is "ready for students" when all hold on the deployed URL:

1. Six KMG sessions are browsable as Tasks with full `sections`, `attachments`, `deliverables`, `assessmentCriteria`.
2. At least one prep lesson exists for every skill each session requires.
3. A student can tick lesson steps and task criteria, reload, and still see their progress.
4. `npm run typecheck && npm test && npm run build` pass in CI on every commit to `main`.
5. Broken content (dangling id, invalid schema, duplicate step id) fails CI.

Everything after that — autograder, auth, multi-device sync — is a separate roadmap.
