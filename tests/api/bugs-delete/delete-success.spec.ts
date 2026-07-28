import { test, expect } from '@playwright/test';
import { createBug, deleteBug } from '../support/bugsApi';

test('should delete an existing bug and return 204', async ({ request }) => {
  // Arrange
  const bug = await createBug(request);

  // Act
  const response = await deleteBug(request, bug.id);

  // Assert
  expect(response.status()).toBe(204);
  expect(await response.body()).toEqual(Buffer.from(''));
});
