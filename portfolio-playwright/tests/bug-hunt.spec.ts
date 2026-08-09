import { test, expect } from '@playwright/test';
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

const SKIP_TEST_NAMES: Record<string, string> = {
    en: 'Skip tests',
    pl: 'Pomiń testy',
    de: 'Tests überspringen',
    es: 'Omitir pruebas',
    ar: 'تخطي الاختبارات',
};

/**
 * Bug Hunt Feature Tests
 * 
 * Verifies that the "Easter Egg" bug hunting feature works as expected.
 * This tests interactions that trigger bugs and the resulting UI updates.
 */
test.describe('Bug Hunt Feature', () => {
    let homePage: HomePage;

    test.beforeEach(async ({ page }) => {
        homePage = new HomePage(page);
        await homePage.navigate();
        
        // Ensure clean state for each test
        await page.evaluate(() => {
            localStorage.clear();
        });
        await page.reload();
    });

    test('Bug 1: Found via Command Menu (Release the Bug)', async ({ page }) => {
        // Step 1: Open command menu
        const isMac = process.platform === 'darwin';
        const modifier = isMac ? 'Meta' : 'Control';
        await page.keyboard.press(`${modifier}+k`);
        
        // Step 2: Look for 'Release the Bug' item
        const releaseBugItem = page.getByTestId('release-bug-item');
        await expect(releaseBugItem).toBeVisible();
        
        // Step 3: Trigger the bug
        await releaseBugItem.click();
        
        // Step 4: Verify overlay and message
        const overlay = page.getByTestId('bug-hunt-overlay');
        await expect(overlay).toBeVisible();
        
        const message = page.getByTestId('bug-hunt-message');
        await expect(message).toContainText(/reached my lair/i);
        
        // Step 5: Verify counter
        const counterCount = page.getByTestId('bug-found-count');
        await expect(counterCount).toContainText('1 / 7');
    });

    test('Bug 3: Found via Logo rapid clicks', async ({ page, isMobile }) => {
        const logo = page.getByRole('link', { name: /Piotr Doliński/i });
        await expect(logo).toBeVisible();
        
        // Clicks in quick succession - performing 5 for extra safety
        for(let i=0; i<5; i++) {
            if (isMobile) {
                await logo.tap();
            } else {
                await logo.click({ delay: 50 });
            }
        }
        
        // Verify overlay and message
        const overlay = page.getByTestId('bug-hunt-overlay');
        await expect(overlay).toBeVisible({ timeout: 20000 });
        
        const message = page.getByTestId('bug-hunt-message');
        await expect(message).toContainText(/Logo is for clicking/i);
    });

    test('Bug 4: Found via clicking "Code" on private projects', async ({ page }) => {
        // Navigate to projects
        await page.goto(localePath('/projects'));
        
        // Target BUG: The Gathering explicitly so this regression cannot drift to a public card.
        const bugTheGatheringCard = page.locator(
            '[data-testid="project-card"][data-project-slug="bug-the-gathering"]',
        );
        const codeButton = bugTheGatheringCard.getByTestId('private-code-button');
        await expect(codeButton).toBeVisible();
        await clickInViewport(codeButton);
        
        // Verify overlay
        const overlay = page.getByTestId('bug-hunt-overlay');
        await expect(overlay).toBeVisible();
        
        const message = page.getByTestId('bug-hunt-message');
        await expect(message).toContainText(/shouldn't be clicking this/i);
    });

    test('Bug 5: Found via multiple language switches', async ({ page, isMobile }) => {
        const switchLang = async (lang: string) => {
            const langCode = lang.toLowerCase() === 'polski' ? 'pl' : lang.toLowerCase() === 'deutsch' ? 'de' : 'en';
            await openMobileMenuIfNeeded(page, isMobile);
            const switcher = page.getByTestId('language-switcher').last();
            await switcher.click();
            await page.getByTestId(`language-option-${langCode}`).click();
            await expect(page).toHaveURL(new RegExp(`/${langCode}(?:/|$)`));
        };

        // 1st switch (EN -> PL)
        await switchLang('Polski');
        
        // 2nd switch (PL -> DE)
        await switchLang('Deutsch');
        
        // 3rd switch (DE -> EN)
        await switchLang('English');
        
        // Bug 5 fires after 600ms in bug-hunt-context.tsx
        const overlay = page.getByTestId('bug-hunt-overlay');
        await expect(overlay).toBeVisible({ timeout: 20000 });
        
        const message = page.getByTestId('bug-hunt-message');
        await expect(message).toContainText(/French/i, { timeout: 20000 });
    });

    test('Persistence: Found bugs should persist after page reload', async ({ page }) => {
        // 1. Find bug #1 (reliable)
        const isMac = process.platform === 'darwin';
        const modifier = isMac ? 'Meta' : 'Control';
        await page.keyboard.press(`${modifier}+k`);
        await page.getByTestId('release-bug-item').click();
        
        // 2. Verify it was found
        const counterCount = page.getByTestId('bug-found-count');
        await expect(counterCount).toContainText('1 / 7');
        
        // 3. Reload page
        await page.reload();
        
        // 4. Verify counter is still 1 / 7
        await expect(page.getByTestId('bug-found-count')).toContainText('1 / 7');
    });

    test('Bug 6: Finding bug in terminal (Testing page)', async ({ page }) => {
        await page.clock.install();
        await page.addInitScript(() => {
            Math.random = () => 0;
        });

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

    test('terminal fast-forward does not present fake lines as repository test numbers', async ({ page }) => {
        await page.clock.install();
        await page.addInitScript(() => {
            Math.random = () => 0;
        });

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
