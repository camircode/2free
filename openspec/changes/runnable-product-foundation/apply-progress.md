# Apply Progress: Runnable Product Foundation — Phase 1 / PR 1, Phase 2 / PR 2, and Phase 3 / PR 3

## Status

- **Phase status:** Implementation and runtime verification complete for Phase 1 / PR 1, Phase 2 / PR 2, and Phase 3 / PR 3; ready for Phase 4 / PR 4 apply.
- **Mode:** Standard (strict TDD disabled by `openspec/config.yaml`)
- **Delivery:** `auto-forecast`, feature-branch-chain; PR 1 targets the feature tracker and PR 2 targets the immediate PR 1 parent
- **Work unit:** Routed web workflows and Browser Mode/Chromium proof
- **Scope:** Tasks 1.1–3.2; this apply batch implements and verifies only 3.1–3.2.
- **Review budget:** 800 lines; planned unit forecast 500–700 lines

## Completed Tasks

- [x] **1.1** Created `apps/api`, `apps/web`, and `packages/application`; added async-compatible provider ports, typed application mapping, validated configuration, package exports, and workspace scripts.
- [x] **1.2** Added API `/health`, `/version`, `/snapshot`, explicit POST `/seed` and `/reset`, in-memory composition, Compose/PostgreSQL readiness wiring, `.env.example`, Dockerfile, and quickstart documentation. Invalid configuration fails before serving; unavailable database reports HTTP 503 while process readiness remains explicit.
- [x] **1.3** Established frozen-install, focused quality, API/web smoke, and static Compose evidence. No schema, PostgreSQL adapter, SQLite, SQLCipher, routed product UX, authentication, sync, banking, or other excluded integration was added.

## Phase 2 / PR 2 Completed Tasks

- [x] **2.1** Added the PostgreSQL migration, `pg` adapter, transactional reset/import behavior, row-to-core mapping, exact coefficient/scale persistence, privacy-safe metadata, and cloud provider fixtures.
- [x] **2.2** Added application-owned account, transaction, dashboard, and portability use cases plus API endpoints for accounts, transactions, dashboard, export, and import. Added RED coverage first for malformed, unsafe, and conflicting import rollback, then implemented the adapter behavior.
- [x] **2.3** Verified migration readiness, seed/reset, durable API workflows, deterministic export/import round trip, API restart readback, Compose health, and Chromium web-shell workflow.

## Phase 2 / PR 2 Work Unit Evidence

| Evidence | Exact result |
|---|---|
| RED test before production logic | Initial `pnpm exec vitest run --config packages/data-provider/vitest.config.ts packages/data-provider/test/postgres.test.ts` failed before implementation because `pg`/the adapter did not exist; the test specified malformed, unsafe, and conflicting atomic import behavior first. |
| Focused cloud tests | `pnpm test:cloud` passed: data-provider 14/14 in-memory tests, 1 PostgreSQL integration test skipped without host `DATABASE_URL`; application 2/2 and API 7/7. Compose-backed `docker compose exec -T api ... pnpm --dir packages/data-provider test` passed provider 14/14 plus PostgreSQL 1/1, 15/15 total. |
| Full check | `pnpm check` passed: formatting, ESLint, all TypeScript projects, core 29/29, data-provider 14/14 plus 1 skipped without host DB, application 2/2, API 7/7, UI 30/30. |
| Frozen install | `pnpm install --frozen-lockfile` passed locally and in both rebuilt Compose images with pnpm 11.13.1. |
| Compose readiness/migrations | `newgrp docker -c 'docker compose up -d --build'` exited 0; `docker compose ps` reported db, API, and web healthy; `docker compose config` exited 0. API `/health` returned HTTP 200 with PostgreSQL target and database ready. |
| API cloud workflow | Real Compose smoke created an account and exact MXN `19990`/scale `3` transaction, returned dashboard totals, rejected unsafe import with HTTP 400/privacy-safe error, rejected conflicting import with HTTP 400/stable conflict error, reset, imported, and confirmed byte-stable `/export`. |
| Restart durability | After `docker compose restart api`, health returned ready and the imported account/transaction remained readable; a new account created after restart returned HTTP 201, proving ID generation does not collide across API restarts. |
| Chromium workflow | `pnpm test:browser` passed 1 file, 3/3 UI browser tests. A real headless Chromium smoke against `http://localhost:3000` passed with title `2 Free runtime`, runtime text present, and API status `ready`. |
| Rollback boundary | Revert `packages/data-provider/src/postgres-provider.ts`, `packages/data-provider/src/migrations/001_initial.sql`, provider exports/dependencies/tests, `packages/application/src/product.ts` and runtime contract changes, API composition/routes/health/tests, `Dockerfile`, README, and Phase 2 task/progress additions; this removes cloud persistence/workflows without changing `packages/core` contracts beyond the invalid-account-type invariant guard or any Phase 1 runtime contract. |

## Work Unit Evidence

| Evidence | Exact result |
|---|---|
| Focused test command | Re-run `pnpm test:runtime` — passed: application 1/1 tests and API 2/2 tests. |
| Full quality command | Re-run `pnpm check` — passed: format, ESLint, all TypeScript projects, core 29/29, data-provider 14/14, application 1/1, API 2/2, UI 30/30. |
| Browser evidence | Re-run `pnpm test:browser` — passed: 1 file, 3/3 tests. |
| Runtime harness | Re-run native harness — passed: API `/health` returned HTTP 503 with `process.ready=true` and `database.ready=false`; `/version` returned HTTP 200 with application/build/target/profile; POST `/seed` returned deterministic MXN coefficient/scale data; POST `/reset` returned an empty snapshot. Web `/health` returned HTTP 200 and the HTML shell contained `2 Free runtime`. |
| Invalid configuration | Re-run `API_PORT=invalid node_modules/.bin/tsx apps/api/src/server.ts` — exit 1, `Invalid configuration: API_PORT must be an integer between 1 and 65535`; both exit-code and message assertions passed. |
| Frozen install | Re-run `pnpm install --frozen-lockfile` — passed with pnpm 11.13.1. |
| Compose static evidence | `docker --version` — passed (`Docker version 29.6.2, build dfc4efb`). `docker compose config` — passed and rendered the `db` healthcheck plus `api`/`web` healthy dependency conditions. `prettier --check .` — passed. |
| Compose runtime evidence | `docker compose up -d --build` — blocked before startup: `unable to get image 'postgres:16-alpine': permission denied while trying to connect to the Docker API at unix:///var/run/docker.sock`. No Compose runtime health or endpoint result is claimed. |
| Rollback boundary | Revert `apps/**`, `packages/application/**`, runtime package/export changes, root scripts/workspace config, `compose.yml`, `Dockerfile`, `.env.example`, README, and the UI boundary expectation; this removes PR 1 without touching domain behavior or adding persistence schema. |

## Corrective Re-run

The implementation and task acceptance remain complete for Phase 1 / PR 1. The first gate reported Docker as unavailable; the corrective re-run confirmed that the Docker CLI and Compose configuration are available, but the current user cannot access `/var/run/docker.sock`. This is an environment permission blocker, not a code or task-checklist gap. Compose runtime proof must be repeated after Docker socket access is granted; it must not be inferred from the successful static configuration check.

## Final Compose / Runtime Verification

The Docker group was activated for the verification session. The fresh read-only verifier recorded the following final evidence:

- `newgrp docker -c 'docker compose up -d --build'` — exit 0.
- Compose stack: `db` Up/healthy; `api` Up/healthy at `localhost:3001`; `web` Up/healthy at `localhost:3000`.
- API `/health` — HTTP 200; `process.ready=true` and `database.ready=true`.
- API `/version` — HTTP 200; version `0.1.0`, target `api`.
- Web health/root — HTTP 200; root contains `2 Free runtime`.
- POST `/seed` — HTTP 200; deterministic MXN transaction coefficient `19990`, scale `2`.
- POST `/reset` — HTTP 200; empty accounts and transactions.
- The verifier edited no files; the Compose stack is left running.

This resolves the prior Docker-socket permission blocker. Phase 1 / PR 1 is implementation- and runtime-verification-complete. This remains bounded work-unit evidence for PR 1; final change verification remains gated by the unchecked Phase 3–5 tasks.

## Decisions and Deviations

- The existing `FinanceProvider` remains intact and is wrapped by an async-compatible application port; API and web do not duplicate core rules.
- Internal core/provider source imports were made package-relative so the new TypeScript runtime can resolve workspace packages consistently through `tsx`; public package contracts remain unchanged.
- The web application is intentionally a runtime shell/status boundary, not the routed product UX. Dashboard/accounts/transactions/portability screens remain Phase 3.

## Remaining Tasks

- [x] 2.1–2.3 Cloud Durable Product — PostgreSQL migrations/adapter, durable workflows, and API proof.
- [x] 3.1–3.2 Web Product Workflows — routed product surface and browser workflow proof.
- [ ] 4.1–4.3 Local-First SQLite — offline/restart runtime and capability reporting.
- [ ] 5.1–5.3 Parity and Release — shared adapter contracts and final release gates.

## PR Boundary

```text
main
  └── feature tracker: runnable-product-foundation
       └── 📍 PR 1: runtime composition (this unit)
            └── PR 2: PostgreSQL durable product
```

**Starts with:** package-first core/provider repository and no executable apps.  
**Ends with:** reproducible API/web processes, validated configuration, readiness/version contracts, explicit seed/reset, Compose dependency wiring, and checkable local smoke proof.  
**Follow-up:** PR 2 adds PostgreSQL durability; it must not be inferred from the current in-memory target.

## Phase 2 / PR 2 Boundary

```text
main
  └── feature tracker: runnable-product-foundation
       └── PR 1: runtime composition
            └── 📍 PR 2: PostgreSQL durable product
                 └── PR 3: routed web workflows
```

**Starts with:** the verified Phase 1 runtime composition and in-memory seed/reset boundary.
**Ends with:** PostgreSQL migrations, durable provider transactions, application-owned cloud workflows,
API endpoints, import/export atomicity, restart durability, and Compose/Chromium proof.
**Rollback:** remove the Phase 2 adapter, migration, use-case, API, test, and documentation changes;
retain Phase 1 composition and core/provider contracts.

The current approved/recovered Phase 1 review lineage was `review-1c09fe845e28d18c-exception`.
Phase 2 must receive a new post-apply review lifecycle; this apply did not start or reuse review.

## Native Review Resolution

- Phase 1 behavior and regression evidence passed the native review correction validator.
- The review correction measured 247 authored lines against the native transaction cap of 200 lines; the maintainer explicitly authorized the correction-size exception under the session's 800-line review workload budget.
- This record documents the authorization and does not change application behavior or claim a new review budget.

## Bounded Native Correction: review-6516915f8ac3c5ac

- **Scope:** One correction transaction for corroborated CRITICAL findings `R1-001`, `R1-002`, `R3-001`, `R3-002`, and `R4-001` only. Warning and info findings remain untouched.
- **R1-001:** Compose publishes the destructive cloud-dev API on `127.0.0.1` only, while the API container continues listening on `0.0.0.0` for internal Compose connectivity. README and `.env.example` document the local-only boundary; no fake authentication was added.
- **R1-002 / R3-002:** Core validates privacy-safe currencies, keeps valid ISO-style values, defensively copies and freezes credit statement balances, and protects import/provider paths with regression coverage.
- **R3-001:** Replaced the web placeholder with navigable dashboard, accounts, transactions, and portability/import-export screens. Forms are labeled, operation states and safe errors are rendered, duplicate submissions are disabled, and the browser suite exercises real Chromium workflows.
- **R4-001:** Added a documented `Idempotency-Key` request-header boundary, strict missing/invalid-key errors, in-memory key handling, PostgreSQL migration `002_transaction_idempotency.sql`, transactional/advisory-lock enforcement, and restart retry coverage returning the original transaction.

### Correction Evidence

| Evidence | Exact result |
|---|---|
| RED tests before production logic | Core RED: 3 failures for PAN-shaped currency and mutable statement balance. Provider RED: duplicate retry. API RED: duplicate retry and missing key accepted. Web RED: missing `playwright` declaration, then missing `createWebServer`; implementation followed those failures. |
| Quality gate | `pnpm check` passed: format, ESLint, TypeScript, core 33/33, data-provider 15/15 plus 2 skipped without host DB, application 2/2, API 8/8, UI 30/30. |
| Cloud/API focused tests | `pnpm test:cloud` passed: in-memory provider 15/15, PostgreSQL 2 skipped without host DB, application 2/2, API 8/8. |
| Browser tests | `pnpm test:browser` passed: shared UI 3/3 and web Chromium 2/2. A final real Compose Chromium pass covered dashboard, account creation, transaction creation, and portability export. |
| Compose build and health | `newgrp docker -c 'docker compose up -d --build'` exited 0; db, API, and web reported healthy. Final API restart health returned HTTP 200. |
| Compose provider contract | `docker compose exec -T api ... pnpm --dir packages/data-provider test` passed 17/17, including PostgreSQL exact-money/import coverage and restart idempotency. |
| Compose API smoke | API health HTTP 200; first transaction HTTP 201; same-key retry HTTP 201 with identical ID; missing key HTTP 400; 256-character key HTTP 400; final restart retry HTTP 201 with identical ID and transaction count 1. Idempotency preflight returned HTTP 204 with `content-type, idempotency-key`. |
| Exposure boundary | `docker compose ps` showed `127.0.0.1:3001->3001/tcp` for API and `0.0.0.0:3000` for web; host `ss -ltn` showed API bound only to `127.0.0.1:3001`. |
| Correction size | Estimated `783` authored changed lines (additions plus deletions, including web/browser coverage, migration, tests, docs, and lockfile), above the native 200-line forecast but within the user-authorized 800-line workload budget. Pre-existing Phase 2 work is excluded from this estimate. |
| Rollback boundary | Remove the loopback/documentation changes, web workspace/test/config, currency/freeze regressions, idempotency provider/application/API/migration/tests, and this evidence section; retain the pre-existing Phase 2 cloud product and excluded review findings. |

### Remaining Risks

- Authentication and authorization remain intentionally out of scope; the destructive cloud-dev API is safe only at the loopback host boundary.
- No SQLite, sync, banking, or external integrations were added.
- Reusing one idempotency key with a different payload returns the original transaction; payload-conflict semantics are deferred because they were not required by this bounded correction.

## Phase 3 / PR 3 Completed Tasks

- [x] **3.1** Completed the routed dashboard, accounts, transactions, and portability surface already introduced by the correction; added explicit browser-side presentation validation with associated field errors, predictable focus, retry affordances, loading/empty/populated/error states, disabled operation controls, exact amount rendering, and privacy-safe API failure mapping. Domain and persistence rules remain in `packages/application` and the provider/API boundaries.
- [x] **3.2** Extended Browser Mode/Chromium coverage for direct route reloads, empty and populated states, exact positive/negative money, accessible validation, duplicate-submit prevention, idempotency replay, portability export/import, API restart readback, retry, and safe errors.

### Phase 3 / PR 3 Work Unit Evidence

| Evidence | Exact result |
|---|---|
| Focused test command | `pnpm --filter @2free/web test:browser` passed: 1 file, 2/2 tests. The tests cover all four routes, validation/focus, exact `19.99 MXN` and `-19.99 MXN`, duplicate submit request count, same-key replay identity, export/import, retry, and restart readback in the Chromium harness. |
| Browser aggregate | `pnpm test:browser` passed: shared UI 1 file, 3/3 tests; web 1 file, 2/2 tests. |
| Full quality command | `pnpm check` passed: formatting, ESLint, all TypeScript projects, core 33/33, data-provider 15/15 plus 3 skipped without host DB, application 2/2, API 8/8, and UI 30/30. |
| Compose build/readiness | `newgrp docker -c 'docker compose up -d --build'` exited 0. `newgrp docker -c 'docker compose ps'` reported db, API, and web healthy; API published only on `127.0.0.1:3001`, web on port 3000. |
| Real Compose API smoke | Reset, account creation, exact MXN `19990`/scale `2` transaction, same-key idempotency replay, missing-key HTTP 400, deterministic export, API restart, readiness polling, and exact-money readback passed. The restart command produced one transient connection-reset while the container restarted; the readiness loop then passed with API health HTTP 200, `process.ready=true`, and `database.ready=true`. |
| Real Compose Chromium smoke | Headless Playwright against `http://localhost:3000` opened and reloaded `/dashboard`, `/accounts`, `/transactions`, and `/portability`; transactions displayed exact `199.90 MXN`. Passed. |
| Runtime harness command/scenario | `pnpm --filter @2free/web exec tsx -e '...Playwright route and exact-money smoke...'` passed against the live Compose stack. |
| Rollback boundary | Revert only the Phase 3 additions in `apps/web/src/server.ts` (presentation validation/error association) and `apps/web/test/server.browser.test.ts` (Phase 3 Chromium scenarios), plus the 3.1–3.2 task/progress evidence. This removes the Phase 3 UX/test additions without changing core, application, API, PostgreSQL, migrations, or the native review-resolution record. |

## Phase 3 / PR 3 Boundary

```text
main
  └── feature tracker: runnable-product-foundation
       └── PR 1: runtime composition
            └── PR 2: PostgreSQL durable product
                 └── 📍 PR 3: routed web workflows and Chromium proof
                      └── PR 4: local-first SQLite
```

**Starts with:** the verified Phase 2 PostgreSQL-backed API and the existing corrected web shell/product surface.
**Ends with:** accessible routed workflows, explicit browser validation and operation-state evidence, portability/retry coverage, and Compose-backed Chromium/API proof.
**Follow-up:** Phase 4 adds SQLite/local-first runtime only; authentication, sync, notifications, budgets, investments, external data, and integrations remain out of scope.
