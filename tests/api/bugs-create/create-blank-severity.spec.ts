import { test, expect } from '@playwright/test';
import { postBug, validCreatePayload } from '../support/bugsApi';

test('should return 400 blank_severity when severity is blank', async ({ request }) => {
  // Arrange
  const payload = validCreatePayload({ severity: '' });

  // Act
  const response = await postBug(request, payload);

  // Assert
  expect(response.status()).toBe(400);
  expect(await response.json()).toEqual({
    error: 'blank_severity',
    message: 'Severity is required (high, mid, or low).',
  });
});
