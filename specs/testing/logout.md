# Logout End-to-End Test Plan

## Application Overview

The Logout button lives in the title bar on the board page (`frontend/src/TitleBar.tsx`) and calls `auth.logout()` before navigating to `/login`. Logout clears the `buggyboard_user` key from `localStorage`. No test under `tests/` currently exercises logout directly — it is never clicked in any existing spec.

Confirmed live: clicking Logout navigates to `/login`; a subsequent direct visit to `/board` redirects back to `/login` (the `ProtectedRoute` re-checks `isAuthenticated` on every render, so there is no stale-session window).

## Test Scenarios

### 1. Logout

#### 1.1. should log out and redirect to the login page

**File:** `tests/logout/logout-redirects-to-login.spec.ts`

**Steps:**
  1. Log in with a seeded user (`tests/seed.spec.ts` account) and confirm the board page is displayed.
  2. Click the Logout button in the title bar.
    - expect: The app navigates to `/login`.
    - expect: The login page's username/password fields and Login button are visible.

#### 1.2. should prevent access to the board page after logging out

**File:** `tests/logout/logout-blocks-protected-route.spec.ts`

**Steps:**
  1. Log in, then click Logout.
  2. Navigate directly to `/board`.
    - expect: The app redirects to `/login` rather than showing the board.

#### 1.3. should not restore the session via the browser back button after logout

**File:** `tests/logout/logout-back-button.spec.ts`

**Steps:**
  1. Log in so the user is on `/board`.
  2. Click Logout, landing on `/login`.
  3. Use the browser back button.
    - expect: The app does not display the board page's protected content.
    - expect: If the back navigation lands on a protected route, the app redirects to `/login`.
    - expect: The user remains unauthenticated (Logout button is not present; Login form is shown).

## Test Implementation Notes

- Add a `logout()` method to whichever page object represents the title bar (or to `BoardPage`) that clicks the Logout button, e.g. `page.getByRole('button', { name: 'Logout' })`, per `tests/pages/BoardPage.ts` conventions.
- The back-button scenario should use `page.goBack()` and then assert on `page.url()` and on visibility of login vs. board elements.
- These tests only need a seeded login (`loginPage.loginWithFirstUser()` or `login()` helper from `tests/delete-bug/test-helpers.ts`); no bug data is required.
