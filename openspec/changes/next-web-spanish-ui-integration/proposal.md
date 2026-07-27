# Proposal: Next Web Spanish UI Integration

## Intent

Replace the duplicated English `apps/web/src/server.ts` HTML server with Next.js 16 App Router SSR using React, Tailwind v4, `@2free/ui`, its CSS, and logo. Preserve API workflows, exact Money/privacy, and truthful semantics.

## Scope

### In Scope
- Forced `feature-branch-chain`: five slices, each <800 changed lines (target <400 authored): (1) foundation/runtime—Next/Tailwind, assets, standalone pnpm/Docker, SSR; (2) shell/routes—Spanish `AppShell`, responsive/dark/motion routes/boundaries; (3) dashboard/data—typed client, truthful adapter, exact Money/state tests; (4) workflow—accounts, transactions, portability, validation, idempotency, import/export, safe failures; (5) hardening—Chromium, reduced-motion, container proof, legacy removal.
- Dashboard truth: API totals are labeled aggregate/allocation values; transactions are activity; balance is unavailable/configuration-required without a real balance. Allow only a bounded shared UI model extension; never use a zero placeholder.
- Spanish copy, responsive/dark/motion behavior, no card numbers, API/domain ownership.

### Out of Scope
- No API/application/provider or finance arithmetic changes; persistence/auth/sync/banking/integrations/card numbers, duplicated CSS, weakened assertions, or edits to archived `reference-aligned-spanish-ui` and active `runnable-product-foundation`.

## Capabilities

### New Capabilities
- `next-web-runtime`: SSR App Router composition, routes, standalone build, and pnpm/Docker execution.

### Modified Capabilities
- `finance-dashboard-fixture`: unavailable/configuration-required balance presentation with exact Money unchanged.

## Approach

Server pages fetch data; client islands own navigation/forms and pass serializable models to `@2free/ui`. Root layout imports shared CSS/logo; Tailwind v4 scans workspace sources. Preserve `Idempotency-Key`, safe errors, atomic import/export, and API contracts. Delete legacy after build, browser, and container proof.

## Affected Areas

| Area | Impact | Description |
|---|---|---|
| `apps/web/**`, `Dockerfile`, root/pnpm config | Modified | Next routes, adapters, tests, standalone runtime. |
| `packages/ui/**` | Conditional | Bounded dashboard presentation extension, if required. |

## Relationships

- Archived `reference-aligned-spanish-ui` supplies the shared visual/UI contract; consume, never edit, its artifacts.
- Active `runnable-product-foundation` owns runtime, API/application/domain, and workflow contracts; integrate its endpoints without editing its artifacts.

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Totals become mislabeled balance | High | Enforce adapter semantics. |
| SSR/client, Tailwind, or standalone regress | Med | Isolate client islands; verify each build. |
| Migration drops workflow guarantees | Med | Migrate browser assertions before legacy deletion. |

## Rollback Plan

Revert slices independently. Retain the server until Slice 5 passes; otherwise restore it and prior scripts, leaving API, domain, and shared UI contracts intact.

## Dependencies

- API/application contracts, archived UI, supported Node/pnpm, Chromium, and Docker.

## Success Criteria

- [ ] Next SSR renders the Spanish shared UI and all four API-backed workflows.
- [ ] Exact Money, idempotency, import/export, safe failures, accessibility, no-card-number, dark/responsive/motion, and truthful dashboard tests pass.
- [ ] pnpm checks and Docker standalone production smoke pass; legacy server is removed only afterward.
