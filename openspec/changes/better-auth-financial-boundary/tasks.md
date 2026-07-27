# Tasks: Better Auth Financial Boundary

## Review Workload Forecast

Estimated changed lines: 1,700–1,950; 360–490 each.
400-line budget risk: High
Chained PRs recommended: Yes
Suggested split: PR 1 → PR 2A → PR 2B → PR 2C → PR 3 → PR 4 → PR 5
Delivery strategy: force-chained
Chain strategy: feature-branch-chain

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

### Suggested Work Units

| Unit | Base / budget | Focused test command | Runtime harness | Rollback boundary |
|---|---|---|---|---|
| 1 | tracker, 260–360 | `pnpm install --frozen-lockfile && pnpm --filter @2free/database db:generate && pnpm --filter @2free/database test` | `db:migrate` | Auth/database; restore snapshot |
| 2A | `slice-1`, 360–490 | `pnpm --filter @2free/data-provider test && pnpm --filter @2free/application test` | Two-owner fake | Scope/contracts/fake; retain lock |
| 2B | `slice-2A`, 400–490 | `pnpm --filter @2free/database test && pnpm --filter @2free/data-provider test` | Two-user Compose PostgreSQL | Prisma provider; retain fake/lock |
| 2C | `slice-2B`, 400–490 | `pnpm --filter @2free/database test && pnpm --filter @2free/data-provider test && pnpm --filter @2free/application test` | Two-user portability/recovery | Portability/bootstrap; restore export |

## Phase 1: Five fail-closed chain slices

- [x] 1.1 **Slice 1 foundation** (tracker → `slice-1`; <800): pinned Better Auth/Prisma, schema/client, baseline/import, secret failure, migration/readiness, lock.
- [x] 1.2 RED then GREEN: secret, fresh/existing/partial/drift/API-before-migration; Prisma-only DDL, abort, rollback, finance `503`.
- [x] 1.3 **Slice 2A RED** (base `slice-1`): failing tests for `FinanceScope`, missing owner, two-user fake isolation, predicates/factories, scoped application interfaces, and money/privacy/credit preservation; run `pnpm --filter @2free/data-provider test && pnpm --filter @2free/application test`.
- [x] 1.4 **Slice 2A GREEN**: implement scope, interfaces/factories/application, owner-aware fake; lock stays on. Rollback: these files; target <500 lines.
- [ ] 1.5 **Slice 2B RED** (base `slice-2A`): failing DB tests for composite owner FKs, duplicate IDs, cross-owner predicates, same-key replay/different fingerprint, two-user isolation; run `pnpm --filter @2free/database test && pnpm --filter @2free/data-provider test`.
- [ ] 1.6 **Slice 2B GREEN**: implement Prisma provider, composite predicates/relations, owner-local idempotency. Harness: two users in Compose PostgreSQL. Rollback: provider/schema; target <500 lines.
- [ ] 1.7 **Slice 2C RED** (base `slice-2B`): failing tests for canonical `OwnerExportV1`, version/identity/malformed/card/mixed-owner rejection, reset/seed, quarantine/bootstrap audit, rollback; run `pnpm --filter @2free/database test && pnpm --filter @2free/data-provider test && pnpm --filter @2free/application test`.
- [ ] 1.8 **Slice 2C GREEN**: implement canonical export/import atomicity, quarantine/audit/bootstrap/restore. Harness: two-user portability plus failed replacement. Rollback: portability/bootstrap; target <500 lines.
- [ ] 1.9 **Slice 3 API** (`slice-2C` → `slice-3`; <800): session-first allowlist, identity, generic errors, CSRF/origin/CORS; retain lock/`503`. Run `pnpm --filter @2free/api test`.
- [ ] 1.10 RED then GREEN: unauthenticated/invalid/expired/forged/mismatched/cross-owner/unknown/malformed/repeated-cookie routes; forwarded-source rejection.
- [ ] 1.11 **Slice 4 Next/Spanish UI** (`slice-3` → `slice-4`; <800): `toNextJsHandler`, DB session, `nextCookies()`, `serverApiFetch`, proxy/matchers, Spanish labels; no recreated auth/proxy/persistence/DTOs.
- [ ] 1.12 RED then GREEN: DB session, Server Action cookie preservation, unauthenticated Spanish UI/no finance session; retain lock.
- [ ] 1.13 **Slice 5 hardening/cutover** (`slice-4` → `slice-5`; <800): proxy/CIDR, HTTP/HTTPS cookies, origin/CSRF/CORS, export/quarantine/restore, migration/E2E/Docker; remove raw `pg`; unlock only after evidence.
- [ ] 1.14 RED then GREEN: Forwarded ambiguity, untrusted origin, HTTP/HTTPS, rollback/export, two-user browser/API E2E, frozen-lockfile `pnpm check`; include tests/docs.
