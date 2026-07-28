import { test, expect } from '@playwright/test';
import { deleteBug } from '../support/bugsApi';

test('should return 400 invalid_id for a non-numeric id', async ({ request }) => {
  // Act
  const response = await deleteBug(request, 'abc');

  // Assert
  expect(response.status()).toBe(400);
  expect(await response.json()).toEqual({ error: 'invalid_id', message: 'Bug ID must be a number.' });
});
