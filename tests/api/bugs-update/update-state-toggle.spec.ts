import { test, expect } from '@playwright/test';
import { createBug, deleteBugSafely, putBug } from '../support/bugsApi';

test('should update state from OPEN to CLOSED and back', async ({ request }) => {
  // Arrange
  const bug = await createBug(request);
  const { title, severity, owner, description } = bug;

  // Act — close it
  const closeResponse = await putBug(request, bug.id, { title, severity, owner, description, state: 'closed' });

  // Assert
  expect(closeResponse.status()).toBe(200);
  expect((await closeResponse.json()).state).toBe('CLOSED');

  // Act — reopen it
  const openResponse = await putBug(request, bug.id, { title, severity, owner, description, state: 'open' });

  // Assert
  expect(openResponse.status()).toBe(200);
  expect((await openResponse.json()).state).toBe('OPEN');

  // Cleanup
  await deleteBugSafely(request, bug.id);
});
