# Board Severity Color-Coding Test Plan

## Application Overview

Bug severity on the board is color-coded per `specs/features/08-board-severity.md`: HIGH uses a strong terracotta (`--color-severity-high` / `#b84a2e`), MID an amber/tan (`--color-severity-mid` / `#a67c47`), LOW a muted sage (`--color-severity-low` / `#4a6b5e`), applied via `.severity-badge-{high,mid,low}` CSS classes on a `<span>` (`frontend/src/BoardPage.tsx`, `frontend/src/index.css`). No test currently asserts on severity styling — existing tests only check severity as plain text (e.g. within search/sort assertions), never the color-coding contract itself.

Confirmed live: each severity badge is a `<span class="severity-badge severity-badge-{high|mid|low}" data-severity="HIGH|MID|LOW">TEXT</span>`, giving a reliable, non-visual way to assert the correct color class is applied per severity without parsing computed CSS colors.

## Test Scenarios

### 1. Severity Badge Styling

#### 1.1. should render a HIGH severity bug with the high-severity badge class

**File:** `tests/board-severity/severity-badge-classes.spec.ts`

**Steps:**
  1. Create a bug with severity HIGH via the API and reload the board.
    - expect: The bug's severity badge has class `severity-badge-high` and `data-severity="HIGH"`.
  2. Clean up the created bug.

#### 1.2. should render a MID severity bug with the mid-severity badge class

**File:** `tests/board-severity/severity-badge-classes.spec.ts`

**Steps:**
  1. Create a bug with severity MID via the API and reload the board.
    - expect: The bug's severity badge has class `severity-badge-mid` and `data-severity="MID"`.
  2. Clean up the created bug.

#### 1.3. should render a LOW severity bug with the low-severity badge class

**File:** `tests/board-severity/severity-badge-classes.spec.ts`

**Steps:**
  1. Create a bug with severity LOW via the API and reload the board.
    - expect: The bug's severity badge has class `severity-badge-low` and `data-severity="LOW"`.
  2. Clean up the created bug.

#### 1.4. should apply visually distinct badge classes when multiple severities are present together

**File:** `tests/board-severity/severity-badge-distinct.spec.ts`

**Steps:**
  1. Create one bug each of severity HIGH, MID, and LOW via the API and reload the board.
    - expect: All three badges are visible simultaneously.
    - expect: Each bug's badge class corresponds uniquely to its severity (`severity-badge-high`/`-mid`/`-low`), i.e. no two different severities share the same badge class.
  2. Clean up the created bugs.

## Test Implementation Notes

- Prefer asserting on `data-severity` and the `severity-badge-{level}` class name over computed color values (`getComputedStyle`) — the class name is the stable contract; the hex values live in `frontend/src/index.css` and are covered by the design spec, not by E2E behavior tests.
- Add a `getSeverityBadgeForTitle(title)` helper to `tests/pages/BoardPage.ts` returning the `.severity-badge` locator scoped to that bug's row, to avoid duplicating the `table[aria-label="Bugs"] tbody tr` traversal already used by `getBugRowByTitle`.
- This suite only covers the board table's badges. The edit-bug modal's severity dropdown also uses matching color classes (`severity-select-{level}`) per `specs/features/09-edit-bug.md`; that is covered in `specs/testing/edit-bug.md` instead, since it's part of the edit-bug modal's contract, not the board's.
