import { test, expect } from '@playwright/test';
import { postBug, validCreatePayload, deleteBugSafely } from '../support/bugsApi';

test('should accept case-insensitive severity values', async ({ request }) => {
  // Arrange
  const payload = validCreatePayload({ severity: 'Mid' });

  // Act
  const response = await postBug(request, payload);
  const body = await response.json();

  // Assert
  expect(response.status()).toBe(201);
  expect(body.severity).toBe('MID');

  // Cleanup
  await deleteBugSafely(request, body.id);
});
