import { test, expect } from '@playwright/test';

test('should return 404 for unsupported methods on /api/health', async ({ request }) => {
  // Act
  const response = await request.post('/api/health');

  // Assert
  expect(response.status()).toBe(404);
});
