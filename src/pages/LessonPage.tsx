import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import type { PracticeBlock, PracticeStep } from "../types";
import { stepProgressKey } from "../types";
import { loadProgress, updateLesson } from "../progress/storage";
import { useContent } from "../ui/ContentContext";
import { useAsync } from "../ui/useAsync";
import { Markdown } from "../ui/Markdown";
import { ShikiCode } from "../ui/ShikiCode";
import { PageContainer } from "../ui/AppShell";
import {
  BackLink,
  Badge,
  ErrorState,
  LoadingState,
  ProgressBar,
} from "../ui/components";

export function LessonPage() {
  const { moduleId = "", lessonId = "" } = useParams();
  const { loader } = useContent();

  const state = useAsync(async () => {
    const [lesson, mod] = await Promise.all([
      loader.loadLesson(moduleId, lessonId),
      loader.loadModule(moduleId),
    ]);
    return { lesson, mod };
  }, [moduleId, lessonId]);

  if (state.status === "loading") return <LoadingState />;
  if (state.status === "error") return <ErrorState message={state.error.message} />;

  const { lesson, mod } = state.data;
  const theory = lesson.theory.kind === "inline" ? lesson.theory.value : null;

  const lessonIndex = mod.lessonOrder.indexOf(lessonId);
  const lessonNumber = lessonIndex + 1;
  const total = mod.lessonOrder.length;
  const prevLessonId = lessonIndex > 0 ? mod.lessonOrder[lessonIndex - 1] : null;
  const nextLessonId =
    lessonIndex < mod.lessonOrder.length - 1 ? mod.lessonOrder[lessonIndex + 1] : null;
  const lessonPct = total === 0 ? 0 : Math.round((lessonNumber / total) * 100);

  return (
    <PageContainer size="narrow">
      <BackLink to={`/m/${moduleId}`}>{mod.title}</BackLink>

      <div className="mt-4 mb-6">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            Урок {lessonNumber} из {total}
          </span>
          <span>{lessonPct}%</span>
        </div>
        <ProgressBar value={lessonPct} className="mt-1.5" size="sm" />
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
        {lesson.title}
      </h1>
      {lesson.summary && (
        <p className="mt-2 text-slate-600 text-lg">{lesson.summary}</p>
      )}
      <div className="mt-3 flex items-center gap-2">
        <Badge tone="slate">~{lesson.estimatedMinutes} мин</Badge>
        {lesson.practice?.length > 0 && (
          <Badge tone="brand">практики: {lesson.practice.length}</Badge>
        )}
      </div>

      <section className="mt-8">
        {theory !== null ? (
          <Markdown source={theory} />
        ) : (
          <p className="text-slate-500 italic">
            Внешний файл теории пока не поддерживается.
          </p>
        )}
      </section>

      {lesson.practice.length > 0 && (
        <section className="mt-12">
          <h2 className="section-title mb-4 flex items-center gap-2">
            Практика
            <Badge tone="brand">{lesson.practice.length}</Badge>
          </h2>
          <div className="space-y-5">
            {lesson.practice.map((block) => (
              <PracticeBlockView
                key={block.id}
                moduleId={moduleId}
                lessonId={lessonId}
                block={block}
              />
            ))}
          </div>
        </section>
      )}

      <nav className="mt-12 flex items-center justify-between gap-3 border-t border-slate-200 pt-6">
        {prevLessonId !== null ? (
          <Link
            to={`/m/${moduleId}/l/${prevLessonId}`}
            className="card card-hover px-4 py-3 max-w-[48%] focus-ring"
          >
            <div className="text-xs text-slate-400">Предыдущий</div>
            <div className="mt-0.5 text-sm font-medium text-slate-700 group-hover:text-brand-700 inline-flex items-center gap-1.5">
              <span aria-hidden>←</span>
              <span className="truncate">Урок {lessonIndex}</span>
            </div>
          </Link>
        ) : (
          <span />
        )}
        {nextLessonId !== null ? (
          <Link
            to={`/m/${moduleId}/l/${nextLessonId}`}
            className="card card-hover px-4 py-3 max-w-[48%] focus-ring text-right ml-auto"
          >
            <div className="text-xs text-slate-400">Следующий</div>
            <div className="mt-0.5 text-sm font-medium text-brand-700 inline-flex items-center gap-1.5">
              <span className="truncate">Урок {lessonIndex + 2}</span>
              <span aria-hidden>→</span>
            </div>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </PageContainer>
  );
}

function PracticeBlockView({
  moduleId,
  lessonId,
  block,
}: {
  moduleId: string;
  lessonId: string;
  block: PracticeBlock;
}) {
  const [done, setDone] = useState<Set<string>>(() => {
    const s = loadProgress();
    const steps = s.modules[moduleId]?.lessons[lessonId]?.stepsDone ?? [];
    return new Set(steps);
  });

  const blockKeys = useMemo(
    () => block.steps.map((st) => stepProgressKey(block.id, st.id)),
    [block],
  );

  function toggle(stepId: string) {
    const key = stepProgressKey(block.id, stepId);
    const s = loadProgress();
    const current = new Set(s.modules[moduleId]?.lessons[lessonId]?.stepsDone ?? []);
    if (current.has(key)) current.delete(key);
    else current.add(key);
    const next = [...current];
    updateLesson(moduleId, lessonId, { stepsDone: next, viewedAt: new Date().toISOString() });
    setDone(new Set(next));
  }

  const completedCount = blockKeys.filter((k) => done.has(k)).length;
  const completed = completedCount === blockKeys.length && blockKeys.length > 0;
  const pct =
    blockKeys.length === 0 ? 0 : Math.round((completedCount / blockKeys.length) * 100);

  return (
    <div
      className={`card p-5 ${
        completed ? "ring-1 ring-emerald-200 bg-emerald-50/30" : ""
      }`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-lg font-semibold tracking-tight">{block.title}</h3>
        {completed ? (
          <Badge tone="emerald">✓ выполнено</Badge>
        ) : (
          <span className="text-xs text-slate-500 tabular-nums">
            {completedCount} / {blockKeys.length}
          </span>
        )}
      </div>
      {block.goal && (
        <p className="text-slate-600 text-sm mt-1">{block.goal}</p>
      )}
      <ProgressBar
        value={pct}
        className="mt-3"
        size="sm"
        tone={completed ? "emerald" : "brand"}
      />
      <ol className="mt-4 space-y-4">
        {block.steps.map((step, i) => (
          <PracticeStepView
            key={step.id}
            index={i + 1}
            step={step}
            checked={done.has(stepProgressKey(block.id, step.id))}
            onToggle={() => toggle(step.id)}
          />
        ))}
      </ol>
    </div>
  );
}

function PracticeStepView({
  step,
  index,
  checked,
  onToggle,
}: {
  step: PracticeStep;
  index: number;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <li
      className={`relative pl-9 ${
        checked ? "" : ""
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={checked}
        aria-label={checked ? "Отметить как невыполненный" : "Отметить как выполненный"}
        className={`absolute left-0 top-0 inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold transition focus-ring ${
          checked
            ? "bg-emerald-500 border-emerald-500 text-white"
            : "bg-white border-slate-300 text-slate-500 hover:border-brand-400 hover:text-brand-600"
        }`}
      >
        {checked ? (
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
            <path
              fillRule="evenodd"
              d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0l-3.5-3.5a1 1 0 011.4-1.4l2.8 2.8 6.8-6.8a1 1 0 011.4 0z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          index
        )}
      </button>
      <div
        className={`text-slate-800 ${
          checked ? "text-slate-400 line-through" : ""
        }`}
      >
        {step.instruction}
      </div>
      {step.code && (
        <div className="mt-2">
          <ShikiCode code={step.code.full} language={step.code.language} />
        </div>
      )}
      {step.hints && step.hints.length > 0 && (
        <details className="mt-2 group">
          <summary className="cursor-pointer text-sm text-slate-500 hover:text-brand-700 inline-flex items-center gap-1 select-none">
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-3.5 w-3.5 transition-transform group-open:rotate-90"
            >
              <path
                fillRule="evenodd"
                d="M7.3 5.3a1 1 0 011.4 0l4 4a1 1 0 010 1.4l-4 4a1 1 0 01-1.4-1.4L10.6 10 7.3 6.7a1 1 0 010-1.4z"
                clipRule="evenodd"
              />
            </svg>
            Подсказки ({step.hints.length})
          </summary>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-slate-600">
            {step.hints.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        </details>
      )}
      {checked && step.explanation && (
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50/60 p-3 text-sm text-emerald-900">
          <div className="font-medium text-emerald-700 mb-0.5">Пояснение</div>
          {step.explanation}
        </div>
      )}
    </li>
  );
}
