import { test, expect } from '@playwright/test';

test('should include CORS headers on every API response, including errors', async ({ request }) => {
  // Act — success case
  const okResponse = await request.get('/api/health');

  // Assert
  expect(okResponse.headers()['access-control-allow-origin']).toBe('http://localhost:5173');
  expect(okResponse.headers()['access-control-allow-methods']).toContain('GET');
  expect(okResponse.headers()['access-control-allow-methods']).toContain('POST');
  expect(okResponse.headers()['access-control-allow-methods']).toContain('PUT');
  expect(okResponse.headers()['access-control-allow-methods']).toContain('DELETE');
  expect(okResponse.headers()['access-control-allow-methods']).toContain('OPTIONS');
  expect(okResponse.headers()['access-control-allow-headers']).toBe('Content-Type');

  // Act — error case
  const errorResponse = await request.get('/api/bugs/abc');

  // Assert
  expect(errorResponse.status()).toBe(400);
  expect(errorResponse.headers()['access-control-allow-origin']).toBe('http://localhost:5173');
  expect(errorResponse.headers()['access-control-allow-headers']).toBe('Content-Type');
});
