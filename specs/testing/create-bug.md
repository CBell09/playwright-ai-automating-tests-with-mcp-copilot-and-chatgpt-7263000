# Create bug end-to-end test plan

## Application Overview

End-to-end Playwright coverage for creating a new bug in BuggyBoard, including opening the modal, submitting valid data, closing without saving, and validating required inputs.

## Test Scenarios

### 1. Create bug flow

**Seed:** `tests/seed.spec.ts`

#### 1.1. opens the create bug modal from the board page

**File:** `tests/create-bug/opens-create-bug-modal.spec.ts`

**Steps:**
  1. Log in to BuggyBoard and navigate to the board page.
    - expect: The board page is visible with the New Bug button.
  2. Click the New Bug button in the title bar.
    - expect: A dialog for creating a bug is displayed.
    - expect: The dialog contains fields for title, severity, owner, and description.

#### 1.2. creates a new bug with valid required fields

**File:** `tests/create-bug/creates-new-bug.spec.ts`

**Steps:**
  1. Open the create bug dialog from the board page.
    - expect: The dialog is visible and ready for input.
  2. Fill in a title, select a severity, confirm the owner value, and enter a description.
    - expect: The entered values are shown in their respective fields.
  3. Click Save.
    - expect: The dialog closes.
    - expect: A new bug entry appears in the board with the submitted title and severity.

#### 1.3. prefills the owner with the signed-in user

**File:** `tests/create-bug/prefills-owner.spec.ts`

**Steps:**
  1. Log in as a known user and open the create bug dialog.
    - expect: The owner field is pre-filled with the signed-in username.

#### 1.4. cancels bug creation without saving

**File:** `tests/create-bug/cancels-bug-creation.spec.ts`

**Steps:**
  1. Open the create bug dialog and enter values in the fields.
    - expect: The modal contains the entered values.
  2. Click Cancel.
    - expect: The dialog closes.
    - expect: No new bug is added to the board.

#### 1.5. closes the modal with the close button or Escape key without saving

**File:** `tests/create-bug/closes-modal-with-close-controls.spec.ts`

**Steps:**
  1. Open the create bug dialog and enter values in the fields.
    - expect: The modal contains the entered values.
  2. Click the X button in the modal header.
    - expect: The dialog closes.
    - expect: No new bug is added to the board.
  3. Reopen the dialog, enter values again, and press Escape.
    - expect: The dialog closes.
    - expect: No new bug is added to the board.

#### 1.6. prevents save when required fields are blank

**File:** `tests/create-bug/validates-required-fields.spec.ts`

**Steps:**
  1. Open the create bug dialog.
    - expect: The dialog is visible.
  2. Leave one or more required fields empty and attempt to save.
    - expect: The dialog remains open.
    - expect: The user is shown validation feedback for the missing required field or fields.
    - expect: No new bug is added to the board.
