import { test, expect } from '@playwright/test';

test('should return 400 missing_credentials when both fields are blank', async ({ request }) => {
  // Act
  const response = await request.post('/api/login', {
    data: { username: '', password: '' },
  });

  // Assert
  expect(response.status()).toBe(400);
  expect(await response.json()).toEqual({
    error: 'missing_credentials',
    message: 'Please enter your username and password.',
  });
});
