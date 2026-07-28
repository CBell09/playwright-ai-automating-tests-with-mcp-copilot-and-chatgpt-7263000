import { Page, Locator } from '@playwright/test';

export class EditBugModal {
  readonly page: Page;
  readonly dialog: Locator;
  readonly deleteButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dialog = page.getByRole('dialog', { name: /Edit bug/ });
    this.deleteButton = this.dialog.getByRole('button', { name: 'Delete', exact: true });
    this.cancelButton = this.dialog.getByRole('button', { name: 'Cancel' });
  }

  /** Clicks Delete, which opens the confirm-delete modal (does not delete by itself). */
  async clickDelete() {
    await this.deleteButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
    // Wait for modal to close
    await this.page.waitForSelector('[role="dialog"]', { state: 'hidden' });
  }

  async isVisible(): Promise<boolean> {
    return await this.dialog.isVisible().catch(() => false);
  }
}
