# Test Automation Patterns

Project-wide conventions for writing Playwright tests in BuggyBoard. Apply these whenever you write a new test or touch an existing one.

## Core principle: use page objects, not raw locator chains

New and refactored Playwright tests **must** use page objects. Do not write long chains of raw `page.getByRole(...)`, `page.getByLabel(...)`, etc. directly in test bodies. Wrap them in a page object class instead.

Follow the conventions on Playwright's Page Object Models doc: https://playwright.dev/docs/pom

## File organization

- Page object classes live under `tests/pages/`.
- **One page object class per file, one file per page.** For example:
  - `tests/pages/login-page.ts` – `LoginPage`
  - `tests/pages/board-page.ts` – `BoardPage`
  - `tests/pages/create-bug-modal.ts` – `CreateBugModal`
  - `tests/pages/edit-bug-modal.ts` – `EditBugModal`
- A distinct modal/dialog (e.g. Create Bug, Edit Bug) gets its own page object class rather than being folded into the page that opens it.

## Page object conventions

- Each class takes the Playwright `Page` in its constructor and stores it (e.g. `readonly page: Page`).
- Declare locators as `readonly` public fields, initialized in the constructor. Tests read these locators directly for assertions.
- Expose page interactions (navigation, filling forms, clicking buttons) as methods on the class (e.g. `goto()`, `login(username, password)`, `openCreateBugModal()`).
- Keep methods focused on **actions**, not assertions. Assertions (`expect(...)`) stay in the test file, asserting against locators exposed by the page object.
- Do not reach into another page object's internals; if a flow spans multiple pages (e.g. login then board), compose multiple page object instances in the test.

## Example

```ts
// tests/pages/login-page.ts
import { type Page, type Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.getByLabel('Username');
    this.passwordInput = page.getByLabel('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
```

```ts
// tests/some-flow.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login-page';

test('logs in', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('buggy', '1970beetle');

  await expect(page).toHaveURL(/\/board/);
});
```

## Migrating existing tests

- Existing specs under `tests/` (e.g. `tests/seed.spec.ts`, `tests/create-bug/*.spec.ts`) predate this convention and still use raw locator chains. Leave them as-is unless you are already editing that file for another reason.
- When you do touch an existing test, extract the locators and actions it uses into the appropriate page object(s) under `tests/pages/` as part of that change.
