# Proposal: Mobile-First Finance Experience

## Intent

Make the Next.js finance route mobile-first, not recolored. `ui-reference.png` is the composition authority; Spanish UI, 2free branding, and fail-closed finance remain fixed.

## Scope

### In Scope
- Mobile IA: context, insight card, stacked finance/activity cards, thumb navigation; balanced desktop columns without a permanent sidebar.
- Require `iconoir-react`; every icon-only control MUST have an accessible name and assistive label.
- Use D3 array calculations/scales/shape with declarative React SVG for investment, yield/return, stock, and related charts; responsive `viewBox` and text equivalents are required.
- Separate actual Next-route acceptance from `packages/ui` harness acceptance, including safe states.
- Four force-chained feature-branch slices, normally stopping before 800 additions plus deletions; corrected Slice 3 has one-time maintainer approval at exactly 800.

### Out of Scope
- Better Auth, Prisma, persistence, ingestion, ownership, financial calculations, and real financial data.
- Recolor/package/web-only duplicates, remote fonts, or replacing 2free assets.

## Product Assumptions

- The reference fixes hierarchy, not invented measurements; Spanish copy and branding are authoritative.
- Until Better Auth ownership completes, fixtures are synthetic and never unauthenticated SSR/network finance payloads.

## Capabilities

### New Capabilities
- `route-verified-finance-experience`: Next route proof.
- `financial-chart-presentation`: D3 SVG and text equivalents.

### Modified Capabilities
- `responsive-app-shell`: Mobile/desktop composition.
- `finance-dashboard-fixture`: Spanish cards/charts.
- `shared-ui-foundation`: Iconoir/brand/accessibility.
- `ui-consumer-harness`: Separate evidence.

## Approach

Recompose the Next route over shared UI; use scoped Iconoir/D3 and SSR-safe boundaries, with no domain logic.

## Delivery Chain

Chain `1 foundation/evidence → 2 shell → 3 cards/charts → 4 route hardening (auth boundary, motion, SSR, overflow, visual proof)`; each child targets its predecessor and stops before 800 lines, except corrected Slice 3, which may pass at exactly 800 under its one-time maintainer approval. Tracker is non-mergeable until complete.

## Affected Areas

| Area | Impact |
|---|---|
- `apps/web/app`, `apps/web/components`, `apps/web/app/globals.css`: route/composition.
- `packages/ui/src/{components,models,styles,assets}`, tests, lockfile: UI/charts/evidence.

## Risks

- **High — data leak:** unavailable models and SSR/network assertions.
- **Medium — shell/dependency regression:** preserve API and scoped imports.
- **Medium — subjective/decorative proof:** deterministic captures and text equivalents.

## Rollback Plan

Revert the latest slice independently; retain the prior route, shared contracts, and finance lock. Do not alter active auth or Next migration artifacts.

## Dependencies

- Active `better-auth-financial-boundary`: ownership precedes real data.
- Active `next-web-spanish-ui-integration`: owns Next runtime and route integration.
- Review Next/React, `iconoir-react`, scoped D3, and local fonts.

## Success Criteria

- [ ] Narrow mobile proves stacked IA/bottom navigation; balanced desktop proves columns without a rail; harness evidence is separate.
- [ ] `scrollWidth === clientWidth`; focus, named icon controls, text equivalents, and non-color states pass.
- [ ] Reduced motion preserves final-state parity; SSR/hydration has no browser-global errors or mismatch.
- [ ] Unauthenticated SSR/network output has no finance payload/card numbers; fail-closed remains intact.
- [ ] Deterministic light/dark, mobile/desktop, accessibility, reduced-motion, and visual captures pass across four slices.
