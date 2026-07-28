import { readFile } from 'fs/promises';
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login-page';
import { BoardPage } from './pages/board-page';

type User = {
  username: string;
  password: string;
};

test.describe('BuggyBoard login seed', () => {
  test('logs into BuggyBoard with the first seeded user', { tag: '@seed' }, async ({ page }) => {
    const users = JSON.parse(
      await readFile(new URL('../users.json', import.meta.url), 'utf8'),
    ) as User[];
    const user = users[0];

    const loginPage = new LoginPage(page);
    const boardPage = new BoardPage(page);

    await loginPage.goto();
    await expect(loginPage.heading).toBeVisible();

    await loginPage.login(user.username, user.password);

    await expect(page).toHaveURL(/\/board/);
    await expect(boardPage.newBugButton).toBeVisible();
  });
});
