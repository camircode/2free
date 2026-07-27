# Apply Progress: Better Auth Financial Boundary — Slice 2A

## Status

- **Change**: `better-auth-financial-boundary`
- **Artifact store**: OpenSpec
- **Slice**: 2A/5, feature-branch-chain (`slice-1` → `slice-2A`)
- **Assigned tasks**: 1.3–1.4 only; 1.1–1.2 remain complete from Slice 1
- **Delivery**: force-chained; current Slice 2A target `<500` authored implementation/test lines; prior Slice 1 `size:exception` is historical only
- **Strict TDD**: disabled by `openspec/config.yaml`; explicit RED → GREEN → REFACTOR evidence was still captured for this threat-matrix slice
- **Corrective rerun result**: success; PostgreSQL runtime evidence completed through the established `sg docker -c` workaround

## Manual workload correction

- **Reproducible baseline**: full Slice 1 was measured against predecessor tree `2fbd57aee542ceaecdfd1ee0aed4b815b436e056`.
- **Allowlist**: `packages/auth/**`, `packages/database/**`, Slice 1 `apps/api` and `packages/application` paths, root environment/config/manifests/Compose/Docker files, `pnpm-lock.yaml`, and Better Auth OpenSpec `tasks.md`/`apply-progress.md`.
- **Counting convention**: use per-workspace `git diff --no-index` semantics, including untracked files; count authored additions plus deletions for implementation/test/config and OpenSpec progress; keep the generated lockfile in complete snapshot identity and raw totals, but exclude it from the authored review threshold.

| Workload bucket | Exact measured total |
|---|---:|
| Implementation/test/config | **1,483** |
| OpenSpec progress (`tasks.md` + `apply-progress.md`) | **158** |
| Authored review total (`1,483 + 158`) | **1,641** |
| Generated `pnpm-lock.yaml` (snapshot-bound; excluded from authored threshold) | **1,411** |
| Raw total (`1,641 + 1,411`) | **3,052** |

- **Maintainer decision**: the user explicitly approved `size:exception` rather than splitting the already-implemented Slice 1 into separate review targets.
- **Approval timestamp/session**: `2026-07-23 17:01:37`; `sdd-apply-better-auth-financial-boundary-slice1-20260723`.

## Completed Tasks

- [x] 1.1 Auth/database foundation
- [x] 1.2 RED/GREEN migration preflight, rollback snapshot, and locked-finance denial
- [x] 1.3 Slice 2A RED: scope, predicates, factories, application contract, and two-owner fake tests
- [x] 1.4 Slice 2A GREEN: scoped contracts/application and owner-aware in-memory provider
- [ ] 1.5–1.14 remain assigned to later slices and were not modified

## Implementation

### Auth foundation

- Added `@2free/auth` with Better Auth `1.6.23`, non-default `BETTER_AUTH_SECRET` validation (minimum 32 characters, placeholder/repeated-value rejection), trusted origins, base URL, and `createCoreAuth` using the Prisma adapter.
- Added `@2free/database` with Prisma `7.9.0`, `@prisma/client` `7.9.0`, and `@prisma/adapter-pg` `7.9.0`.
- Added the complete Better Auth `User`, `Session`, `Account`, and `Verification` models plus the future owner-aware finance, idempotency, quarantine, and migration-audit models. Composite owner relations are present in the Prisma schema and generated migration.

### Migration and rollback foundation

- Added `prisma.config.ts`, `prisma/schema.prisma`, generated-client output configuration, baseline migration `00000000000000_legacy_pg_baseline`, and foundation migration `00000000000001_better_auth_financial_foundation`.
- `db:migrate` inspects public tables and legacy `schema_migrations` versions, classifies `fresh`/`existing`/`partial`/`drift`, resolves the legacy baseline only for the un-managed existing state, and refuses partial/drift states before `prisma migrate deploy`.
- Existing raw-`pg` rows remain rollback-only and nullable owner columns are not inferred or dual-written during this foundation migration. A later quarantine/bootstrap slice must assign owners.
- Added rollback-only `pg_dump` custom-format snapshot and `pg_restore --list` verification commands. If `ROLLBACK_SNAPSHOT_PATH` is provided, migration snapshots and verifies before Prisma deploy.
- Added test database lifecycle commands through `compose.test.yml`: `db:test:up` and `db:test:down`.

### Runtime lock and readiness

- `RuntimeConfig` now loads shared auth configuration and rejects `FINANCE_BOUNDARY_LOCKED` values other than `true`.
- API readiness uses Prisma `SELECT 1`; the old `migratePostgres` readiness call remains untouched as rollback-only provider code.
- All existing finance paths (`snapshot`, account/transaction routes, dashboard, export/import, seed, reset) return `503 {"error":"finance_boundary_locked"}` before body parsing or provider access. Health and version remain public.
- Compose now runs the migration service to successful completion before API startup and passes the required secret/trusted-origin configuration to API and web without a default secret.

### Corrective runtime evidence

All Docker and Compose commands in this rerun used `sg docker -c '<command>'`. Each harness installed an `EXIT` trap that ran `docker compose ... down -v --remove-orphans` for every temporary project.

| Scenario | Exact result |
|---|---|
| Fresh PostgreSQL migration | `sg docker -c 'docker compose -p ba-s1-db-13976 -f compose.test.yml up -d --wait db'`; `DATABASE_URL=postgresql://2free:2free@127.0.0.1:55432/2free_test pnpm --filter @2free/database db:migrate` exited `0`; `_prisma_migrations`, Better Auth tables, finance tables, quarantine, and audit tables were present. |
| Existing legacy baseline/import | Created the exact legacy `accounts`, `transactions`, `transaction_idempotency`, and `schema_migrations` v1/v2 state inside the Compose PostgreSQL container; `db:migrate` exited `0`, marked `00000000000000_legacy_pg_baseline`, applied the foundation migration, preserved `legacy-account` (`1` row), preserved history `1,2`, and recorded `2` Prisma migrations. |
| Partial rejection | One-table partial state through Compose; `db:migrate` exited `1` with `database is in partial state`; `_prisma_migrations` remained absent (`0`). |
| Drift rejection | Exact legacy table set with an extra column through Compose; `db:migrate` exited `1` with `database is in drift state`; `_prisma_migrations` remained absent (`0`). |
| Rollback snapshot/verify | `sg docker -c 'docker compose ... exec -T db pg_dump -U 2free --format=custom --no-owner -d 2free_test'` created a `25,112`-byte custom archive; `sg docker -c 'docker compose ... exec -T db sh -c ... pg_restore --list ...'` passed. |
| Migration ordering/readiness | `sg docker -c 'docker compose -p ba-s1-app-21027 -f compose.yml up -d --build api'` started `db`, then `migration`; migration exited `0` before API startup. API `/health` returned HTTP `200` with `database.ready=true`. |
| Locked-finance runtime | Through the same Compose API, `curl -X POST http://127.0.0.1:3101/accounts --data '{}'` returned HTTP `503` and exactly `{"error":"finance_boundary_locked"}`. |
| Cleanup | The trap ran Compose `down -v --remove-orphans` for both projects. Follow-up `sg docker -c 'docker ps -a --filter name=ba-s1- --format "{{.Names}}"'` returned no containers. |

The runtime exposed and the rerun fixed two Slice 1 defects without expanding scope: exact legacy baselines were checked after the overlapping foundation-table partial test, and Prisma 7.9's removed `--from-url` drift flag was replaced with `--from-config-datasource --to-schema`. The regression test is in `packages/database/test/migration.test.ts`; no owner, session-route, UI, or unlock behavior was added.

## TDD Cycle Evidence

| Task | RED (test first) | GREEN (implementation passes) | REFACTOR |
|---|---|---|---|
| 1.1 | `pnpm exec vitest run --config packages/auth/vitest.config.ts packages/auth/test/config.test.ts`; failed at missing auth source. `pnpm exec vitest run --config packages/database/vitest.config.ts packages/database/test/migration.test.ts`; failed at missing database source. | `pnpm --filter @2free/auth test` → **1 file, 6 passed**; `pnpm --filter @2free/database test` → **2 files, 11 passed**; `pnpm --filter @2free/database db:generate` → Prisma Client **7.9.0 generated**; `prisma validate` passed. | Extracted shared auth config/core, migration preflight, Prisma client singleton/readiness, rollback commands; generated client is ignored and regenerated by `pretest`, `pretypecheck`, and Docker build. |
| 1.2 | `finance-boundary-lock.test.ts` initially failed **10/10** because routes were still reachable; the first real legacy Compose run exposed exact-baseline misclassification as partial; the first schema check exposed Prisma 7.9's removed `--from-url`. | `pnpm --filter @2free/api test` → **2 files, 47 passed**; Compose lock harness → HTTP **503**; database preflight/rollback suite → **2 files, 11 passed**; fresh/existing/partial/drift PostgreSQL scenarios and Compose ordering all passed after correction. | Moved the foundation-partial guard after exact legacy recognition, added the regression test, normalized `db:drift` to Prisma 7.9 syntax, and kept the lock before body/provider access. |

## Work Unit Evidence

| Evidence | Result |
|---|---|
| Focused test command and exact result | `pnpm --filter @2free/auth test && pnpm --filter @2free/database test && pnpm --filter @2free/api test` → **5 test files, 64 passed**; final `pnpm test` passed all executed suites: core 33, auth 6, database 11, data-provider 15 + 3 skipped, application 10, API 47, UI 48. |
| Runtime harness command/scenario and exact result | Compose harness using `sg docker -c`: fresh migration, existing baseline/import, partial rejection, drift rejection, custom `pg_dump`/`pg_restore --list`, migration-before-API ordering, Prisma readiness, and finance HTTP lock all passed; exact project/output evidence is recorded above. |
| Rollback boundary | Revert `packages/auth/**`, `packages/database/**`, migration/config/Compose/Docker/env/package changes, and API lock/readiness changes as one Slice 1 unit; restore the pre-slice raw-`pg` snapshot/export before any later migration. Do not revert unrelated provider/UI work. |

### Corrective rerun changed-line evidence

The automatic corrective rerun is measured against the Slice 1 predecessor state that was marked partial at rerun start. Counting is authored additions plus deletions for only the three corrective files; the already-applied Slice 1 implementation and unrelated worktree changes are excluded.

| Path | Additions | Deletions | Changed lines |
|---|---:|---:|---:|
| `packages/database/src/migration.ts` | 1 | 1 | 2 |
| `packages/database/test/migration.test.ts` | 13 | 0 | 13 |
| `packages/database/package.json` | 1 | 1 | 2 |
| **Total** | **15** | **2** | **17** |

`15 + 2 = 17` actual changed lines, leaving a `783`-line margin under the `800`-line Slice 1 budget. No other source file was changed by the corrective rerun.

## Verification and Commands

- `pnpm install --frozen-lockfile` → passed.
- `pnpm --filter @2free/database db:generate` → passed; Prisma Client **7.9.0 generated**.
- `pnpm --filter @2free/database exec prisma validate` → passed.
- Fresh Compose migration followed by `DATABASE_URL=... pnpm --filter @2free/database db:drift` → passed: **No difference detected** using Prisma 7.9's `--from-config-datasource --to-schema` flags.
- `pnpm check` → passed: format, ESLint, typecheck, core **33**, auth **6**, database **11**, data-provider **15 + 3 skipped**, application **10**, API **47**, UI **48**.
- `pnpm test:browser` → passed: UI **17** tests and web **6** tests.

## Scope Guard

- No Better Auth route handlers, Next UI, Server Actions, Node session middleware, owner-scoped provider/application contracts, finance provider cutover, raw-`pg` removal, CSRF/proxy hardening, or unlock behavior was implemented.
- Only tasks 1.1 and 1.2 are checked in `tasks.md`.

## Next Slice

Slice 2 (`slice-1` → `slice-2`): add `FinanceScope`, owner predicates/factories, composite owner enforcement in provider/application contracts, fingerprint idempotency, canonical `OwnerExportV1`, atomic owner-scoped portability/reset/seed, quarantine/audit/bootstrap, and two-user isolation tests. Keep `FINANCE_BOUNDARY_LOCKED=true` and preserve rollback snapshot/export until Slice 5 gates pass.

## Risks

- Slice 2 must add owner predicates, quarantine/bootstrap, and two-user isolation before any financial workflow can unlock; `FINANCE_BOUNDARY_LOCKED=true` remains mandatory.
- Existing raw tables receive only nullable foundation columns during the staged migration; Slice 2/5 must quarantine and explicitly assign or retain ownerless rows before enforcing non-null ownership.
- The existing baseline is runtime-verified, but raw `pg` remains rollback-only and is intentionally not removed in Slice 1.

## Result Contract — Slice 1

- **status**: `success`
- **executive_summary**: Slice 1 is complete for tasks 1.1–1.2. Real PostgreSQL/Compose evidence now covers fresh and imported legacy migration, safe partial/drift aborts, snapshot verification, readiness ordering, and fail-closed finance HTTP behavior.
- **artifacts**: `openspec/changes/better-auth-financial-boundary/apply-progress.md`; implementation corrections in `packages/database/src/migration.ts`, `packages/database/test/migration.test.ts`, and `packages/database/package.json`
- **next_recommended**: `sdd-apply` for Slice 2 (`slice-1` → `slice-2`)
- **risks**: Owner-scoped provider/application contracts, quarantine/bootstrap, session enforcement, transport hardening, raw-`pg` removal, and unlock remain deferred to later slices; ownerless legacy rows remain inaccessible/rollback-only.
- **skill_resolution**: `paths-injected` — `sdd-apply`, `chained-pr`, and `work-unit-commits` loaded before work.

## Slice 2A Implementation

### Scope and boundary

- Added mandatory `FinanceScope` validation and owner-scoped `FinanceProvider`, scoped async-like provider, factory, product, runtime, snapshot, seed, reset, export, and import paths; legacy no-scope calls remain a locked-only fail-closed compatibility bridge.
- The in-memory factory shares owner-keyed state while every bound provider revalidates the supplied scope; accounts, transactions, idempotency keys, export, import, seed, snapshot, and reset are owner-local.
- Preserved the existing V1 DTO/export envelope, exact bigint Money, privacy/card validation, credit account semantics, and `FINANCE_BOUNDARY_LOCKED=true`. No Prisma provider, portability envelope redesign, quarantine/bootstrap, session, cookie, Next, or API auth behavior was added.
- Existing API call sites remain unchanged; a locked-only legacy factory/call compatibility bridge rejects missing scope before provider access, while the immutable finance lock returns `503` first. No API/session/import redesign was introduced.

### TDD Cycle Evidence

Strict TDD is disabled by `openspec/config.yaml`; the requested RED/GREEN cycle was still recorded:

| Task | RED | GREEN | REFACTOR |
|---|---|---|---|
| 1.3 | Initial transient owner-scope tests failed: data-provider **3 failed** and application **2 failed** because the factory export was missing. | Final focused run: data-provider **1 file, 16 passed, 3 skipped**; application **1 file, 10 passed**. | Consolidated the two-owner harness into existing provider/runtime suites; retained existing Money/privacy/credit and V1 portability assertions. |
| 1.4 | The same RED tests exercised missing/empty owner, scope propagation, owner predicates, and scoped lifecycle before implementation. | Scoped provider/application implementation passes focused suites and package typechecks. | Kept raw PostgreSQL implementation untouched; only its legacy type remains deferred to the later provider slice. |

### Work Unit Evidence

| Evidence | Exact result |
|---|---|
| Focused test command and exact result | `pnpm --filter @2free/data-provider test && pnpm --filter @2free/application test` → **2 files, 26 passed, 3 skipped**, exit `0` (data-provider 16/3 skipped; application 10). |
| Runtime harness command/scenario and exact result | The same command runs the two-owner in-memory harness: Alice and Bob use the same factory and idempotency key, see only their own rows, and Bob reset leaves Alice’s account; exit `0`. |
| Formatter/lint/type check | `pnpm format:check`, `pnpm lint`, `pnpm exec tsc --noEmit --project packages/data-provider/tsconfig.json`, and `pnpm exec tsc --noEmit --project packages/application/tsconfig.json` → exit `0`. |
| Rollback boundary | Revert the Slice 2A provider contract/factory/fake files, application scope propagation, tests, and locked-only compatibility bridge. Keep Slice 1 auth/database foundation, API source, and `FINANCE_BOUNDARY_LOCKED` unchanged. |

### Reproducible workload against approved Slice 1 tree

Counting authored additions plus deletions for the Slice 2A implementation/test allowlist against `3decdd369618a015c1a73e9c0620ae149c83f10b`, excluding pre-existing OpenSpec replanning text and generated artifacts:

| Allowlist bucket | Changed lines |
|---|---:|
| Provider contracts/fake/tests | 217 |
| Application contracts/runtime/tests | 238 |
| Locked compatibility/type tests | 26 |
| **Slice 2A authored total** | **481 (<500)** |

### Result Contract — Slice 2A

- **status**: `success`
- **executive_summary**: Slice 2A tasks 1.3–1.4 are complete. Finance operations now require a validated owner scope through provider and application boundaries, and the shared in-memory fake proves two-owner isolation without changing DTO, Money, privacy, credit, or lock behavior.
- **artifacts**: `openspec/changes/better-auth-financial-boundary/tasks.md`; `openspec/changes/better-auth-financial-boundary/apply-progress.md`
- **next_recommended**: `sdd-apply` for Slice 2B (`slice-2A` → `slice-2B`), implementing only the Prisma provider/composite owner predicates and PostgreSQL two-user harness.
- **risks**: Raw PostgreSQL remains a legacy rollback-only provider and is not owner-safe; its locked compatibility factory must not be enabled for finance before Slice 2B/2C and later lock gates. No quarantine/bootstrap or owner envelope exists yet by design.
- **skill_resolution**: `paths-injected` — `sdd-apply`, `chained-pr`, and `work-unit-commits` loaded before work.
