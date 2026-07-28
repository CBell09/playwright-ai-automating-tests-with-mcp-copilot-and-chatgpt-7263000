import { test, expect } from '@playwright/test';

test('should return 400 blank_username when only password is provided', async ({ request }) => {
  // Act
  const response = await request.post('/api/login', {
    data: { username: '', password: 'somepassword' },
  });

  // Assert
  expect(response.status()).toBe(400);
  expect(await response.json()).toEqual({
    error: 'blank_username',
    message: 'Username cannot be blank.',
  });
});
