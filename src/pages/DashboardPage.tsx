import { Link } from "react-router-dom";

import type { Module, ProgressState } from "../types";
import { loadProgress } from "../progress/storage";
import { useContent } from "../ui/ContentContext";
import { useAsync } from "../ui/useAsync";
import { pluralize } from "../ui/ru";

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

  if (state.status === "loading") return <div className="p-8">Загрузка…</div>;
  if (state.status === "error") {
    return <div className="p-8 text-red-700">Ошибка: {state.error.message}</div>;
  }

  const progress = loadProgress();
  const stats = state.data.map((m) => computeStats(m, progress));

  const totalLessonsDone = stats.reduce((a, s) => a + s.lessonsDone, 0);
  const totalLessonsAll = stats.reduce((a, s) => a + s.lessonsTotal, 0);
  const totalTasksAttempted = stats.reduce((a, s) => a + s.tasksAttempted, 0);
  const totalTasksAll = stats.reduce((a, s) => a + s.tasksTotal, 0);

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="flex items-baseline gap-3 mb-2">
        <Link to="/" className="text-sm text-slate-500 hover:underline">
          ←
        </Link>
        <h1 className="text-3xl font-semibold">Прогресс</h1>
      </div>
      <p className="text-slate-600 mb-8">
        Сводка по всем модулям. Данные читаются из <code>localStorage</code> — никто не видит
        их, кроме тебя.
      </p>

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <Kpi label="Уроков пройдено" value={`${totalLessonsDone} / ${totalLessonsAll}`} />
        <Kpi label="Задач начато" value={`${totalTasksAttempted} / ${totalTasksAll}`} />
        <Kpi
          label="Обновлено"
          value={new Date(progress.updatedAt).toLocaleString("ru-RU")}
          small
        />
      </div>

      <h2 className="text-xl font-semibold mb-3">По модулям</h2>
      <div className="grid gap-3">
        {stats.map((s) => (
          <ModuleRow key={s.module.id} stats={s} />
        ))}
      </div>
    </div>
  );
}

function Kpi({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className={small ? "text-sm font-medium mt-1" : "text-2xl font-semibold mt-1"}>
        {value}
      </div>
    </div>
  );
}

function ModuleRow({ stats }: { stats: ModuleStats }) {
  const { module, lessonsDone, lessonsTotal, tasksAttempted, tasksTotal, avgSelfScore } = stats;
  const lessonsPct = lessonsTotal === 0 ? 0 : Math.round((lessonsDone / lessonsTotal) * 100);

  return (
    <Link
      to={`/m/${module.id}`}
      className="block rounded-xl border border-slate-200 bg-white p-4 hover:shadow-md transition"
      style={module.accent ? { borderLeft: `4px solid ${module.accent}` } : undefined}
    >
      <div className="flex items-baseline justify-between gap-3">
        <div className="font-semibold">{module.title}</div>
        <div className="text-sm text-slate-500">{lessonsPct}%</div>
      </div>
      <div className="h-2 bg-slate-200 rounded mt-2 overflow-hidden">
        <div
          className="h-full bg-emerald-500 transition-all"
          style={{ width: `${lessonsPct}%` }}
        />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Уроки">
          {lessonsDone} / {lessonsTotal}{" "}
          <span className="text-slate-400 text-xs">
            {pluralize(lessonsTotal, "урок", "урока", "уроков")}
          </span>
        </Stat>
        <Stat label="Задачи">
          {tasksAttempted} / {tasksTotal}{" "}
          <span className="text-slate-400 text-xs">
            {pluralize(tasksTotal, "начата", "начаты", "начато")}
          </span>
        </Stat>
        <Stat label="Self-score">
          {avgSelfScore === null ? "—" : `${avgSelfScore}%`}
        </Stat>
      </div>
    </Link>
  );
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="font-medium mt-0.5">{children}</div>
    </div>
  );
}
