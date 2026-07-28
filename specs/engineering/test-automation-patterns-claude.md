# Test Automation Patterns

This document establishes the core patterns for writing Playwright tests for BuggyBoard. It doubles as teaching material for the course: each rule includes the reasoning behind it, not just the rule, so you can apply the same thinking to apps beyond BuggyBoard.

All new and refactored tests must follow these conventions.

## Why Page Objects?

Without a pattern, tests accumulate raw locator chains like `page.getByRole('button', { name: 'New Bug' }).click()` directly in the test body. That works for one test. It breaks down at scale:

- **UI changes ripple everywhere.** If the "New Bug" button's accessible name changes, every test that clicks it needs the same edit. With a page object, you fix it in one place.
- **Tests stop reading like behavior.** A wall of `getByLabel`/`fill`/`click` calls describes *how* to drive the browser, not *what* the user is doing. `await loginPage.login('buggy', '1970beetle')` reads like a user story; `await page.getByLabel('Username').fill('buggy'); await page.getByLabel('Password').fill('1970beetle'); await page.getByRole('button', { name: 'Login' }).click();` reads like a transcript.
- **Duplication hides bugs.** The same locator copy-pasted across ten files means ten chances to get it slightly wrong, and no single place to notice the drift.
- **Debugging gets harder without one.** When a test fails on a raw locator, you're reading browser calls to figure out intent. When it fails on `boardPage.getBugRow(title)`, the method name already tells you what was being checked.

The guiding principle: **tests express what the user does; page objects express how the browser does it.**

## File organization

- Page object classes live under `tests/pages/`.
- **One page object class per file, one file per page or modal.** A distinct modal (Create Bug, Edit Bug) gets its own class — it is not folded into the page that opens it, because it has its own fields, its own lifecycle (open/close), and its own save/cancel behavior.

For BuggyBoard, that currently means:

```
tests/
  pages/
    login-page.ts        LoginPage
    board-page.ts         BoardPage
    create-bug-modal.ts   CreateBugModal
    edit-bug-modal.ts     EditBugModal
  create-bug/
    opens-create-bug-modal.spec.ts
    creates-new-bug.spec.ts
  close-bug/
    should-create-a-bug-and-close-it.spec.ts
```

## Anatomy of a page object class

Follow the structure from Playwright's own guide: https://playwright.dev/docs/pom

1. **Constructor** — accepts the Playwright `Page` and stores it as `readonly page: Page`.
2. **Locators** — declared as `readonly` public fields, initialized once in the constructor. Never build a locator inline inside a method; define it once as a field and reuse it.
3. **Navigation methods** — e.g. `goto()`, for pages reached by URL.
4. **Action methods** — simulate what a user does: `login()`, `openCreateBugModal()`, `fillBugForm()`, `save()`.
5. **Query methods** — read page state a test needs to assert on: `getBugRow(title)`, `getSeverityColor()`.

Page objects **do not contain `expect()` assertions**. They expose locators and state; the test file decides what to assert and when. This keeps failures pointing at the test's intent (line X in the spec expected Y) rather than burying an assertion inside a helper method three files away.

## Locator priority

Prefer locators in this order, matching how Playwright recommends finding elements the way a user or assistive technology would:

| Priority | Locator | Example |
|---|---|---|
| 1 | Role | `page.getByRole('button', { name: 'Save' })` |
| 2 | Label | `page.getByLabel('Title')` |
| 3 | Placeholder | `page.getByPlaceholder('Search bugs')` |
| 4 | Text | `page.getByText('No bugs matched')` |
| 5 | Test ID | `page.getByTestId('bug-row-12')` |
| 6 | CSS / XPath | last resort only |

Role and label locators survive styling and markup changes and double as an accessibility check — if `getByRole` can't find your button, a screen reader user probably can't either. Reach for CSS/XPath only when nothing else uniquely identifies the element (e.g. no accessible name and no test id available).

## Worked example: LoginPage

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
// tests/login.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login-page';

test('logs in with a seeded user', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('buggy', '1970beetle');

  await expect(page).toHaveURL(/\/board/);
});
```

Note what stayed in the test: the assertion. The page object drives the browser; the test decides what "success" means.

## Modals get their own page object

A modal is a contained UI context with its own fields and its own open/close lifecycle, so it earns its own class rather than living inside the page that triggers it:

```ts
// tests/pages/create-bug-modal.ts
import { type Page, type Locator } from '@playwright/test';

export class CreateBugModal {
  readonly page: Page;
  readonly dialog: Locator;
  readonly titleInput: Locator;
  readonly severitySelect: Locator;
  readonly ownerInput: Locator;
  readonly descriptionInput: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dialog = page.getByRole('dialog', { name: 'Create bug' });
    this.titleInput = page.getByLabel('Title');
    this.severitySelect = page.getByLabel('Severity');
    this.ownerInput = page.getByLabel('Owner');
    this.descriptionInput = page.getByLabel('Description');
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
  }

  async fill(bug: { title: string; severity: 'HIGH' | 'MID' | 'LOW'; owner?: string; description: string }) {
    await this.titleInput.fill(bug.title);
    await this.severitySelect.selectOption(bug.severity);
    if (bug.owner) await this.ownerInput.fill(bug.owner);
    await this.descriptionInput.fill(bug.description);
  }

  async save() {
    await this.saveButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }
}
```

## Composing page objects across a multi-page flow

When a scenario spans more than one page or modal — e.g. create a bug from the board, then find it in the list — instantiate each page object the flow touches and use them together in the test. Page objects don't call into each other; the test orchestrates:

```ts
// tests/create-bug/creates-new-bug.spec.ts
import { test, expect } from '@playwright/test';
import { BoardPage } from '../pages/board-page';
import { CreateBugModal } from '../pages/create-bug-modal';

test('creates a new bug with valid required fields', async ({ page }) => {
  const boardPage = new BoardPage(page);
  const createBugModal = new CreateBugModal(page);

  await boardPage.openCreateBugModal();
  await createBugModal.fill({
    title: 'Login fails with special characters',
    severity: 'HIGH',
    description: 'When I use < and > in my password, login fails.',
  });
  await createBugModal.save();

  await expect(boardPage.getBugRow('Login fails with special characters')).toBeVisible();
});
```

## Anti-patterns to avoid

| Anti-pattern | Why it hurts | Do this instead |
|---|---|---|
| Raw locator chains in the test body | UI changes require editing every test that touches the element | Encapsulate the locator in a page object field |
| Hardcoding a locator inside a method instead of a constructor field | The same element gets located differently in different methods, and can't be reused for assertions | Define locators once as `readonly` fields in the constructor |
| `expect()` calls inside page object methods | Failures no longer point at the test's intent; page objects become harder to reuse across different assertions | Keep assertions in the test; page objects expose locators/state for the test to assert on |
| One page object per element instead of per page | Explodes the number of files and loses the "encapsulate a page" mental model | One class per page or modal, with locators as fields on that class |
| CSS/XPath locators as a first choice | Brittle against markup/styling changes; skips the accessibility signal role/label locators give you | Use role/label/placeholder/text/test-id first; CSS/XPath only as a last resort |

## Migrating existing tests

- Existing specs under `tests/` (`tests/seed.spec.ts`, `tests/create-bug/*.spec.ts`) predate this convention and still use raw locator chains. Leave them as-is unless you're already editing that file for another reason.
- When you do touch an existing test, extract the locators and actions it uses into the appropriate page object(s) under `tests/pages/` as part of that change.

## References

- [Playwright: Page Object Models](https://playwright.dev/docs/pom)
- [Playwright: Locators](https://playwright.dev/docs/locators)
- [Playwright: Best Practices](https://playwright.dev/docs/best-practices)
