import { Page } from '@playwright/test';
import { localePath } from '../utils/locale';

/**
 * Base Page Object
 *
 * Contains common page functionality shared across all pages.
 * Implements stable selectors and reusable actions.
 */
export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a relative URL from the base URL
   */
  async goto(path: string = '/') {
    await this.page.goto(localePath(path));
  }

}
