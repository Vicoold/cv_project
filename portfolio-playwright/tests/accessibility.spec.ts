import { test, expect, type Locator, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { HomePage } from './pages/HomePage';
import { TEST_LOCALE, localePath } from './utils/locale';

/**
 * Automated accessibility checks for high-value portfolio contracts.
 * Axe finds a useful subset of accessibility issues; these tests are not a
 * complete WCAG audit or certification.
 */

async function expectMeaningfulImageAlternative(image: Locator) {
  await expect(image).toHaveAttribute('alt');
  const alt = await image.getAttribute('alt');
  expect(alt).not.toBeNull();

  if (alt === '') {
    const isExplicitlyDecorative = await image.evaluate(
      (element) =>
        element.getAttribute('aria-hidden') === 'true' ||
        element.getAttribute('role') === 'presentation' ||
        element.getAttribute('role') === 'none',
    );
    expect(isExplicitlyDecorative).toBe(true);
  } else {
    expect(alt).toMatch(/\S/);
  }
}

async function expectSectionReady(page: Page, testId: string) {
  await expect(page.getByTestId(testId)).toBeVisible();
}

test.describe('Accessibility Tests', () => {
  test('homepage has no automatically detectable accessibility issues', async ({ page }) => {
    await page.goto(localePath());
    await expect(page.getByRole('main')).toBeVisible();

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('hero section is accessible', async ({ page }) => {
    await page.goto(localePath());
    const homePage = new HomePage(page);
    await expect(homePage.heroSection).toBeVisible();

    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('[data-testid="hero-section"]')
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
    await expect(homePage.heroName).toBeVisible();
    await expect(homePage.heroTitle).toBeVisible();
  });

  test('all buttons have accessible names', async ({ page }) => {
    await page.goto(localePath());
    await expect(page.getByRole('main')).toBeVisible();

    const buttons = page.locator('button:visible, a[role="button"]:visible');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);

    for (let index = 0; index < buttonCount; index += 1) {
      await expect(buttons.nth(index)).toHaveAccessibleName(/\S/);
    }
  });

  test('all images have meaningful alternatives or are explicitly decorative', async ({ page }) => {
    for (const route of ['/', '/projects', '/testing', '/about']) {
      await page.goto(localePath(route));
      await expect(page.getByRole('main')).toBeVisible();

      // Wait until every image has settled an alt attribute so engines that paint
      // progressive markup do not assert against a transient empty shell.
      await expect
        .poll(async () => page.locator('img').evaluateAll((nodes) => nodes.every((node) => node.hasAttribute('alt'))))
        .toBe(true);

      const images = page.locator('img');
      const imageCount = await images.count();
      expect(imageCount).toBeGreaterThan(0);

      for (let index = 0; index < imageCount; index += 1) {
        const image = images.nth(index);
        try {
          await expectMeaningfulImageAlternative(image);
        } catch (error) {
          const details = await image.evaluate((element) => ({
            src: element.getAttribute('src') ?? element.getAttribute('srcset') ?? '',
            alt: element.getAttribute('alt'),
            ariaHidden: element.getAttribute('aria-hidden'),
            role: element.getAttribute('role'),
            outerHTML: element.outerHTML.slice(0, 240),
          }));
          throw new Error(
            `Image accessibility contract failed on ${route} (#${index}): ${JSON.stringify(details)}\n${String(error)}`,
          );
        }
      }
    }
  });

  test('all links have accessible names', async ({ page }) => {
    await page.goto(localePath());
    await expect(page.getByRole('main')).toBeVisible();

    const links = page.locator('a:visible');
    const linkCount = await links.count();
    expect(linkCount).toBeGreaterThan(0);

    for (let index = 0; index < linkCount; index += 1) {
      await expect(links.nth(index)).toHaveAccessibleName(/\S/);
    }
  });

  test('keyboard navigation moves focus between interactive elements', async ({ page }) => {
    await page.goto(localePath());
    await expect(page.getByRole('main')).toBeVisible();

    await page.keyboard.press('Tab');
    const firstFocusedElement = await page.evaluateHandle(() => document.activeElement);
    await expect(
      page.locator(':focus:is(a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"]))'),
    ).toBeVisible();

    await page.keyboard.press('Tab');
    const focusMoved = await page.evaluate(
      (previousElement) => document.activeElement !== previousElement,
      firstFocusedElement,
    );

    expect(focusMoved).toBe(true);
    await expect(
      page.locator(':focus:is(a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"]))'),
    ).toBeVisible();
  });

  test('focus is visibly indicated when tabbing', async ({ page }) => {
    await page.goto(localePath());
    await expect(page.getByRole('main')).toBeVisible();
    await page.keyboard.press('Tab');

    const focusIndicator = await page.locator(':focus').evaluate((element) => {
      const styles = window.getComputedStyle(element);
      return {
        outlineStyle: styles.outlineStyle,
        outlineWidth: Number.parseFloat(styles.outlineWidth),
        boxShadow: styles.boxShadow,
      };
    });

    const hasVisibleOutline =
      focusIndicator.outlineStyle !== 'none' && focusIndicator.outlineWidth > 0;
    const hasVisibleBoxShadow = focusIndicator.boxShadow !== 'none';
    expect(hasVisibleOutline || hasVisibleBoxShadow).toBe(true);
  });

  test('page has exactly one primary heading and main landmark', async ({ page }) => {
    await page.goto(localePath());

    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.getByRole('main')).toHaveCount(1);
    await expect(page.locator('html')).toHaveAttribute('lang', TEST_LOCALE);
  });

  test('color contrast has no automatically detectable WCAG AA violations', async ({ page }) => {
    await page.goto(localePath());
    await expect(page.getByRole('main')).toBeVisible();

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .disableRules([
        'region',
        'landmark-one-main',
      ])
      .analyze();

    const contrastViolations = accessibilityScanResults.violations.filter(
      (violation) => violation.id === 'color-contrast',
    );

    expect(contrastViolations).toEqual([]);
  });
});

test.describe('Accessibility - Sections', () => {
  test('skills section has no automatically detectable accessibility issues', async ({ page }) => {
    await page.goto(localePath('/testing'));
    await expectSectionReady(page, 'skills-section');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('[data-testid="skills-section"]')
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('projects section has no automatically detectable accessibility issues', async ({ page }) => {
    await page.goto(localePath('/projects'));
    await expectSectionReady(page, 'projects-section');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('[data-testid="projects-section"]')
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('quality mindset section has no automatically detectable accessibility issues', async ({ page }) => {
    await page.goto(localePath('/about'));
    await expectSectionReady(page, 'quality-section');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('[data-testid="quality-section"]')
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('contact section has no automatically detectable accessibility issues', async ({ page }) => {
    await page.goto(localePath('/about'));
    await expectSectionReady(page, 'contact-section');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('[data-testid="contact-section"]')
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  for (const route of ['/testing', '/projects', '/about']) {
    test(`${route} page has no automatically detectable accessibility issues`, async ({ page }) => {
      await page.goto(localePath(route));
      await expect(page.getByRole('main')).toBeVisible();

      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  }
});
