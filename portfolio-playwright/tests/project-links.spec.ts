import { stat } from 'node:fs/promises';
import { expect, test, type Locator, type Page } from '@playwright/test';

const PUBLIC_CODE_URL =
  'https://github.com/Vicoold/cv_project/tree/master/portfolio-playwright';
const PUBLIC_DEMO_URL =
  'https://github.com/Vicoold/cv_project/actions/workflows/portfolio-playwright.yml';
const CV_FILENAME = 'Piotr_Dolinski_Senior_SDET_QA_Lead_CV.pdf';

async function expectSafeExternalLink(link: Locator, href: string) {
  await expect(link).toBeVisible();
  await expect(link).toHaveAccessibleName(/\S/);
  await expect(link).toHaveAttribute('href', href);
  await expect(link).toHaveAttribute('target', '_blank');
  await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
}

function projectCard(page: Page, slug: string) {
  return page.locator(
    `[data-testid="project-card"][data-project-slug="${slug}"]`,
  );
}

function boxesOverlap(
  first: { x: number; y: number; width: number; height: number },
  second: { x: number; y: number; width: number; height: number },
) {
  return (
    first.x < second.x + second.width &&
    first.x + first.width > second.x &&
    first.y < second.y + second.height &&
    first.y + first.height > second.y
  );
}

test.describe('Public project links', () => {
  test('test-suite card exposes independent safe Code and Demo links', async ({ page }) => {
    await page.goto('/en/projects');

    const suiteCard = projectCard(page, 'demo-testing-suite');
    await expect(suiteCard).toBeVisible();
    await expectSafeExternalLink(
      suiteCard.getByTestId('project-code-link'),
      PUBLIC_CODE_URL,
    );
    await expectSafeExternalLink(
      suiteCard.getByTestId('project-demo-link'),
      PUBLIC_DEMO_URL,
    );
    await expect(suiteCard.getByTestId('private-code-button')).toHaveCount(0);
    await expect(suiteCard.getByTestId('project-details-link')).toBeVisible();
  });

  test('private cards and details keep private Code without public links', async ({ page }) => {
    await page.goto('/en/projects');

    for (const slug of ['bug-the-gathering', 'demo-website']) {
      const card = projectCard(page, slug);
      await expect(card).toBeVisible();
      await expect(card.getByTestId('private-code-button')).toBeVisible();
      await expect(card.getByTestId('project-code-link')).toHaveCount(0);
      await expect(card.getByTestId('project-demo-link')).toHaveCount(0);
      await expect(card.locator(`a[href="${PUBLIC_CODE_URL}"]`)).toHaveCount(0);
      await expect(card.locator(`a[href="${PUBLIC_DEMO_URL}"]`)).toHaveCount(0);

      await page.goto(`/en/projects/${slug}`);
      await expect(page.getByTestId('private-code-button')).toBeVisible();
      await expect(page.getByTestId('project-code-link')).toHaveCount(0);
      await expect(page.getByTestId('project-demo-link')).toHaveCount(0);
      await page.goto('/en/projects');
    }
  });

  test('test-suite detail exposes independent safe Code and Demo links', async ({ page }) => {
    await page.goto('/en/projects/demo-testing-suite');

    await expectSafeExternalLink(page.getByTestId('project-code-link'), PUBLIC_CODE_URL);
    await expectSafeExternalLink(page.getByTestId('project-demo-link'), PUBLIC_DEMO_URL);
    await expect(page.getByTestId('private-code-button')).toHaveCount(0);
  });

  const localizedDetails = [
    {
      locale: 'en',
      title: 'Demo Testing Suite',
      about: 'About Project',
      features: 'Key Features',
      challenges: 'Technical Challenges',
      code: 'Code',
      demo: 'View Demo',
    },
    {
      locale: 'pl',
      title: 'Demo suite testów',
      about: 'O projekcie',
      features: 'Kluczowe funkcjonalności',
      challenges: 'Wyzwania techniczne',
      code: 'Kod',
      demo: 'Zobacz demo',
    },
    {
      locale: 'de',
      title: 'Demo Testing Suite',
      about: 'Über das Projekt',
      features: 'Hauptmerkmale',
      challenges: 'Technische Herausforderungen',
      code: 'Code',
      demo: 'Demo ansehen',
    },
    {
      locale: 'es',
      title: 'Suite de testing demo',
      about: 'Sobre el proyecto',
      features: 'Características principales',
      challenges: 'Desafíos técnicos',
      code: 'Código',
      demo: 'Ver demo',
    },
    {
      locale: 'ar',
      title: 'حزمة اختبار تجريبية',
      about: 'عن المشروع',
      features: 'الميزات الرئيسية',
      challenges: 'التحديات التقنية',
      code: 'الكود',
      demo: 'عرض تجريبي',
    },
  ] as const;

  for (const copy of localizedDetails) {
    test(`${copy.locale} detail renders localized copy and public labels`, async ({ page }) => {
      await page.goto(`/${copy.locale}/projects/demo-testing-suite`);

      await expect(page.getByTestId('project-title')).toHaveText(copy.title);
      const main = page.locator('main');
      await expect(main).not.toContainText('projects.items.demoTestingSuite.');

      const aboutSection = main.getByRole('heading', { name: copy.about }).locator('..');
      await expect(aboutSection.locator('p')).not.toBeEmpty();

      const featuresSection = main.getByRole('heading', { name: copy.features }).locator('..');
      expect(await featuresSection.locator('li').count()).toBeGreaterThan(0);

      const challengesSection = main
        .getByRole('heading', { name: copy.challenges })
        .locator('..');
      await expect(challengesSection.locator('p')).not.toBeEmpty();

      await expect(page.getByTestId('project-code-link')).toHaveAccessibleName(copy.code);
      await expect(page.getByTestId('project-demo-link')).toHaveAccessibleName(copy.demo);
    });
  }

  test('three test-suite actions remain usable in a narrow Arabic RTL card', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/ar/projects');

    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    const card = projectCard(page, 'demo-testing-suite');
    const actions = [
      card.getByTestId('project-code-link'),
      card.getByTestId('project-demo-link'),
      card.getByTestId('project-details-link'),
    ];

    const cardBox = await card.boundingBox();
    expect(cardBox).not.toBeNull();
    const boxes = [];
    for (const action of actions) {
      await expect(action).toBeVisible();
      const box = await action.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(cardBox!.x);
      expect(box!.x + box!.width).toBeLessThanOrEqual(cardBox!.x + cardBox!.width);
      boxes.push(box!);
    }

    for (let first = 0; first < boxes.length; first += 1) {
      for (let second = first + 1; second < boxes.length; second += 1) {
        expect(boxesOverlap(boxes[first], boxes[second])).toBe(false);
      }
    }
  });
});

test.describe('Testing showcase', () => {
  test('Testing page exposes safe public Code and Demo links', async ({ page }) => {
    await page.goto('/en/testing');
    await expectSafeExternalLink(page.getByTestId('testing-code-link'), PUBLIC_CODE_URL);
    await expectSafeExternalLink(page.getByTestId('testing-demo-link'), PUBLIC_DEMO_URL);
  });

  test('every showcased image receives a successful response', async ({ page }) => {
    await page.goto('/en/testing');
    const images = page.getByTestId('testing-section').locator(
      'img[alt="Tests Screenshot"], img[alt="Playwright HTML Test Report"]',
    );
    expect(await images.count()).toBeGreaterThan(0);

    for (let index = 0; index < (await images.count()); index += 1) {
      const image = images.nth(index);
      await expect
        .poll(() => image.evaluate((element) => (element as HTMLImageElement).complete))
        .toBe(true);
      const src = await image.evaluate((element) => (element as HTMLImageElement).currentSrc);
      expect(src).not.toBeNull();
      const response = await page.request.get(src!);
      expect(response.status()).toBeGreaterThanOrEqual(200);
      expect(response.status()).toBeLessThan(400);
      expect(await image.evaluate((element) => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    }
  });
});

test.describe('CV download', () => {
  test('command menu downloads the current non-empty recruiter-friendly PDF', async ({ page }) => {
    await page.goto('/en');
    await page.keyboard.press('ControlOrMeta+k');

    const downloadAction = page.getByTestId('download-cv-action');
    await expect(downloadAction).toBeVisible();
    const downloadPromise = page.waitForEvent('download');
    await downloadAction.click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe(CV_FILENAME);
    const downloadedPath = await download.path();
    expect(downloadedPath).not.toBeNull();
    const fileStat = await stat(downloadedPath!);
    expect(fileStat.size).toBeGreaterThan(1024);

    const header = Buffer.alloc(5);
    const { open } = await import('node:fs/promises');
    const handle = await open(downloadedPath!, 'r');
    try {
      await handle.read(header, 0, 5, 0);
    } finally {
      await handle.close();
    }
    expect(header.toString('utf8')).toBe('%PDF-');
  });
});
