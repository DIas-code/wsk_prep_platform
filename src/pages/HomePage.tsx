import { Link } from "react-router-dom";

import type { Module, ProgressState } from "../types";
import { loadProgress } from "../progress/storage";
import { useContent } from "../ui/ContentContext";
import { useAsync } from "../ui/useAsync";
import { pluralize } from "../ui/ru";
import { PageContainer } from "../ui/AppShell";
import {
  Badge,
  ErrorState,
  LoadingState,
  PageHeader,
  ProgressBar,
} from "../ui/components";

export function HomePage() {
  const { loader, registry } = useContent();
  const state = useAsync(
    () => Promise.all(registry.modules.map((id) => loader.loadModule(id))),
    [registry],
  );

  if (state.status === "loading") return <LoadingState />;
  if (state.status === "error") return <ErrorState message={state.error.message} />;

  const progress = loadProgress();

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Платформа"
        title="WorldSkills · IT Software Solutions"
        description="Учебные модули и реальные задания. Выберите трек ниже, чтобы продолжить с того места, где остановились."
      />

      <div className="grid gap-5 sm:grid-cols-2">
        {state.data.map((mod, i) => (
          <ModuleCard key={mod.id} module={mod} progress={progress} index={i} />
        ))}
      </div>
    </PageContainer>
  );
}

function ModuleCard({
  module: mod,
  progress,
  index,
}: {
  module: Module;
  progress: ProgressState;
  index: number;
}) {
  const nLessons = mod.lessonOrder.length;
  const nTasks = mod.taskIds.length;

  const modProg = progress.modules[mod.id];
  const lessonsDone = modProg
    ? Object.values(modProg.lessons).filter((l) => !!l.completedAt).length
    : 0;
  const tasksAttempted = modProg
    ? Object.entries(modProg.tasks).filter(
        ([id, t]) =>
          mod.taskIds.includes(id) &&
          (t.attemptedAt || t.startedAt || (t.criteriaChecked?.length ?? 0) > 0),
      ).length
    : 0;
  const pct = nLessons === 0 ? 0 : Math.round((lessonsDone / nLessons) * 100);
  const accent = mod.accent ?? "#3563f5";

  return (
    <Link
      to={`/m/${mod.id}`}
      className="card card-hover group relative block p-6 focus-ring"
      style={{
        backgroundImage: `linear-gradient(135deg, ${accent}10, transparent 35%)`,
      }}
    >
      <div className="flex items-start gap-4">
        <ModuleIcon accent={accent} index={index} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-semibold tracking-tight text-slate-900 truncate">
              {mod.title}
            </h3>
            {pct === 100 && (
              <Badge tone="emerald">
                <CheckIcon />
                завершено
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-600 line-clamp-2">{mod.description}</p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between text-xs text-slate-500">
        <span className="font-medium text-slate-700">
          {lessonsDone} / {nLessons}{" "}
          {pluralize(nLessons, "урок", "урока", "уроков")}
        </span>
        <span>{pct}%</span>
      </div>
      <ProgressBar value={pct} className="mt-1.5" tone="brand" />

      <div className="mt-4 flex items-center gap-2 text-xs">
        <Badge tone="slate">
          <BookIcon />
          {nLessons} {pluralize(nLessons, "урок", "урока", "уроков")}
        </Badge>
        <Badge tone="slate">
          <FlagIcon />
          {nTasks} {pluralize(nTasks, "задание", "задания", "заданий")}
        </Badge>
        {tasksAttempted > 0 && (
          <Badge tone="brand">в работе: {tasksAttempted}</Badge>
        )}
        <span className="ml-auto text-slate-400 group-hover:text-brand-600 transition-colors inline-flex items-center gap-1">
          Открыть
          <svg
            className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </div>

      <div
        aria-hidden
        className="absolute inset-y-0 left-0 w-1 rounded-l-2xl"
        style={{ background: accent }}
      />
    </Link>
  );
}

function ModuleIcon({ accent, index }: { accent: string; index: number }) {
  const glyphs = ["⌘", "◐", "◇", "▣", "◎"];
  return (
    <span
      aria-hidden
      className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white text-xl font-bold shadow-soft"
      style={{
        background: `linear-gradient(135deg, ${accent}, ${darken(accent)})`,
      }}
    >
      {glyphs[index % glyphs.length]}
    </span>
  );
}

function darken(hex: string): string {
  // crude darken: just append alpha overlay; if hex is #rrggbb subtract ~20%
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return hex;
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - 40);
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - 40);
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - 40);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
      <path
        fillRule="evenodd"
        d="M16.704 5.296a1 1 0 010 1.408l-7.5 7.5a1 1 0 01-1.408 0l-3.5-3.5a1 1 0 011.408-1.408L8.5 12.092l6.796-6.796a1 1 0 011.408 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}
function BookIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
      <path d="M10 3a3 3 0 00-3 3v9a3 3 0 003-3h7V3h-7z" />
      <path d="M3 6a3 3 0 013-3h1v12H6a3 3 0 00-3 3V6z" />
    </svg>
  );
}
function FlagIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
      <path d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1z" />
      <path d="M5 4a1 1 0 011-1h9.586a1 1 0 01.707 1.707L13 8l3.293 3.293A1 1 0 0115.586 13H6a1 1 0 01-1-1V4z" />
    </svg>
  );
}
