# Design: Next Web Spanish UI Integration

## Technical Approach

Replace `apps/web/src/server.ts` with Next.js 16.2.11 App Router SSR. Public UI routes are exactly `/`, `/cuentas`, `/transacciones`, and `/portabilidad`; API endpoints remain unchanged. Server Components and typed Server Actions use server-only `API_URL` (`http://api:3001` in Compose, `http://127.0.0.1:3001` locally). No browser API URL is emitted.

Baseline verified: `apps/web` uses `tsx watch src/server.ts`/`tsx src/server.ts`; `Dockerfile` uses `CMD pnpm --filter "$APP" start`; Compose selects `@2free/web`.

## Architecture Decisions

| Decision | Choice | Rationale |
|---|---|---|
| API boundary | `lib/server-api.ts` (`server-only`) plus typed actions; no route-handler proxy. | Docker-internal URLs never reach HTML, props, or client bundles. |
| Client boundary | `WorkspaceShell`, navigation, forms, and `error.tsx` are Client Components; pages remain server-rendered. | Isolates hooks, browser state, and recovery UI without losing SSR. |
| Dashboard truth | Adapter maps totals to labeled aggregate/allocation values and transactions to activity; balance is `unavailable/configuration-required`, never zero. | The current `DashboardView` has no real balance. |
| Versions/assets | Pin Node 24.18.0, pnpm 11.13.1, Next 16.2.11, React/react-dom 19.2.7, `tailwindcss`/`@tailwindcss/postcss` 4.3.3, `@types/react` 19.2.17/`@types/react-dom` 19.2.3, GSAP 2.1.2/3.15.0, Vitest 4.1.0, Playwright 1.61.1. | Preserves passing versions. |

## Data Flow

```text
Server page --API_URL/no-store--> typed API client --> API
Browser form --typed Server Action--> API_URL/API --safe result--> router.refresh()
                                                        └--> revalidatePath()
```

Actions send JSON/`Idempotency-Key` server-side; one intent UUID is reused on retry. Allowlist validation; normalize other failures to `No se pudo completar la operación`. Return no URL, headers, body, stack, database, or secret details. Revalidate `/` plus the affected page (`/cuentas`, `/transacciones`, or all four after import).

## File Changes

| File | Action | Description |
|---|---|---|
| `apps/web/package.json` | Modify | Add pinned Next/React/Tailwind, `build`, Next `dev/start`; preserve `dev:legacy`/`start:legacy`. |
| `apps/web/next.config.ts`, `postcss.config.mjs`, `tsconfig.json`, `types/assets.d.ts` | Create/modify | `transpilePackages`, app-local `@/*`, Tailwind v4, SVG typing, standalone tracing. |
| `apps/web/app/{layout.tsx,globals.css,page.tsx,cuentas/page.tsx,transacciones/page.tsx,portabilidad/page.tsx,loading.tsx,error.tsx,not-found.tsx,health/route.ts}` | Create | Exact Spanish routes/states; `error.tsx` is client-only; `/health` is internal liveness only. |
| `apps/web/components/{workspace-shell,account-form,transaction-form,portability-panel,motion-enhancement}.tsx`, `apps/web/lib/{server-api,actions,dashboard-adapter,money,errors,validation}.ts` | Create | Client islands/actions, exact Money, adapter, validation, safe errors. |
| `packages/ui/src/models/dashboard.ts`, `packages/ui/src/components/finance-dashboard.tsx` | Conditional modify | Only the bounded unavailable-balance presentation extension; preserve public exact-money inputs and tests. |
| `apps/web/test/**`, root scripts/lockfile, `.env.example`, `compose.yml`, `Dockerfile`, `Dockerfile.web` | Create/modify | Coverage; legacy Docker selection; standalone image. |

## Interfaces / Contracts

```ts
type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };
type DashboardBalance = DashboardMoney | { status: "unavailable"; reason: "configuration-required" };
```

`layout.tsx` contains exact imports `@2free/ui/styles.css` and `@2free/ui/assets/2free-con-fondi.svg`; `globals.css` is app-specific and copies no shared selectors. `WorkspaceShell.tsx`, navigation, forms, `error.tsx`, and `motion-enhancement.tsx` start with `"use client"`; forms call typed actions, never API `fetch`. GSAP and View Transition helpers are client-only. `next.config.ts` sets `output: "standalone"`, `transpilePackages: ["@2free/ui"]`, and `outputFileTracingRoot: path.join(appDir, "../..")`.

The repository artifact is `apps/web/.next/standalone/apps/web/server.js` (`.next/standalone/apps/web/server.js` from `apps/web`). `Dockerfile.web` runs `pnpm --filter @2free/web build`, copies standalone contents to `/workspace`, `apps/web/public` to `/workspace/apps/web/public`, and `apps/web/.next/static` to `/workspace/apps/web/.next/static`; command: `CMD ["node", "apps/web/server.js"]`.

## Testing Strategy

Unit tests cover normalization, exact Money, adapter labels, and boundaries. Browser tests retain validation, same-key idempotency, import/export, restart readback, safe failures, no-card-number, accessibility, responsive/dark/reduced-motion behavior across all routes. Gates run build, standalone health, Chromium, `pnpm check`, and frozen Compose health.

## Threat Matrix

| Boundary | Applicability | Safe/failure behavior; planned RED test |
|---|---|---|
| Documentation-like paths | N/A — no executable-document classification. | None. |
| Git repository selection | N/A — no VCS automation. | None. |
| Commit state | N/A — no commit automation. | None. |
| Push state | N/A — no push automation. | None. |
| PR commands | N/A — no PR automation. | None. |
| Routing/process integration | Applicable — exact route allowlist, Server Actions, Docker. | Unknown UI route 404; malformed/503 API yields safe Spanish error; no shell interpolation; standalone command starts the exact server path. RED: unknown route, leaked `API_URL`, malformed payload, 503, standalone start. |

## Scope, Rollout, and Rollback

No API/application/provider/arithmetic/persistence/auth/sync/banking/integration/card-number/duplicated-CSS/weakened-test or referenced-artifact edits; budgets, investments, account management, and notifications are also excluded from this integration change. Archived `reference-aligned-spanish-ui` and active `runnable-product-foundation` remain untouched. Five feature-branch-chain slices stay `<800` changed lines and target `<400` authored: (1) foundation/runtime, (2) shell/routes, (3) dashboard/data, (4) workflows, (5) hardening. Slices 1–4 keep `src/server.ts`, legacy scripts, and Compose command `["pnpm","--filter","@2free/web","start:legacy"]`. Slice 5 switches to `Dockerfile.web` and deletes legacy only after frozen install, quality, browser, workflow, accessibility, standalone, and health gates; otherwise retain it.

## Open Questions

None.

## Result Contract

- **status**: `success`
- **executive_summary**: Corrected server-only API, routes, standalone paths, boundaries, exclusions, rollback, and gates.
- **artifacts**: `openspec/changes/next-web-spanish-ui-integration/design.md` (only file modified).
- **next_recommended**: `sdd-tasks` — route this design into five hierarchical, independently revertible tasks and carry every applicable threat RED test unchanged.
- **risks**: SSR/client, standalone, dashboard truth, and workflow parity; covered by slice gates.
- **skill_resolution**: `paths-injected` — `sdd-design`, `cognitive-doc-design`, `chained-pr`, and `work-unit-commits` loaded before work.
