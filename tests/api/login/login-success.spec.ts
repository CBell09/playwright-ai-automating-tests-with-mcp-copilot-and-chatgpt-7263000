import { test, expect } from '@playwright/test';

test('should return 200 and the username for valid credentials', async ({ request }) => {
  // Act
  const response = await request.post('/api/login', {
    data: { username: 'buggy', password: '1970beetle' },
  });

  // Assert
  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({ username: 'buggy' });
});
