import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CVPage extends BasePage {
  readonly cvContainer: Locator;
  readonly cvFrame: Locator;
  readonly errorState: Locator;
  readonly loadingState: Locator;

  constructor(page: Page) {
    super(page);
    this.cvContainer = page.getByTestId('cv-container');
    this.cvFrame = page.getByTitle('CV');
    this.errorState = page.getByTestId('cv-error');
    this.loadingState = page.getByText(/rendering document|renderowanie dokumentu|cv\.rendering/i);
  }

  async navigate() {
    await this.goto('/cv');
  }

  async expectUsableCV(): Promise<void> {
    await expect(this.cvContainer).toHaveAttribute('data-loaded', 'true');
    await expect(this.cvFrame.contentFrame().locator('body')).toContainText('Piotr Doliński');
  }
}
