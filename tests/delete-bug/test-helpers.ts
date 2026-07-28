import { APIRequestContext, Page, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { BoardPage } from '../pages/BoardPage';
import { EditBugModal } from '../pages/EditBugModal';
import { ConfirmDeleteBugModal } from '../pages/ConfirmDeleteBugModal';

export async function login(loginPage: LoginPage) {
  await loginPage.loginWithFirstUser();
}

export async function createBugViaApi(page: Page, request: APIRequestContext, title: string): Promise<number> {
  const response = await request.post('/api/bugs', {
    data: { title, severity: 'mid', owner: 'tester', description: 'created by test' },
  });
  const body = await response.json();

  await page.reload();
  const row = page.locator('table[aria-label="Bugs"] >> text=' + title).first();
  await row.waitFor({ state: 'visible', timeout: 5000 });

  return body.id;
}

export async function openEditModalByTitle(
  boardPage: BoardPage,
  editBugModal: EditBugModal,
  title: string,
) {
  await boardPage.clickBugByTitle(title);
  await expect(editBugModal.dialog).toBeVisible();
}

export async function openDeleteConfirmation(
  editBugModal: EditBugModal,
  confirmDeleteBugModal: ConfirmDeleteBugModal,
) {
  await editBugModal.clickDelete();
  await expect(confirmDeleteBugModal.dialog).toBeVisible();
}

export async function deleteBugViaApi(request: APIRequestContext, id: number) {
  await request.delete(`/api/bugs/${id}`).catch(() => {});
}
