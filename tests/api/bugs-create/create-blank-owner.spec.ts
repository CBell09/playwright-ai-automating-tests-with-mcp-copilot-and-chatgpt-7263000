import { test, expect } from '@playwright/test';
import { postBug, validCreatePayload } from '../support/bugsApi';

test('should return 400 blank_owner when owner is blank', async ({ request }) => {
  // Arrange
  const payload = validCreatePayload({ owner: '' });

  // Act
  const response = await postBug(request, payload);

  // Assert
  expect(response.status()).toBe(400);
  expect(await response.json()).toEqual({ error: 'blank_owner', message: 'Owner is required.' });
});
