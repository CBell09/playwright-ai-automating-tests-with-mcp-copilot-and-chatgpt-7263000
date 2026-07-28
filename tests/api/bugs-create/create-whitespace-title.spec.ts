import { test, expect } from '@playwright/test';
import { postBug, validCreatePayload } from '../support/bugsApi';

test('should return 400 blank_title when title is whitespace only', async ({ request }) => {
  // Arrange
  const payload = validCreatePayload({ title: '   ' });

  // Act
  const response = await postBug(request, payload);

  // Assert
  expect(response.status()).toBe(400);
  expect(await response.json()).toEqual({ error: 'blank_title', message: 'Title is required.' });
});
