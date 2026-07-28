import { test, expect } from '@playwright/test';

test('should return ok status with database connected', async ({ request }) => {
  // Act
  const response = await request.get('/api/health');

  // Assert
  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({
    ok: true,
    message: 'BuggyBoard API is running',
    database: 'connected',
  });
});
