import { test, expect } from '@playwright/test';
import { createBug, deleteBugSafely, getBug, putBug } from '../support/bugsApi';

test('should leave the bug unchanged in the database when validation fails', async ({ request }) => {
  // Arrange
  const bug = await createBug(request, { severity: 'low', owner: 'original-owner', description: 'Original description.' });

  // Act — invalid update: blank title, but different owner/description/severity than the original
  const response = await putBug(request, bug.id, {
    title: '',
    severity: 'high',
    owner: 'different-owner',
    description: 'Different description.',
    state: 'closed',
  });

  // Assert
  expect(response.status()).toBe(400);

  const persisted = await (await getBug(request, bug.id)).json();
  expect(persisted).toEqual(bug);

  // Cleanup
  await deleteBugSafely(request, bug.id);
});
