import { test, expect } from '@playwright/test';
import { postBug, validCreatePayload, deleteBugSafely } from '../support/bugsApi';

test('should create a bug and return 201 with a generated id and OPEN state', async ({ request }) => {
  // Arrange
  const payload = validCreatePayload({ severity: 'high' });

  // Act
  const response = await postBug(request, payload);
  const body = await response.json();

  // Assert
  expect(response.status()).toBe(201);
  expect(body).toMatchObject({
    title: payload.title,
    severity: 'HIGH',
    owner: payload.owner,
    description: payload.description,
    state: 'OPEN',
  });
  expect(typeof body.id).toBe('number');

  // Cleanup
  await deleteBugSafely(request, body.id);
});
