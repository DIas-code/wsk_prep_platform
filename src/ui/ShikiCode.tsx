import { useEffect, useState } from "react";
import { createHighlighter, type Highlighter } from "shiki";

const LANGS = [
  "csharp",
  "xml",
  "sql",
  "python",
  "json",
  "bash",
  "typescript",
  "javascript",
  "tsx",
] as const;

const THEME = "github-light";

type SupportedLang = (typeof LANGS)[number] | "text";

let singleton: Promise<Highlighter> | null = null;

function getHighlighterOnce(): Promise<Highlighter> {
  if (!singleton) {
    singleton = createHighlighter({ themes: [THEME], langs: [...LANGS] });
  }
  return singleton;
}

function normalizeLang(language: string | undefined): SupportedLang {
  if (!language) return "text";
  // XAML is not a built-in Shiki grammar; highlight it as XML for a decent approximation.
  if (language === "xaml") return "xml";
  return (LANGS as readonly string[]).includes(language) ? (language as SupportedLang) : "text";
}

export function ShikiCode({ code, language }: { code: string; language?: string }) {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const lang = normalizeLang(language);
    getHighlighterOnce().then(
      (h) => {
        if (cancelled) return;
        try {
          setHtml(h.codeToHtml(code, { lang, theme: THEME }));
        } catch {
          setHtml(null);
        }
      },
      () => {
        if (!cancelled) setHtml(null);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [code, language]);

  if (html) {
    return <div className="my-3" dangerouslySetInnerHTML={{ __html: html }} />;
  }
  return (
    <pre className="shiki bg-slate-100 text-slate-800 my-3">
      <code>{code}</code>
    </pre>
  );
}
