import { Link, useParams } from "react-router-dom";

import { loadProgress } from "../progress/storage";
import { useContent } from "../ui/ContentContext";
import { useAsync } from "../ui/useAsync";
import { DIFFICULTY_RU, pluralize } from "../ui/ru";
import { PageContainer } from "../ui/AppShell";
import {
  BackLink,
  Badge,
  ErrorState,
  LoadingState,
  PageHeader,
  ProgressBar,
} from "../ui/components";

export function ModulePage() {
  const { moduleId = "" } = useParams();
  const { loader } = useContent();

  const state = useAsync(async () => {
    const mod = await loader.loadModule(moduleId);
    const lessons = await loader.listLessons(moduleId);
    const tasks = await loader.listTasks(moduleId);
    return { mod, lessons, tasks };
  }, [moduleId]);

  if (state.status === "loading") return <LoadingState />;
  if (state.status === "error") return <ErrorState message={state.error.message} />;

  const { mod, lessons, tasks } = state.data;
  const progress = loadProgress();
  const modProg = progress.modules[mod.id];
  const lessonProg = modProg?.lessons ?? {};
  const taskProg = modProg?.tasks ?? {};
  const accent = mod.accent ?? "#3563f5";

  const lessonsDone = lessons.filter((l) => !!lessonProg[l.id]?.completedAt).length;
  const pct = lessons.length === 0 ? 0 : Math.round((lessonsDone / lessons.length) * 100);

  return (
    <PageContainer size="narrow">
      <BackLink to="/">Все модули</BackLink>

      <PageHeader
        eyebrow="Модуль"
        title={mod.title}
        description={mod.description}
      />

      <div className="card p-5 mb-10">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700">
            Пройдено: {lessonsDone} из {lessons.length}{" "}
            {pluralize(lessons.length, "урока", "уроков", "уроков")}
          </span>
          <span className="text-slate-500">{pct}%</span>
        </div>
        <ProgressBar value={pct} className="mt-2" />
        <div
          aria-hidden
          className="mt-4 h-1 w-16 rounded-full"
          style={{ background: accent }}
        />
      </div>

      <section>
        <h2 className="section-title mb-4 flex items-center gap-2">
          Уроки
          <Badge tone="slate">{lessons.length}</Badge>
        </h2>
        <ul className="space-y-2">
          {lessons.map((l, index) => {
            const lp = lessonProg[l.id];
            const done = !!lp?.completedAt;
            const stepsDone = lp?.stepsDone?.length ?? 0;
            return (
              <li key={l.id}>
                <Link
                  to={`/m/${mod.id}/l/${l.id}`}
                  className="card card-hover group flex items-start gap-4 p-4 focus-ring"
                >
                  <span
                    className={`mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold tabular-nums ${
                      done
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-100 text-slate-700 group-hover:bg-brand-50 group-hover:text-brand-700"
                    }`}
                  >
                    {done ? <CheckIcon /> : index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="font-medium text-slate-900">{l.title}</div>
                      {done && <Badge tone="emerald">пройдено</Badge>}
                      {!done && stepsDone > 0 && (
                        <Badge tone="amber">в процессе</Badge>
                      )}
                    </div>
                    {l.summary && (
                      <div className="mt-0.5 text-sm text-slate-500 line-clamp-2">
                        {l.summary}
                      </div>
                    )}
                    <div className="mt-1.5 flex items-center gap-3 text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <ClockIcon />~{l.estimatedMinutes} мин
                      </span>
                      {l.practice?.length > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <SparkIcon />
                          практика
                        </span>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="self-center" />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="section-title mb-4 flex items-center gap-2">
          Задания
          <Badge tone="slate">{tasks.length}</Badge>
        </h2>
        {tasks.length === 0 ? (
          <div className="card p-5 text-sm text-slate-500">
            Заданий пока нет.
          </div>
        ) : (
          <ul className="space-y-2">
            {tasks.map((t) => {
              const tp = taskProg[t.id];
              const attempted =
                tp?.attemptedAt ||
                tp?.startedAt ||
                (tp?.criteriaChecked?.length ?? 0) > 0;
              return (
                <li key={t.id}>
                  <Link
                    to={`/m/${mod.id}/t/${t.id}`}
                    className="card card-hover group flex items-start gap-4 p-4 focus-ring"
                  >
                    <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                      <FlagIcon />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="font-medium text-slate-900">{t.title}</div>
                        <Badge tone={difficultyTone(t.difficulty)}>
                          {DIFFICULTY_RU[t.difficulty] ?? t.difficulty}
                        </Badge>
                        {attempted && <Badge tone="brand">в работе</Badge>}
                      </div>
                      {t.summary && (
                        <div className="mt-0.5 text-sm text-slate-500 line-clamp-2">
                          {t.summary}
                        </div>
                      )}
                    </div>
                    <ArrowRight className="self-center" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </PageContainer>
  );
}

function difficultyTone(
  d: string,
): "emerald" | "amber" | "rose" | "slate" {
  if (d === "easy" || d === "beginner") return "emerald";
  if (d === "medium" || d === "intermediate") return "amber";
  if (d === "hard" || d === "advanced" || d === "expert") return "rose";
  return "slate";
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden>
      <path
        fillRule="evenodd"
        d="M16.704 5.296a1 1 0 010 1.408l-7.5 7.5a1 1 0 01-1.408 0l-3.5-3.5a1 1 0 011.408-1.408L8.5 12.092l6.796-6.796a1 1 0 011.408 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .2.08.39.22.53l3 3a.75.75 0 101.06-1.06L10.75 9.69V5z"
        clipRule="evenodd"
      />
    </svg>
  );
}
function SparkIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
      <path d="M10 2l1.5 4.5L16 8l-4.5 1.5L10 14l-1.5-4.5L4 8l4.5-1.5L10 2z" />
    </svg>
  );
}
function FlagIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden>
      <path d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1z" />
      <path d="M5 4a1 1 0 011-1h9.586a1 1 0 01.707 1.707L13 8l3.293 3.293A1 1 0 0115.586 13H6a1 1 0 01-1-1V4z" />
    </svg>
  );
}
function ArrowRight({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className={`h-4 w-4 text-slate-300 group-hover:text-brand-600 group-hover:translate-x-0.5 transition ${className}`}
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}
