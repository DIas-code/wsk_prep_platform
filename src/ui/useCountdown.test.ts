import { describe, expect, it } from "vitest";

import { formatCountdown } from "./useCountdown";

describe("formatCountdown", () => {
  it("returns mm:ss under an hour", () => {
    expect(formatCountdown(0)).toBe("00:00");
    expect(formatCountdown(5 * 1000)).toBe("00:05");
    expect(formatCountdown(65 * 1000)).toBe("01:05");
    expect(formatCountdown(59 * 60 * 1000 + 59 * 1000)).toBe("59:59");
  });

  it("returns h:mm:ss at or above an hour", () => {
    expect(formatCountdown(60 * 60 * 1000)).toBe("1:00:00");
    expect(formatCountdown(5 * 60 * 60 * 1000 + 3 * 60 * 1000 + 7 * 1000)).toBe("5:03:07");
  });

  it("floors sub-second fractions", () => {
    expect(formatCountdown(999)).toBe("00:00");
    expect(formatCountdown(1999)).toBe("00:01");
  });
});
