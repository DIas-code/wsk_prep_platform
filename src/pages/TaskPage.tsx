import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import type { TaskAttachment, TaskSection } from "../types";
import {
  loadProgress,
  updateTaskCriteria,
  updateTaskDeliverable,
} from "../progress/storage";
import { useContent } from "../ui/ContentContext";
import { useAsync } from "../ui/useAsync";
import { Markdown } from "../ui/Markdown";
import { DIFFICULTY_RU } from "../ui/ru";

export function TaskPage() {
  const { moduleId = "", taskId = "" } = useParams();
  const { loader } = useContent();
  const state = useAsync(() => loader.loadTask(moduleId, taskId), [moduleId, taskId]);

  if (state.status === "loading") return <div className="p-8">Загрузка…</div>;
  if (state.status === "error") {
    return <div className="p-8 text-red-700">Ошибка: {state.error.message}</div>;
  }
  const task = state.data;

  return (
    <div className="max-w-3xl mx-auto p-8">
      <Link to={`/m/${moduleId}`} className="text-sm text-slate-500 hover:underline">
        ← {moduleId}
      </Link>
      <div className="flex items-baseline gap-3 mt-2">
        <h1 className="text-3xl font-semibold">{task.title}</h1>
        <span className="text-xs uppercase tracking-wide px-2 py-0.5 rounded bg-slate-200 text-slate-700">
          {DIFFICULTY_RU[task.difficulty] ?? task.difficulty}
        </span>
      </div>
      <p className="text-slate-600 mt-1">{task.summary}</p>
      {task.timeLimitMinutes !== undefined && (
        <p className="text-sm text-slate-500 mt-1">Лимит времени: {task.timeLimitMinutes} мин</p>
      )}

      <section className="mt-6">
        <Markdown source={task.overview} />
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Требования</h2>
        <ol className="space-y-4">
          {task.sections.map((s) => (
            <SectionView key={s.id} section={s} />
          ))}
        </ol>
      </section>

      {task.attachments && task.attachments.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-3">Материалы</h2>
          <ul className="space-y-2">
            {task.attachments.map((a, i) => (
              <AttachmentRow key={i} attachment={a} moduleId={moduleId} taskId={taskId} />
            ))}
          </ul>
        </section>
      )}

      {task.sources && task.sources.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-3">Источники</h2>
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
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-3">Примечания</h2>
          <Markdown source={task.notes} />
        </section>
      )}
    </div>
  );
}

function SectionView({ section, depth = 0 }: { section: TaskSection; depth?: number }) {
  return (
    <li
      className="border-l-2 border-slate-200 pl-4"
      style={{ marginLeft: depth > 0 ? `${depth * 16}px` : undefined }}
    >
      <div className="flex items-baseline gap-2">
        <span className="text-slate-400 font-mono text-sm w-12 shrink-0">{section.id}</span>
        <h3 className="font-semibold">{section.title}</h3>
      </div>
      {section.body && (
        <div className="mt-1 text-slate-700 text-sm">
          <Markdown source={section.body} />
        </div>
      )}
      {section.children && section.children.length > 0 && (
        <ol className="mt-2 space-y-3">
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
    <li className="rounded border border-slate-200 bg-white p-3">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <div className="font-medium">{attachment.label}</div>
          <div className="text-xs text-slate-500 uppercase">{attachment.kind}</div>
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
              className="text-blue-600 hover:underline"
            >
              Открыть ↗
            </a>
          )}
          {source.format === "file" && (
            <a
              href={resolveFilePath(moduleId, taskId, source.path)}
              download
              className="text-blue-600 hover:underline"
            >
              Скачать
            </a>
          )}
          {source.format === "inline" && <InlineAttachmentActions value={source.value} />}
        </div>
      </div>
      {source.format === "inline" && (
        <pre className="mt-3 p-3 bg-slate-50 text-sm rounded overflow-x-auto whitespace-pre-wrap">
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
      className="text-sm text-blue-600 hover:underline"
    >
      {copied ? "Скопировано!" : "Копировать"}
    </button>
  );
}

function resolveFilePath(moduleId: string, taskId: string, relativePath: string): string {
  // Attachments with `format: "file"` are relative to the task JSON file.
  // In dev/build, tasks live at /content/<moduleId>/tasks/<taskId>.json, so the
  // file is served at /content/<moduleId>/tasks/<relativePath>.
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

  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold mb-3">
        Критерии оценки{" "}
        <span className="text-sm font-normal text-slate-500">
          ({checked.size} / {criteria.length})
        </span>
      </h2>
      <ul className="space-y-2">
        {criteria.map((c) => (
          <li key={c.id} className="rounded border border-slate-200 bg-white p-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1"
                checked={checked.has(c.id)}
                onChange={() => toggle(c.id)}
              />
              <div>
                <div className={checked.has(c.id) ? "text-slate-500 line-through" : undefined}>
                  {c.text}
                </div>
                {c.tag && (
                  <span className="inline-block mt-1 text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                    {c.tag}
                  </span>
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
    <section className="mt-8">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xl font-semibold">Результаты сдачи</h2>
        <span className="text-sm text-slate-500">{pct}%</span>
      </div>
      <div className="h-2 bg-slate-200 rounded mt-2 overflow-hidden">
        <div className="h-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <ul className="mt-3 space-y-2">
        {deliverables.map((d) => (
          <li key={d.id} className="rounded border border-slate-200 bg-white p-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1"
                checked={done.has(d.id)}
                onChange={() => toggle(d.id)}
              />
              <div className="flex-1">
                <div className={done.has(d.id) ? "text-slate-500 line-through" : undefined}>
                  <span className="font-medium">{d.label}</span>{" "}
                  <span className="text-xs text-slate-500 uppercase">{d.kind}</span>
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
