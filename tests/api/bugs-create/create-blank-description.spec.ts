import { test, expect } from '@playwright/test';
import { postBug, validCreatePayload } from '../support/bugsApi';

test('should return 400 blank_description when description is blank', async ({ request }) => {
  // Arrange
  const payload = validCreatePayload({ description: '' });

  // Act
  const response = await postBug(request, payload);

  // Assert
  expect(response.status()).toBe(400);
  expect(await response.json()).toEqual({ error: 'blank_description', message: 'Description is required.' });
});
