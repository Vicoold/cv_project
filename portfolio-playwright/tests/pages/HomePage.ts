import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Home Page Object
 *
 * Represents the main portfolio page with all sections.
 * Uses data-testid for stable, maintainable selectors.
 */
export class HomePage extends BasePage {
  // Sections
  readonly heroSection: Locator;
  readonly introSection: Locator;

  // Hero elements
  readonly heroName: Locator;
  readonly heroTitle: Locator;
  readonly cvButton: Locator;
  readonly projectsButton: Locator;
  readonly contactButton: Locator;
  readonly githubLink: Locator;
  readonly linkedinLink: Locator;
  readonly emailLink: Locator;

  constructor(page: Page) {
    super(page);

    // Section locators using data-testid
    this.heroSection = page.getByTestId('hero-section');
    this.introSection = page.getByTestId('intro-section');

    // Hero element locators
    this.heroName = page.getByTestId('hero-name');
    this.heroTitle = page.getByTestId('hero-title');
    this.cvButton = page.getByTestId('hero-cv-button');
    this.projectsButton = page.getByTestId('hero-projects-button');
    this.contactButton = page.getByTestId('hero-contact-button');

    // External links - using data-testid for stability
    this.githubLink = page.getByTestId('hero-github-link');
    this.linkedinLink = page.getByTestId('hero-linkedin-link');
    this.emailLink = page.getByTestId('hero-email-link');
  }

  /**
   * Navigate to homepage
   */
  async navigate() {
    await this.goto('/');
  }

  /**
   * Get hero name text
   */
  async getHeroName(): Promise<string> {
    return await this.heroName.textContent() || '';
  }

  /**
   * Click on View Projects button (tests navigation)
   */
  async clickViewProjects() {
    await this.projectsButton.click();
  }

  /**
   * Click on Contact Me button (tests navigation)
   */
  async clickContactMe() {
    await this.contactButton.click();
  }

  /**
   * Scroll to intro section
   */
  async scrollToIntro() {
    await this.introSection.scrollIntoViewIfNeeded();
  }
}
