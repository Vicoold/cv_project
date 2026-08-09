import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ContactPage extends BasePage {
  readonly contactSection: Locator;
  readonly title: Locator;
  readonly emailLink: Locator;
  readonly githubLink: Locator;
  readonly linkedinLink: Locator;

  constructor(page: Page) {
    super(page);
    this.contactSection = page.getByTestId('contact-section');
    this.title = this.contactSection.locator('h2').first();
    this.emailLink = this.contactSection.locator('a[href^="mailto:"]');
    this.githubLink = this.contactSection.locator('a[href*="github.com"]');
    this.linkedinLink = this.contactSection.locator('a[href*="linkedin.com"]');
  }

  async navigate() {
    await this.goto('/about#contact');
  }
}
