import { test, expect } from '@playwright/test';
import { createBug, deleteBug } from '../support/bugsApi';

test('should return 404 on a second delete of the same id', async ({ request }) => {
  // Arrange
  const bug = await createBug(request);

  // Act
  const firstResponse = await deleteBug(request, bug.id);
  const secondResponse = await deleteBug(request, bug.id);

  // Assert
  expect(firstResponse.status()).toBe(204);
  expect(secondResponse.status()).toBe(404);
  expect(await secondResponse.json()).toEqual({ error: 'not_found', message: 'Bug not found.' });
});
