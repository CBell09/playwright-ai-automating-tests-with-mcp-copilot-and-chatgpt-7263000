import { readFile } from 'fs/promises';
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login-page';
import { BoardPage } from '../pages/board-page';
import { CreateBugModal } from '../pages/create-bug-modal';

type User = {
  username: string;
  password: string;
};

test.describe('Create bug flow', () => {
  test('opens the create bug modal from the board page', async ({ page }) => {
    const users = JSON.parse(
      await readFile(new URL('../../users.json', import.meta.url), 'utf8'),
    ) as User[];
    const user = users[0];

    const loginPage = new LoginPage(page);
    const boardPage = new BoardPage(page);
    const createBugModal = new CreateBugModal(page);

    // 1. Log in to BuggyBoard and navigate to the board page.
    await loginPage.goto();
    await expect(loginPage.heading).toBeVisible();

    await loginPage.login(user.username, user.password);

    await expect(page).toHaveURL(/\/board/);

    // 2. Click the New Bug button in the title bar.
    await expect(boardPage.newBugButton).toBeVisible();
    await boardPage.openCreateBugModal();

    await expect(createBugModal.dialog).toBeVisible();
    await expect(createBugModal.titleInput).toBeVisible();
    await expect(createBugModal.severitySelect).toBeVisible();
    await expect(createBugModal.ownerInput).toBeVisible();
    await expect(createBugModal.descriptionInput).toBeVisible();
  });
});
