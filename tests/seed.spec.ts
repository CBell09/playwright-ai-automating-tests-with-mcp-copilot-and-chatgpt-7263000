import { readFile } from 'fs/promises';
import { test, expect } from '@playwright/test';

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

    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'BuggyBoard' })).toBeVisible();

    await page.getByLabel('Username').fill(user.username);
    await page.getByLabel('Password').fill(user.password);
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL(/\/board/);
    await expect(page.getByRole('button', { name: 'New Bug' })).toBeVisible();
  });
});
