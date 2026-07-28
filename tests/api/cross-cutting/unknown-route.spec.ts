import { test, expect } from '@playwright/test';

test('should return 404 for unknown API routes', async ({ request }) => {
  // Act
  const response = await request.get('/api/does-not-exist');

  // Assert
  expect(response.status()).toBe(404);
});
