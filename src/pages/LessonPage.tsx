import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import type { PracticeBlock, PracticeStep } from "../types";
import { stepProgressKey } from "../types";
import { loadProgress, updateLesson } from "../progress/storage";
import { useContent } from "../ui/ContentContext";
import { useAsync } from "../ui/useAsync";
import { Markdown } from "../ui/Markdown";
import { ShikiCode } from "../ui/ShikiCode";

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

  if (state.status === "loading") return <div className="p-8">Загрузка…</div>;
  if (state.status === "error") {
    return <div className="p-8 text-red-700">Ошибка: {state.error.message}</div>;
  }

  const { lesson, mod } = state.data;
  const theory = lesson.theory.kind === "inline" ? lesson.theory.value : null;

  const lessonIndex = mod.lessonOrder.indexOf(lessonId);
  const lessonNumber = lessonIndex + 1;
  const prevLessonId = lessonIndex > 0 ? mod.lessonOrder[lessonIndex - 1] : null;
  const nextLessonId = lessonIndex < mod.lessonOrder.length - 1 ? mod.lessonOrder[lessonIndex + 1] : null;

  return (
    <div className="max-w-3xl mx-auto p-8">
      <Link to={`/m/${moduleId}`} className="text-sm text-slate-500 hover:underline">
        ← {mod.title}
      </Link>
      <div className="text-sm text-slate-400 mt-2">
        Урок {lessonNumber} из {mod.lessonOrder.length}
      </div>
      <h1 className="text-3xl font-semibold mt-1">{lesson.title}</h1>
      <p className="text-slate-600 mt-1">{lesson.summary}</p>

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
        <section className="mt-10">
          <h2 className="text-xl font-semibold mb-4">Практика</h2>
          <div className="space-y-6">
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

      <div className="mt-10 flex justify-between border-t border-slate-200 pt-6">
        {prevLessonId !== null ? (
          <Link
            to={`/m/${moduleId}/l/${prevLessonId}`}
            className="text-sm text-blue-600 hover:underline"
          >
            ← Предыдущий урок
          </Link>
        ) : (
          <span />
        )}
        {nextLessonId !== null ? (
          <Link
            to={`/m/${moduleId}/l/${nextLessonId}`}
            className="text-sm text-blue-600 hover:underline"
          >
            Следующий урок →
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
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

  const completed = blockKeys.every((k) => done.has(k));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-baseline justify-between">
        <h3 className="text-lg font-semibold">{block.title}</h3>
        {completed && <span className="text-sm text-green-600">✓ выполнено</span>}
      </div>
      <p className="text-slate-600 text-sm mt-1">{block.goal}</p>
      <ol className="mt-4 space-y-4">
        {block.steps.map((step) => (
          <PracticeStepView
            key={step.id}
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
  checked,
  onToggle,
}: {
  step: PracticeStep;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <li className="border-l-2 pl-4 border-slate-200">
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          className="mt-1"
          checked={checked}
          onChange={onToggle}
        />
        <div className="flex-1">
          <div className={checked ? "text-slate-500 line-through" : undefined}>
            {step.instruction}
          </div>
          {step.code && (
            <ShikiCode code={step.code.full} language={step.code.language} />
          )}
          {step.hints && step.hints.length > 0 && (
            <details className="mt-2 text-sm text-slate-600">
              <summary className="cursor-pointer">Подсказки</summary>
              <ul className="list-disc pl-5 mt-1">
                {step.hints.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </details>
          )}
          {checked && step.explanation && (
            <div className="mt-2 p-3 bg-slate-50 text-sm text-slate-700 rounded">
              {step.explanation}
            </div>
          )}
        </div>
      </label>
    </li>
  );
}

