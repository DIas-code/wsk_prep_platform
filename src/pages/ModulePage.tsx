import { Link, useParams } from "react-router-dom";

import { useContent } from "../ui/ContentContext";
import { useAsync } from "../ui/useAsync";
import { DIFFICULTY_RU } from "../ui/ru";

export function ModulePage() {
  const { moduleId = "" } = useParams();
  const { loader } = useContent();

  const state = useAsync(async () => {
    const mod = await loader.loadModule(moduleId);
    const lessons = await loader.listLessons(moduleId);
    const tasks = await loader.listTasks(moduleId);
    return { mod, lessons, tasks };
  }, [moduleId]);

  if (state.status === "loading") return <div className="p-8">Загрузка…</div>;
  if (state.status === "error") {
    return <div className="p-8 text-red-700">Ошибка: {state.error.message}</div>;
  }

  const { mod, lessons, tasks } = state.data;

  return (
    <div className="max-w-3xl mx-auto p-8">
      <Link to="/" className="text-sm text-slate-500 hover:underline">
        ← Все модули
      </Link>
      <h1 className="text-3xl font-semibold mt-2">{mod.title}</h1>
      <p className="text-slate-600 mt-1">{mod.description}</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Уроки</h2>
      <ul className="space-y-2">
        {lessons.map((l) => (
          <li key={l.id}>
            <Link
              to={`/m/${mod.id}/l/${l.id}`}
              className="block rounded border border-slate-200 bg-white p-3 hover:bg-slate-50"
            >
              <div className="font-medium">{l.title}</div>
              <div className="text-sm text-slate-500">
                {l.summary} · ~{l.estimatedMinutes} мин
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">Задания</h2>
      <ul className="space-y-2">
        {tasks.map((t) => (
          <li key={t.id}>
            <Link
              to={`/m/${mod.id}/t/${t.id}`}
              className="block rounded border border-slate-200 bg-white p-3 hover:bg-slate-50"
            >
              <div className="font-medium">{t.title}</div>
              <div className="text-sm text-slate-500">
                {t.summary} · {DIFFICULTY_RU[t.difficulty] ?? t.difficulty}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
