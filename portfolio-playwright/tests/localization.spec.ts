import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage';
import { openMobileMenuIfNeeded } from './utils/navigation';

test.describe('Localization Tests', () => {
  test('should redirect to default locale (en)', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/en(?:\/|$)/);
  });

  test('should display content in English by default', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.navigate();

    const badge = page.getByText(/Available for opportunities/i);
    await expect(badge).toBeVisible();
  });

  test('should switch to Polish and display Polish content', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.navigate();

    await page.goto('/pl');

    const badge = page.getByText(/Dostępny do nowych wyzwań/i);
    await expect(badge).toBeVisible();

    const name = await homePage.getHeroName();
    expect(name).toContain('Piotr');
  });

  test('Polish routes keep locale and render localized page content', async ({ page }) => {
    const routes: Array<{ path: string; content: RegExp }> = [
      { path: '/projects', content: /Wybrane Projekty/i },
      { path: '/about', content: /Podejście do/i },
      { path: '/cv', content: /Podgląd na żywo|Piotr/i },
      { path: '/testing', content: /Ta strona|testowana/i },
    ];

    for (const route of routes) {
      await page.goto(`/pl${route.path}`);
      await expect(page).not.toHaveTitle(/404|Not Found/i);
      await expect(page).toHaveURL(new RegExp(`/pl${route.path}(?:/|$)`));
      await expect(page.getByRole('main')).toBeVisible();
      await expect(page.getByRole('main')).toContainText(route.content);
    }
  });

  test('locale segment is preserved when moving between Polish pages via URL', async ({ page }) => {
    // This checks URL-based locale continuity, not cookie/localStorage preference storage.
    await page.goto('/pl/projects');
    await expect(page).not.toHaveTitle(/404/i);
    await expect(page).toHaveURL(/\/pl\/projects(?:\/|$)/);
    await expect(page.getByRole('main')).toContainText(/Wybrane Projekty/i);

    await page.goto('/pl/about');
    await expect(page).toHaveURL(/\/pl\/about(?:\/|$)/);

    const mindsetTitle = page.locator('#mindset-title');
    await expect(mindsetTitle).toBeVisible();
    await expect(mindsetTitle).toContainText(/Podejście do/i);
    await expect(mindsetTitle).toContainText(/Jakości/i);
  });

  test('should switch language via UI language selector', async ({ page, isMobile }) => {
    await page.goto('/en');

    await openMobileMenuIfNeeded(page, isMobile);

    await page.getByTestId('language-switcher').last().click();
    await page.getByTestId('language-option-pl').click();
    await expect(page).toHaveURL(/\/pl(?:\/|$)/);
    await expect(page.getByText(/Dostępny do nowych wyzwań/i)).toBeVisible();
  });
});
