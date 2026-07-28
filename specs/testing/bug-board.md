# Bug Board Display Test Plan

## Application Overview

The `/board` page renders a table of bugs (`frontend/src/BoardPage.tsx`, `table[aria-label="Bugs"]`) with columns ID, Severity, Title, Owner in that order. This is the foundational display feature (`specs/features/07-bug-board.md`); today it is only ever exercised incidentally as a side effect of the create-bug, delete-bug, and search-bug suites — no spec asserts on column order, the empty-board state, the "one row per bug" contract, or that severity is rendered upper-case, independent of any other feature.

Confirmed live: the table always renders with `aria-label="Bugs"`; column headers are (in DOM order) `ID`, `Severity`, `Title`, `Owner`; when there are zero bugs in the whole system the table body shows a single row of text `"No bugs."`; when the current state/search filter matches nothing (but bugs exist elsewhere) it shows `"No bugs matched."` instead (see `specs/testing/bug-status-filter.md` for the state-filter-specific version of that message). Each real bug row has `role="button"` and `tabIndex=0`, and is also clickable via keyboard using Enter or Space (see `handleRowClick`/`onKeyDown` in `BoardPage.tsx`) — this keyboard path is not exercised by any current test.

## Test Scenarios

### 1. Table Structure

#### 1.1. should display the bugs table with columns in order ID, Severity, Title, Owner

**File:** `tests/bug-board/board-columns.spec.ts`

**Steps:**
  1. Log in with a seeded user and land on `/board`.
    - expect: A table labeled "Bugs" is visible.
    - expect: The column headers, read left to right, are exactly ID, Severity, Title, Owner.

#### 1.2. should display one row per bug with correct ID, severity, title, and owner

**File:** `tests/bug-board/board-rows.spec.ts`

**Steps:**
  1. Create two bugs via the API with distinct known values for severity, title, and owner.
  2. Reload `/board`.
    - expect: The table displays one row for each created bug.
    - expect: Each row shows that bug's ID, severity (upper case, e.g. "HIGH"), title, and owner in the corresponding columns.
  3. Clean up the created bugs.

#### 1.3. should show a "No bugs." message when the database has no bugs at all

**File:** `tests/bug-board/board-empty-state.spec.ts`

**Steps:**
  1. Ensure the authenticated user's visible bug set is empty (e.g. via a dedicated test account/dataset, or by deleting any bugs created during setup before asserting).
  2. Load `/board`.
    - expect: The table body displays the message "No bugs." and no data rows.

### 2. Row Interaction

#### 2.1. should open the edit modal when a bug row is activated via keyboard (Enter)

**File:** `tests/bug-board/board-row-keyboard-open.spec.ts`

**Steps:**
  1. Create a bug via the API/UI and reload the board.
  2. Focus the bug's row (e.g. via Tab or `locator.focus()`) and press Enter.
    - expect: The edit-bug modal opens for that bug.
  3. Close the modal and clean up the created bug.

#### 2.2. should open the edit modal when a bug row is activated via keyboard (Space)

**File:** `tests/bug-board/board-row-keyboard-open.spec.ts`

**Steps:**
  1. Create a bug via the API/UI and reload the board.
  2. Focus the bug's row and press Space.
    - expect: The edit-bug modal opens for that bug.
  3. Close the modal and clean up the created bug.

## Test Implementation Notes

- `tests/pages/BoardPage.ts` already exposes `bugsTable`, `getBugRowByTitle`, and `getNoResultsMessage` (for the "No bugs matched." case); add a `getEmptyBoardMessage()` (matching the literal "No bugs." text) and a `getColumnHeaders()` helper returning header text in order.
- The empty-board scenario is the trickiest to set up cleanly in a shared/seeded environment; prefer running it against a state filter or dataset guaranteed to be empty (e.g. assert against the count of bugs returned by `GET /api/bugs` before asserting the UI), or isolate it by deleting all bugs the test itself created and confirming no others remain owned by the test account.
- Keyboard-activation tests should assert the row itself receives focus before dispatching `Enter`/`Space`, per the existing `role="button"`/`tabIndex=0` contract on real bug rows (the placeholder "No bugs." / "No bugs matched." rows are plain `<tr>` elements and are not focusable or clickable).
