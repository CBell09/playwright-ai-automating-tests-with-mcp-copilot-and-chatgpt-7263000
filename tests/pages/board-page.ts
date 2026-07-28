import { type Page, type Locator } from '@playwright/test';

export class BoardPage {
  readonly page: Page;
  readonly newBugButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newBugButton = page.getByRole('button', { name: 'New Bug' });
  }

  async openCreateBugModal() {
    await this.newBugButton.click();
  }
}
