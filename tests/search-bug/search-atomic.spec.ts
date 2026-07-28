import { randomUUID } from 'crypto';
import { test, expect } from '../fixtures/pages';

const bugTemplates = [
  { title: 'Login page crashes on empty password', severity: 'HIGH', owner: 'buggy', description: 'App crashes when submitting an empty password on login.' },
  { title: 'Login page redirect fails after auth', severity: 'MID', owner: 'buggy', description: 'User is not redirected to board after successful login.' },
  { title: 'Login page error message not shown', severity: 'LOW', owner: 'buggy', description: 'No error message appears for invalid credentials.' },
  { title: 'Login page enter key stops working', severity: 'MID', owner: 'buggy', description: 'Enter key does not submit the login form.' },
  { title: 'Board page fails to load', severity: 'HIGH', owner: 'buggy', description: 'The bug board is empty even when bugs exist in the database.' },
  { title: 'Search field disappears on page resize', severity: 'LOW', owner: 'buggy', description: 'The search input is not visible after resizing the window.' },
  { title: 'Severity dropdown missing on create page', severity: 'MID', owner: 'buggy', description: 'The severity dropdown does not render in the create bug modal.' },
  { title: 'Create page modal does not close on cancel', severity: 'LOW', owner: 'buggy', description: 'The create bug modal stays open after clicking Cancel.' },
  { title: 'Title bar logo missing on page load', severity: 'LOW', owner: 'buggy', description: 'The logo image does not appear in the title bar.' },
  { title: 'Sort resets on page refresh', severity: 'MID', owner: 'buggy', description: 'Sorting order is lost when the page is refreshed.' },
];

test.describe('Search Bug', () => {
  let createdBugIds: number[] = [];
  // Unique per test so concurrently-running tests/files don't collide on shared titles.
  let suffix: string;
  let title: (base: string) => string;

  test.beforeEach(async ({ page, request, loginPage }) => {
    suffix = randomUUID().slice(0, 8);
    title = (base: string) => `${base} ${suffix}`;

    // Arrange - Login via UI
    await loginPage.goto();
    await loginPage.login('buggy', '1970beetle');

    // Create 10 bugs via API
    createdBugIds = [];
    for (const bug of bugTemplates) {
      const response = await request.post('/api/bugs', { data: { ...bug, title: title(bug.title) } });
      const body = await response.json();
      createdBugIds.push(body.id);
    }

    // Reload so the board reflects the newly created bugs
    await page.reload();
  });

  test.afterEach(async ({ request }) => {
    for (const id of createdBugIds) {
      await request.delete(`/api/bugs/${id}`);
    }
    createdBugIds = [];
  });

  test('Search bugs by title matching multiple results', async ({ boardPage }) => {
    // Act
    await boardPage.searchByTitle('page');

    // Assert
    await expect(await boardPage.getBugCellByTitle(title('Login page crashes on empty password'))).toBeVisible();
    await expect(await boardPage.getBugCellByTitle(title('Login page redirect fails after auth'))).toBeVisible();
    await expect(await boardPage.getBugCellByTitle(title('Login page error message not shown'))).toBeVisible();
    await expect(await boardPage.getBugCellByTitle(title('Login page enter key stops working'))).toBeVisible();
    await expect(await boardPage.getBugCellByTitle(title('Board page fails to load'))).toBeVisible();
    await expect(await boardPage.getBugCellByTitle(title('Search field disappears on page resize'))).toBeVisible();
    await expect(await boardPage.getBugCellByTitle(title('Severity dropdown missing on create page'))).toBeVisible();
    await expect(await boardPage.getBugCellByTitle(title('Create page modal does not close on cancel'))).toBeVisible();
    await expect(await boardPage.getBugCellByTitle(title('Title bar logo missing on page load'))).toBeVisible();
    await expect(await boardPage.getBugCellByTitle(title('Sort resets on page refresh'))).toBeVisible();
  });

  test('Search bugs by title matching subset of results', async ({ boardPage }) => {
    // Act
    await boardPage.searchByTitle('login');

    // Assert
    await expect(await boardPage.getBugCellByTitle(title('Login page crashes on empty password'))).toBeVisible();
    await expect(await boardPage.getBugCellByTitle(title('Login page redirect fails after auth'))).toBeVisible();
    await expect(await boardPage.getBugCellByTitle(title('Login page error message not shown'))).toBeVisible();
    await expect(await boardPage.getBugCellByTitle(title('Login page enter key stops working'))).toBeVisible();

    await expect(await boardPage.getBugCellByTitle(title('Board page fails to load'))).not.toBeVisible();
    await expect(await boardPage.getBugCellByTitle(title('Search field disappears on page resize'))).not.toBeVisible();
    await expect(await boardPage.getBugCellByTitle(title('Severity dropdown missing on create page'))).not.toBeVisible();
    await expect(await boardPage.getBugCellByTitle(title('Create page modal does not close on cancel'))).not.toBeVisible();
    await expect(await boardPage.getBugCellByTitle(title('Title bar logo missing on page load'))).not.toBeVisible();
    await expect(await boardPage.getBugCellByTitle(title('Sort resets on page refresh'))).not.toBeVisible();
  });

  test('Search bugs by title with no matches', async ({ boardPage }) => {
    // Act
    await boardPage.searchByTitle('xyzzy');

    // Assert
    await expect(await boardPage.getNoResultsMessage()).toBeVisible();

    await expect(await boardPage.getBugCellByTitle(title('Login page crashes on empty password'))).not.toBeVisible();
    await expect(await boardPage.getBugCellByTitle(title('Login page redirect fails after auth'))).not.toBeVisible();
    await expect(await boardPage.getBugCellByTitle(title('Login page error message not shown'))).not.toBeVisible();
    await expect(await boardPage.getBugCellByTitle(title('Login page enter key stops working'))).not.toBeVisible();
    await expect(await boardPage.getBugCellByTitle(title('Board page fails to load'))).not.toBeVisible();
    await expect(await boardPage.getBugCellByTitle(title('Search field disappears on page resize'))).not.toBeVisible();
    await expect(await boardPage.getBugCellByTitle(title('Severity dropdown missing on create page'))).not.toBeVisible();
    await expect(await boardPage.getBugCellByTitle(title('Create page modal does not close on cancel'))).not.toBeVisible();
    await expect(await boardPage.getBugCellByTitle(title('Title bar logo missing on page load'))).not.toBeVisible();
    await expect(await boardPage.getBugCellByTitle(title('Sort resets on page refresh'))).not.toBeVisible();
  });
});
