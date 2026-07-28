import { randomUUID } from 'crypto';
import { test, expect } from '../fixtures/pages';
import { login, createBugViaApi, openEditModalByTitle, deleteBugViaApi } from './test-helpers';

test.describe('Delete Bug - delete button visibility', () => {
  let bugId: number;
  let title: string;

  test.beforeEach(async ({ page, request, loginPage }) => {
    // Arrange
    await login(loginPage);
    title = `delete-button-visible-${randomUUID().slice(0, 8)}`;
    bugId = await createBugViaApi(page, request, title);
  });

  test.afterEach(async ({ request }) => {
    await deleteBugViaApi(request, bugId);
  });

  test('should display a delete button in the edit-bug modal', async ({ boardPage, editBugModal }) => {
    // Act
    await openEditModalByTitle(boardPage, editBugModal, title);

    // Assert
    await expect(editBugModal.deleteButton).toBeVisible();
  });
});
