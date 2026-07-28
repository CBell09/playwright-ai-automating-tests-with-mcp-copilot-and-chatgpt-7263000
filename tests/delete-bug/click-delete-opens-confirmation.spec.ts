import { randomUUID } from 'crypto';
import { test, expect } from '../fixtures/pages';
import { login, createBugViaApi, openEditModalByTitle, deleteBugViaApi } from './test-helpers';

test.describe('Delete Bug - clicking Delete opens confirmation', () => {
  let bugId: number;
  let title: string;

  test.beforeEach(async ({ page, request, loginPage }) => {
    // Arrange
    await login(loginPage);
    title = `click-delete-opens-confirm-${randomUUID().slice(0, 8)}`;
    bugId = await createBugViaApi(page, request, title);
  });

  test.afterEach(async ({ request }) => {
    await deleteBugViaApi(request, bugId);
  });

  test('should open a confirmation modal instead of deleting immediately when Delete is clicked', async ({
    page,
    boardPage,
    editBugModal,
    confirmDeleteBugModal,
  }) => {
    // Act
    await openEditModalByTitle(boardPage, editBugModal, title);
    await editBugModal.clickDelete();

    // Assert
    await expect(confirmDeleteBugModal.dialog).toBeVisible();
    await expect(editBugModal.dialog).toBeVisible();
    const row = page.locator('table[aria-label="Bugs"] >> text=' + title);
    await expect(row).toHaveCount(1);
  });
});
