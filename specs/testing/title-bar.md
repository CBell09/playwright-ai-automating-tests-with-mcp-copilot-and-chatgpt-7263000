# Title Bar Display Test Plan

## Application Overview

The board page renders a `TitleBar` (`frontend/src/TitleBar.tsx`) containing the BuggyBoard logo and title on the left and the Logout button on the right. Per `specs/features/04-title-bar.md`, interactions are out of scope for this feature — only structure/presence matters here. No existing spec asserts on the title bar as a unit (logo, title text, and button layout together); its pieces are only incidentally visible in create-bug/search specs.

Confirmed live: the header contains a logo `<img alt="BuggyBoard">` in a rounded box, an `<h1>` reading "BuggyBoard", and a right-aligned Logout button. (Note: the *login* page also shows the same logo image but with `alt=""` — decorative there — which is a useful distinguishing detail if a test wants to assert the title-bar logo specifically has a non-empty accessible name.)

## Test Scenarios

### 1. Title Bar Structure

#### 1.1. should display the logo, app title, and logout button on the board page

**File:** `tests/title-bar/title-bar-display.spec.ts`

**Steps:**
  1. Log in with a seeded user and land on `/board`.
    - expect: The title bar's logo image is visible.
    - expect: The title bar displays the text "BuggyBoard".
    - expect: A "Logout" button is visible in the title bar.

#### 1.2. should display the logo to the left of the title and the logout button to the right

**File:** `tests/title-bar/title-bar-layout.spec.ts`

**Steps:**
  1. Log in and land on `/board`.
    - expect: The logo element appears before (precedes in DOM/left of) the "BuggyBoard" title text.
    - expect: The Logout button is positioned at the opposite (right) side of the header from the logo/title group.

## Test Implementation Notes

- These are lightweight structural checks; consider a small `TitleBar`-scoped locator group in `tests/pages/BoardPage.ts` (or a new `tests/pages/TitleBar.ts` page object per `specs/engineering/test-automation-patterns.md`'s one-class-per-file rule) exposing `logo`, `titleText`, and `logoutButton`.
- Layout/position assertions can use `page.locator('header')` bounding boxes (`boundingBox()` x-coordinates) or simple DOM order checks (`locator.and`/`evaluate` comparing `compareDocumentPosition`) rather than pixel-perfect visual assertions.
- This plan intentionally does not cover the New Bug button or search field — those belong to the create-bug and search-bug suites respectively, since `TitleBar` only renders them conditionally when the board page supplies the corresponding props.
