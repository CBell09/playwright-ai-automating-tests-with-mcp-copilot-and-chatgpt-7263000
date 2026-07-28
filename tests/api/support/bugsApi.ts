import { APIRequestContext, APIResponse } from '@playwright/test';
import { randomUUID } from 'crypto';

export interface BugPayload {
  title: string;
  severity: string;
  owner: string;
  description: string;
  state: string;
}

/** Unique per call so parallel tests never collide on the same title. */
export function uniqueTitle(base = 'API test bug'): string {
  return `${base} ${randomUUID().slice(0, 8)}`;
}

/** A valid POST /api/bugs payload (no `state` — the server always creates bugs as OPEN). */
export function validCreatePayload(overrides: Partial<Omit<BugPayload, 'state'>> = {}): Omit<BugPayload, 'state'> {
  return {
    title: uniqueTitle(),
    severity: 'high',
    owner: 'tester',
    description: 'Created by API test.',
    ...overrides,
  };
}

/** A valid PUT /api/bugs/:id payload — the server requires all fields including `state`. */
export function validUpdatePayload(overrides: Partial<BugPayload> = {}): BugPayload {
  return {
    title: uniqueTitle('Updated bug'),
    severity: 'mid',
    owner: 'tester',
    description: 'Updated by API test.',
    state: 'open',
    ...overrides,
  };
}

export function postBug(request: APIRequestContext, data: Record<string, unknown>): Promise<APIResponse> {
  return request.post('/api/bugs', { data });
}

export function putBug(request: APIRequestContext, id: number | string, data: Record<string, unknown>): Promise<APIResponse> {
  return request.put(`/api/bugs/${id}`, { data });
}

export function getBug(request: APIRequestContext, id: number | string): Promise<APIResponse> {
  return request.get(`/api/bugs/${id}`);
}

export function deleteBug(request: APIRequestContext, id: number | string): Promise<APIResponse> {
  return request.delete(`/api/bugs/${id}`);
}

export function listBugs(request: APIRequestContext): Promise<APIResponse> {
  return request.get('/api/bugs');
}

/** Creates a valid bug via the API for test setup. Throws if creation fails. */
export async function createBug(
  request: APIRequestContext,
  overrides: Partial<Omit<BugPayload, 'state'>> = {}
): Promise<{ id: number; title: string; severity: string; owner: string; description: string; state: string }> {
  const response = await postBug(request, validCreatePayload(overrides));
  if (response.status() !== 201) {
    throw new Error(`Failed to create bug via API: ${response.status()} ${await response.text()}`);
  }
  return response.json();
}

/** Best-effort cleanup for afterEach — swallows errors so a failed test doesn't mask cleanup issues. */
export async function deleteBugSafely(request: APIRequestContext, id: number | string): Promise<void> {
  await request.delete(`/api/bugs/${id}`).catch(() => {});
}
