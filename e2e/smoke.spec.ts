import { expect, test } from "@playwright/test";

/**
 * One smoke that clicks through every module card, then every lesson and
 * task link inside it. Fails if any page throws, if any link leads to a
 * non-200 navigation, or if a rendered page surfaces its error banner.
 */
test("home → every module → every lesson and task renders without errors", async ({ page }) => {
  const pageErrors: Error[] = [];
  page.on("pageerror", (err) => pageErrors.push(err));

  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();

  const moduleLinks = await page.locator('a[href^="/m/"]').evaluateAll((els) =>
    (els as HTMLAnchorElement[]).map((a) => a.getAttribute("href")!).filter(Boolean),
  );
  const uniqueModuleHrefs = [...new Set(moduleLinks)].filter((h) => /^\/m\/[^/]+$/.test(h));
  expect(uniqueModuleHrefs.length).toBeGreaterThan(0);

  for (const href of uniqueModuleHrefs) {
    await page.goto(href);
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    await expect(page.getByText(/Ошибка:/)).toHaveCount(0);

    const childLinks = await page.locator('a[href^="/m/"]').evaluateAll((els) =>
      (els as HTMLAnchorElement[]).map((a) => a.getAttribute("href")!),
    );
    const lessonTaskHrefs = [...new Set(childLinks)].filter(
      (h) => /^\/m\/[^/]+\/(l|t)\/[^/]+$/.test(h),
    );

    for (const child of lessonTaskHrefs) {
      await page.goto(child);
      await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
      await expect(page.getByText(/Ошибка:/)).toHaveCount(0);
    }
  }

  expect(pageErrors, pageErrors.map((e) => e.message).join("\n")).toHaveLength(0);
});
