# User Story

As a BuggyBoard user,
I want to delete bugs,
So that I can remove bugs that are incorrect or no longer needed.

As a BuggyBoard user,
I want to be asked to confirm before a bug is deleted,
So that I don't lose data by accidentally clicking the delete button.


# Design

- The "Edit bug" modal has a "delete" button.
- Clicking the delete button does **not** delete the bug immediately. Instead it opens a confirmation modal on top of the edit modal.
- The confirmation modal:
  - Displays a warning message asking the user to confirm the deletion (e.g. referencing the bug's ID or title) and stating that the action cannot be undone.
  - Has a "confirm delete" button and a "cancel" button.
  - Follows the same modal look-and-feel rules as the rest of the app (see `specs/design/theme.md`): consistent layout/header/button style, an **X** in the upper right corner, and the Escape key — both have the same effect as cancel.
- Confirming the deletion:
  - Removes the bug from the database.
  - Closes the confirmation modal.
  - Closes the edit modal.
  - The board no longer displays that bug.
- Canceling the confirmation (via the cancel button, the X, the Escape key, or clicking the backdrop) does **not** delete the bug:
  - The bug is left in place, unchanged, in the database.
  - The confirmation modal is closed.
  - The edit modal remains open, showing the bug's data unchanged.


# Acceptance Criteria

Scenario: Edit bug modal displays a delete button
  Given the user is authenticated into the app
  And the user is on the board page
  And there are bugs in the database
  When the user opens the edit modal for a bug
  Then the modal displays a delete button

Scenario: Clicking delete opens a confirmation modal instead of deleting immediately
  Given the user is authenticated into the app
  And the user is on the board page
  And there are bugs in the database
  When the user opens the edit modal for a bug
  And the user clicks the delete button
  Then a confirmation modal is displayed
  And the bug is not yet removed from the database
  And the board still displays that bug

Scenario: Confirming deletion removes the bug and closes both modals
  Given the user is authenticated into the app
  And the edit modal is open for a bug
  And the user has clicked the delete button to open the confirmation modal
  When the user clicks the confirm delete button
  Then the bug is removed from the database
  And the confirmation modal is closed
  And the edit modal is closed
  And the board no longer displays that bug

Scenario: Canceling the confirmation modal leaves the bug in place
  Given the user is authenticated into the app
  And the edit modal is open for a bug
  And the user has clicked the delete button to open the confirmation modal
  When the user clicks the cancel button on the confirmation modal
  Then the confirmation modal is closed
  And the bug is not removed from the database
  And the edit modal remains open showing the bug's data unchanged

Scenario: Closing the confirmation modal with the X button leaves the bug in place
  Given the user is authenticated into the app
  And the edit modal is open for a bug
  And the user has clicked the delete button to open the confirmation modal
  When the user clicks the X button in the upper right corner of the confirmation modal
  Then the confirmation modal is closed
  And the bug is not removed from the database
  And the edit modal remains open showing the bug's data unchanged

Scenario: Closing the confirmation modal with the Escape key leaves the bug in place
  Given the user is authenticated into the app
  And the edit modal is open for a bug
  And the user has clicked the delete button to open the confirmation modal
  When the user presses the Escape key
  Then the confirmation modal is closed
  And the bug is not removed from the database
  And the edit modal remains open showing the bug's data unchanged
