import { readFile } from 'fs/promises';
import { test, expect } from '@playwright/test';

type User = {
  username: string;
  password: string;
};

async function login(page: Parameters<typeof test>[0]['page'], user: User) {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'BuggyBoard' })).toBeVisible();

  await page.getByLabel('Username').fill(user.username);
  await page.getByLabel('Password').fill(user.password);
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL(/\/board/);
}

async function createBug(page: Parameters<typeof test>[0]['page'], title: string, severity: 'high' | 'low', owner: string) {
  await page.getByRole('button', { name: 'New Bug' }).click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  await dialog.getByLabel('Title').fill(title);
  await dialog.getByLabel('Severity').selectOption(severity);
  await dialog.getByLabel('Owner').fill(owner);
  await dialog.getByLabel('Description').fill(`Created by Playwright automation for ${title}.`);
  await dialog.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText(title)).toBeVisible();
}

test('sorts the Severity column in ascending order', async ({ page }) => {
  const users = JSON.parse(
    await readFile(new URL('../users.json', import.meta.url), 'utf8'),
  ) as User[];
  const user = users[0];

  const lowSeverityBugTitle = `Severity sort low ${Date.now()}`;
  const highSeverityBugTitle = `Severity sort high ${Date.now() + 1}`;

  await login(page, user);
  await createBug(page, lowSeverityBugTitle, 'low', user.username);
  await createBug(page, highSeverityBugTitle, 'high', user.username);

  await page.getByRole('button', { name: 'Severity', exact: true }).click();

  const rowTexts = await page.locator('tbody tr').evaluateAll((rows) =>
    rows.map((row) => row.textContent?.replace(/\s+/g, ' ').trim() ?? ''),
  );

  const lowRow = rowTexts.find((row) => row.includes(lowSeverityBugTitle));
  const highRow = rowTexts.find((row) => row.includes(highSeverityBugTitle));

  expect(lowRow).toContain('LOW');
  expect(highRow).toContain('HIGH');
  expect(lowRow).toBeDefined();
  expect(highRow).toBeDefined();
  expect(rowTexts.indexOf(lowRow!)).toBeLessThan(rowTexts.indexOf(highRow!));
});
