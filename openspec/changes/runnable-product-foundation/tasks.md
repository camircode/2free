# Tasks: Runnable Product Foundation

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated changed lines | 500–700 per unit; 2,750–3,800 total |
| 400-line budget risk | High |
| Chained PRs recommended | Yes — five independently runnable units |
| Delivery strategy | auto-forecast |
| Chain strategy | feature-branch-chain; PR #1 targets feature tracker, later PRs target immediate parent |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|---|---|---|---|---|---|
| 1 | Composition | PR 1 | `pnpm test --filter runtime` | Compose + curl | apps, config, README |
| 2 | PostgreSQL | PR 2 | `pnpm test --filter cloud` | restart + API flow | migrations, adapter, tests |
| 3 | Web UX | PR 3 | `pnpm test --filter web` | Chromium/Compose | routes/tests |
| 4 | SQLite | PR 4 | `pnpm test --filter local` | local offline runtime | local app/adapter |
| 5 | Parity/release | PR 5 | `pnpm test:release` | release harness | parity/CI/docs |

## Phase 1: Runtime Composition — PR 1

- [x] 1.1 Create `apps/api`, `apps/web`, `packages/application`; add async ports, mapping, validated config, and scripts (runtime R1).
- [x] 1.2 Add `/health`, `/version`, seed/reset, in-memory composition, `compose.yml`, `.env.example`, README; test invalid config and DB-not-ready (R2–R3).
- [x] 1.3 Boundary: frozen install, focused tests, Compose, curl endpoints; no schema or production persistence.

## Phase 2: Cloud Durable Product — PR 2

- [x] 2.1 Add PostgreSQL migrations/adapter under `packages/data-provider`, transactions, mapping, and fixtures; preserve exact money and privacy (cloud R1, R3).
- [x] 2.2 Implement account/transaction/dashboard/import/export use cases and API endpoints in `packages/application` and `apps/api`; add RED tests for malformed/unsafe/conflicting import rollback before production logic (cloud R2, R4).
- [x] 2.3 Verify API, seed/reset, restart, migration readiness, deterministic round trip, and Chromium workflow (cloud R1–R4).

## Phase 3: Web Product Workflows — PR 3

- [x] 3.1 Build routed dashboard/accounts/transactions/portability screens in `apps/web`; add accessible forms, retry, and all operation states (web R1–R3).
- [x] 3.2 Add Browser Mode/Chromium tests for routes, money, validation, duplicate prevention, safe errors, restart, and portability (web R1–R4).

## Phase 4: Local-First SQLite — PR 4

- [ ] 4.1 Add SQLite adapter, migrations/recovery, driver seam, and `apps/local`; add RED tests for missing/locked/corrupt DB (local R1–R2).
- [ ] 4.2 Implement capability report `{target,encryption}`; label plain SQLite unencrypted and gate SQLCipher claims on verified CI/target evidence (local R3).
- [ ] 4.3 Verify offline create/read, restart readback, failures, and deterministic import/export with `pnpm test --filter local`.

## Phase 5: Parity and Release — PR 5

- [ ] 5.1 Run shared PostgreSQL/SQLite contracts for exact money, privacy, atomicity, failures, and portability; link evidence to portability/parity R1–R2.
- [ ] 5.2 Add CI/release gates/docs for quickstart, Compose, API, Chromium, offline/restart, capability, and exclusions; block failed gates/unverified encryption (parity R3).
- [ ] 5.3 Record target/version/capability evidence and run `pnpm test:release`; rollback boundary is evidence/configuration only, never core/provider behavior.
