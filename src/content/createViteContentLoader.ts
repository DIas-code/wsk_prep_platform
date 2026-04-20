import { ViteContentLoader } from "./ViteContentLoader";

/**
 * Vite entry point for the content loader. Uses `import.meta.glob` to
 * eagerly bundle every content JSON file, unwraps the `default` export so
 * the loader sees raw objects, and hands the map to `ViteContentLoader`.
 */
export function createViteContentLoader(): ViteContentLoader {
  const modules = import.meta.glob("/content/**/*.json", { eager: true }) as Record<
    string,
    { default: unknown }
  >;
  const files: Record<string, unknown> = {};
  for (const [path, mod] of Object.entries(modules)) {
    files[path] = mod.default ?? mod;
  }
  return new ViteContentLoader(files);
}
