# Design: Runnable Product Foundation

## Technical Approach

Deliver five chained slices: composition, cloud durability, web workflows, local-first SQLite, and parity/release. `core` remains the sole owner of money, privacy, account, transaction, and product invariants. `FinanceProvider` remains the provider port; `packages/application` owns use cases and view-model mapping, keeping API DTOs and React components from reimplementing rules.

## Architecture Decisions

| Decision | Choice | Alternatives rejected | Rationale |
|---|---|---|---|
| Application boundary | Add `packages/application`; evolve methods to async-compatible contracts while retaining `FinanceProvider`. | HTTP-specific or per-target use cases. | PostgreSQL is asynchronous; one implementation prevents drift. |
| Adapter ownership | Add PostgreSQL and SQLite implementations beside the in-memory provider in `packages/data-provider`. | SQL in `core`; per-app repositories. | Follows existing provider/portability boundaries and keeps SQL out of domain code. |
| Target sequencing | Web + PostgreSQL first, SQLite second, parity last. | Concurrent targets; local-first first. | Resolves operational contracts early and isolates native-driver/encryption uncertainty. |
| Encryption claim | Expose a capability report; plain SQLite is explicitly unencrypted, while SQLCipher is reported only after target verification. | Inferring encryption from a compatible API or package name. | Prevents a security claim without build evidence. |

## Data Flow and Semantics

```text
Next.js routes / local runtime
          ↓
      application use case → DTO/view-model mapper
          ↓
      FinanceProvider port
       ↙              ↘
PostgreSQL adapter   SQLite adapter
          ↓              ↓
       database transactions and migrations
```

Create operations validate through `core`, then commit one entity atomically. Import validates the complete versioned envelope before applying destination state in one transaction; failures roll back completely. Adapters preserve coefficient/scale/currency exactly. Seed/reset uses deterministic demo identifiers and a seed marker, never banking-import semantics.

## Configuration and Runtime Profiles

Configuration fails before serving requests and uses non-secret local defaults. Profiles are `compose-cloud-dev`, `cloud-test`, `local-offline` (SQLite, no network), and `ci`. `/health` reports process/database readiness separately; `/version` returns application, build, and target fields. Compose gates dependents on database health; quickstart documents setup and verification.

## File Changes

| File | Action | Description |
|---|---|---|
| `apps/web/**` | Create | Next.js routes, API client, state boundaries. |
| `apps/api/**` | Create | NestJS composition, DTOs, health/version. |
| `apps/local/**` | Create | Offline runtime and capability report. |
| `packages/application/**` | Create | Shared use cases and view models. |
| `packages/data-provider/src/**`, `test/**` | Modify | Port, adapters, migrations, contract fixtures. |
| `packages/ui/src/**`, `test/**` | Modify | View models and operation states. |
| `package.json`, `pnpm-workspace.yaml`, configs | Modify | Workspace/test orchestration. |
| `compose.yml`, `.env.example`, `README.md` | Create/Modify | Readiness stack, config, quickstart, scope. |

## Interfaces / Contracts

`FinanceProvider` retains `createAccount`, `createTransaction`, list, export, and import semantics; durable implementations return promises without exposing SQL. Application contracts expose typed commands and view models, while HTTP DTOs remain transport-only. Storage capabilities report `{ sqlite: true, encryption: "unencrypted" | "sqlcipher-verified" | "unsupported", target }`.

## Testing and Evidence Strategy

Unit tests cover invariant delegation and mapping. One provider contract suite runs against PostgreSQL and SQLite for exact money, privacy, portability, atomicity, and storage failures. Compose API integration tests prove migrations, health/version, restart durability, seed/reset, and errors. Chromium E2E proves routes, create/read, portability, accessibility, states, and restart data. Release evidence records quickstart, offline/restart, capability, parity, and failure gates; unverified encryption blocks release.

## Chained Work-Unit Boundaries and Rollback

1. **Runtime foundation:** composition, profiles, readiness/version, seed/reset, quickstart; rollback without schema changes.
2. **Cloud durable:** PostgreSQL migrations, adapter, workflows, API proof; rollback app code while retaining compatible migrations.
3. **Web workflows:** routed UX and browser evidence; rollback routes/UI without changing domain or storage.
4. **Local-first:** SQLite runtime, recovery, offline/restart, capability seam; defer without changing core or portability v1.
5. **Parity/release:** shared contracts, cross-target portability, and final gates; rollback evidence/configuration only.

## Threat Matrix

| Boundary | Applicability | Safe/failure behavior | Planned RED tests |
|---|---|---|---|
| Documentation-like paths | N/A — no executable-file classification. | N/A | None |
| Git repository selection | N/A — no VCS automation. | N/A | None |
| Commit state | N/A — no commit automation. | N/A | None |
| Push state | N/A — no push automation. | N/A | None |
| PR commands | N/A — no PR automation. | N/A | None |

## Migration / Rollout

Use additive compatible migrations and versioned portability envelopes. Roll out cloud before local and record target/version/capability evidence. Authentication, authorization, sync, notifications, budgets, investments, market data, OpenBB, Banxico, generic integrations, and banking integrations remain excluded.

## Open Questions

- [ ] Which PostgreSQL migration library and SQLite driver are supported in CI?
- [ ] Which declared local targets must have verified SQLCipher builds?
- [ ] Is import’s destination behavior formally replace-all (matching the current in-memory provider) or a future merge mode?
