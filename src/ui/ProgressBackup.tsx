import { useRef, useState } from "react";

import { exportProgressJson, importProgressJson } from "../progress/storage";

/**
 * Two buttons for the student to back up and restore their `localStorage`
 * progress. Export writes a timestamped JSON blob; import replaces the
 * current state and reloads so every open page re-reads storage.
 */
export function ProgressBackup() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  function onExport() {
    const json = exportProgressJson();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    a.href = url;
    a.download = `ws-platform-progress-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setMessage({ kind: "ok", text: "Прогресс экспортирован." });
  }

  function onPickFile() {
    fileInputRef.current?.click();
  }

  async function onFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!confirm("Импорт заменит текущий прогресс. Продолжить?")) return;
    try {
      const text = await file.text();
      importProgressJson(text);
      setMessage({ kind: "ok", text: "Прогресс импортирован. Перезагрузка…" });
      setTimeout(() => location.reload(), 500);
    } catch (err) {
      const text = err instanceof Error ? err.message : "Неизвестная ошибка";
      setMessage({ kind: "err", text });
    }
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <button
        type="button"
        onClick={onExport}
        className="rounded border border-slate-300 bg-white px-3 py-1 hover:bg-slate-50"
      >
        Экспорт прогресса
      </button>
      <button
        type="button"
        onClick={onPickFile}
        className="rounded border border-slate-300 bg-white px-3 py-1 hover:bg-slate-50"
      >
        Импорт прогресса
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={onFileChosen}
      />
      {message && (
        <span className={message.kind === "ok" ? "text-emerald-700" : "text-red-700"}>
          {message.text}
        </span>
      )}
    </div>
  );
}
