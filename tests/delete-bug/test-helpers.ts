import { Page, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { BoardPage } from '../pages/BoardPage';
import { CreateBugModal } from '../pages/CreateBugModal';
import { EditBugModal } from '../pages/EditBugModal';

export async function login(loginPage: LoginPage) {
  await loginPage.loginWithFirstUser();
}

export async function createBug(page: Page, boardPage: BoardPage, createBugModal: CreateBugModal, title: string) {
  await boardPage.clickNewBugButton();
  await expect(createBugModal.dialog).toBeVisible();
  await createBugModal.fillBugForm({
    title,
    severity: 'mid',
    owner: 'tester',
    description: 'created by test',
  });
  await createBugModal.submit();

  // wait for the table to contain the title
  const row = page.locator('table[aria-label="Bugs"] >> text=' + title).first();
  await row.waitFor({ state: 'visible', timeout: 5000 });
}

export async function deleteBugIfExists(page: Page, boardPage: BoardPage, editBugModal: EditBugModal, title: string) {
  const locator = page.locator('table[aria-label="Bugs"] >> text=' + title);
  const count = await locator.count();
  if (count === 0) return;

  // click row to open edit modal
  await boardPage.clickBugByTitle(title);
  await expect(editBugModal.dialog).toBeVisible();
  await editBugModal.delete();

  // wait until bug is gone
  await expect(locator).toHaveCount(0);
}

async function expectGone(locator: any) {
  await locator.waitFor({ state: 'detached', timeout: 5000 }).catch(() => { });
}
