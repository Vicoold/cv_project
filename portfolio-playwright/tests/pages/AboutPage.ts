import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class AboutPage extends BasePage {
  readonly qualitySection: Locator;

  constructor(page: Page) {
    super(page);
    this.qualitySection = page.getByTestId('quality-section');
  }

  async navigate() {
    await this.goto('/about');
  }

  async isQualitySectionVisible(): Promise<boolean> {
    return await this.qualitySection.isVisible();
  }
}
