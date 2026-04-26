import { NavLink, Link } from "react-router-dom";
import type { ReactNode } from "react";

import { ProgressBackup } from "./ProgressBackup";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 fade-up">{children}</main>
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2 group focus-ring rounded-md">
          <Logo />
          <span className="font-semibold tracking-tight text-slate-900 group-hover:text-brand-700 transition-colors">
            WorldSkills
            <span className="text-slate-400 font-normal hidden sm:inline">
              {" · "}IT Software Solutions
            </span>
          </span>
        </Link>

        <nav className="ml-auto flex items-center gap-1 text-sm">
          <NavItem to="/" end>
            Модули
          </NavItem>
          <NavItem to="/dashboard">Прогресс</NavItem>
          <NavItem to="/cheatsheet">Cheat Sheet</NavItem>
        </nav>

        <div className="hidden md:block">
          <ProgressBackup />
        </div>
      </div>
    </header>
  );
}

function NavItem({
  to,
  end,
  children,
}: {
  to: string;
  end?: boolean;
  children: ReactNode;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          "px-3 py-1.5 rounded-md font-medium transition focus-ring",
          isActive
            ? "bg-brand-50 text-brand-700"
            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
        ].join(" ")
      }
    >
      {children}
    </NavLink>
  );
}

function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200/70 bg-white/40">
      <div className="max-w-6xl mx-auto px-6 py-6 text-xs text-slate-500 flex flex-wrap items-center gap-x-4 gap-y-1">
        <span>© {new Date().getFullYear()} WorldSkills Training Platform</span>
        <span className="text-slate-300">·</span>
        <span>Прогресс хранится локально в браузере</span>
        <span className="text-slate-300">·</span>
        <Link to="/cheatsheet" className="hover:text-brand-600">
          Шпаргалка
        </Link>
      </div>
    </footer>
  );
}

function Logo() {
  return (
    <span
      aria-hidden
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-soft"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
      >
        <path d="M4 7l8-4 8 4-8 4-8-4z" />
        <path d="M4 12l8 4 8-4" />
        <path d="M4 17l8 4 8-4" />
      </svg>
    </span>
  );
}

export function PageContainer({
  children,
  size = "default",
}: {
  children: ReactNode;
  size?: "default" | "wide" | "narrow";
}) {
  const max =
    size === "wide" ? "max-w-6xl" : size === "narrow" ? "max-w-3xl" : "max-w-5xl";
  return <div className={`${max} mx-auto px-6 py-8 sm:py-10`}>{children}</div>;
}
