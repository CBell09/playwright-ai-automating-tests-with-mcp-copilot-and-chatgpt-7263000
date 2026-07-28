import { test, expect } from '@playwright/test';
import { createBug, deleteBugSafely, putBug, validUpdatePayload } from '../support/bugsApi';

test('should return 400 blank_severity when severity is invalid', async ({ request }) => {
  // Arrange
  const bug = await createBug(request);

  // Act
  const response = await putBug(request, bug.id, validUpdatePayload({ severity: 'urgent' }));

  // Assert
  expect(response.status()).toBe(400);
  expect(await response.json()).toEqual({
    error: 'blank_severity',
    message: 'Severity is required (high, mid, or low).',
  });

  // Cleanup
  await deleteBugSafely(request, bug.id);
});
