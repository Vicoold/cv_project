import { test, expect, type Page } from '@playwright/test';
import { HomePage } from './pages/HomePage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailsPage } from './pages/ProjectDetailsPage';
import { localePath } from './utils/locale';
import { clickInViewport } from './utils/navigation';

async function expectExactLocalizedUrl(page: Page, path: string) {
  await expect
    .poll(() => {
      const currentUrl = new URL(page.url());
      return `${currentUrl.pathname}${currentUrl.hash}`;
    })
    .toBe(localePath(path));
}

test.describe('Navigation Tests', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.navigate();
  });

  test('clicking "View Projects" reaches the exact localized projects page', async ({ page }) => {
    await expect(homePage.heroSection).toBeVisible();
    await expect(homePage.projectsButton).toHaveAttribute('href', localePath('/projects'));

    await homePage.clickViewProjects();

    await expectExactLocalizedUrl(page, '/projects');
    await expect(page.getByTestId('projects-section')).toBeVisible();
  });

  test('clicking "Contact Me" reaches the exact localized contact section', async ({ page }) => {
    await expect(homePage.contactButton).toHaveAttribute('href', localePath('/about#contact'));

    await homePage.clickContactMe();

    await expectExactLocalizedUrl(page, '/about#contact');
    await expect(page.getByTestId('contact-section')).toBeVisible();
  });

  test('CV link exposes its exact destination and safe new-tab attributes', async () => {
    await expect(homePage.cvButton).toHaveAttribute('href', localePath('/cv'));
    await expect(homePage.cvButton).toHaveAttribute('target', '_blank');
    await expect(homePage.cvButton).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('external social links expose exact safe-link attributes', async () => {
    await expect(homePage.githubLink).toHaveAttribute('href', 'https://github.com/Vicoold');
    await expect(homePage.githubLink).toHaveAttribute('target', '_blank');
    await expect(homePage.githubLink).toHaveAttribute('rel', 'noopener noreferrer');

    await expect(homePage.linkedinLink).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/piotr-doli%C5%84ski-b51854163',
    );
    await expect(homePage.linkedinLink).toHaveAttribute('target', '_blank');
    await expect(homePage.linkedinLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('rendered external links use absolute HTTP or HTTPS destinations', async ({ page }) => {
    await expect(homePage.githubLink).toBeVisible();
    const externalLinks = page.locator('a[href^="http"]:visible');
    const linkCount = await externalLinks.count();
    expect(linkCount).toBeGreaterThan(0);

    for (let index = 0; index < linkCount; index += 1) {
      const href = await externalLinks.nth(index).getAttribute('href');
      expect(href).not.toBeNull();
      expect(() => new URL(href as string)).not.toThrow();
      expect(href).toMatch(/^https?:\/\//);
    }
  });

  test('user can navigate to the first project details page and back', async ({ page }) => {
    const projectsPage = new ProjectsPage(page);
    await projectsPage.navigate();
    await expectExactLocalizedUrl(page, '/projects');

    const projectCards = await projectsPage.getProjectCards();
    expect(projectCards.length).toBeGreaterThan(0);

    const firstProjectDetailsButton = projectCards[0].getByTestId('project-details-link');
    await expect(firstProjectDetailsButton).toHaveAttribute(
      'href',
      localePath('/projects/bug-the-gathering'),
    );
    await clickInViewport(firstProjectDetailsButton);

    const detailsPage = new ProjectDetailsPage(page);
    await expectExactLocalizedUrl(page, '/projects/bug-the-gathering');
    await expect(detailsPage.title).toBeVisible();

    await detailsPage.clickBack();
    await expectExactLocalizedUrl(page, '/projects');
    await expect(projectsPage.projectsSection).toBeVisible();
  });
});

test.describe('Critical User Paths', () => {
  test('user journey: landing → explore intro → view projects → contact', async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.navigate();
    await expect(homePage.heroSection).toBeVisible();

    await homePage.scrollToIntro();
    await expect(homePage.introSection).toBeVisible();

    await homePage.clickViewProjects();
    const projectsPage = new ProjectsPage(page);
    await expectExactLocalizedUrl(page, '/projects');
    await expect(projectsPage.projectsSection).toBeVisible();

    await homePage.navigate();
    await homePage.clickContactMe();
    await expectExactLocalizedUrl(page, '/about#contact');
    await expect(page.getByTestId('contact-section')).toBeVisible();
  });

  test('CV action exposes the exact localized destination', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.navigate();

    await expect(homePage.cvButton).toBeVisible();
    await expect(homePage.cvButton).toBeEnabled();
    await expect(homePage.cvButton).toHaveAttribute('href', localePath('/cv'));
  });
});
