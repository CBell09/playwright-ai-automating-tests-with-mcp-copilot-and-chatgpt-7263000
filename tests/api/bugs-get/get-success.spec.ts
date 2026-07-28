import { test, expect } from '@playwright/test';
import { createBug, deleteBugSafely, getBug } from '../support/bugsApi';

test('should return 200 with the bug matching an existing id', async ({ request }) => {
  // Arrange
  const bug = await createBug(request);

  // Act
  const response = await getBug(request, bug.id);

  // Assert
  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual(bug);

  // Cleanup
  await deleteBugSafely(request, bug.id);
});
