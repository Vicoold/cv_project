import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage';
import { TEST_LOCALE, localePath } from './utils/locale';
import { openMobileMenuIfNeeded } from './utils/navigation';

const THEME_TOGGLE_NAMES: Record<string, string> = {
    en: 'Toggle theme',
    pl: 'Zmień motyw',
    de: 'Theme wechseln',
    es: 'Cambiar tema',
    ar: 'تبديل المظهر',
};

const NOT_FOUND_TITLES: Record<string, string> = {
    en: 'Page not found',
    pl: 'Nie znaleziono strony',
    de: 'Seite nicht gefunden',
    es: 'Página no encontrada',
    ar: 'الصفحة غير موجودة',
};

test.describe('UI Features', () => {
    let homePage: HomePage;

    test.beforeEach(async ({ page }) => {
        homePage = new HomePage(page);
        await homePage.navigate();
    });



    test('Theme switcher toggles dark mode correctly', async ({ page, isMobile }) => {
        const htmlElement = page.locator('html');
        await openMobileMenuIfNeeded(page, isMobile);
        const themeButton = page.getByRole('button', { name: THEME_TOGGLE_NAMES[TEST_LOCALE], exact: true });
        await expect(themeButton).toBeVisible();
        await expect(htmlElement).toHaveClass(/(?:^|\s)dark(?:\s|$)/);

        await themeButton.click();
        await expect(htmlElement).not.toHaveClass(/(?:^|\s)dark(?:\s|$)/);

        await themeButton.click();
        await expect(htmlElement).toHaveClass(/(?:^|\s)dark(?:\s|$)/);
    });
});

test.describe('Error Pages', () => {
    test('navigating to unknown route shows 404 page', async ({ page }) => {
        const response = await page.goto(localePath('/unknown-route-12345/abc'));

        expect(response?.status()).toBe(404);
        await expect(page.getByText('404', { exact: true })).toBeVisible();
        await expect(page.getByRole('heading', {
            name: NOT_FOUND_TITLES[TEST_LOCALE],
            exact: true,
        })).toBeVisible();
    });
});
