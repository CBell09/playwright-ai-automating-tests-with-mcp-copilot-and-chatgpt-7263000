import { Page, Locator } from '@playwright/test';

export class ConfirmDeleteBugModal {
  readonly page: Page;
  readonly dialog: Locator;
  readonly confirmButton: Locator;
  readonly cancelButton: Locator;
  readonly closeButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dialog = page.getByRole('dialog', { name: /^Delete bug #\d+\?$/ });
    this.confirmButton = this.dialog.getByRole('button', { name: 'Confirm delete' });
    this.cancelButton = this.dialog.getByRole('button', { name: 'Cancel' });
    this.closeButton = this.dialog.getByLabel('Close');
  }

  async confirm() {
    await this.confirmButton.click();
    await this.dialog.waitFor({ state: 'hidden' });
  }

  async cancel() {
    await this.cancelButton.click();
    await this.dialog.waitFor({ state: 'hidden' });
  }

  async closeWithX() {
    await this.closeButton.click();
    await this.dialog.waitFor({ state: 'hidden' });
  }

  async pressEscape() {
    await this.page.keyboard.press('Escape');
    await this.dialog.waitFor({ state: 'hidden' });
  }

  async clickBackdrop() {
    // The dialog's role="dialog" element is the full-viewport backdrop itself (fixed inset-0),
    // not the visible white card, so its own boundingBox() covers the whole viewport. Click near
    // the top-left corner of the viewport, which is outside the centered card but still inside
    // the backdrop overlay.
    await this.page.mouse.click(20, 20);
    await this.dialog.waitFor({ state: 'hidden' });
  }

  async isVisible(): Promise<boolean> {
    return await this.dialog.isVisible().catch(() => false);
  }
}
