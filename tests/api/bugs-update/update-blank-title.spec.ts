import { test, expect } from '@playwright/test';
import { createBug, deleteBugSafely, putBug, validUpdatePayload } from '../support/bugsApi';

test('should return 400 blank_title when title is blank', async ({ request }) => {
  // Arrange
  const bug = await createBug(request);

  // Act
  const response = await putBug(request, bug.id, validUpdatePayload({ title: '' }));

  // Assert
  expect(response.status()).toBe(400);
  expect(await response.json()).toEqual({ error: 'blank_title', message: 'Title is required.' });

  // Cleanup
  await deleteBugSafely(request, bug.id);
});
