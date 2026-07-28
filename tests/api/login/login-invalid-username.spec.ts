import { test, expect } from '@playwright/test';
import { randomUUID } from 'crypto';

test('should return 401 invalid_credentials for an unknown username', async ({ request }) => {
  // Act
  const response = await request.post('/api/login', {
    data: { username: `no-such-user-${randomUUID().slice(0, 8)}`, password: 'whatever' },
  });

  // Assert
  expect(response.status()).toBe(401);
  expect(await response.json()).toEqual({
    error: 'invalid_credentials',
    message: 'Invalid username or password.',
  });
});
