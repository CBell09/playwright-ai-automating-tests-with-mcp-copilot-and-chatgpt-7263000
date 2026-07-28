import { test, expect } from '@playwright/test';
import { postBug } from '../support/bugsApi';

test('should return 400 blank_title when the request body is empty', async ({ request }) => {
  // Act
  const response = await postBug(request, {});

  // Assert
  expect(response.status()).toBe(400);
  expect(await response.json()).toEqual({ error: 'blank_title', message: 'Title is required.' });
});
