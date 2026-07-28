import { test, expect } from '@playwright/test';
import { createBug, deleteBugSafely, getBug, putBug, validUpdatePayload } from '../support/bugsApi';

test('should update a bug and return 200 with the updated fields', async ({ request }) => {
  // Arrange
  const bug = await createBug(request);
  const update = validUpdatePayload({ severity: 'low', state: 'Open' });

  // Act
  const response = await putBug(request, bug.id, update);
  const body = await response.json();

  // Assert
  expect(response.status()).toBe(200);
  expect(body).toEqual({
    id: bug.id,
    title: update.title,
    severity: 'LOW',
    owner: update.owner,
    description: update.description,
    state: 'OPEN',
  });

  const persisted = await (await getBug(request, bug.id)).json();
  expect(persisted).toEqual(body);

  // Cleanup
  await deleteBugSafely(request, bug.id);
});
