import type { ReactNode } from "react";
import { Link } from "react-router-dom";

export function ProgressBar({
  value,
  className = "",
  tone = "brand",
  size = "md",
}: {
  value: number; // 0..100
  className?: string;
  tone?: "brand" | "emerald" | "amber";
  size?: "sm" | "md";
}) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  const toneClass =
    tone === "emerald"
      ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
      : tone === "amber"
        ? "bg-gradient-to-r from-amber-400 to-amber-600"
        : "bg-gradient-to-r from-brand-400 to-brand-600";
  const h = size === "sm" ? "h-1.5" : "h-2";
  return (
    <div
      role="progressbar"
      aria-valuenow={v}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`${h} w-full bg-slate-200/80 rounded-full overflow-hidden ${className}`}
    >
      <div
        className={`h-full ${toneClass} transition-[width] duration-500 ease-out`}
        style={{ width: `${v}%` }}
      />
    </div>
  );
}

export function Badge({
  children,
  tone = "slate",
  className = "",
}: {
  children: ReactNode;
  tone?: "slate" | "brand" | "emerald" | "amber" | "rose" | "violet";
  className?: string;
}) {
  const map: Record<string, string> = {
    slate: "bg-slate-100 text-slate-700 ring-slate-200",
    brand: "bg-brand-50 text-brand-700 ring-brand-200",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    rose: "bg-rose-50 text-rose-700 ring-rose-200",
    violet: "bg-violet-50 text-violet-700 ring-violet-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${map[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function PageHeader({
  title,
  eyebrow,
  description,
  actions,
}: {
  title: ReactNode;
  eyebrow?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && (
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-600">
            {eyebrow}
          </div>
        )}
        <h1 className="mt-1 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-slate-600">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function BackLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-700 transition-colors focus-ring rounded"
    >
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-4 w-4"
        aria-hidden
      >
        <path
          fillRule="evenodd"
          d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
      {children}
    </Link>
  );
}

export function LoadingState({ label = "Загрузка…" }: { label?: string }) {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16 flex items-center justify-center text-slate-500">
      <span className="inline-flex items-center gap-3">
        <span className="h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
        <span className="h-2 w-2 rounded-full bg-brand-400 animate-pulse [animation-delay:120ms]" />
        <span className="h-2 w-2 rounded-full bg-brand-300 animate-pulse [animation-delay:240ms]" />
        <span className="ml-2">{label}</span>
      </span>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-800">
        <div className="font-semibold">Ошибка загрузки</div>
        <div className="mt-1 text-sm break-words">{message}</div>
      </div>
    </div>
  );
}
