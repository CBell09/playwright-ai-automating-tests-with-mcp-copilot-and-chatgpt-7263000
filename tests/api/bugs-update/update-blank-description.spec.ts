import { test, expect } from '@playwright/test';
import { createBug, deleteBugSafely, putBug, validUpdatePayload } from '../support/bugsApi';

test('should return 400 blank_description when description is blank', async ({ request }) => {
  // Arrange
  const bug = await createBug(request);

  // Act
  const response = await putBug(request, bug.id, validUpdatePayload({ description: '' }));

  // Assert
  expect(response.status()).toBe(400);
  expect(await response.json()).toEqual({ error: 'blank_description', message: 'Description is required.' });

  // Cleanup
  await deleteBugSafely(request, bug.id);
});
