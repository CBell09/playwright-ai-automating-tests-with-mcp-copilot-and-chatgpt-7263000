# Delete Bug Test Plan

## Application Overview

Deleting a bug now requires confirmation (`specs/features/12-delete-bug.md`). Clicking "Delete" in the edit-bug modal (`frontend/src/EditBugModal.tsx`) no longer deletes immediately — it opens a second, nested confirmation modal (`frontend/src/ConfirmDeleteBugModal.tsx`) on top of the edit modal. The bug is only removed from the database when the user clicks "Confirm delete" in that modal. Dismissing the confirmation (Cancel button, X, Escape, or clicking the backdrop) closes only the confirmation modal and returns to the edit modal, unchanged, with the bug still intact.

Confirmed live against the running app:
- The confirmation dialog's accessible name is its heading text, exactly `Delete bug #<id>?` (e.g. `Delete bug #434?`), settable via `page.getByRole('dialog', { name: 'Delete bug #<id>?' })`.
- Its body text is: `Are you sure you want to delete bug #<id> (“<title>”)? This action cannot be undone.` — note the curly quotes (`&ldquo;`/`&rdquo;`), not straight quotes.
- The confirmation dialog is a DOM child of the edit-bug dialog (nested, not a sibling) — both remain mounted/visible simultaneously while the confirmation is open.
- **Locator collision:** both the edit modal and the confirmation modal have a button named exactly "Cancel" and an X button with `aria-label="Close"`. Any locator for the confirmation modal's Cancel/Close **must** be scoped under `page.getByRole('dialog', { name: 'Delete bug #<id>?' })` — an unscoped `getByRole('button', { name: 'Cancel' })` is ambiguous (strict-mode violation) once the confirmation modal is open.
- **Locator collision:** the board renders each bug row as `getByRole('button', ...)` with the row's full text (ID, severity, title, owner) as its accessible name. If a bug's title contains the substring "Delete" (this was hit live with a pre-existing bug titled "Bug delete test"), an unscoped `getByRole('button', { name: 'Delete' })` also matches that row. Always use `exact: true` for the Delete button: `page.getByRole('button', { name: 'Delete', exact: true })`.
- Pressing Escape while the confirmation modal is open closes only the confirmation modal (the edit modal's own Escape handling is suppressed while the confirmation is open); pressing Escape again then closes the edit modal as usual.
- Clicking the dimmed backdrop behind the confirmation modal also cancels it (unlike the edit-bug modal's backdrop, which intentionally does nothing) — this is called out in the feature spec's Design section though not enumerated as its own Gherkin scenario.

## Test Scenarios

### 1. Delete Button and Confirmation Modal

**Seed:** `tests/seed.spec.ts`

#### 1.1. should display a delete button in the edit-bug modal

**File:** `tests/delete-bug/delete-button-visible.spec.ts`

**Steps:**
  1. Create a bug via the API and open its edit modal.
    - expect: A "Delete" button is visible in the edit modal.
  2. Close the modal via Cancel and clean up the bug.

#### 1.2. should open a confirmation modal instead of deleting immediately when Delete is clicked

**File:** `tests/delete-bug/click-delete-opens-confirmation.spec.ts`

**Steps:**
  1. Create a bug via the API and open its edit modal.
  2. Click the Delete button.
    - expect: A confirmation dialog titled "Delete bug #&lt;id&gt;?" is displayed.
    - expect: The edit modal is still present/visible behind the confirmation dialog.
    - expect: The bug is still present on the board (via API or by closing both modals and checking the table) — it must not be deleted yet.
  3. Cancel the confirmation and the edit modal, then clean up the bug.

### 2. Confirming Deletion

**Seed:** `tests/seed.spec.ts`

#### 2.1. should remove the bug and close both modals when deletion is confirmed

**File:** `tests/delete-bug/confirm-delete-removes-bug.spec.ts`

**Steps:**
  1. Create a bug via the API, reload the board, and open its edit modal.
  2. Click Delete, then click "Confirm delete" in the confirmation dialog.
    - expect: The confirmation dialog closes.
    - expect: The edit modal closes.
    - expect: The bug no longer appears on the board (search by title/ID).
  3. No cleanup needed — the bug was deleted by the test itself.

### 3. Canceling Deletion

**Seed:** `tests/seed.spec.ts`

#### 3.1. should keep the bug and return to the edit modal when the confirmation's Cancel button is clicked

**File:** `tests/delete-bug/cancel-button-keeps-bug.spec.ts`

**Steps:**
  1. Create a bug via the API and open its edit modal.
  2. Click Delete to open the confirmation dialog.
  3. Click the confirmation dialog's Cancel button.
    - expect: The confirmation dialog closes.
    - expect: The edit modal is still open, showing the bug's unchanged data.
  4. Close the edit modal via Cancel.
    - expect: The bug is still present on the board.
  5. Clean up the bug.

#### 3.2. should keep the bug and return to the edit modal when the confirmation's X button is clicked

**File:** `tests/delete-bug/close-x-keeps-bug.spec.ts`

**Steps:**
  1. Create a bug via the API and open its edit modal.
  2. Click Delete to open the confirmation dialog.
  3. Click the confirmation dialog's X (Close) button.
    - expect: The confirmation dialog closes.
    - expect: The edit modal is still open, showing the bug's unchanged data.
  4. Close the edit modal via Cancel.
    - expect: The bug is still present on the board.
  5. Clean up the bug.

#### 3.3. should keep the bug and return to the edit modal when Escape is pressed on the confirmation modal

**File:** `tests/delete-bug/escape-keeps-bug.spec.ts`

**Steps:**
  1. Create a bug via the API and open its edit modal.
  2. Click Delete to open the confirmation dialog.
  3. Press Escape.
    - expect: The confirmation dialog closes.
    - expect: The edit modal is still open, showing the bug's unchanged data.
  4. Close the edit modal via Cancel.
    - expect: The bug is still present on the board.
  5. Clean up the bug.

#### 3.4. should keep the bug when the confirmation modal's backdrop is clicked

**File:** `tests/delete-bug/backdrop-click-keeps-bug.spec.ts`

**Steps:**
  1. Create a bug via the API and open its edit modal.
  2. Click Delete to open the confirmation dialog.
  3. Click the dimmed backdrop area outside the confirmation dialog (not the edit modal's backdrop — click just outside the inner confirmation dialog box).
    - expect: The confirmation dialog closes.
    - expect: The edit modal is still open, showing the bug's unchanged data.
  4. Close the edit modal via Cancel.
    - expect: The bug is still present on the board.
  5. Clean up the bug.

## Test Implementation Notes

*(Implemented — see `tests/delete-bug/`, `tests/pages/EditBugModal.ts`, `tests/pages/ConfirmDeleteBugModal.ts`, `tests/fixtures/pages.ts`.)*

- `tests/pages/EditBugModal.ts`'s `delete()` was renamed to `clickDelete()` — it only clicks the Delete button (opening the confirmation modal), it never deletes by itself. `deleteButton` is now scoped with `{ exact: true }` since an unscoped `getByRole('button', { name: 'Delete' })` also matches any board row whose title happens to contain the substring "Delete" (hit live during exploration).
- Added `tests/pages/ConfirmDeleteBugModal.ts` for the nested confirmation dialog: `dialog` (`page.getByRole('dialog', { name: /^Delete bug #\d+\?$/ })`), `confirmButton`, `cancelButton`, `closeButton`, all scoped under `dialog` to avoid colliding with the edit modal's own Cancel/Close controls, plus `confirm()` / `cancel()` / `closeWithX()` / `pressEscape()` / `clickBackdrop()` action methods. Registered as the `confirmDeleteBugModal` fixture in `tests/fixtures/pages.ts`.
  - Note: the confirmation modal's outer `role="dialog"` element is the full-viewport backdrop itself (`fixed inset-0`), not the visible card, so its `boundingBox()` covers the whole viewport rather than just the card. `clickBackdrop()` clicks near the viewport's top-left corner (outside the centered card) rather than computing an offset from the dialog's own box — confirmed live, since the offset-based approach would have clicked off-screen.
- Replaced `deleteBugIfExists` with simpler, more robust helpers in `tests/delete-bug/test-helpers.ts`: `createBugViaApi` (API-created bug + page reload, matching the pattern already used in `tests/search-bug/search-atomic.spec.ts`) and `deleteBugViaApi` (direct `request.delete`, swallowing errors). Cleanup no longer needs to drive the UI at all — tests that cancel the delete flow clean up via `deleteBugViaApi` in `afterEach`; the one test that confirms deletion needs no cleanup since it deleted the bug itself.
- The three pre-existing spec files (`should-create-then-delete.spec.ts`, `should-delete-from-details-view.spec.ts`, `should-not-delete-when-cancelled.spec.ts`) were removed and replaced by the seven scenario files below — the first two were near-duplicates that assumed immediate deletion, and the third never actually clicked Delete.
- Fixed the pre-existing lint errors in `test-helpers.ts` (`@typescript-eslint/no-unused-vars` / `no-explicit-any`) as part of the rewrite.
- All 7 tests pass, both in isolation (`npx playwright test tests/delete-bug`) and as part of the full non-seed suite (parallel-safe via per-test UUID title suffixes).
