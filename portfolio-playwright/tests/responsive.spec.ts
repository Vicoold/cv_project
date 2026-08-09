import { test, expect, type Locator, type Page } from '@playwright/test';
import { HomePage } from './pages/HomePage';
import { localePath } from './utils/locale';

type ElementBox = NonNullable<Awaited<ReturnType<Locator['boundingBox']>>>;

async function requiredBoundingBox(locator: Locator): Promise<ElementBox> {
  await expect(locator).toBeVisible();
  let previousBox: ElementBox | null = null;

  await expect
    .poll(async () => {
      const currentBox = await locator.boundingBox();
      if (currentBox === null) return false;

      const isStable =
        previousBox !== null &&
        Math.abs(currentBox.x - previousBox.x) < 0.5 &&
        Math.abs(currentBox.y - previousBox.y) < 0.5 &&
        Math.abs(currentBox.width - previousBox.width) < 0.5 &&
        Math.abs(currentBox.height - previousBox.height) < 0.5;
      previousBox = currentBox;
      return isStable;
    })
    .toBe(true);

  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  return box as ElementBox;
}

async function expectNoHorizontalOverflow(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    )
    .toBe(true);
}

function boxesOverlap(first: ElementBox, second: ElementBox) {
  return (
    first.x < second.x + second.width &&
    first.x + first.width > second.x &&
    first.y < second.y + second.height &&
    first.y + first.height > second.y
  );
}

test.describe('Responsive Design Tests', () => {
  const viewports = [
    { name: 'Mobile Small', width: 320, height: 568 },
    { name: 'Mobile Medium', width: 375, height: 667 },
    { name: 'Mobile Large', width: 428, height: 926 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop Small', width: 1280, height: 720 },
    { name: 'Desktop Large', width: 1920, height: 1080 },
  ];

  for (const viewport of viewports) {
    test(`page layout fits ${viewport.name} (${viewport.width}x${viewport.height})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      const homePage = new HomePage(page);
      await homePage.navigate();
      await expectNoHorizontalOverflow(page);

      const heroBox = await requiredBoundingBox(homePage.heroSection);
      const introBox = await requiredBoundingBox(homePage.introSection);

      expect(heroBox.x).toBeGreaterThanOrEqual(0);
      expect(heroBox.x + heroBox.width).toBeLessThanOrEqual(viewport.width);
      expect(introBox.x).toBeGreaterThanOrEqual(0);
      expect(introBox.x + introBox.width).toBeLessThanOrEqual(viewport.width);
      expect(introBox.y).toBeGreaterThanOrEqual(heroBox.y + heroBox.height);
    });
  }

  test('no horizontal scroll on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(localePath());
    await expect(page.getByTestId('hero-section')).toBeVisible();

    await expectNoHorizontalOverflow(page);
  });

  test('hero content remains inside the mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const homePage = new HomePage(page);
    await homePage.navigate();

    const heroBox = await requiredBoundingBox(homePage.heroSection);
    const nameBox = await requiredBoundingBox(homePage.heroName);
    const titleBox = await requiredBoundingBox(homePage.heroTitle);
    await requiredBoundingBox(homePage.cvButton);

    for (const contentBox of [nameBox, titleBox]) {
      expect(contentBox.x).toBeGreaterThanOrEqual(heroBox.x);
      expect(contentBox.x + contentBox.width).toBeLessThanOrEqual(heroBox.x + heroBox.width);
      expect(contentBox.width).toBeLessThanOrEqual(375);
    }
    expect(titleBox.y).toBeGreaterThan(nameBox.y);
  });

  test('primary mobile touch targets meet the 44 by 44 pixel minimum', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(localePath());

    const primaryTouchTargets = [
      page.locator('header').getByRole('link', { name: 'Piotr Doliński' }),
      page.getByTestId('mobile-menu-toggle'),
      page.getByRole('button', {
        name: /command menu|menu poleceń|befehlsmenü|menú de comandos|قائمة الأوامر/i,
      }),
      page.getByTestId('hero-cv-button'),
      page.getByTestId('hero-projects-button'),
      page.getByTestId('hero-contact-button'),
      page.getByTestId('hero-github-link'),
      page.getByTestId('hero-linkedin-link'),
      page.getByTestId('hero-email-link'),
    ];

    for (const target of primaryTouchTargets) {
      await expect(target).toBeVisible();
      await expect
        .poll(async () => {
          const box = await target.boundingBox();
          return box !== null && box.width >= 44 && box.height >= 44;
        })
        .toBe(true);

      const box = await requiredBoundingBox(target);
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('primary navigation actions do not overlap on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const homePage = new HomePage(page);
    await homePage.navigate();

    await expect(homePage.cvButton).toBeVisible();
    await expect(homePage.projectsButton).toBeVisible();
    await expect(homePage.contactButton).toBeVisible();

    // Capture all positions in one browser evaluation so a shared entrance
    // animation cannot make boxes from different frames look overlapped.
    const [cvBox, projectsBox, contactBox] = await page
      .locator(
        '[data-testid="hero-cv-button"], [data-testid="hero-projects-button"], [data-testid="hero-contact-button"]',
      )
      .evaluateAll((elements) =>
        elements.map((element) => {
          const { x, y, width, height } = element.getBoundingClientRect();
          return { x, y, width, height };
        }),
      );

    expect([cvBox, projectsBox, contactBox]).not.toContain(undefined);

    expect(boxesOverlap(cvBox, projectsBox)).toBe(false);
    expect(boxesOverlap(projectsBox, contactBox)).toBe(false);
    expect(boxesOverlap(cvBox, contactBox)).toBe(false);
  });
});

test.describe('Layout geometry contracts', () => {
  test('hero content follows the intended vertical order', async ({ page }) => {
    await page.goto(localePath());

    const homePage = new HomePage(page);
    const nameBox = await requiredBoundingBox(homePage.heroName);
    const titleBox = await requiredBoundingBox(homePage.heroTitle);
    const buttonBox = await requiredBoundingBox(homePage.cvButton);

    expect(titleBox.y).toBeGreaterThan(nameBox.y);
    expect(buttonBox.y).toBeGreaterThan(titleBox.y + titleBox.height);
  });

  test('page maintains its layout after viewport resize', async ({ page }) => {
    await page.goto(localePath());

    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect
      .poll(() => page.evaluate(() => window.innerWidth))
      .toBe(1920);
    await expectNoHorizontalOverflow(page);

    await page.setViewportSize({ width: 375, height: 667 });
    await expect
      .poll(() => page.evaluate(() => window.innerWidth))
      .toBe(375);
    await expectNoHorizontalOverflow(page);
    await requiredBoundingBox(page.getByTestId('hero-section'));
    await requiredBoundingBox(page.getByTestId('intro-section'));

    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect
      .poll(() => page.evaluate(() => window.innerWidth))
      .toBe(1920);
    await expectNoHorizontalOverflow(page);
    await requiredBoundingBox(page.getByTestId('hero-section'));
  });
});
