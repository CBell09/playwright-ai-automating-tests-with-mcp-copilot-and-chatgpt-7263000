import { test, expect } from '@playwright/test';
import { createBug, deleteBugSafely, putBug, validUpdatePayload } from '../support/bugsApi';

test('should return 404 not_found for a nonexistent id', async ({ request }) => {
  // Arrange: create then delete a bug so its id is guaranteed not to exist anymore.
  const bug = await createBug(request);
  await deleteBugSafely(request, bug.id);

  // Act
  const response = await putBug(request, bug.id, validUpdatePayload());

  // Assert
  expect(response.status()).toBe(404);
  expect(await response.json()).toEqual({ error: 'not_found', message: 'Bug not found.' });
});
