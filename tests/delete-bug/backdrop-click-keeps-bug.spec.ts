import { randomUUID } from 'crypto';
import { test, expect } from '../fixtures/pages';
import {
  login,
  createBugViaApi,
  openEditModalByTitle,
  openDeleteConfirmation,
  deleteBugViaApi,
} from './test-helpers';

test.describe('Delete Bug - cancel via confirmation backdrop click', () => {
  let bugId: number;
  let title: string;

  test.beforeEach(async ({ page, request, loginPage }) => {
    // Arrange
    await login(loginPage);
    title = `backdrop-click-${randomUUID().slice(0, 8)}`;
    bugId = await createBugViaApi(page, request, title);
  });

  test.afterEach(async ({ request }) => {
    await deleteBugViaApi(request, bugId);
  });

  test("should keep the bug when the confirmation modal's backdrop is clicked", async ({
    page,
    boardPage,
    editBugModal,
    confirmDeleteBugModal,
  }) => {
    // Act
    await openEditModalByTitle(boardPage, editBugModal, title);
    await openDeleteConfirmation(editBugModal, confirmDeleteBugModal);
    await confirmDeleteBugModal.clickBackdrop();

    // Assert
    await expect(confirmDeleteBugModal.dialog).not.toBeVisible();
    await expect(editBugModal.dialog).toBeVisible();
    await expect(editBugModal.deleteButton).toBeVisible();
    await editBugModal.cancel();
    const row = page.locator('table[aria-label="Bugs"] >> text=' + title);
    await expect(row).toHaveCount(1);
  });
});
