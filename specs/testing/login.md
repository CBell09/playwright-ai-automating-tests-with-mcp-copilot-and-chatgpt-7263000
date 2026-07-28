# Login End-to-End Test Plan

## Application Overview

BuggyBoard requires authentication before any board content is shown. The login page lives at `/login` and accepts a username/password pair validated against `users.json` (e.g. `buggy`/`1970beetle`, `vanny`/`1979bus`). This plan covers the login page itself, credential validation, redirects between `/login` and `/board` based on auth state, and session persistence. None of this is currently exercised by any spec under `tests/` — every existing test assumes login already succeeded (via `loginPage.loginWithFirstUser()` or a direct `login()` call) and none of them assert on the login page's own behavior.

Confirmed live against the running app (`frontend/src/LoginPage.tsx`, `frontend/src/auth.tsx`, `frontend/src/ProtectedRoute.tsx`, `backend/src/authService.ts`):
- Error copy is exact and code-driven: `"Please enter your username and password."` (both blank), `"Username cannot be blank."` (blank username only), `"Password cannot be blank."` (blank password only), `"Invalid username or password."` (wrong credentials — same generic message for bad username or bad password).
- The password `<input>` has `type="password"`.
- Visiting `/board` unauthenticated redirects to `/login`; visiting `/login` while authenticated redirects to `/board`; unknown routes redirect the same way root (`/`) does, based on auth state.
- Auth state is persisted in `localStorage` (`buggyboard_user`), so a page refresh does not log the user out.

## Test Scenarios

### 1. Login Page Display

#### 1.1. should display username, password, and login button on the login page

**File:** `tests/login/login-page-display.spec.ts`

**Steps:**
  1. Navigate directly to `/login` without authenticating.
    - expect: The login page is displayed (not redirected elsewhere).
    - expect: A username field is visible.
    - expect: A password field is visible and masked (`type="password"`).
    - expect: A login button is visible.

#### 1.2. should redirect unauthenticated users to the login page from any other route

**File:** `tests/login/redirect-unauthenticated.spec.ts`

**Steps:**
  1. With no session established, navigate to `/board`.
    - expect: The app redirects to `/login`.
  2. Navigate to `/`.
    - expect: The app redirects to `/login`.
  3. Navigate to an unknown path (e.g. `/does-not-exist`).
    - expect: The app redirects to `/login`.

### 2. Successful Login

#### 2.1. should log in with valid credentials and land on the board page

**File:** `tests/login/login-success.spec.ts`

**Steps:**
  1. Navigate to `/login` and enter a valid username/password from `users.json` (e.g. `buggy` / `1970beetle`).
  2. Click the Login button.
    - expect: The app navigates to `/board`.
    - expect: The board page's title bar and Logout button are visible (confirming authenticated state).

#### 2.2. should submit the login form when Enter is pressed in the username field

**File:** `tests/login/login-enter-key.spec.ts`

**Steps:**
  1. Navigate to `/login`, fill in a valid username and password.
  2. Focus the username field and press Enter.
    - expect: The same result as clicking Login — the app navigates to `/board`.

#### 2.3. should submit the login form when Enter is pressed in the password field

**File:** `tests/login/login-enter-key.spec.ts`

**Steps:**
  1. Navigate to `/login`, fill in a valid username and password.
  2. Focus the password field and press Enter.
    - expect: The same result as clicking Login — the app navigates to `/board`.

#### 2.4. should trim leading and trailing whitespace from the username before authenticating

**File:** `tests/login/login-trims-username.spec.ts`

**Steps:**
  1. Navigate to `/login` and enter a valid username with leading/trailing spaces (e.g. `"  buggy  "`) and the correct password.
  2. Click Login.
    - expect: Login succeeds and the app navigates to `/board`.

#### 2.5. should redirect an authenticated user away from the login page back to the board

**File:** `tests/login/redirect-authenticated-away-from-login.spec.ts`

**Steps:**
  1. Log in successfully so the user lands on `/board`.
  2. Navigate directly to `/login`.
    - expect: The app redirects back to `/board` rather than showing the login form.

#### 2.6. should keep the user authenticated after a page refresh

**File:** `tests/login/login-session-persists.spec.ts`

**Steps:**
  1. Log in successfully so the user lands on `/board`.
  2. Reload the page.
    - expect: The user remains on `/board` (not redirected to `/login`).
    - expect: The Logout button is still visible.

### 3. Failed Login

#### 3.1. should show an invalid-credentials message for an unknown username

**File:** `tests/login/login-invalid-username.spec.ts`

**Steps:**
  1. Navigate to `/login`, enter a username that is not in `users.json` and any non-blank password.
  2. Click Login.
    - expect: The user remains on `/login` (not authenticated).
    - expect: An error message reading `"Invalid username or password."` is displayed.

#### 3.2. should show an invalid-credentials message for a wrong password

**File:** `tests/login/login-invalid-password.spec.ts`

**Steps:**
  1. Navigate to `/login`, enter a valid username (e.g. `buggy`) with an incorrect password.
  2. Click Login.
    - expect: The user remains on `/login` (not authenticated).
    - expect: An error message reading `"Invalid username or password."` is displayed.

#### 3.3. should show a blank-username message when only the password is filled in

**File:** `tests/login/login-blank-username.spec.ts`

**Steps:**
  1. Navigate to `/login`, leave username blank, enter any password.
  2. Click Login.
    - expect: The user remains on `/login`.
    - expect: An error message reading `"Username cannot be blank."` is displayed.

#### 3.4. should show a blank-password message when only the username is filled in

**File:** `tests/login/login-blank-password.spec.ts`

**Steps:**
  1. Navigate to `/login`, enter a valid username, leave password blank.
  2. Click Login.
    - expect: The user remains on `/login`.
    - expect: An error message reading `"Password cannot be blank."` is displayed.

#### 3.5. should show a missing-credentials message when both fields are blank

**File:** `tests/login/login-blank-both.spec.ts`

**Steps:**
  1. Navigate to `/login` and click Login without entering anything.
    - expect: The user remains on `/login`.
    - expect: An error message reading `"Please enter your username and password."` is displayed.

## Test Implementation Notes

- Add a `LoginPage.errorMessage` locator (`page.getByRole('alert')`) to `tests/pages/LoginPage.ts` if not already present, plus a plain `login(username, password)` helper that fills both fields and clicks Login without asserting success, so failure-path tests can reuse it.
- These tests do not require the `tests/seed.spec.ts` bug-seeding fixture; they only need `users.json` credentials.
- Redirect assertions should check `page.url()` (or `expect(page).toHaveURL(...)`) rather than page content alone, since the SPA may render intermediate states.
