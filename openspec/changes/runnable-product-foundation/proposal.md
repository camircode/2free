# Proposal: Runnable Product Foundation

## Intent

2 Free has package-first domain and UI contracts, but no executable product, API, durable storage, or user journey. A minimal demo would not validate the operational and portability decisions that matter. This change establishes a serious, reviewable program for useful finance workflows, safe persistence, and eventual offline use.

Shared `core` → `application` → provider contracts prevent duplicate rules across consumers.

## Scope

### In Scope
- Chained delivery: web/cloud first, local-first second, in reviewable slices.
- Foundation: executable `apps/web`, `apps/api`, `packages/application`, tooling, configuration, Compose, quickstart, `/health`, and `/version`; in-memory is seed-only.
- Cloud: PostgreSQL migrations/adapter, durable account/transaction/import/export, restart durability, API integration tests, and Chromium E2E.
- Web UX: routed dashboard, accounts, transactions, and portability with accessible operation states.
- Local-first/parity: SQLite offline/restart behavior, shared adapter contracts, cross-target portability, and capability-gated SQLCipher seams.

### Out of Scope
- Authentication, authorization, sync, notifications, budgets, investments, external market data, OpenBB, Banxico, generic integrations, and all banking integrations.
- Unverified encryption claims; plain SQLite must be labeled unencrypted.
- Concurrent target implementation or one oversized full-stack slice.

## Capabilities

### New Capabilities
- `runtime-composition`: executable web/API composition and quickstart.
- `cloud-durable-product`: PostgreSQL durability and API proof.
- `web-product-workflows`: routed UX and operation states.
- `local-first-runtime`: SQLite offline/restart durability.
- `target-parity-release`: adapter contracts, portability, and release gates.

### Modified Capabilities
- `local-data-portability`: extend deterministic, atomic portability across PostgreSQL and SQLite adapters.

## Approach and Delivery Boundaries

1. **Foundation:** composition, readiness, version, seed/reset, and smoke proof.
2. **Cloud:** PostgreSQL durability, use cases, portability, and API/browser proof.
3. **Web:** routed user value; rules remain outside React.
4. **Local-first:** SQLite behind the same ports; offline/restart proof.
5. **Parity/release:** shared contracts and failure-mode verification on both targets.

## Affected Areas

Monorepo apps/packages, persistence adapters, `compose.yml`, README, and tests.

## Risks and Mitigation

| Risk | Mitigation |
|---|---|
| Scope exceeds review capacity | Keep five bounded slices. |
| PostgreSQL/SQLite diverge | Enforce shared contract and atomicity tests. |
| API/UI duplicate rules | Centralize use cases in `packages/application`. |
| SQLCipher varies by platform | Verify or report unsupported; never infer encryption. |

## Rollback Plan

Revert slices independently; defer SQLite without changing `core`, application ports, or portability format.

## Dependencies

Supported Node/pnpm, PostgreSQL/Compose, Chromium, and a verified SQLite driver.

## Success Criteria

- [ ] A documented quickstart runs web/API against Compose, with readiness and version gates.
- [ ] Accounts, transactions, deterministic import/export, and error states survive cloud restart and pass API/Chromium proof.
- [ ] Local SQLite runs offline and after restart; portability works across targets.
- [ ] Shared contracts preserve exact money, privacy rejection, and atomic import behavior; no out-of-scope integration is implied.
