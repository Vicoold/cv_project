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

    // Check for English text (Hero badge)
    const badge = page.getByText(/Available for opportunities/i);
    await expect(badge).toBeVisible();
  });

  test('should switch to Polish and display Polish content', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.navigate();

    // Navigate to Polish version
    await page.goto('/pl');

    // Check for Polish text
    const badge = page.getByText(/Dostępny do nowych wyzwań/i);
    await expect(badge).toBeVisible();

    const name = await homePage.getHeroName();
    expect(name).toContain('Piotr');
  });

  test('all pages should support Polish locale', async ({ page }) => {
    const paths = ['/projects', '/about', '/cv', '/testing'];

    for (const path of paths) {
      await page.goto(`/pl${path}`);
      await expect(page).not.toHaveTitle(/404|Not Found/i);
      await expect(page).toHaveURL(new RegExp(`/pl${path}(?:/|$)`));
    }
  });

  test('language persistence (simulated via URL)', async ({ page }) => {
    // Navigate to a Polish page
    await page.goto('/pl/projects');
    await expect(page).not.toHaveTitle(/404/i);
    await expect(page).toHaveURL(/\/pl\/projects(?:\/|$)/);

    // Navigate to another page via internal link (if any) or URL
    await page.goto('/pl/about');
    await expect(page).toHaveURL(/\/pl\/about(?:\/|$)/);

    // Title should be in Polish
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
