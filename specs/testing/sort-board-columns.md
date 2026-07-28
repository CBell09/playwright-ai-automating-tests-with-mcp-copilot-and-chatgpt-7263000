# Sort Board Columns Test Plan

## Application Overview

The board table (`frontend/src/BoardPage.tsx`) supports single-column sorting on ID, Severity, Title, and Owner (`specs/features/10-sort-board-columns.md`). The default sort is Severity descending. Clicking a header toggles ascending/descending if it's already the active sort column, or resets to ascending if switching to a new column. No test currently clicks a column header or asserts on sort order/indicators — sort is entirely uncovered.

Confirmed live against the running app:
- Column header `<th>` elements carry `aria-sort="ascending"|"descending"` only for the active sort column (`undefined`/absent otherwise), and the header button shows a `↑`/`↓` glyph next to the label.
- Default state on load: Severity column has `aria-sort="descending"`, header text renders as `Severity↓`, and the first row is the highest severity (severity order for sorting is LOW < MID < HIGH).
- Clicking Title once sorts ascending (alphabetical); clicking it again reverses to descending.
- Clicking a *different* header (e.g. ID after Title was sorted) always starts that column at ascending — the new column does not inherit the previous column's direction, and the previous column's indicator disappears.

## Test Scenarios

### 1. Default Sort

#### 1.1. should default to sorting by Severity descending with the correct indicator

**File:** `tests/sort-board-columns/default-sort.spec.ts`

**Steps:**
  1. Create bugs with severities HIGH, MID, and LOW via the API and reload the board (no prior sort interaction).
    - expect: Bugs are displayed in order HIGH, then MID, then LOW.
    - expect: The Severity column header shows the descending indicator (`aria-sort="descending"`, down arrow).
    - expect: No other column header shows a sort indicator.
  2. Clean up the created bugs.

### 2. Sorting by Column

#### 2.1. should sort ascending on the first click of a column header

**File:** `tests/sort-board-columns/sort-toggle.spec.ts`

**Steps:**
  1. Create bugs with distinct titles (e.g. "Alpha issue", "Mango issue", "Zebra issue") via the API and reload the board.
  2. Click the Title column header.
    - expect: The Title header shows the ascending indicator (`aria-sort="ascending"`, up arrow).
    - expect: Bugs are displayed in ascending alphabetical order by title.
    - expect: Only the Title column shows a sort indicator.

#### 2.2. should toggle to descending on a second click of the same column header

**File:** `tests/sort-board-columns/sort-toggle.spec.ts`

**Steps:**
  1. With the same seeded bugs, click the Title column header twice.
    - expect: After the second click, the Title header shows the descending indicator.
    - expect: Bugs are displayed in descending alphabetical order by title.

#### 2.3. should reset to ascending when switching the active sort to a different column

**File:** `tests/sort-board-columns/sort-column-switch.spec.ts`

**Steps:**
  1. With seeded bugs of varied owners and titles, click Owner to sort by Owner (now descending after a second click, to establish a non-default direction).
  2. Click the ID column header.
    - expect: The ID column now shows the ascending indicator.
    - expect: The Owner column no longer shows any sort indicator.
    - expect: Bugs are displayed in ascending order by ID, regardless of the prior Owner sort direction.

#### 2.4. should support sorting by Severity ascending (LOW, MID, HIGH) after the default descending sort

**File:** `tests/sort-board-columns/sort-severity-order.spec.ts`

**Steps:**
  1. Create bugs with severities HIGH, MID, and LOW via the API and reload the board.
  2. Click the Severity column header once (board defaults to Severity descending, so this toggles to ascending).
    - expect: Bugs are displayed in order LOW, then MID, then HIGH.
  3. Click the Severity column header again.
    - expect: Bugs are displayed in order HIGH, then MID, then LOW.
  4. Clean up the created bugs.

#### 2.5. should allow sorting by ID and Owner columns

**File:** `tests/sort-board-columns/sort-all-columns.spec.ts`

**Steps:**
  1. Create a few bugs with distinct owners via the API and reload the board.
  2. Click the ID column header.
    - expect: Bugs are displayed in ascending order by ID.
  3. Click the Owner column header.
    - expect: Bugs are displayed in ascending order by owner, and the ID header no longer shows a sort indicator.
  4. Clean up the created bugs.

## Test Implementation Notes

- Add `sortByColumn(column: 'ID'|'Severity'|'Title'|'Owner')` and `getSortIndicator(column)` (reading `aria-sort` off the `<th>`) helpers to `tests/pages/BoardPage.ts`, plus a `getColumnValues(column)` helper (reading the corresponding `<td>` text down the visible rows) so scenarios can assert order without hardcoding cell indices per test.
- Use distinctive, test-run-unique titles/owners (per the `randomUUID()` suffix pattern already used in `tests/search-bug/`) so sort-order assertions aren't polluted by bugs left over from other parallel tests sharing the board/account.
- These tests need at least 2–3 bugs with distinguishable values per sort key; seed them via the `request` fixture (API) in `beforeEach` and delete them in `afterEach`, mirroring `tests/search-bug/search-atomic.spec.ts`.
