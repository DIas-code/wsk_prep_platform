import { createContext, useContext, type ReactNode } from "react";

import type { ModuleRegistry } from "../types";
import type { ViteContentLoader } from "../content/ViteContentLoader";

interface ContentContextValue {
  loader: ViteContentLoader;
  registry: ModuleRegistry;
}

const ContentContext = createContext<ContentContextValue | null>(null);

export function ContentProvider({
  loader,
  children,
}: {
  loader: ViteContentLoader;
  children: ReactNode;
}) {
  const registry = loader.getRegistry();
  return (
    <ContentContext.Provider value={{ loader, registry }}>{children}</ContentContext.Provider>
  );
}

export function useContent(): ContentContextValue {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error("useContent must be used inside <ContentProvider>");
  return ctx;
}
