import { test, expect } from '@playwright/test';
import { localePath } from './utils/locale';

/**
 * Regression coverage for two user-visible behaviors:
 *  - Professional Journey rows share one date column (single years and
 *    year ranges must not shift the role column).
 *  - the bug-hunt flashlight is a real visible layer that follows the
 *    pointer (mouse and touch), not just a hidden-bug mask.
 */
test.describe('Timeline alignment', () => {
  test('single years and year ranges share one column', async ({ page }) => {
    await page.goto(localePath('/about'));

    const years = page.getByTestId('timeline-year');
    await expect(years.first()).toBeVisible();
    const yearX = await years.evaluateAll((els) =>
      els.map((el) => Math.round(el.getBoundingClientRect().x)),
    );

    const roles = page.getByTestId('timeline-role');
    const roleX = await roles.evaluateAll((els) =>
      els.map((el) => Math.round(el.getBoundingClientRect().x)),
    );

    expect(yearX.length).toBeGreaterThan(1);
    expect(new Set(yearX).size).toBe(1);
    expect(new Set(roleX).size).toBe(1);
  });
});

test.describe('Flashlight', () => {
  test('visible flashlight layer tracks the mouse', async ({ page }) => {
    await page.goto(localePath('/about'));

    const glow = page.getByTestId('flashlight-glow');
    await expect(glow).toBeAttached();

    // Coordinates must sit inside every project viewport (incl. 390px phones).
    await page.mouse.move(100, 300, { steps: 5 });
    await expect
      .poll(() => page.evaluate(() => document.documentElement.style.getPropertyValue('--mouse-x')))
      .toBe('100px');

    const background = await glow.evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(background).toContain('100px');
    expect(background).toContain('300px');
  });

  test('tap moves the flashlight on touch devices', async ({ page }, testInfo) => {
    test.skip(!testInfo.project.use.hasTouch, 'requires a touch context');

    await page.goto(localePath('/about'));
    await page.touchscreen.tap(300, 500);
    await expect
      .poll(() => page.evaluate(() => document.documentElement.style.getPropertyValue('--mouse-x')))
      .toBe('300px');
  });
});
