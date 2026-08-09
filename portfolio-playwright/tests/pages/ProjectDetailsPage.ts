import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProjectDetailsPage extends BasePage {
  readonly title: Locator;
  readonly description: Locator;
  readonly backLink: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByTestId('project-title');
    this.description = page.getByTestId('project-description');
    this.backLink = page.getByTestId('back-to-projects');
  }

  async navigate(slug: string) {
    await this.goto(`/projects/${slug}`);
  }

  async getTitle(): Promise<string> {
    return await this.title.textContent() || '';
  }

  async clickBack() {
    await this.backLink.click();
  }
}
