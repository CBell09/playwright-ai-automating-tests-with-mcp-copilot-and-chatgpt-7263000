import { test, expect } from '@playwright/test';
import { createBug, deleteBug, getBug } from '../support/bugsApi';

test('should make the deleted bug return 404 on a subsequent GET', async ({ request }) => {
  // Arrange
  const bug = await createBug(request);

  // Act
  const deleteResponse = await deleteBug(request, bug.id);
  expect(deleteResponse.status()).toBe(204);
  const getResponse = await getBug(request, bug.id);

  // Assert
  expect(getResponse.status()).toBe(404);
  expect(await getResponse.json()).toEqual({ error: 'not_found', message: 'Bug not found.' });
});
