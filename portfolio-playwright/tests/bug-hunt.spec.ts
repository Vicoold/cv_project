import { test, expect, type Page } from '@playwright/test';
import { HomePage } from './pages/HomePage';
import { TEST_LOCALE, localePath } from './utils/locale';
import { clickInViewport, openMobileMenuIfNeeded } from './utils/navigation';

const BUG_6_MESSAGES: Record<string, string> = {
  en: 'Test finished successfully, bug found! 🐛',
  pl: 'Test zakończony sukcesem, znaleziono buga! 🐛',
  de: 'Test erfolgreich beendet, Bug gefunden! 🐛',
  es: '¡Prueba terminada con éxito, error encontrado! 🐛',
  ar: 'انتهى الاختبار بنجاح، تم العثور على خطأ! 🐛',
};

const BUG_9_MESSAGES: Record<string, string> = {
  en: 'Bright light!',
  pl: 'Jasne światło!',
  de: 'Helles Licht!',
  es: 'Luz brillante!',
  ar: 'ضوء ساطع',
};

const BUG_10_MESSAGES: Record<string, string> = {
  en: "Can't hide anything from you",
  pl: 'Nic się przed tobą nie ukryje',
  de: 'Vor dir kann man nichts verstecken',
  es: 'No se te puede esconder nada',
  ar: 'لا يمكن إخفاء أي شيء عنك',
};

const COMPLETED_LABELS: Record<string, string> = {
  en: 'Manual Tests Passed',
  pl: 'Testy manualne zaliczone',
  de: 'Manuelle Tests bestanden',
  es: 'Pruebas manuales aprobadas',
  ar: 'تم اجتياز الاختبارات اليدوية',
};

const SKIP_TEST_NAMES: Record<string, string> = {
  en: 'Skip tests',
  pl: 'Pomiń testy',
  de: 'Tests überspringen',
  es: 'Omitir pruebas',
  ar: 'تخطي الاختبارات',
};

/**
 * Spotlight-masked easter eggs are intentionally hard to see. force:true is used
 * only here so the click is not blocked by the product mask (not to hide a broken control).
 */
async function clickHiddenBug(page: Page, id: number) {
  const host = page.getByTestId(`hidden-bug-${id}`);
  const target = page.getByTestId(`hidden-bug-target-${id}`);
  await expect(host).toBeAttached();
  // Spotlight mask intentionally hides the control from normal pointer hit-testing.
  await target.scrollIntoViewIfNeeded();
  await target.evaluate((element) => {
    (element as HTMLElement).click();
  });
}

/**
 * Bug Hunt Feature Tests
 *
 * Verifies the portfolio easter-egg hunt: discovery interactions, persistence,
 * spotlight-hidden bugs, completion state, and terminal authenticity.
 * App bug IDs: 1, 3, 4, 5, 6, 9, 10 (seven total; there is no id 2 or 7).
 */
test.describe('Bug Hunt Feature', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.navigate();

    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload();
  });

  test('Bug 1: Found via Command Menu (Release the Bug)', async ({ page }) => {
    const isMac = process.platform === 'darwin';
    const modifier = isMac ? 'Meta' : 'Control';
    await page.keyboard.press(`${modifier}+k`);

    const releaseBugItem = page.getByTestId('release-bug-item');
    await expect(releaseBugItem).toBeVisible();
    await releaseBugItem.click();

    const overlay = page.getByTestId('bug-hunt-overlay');
    await expect(overlay).toBeVisible();

    const message = page.getByTestId('bug-hunt-message');
    await expect(message).toContainText(/reached my lair/i);

    const counterCount = page.getByTestId('bug-found-count');
    await expect(counterCount).toContainText('1 / 7');
  });

  test('Bug 3: Found via Logo rapid clicks', async ({ page, isMobile }) => {
    const logo = page.getByRole('link', { name: /Piotr Doliński/i });
    await expect(logo).toBeVisible();

    for (let i = 0; i < 5; i++) {
      if (isMobile) {
        await logo.tap();
      } else {
        await logo.click({ delay: 50 });
      }
    }

    const overlay = page.getByTestId('bug-hunt-overlay');
    await expect(overlay).toBeVisible({ timeout: 20000 });

    const message = page.getByTestId('bug-hunt-message');
    await expect(message).toContainText(/Logo is for clicking/i);
  });

  test('Bug 4: Found via clicking "Code" on private projects', async ({ page }) => {
    await page.goto(localePath('/projects'));

    const bugTheGatheringCard = page.locator(
      '[data-testid="project-card"][data-project-slug="bug-the-gathering"]',
    );
    const codeButton = bugTheGatheringCard.getByTestId('private-code-button');
    await expect(codeButton).toBeVisible();
    await clickInViewport(codeButton);

    const overlay = page.getByTestId('bug-hunt-overlay');
    await expect(overlay).toBeVisible();

    const message = page.getByTestId('bug-hunt-message');
    await expect(message).toContainText(/shouldn't be clicking this/i);
  });

  test('Bug 4 button hangs loose for a moment after click', async ({ page }) => {
    await page.goto(localePath('/projects'));

    const codeButton = page
      .locator('[data-testid="project-card"][data-project-slug="bug-the-gathering"]')
      .getByTestId('private-code-button');
    await expect(codeButton).toBeVisible();
    await clickInViewport(codeButton);

    const transformOf = () => codeButton.evaluate((el) => getComputedStyle(el).transform);
    await expect.poll(transformOf, { timeout: 5000 }).not.toBe('none');
    await expect.poll(transformOf, { timeout: 8000 }).toBe('none');
  });

  test('Bug 5: Found via multiple language switches', async ({ page, isMobile }) => {
    const switchLang = async (lang: string) => {
      const langCode =
        lang.toLowerCase() === 'polski' ? 'pl' : lang.toLowerCase() === 'deutsch' ? 'de' : 'en';
      await openMobileMenuIfNeeded(page, isMobile);
      const switcher = page.getByTestId('language-switcher').last();
      await switcher.click();
      await page.getByTestId(`language-option-${langCode}`).click();
      await expect(page).toHaveURL(new RegExp(`/${langCode}(?:/|$)`));
    };

    await switchLang('Polski');
    await switchLang('Deutsch');
    await switchLang('English');

    const overlay = page.getByTestId('bug-hunt-overlay');
    await expect(overlay).toBeVisible({ timeout: 20000 });

    const message = page.getByTestId('bug-hunt-message');
    await expect(message).toContainText(/French/i, { timeout: 20000 });
  });

  test('Bug 9: Found via spotlight-hidden bug on the contact CV card', async ({ page }) => {
    await page.goto(localePath('/about#contact'));
    await expect(page.getByTestId('contact-section')).toBeVisible();

    await clickHiddenBug(page, 9);

    await expect(page.getByTestId('bug-hunt-overlay')).toBeVisible();
    await expect(page.getByTestId('bug-hunt-message')).toContainText(BUG_9_MESSAGES[TEST_LOCALE]);
    await expect(page.getByTestId('bug-found-count')).toContainText('1 / 7');
  });

  test('Bug 10: Found via spotlight-hidden bug on the Bug the Gathering detail page', async ({
    page,
  }) => {
    await page.goto(localePath('/projects/bug-the-gathering'));
    await expect(page.getByTestId('project-title')).toBeVisible();

    await clickHiddenBug(page, 10);

    await expect(page.getByTestId('bug-hunt-overlay')).toBeVisible();
    await expect(page.getByTestId('bug-hunt-message')).toContainText(BUG_10_MESSAGES[TEST_LOCALE]);
    await expect(page.getByTestId('bug-found-count')).toContainText('1 / 7');
  });

  test('Persistence: Found bugs should persist after page reload', async ({ page }) => {
    const isMac = process.platform === 'darwin';
    const modifier = isMac ? 'Meta' : 'Control';
    await page.keyboard.press(`${modifier}+k`);
    await page.getByTestId('release-bug-item').click();

    const counterCount = page.getByTestId('bug-found-count');
    await expect(counterCount).toContainText('1 / 7');

    await page.reload();

    await expect(page.getByTestId('bug-found-count')).toContainText('1 / 7');
  });

  test('finding the last remaining bug completes the hunt at 7/7', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('bug-hunt-stats', JSON.stringify([1, 3, 4, 5, 6, 9]));
    });
    await page.reload();
    await expect(page.getByTestId('bug-found-count')).toContainText('6 / 7');

    await page.goto(localePath('/projects/bug-the-gathering'));
    await clickHiddenBug(page, 10);

    await expect(page.getByTestId('bug-hunt-overlay')).toBeVisible();
    await expect(page.getByTestId('bug-found-count')).toContainText('7 / 7');
    await expect(page.getByTestId('bug-hunt-counter')).toContainText(COMPLETED_LABELS[TEST_LOCALE]);
  });
});

/**
 * Terminal tests install a fake clock before the first navigation and must not
 * share the home-page beforeEach (which races WebKit when time is mocked).
 */
test.describe('Bug Hunt Terminal Animation', () => {
  test('Bug 6: Finding bug in terminal (Testing page)', async ({ page }) => {
    test.setTimeout(90_000);

    await page.addInitScript(() => {
      localStorage.clear();
      Math.random = () => 0;
    });
    await page.clock.install();
    await page.goto(localePath('/testing'));

    const terminal = page.getByTestId('terminal-content');
    await expect(terminal).toContainText('Running Playwright checks using parallel workers');

    await page.clock.runFor(8_500);

    await expect(terminal).toContainText(/meta\.spec\.ts.*test results are not hardcoded/i);
    await expect(terminal).not.toContainText(/failed\s*\d+\s*\[chromium\]\s*›\s*meta\.spec\.ts/i);
    await expect(terminal).toContainText(/easter-egg\.spec\.ts.*successfully viewed the test animation/i);
    await expect(terminal).not.toContainText(/ok\s*\d+\s*\[human\]\s*›\s*easter-egg\.spec\.ts/i);
    await expect(page.getByTestId('bug-hunt-overlay')).toBeVisible();
    await expect(page.getByTestId('bug-hunt-message')).toContainText(BUG_6_MESSAGES[TEST_LOCALE]);
    await expect(page.getByTestId('bug-found-count')).toContainText('1 / 7');
  });

  test('terminal fast-forward does not present fake lines as repository test numbers', async ({
    page,
  }) => {
    test.setTimeout(90_000);

    await page.addInitScript(() => {
      localStorage.clear();
      Math.random = () => 0;
    });
    await page.clock.install();
    await page.goto(localePath('/testing'));

    const terminal = page.getByTestId('terminal-content');
    await expect(terminal).toContainText('Running Playwright checks using parallel workers');

    const skipButton = page.getByRole('button', { name: SKIP_TEST_NAMES[TEST_LOCALE], exact: true });
    await expect(skipButton).toBeVisible();
    await skipButton.click();
    await page.clock.runFor(4_000);

    await expect(terminal).toContainText(/meta\.spec\.ts.*test results are not hardcoded/i);
    await expect(terminal).not.toContainText(/skipped\s*\d+\s*\[chromium\]\s*›\s*meta\.spec\.ts/i);
    await expect(terminal).toContainText(/easter-egg\.spec\.ts.*didn't have patience/i);
    await expect(terminal).not.toContainText(/failed\s*\d+\s*\[human\]\s*›\s*easter-egg\.spec\.ts/i);
  });
});
