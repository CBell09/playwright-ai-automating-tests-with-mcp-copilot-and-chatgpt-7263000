import { test, expect } from '@playwright/test';

test('should return 401 invalid_credentials for a wrong password', async ({ request }) => {
  // Act
  const response = await request.post('/api/login', {
    data: { username: 'buggy', password: 'wrong-password' },
  });

  // Assert
  expect(response.status()).toBe(401);
  expect(await response.json()).toEqual({
    error: 'invalid_credentials',
    message: 'Invalid username or password.',
  });
});
