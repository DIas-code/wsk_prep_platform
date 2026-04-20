import { useEffect, useState } from "react";

export interface CountdownState {
  /** Milliseconds remaining. Clamped to 0 when expired. */
  remainingMs: number;
  /** True once `remainingMs` hits 0. */
  expired: boolean;
}

/**
 * Tick every second until the deadline passes. Pass `startedAt` = undefined when
 * the timer hasn't been started yet — the hook then returns a "not started" idle
 * state (`remainingMs === limitMinutes * 60_000`, `expired === false`).
 *
 * The hook relies on wall-clock time (`Date.now`), so reloading the page or
 * switching tabs does not reset the timer — the student gets an honest clock.
 */
export function useCountdown(
  startedAt: string | undefined,
  limitMinutes: number | undefined,
): CountdownState {
  const limitMs = (limitMinutes ?? 0) * 60_000;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!startedAt || !limitMs) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [startedAt, limitMs]);

  if (!limitMs) return { remainingMs: 0, expired: false };
  if (!startedAt) return { remainingMs: limitMs, expired: false };

  const started = Date.parse(startedAt);
  if (Number.isNaN(started)) return { remainingMs: limitMs, expired: false };

  const deadline = started + limitMs;
  const remainingMs = Math.max(0, deadline - now);
  return { remainingMs, expired: remainingMs === 0 };
}

/** `mm:ss` or `h:mm:ss` for display. */
export function formatCountdown(ms: number): string {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}
