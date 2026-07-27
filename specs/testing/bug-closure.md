# Bug Closure End-to-End Plan

## Application Overview

End-to-end coverage for closing a bug in BuggyBoard. The plan exercises the authenticated board workflow, creates a new bug so there is a bug to close, opens the edit modal for that bug, changes its state to Closed, and verifies the bug is shown only in the Closed view after saving. If the current browser session is not authenticated, the test should log in with one of the seeded users from users.json (for example buggy/1970beetle or vanny/1979bus).

## Test Scenarios

### 1. Close Bug

**Seed:** `tests/seed.spec.ts`

#### 1.1. should create a bug and close it from the edit modal

**File:** `tests/close-bug/should-create-a-bug-and-close-it.spec.ts`

**Steps:**
  1. Open the BuggyBoard app and confirm the current session is authenticated. If the user is not logged in, navigate to the login page and authenticate with a seeded account from users.json.
    - expect: The app should land on the board page and show the board header, search field, and New Bug button.
  2. Create a new bug from the board by clicking New Bug, filling in a unique title, selecting a severity, leaving the default owner or setting a known owner, and adding a description.
    - expect: The create-bug modal should close after Save.
    - expect: The new bug should appear in the board list with an Open state.
  3. Open the newly created bug from the board table by clicking its row.
    - expect: The edit-bug modal should open with the bug's ID, title, severity, owner, description, and current state visible.
  4. Change the bug state from Open to Closed in the edit-bug modal and save the changes.
    - expect: The edit modal should close after Save.
    - expect: The bug should no longer appear in the Open filter view.
    - expect: The bug should appear in the Closed filter view.
