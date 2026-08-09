import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProjectsPage extends BasePage {
  readonly projectsSection: Locator;

  constructor(page: Page) {
    super(page);
    this.projectsSection = page.getByTestId('projects-section');
  }

  async navigate() {
    await this.goto('/projects');
  }

  async isProjectsSectionVisible(): Promise<boolean> {
    return await this.projectsSection.isVisible();
  }

  async getProjectCards() {
    return await this.projectsSection.getByTestId('project-card').all();
  }
}
