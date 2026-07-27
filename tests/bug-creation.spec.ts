import { readFile } from 'fs/promises';
import { test, expect } from '@playwright/test';

type User = {
  username: string;
  password: string;
};

test('logs in and creates a new bug', async ({ page }) => {
  const users = JSON.parse(
    await readFile(new URL('../users.json', import.meta.url), 'utf8'),
  ) as User[];
  const user = users[0];
  const bugTitle = `Playwright bug ${Date.now()}`;

  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'BuggyBoard' })).toBeVisible();

  await page.getByLabel('Username').fill(user.username);
  await page.getByLabel('Password').fill(user.password);
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL(/\/board/);
  await expect(page.getByRole('button', { name: 'New Bug' })).toBeVisible();

  await page.getByRole('button', { name: 'New Bug' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  await dialog.getByLabel('Title').fill(bugTitle);
  await dialog.getByLabel('Severity').selectOption('high');
  await dialog.getByLabel('Owner').fill(user.username);
  await dialog.getByLabel('Description').fill('Created by Playwright automation.');
  await dialog.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText(bugTitle)).toBeVisible();
});
