import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class TestingPage extends BasePage {
  readonly testingSection: Locator;
  readonly skillsSection: Locator;

  constructor(page: Page) {
    super(page);
    this.testingSection = page.getByTestId('testing-section');
    this.skillsSection = page.getByTestId('skills-section');
  }

  async navigate() {
    await this.goto('/testing');
  }

  async isTestingSectionVisible(): Promise<boolean> {
    return await this.testingSection.isVisible();
  }

  async isSkillsSectionVisible(): Promise<boolean> {
    return await this.skillsSection.isVisible();
  }

  async getTestingApproachItems() {
    return await this.testingSection.getByTestId('approach-card').all();
  }
}
