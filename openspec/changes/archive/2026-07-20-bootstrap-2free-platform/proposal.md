# Proposal: Bootstrap the 2 Free Contract Foundation

## Intent

Create a reproducible, testable foundation for local financial workflows before introducing product surfaces or remote infrastructure. This prevents float-based money, unsafe card data, and conflated credit-product rules from becoming platform defaults.

## Scope

### In Scope
- Initialize a pnpm TypeScript monorepo with deterministic scripts, formatting, linting, type checks, tests, and CI-ready quality gates.
- Add a small finance core with decimal-safe money, generated identifiers, sanitized account metadata, transactions, and explicit `revolving-credit` versus `charge-card` models.
- Define a provider contract plus deterministic in-memory/local implementation; support versioned export/import round trips and focused invariant tests.

### Out of Scope
- Production web, landing, desktop, mobile, or polished UI applications.
- NestJS/PostgreSQL, Better Auth, SQLite/SQLCipher, encryption-key UX, synchronization, notifications/rules, OpenBB, Banxico, Docker deployment, and platform packaging; each is a follow-up change.
- Card numbers, CVV, PINs, track data, or any equivalent sensitive payment credential.

## Capabilities

### New Capabilities
- `workspace-quality-gates`: Reproducible pnpm/TypeScript workspace commands and automated quality checks.
- `finance-core`: Decimal-safe financial values, privacy-safe entities, transactions, and distinct revolving-credit and charge-card rules.
- `local-data-portability`: Deterministic provider contract and versioned local export/import behavior.

### Modified Capabilities
None; `openspec/specs/` contains no existing capabilities.

## Approach

Use the recommended contract-first bootstrap. Keep rules in `packages/core`, persistence-independent ports in `packages/data-provider`, and an in-memory/local adapter for the demonstrable workflow: sanitized account and transaction → export → fresh-store import. Persist currency-aware decimal representations, never JavaScript `number` values or payment credentials. Keep this one autonomous work unit within the 800-line review budget; auto-forecast follow-up slices if it exceeds it.

## Affected Areas

| Area | Impact | Description |
|---|---|---|
| `package.json`, `pnpm-workspace.yaml`, tool configs | New | Workspace tooling and quality gates |
| `packages/core` | New | Finance domain and privacy invariants |
| `packages/data-provider` | New | Provider port, local adapter, export/import |
| `packages/*/test` | New | Focused contract and round-trip tests |

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Unresolved rounding/currency policy | Med | Specify assumptions; reject implicit float conversion |
| Charge-card rules overgeneralized | Med | Separate discriminated models and tests |
| Export format becomes premature storage design | Low | Version a minimal envelope; defer SQLite/migrations |

## Rollback Plan

Revert the bootstrap work unit: remove workspace/package manifests and new package directories together. No production data, external services, or migrations are introduced.

## Dependencies

- A supported Node.js and pnpm version selected and pinned during implementation.

## Success Criteria

- [ ] Clean checkout installs and runs format, lint, type-check, and focused tests through documented workspace scripts.
- [ ] Tests prove decimal-preserving export/import, privacy-safe metadata rejection, and distinct revolving-credit versus charge-card semantics.
- [ ] The implementation remains an autonomous slice at or below the 800-line review budget, or is automatically forecast into follow-up work units.
