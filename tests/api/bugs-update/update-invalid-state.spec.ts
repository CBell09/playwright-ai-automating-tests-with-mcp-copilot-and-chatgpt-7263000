import { test, expect } from '@playwright/test';
import { createBug, deleteBugSafely, putBug, validUpdatePayload } from '../support/bugsApi';

test('should return 400 invalid_state when state is not Open or Closed', async ({ request }) => {
  // Arrange
  const bug = await createBug(request);

  // Act — unrecognized state value
  const badStateResponse = await putBug(request, bug.id, validUpdatePayload({ state: 'In Progress' }));

  // Assert
  expect(badStateResponse.status()).toBe(400);
  expect(await badStateResponse.json()).toEqual({
    error: 'invalid_state',
    message: 'State must be Open or Closed.',
  });

  // Act — blank state
  const blankStateResponse = await putBug(request, bug.id, validUpdatePayload({ state: '' }));

  // Assert
  expect(blankStateResponse.status()).toBe(400);
  expect(await blankStateResponse.json()).toEqual({
    error: 'invalid_state',
    message: 'State must be Open or Closed.',
  });

  // Cleanup
  await deleteBugSafely(request, bug.id);
});
