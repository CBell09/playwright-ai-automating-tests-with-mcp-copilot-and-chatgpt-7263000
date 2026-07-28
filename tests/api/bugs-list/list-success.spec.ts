import { test, expect } from '@playwright/test';
import { createBug, deleteBugSafely, listBugs } from '../support/bugsApi';

test('should return 200 with an array of all bugs', async ({ request }) => {
  // Arrange
  const bug = await createBug(request);

  // Act
  const response = await listBugs(request);
  const body = await response.json();

  // Assert
  expect(response.status()).toBe(200);
  expect(Array.isArray(body)).toBe(true);
  for (const item of body) {
    expect(item).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        title: expect.any(String),
        severity: expect.any(String),
        owner: expect.any(String),
        description: expect.any(String),
        state: expect.any(String),
      })
    );
  }

  // Cleanup
  await deleteBugSafely(request, bug.id);
});
