import { test, expect } from '@playwright/test';
import { postBug, validCreatePayload, listBugs, uniqueTitle } from '../support/bugsApi';

test('should return 400 blank_title when title is blank', async ({ request }) => {
  // Arrange — a distinctive owner value lets this test check for its own bug without
  // depending on the total bug count, which other tests may change concurrently.
  const owner = uniqueTitle('create-blank-title-owner');
  const payload = validCreatePayload({ title: '', owner });

  // Act
  const response = await postBug(request, payload);

  // Assert
  expect(response.status()).toBe(400);
  expect(await response.json()).toEqual({ error: 'blank_title', message: 'Title is required.' });

  const bugs = await (await listBugs(request)).json();
  expect(bugs.some((bug: { owner: string }) => bug.owner === owner)).toBe(false);
});
