# REST API Test Plan

## Application Overview

BuggyBoard's backend (`backend/src/index.ts`) is an Express app exposing seven HTTP endpoints, all prefixed with `/api` per `specs/engineering/api-conventions.md`. The frontend dev server (Vite, port 5173) proxies `/api/*` to the backend (port 3000) — see `frontend/vite.config.ts` — so API tests can use Playwright's `request` fixture with relative paths (`/api/bugs`, etc.) against the default `baseURL` (`http://localhost:5173`), exactly as `tests/delete-bug/test-helpers.ts` already does (`request.post('/api/bugs', ...)`). The backend must be running (`npm run dev -w backend`, or root `npm run dev`) in addition to the frontend dev server the Playwright config already starts.

**Endpoints in scope:**

| Method | Path            | Handler (backend/src)                  |
| ------ | --------------- | --------------------------------------- |
| GET    | `/api/health`   | `index.ts` inline                       |
| POST   | `/api/login`    | `authService.ts` → `login()`            |
| GET    | `/api/bugs`     | `bugService.ts` → `listBugs()`          |
| POST   | `/api/bugs`     | `bugService.ts` → `createBug()`         |
| GET    | `/api/bugs/:id` | `bugService.ts` → `getBug()`            |
| PUT    | `/api/bugs/:id` | `bugService.ts` → `updateBug()`         |
| DELETE | `/api/bugs/:id` | `bugService.ts` → `deleteBug()`         |

Confirmed by reading the backend source (not yet verified live against the running server):

- **No API-level auth enforcement.** `/api/login` only validates credentials and returns `{ username }`; it does not issue a token/session. None of the `/api/bugs*` endpoints check any auth header or session — they are reachable directly regardless of login state. Auth gating (redirect to `/login`) is a frontend-only concern (`ProtectedRoute.tsx`). This plan tests the API as-is (unauthenticated), and does not assume a 401 on bug endpoints without login.
- **Validation order is fixed** in `createBug`/`updateBug`: title → severity → owner → description → (state, update only). When multiple fields are invalid, the first one in that order determines the response. Negative tests below isolate one invalid field at a time so each test is unambiguous.
- **`INVALID_SEVERITY` and `BLANK_SEVERITY` return the same wire error** — `{ error: "blank_severity", message: "Severity is required (high, mid, or low)." }` — for both a blank severity and an out-of-set value (e.g. `"critical"`). This is a real (if slightly misleading) API contract, not a test-writing mistake.
- **Severity/state are case-insensitive on input, stored uppercase.** `normalizeSeverity`/`normalizeState` trim and uppercase before matching against `HIGH/MID/LOW` and `OPEN/CLOSED`.
- **`:id` parsing uses `parseInt(req.params.id, 10)`, which is lenient.** `parseInt("12abc", 10)` is `12`, not `NaN` — so an id like `12abc` is *not* rejected as `invalid_id`; it's treated as id `12`. Only a value where `parseInt` yields `NaN` (e.g. `"abc"`, empty) triggers the `400 invalid_id` path. This is a documented quirk to test explicitly rather than a case to assume is guarded.
- **CORS headers are set unconditionally** by middleware (`index.ts` lines 13–21) before routing, so they appear on every response, including 404s and error responses, not just successful ones.
- Response codes: `200` (GET/PUT success, login success), `201` (POST /api/bugs success), `204` (DELETE success, empty body), `400` (validation/invalid id), `401` (bad credentials), `404` (not found / unknown route).

## Test Scenarios

### 1. Health Check — `GET /api/health`

**Seed:** none (no bug data needed)

#### 1.1. should return ok status with database connected

**File:** `tests/api/health/health-ok.spec.ts`

**Steps:**
  1. Send `GET /api/health`.
    - expect: Status `200`.
    - expect: Body `{ ok: true, message: "BuggyBoard API is running", database: "connected" }`.

#### 1.2. should return 404 for unsupported methods on /api/health

**File:** `tests/api/health/health-method-not-allowed.spec.ts`

**Steps:**
  1. Send `POST /api/health` (only `GET` is registered for this path).
    - expect: Status `404` (Express's default "no route matched" response, since no route matches `POST /api/health`).

### 2. Login — `POST /api/login`

**Seed:** none (uses `users.json` credentials, e.g. `buggy` / `1970beetle`)

#### 2.1. should return 200 and the username for valid credentials

**File:** `tests/api/login/login-success.spec.ts`

**Steps:**
  1. Send `POST /api/login` with a valid username/password from `users.json`.
    - expect: Status `200`.
    - expect: Body `{ username: "<the username>" }`.

#### 2.2. should trim whitespace from the username and still succeed

**File:** `tests/api/login/login-trims-username.spec.ts`

**Steps:**
  1. Send `POST /api/login` with a valid username padded with leading/trailing spaces (e.g. `"  buggy  "`) and the correct password.
    - expect: Status `200`.
    - expect: Body `{ username: "buggy" }` (trimmed, not padded).

#### 2.3. should return 400 missing_credentials when both fields are blank

**File:** `tests/api/login/login-missing-credentials.spec.ts`

**Steps:**
  1. Send `POST /api/login` with `{ username: "", password: "" }`.
    - expect: Status `400`.
    - expect: Body `{ error: "missing_credentials", message: "Please enter your username and password." }`.

#### 2.4. should return 400 blank_username when only password is provided

**File:** `tests/api/login/login-blank-username.spec.ts`

**Steps:**
  1. Send `POST /api/login` with `{ username: "", password: "somepassword" }`.
    - expect: Status `400`.
    - expect: Body `{ error: "blank_username", message: "Username cannot be blank." }`.

#### 2.5. should return 400 blank_password when only username is provided

**File:** `tests/api/login/login-blank-password.spec.ts`

**Steps:**
  1. Send `POST /api/login` with `{ username: "buggy", password: "" }`.
    - expect: Status `400`.
    - expect: Body `{ error: "blank_password", message: "Password cannot be blank." }`.

#### 2.6. should return 401 invalid_credentials for an unknown username

**File:** `tests/api/login/login-invalid-username.spec.ts`

**Steps:**
  1. Send `POST /api/login` with a username not present in `users.json` and any non-blank password.
    - expect: Status `401`.
    - expect: Body `{ error: "invalid_credentials", message: "Invalid username or password." }`.

#### 2.7. should return 401 invalid_credentials for a wrong password

**File:** `tests/api/login/login-invalid-password.spec.ts`

**Steps:**
  1. Send `POST /api/login` with a valid username (e.g. `buggy`) and an incorrect password.
    - expect: Status `401`.
    - expect: Body `{ error: "invalid_credentials", message: "Invalid username or password." }`.

#### 2.8. should return 400 missing_credentials when the body is empty

**File:** `tests/api/login/login-empty-body.spec.ts`

**Steps:**
  1. Send `POST /api/login` with an empty JSON body `{}` (no `username`/`password` keys at all).
    - expect: Status `400`.
    - expect: Body `{ error: "missing_credentials", message: "Please enter your username and password." }` (handler defaults missing fields to `""`).

### 3. Create Bug — `POST /api/bugs`

**Seed:** none; each test cleans up any bug it creates via `DELETE /api/bugs/:id`.

#### 3.1. should create a bug and return 201 with a generated id and OPEN state

**File:** `tests/api/bugs-create/create-success.spec.ts`

**Steps:**
  1. Send `POST /api/bugs` with valid `{ title, severity: "high", owner, description }`.
    - expect: Status `201`.
    - expect: Body includes a numeric `id`, the submitted `title`/`owner`/`description`, `severity: "HIGH"` (uppercased), and `state: "OPEN"`.
  2. Clean up: `DELETE /api/bugs/:id`.

#### 3.2. should accept case-insensitive severity values

**File:** `tests/api/bugs-create/create-severity-case-insensitive.spec.ts`

**Steps:**
  1. Send `POST /api/bugs` with `severity: "Mid"` (mixed case) and otherwise valid fields.
    - expect: Status `201`.
    - expect: Body `severity: "MID"`.
  2. Clean up.

#### 3.3. should return 400 blank_title when title is blank

**File:** `tests/api/bugs-create/create-blank-title.spec.ts`

**Steps:**
  1. Send `POST /api/bugs` with `title: ""` and otherwise valid fields.
    - expect: Status `400`.
    - expect: Body `{ error: "blank_title", message: "Title is required." }`.
    - expect: No bug is created (`GET /api/bugs` count unchanged, or the response has no `id`).

#### 3.4. should return 400 blank_title when title is whitespace only

**File:** `tests/api/bugs-create/create-whitespace-title.spec.ts`

**Steps:**
  1. Send `POST /api/bugs` with `title: "   "` and otherwise valid fields.
    - expect: Status `400`.
    - expect: Body `{ error: "blank_title", message: "Title is required." }` (title is trimmed before validation).

#### 3.5. should return 400 blank_severity when severity is blank

**File:** `tests/api/bugs-create/create-blank-severity.spec.ts`

**Steps:**
  1. Send `POST /api/bugs` with `severity: ""`, valid title/owner/description.
    - expect: Status `400`.
    - expect: Body `{ error: "blank_severity", message: "Severity is required (high, mid, or low)." }`.

#### 3.6. should return 400 blank_severity when severity is not high/mid/low

**File:** `tests/api/bugs-create/create-invalid-severity.spec.ts`

**Steps:**
  1. Send `POST /api/bugs` with `severity: "critical"` (not in the allowed set), valid title/owner/description.
    - expect: Status `400`.
    - expect: Body `{ error: "blank_severity", message: "Severity is required (high, mid, or low)." }` — same error as a blank severity (documented API quirk, see Overview).

#### 3.7. should return 400 blank_owner when owner is blank

**File:** `tests/api/bugs-create/create-blank-owner.spec.ts`

**Steps:**
  1. Send `POST /api/bugs` with `owner: ""`, valid title/severity/description.
    - expect: Status `400`.
    - expect: Body `{ error: "blank_owner", message: "Owner is required." }`.

#### 3.8. should return 400 blank_description when description is blank

**File:** `tests/api/bugs-create/create-blank-description.spec.ts`

**Steps:**
  1. Send `POST /api/bugs` with `description: ""`, valid title/severity/owner.
    - expect: Status `400`.
    - expect: Body `{ error: "blank_description", message: "Description is required." }`.

#### 3.9. should return 400 blank_title when the request body is empty

**File:** `tests/api/bugs-create/create-empty-body.spec.ts`

**Steps:**
  1. Send `POST /api/bugs` with an empty JSON body `{}`.
    - expect: Status `400`.
    - expect: Body `{ error: "blank_title", message: "Title is required." }` (all fields default to `""`; title is checked first).

### 4. List Bugs — `GET /api/bugs`

**Seed:** none

This endpoint takes no input, so it has no negative/validation cases — only behavioral positive cases.

#### 4.1. should return 200 with an array of all bugs

**File:** `tests/api/bugs-list/list-success.spec.ts`

**Steps:**
  1. Send `GET /api/bugs`.
    - expect: Status `200`.
    - expect: Body is an array; each item has `id`, `title`, `severity`, `owner`, `description`, `state`.

#### 4.2. should include a newly created bug immediately

**File:** `tests/api/bugs-list/list-includes-new-bug.spec.ts`

**Steps:**
  1. Create a bug via `POST /api/bugs` with a unique title.
  2. Send `GET /api/bugs`.
    - expect: The array contains an item matching the created bug's `id` and `title`.
  3. Clean up: `DELETE /api/bugs/:id`.

### 5. Get Bug by Id — `GET /api/bugs/:id`

**Seed:** none

#### 5.1. should return 200 with the bug matching an existing id

**File:** `tests/api/bugs-get/get-success.spec.ts`

**Steps:**
  1. Create a bug via `POST /api/bugs`; capture its `id`.
  2. Send `GET /api/bugs/:id`.
    - expect: Status `200`.
    - expect: Body matches the created bug exactly (`id`, `title`, `severity`, `owner`, `description`, `state`).
  3. Clean up.

#### 5.2. should return 404 not_found for a well-formed but nonexistent id

**File:** `tests/api/bugs-get/get-not-found.spec.ts`

**Steps:**
  1. Send `GET /api/bugs/:id` with an id known not to exist (e.g. `999999`, or delete a just-created bug first and reuse its id).
    - expect: Status `404`.
    - expect: Body `{ error: "not_found", message: "Bug not found." }`.

#### 5.3. should return 400 invalid_id for a non-numeric id

**File:** `tests/api/bugs-get/get-invalid-id.spec.ts`

**Steps:**
  1. Send `GET /api/bugs/abc`.
    - expect: Status `400`.
    - expect: Body `{ error: "invalid_id", message: "Bug ID must be a number." }`.

#### 5.4. should leniently parse an id with trailing non-numeric characters

**File:** `tests/api/bugs-get/get-id-partial-parse.spec.ts`

**Steps:**
  1. Create a bug via `POST /api/bugs`; capture its `id` (e.g. `42`).
  2. Send `GET /api/bugs/42abc`.
    - expect: Status `200`, returning bug `42` — **not** a `400 invalid_id`. `parseInt("42abc", 10)` evaluates to `42`, so the trailing letters are silently ignored (documented quirk, see Overview). This test locks in current behavior; if the team later decides this should be rejected, this test should be updated alongside the fix.
  3. Clean up.

### 6. Update Bug — `PUT /api/bugs/:id`

**Seed:** none; each test creates its own bug and cleans it up.

#### 6.1. should update a bug and return 200 with the updated fields

**File:** `tests/api/bugs-update/update-success.spec.ts`

**Steps:**
  1. Create a bug via `POST /api/bugs`; capture its `id`.
  2. Send `PUT /api/bugs/:id` with new valid `title`, `severity`, `owner`, `description`, `state: "Open"`.
    - expect: Status `200`.
    - expect: Body reflects all updated fields (severity/state uppercased).
  3. Confirm via `GET /api/bugs/:id` that the change persisted.
  4. Clean up.

#### 6.2. should update state from OPEN to CLOSED and back

**File:** `tests/api/bugs-update/update-state-toggle.spec.ts`

**Steps:**
  1. Create a bug (defaults to `state: "OPEN"`).
  2. Send `PUT /api/bugs/:id` with `state: "closed"` (lowercase) and otherwise unchanged valid fields.
    - expect: Status `200`, body `state: "CLOSED"`.
  3. Send `PUT /api/bugs/:id` again with `state: "open"`.
    - expect: Status `200`, body `state: "OPEN"`.
  4. Clean up.

#### 6.3. should return 404 not_found for a nonexistent id

**File:** `tests/api/bugs-update/update-not-found.spec.ts`

**Steps:**
  1. Send `PUT /api/bugs/:id` with a nonexistent id and a valid body.
    - expect: Status `404`.
    - expect: Body `{ error: "not_found", message: "Bug not found." }`.

#### 6.4. should return 400 invalid_id for a non-numeric id

**File:** `tests/api/bugs-update/update-invalid-id.spec.ts`

**Steps:**
  1. Send `PUT /api/bugs/abc` with a valid body.
    - expect: Status `400`.
    - expect: Body `{ error: "invalid_id", message: "Bug ID must be a number." }`.

#### 6.5. should return 400 blank_title when title is blank

**File:** `tests/api/bugs-update/update-blank-title.spec.ts`

**Steps:**
  1. Create a bug.
  2. Send `PUT /api/bugs/:id` with `title: ""`, otherwise valid fields.
    - expect: Status `400`.
    - expect: Body `{ error: "blank_title", message: "Title is required." }`.
  3. Clean up.

#### 6.6. should return 400 blank_severity when severity is invalid

**File:** `tests/api/bugs-update/update-invalid-severity.spec.ts`

**Steps:**
  1. Create a bug.
  2. Send `PUT /api/bugs/:id` with `severity: "urgent"`, otherwise valid fields.
    - expect: Status `400`.
    - expect: Body `{ error: "blank_severity", message: "Severity is required (high, mid, or low)." }`.
  3. Clean up.

#### 6.7. should return 400 blank_owner when owner is blank

**File:** `tests/api/bugs-update/update-blank-owner.spec.ts`

**Steps:**
  1. Create a bug.
  2. Send `PUT /api/bugs/:id` with `owner: ""`, otherwise valid fields.
    - expect: Status `400`.
    - expect: Body `{ error: "blank_owner", message: "Owner is required." }`.
  3. Clean up.

#### 6.8. should return 400 blank_description when description is blank

**File:** `tests/api/bugs-update/update-blank-description.spec.ts`

**Steps:**
  1. Create a bug.
  2. Send `PUT /api/bugs/:id` with `description: ""`, otherwise valid fields.
    - expect: Status `400`.
    - expect: Body `{ error: "blank_description", message: "Description is required." }`.
  3. Clean up.

#### 6.9. should return 400 invalid_state when state is not Open or Closed

**File:** `tests/api/bugs-update/update-invalid-state.spec.ts`

**Steps:**
  1. Create a bug.
  2. Send `PUT /api/bugs/:id` with `state: "In Progress"`, otherwise valid fields.
    - expect: Status `400`.
    - expect: Body `{ error: "invalid_state", message: "State must be Open or Closed." }`.
  3. Repeat with `state: ""` (blank) — same expected error, since `normalizeState("")` also returns `null`.
  4. Clean up.

#### 6.10. should leave the bug unchanged in the database when validation fails

**File:** `tests/api/bugs-update/update-validation-no-side-effects.spec.ts`

**Steps:**
  1. Create a bug with known `title`/`owner`/`description`/`severity`.
  2. Send `PUT /api/bugs/:id` with a blank `title` (invalid) but different `owner`/`description`/`severity` than the original.
    - expect: Status `400`.
  3. Send `GET /api/bugs/:id`.
    - expect: All fields are unchanged from step 1 (the failed update did not partially apply).
  4. Clean up.

### 7. Delete Bug — `DELETE /api/bugs/:id`

**Seed:** none; each test creates its own bug (except negative id/not-found cases, which need no setup).

#### 7.1. should delete an existing bug and return 204

**File:** `tests/api/bugs-delete/delete-success.spec.ts`

**Steps:**
  1. Create a bug via `POST /api/bugs`; capture its `id`.
  2. Send `DELETE /api/bugs/:id`.
    - expect: Status `204`.
    - expect: Empty response body.

#### 7.2. should make the deleted bug return 404 on a subsequent GET

**File:** `tests/api/bugs-delete/delete-then-get-404.spec.ts`

**Steps:**
  1. Create a bug; capture its `id`.
  2. Send `DELETE /api/bugs/:id`.
    - expect: Status `204`.
  3. Send `GET /api/bugs/:id`.
    - expect: Status `404`, body `{ error: "not_found", message: "Bug not found." }`.

#### 7.3. should return 404 not_found for a nonexistent id

**File:** `tests/api/bugs-delete/delete-not-found.spec.ts`

**Steps:**
  1. Send `DELETE /api/bugs/:id` with an id known not to exist.
    - expect: Status `404`.
    - expect: Body `{ error: "not_found", message: "Bug not found." }`.

#### 7.4. should return 400 invalid_id for a non-numeric id

**File:** `tests/api/bugs-delete/delete-invalid-id.spec.ts`

**Steps:**
  1. Send `DELETE /api/bugs/abc`.
    - expect: Status `400`.
    - expect: Body `{ error: "invalid_id", message: "Bug ID must be a number." }`.

#### 7.5. should return 404 on a second delete of the same id

**File:** `tests/api/bugs-delete/delete-twice.spec.ts`

**Steps:**
  1. Create a bug; capture its `id`.
  2. Send `DELETE /api/bugs/:id` once.
    - expect: Status `204`.
  3. Send `DELETE /api/bugs/:id` again, same id.
    - expect: Status `404`, body `{ error: "not_found", message: "Bug not found." }`.

### 8. Cross-Cutting

**Seed:** none

#### 8.1. should include CORS headers on every API response, including errors

**File:** `tests/api/cross-cutting/cors-headers.spec.ts`

**Steps:**
  1. Send `GET /api/health` (success case).
    - expect: Response headers include `access-control-allow-origin: http://localhost:5173`, `access-control-allow-methods` (containing GET, POST, PUT, DELETE, OPTIONS), and `access-control-allow-headers: Content-Type`.
  2. Send `GET /api/bugs/abc` (a 400 error case).
    - expect: The same CORS headers are present despite the error status — the middleware runs before routing.

#### 8.2. should return 404 for unknown API routes

**File:** `tests/api/cross-cutting/unknown-route.spec.ts`

**Steps:**
  1. Send `GET /api/does-not-exist`.
    - expect: Status `404`.

## Test Implementation Notes

- **These are pure HTTP tests with no UI**, so the Page Object Model in `specs/engineering/test-automation-patterns.md` doesn't directly apply (there is no page to model). To still avoid duplicating request boilerplate across ~35 spec files, add a small helper — e.g. `tests/api/support/bugsApi.ts` — with thin wrapper functions (`createBug(request, overrides?)`, `getBug(request, id)`, `updateBug(request, id, overrides?)`, `deleteBug(request, id)`, `listBugs(request)`) that build sensible valid defaults and let each test override just the field under test. This mirrors the spirit (not the letter) of the "reduce duplication" rationale for page objects. Keep it separate from `tests/pages/` since it isn't a page object.
- Use Playwright's built-in `request` fixture (`APIRequestContext`), not `page` — these tests don't need a browser. Relative paths (`/api/bugs`) resolve against the existing `baseURL: 'http://localhost:5173'` in `playwright.config.ts` via the Vite dev-server proxy, consistent with how `tests/delete-bug/test-helpers.ts` already calls the API.
- **Prerequisite:** the backend (`npm run dev -w backend`, port 3000) must be running alongside the frontend dev server. `playwright.config.ts`'s `webServer` block only starts the frontend; it does not start the backend. If API tests are run in isolation (e.g. `npx playwright test tests/api`), confirm the backend is already up, or consider adding a second `webServer` entry for `npm run dev -w backend` with `url: 'http://localhost:3000/api/health'`.
- Every test that creates a bug must delete it (in the test body or an `afterEach`), so the suite leaves no residue in `backend/data/buggyboard.db` — follow the `createBugViaApi`/`deleteBugViaApi` pattern already in `tests/delete-bug/test-helpers.ts`.
- Tests should use unique titles (e.g. a UUID suffix, matching the existing parallel-safe pattern used elsewhere in the suite — see `d89ac7d Make search-bug tests parallel-safe with per-test title suffixes`) since `fullyParallel: true` means these tests may run concurrently against a shared SQLite database.
- Section 8.1 and the id-parsing quirk in 5.4 exist to **document current behavior**, not to bless it as ideal — flag both to the team; the id-parsing leniency in particular may be worth a follow-up bug-fix decision (reject `parseInt` results that don't fully consume the string) before hardening the test to expect a `400` instead.
- Not yet confirmed live against the running server — these steps and status/error bodies are inferred from reading `backend/src/index.ts`, `authService.ts`, and `bugService.ts`. Before implementing, spot-check a few representative calls (e.g. with `curl` or the Playwright API tester) to confirm response shapes match, the same way other testing specs in this repo note "confirmed live."
