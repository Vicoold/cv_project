import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { CVPage } from './pages/CVPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { TestingPage } from './pages/TestingPage';
import { ContactPage } from './pages/ContactPage';
import { localePath } from './utils/locale';

async function expectExactLocalizedUrl(page: import('@playwright/test').Page, path: string) {
  await expect
    .poll(() => {
      const currentUrl = new URL(page.url());
      return `${currentUrl.pathname}${currentUrl.hash}`;
    })
    .toBe(localePath(path));
}

test.describe('Smoke Tests - Critical Functionality', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.navigate();
  });

  test('homepage loads without browser errors or missing same-origin resources', async ({ page }) => {
    const consoleErrors: string[] = [];
    const sameOriginFailures: string[] = [];
    const applicationOrigin = new URL(page.url()).origin;
    await page.goto('about:blank');

    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => consoleErrors.push(error.message));
    page.on('response', (response) => {
      const responseUrl = new URL(response.url());
      if (responseUrl.origin === applicationOrigin && response.status() >= 400) {
        sameOriginFailures.push(`${response.status()} ${responseUrl.pathname}`);
      }
    });
    page.on('requestfailed', (request) => {
      const requestUrl = new URL(request.url());
      const failure = request.failure()?.errorText ?? 'request failed';
      const isCancelledNextPrefetch =
        failure === 'net::ERR_ABORTED' &&
        request.headers()['next-router-prefetch'] === '1' &&
        requestUrl.searchParams.has('_rsc');

      if (isCancelledNextPrefetch) return;

      if (requestUrl.origin === applicationOrigin) {
        sameOriginFailures.push(
          `${failure} ${requestUrl.pathname}`,
        );
      }
    });

    await homePage.navigate();
    await expect(page).toHaveTitle(/Senior|QA|SDET|Portfolio|Piotr/i);
    await expect(homePage.heroSection).toBeVisible();

    expect(sameOriginFailures).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test('hero section displays the portfolio identity', async () => {
    await expect(homePage.heroSection).toBeVisible();
    await expect(homePage.heroName).toContainText('Piotr');
    await expect(homePage.heroTitle).toContainText(/QA|SDET/i);
  });

  test('all main sections are present', async () => {
    await expect(homePage.heroSection).toBeVisible();
    await expect(homePage.introSection).toBeVisible();
  });

  test('CV link has the exact localized destination', async () => {
    await expect(homePage.cvButton).toBeVisible();
    await expect(homePage.cvButton).toBeEnabled();
    await expect(homePage.cvButton).toHaveAttribute('href', localePath('/cv'));
  });

  test('primary CTA links expose their exact localized destinations', async () => {
    await expect(homePage.cvButton).toHaveAttribute('href', localePath('/cv'));
    await expect(homePage.projectsButton).toHaveAttribute('href', localePath('/projects'));
    await expect(homePage.contactButton).toHaveAttribute('href', localePath('/about#contact'));
  });

  test('hero social links expose their exact destinations', async () => {
    await expect(homePage.githubLink).toBeVisible();
    await expect(homePage.linkedinLink).toBeVisible();
    await expect(homePage.emailLink).toBeVisible();

    await expect(homePage.githubLink).toHaveAttribute('href', 'https://github.com/Vicoold');
    await expect(homePage.linkedinLink).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/piotr-doli%C5%84ski-b51854163',
    );
    await expect(homePage.emailLink).toHaveAttribute('href', localePath('/about#contact'));
  });

  test('about page loads successfully', async ({ page }) => {
    const aboutPage = new AboutPage(page);
    await aboutPage.navigate();
    await expect(aboutPage.qualitySection).toBeVisible();
  });

  test('CV page loads successfully', async ({ page }) => {
    const cvPage = new CVPage(page);
    await cvPage.navigate();
    await cvPage.expectUsableCV();
  });

  test('CV page shows an error when the remote document cannot be loaded', async ({ page }) => {
    await page.route('**/Piotr_Dolinski_SDET_CV_EN.html', async (route) => {
      await route.fulfill({ status: 503, contentType: 'text/plain', body: 'Service unavailable' });
    });

    const cvPage = new CVPage(page);
    await cvPage.navigate();

    await expect(cvPage.errorState).toBeVisible();
    await expect(cvPage.errorState).toContainText(/couldn.t load|unable to load|failed to load/i);
    await expect(cvPage.loadingState).not.toBeVisible();
    await expect(cvPage.cvContainer).not.toHaveAttribute('data-loaded', 'true');
  });

  test('projects page loads successfully', async ({ page }) => {
    const projectsPage = new ProjectsPage(page);
    await projectsPage.navigate();
    await expect(projectsPage.projectsSection).toBeVisible();
  });

  test('testing and technical experience page loads successfully', async ({ page }) => {
    const testingPage = new TestingPage(page);
    await testingPage.navigate();
    await expect(testingPage.testingSection).toBeVisible();
    await expect(testingPage.skillsSection).toBeVisible();
  });

  test('contact journey reaches the exact localized section', async ({ page }) => {
    const contactPage = new ContactPage(page);
    await contactPage.navigate();

    await expectExactLocalizedUrl(page, '/about#contact');
    await expect(contactPage.contactSection).toBeVisible();
    await expect(contactPage.emailLink).toBeVisible();
  });
});
