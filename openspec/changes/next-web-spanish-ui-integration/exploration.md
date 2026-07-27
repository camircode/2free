## Exploration: next-web-spanish-ui-integration

### Current State
The runnable web application is not a Next.js application. `apps/web/src/server.ts` creates a Node HTTP server that returns one HTML template with embedded CSS and JavaScript, then fetches the API from the browser. It is English (`lang=en`, English navigation and messages), owns a second visual system, and does not import `@2free/ui`. Its browser suite starts the hand-written server beside an API stub and covers reloads, CRUD forms, validation, idempotency, portability, restart readback, retry, and safe API failures.

The shared UI package is available through `@2free/ui`. It exports `AppShell`, `FinanceDashboard`, dashboard model types, motion helpers, and `@2free/ui/styles.css`; the package also exposes the supplied SVG logo. `AppShell` already provides desktop sidebar plus responsive mobile navigation, Spanish accessibility labels, and callback-based navigation. `FinanceDashboard` accepts a state machine and a reference-aligned `DashboardModel`, with loading/empty/error states, exact money display, trend/allocation data, and recent activity. The shared stylesheet is a layered CSS package, not Tailwind source.

The API contract is HTTP JSON: `/dashboard`, `/accounts` GET/POST, `/transactions` GET/POST, `/export` GET, `/import` POST, plus development-only seed/reset and health/version endpoints. `/dashboard` returns `accountCount`, `transactionCount`, mapped accounts/transactions, and currency totals. It does not directly provide the shared dashboard model's balance, trend/allocation, or activity fields, so an explicit adapter is required; the UI must not invent financial semantics that the API does not establish.

The repository is pnpm-based and currently has TypeScript/Vitest/Playwright quality scripts but no Next, React application setup, Tailwind setup, Docker standalone configuration, or Next route tree. The root Dockerfile copies the monorepo and runs the selected package's `start` script. The existing `@` alias is package-local in shared UI tooling; the new app must preserve an app-local `@/*` alias while importing workspace packages by package name.

### Affected Areas
- `apps/web/src/server.ts` — replace the duplicated static server and embedded English template with the Next App Router application boundary; preserve API-backed workflows through server/client adapters.
- `apps/web/app/**` — add root layout, global CSS import, route segments for dashboard/accounts/transactions/portability, loading/error boundaries, and SSR page data loading.
- `apps/web/components/**` and `apps/web/lib/**` — isolate client-only navigation/forms/mutations from server-side data fetching; centralize typed API client, Spanish product copy, exact Money formatting, and the `DashboardView` to `DashboardModel` adapter.
- `apps/web/package.json`, `apps/web/tsconfig.json`, `apps/web/next.config.*`, `apps/web/postcss.config.*` — add Next/React/Tailwind v4 dependencies, scripts, workspace transpilation/package handling, `@/*` mapping, and `output: "standalone"`.
- `packages/ui/package.json`, `packages/ui/src/index.ts`, `packages/ui/src/styles/index.css` — consume existing public exports and shared stylesheet; only change the package if a proven model/export gap cannot be handled by an app adapter. Do not duplicate its CSS into templates.
- `packages/application/src/product.ts` and API contract tests — treat `DashboardView` as the authoritative response shape and add only narrowly justified mapping coverage if the adapter exposes a real domain ambiguity.
- `apps/web/test/server.browser.test.ts` and new Next browser/unit tests — migrate the current workflow assertions to a running Next app and add SSR markup, Spanish labels, responsive bottom navigation, dark mode, logo/favicon, no-card-number, and runtime failure checks.
- `Dockerfile`, root `package.json`, `pnpm-lock.yaml` — make the container and root dev/check/browser commands build and run the Next standalone server with the API, using pnpm only.

### Approaches
1. **Incremental Next App Router replacement with a typed API adapter** — introduce Next and Tailwind, keep the API service unchanged, fetch initial route data in server pages, pass serializable data to client form/navigation islands, and render `AppShell`/`FinanceDashboard` from `@2free/ui` plus its stylesheet.
   - Pros: satisfies SSR and shared-package requirements; preserves API workflows and domain ownership; keeps client JavaScript bounded; makes route/data boundaries explicit; can be delivered as independent feature-branch slices.
   - Cons: requires replacing the current browser harness and Docker startup; the dashboard response needs a deliberate semantic adapter; `AppShell` navigation callback requires a client boundary.
   - Effort: High

2. **Next shell with route handlers proxying the existing API** — add Next pages and local route handlers, proxy all API calls through same-origin endpoints, then use shared UI components in the pages.
   - Pros: avoids browser CORS concerns and centralizes request/error translation; client forms can call same-origin routes.
   - Cons: duplicates HTTP routing and error behavior, risks hiding API contract regressions, and adds a second server abstraction before the migration is stable; still needs the same dashboard adapter and client boundaries.
   - Effort: High

3. **Embed the existing HTML server inside or alongside Next** — retain the template and progressively mount React/shared UI around it.
   - Pros: smallest initial code movement.
   - Cons: violates the fixed Next App Router SSR requirement, preserves duplicated styles and English product behavior, and makes routing, hydration, and runtime verification unreliable.
   - Effort: Medium, but unacceptable

### Recommendation
Use Approach 1. Establish one Next App Router application with server pages fetching the existing API and typed client components handling mutations, accessible validation, retry, import/export, and navigation. Import `@2free/ui/styles.css` from the root layout and consume `AppShell`, `FinanceDashboard`, and the logo export directly; use Tailwind v4 for app-specific layout/utilities and add `@source` for workspace package scanning only where Tailwind needs to see shared markup. Do not copy shared CSS into strings or reimplement shared components.

Use a route-aware API client with normalized safe errors and preserve `Idempotency-Key` generation for transaction creation. Map `/dashboard` to the shared model conservatively: API currency totals populate accurately labeled aggregate/allocation values, API transactions populate recent activity, and balance is explicitly unavailable/configuration-required unless a real balance is supplied. Do not label transaction totals as account balance, and do not use a zero placeholder that masquerades as money. The proposal/spec may amend `FinanceDashboard` to render an unavailable balance card without changing exact `Money` semantics when a balance exists; any bounded presentation-contract extension must preserve that distinction.

Deliver as a feature-branch chain under the 800-line review budget, with each slice targeted below 400 authored additions plus deletions and with tests in the same slice:
1. **Foundation/runtime slice** — Next App Router, React/Tailwind v4, aliases, shared stylesheet/logo, standalone Docker/start scripts, root layout, favicon, and a minimal SSR route smoke test.
2. **Shell/routes slice** — Spanish `AppShell`, responsive bottom navigation, dark mode, route segments, server-side loading/error boundaries, and client navigation behavior.
3. **Dashboard/data slice** — typed API client, dashboard adapter/model decision, exact Money rendering, and dashboard SSR plus empty/error coverage.
4. **Workflow slice** — accounts, transactions, and portability client islands with accessible validation, idempotency, safe errors, and preserved API behavior.
5. **Runtime hardening slice** — Chromium verification across routes/responsive/dark mode, motion/reduced-motion checks, production standalone build/container smoke test, and removal of the old server harness.

### Risks
- The shared `FinanceDashboard` model cannot be populated losslessly from the current `/dashboard` response; treating totals as a balance would be a product/domain error. Resolve this explicitly before implementation.
- `AppShell` requires `onNavigate`, so navigation must cross a server/client boundary without making the whole page client-rendered; avoid turning SSR data pages into client-only shells.
- Importing package CSS and scanning workspace sources through Tailwind/PostCSS can expose package-resolution or ordering issues; verify the built CSS and avoid duplicating selectors.
- Next standalone output and pnpm workspace dependencies need an explicit Docker build/start contract; the current `tsx src/server.ts` command is not a valid production target.
- Existing browser tests assert English labels and a custom server lifecycle; they must be migrated rather than weakened, while retaining the API failure, validation, idempotency, portability, and restart guarantees.
- Motion helpers use GSAP/browser capabilities and must stay in client components with cleanup and reduced-motion behavior; SSR must not evaluate browser-only APIs.
- Product UI is Spanish while technical artifacts remain English; all route labels, accessible names, status/error copy, and browser assertions must use neutral Spanish.

### Ready for Proposal
Yes. The proposal should approve the bounded feature-branch chain and the truthful dashboard presentation contract: totals remain labeled aggregate/allocation values, transactions remain recent activity, and balance is unavailable/configuration-required until a real balance exists. It may amend `FinanceDashboard` to render that unavailable state without changing exact `Money` semantics. It should also state that the old static server and duplicated template styles are out of scope after the Next runtime slice, with API/domain behavior preserved.

### Result Contract
- **status**: `ready`
- **executive_summary**: Replace the duplicated English Node HTML server with a five-slice Next App Router/Tailwind integration that consumes `@2free/ui`, preserves API-backed workflows, and keeps financial semantics truthful at the dashboard boundary.
- **artifacts**: `openspec/changes/next-web-spanish-ui-integration/exploration.md` (corrected exploration); proposal/spec/design/tasks to be created next; no source changes or other artifacts in this exploration retry.
- **next_recommended**: Create the proposal and spec, explicitly approving the bounded dashboard presentation-contract extension: render balance as unavailable/configuration-required when no real balance is available, map API currency totals to labeled aggregate/allocation values, map transactions to recent activity, and forbid zero monetary placeholders. Preserve the five-slice feature-branch chain under the 800-line review budget.
- **risks**: Preserve all risks listed above, especially the lossless dashboard mapping gap, server/client boundary for `AppShell`, shared CSS/Tailwind ordering, standalone pnpm Docker behavior, migration of existing browser guarantees, client-only motion handling, and neutral Spanish product copy in a technical-English artifact.
- **skill_resolution**: `sdd-explore`, `work-unit-commits`, and `chained-pr` were loaded; exploration is limited to this existing file, with no source or other artifact edits.
