import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import type { TaskAttachment, TaskSection } from "../types";
import {
  loadProgress,
  resetTaskTimer,
  startTask,
  updateTaskCriteria,
  updateTaskDeliverable,
} from "../progress/storage";
import { useContent } from "../ui/ContentContext";
import { useAsync } from "../ui/useAsync";
import { formatCountdown, useCountdown } from "../ui/useCountdown";
import { Markdown } from "../ui/Markdown";
import { DIFFICULTY_RU } from "../ui/ru";
import { PageContainer } from "../ui/AppShell";
import {
  BackLink,
  Badge,
  ErrorState,
  LoadingState,
  ProgressBar,
} from "../ui/components";

export function TaskPage() {
  const { moduleId = "", taskId = "" } = useParams();
  const { loader } = useContent();
  const state = useAsync(() => loader.loadTask(moduleId, taskId), [moduleId, taskId]);

  if (state.status === "loading") return <LoadingState />;
  if (state.status === "error") return <ErrorState message={state.error.message} />;
  const task = state.data;

  return (
    <PageContainer size="narrow">
      <BackLink to={`/m/${moduleId}`}>Назад к модулю</BackLink>

      <div className="mt-4 flex flex-wrap items-start gap-3">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
          {task.title}
        </h1>
        <Badge tone={difficultyTone(task.difficulty)} className="mt-2">
          {DIFFICULTY_RU[task.difficulty] ?? task.difficulty}
        </Badge>
      </div>
      {task.summary && (
        <p className="mt-2 text-slate-600 text-lg">{task.summary}</p>
      )}

      {task.timeLimitMinutes !== undefined && (
        <TaskTimer
          moduleId={moduleId}
          taskId={taskId}
          limitMinutes={task.timeLimitMinutes}
        />
      )}

      <section className="mt-8">
        <Markdown source={task.overview} />
      </section>

      <section className="mt-10">
        <h2 className="section-title mb-4">Требования</h2>
        <ol className="space-y-3">
          {task.sections.map((s) => (
            <SectionView key={s.id} section={s} />
          ))}
        </ol>
      </section>

      {task.attachments && task.attachments.length > 0 && (
        <section className="mt-10">
          <h2 className="section-title mb-4">Материалы</h2>
          <ul className="space-y-2">
            {task.attachments.map((a, i) => (
              <AttachmentRow key={i} attachment={a} moduleId={moduleId} taskId={taskId} />
            ))}
          </ul>
        </section>
      )}

      {task.sources && task.sources.length > 0 && (
        <section className="mt-10">
          <h2 className="section-title mb-4">Источники</h2>
          <ul className="space-y-2">
            {task.sources.map((a, i) => (
              <AttachmentRow key={i} attachment={a} moduleId={moduleId} taskId={taskId} />
            ))}
          </ul>
        </section>
      )}

      {task.deliverables && task.deliverables.length > 0 && (
        <Deliverables moduleId={moduleId} taskId={taskId} deliverables={task.deliverables} />
      )}

      <Criteria moduleId={moduleId} taskId={taskId} criteria={task.assessmentCriteria} />

      {task.notes && (
        <section className="mt-10">
          <h2 className="section-title mb-4">Примечания</h2>
          <Markdown source={task.notes} />
        </section>
      )}
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

function TaskTimer({
  moduleId,
  taskId,
  limitMinutes,
}: {
  moduleId: string;
  taskId: string;
  limitMinutes: number;
}) {
  const [startedAt, setStartedAt] = useState<string | undefined>(
    () => loadProgress().modules[moduleId]?.tasks[taskId]?.startedAt,
  );
  const { remainingMs, expired } = useCountdown(startedAt, limitMinutes);

  function onStart() {
    const next = startTask(moduleId, taskId);
    setStartedAt(next.modules[moduleId]?.tasks[taskId]?.startedAt);
  }

  function onReset() {
    if (!confirm("Сбросить таймер? Прогресс по критериям и deliverables останется.")) return;
    resetTaskTimer(moduleId, taskId);
    setStartedAt(undefined);
  }

  if (!startedAt) {
    return (
      <div className="mt-5 card flex items-center gap-3 p-4">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
          <ClockIcon />
        </span>
        <div className="text-sm">
          <div className="font-medium text-slate-800">Лимит: {limitMinutes} мин</div>
          <div className="text-slate-500 text-xs">
            Запустите таймер, когда начнёте работу.
          </div>
        </div>
        <button
          type="button"
          onClick={onStart}
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-soft hover:bg-brand-700 transition focus-ring"
        >
          <PlayIcon />
          Начать
        </button>
      </div>
    );
  }

  const totalMs = limitMinutes * 60_000;
  const usedPct = expired
    ? 100
    : Math.max(0, Math.min(100, 100 - (remainingMs / totalMs) * 100));

  return (
    <div
      className={`mt-5 card p-4 ${
        expired ? "ring-1 ring-rose-300 bg-rose-50/40" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${
            expired ? "bg-rose-100 text-rose-700" : "bg-brand-50 text-brand-700"
          }`}
        >
          <ClockIcon />
        </span>
        <div className="text-sm">
          <div className="text-xs uppercase tracking-wide text-slate-500">
            {expired ? "Время вышло" : "Осталось"}
          </div>
          <div
            className={`font-mono text-2xl font-semibold tabular-nums ${
              expired ? "text-rose-700" : "text-slate-900"
            }`}
          >
            {expired ? "00:00" : formatCountdown(remainingMs)}
          </div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-xs text-slate-500">из {limitMinutes} мин</div>
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-slate-500 hover:text-rose-700 hover:underline"
          >
            Сбросить таймер
          </button>
        </div>
      </div>
      <ProgressBar
        value={usedPct}
        className="mt-3"
        size="sm"
        tone={expired ? "amber" : "brand"}
      />
    </div>
  );
}

function SectionView({ section, depth = 0 }: { section: TaskSection; depth?: number }) {
  return (
    <li
      className={`relative ${
        depth === 0
          ? "card p-4"
          : "border-l-2 border-slate-200 pl-4 ml-2"
      }`}
    >
      <div className="flex items-baseline gap-3">
        <span className="inline-flex shrink-0 items-center justify-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-mono font-semibold text-slate-700 tabular-nums">
          {section.id}
        </span>
        <h3
          className={`font-semibold text-slate-900 ${
            depth === 0 ? "text-base" : "text-sm"
          }`}
        >
          {section.title}
        </h3>
      </div>
      {section.body && (
        <div className="mt-2 text-slate-700 text-sm">
          <Markdown source={section.body} />
        </div>
      )}
      {section.children && section.children.length > 0 && (
        <ol className="mt-3 space-y-3">
          {section.children.map((c) => (
            <SectionView key={c.id} section={c} depth={depth + 1} />
          ))}
        </ol>
      )}
    </li>
  );
}

function AttachmentRow({
  attachment,
  moduleId,
  taskId,
}: {
  attachment: TaskAttachment;
  moduleId: string;
  taskId: string;
}) {
  const { source } = attachment;
  return (
    <li className="card p-4">
      <div className="flex items-baseline justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-slate-900">{attachment.label}</span>
            <Badge tone="slate">{attachment.kind}</Badge>
          </div>
          {attachment.description && (
            <div className="text-sm text-slate-600 mt-1">{attachment.description}</div>
          )}
        </div>
        <div className="shrink-0">
          {source.format === "external" && (
            <a
              href={source.url}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline"
            >
              Открыть
              <span aria-hidden>↗</span>
            </a>
          )}
          {source.format === "file" && (
            <a
              href={resolveFilePath(moduleId, taskId, source.path)}
              download
              className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline"
            >
              Скачать
            </a>
          )}
          {source.format === "inline" && <InlineAttachmentActions value={source.value} />}
        </div>
      </div>
      {source.format === "inline" && (
        <pre className="mt-3 p-3 bg-slate-50 border border-slate-200 text-sm rounded-lg overflow-x-auto whitespace-pre-wrap font-mono scrollbar-thin">
          {source.value}
        </pre>
      )}
    </li>
  );
}

function InlineAttachmentActions({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  async function onCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }
  return (
    <button
      type="button"
      onClick={onCopy}
      className="text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline"
    >
      {copied ? "Скопировано ✓" : "Копировать"}
    </button>
  );
}

function resolveFilePath(moduleId: string, taskId: string, relativePath: string): string {
  void taskId;
  return `/content/${moduleId}/tasks/${relativePath}`;
}

function Criteria({
  moduleId,
  taskId,
  criteria,
}: {
  moduleId: string;
  taskId: string;
  criteria: readonly { id: string; text: string; tag?: string }[];
}) {
  const [checked, setChecked] = useState<Set<string>>(() => {
    const s = loadProgress();
    return new Set(s.modules[moduleId]?.tasks[taskId]?.criteriaChecked ?? []);
  });

  function toggle(id: string) {
    const next = new Set(checked);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    updateTaskCriteria(moduleId, taskId, id, next.has(id));
    setChecked(next);
  }

  const pct = criteria.length === 0 ? 0 : Math.round((checked.size / criteria.length) * 100);

  return (
    <section className="mt-10">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="section-title">Критерии оценки</h2>
        <span className="text-sm text-slate-500 tabular-nums">
          {checked.size} / {criteria.length} · {pct}%
        </span>
      </div>
      <ProgressBar value={pct} className="mb-4" size="sm" tone="brand" />
      <ul className="space-y-2">
        {criteria.map((c) => (
          <li key={c.id}>
            <label
              className={`card flex items-start gap-3 p-3.5 cursor-pointer transition ${
                checked.has(c.id) ? "bg-emerald-50/40 ring-1 ring-emerald-200" : "hover:border-slate-300"
              }`}
            >
              <Check
                checked={checked.has(c.id)}
                onChange={() => toggle(c.id)}
              />
              <div className="flex-1">
                <div
                  className={
                    checked.has(c.id)
                      ? "text-slate-500 line-through"
                      : "text-slate-800"
                  }
                >
                  {c.text}
                </div>
                {c.tag && (
                  <Badge tone="violet" className="mt-1.5">
                    {c.tag}
                  </Badge>
                )}
              </div>
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Deliverables({
  moduleId,
  taskId,
  deliverables,
}: {
  moduleId: string;
  taskId: string;
  deliverables: readonly { id: string; label: string; kind: string; spec?: string }[];
}) {
  const [done, setDone] = useState<Set<string>>(() => {
    const s = loadProgress();
    return new Set(s.modules[moduleId]?.tasks[taskId]?.deliverablesDone ?? []);
  });

  const pct = useMemo(
    () => (deliverables.length === 0 ? 0 : Math.round((done.size / deliverables.length) * 100)),
    [done, deliverables.length],
  );

  function toggle(id: string) {
    const next = new Set(done);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    updateTaskDeliverable(moduleId, taskId, id, next.has(id));
    setDone(next);
  }

  return (
    <section className="mt-10">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="section-title">Результаты сдачи</h2>
        <span className="text-sm text-slate-500 tabular-nums">
          {done.size} / {deliverables.length} · {pct}%
        </span>
      </div>
      <ProgressBar value={pct} className="mb-4" tone="emerald" />
      <ul className="space-y-2">
        {deliverables.map((d) => (
          <li key={d.id}>
            <label
              className={`card flex items-start gap-3 p-3.5 cursor-pointer transition ${
                done.has(d.id) ? "bg-emerald-50/40 ring-1 ring-emerald-200" : "hover:border-slate-300"
              }`}
            >
              <Check checked={done.has(d.id)} onChange={() => toggle(d.id)} />
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`font-medium ${
                      done.has(d.id) ? "text-slate-500 line-through" : "text-slate-900"
                    }`}
                  >
                    {d.label}
                  </span>
                  <Badge tone="slate">{d.kind}</Badge>
                </div>
                {d.spec && <div className="mt-1 text-sm text-slate-600">{d.spec}</div>}
              </div>
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Check({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <span
      role="checkbox"
      aria-checked={checked}
      tabIndex={0}
      onClick={(e) => {
        e.preventDefault();
        onChange();
      }}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          onChange();
        }
      }}
      className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border transition focus-ring ${
        checked
          ? "bg-emerald-500 border-emerald-500 text-white"
          : "bg-white border-slate-300 hover:border-brand-400"
      }`}
    >
      {checked && (
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
          <path
            fillRule="evenodd"
            d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0l-3.5-3.5a1 1 0 011.4-1.4l2.8 2.8 6.8-6.8a1 1 0 011.4 0z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </span>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden>
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .2.08.39.22.53l3 3a.75.75 0 101.06-1.06L10.75 9.69V5z"
        clipRule="evenodd"
      />
    </svg>
  );
}
function PlayIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden>
      <path d="M6 4l10 6-10 6V4z" />
    </svg>
  );
}
