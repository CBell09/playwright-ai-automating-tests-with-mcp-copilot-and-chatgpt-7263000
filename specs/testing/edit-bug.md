# Edit Bug Test Plan

## Application Overview

Clicking a bug row on the board opens the edit-bug modal (`frontend/src/EditBugModal.tsx`), titled "Edit bug #&lt;id&gt;", with a read-only ID field and editable title/severity/state/owner/description fields (`specs/features/09-edit-bug.md`). No test currently opens this modal purely to exercise editing — the only existing coverage is incidental: `tests/delete-bug/*` opens it solely to click Delete, and `specs/testing/bug-closure.md` (not yet implemented) opens it solely to change state to Closed. The modal's own save/cancel/validation/close contract — distinct from both of those flows — is entirely uncovered.

Confirmed live against the running app, and notably **different from the create-bug modal's validation behavior**:
- The Save button is *disabled* (not clickable, no error message shown) whenever there are no changes from the bug's original values, or whenever any required field (title, severity, owner, description) is blank. This differs from `CreateBugModal`, which lets you click Save and then shows an inline `role="alert"` list of validation messages — `EditBugModal` prevents the click entirely via the `disabled` attribute.
- The ID field (`#edit-bug-id`) is rendered `readOnly` with `aria-readonly="true"`.
- Backdrop click does not close the modal (same as create-bug); entered edits are preserved.
- X button and Escape both close without saving, identical to Cancel.
- The severity `<select>` gets a `severity-select-{high|mid|low}` class matching the board's badge color coding, confirmed for all three levels.

## Test Scenarios

### 1. Opening and Displaying the Modal

#### 1.1. should open the edit modal with all fields populated when a bug row is clicked

**File:** `tests/edit-bug/open-edit-modal.spec.ts`

**Steps:**
  1. Create a bug via the API with known title, severity, owner, and description, then reload the board.
  2. Click the bug's row.
    - expect: A dialog titled "Edit bug #&lt;id&gt;" (with the real ID) is displayed.
    - expect: The ID field shows the bug's ID and is read-only.
    - expect: The title, severity, owner, and description fields show the bug's current values and are editable.
    - expect: Save and Cancel buttons are visible.
  3. Clean up the created bug.

#### 1.2. should display the severity dropdown with the same color coding as the board badge

**File:** `tests/edit-bug/edit-severity-color.spec.ts`

**Steps:**
  1. Create a bug with severity HIGH via the API, reload the board, and open its edit modal.
    - expect: The severity `<select>` has class `severity-select-high`.
  2. Repeat for MID and LOW severities, expecting `severity-select-mid` and `severity-select-low` respectively.
  3. Clean up the created bugs.

### 2. Saving Changes

#### 2.1. should save edited fields and persist them to the board

**File:** `tests/edit-bug/save-changes.spec.ts`

**Steps:**
  1. Create a bug via the API and open its edit modal.
  2. Change the title, severity, and owner to new values.
  3. Click Save.
    - expect: The modal closes.
    - expect: The board reflects the updated title, severity, and owner for that bug (by ID).
  4. Clean up the bug.

#### 2.2. should keep the Save button disabled until a field is changed

**File:** `tests/edit-bug/save-disabled-no-changes.spec.ts`

**Steps:**
  1. Create a bug via the API and open its edit modal.
    - expect: The Save button is disabled.
  2. Change the title field to a different value.
    - expect: The Save button becomes enabled.
  3. Close the modal via Cancel and clean up the bug.

#### 2.3. should disable Save if a required field is cleared to blank

**File:** `tests/edit-bug/save-disabled-blank-field.spec.ts`

**Steps:**
  1. Create a bug via the API and open its edit modal.
  2. Clear the title field entirely.
    - expect: The Save button is disabled.
  3. Restore the title, then clear the owner field entirely.
    - expect: The Save button is disabled.
  4. Restore the owner, then clear the description field entirely.
    - expect: The Save button is disabled.
  5. Close via Cancel and clean up the bug.

### 3. Discarding Changes

#### 3.1. should discard changes when Cancel is clicked

**File:** `tests/edit-bug/cancel-discards-changes.spec.ts`

**Steps:**
  1. Create a bug via the API and open its edit modal.
  2. Change the title field.
  3. Click Cancel.
    - expect: The modal closes.
    - expect: The board still shows the bug's original (unchanged) title.
  4. Clean up the bug.

#### 3.2. should discard changes when the X button is clicked

**File:** `tests/edit-bug/close-x-discards-changes.spec.ts`

**Steps:**
  1. Create a bug via the API and open its edit modal.
  2. Change the description field.
  3. Click the modal's X (Close) button.
    - expect: The modal closes.
    - expect: The board/API still reflects the bug's original description.
  4. Clean up the bug.

#### 3.3. should discard changes when Escape is pressed

**File:** `tests/edit-bug/escape-discards-changes.spec.ts`

**Steps:**
  1. Create a bug via the API and open its edit modal.
  2. Change the owner field.
  3. Press Escape.
    - expect: The modal closes.
    - expect: The board/API still reflects the bug's original owner.
  4. Clean up the bug.

#### 3.4. should not close the modal when the backdrop is clicked, and should preserve entered edits

**File:** `tests/edit-bug/backdrop-does-not-close.spec.ts`

**Steps:**
  1. Create a bug via the API and open its edit modal.
  2. Change the title field to a new value.
  3. Click the dimmed backdrop area outside the modal.
    - expect: The modal remains open.
    - expect: The title field still shows the newly entered (unsaved) value.
  4. Close via Cancel and clean up the bug.

## Test Implementation Notes

- `tests/pages/EditBugModal.ts` currently only exposes `dialog`, `deleteButton`, and `cancelButton`. Extend it with locators for `titleInput` (`#edit-bug-title`), `severitySelect` (`#edit-bug-severity`), `stateSelect` (`#edit-bug-state`), `ownerInput` (`#edit-bug-owner`), `descriptionInput` (`#edit-bug-description`), `idInput` (`#edit-bug-id`), `saveButton`, and `closeButton` (the X, `aria-label="Close"`), following the pattern already used in `CreateBugModal.ts`.
- Note the `aria-label="Close"` X button and the "Closed" state-filter board button both match `getByRole('button', { name: 'Close' })` loosely — scope the X-button locator to `editBugModal.dialog.getByRole('button', { name: 'Close', exact: true })` to avoid ambiguity (this ambiguity was hit during exploration of the live app).
- This plan intentionally excludes the Delete button (covered by `specs/testing/delete-bug.md`) and the specific Open→Closed state-change save flow (covered end-to-end by `specs/testing/bug-closure.md`); it focuses on the modal's generic open/edit/save/cancel/close contract for non-state fields.
- Each test should create its own bug via the API in an `beforeEach`/setup step and delete it in `afterEach`, per the project's atomic-test convention.
