import { test, expect } from '@playwright/test';
import { createBug, deleteBugSafely, getBug } from '../support/bugsApi';

test('should leniently parse an id with trailing non-numeric characters', async ({ request }) => {
  // Arrange
  const bug = await createBug(request);

  // Act — parseInt("<id>abc", 10) evaluates to <id>; the trailing letters are silently ignored.
  const response = await getBug(request, `${bug.id}abc`);

  // Assert
  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual(bug);

  // Cleanup
  await deleteBugSafely(request, bug.id);
});
