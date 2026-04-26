import { Link } from "react-router-dom";

import type { Module, ProgressState } from "../types";
import { loadProgress } from "../progress/storage";
import { useContent } from "../ui/ContentContext";
import { useAsync } from "../ui/useAsync";
import { pluralize } from "../ui/ru";
import { PageContainer } from "../ui/AppShell";
import {
  BackLink,
  Badge,
  ErrorState,
  LoadingState,
  PageHeader,
  ProgressBar,
} from "../ui/components";

interface ModuleStats {
  module: Module;
  lessonsDone: number;
  lessonsTotal: number;
  tasksAttempted: number;
  tasksTotal: number;
  avgSelfScore: number | null;
}

function computeStats(module: Module, progress: ProgressState): ModuleStats {
  const mod = progress.modules[module.id];
  const lessons = mod?.lessons ?? {};
  const tasks = mod?.tasks ?? {};

  const lessonsDone = Object.values(lessons).filter((l) => !!l.completedAt).length;
  const taskEntries = Object.entries(tasks).filter(([id]) => module.taskIds.includes(id));
  const tasksAttempted = taskEntries.filter(
    ([, t]) => t.attemptedAt || t.startedAt || (t.criteriaChecked?.length ?? 0) > 0,
  ).length;

  const scores = taskEntries
    .map(([, t]) => t.selfScore)
    .filter((s): s is number => typeof s === "number");
  const avgSelfScore =
    scores.length === 0 ? null : Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

  return {
    module,
    lessonsDone,
    lessonsTotal: module.lessonOrder.length,
    tasksAttempted,
    tasksTotal: module.taskIds.length,
    avgSelfScore,
  };
}

export function DashboardPage() {
  const { loader, registry } = useContent();
  const state = useAsync(
    () => Promise.all(registry.modules.map((id) => loader.loadModule(id))),
    [registry],
  );

  if (state.status === "loading") return <LoadingState />;
  if (state.status === "error") return <ErrorState message={state.error.message} />;

  const progress = loadProgress();
  const stats = state.data.map((m) => computeStats(m, progress));

  const totalLessonsDone = stats.reduce((a, s) => a + s.lessonsDone, 0);
  const totalLessonsAll = stats.reduce((a, s) => a + s.lessonsTotal, 0);
  const totalTasksAttempted = stats.reduce((a, s) => a + s.tasksAttempted, 0);
  const totalTasksAll = stats.reduce((a, s) => a + s.tasksTotal, 0);
  const overallPct =
    totalLessonsAll === 0 ? 0 : Math.round((totalLessonsDone / totalLessonsAll) * 100);

  return (
    <PageContainer>
      <BackLink to="/">Главная</BackLink>

      <PageHeader
        eyebrow="Дашборд"
        title="Прогресс"
        description={
          <>
            Сводка по всем модулям. Данные читаются из <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">localStorage</code> — никто, кроме тебя, их не видит.
          </>
        }
      />

      <div className="card p-6 mb-8 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-500/10 blur-2xl" aria-hidden />
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
              Общий прогресс
            </div>
            <div className="mt-1 text-4xl font-bold tabular-nums text-slate-900">
              {overallPct}%
            </div>
            <div className="mt-1 text-sm text-slate-500">
              {totalLessonsDone} из {totalLessonsAll}{" "}
              {pluralize(totalLessonsAll, "урока", "уроков", "уроков")} пройдено
            </div>
          </div>
          <div className="text-right text-xs text-slate-500">
            Обновлено: {new Date(progress.updatedAt).toLocaleString("ru-RU")}
          </div>
        </div>
        <ProgressBar value={overallPct} className="mt-4" tone="brand" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mb-10">
        <Kpi
          label="Уроки"
          value={`${totalLessonsDone} / ${totalLessonsAll}`}
          tone="brand"
          icon={<BookIcon />}
        />
        <Kpi
          label="Задания начаты"
          value={`${totalTasksAttempted} / ${totalTasksAll}`}
          tone="violet"
          icon={<FlagIcon />}
        />
        <Kpi
          label="Модулей"
          value={`${stats.length}`}
          tone="emerald"
          icon={<GridIcon />}
        />
      </div>

      <h2 className="section-title mb-4">По модулям</h2>
      <div className="grid gap-3">
        {stats.map((s) => (
          <ModuleRow key={s.module.id} stats={s} />
        ))}
      </div>
    </PageContainer>
  );
}

function Kpi({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: string;
  tone: "brand" | "violet" | "emerald";
  icon: React.ReactNode;
}) {
  const map: Record<string, string> = {
    brand: "bg-brand-50 text-brand-700",
    violet: "bg-violet-50 text-violet-700",
    emerald: "bg-emerald-50 text-emerald-700",
  };
  return (
    <div className="card p-5 flex items-center gap-4">
      <span
        className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${map[tone]}`}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
          {label}
        </div>
        <div className="text-2xl font-semibold tabular-nums mt-0.5 text-slate-900">
          {value}
        </div>
      </div>
    </div>
  );
}

function ModuleRow({ stats }: { stats: ModuleStats }) {
  const { module, lessonsDone, lessonsTotal, tasksAttempted, tasksTotal, avgSelfScore } = stats;
  const lessonsPct = lessonsTotal === 0 ? 0 : Math.round((lessonsDone / lessonsTotal) * 100);
  const accent = module.accent ?? "#3563f5";

  return (
    <Link
      to={`/m/${module.id}`}
      className="card card-hover group relative block p-5 focus-ring"
    >
      <div
        aria-hidden
        className="absolute inset-y-0 left-0 w-1 rounded-l-2xl"
        style={{ background: accent }}
      />
      <div className="flex items-baseline justify-between gap-3">
        <div className="font-semibold text-slate-900">{module.title}</div>
        <div className="text-sm text-slate-500 tabular-nums">{lessonsPct}%</div>
      </div>
      <ProgressBar
        value={lessonsPct}
        className="mt-2"
        tone={lessonsPct === 100 ? "emerald" : "brand"}
      />
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Уроки">
          <span className="tabular-nums">
            {lessonsDone} / {lessonsTotal}
          </span>
        </Stat>
        <Stat label="Задачи">
          <span className="tabular-nums">
            {tasksAttempted} / {tasksTotal}
          </span>
        </Stat>
        <Stat label="Self-score">
          {avgSelfScore === null ? (
            <span className="text-slate-400">—</span>
          ) : (
            <span className="tabular-nums">{avgSelfScore}%</span>
          )}
        </Stat>
      </div>
      {lessonsPct === 100 && (
        <Badge tone="emerald" className="absolute right-4 top-4">
          ✓ полностью пройдено
        </Badge>
      )}
    </Link>
  );
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-slate-500 font-medium">
        {label}
      </div>
      <div className="font-medium mt-0.5 text-slate-800">{children}</div>
    </div>
  );
}

function BookIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden>
      <path d="M10 3a3 3 0 00-3 3v9a3 3 0 003-3h7V3h-7z" />
      <path d="M3 6a3 3 0 013-3h1v12H6a3 3 0 00-3 3V6z" />
    </svg>
  );
}
function FlagIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden>
      <path d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1z" />
      <path d="M5 4a1 1 0 011-1h9.586a1 1 0 01.707 1.707L13 8l3.293 3.293A1 1 0 0115.586 13H6a1 1 0 01-1-1V4z" />
    </svg>
  );
}
function GridIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden>
      <path d="M3 3h6v6H3zM11 3h6v6h-6zM3 11h6v6H3zM11 11h6v6h-6z" />
    </svg>
  );
}
