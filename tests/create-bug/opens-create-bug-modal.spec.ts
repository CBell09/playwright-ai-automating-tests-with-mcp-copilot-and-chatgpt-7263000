import { readFile } from 'fs/promises';
import { test, expect } from '@playwright/test';

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

    // 1. Log in to BuggyBoard and navigate to the board page.
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'BuggyBoard' })).toBeVisible();

    await page.getByLabel('Username').fill(user.username);
    await page.getByLabel('Password').fill(user.password);
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL(/\/board/);

    // 2. Click the New Bug button in the title bar.
    const newBugButton = page.getByRole('button', { name: 'New Bug' });
    await expect(newBugButton).toBeVisible();
    await newBugButton.click();

    const dialog = page.getByRole('dialog', { name: 'Create bug' });
    await expect(dialog).toBeVisible();
    await expect(page.getByLabel('Title')).toBeVisible();
    await expect(page.getByLabel('Severity')).toBeVisible();
    await expect(page.getByLabel('Owner')).toBeVisible();
    await expect(page.getByLabel('Description')).toBeVisible();
  });
});
