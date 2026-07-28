# Bug Status Filter Test Plan

## Application Overview

The board page has an Open/Closed state filter toggle above the bugs table (`frontend/src/BoardPage.tsx`, `role="group" aria-label="Filter by bug state"`), defaulting to Open, per `specs/features/13-bug-status.md`. This plan covers the filter control itself and how it composes with sort and search — distinct from `specs/testing/bug-closure.md`, which is a single end-to-end flow that creates a bug and closes it. No current test clicks the Open/Closed toggle or asserts on which message ("No bugs." vs. "No bugs matched.") appears for an empty filtered view.

Confirmed live against the running app:
- The state filter defaults to Open on load, indicated by a distinct active-state class (`bg-primary ...`) on the Open button.
- Selecting Closed with no closed bugs (but open bugs existing elsewhere in the data) shows the message **"No bugs matched."** — this is correct, spec'd behavior (`specs/features/13-bug-status.md`, "No bugs matched message when selected state has no bugs"), not a bug — but it means the empty-board case in `specs/testing/bug-board.md` ("No bugs.") and the empty-filtered-view case here ("No bugs matched.") are easy to conflate and should be tested separately to lock in the distinction.
- The search query text is retained when switching between the Open and Closed tabs (state filter and search are independent, composable filters, confirmed live).
- New bugs are created with state Open by default and immediately appear under the Open filter.

## Test Scenarios

### 1. Default Filter State

#### 1.1. should default to the Open filter on page load

**File:** `tests/bug-status-filter/default-filter-open.spec.ts`

**Steps:**
  1. Create one Open-state bug (default) and reload the board.
    - expect: The Open button is visually indicated as the active filter.
    - expect: The bug is visible in the table.
  2. Clean up the bug.

#### 1.2. should show a newly created bug under the Open filter

**File:** `tests/bug-status-filter/new-bug-is-open.spec.ts`

**Steps:**
  1. Create a bug through the Create Bug modal (leaving state unset, since it isn't part of that form).
    - expect: The new bug is visible while the Open filter is selected (the default).
  2. Clean up the bug.

### 2. Switching the Filter

#### 2.1. should show only closed bugs when the Closed filter is selected

**File:** `tests/bug-status-filter/select-closed-filter.spec.ts`

**Steps:**
  1. Create one Open bug and one Closed bug (via API, setting state) with distinct titles.
  2. Reload the board and click the Closed filter button.
    - expect: The closed bug is visible.
    - expect: The open bug is not visible.
  3. Clean up both bugs.

#### 2.2. should show a "No bugs matched." message when the selected state has no bugs

**File:** `tests/bug-status-filter/closed-filter-empty.spec.ts`

**Steps:**
  1. Create one Open bug via the API (ensure no Closed bugs exist for the test account/dataset).
  2. Reload the board and click the Closed filter button.
    - expect: The table displays the message "No bugs matched."
    - expect: No bug rows are shown.
  3. Clean up the bug.

### 3. Filter Combined with Sort and Search

#### 3.1. should apply the active sort order within the selected state filter

**File:** `tests/bug-status-filter/filter-with-sort.spec.ts`

**Steps:**
  1. Create two Open bugs with distinct titles ("Alpha ...", "Zeta ...") via the API and one Closed bug with a title that would otherwise sort between them.
  2. Reload the board (Open filter active by default) and sort by Title ascending.
    - expect: Only the two Open bugs are shown, in ascending title order.
    - expect: The Closed bug is not shown.
  3. Clean up all three bugs.

#### 3.2. should apply the search query within the selected state filter

**File:** `tests/bug-status-filter/filter-with-search.spec.ts`

**Steps:**
  1. Create one Open bug and one Closed bug that both contain a shared keyword in their titles, plus one Open bug that does not.
  2. Reload the board, switch to the Closed filter, and search for the shared keyword.
    - expect: Only the Closed bug matching the keyword is shown.
    - expect: Neither Open bug is shown (one is excluded by state, the other by the search text).
  3. Clean up all bugs.

#### 3.3. should retain the search query text when switching between Open and Closed filters

**File:** `tests/bug-status-filter/filter-preserves-search-text.spec.ts`

**Steps:**
  1. On the board, type a search query into the search field.
  2. Click the Closed filter button.
    - expect: The search field still shows the previously typed query text.
  3. Click back to the Open filter button.
    - expect: The search field still shows the same query text.

## Test Implementation Notes

- Add `selectStateFilter('OPEN' | 'CLOSED')` and `isStateFilterActive('OPEN' | 'CLOSED')` helpers to `tests/pages/BoardPage.ts`; `isStateFilterActive` can check for the active-state class or, more robustly, `aria-pressed`/visual state if the component is updated to expose one (currently it's inferred from the `bg-primary` class name, which is a bit brittle — consider asking the team whether `aria-pressed` should be added to these toggle buttons for a more stable locator).
- Creating a Closed bug directly requires the API (`PUT /api/bugs/:id` with `state: "closed"`, or a create-then-edit-then-close sequence via the UI) since the Create Bug modal never exposes state.
- Reuse the `getNoResultsMessage()` helper already in `tests/pages/BoardPage.ts` for the "No bugs matched." assertions (it already targets that exact text, per the search-bug suite).
