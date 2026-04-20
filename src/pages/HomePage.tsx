import { Link } from "react-router-dom";

import { useContent } from "../ui/ContentContext";
import { ProgressBackup } from "../ui/ProgressBackup";
import { useAsync } from "../ui/useAsync";
import { pluralize } from "../ui/ru";

export function HomePage() {
  const { loader, registry } = useContent();
  const state = useAsync(
    () => Promise.all(registry.modules.map((id) => loader.loadModule(id))),
    [registry],
  );

  if (state.status === "loading") return <div className="p-8">Загрузка…</div>;
  if (state.status === "error") {
    return <div className="p-8 text-red-700">Ошибка: {state.error.message}</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="flex items-start justify-between gap-4 mb-2">
        <h1 className="text-3xl font-semibold">WorldSkills: IT Software Solutions</h1>
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-sm text-blue-600 hover:underline">
            Прогресс →
          </Link>
          <ProgressBackup />
        </div>
      </div>
      <p className="text-slate-600 mb-8">Выберите модуль, чтобы начать.</p>
      <div className="grid gap-4 md:grid-cols-2">
        {state.data.map((mod) => {
          const nLessons = mod.lessonOrder.length;
          const nTasks = mod.taskIds.length;
          return (
            <Link
              key={mod.id}
              to={`/m/${mod.id}`}
              className="block rounded-xl border border-slate-200 bg-white p-5 hover:shadow-md transition"
              style={mod.accent ? { borderLeft: `4px solid ${mod.accent}` } : undefined}
            >
              <div className="text-lg font-semibold">{mod.title}</div>
              <p className="text-slate-600 mt-1 text-sm">{mod.description}</p>
              <div className="mt-3 text-xs text-slate-500">
                {nLessons} {pluralize(nLessons, "урок", "урока", "уроков")} ·{" "}
                {nTasks} {pluralize(nTasks, "задание", "задания", "заданий")}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
