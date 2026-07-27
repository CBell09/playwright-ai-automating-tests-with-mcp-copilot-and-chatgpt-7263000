# Delete Bug Test Plan

## Application Overview

BuggyBoard lets an authenticated user remove a bug they no longer need. There is no separate
"bug details" page — clicking a row in the board table (`table[aria-label="Bugs"]`) opens the
same **Edit bug** dialog used for editing, and that dialog carries a **Delete** button alongside
**Save**/**Cancel**. Deleting calls `DELETE /api/bugs/:id`, removes the row from the board, and
closes the dialog; there is no native browser confirmation step (per
`specs/features/12-delete-bug.md`). Cancelling the dialog must leave the bug untouched.

This plan was produced by driving the live app with `playwright-cli` (`--debug=cli` attach against
`tests/seed.spec.ts` and the existing `tests/delete-bug/*.spec.ts` specs) rather than by
inspection alone, so the selectors and flow below reflect verified, current app behavior.

## Test Scenarios

### 1. Delete Bug

**Seed:** `tests/seed.spec.ts` (login flow) — each scenario additionally creates its own bug in
`beforeEach` so it starts from a known, isolated fixture. See "Fresh bug setup" below for the
uniqueness requirement this depends on.

#### 1.1. should-create-then-delete-bug

**File:** `tests/delete-bug/should-create-then-delete.spec.ts`

**Steps:**
  1. Log in as the first user in `users.json` via `/login` (`Username`/`Password` labels, `Login` button).
    - expect: redirected to `/board`
  2. Create a fresh bug via the `New Bug` button and the `Create bug` dialog (unique title, any severity/owner/description).
    - expect: a row containing the new title appears in `table[aria-label="Bugs"]`
  3. Click the row for the newly created bug.
    - expect: an `Edit bug` dialog opens showing a `Delete` button
  4. Click `Delete`.
    - expect: the dialog closes
    - expect: no row containing the bug's title remains in `table[aria-label="Bugs"]`

#### 1.2. should-not-delete-when-cancelled

**File:** `tests/delete-bug/should-not-delete-when-cancelled.spec.ts`

**Steps:**
  1. Log in and create a fresh bug (same Arrange as 1.1).
    - expect: the bug's row is visible on the board
  2. Click the row to open the `Edit bug` dialog.
    - expect: dialog shows a `Cancel` button
  3. Click `Cancel`.
    - expect: the dialog closes
    - expect: the bug's row is still present in `table[aria-label="Bugs"]` (count stays 1)

#### 1.3. should-close-edit-dialog-on-delete

**File:** `tests/delete-bug/should-close-dialog-on-delete.spec.ts`

**Purpose:** `specs/features/12-delete-bug.md` requires the modal to close on delete; existing
tests only assert the row disappears, not that the dialog itself closes — this scenario closes
that gap explicitly.

**Steps:**
  1. Log in and create a fresh bug.
    - expect: the bug's row is visible
  2. Click the row and click `Delete` in the `Edit bug` dialog.
    - expect: the `Edit bug` dialog is no longer visible/attached
    - expect: no leftover backdrop or focus trap blocks interaction with the board

#### 1.4. should-persist-delete-after-reload

**File:** `tests/delete-bug/should-persist-delete-after-reload.spec.ts`

**Purpose:** Confirms the delete is a real server-side removal (`DELETE /api/bugs/:id`), not just
an optimistic client-side update that could reappear after a refetch.

**Steps:**
  1. Log in and create a fresh bug.
    - expect: the bug's row is visible
  2. Delete the bug via the `Edit bug` dialog.
    - expect: the row disappears
  3. Reload the page (`page.reload()`).
    - expect: after reload, the bug's title is still absent from `table[aria-label="Bugs"]`

## Fresh bug setup (required for every scenario)

- Every scenario's Arrange step must create its own bug through the UI (`New Bug` → `Create bug`
  dialog) immediately before the delete steps — never reuse a bug created by another test or left
  over from a previous run.
- **Uniqueness requirement:** do not rely on `Date.now()` alone for the title. Running the current
  `tests/delete-bug` suite with the default `fullyParallel: true` config reproduced a real
  collision — two workers started in the same millisecond and both created a bug titled
  `delete-bug-1785193793047`, which made `table[aria-label="Bugs"] >> text=<title>` resolve to 2
  elements and failed both `toHaveCount` assertions plus the `afterEach` cleanup click. Generate
  titles with a collision-resistant suffix, e.g. `` `delete-bug-${Date.now()}-${test.info().workerIndex}-${Math.random().toString(36).slice(2, 8)}` `` or `crypto.randomUUID()`.
  Serial runs (`--workers=1`) pass reliably, confirming this is a test-data race, not an app bug.
- Cleanup: each spec should still delete its own bug in the test body or `afterEach` (as the
  existing `deleteBugIfExists` helper does) so a failed assertion doesn't leak data into later runs.

## Test Implementation Notes

- Login helper: `page.goto('/login')`, fill `Username`/`Password` by label, click `Login`
  (`getByRole('button', { name: 'Login' })`), wait for `**/board`.
- Create-bug helper: `New Bug` button opens `getByRole('dialog', { name: 'Create bug' })`; fill
  `Title`/`Severity`/`Owner`/`Description` by label; `Save` button commits.
- Board table: `table[aria-label="Bugs"]`; locate a row with
  `page.locator('table[aria-label="Bugs"] tbody tr', { hasText: title })`.
- Edit dialog: `getByRole('dialog', { name: /Edit bug/ })`, opened by clicking a row; contains
  `Delete`, `Cancel`, and `Save` buttons.
- No native `confirm()` dialog appears on delete — do not add `dialog-accept`/`dialog-dismiss`
  handling for this flow.
- Reuse `tests/delete-bug/test-helpers.ts` (`login`, `createBug`, `deleteBugIfExists`) for new
  scenarios; update `createBug`'s title-generation call sites once the uniqueness fix above lands.

## Playwright CLI / Run commands

```bash
# Run the full delete-bug suite
npx playwright test tests/delete-bug --project=chromium

# Run serially while the title-collision fix is pending
npx playwright test tests/delete-bug --project=chromium --workers=1

# Run a single scenario
npx playwright test tests/delete-bug/should-create-then-delete.spec.ts
```

## Files / Suggested test names

- `tests/delete-bug/should-create-then-delete.spec.ts` (existing)
- `tests/delete-bug/should-not-delete-when-cancelled.spec.ts` (existing)
- `tests/delete-bug/should-close-dialog-on-delete.spec.ts` (new — scenario 1.3)
- `tests/delete-bug/should-persist-delete-after-reload.spec.ts` (new — scenario 1.4)
- `tests/delete-bug/test-helpers.ts` (existing — update title generation for uniqueness)

Note: `tests/delete-bug/should-delete-from-details-view.spec.ts` currently duplicates 1.1 —
BuggyBoard has no separate details page, so this file should be removed or repurposed as 1.3/1.4
above rather than kept as a redundant copy.
