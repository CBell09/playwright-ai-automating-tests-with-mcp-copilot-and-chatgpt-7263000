import { randomUUID } from 'crypto';
import { test, expect } from '../fixtures/pages';
import { login, createBugViaApi, openEditModalByTitle } from './test-helpers';

test.describe('Delete Bug - confirming deletion', () => {
  let title: string;

  test.beforeEach(async ({ page, request, loginPage }) => {
    // Arrange
    await login(loginPage);
    title = `confirm-delete-${randomUUID().slice(0, 8)}`;
    await createBugViaApi(page, request, title);
  });

  test('should remove the bug and close both modals when deletion is confirmed', async ({
    page,
    boardPage,
    editBugModal,
    confirmDeleteBugModal,
  }) => {
    // Act
    await openEditModalByTitle(boardPage, editBugModal, title);
    await editBugModal.clickDelete();
    await expect(confirmDeleteBugModal.dialog).toBeVisible();
    await confirmDeleteBugModal.confirm();

    // Assert
    await expect(confirmDeleteBugModal.dialog).not.toBeVisible();
    await expect(editBugModal.dialog).not.toBeVisible();
    const row = page.locator('table[aria-label="Bugs"] >> text=' + title);
    await expect(row).toHaveCount(0);
  });
});
