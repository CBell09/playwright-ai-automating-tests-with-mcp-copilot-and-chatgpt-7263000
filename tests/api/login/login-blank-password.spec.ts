import { test, expect } from '@playwright/test';

test('should return 400 blank_password when only username is provided', async ({ request }) => {
  // Act
  const response = await request.post('/api/login', {
    data: { username: 'buggy', password: '' },
  });

  // Assert
  expect(response.status()).toBe(400);
  expect(await response.json()).toEqual({
    error: 'blank_password',
    message: 'Password cannot be blank.',
  });
});
