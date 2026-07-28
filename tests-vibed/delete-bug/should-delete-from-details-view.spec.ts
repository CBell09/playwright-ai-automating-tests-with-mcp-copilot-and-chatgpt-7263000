// Reference only — original course version, from before the delete-bug feature added a
// confirmation modal (specs/features/12-delete-bug.md). Superseded by tests/delete-bug/*.spec.ts.
// Lives outside playwright.config.ts's testDir ("./tests"), so it is never collected or run,
// and its imports (old test-helpers.ts / EditBugModal.delete()) no longer resolve.
import { test, expect } from '../fixtures/pages';
import { login, createBug, deleteBugIfExists } from './test-helpers';

test.describe('Delete Bug - from details view', () => {
  let title: string;

  test.beforeEach(async ({ page, loginPage, boardPage, createBugModal }) => {
    await login(loginPage);
    title = `delete-bug-${Date.now()}`;
    await createBug(page, boardPage, createBugModal, title);
  });

  test.afterEach(async ({ page, boardPage, editBugModal }) => {
    await deleteBugIfExists(page, boardPage, editBugModal, title);
  });

  test('should_delete_from_details_view', async ({ page, boardPage, editBugModal }) => {
    // Act - open details (row click)
    await boardPage.clickBugByTitle(title);
    await expect(editBugModal.dialog).toBeVisible();
    await editBugModal.delete();

    // Assert
    const titleLocator = page.locator('table[aria-label="Bugs"] >> text=' + title);
    await expect(titleLocator).toHaveCount(0);
  });
});
