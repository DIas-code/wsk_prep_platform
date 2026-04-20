import { useEffect, useState } from "react";

export type AsyncState<T> =
  | { status: "loading" }
  | { status: "ready"; data: T }
  | { status: "error"; error: Error };

/**
 * Minimal async hook. Re-runs whenever the `deps` change. Keeps the
 * previous value during re-fetch only if the caller wants it — we keep
 * the surface small on purpose.
 */
export function useAsync<T>(fn: () => Promise<T>, deps: readonly unknown[]): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    fn().then(
      (data) => {
        if (!cancelled) setState({ status: "ready", data });
      },
      (err: unknown) => {
        if (!cancelled) {
          setState({ status: "error", error: err instanceof Error ? err : new Error(String(err)) });
        }
      },
    );
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
