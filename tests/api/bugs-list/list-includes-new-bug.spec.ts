import { test, expect } from '@playwright/test';
import { createBug, deleteBugSafely, listBugs } from '../support/bugsApi';

test('should include a newly created bug immediately', async ({ request }) => {
  // Arrange
  const bug = await createBug(request);

  // Act
  const response = await listBugs(request);
  const body = await response.json();

  // Assert
  expect(response.status()).toBe(200);
  expect(body).toEqual(
    expect.arrayContaining([expect.objectContaining({ id: bug.id, title: bug.title })])
  );

  // Cleanup
  await deleteBugSafely(request, bug.id);
});
