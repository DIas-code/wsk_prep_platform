import { defineConfig } from "@playwright/test";

/**
 * Minimal Playwright config for the single smoke E2E.
 *
 * Uses Vite's preview server on port 4173 — build once (`npm run build`),
 * then Playwright spawns `npm run preview`. Run locally with:
 *
 *   npm run build && npm run test:e2e
 *
 * First time: `npx playwright install chromium` to download the browser.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "line",
  use: {
    baseURL: "http://localhost:4173",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run preview -- --port 4173 --strictPort",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
    stdout: "ignore",
    stderr: "pipe",
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
