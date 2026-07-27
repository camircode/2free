# Apply Progress: Next Web Spanish UI Integration

## Status

- **Change**: `next-web-spanish-ui-integration`
- **Artifact store**: OpenSpec
- **Mode**: Standard mode with task-mandated RED/GREEN/REFACTOR evidence (`strict_tdd: false` in `openspec/config.yaml`)
- **Delivery**: force-chained `feature-branch-chain`, slice 3/5, review budget 800
- **Scope**: Phase 1 / Foundation and Runtime tasks 1.1–1.2, the authorized successor correction for two confirmed CRITICAL findings, Phase 2 / Shell and Routes tasks 2.1–2.2, and Phase 3 / Dashboard and Data tasks 3.1–3.2 only
- **Correction forecast**: `<200` authored changed lines for the prior correction; current Slice 3 remains autonomous and review-bounded; no commit, branch, push, PR, or lifecycle operation

## Completed Tasks

- [x] **1.1** Configure the pinned Next/React/Tailwind runtime, app-local alias, standalone tracing, TypeScript/PostCSS configuration, pnpm scripts, and legacy entrypoint preservation.
- [x] **1.2** Add the minimal SSR root, shared CSS/logo imports, Tailwind workspace scan, and server-only API client with local/Compose defaults.
- [x] **2.1** Added the exact dynamic SSR route set, Spanish placeholders, root boundaries, and the client workspace shell.
- [x] **2.2** Added client-only reduced-motion enhancement, dark-mode toggle, responsive shell integration, and server-only `/health` route.
- [x] **3.1** Added the typed server-only dashboard contract/adapter, truthful aggregate/allocation and activity mapping, safe Spanish error handling, and the bounded unavailable-balance UI model extension.
- [x] **3.2** Added exact string-based Money formatting, adapter/SSR/UI/Chromium coverage, semantic allocation/activity assertions, no-card-number/no-overflow checks, and serialized browser test execution.

Tasks 4.1–5.2 remain unchecked in `tasks.md` and were not implemented.

## Authorized Successor Correction

The maintainer-authorized correction is limited to the two confirmed CRITICAL Slice 1 findings. No PostgreSQL/data-provider, route, dashboard, workflow, shared UI, API/domain, or planning-scope changes were made.

### Finding C1 — clean-checkout typecheck

- **Cause**: `apps/web/next-env.d.ts` correctly uses Next's generated `./.next/types/routes.d.ts` reference, but the root typecheck invoked `tsc` directly before the ignored `.next` route declarations were generated.
- **Correction**: `apps/web/package.json:30` adds `typecheck: "next typegen && tsc --noEmit"`; `package.json:18` routes the root typecheck through `pnpm --filter @2free/web typecheck`. The supported generated `apps/web/next-env.d.ts:3` reference was not hand-maintained.
- **Clean-checkout RED precondition**: after `rm -rf apps/web/.next`, `apps/web/.next/types/routes.d.ts` was absent; before the correction there was no package typecheck script that could establish the required generation step. The pre-correction foundation contract run exited 1 with 2 failed tests (missing package typecheck contract and legacy Docker contract).
- **GREEN proof**: after `rm -rf apps/web/.next`, `pnpm --filter @2free/web exec next typegen` generated `apps/web/.next/types/routes.d.ts`, then `pnpm --filter @2free/web exec tsc --noEmit --project tsconfig.json` exited 0. The final root check also executed the package script and exited 0.

### Finding C2 — generic Docker startup

- **Cause**: the generic root `Dockerfile:11` invoked package `start`, which is Next's production server for `@2free/web` without a `.next` build in the image.
- **Correction**: `Dockerfile:11` now invokes `pnpm --filter "$APP" start:legacy`; `apps/api/package.json:14` adds the same legacy alias for the API package so the generic image remains valid for both current `APP` values. Compose already explicitly selected `@2free/web start:legacy` and was not changed.
- **RED proof**: the focused contract test, run after adding the successor assertions but before the implementation, exited 1; 1 file, 3 tests, 2 failed. It identified the missing `typecheck` script and the old generic `CMD pnpm --filter "$APP" start`.
- **GREEN proof**: `newgrp docker -c 'docker build --build-arg APP=@2free/web -t 2free-web-legacy-contract:local .'` exited 0; image inspection reported `CMD ["/bin/sh","-c","pnpm --filter \"$APP\" start:legacy"]`; the container started the legacy server and `curl http://127.0.0.1:4311/` returned HTTP 200 with the legacy HTML contract.

### Correction RED/GREEN Evidence

| Area | RED | GREEN |
|---|---|---|
| Clean typecheck | Clean `.next` had no generated route declarations and the previous package contract had no `typecheck` script. | `next typegen` generated route declarations before check-only `tsc`; exit 0 from the clean package check and root check. |
| Generic Docker command | Foundation contract: exit 1; 1 file, 3 tests, 2 failed. | Docker build: exit 0; inspected command uses `start:legacy`; direct container smoke: HTTP 200. |

## Correction Work Unit Evidence

| Evidence | Result |
|---|---|
| Focused test command and exact result | `pnpm --filter @2free/web test:foundation` → exit 0; Vitest 4.1.0, 1 file, 3/3 tests passed. |
| Runtime harness command/scenario and exact result | `newgrp docker -c 'docker build --build-arg APP=@2free/web -t 2free-web-legacy-contract:local .'` → exit 0; inspected image CMD uses `start:legacy`; started the generic image and `curl http://127.0.0.1:4311/` → HTTP 200; legacy HTML contract passed. |
| Rollback boundary | Revert only `apps/web/package.json:30`, `package.json:18`, `apps/api/package.json:14`, `Dockerfile:11`, the added assertions/helpers in `apps/web/test/foundation.test.ts`, and this correction evidence. Leave the Slice 1 Next foundation, `next-env.d.ts`, Compose selection, and all API/domain implementation untouched. |

## TDD Cycle Evidence

| Task | RED — test first | GREEN — implementation | REFACTOR — final result |
|---|---|---|---|
| 1.1 | `pnpm --filter @2free/web exec vitest run test/foundation.test.ts` → exit 1; 1 file, 2 tests failed because the pinned runtime/config files were absent. | Same command → exit 0; 1 file, 2/2 tests passed after adding the runtime foundation. | `pnpm format` → all changed files normalized; final focused test remained 2/2 passed. |
| 1.2 | The same RED run asserted absent root layout, shared imports, Tailwind scan, and server boundary; the second test failed with `ENOENT` for `apps/web/app/layout.tsx`. | Same command → exit 0; 1 file, 2/2 tests passed. `pnpm --filter @2free/web build` → exit 0 on Next 16.2.11. | Replaced the conflicting wildcard SVG declaration with the exact shared asset specifier required by Next's image typings; final build and quality checks pass. |

## Work Unit Evidence

| Evidence | Result |
|---|---|
| Focused test command and exact result | `pnpm --filter @2free/web test:foundation` → exit 0; Vitest 4.1.0, 1 file, 2/2 tests passed. |
| Runtime harness command/scenario and exact result | `PORT=4310 HOSTNAME=127.0.0.1 pnpm --filter @2free/web start`, then `curl http://127.0.0.1:4310/` → HTTP 200. SSR HTML contained `Base de ejecución`, `2 Free`, and the safe API-failure state; it contained none of `API_URL`, `127.0.0.1:3001`, or `api:3001`. |
| Production build evidence | `pnpm --filter @2free/web build` → exit 0; Next generated the standalone artifact at `apps/web/.next/standalone/apps/web/server.js` and routes `ƒ /` plus `○ /_not-found`. |
| Browser bundle leak check | Search of `apps/web/.next/static/**/*.js` for `API_URL`, `127.0.0.1:3001`, and `api:3001` → no matches. |
| Final quality evidence | `pnpm check` → exit 0: format check, ESLint, all TypeScript projects, and 141 existing package/runtime tests passed (`33 core`, `15 data-provider` plus `3 skipped`, `9 application`, `37 API`, `47 UI`). Foundation test and Next build were run afterward and also passed. |
| Legacy browser regression evidence | `pnpm --filter @2free/web test:browser` → exit 0; Vitest 4.1.0, 1 file, 2/2 existing Chromium-backed legacy web tests passed. |
| Frozen dependency evidence | `pnpm install --frozen-lockfile` → exit 0, lockfile accepted by pnpm 11.13.1. |
| Rollback boundary | Revert only the Slice 1 additions/modifications: `apps/web/app/**`, `apps/web/lib/server-api.ts`, `apps/web/next.config.ts`, `apps/web/postcss.config.mjs`, `apps/web/next-env.d.ts`, `apps/web/types/assets.d.ts`, `apps/web/test/foundation.test.ts`, the `apps/web/package.json` and `apps/web/tsconfig.json` foundation changes, the generated `pnpm-lock.yaml` entries, `eslint.config.js` generated-output ignore, `pnpm-workspace.yaml` sharp build policy, and the web `compose.yml` API/legacy-command entries. Keep `apps/web/src/server.ts` and all API/domain/shared-UI files. |

## Files Changed in This Slice

| File | Change |
|---|---|
| `apps/web/package.json` | Pinned Next 16.2.11, React/react-dom 19.2.7, Tailwind 4.3.3 tooling, `server-only`, shared UI dependency, Next/legacy scripts, and foundation test script. |
| `apps/web/next.config.ts` | Added standalone output, `@2free/ui` transpilation, and monorepo tracing root. |
| `apps/web/postcss.config.mjs` | Added the Tailwind v4 PostCSS plugin. |
| `apps/web/tsconfig.json` | Added the app-local `@/*` alias, Next plugin/types, App Router includes, and excluded legacy browser tests from the application typecheck. |
| `apps/web/next-env.d.ts`, `apps/web/types/assets.d.ts` | Added Next and exact shared SVG typings. |
| `apps/web/app/layout.tsx`, `apps/web/app/globals.css`, `apps/web/app/page.tsx` | Added the minimal Spanish SSR root, exact shared CSS/logo imports, Tailwind sources, and a server-rendered smoke page. |
| `apps/web/lib/server-api.ts` | Added the `server-only` typed fetch boundary, `API_URL` override, local `127.0.0.1:3001` fallback, and Compose `api:3001` fallback. |
| `apps/web/test/foundation.test.ts` | Added RED/GREEN foundation contract tests. |
| `compose.yml` | Kept the web service on `start:legacy` and supplied the server-only Compose API default; no Next Docker switch. |
| `eslint.config.js` | Ignored generated `.next` output so root lint remains source-only. |
| `pnpm-workspace.yaml`, `pnpm-lock.yaml` | Recorded pnpm 11 build-policy compatibility and the pinned dependency graph. |

## Files Changed by Authorized Correction

| File | Change |
|---|---|
| `apps/web/package.json` | Added the supported Next 16 `typecheck` script that runs `next typegen` before `tsc --noEmit`. |
| `package.json` | Routed the root typecheck through the web package typecheck script. |
| `Dockerfile` | Switched the generic image command to the explicit legacy entrypoint. |
| `apps/api/package.json` | Added a script-only `start:legacy` alias so the generic Dockerfile remains valid for the API image. |
| `apps/web/test/foundation.test.ts` | Added focused typecheck-script and generic Docker command contract assertions. |
| `openspec/changes/next-web-spanish-ui-integration/apply-progress.md` | Merged this successor's correction scope, RED/GREEN, runtime, and rollback evidence. |

## Legacy Preservation Proof

- `apps/web/src/server.ts` was not edited.
- `apps/web/package.json` retains `dev:legacy: tsx watch src/server.ts` and `start:legacy: tsx src/server.ts`.
- `compose.yml` explicitly runs `pnpm --filter @2free/web start:legacy`; Docker/Compose was not switched to the standalone Next image/runtime.
- The root quality flow remains in place with its web typecheck delegated through `next typegen`; the generic root `Dockerfile` remains in use with the explicit legacy command.

## Deviations and Issues

- The SVG declaration is scoped to `@2free/ui/assets/2free-con-fondi.svg` rather than `*.svg` because Next's built-in global image typings make a wildcard declaration fail with a duplicate `content` identifier.
- `pnpm add` under pnpm 11 surfaced the new `sharp` build-policy prompt; `pnpm-workspace.yaml` records `sharp: false` so frozen, non-interactive installs remain deterministic. No sharp capability is required by this slice.
- The direct pre-correction `tsc` invocation can exit 0 when no typed-route usage exercises the absent declaration; the correction still makes Next's supported generation step explicit and deterministic for clean checkouts.
- Phase 3 dashboard adapter, workflows, Dockerfile.web, and legacy removal remain intentionally out of scope for this Slice 2 implementation.

## Next Phase

Phase 4 / Slice 4 — Workflow tasks 4.1–4.2: add only the approved accounts, transactions, portability, validation, idempotency, import/export, and safe-failure client workflow boundaries.

## Native Review Correction R1-001

- Public `/` now fails closed with the shared neutral status: authentication is required and financial data is unavailable.
- Root SSR no longer imports or invokes `loadDashboardState`; the typed adapter and focused unit tests remain for future authenticated use.
- Focused Chromium coverage proves `/` makes zero `/dashboard` requests and exposes no transaction date, currency, exact amount, or zero-money placeholder.
- Follow-up: add Better Auth/session infrastructure before reconnecting the root route to authenticated dashboard data.

## Phase 2: Shell / Routes (Slice 2)

### Completed Tasks

- [x] **2.1** Added the exact dynamic SSR route set `/`, `/cuentas`, `/transacciones`, and `/portabilidad`, Spanish placeholders, root loading/not-found/error boundaries, and the client `WorkspaceShell` using the shared `@2free/ui` `AppShell`.
- [x] **2.2** Added the client-only reduced-motion enhancement, dark-mode toggle, responsive shell integration, and server-only `/health` route; the legacy runtime and `start:legacy` Compose selection remain unchanged.

### Shared UI and Boundary Proof

- `apps/web/components/workspace-shell.tsx` imports `AppShell`, `runViewTransition`, and `NavigationItem` from `@2free/ui`, passes neutral Spanish navigation, and routes navigation through the App Router.
- `apps/web/app/layout.tsx` retains the exact `@2free/ui/styles.css` and supplied `@2free/ui/assets/2free-con-fondi.svg` imports and passes the supplied logo into `AppShell`.
- The shared `@2free/ui` CSS owns `.ui-shell__*` responsive desktop/sidebar and fixed mobile-bottom navigation, theme variables, focus semantics, and reduced-motion rules. `apps/web/app/globals.css` adds only app-local page/state/motion selectors and contains no copied legacy `.shell`, `.sidebar`, or `.nav` template selectors.
- `WorkspaceShell`, `MotionEnhancement`, and `app/error.tsx` begin with `"use client"`; route pages, `RoutePlaceholder`, `loading.tsx`, `not-found.tsx`, and the health handler remain server boundaries. The health handler has no browser globals.

### TDD Cycle Evidence (task-mandated; standard mode)

| Task | RED — test first | GREEN — implementation | REFACTOR — final result |
|---|---|---|---|
| 2.1 | `pnpm --filter @2free/web exec vitest run test/routes.test.ts` → exit 1; 1 file, 5 tests, 5 failed before route/shell files existed. Chromium route test → exit 1; 1 file, 3 tests, 3 failed against the Slice 1 root. | The focused route contract → exit 0; 1 file, 5/5 passed. SSR/Chromium route harness → exit 0; exact Spanish routes returned 200 and an unknown route returned 404. | Prettier completed before final checks; final typecheck/build/browser evidence remained green. |
| 2.2 | The same first RED run covered client directives, reduced-motion markers, health source, responsive/dark behavior, and `/health`; source and browser assertions failed before implementation. | The focused contract → exit 0; 5/5 passed. Chromium harness → exit 0; 3/3 passed for dark theme, desktop/mobile navigation, reduced-motion information parity, navigation, and `/health`. | CSS remained app-local; `next.config.ts` gained only the required Turbopack aliases for the source package's `.js` internal aliases; no shared UI package files changed. |

### Work Unit Evidence

| Evidence | Result |
|---|---|
| Focused test command and exact result | `pnpm --filter @2free/web exec vitest run test/routes.test.ts` → exit 0; Vitest 4.1.0, 1 file, 5/5 tests passed. Foundation regression: `pnpm --filter @2free/web test:foundation` → exit 0; 1 file, 3/3 tests passed. |
| Runtime harness command/scenario and exact result | `pnpm --filter @2free/web test:browser` → exit 0; 2 Chromium-backed files, 5/5 tests passed. The new harness fetched SSR HTML for all four exact routes and `/ruta-inexistente`, verified 200/404 plus Spanish content, exercised desktop/mobile layout, dark mode, client navigation, reduced motion, and `/health`; the existing legacy Chromium suite also passed. |
| Build and typecheck | `pnpm --filter @2free/web typecheck` → exit 0. `pnpm --filter @2free/web build` → exit 0; Next reported `ƒ /`, `ƒ /cuentas`, `ƒ /portabilidad`, `ƒ /transacciones`, `○ /health`, and `○ /_not-found`. |
| Formatter | `pnpm exec prettier --write` over all Slice 2 source/config/test files → exit 0; changed files normalized before final checks. |
| Rollback boundary | Revert only the Slice 2 additions under `apps/web/app/{cuentas,transacciones,portabilidad,health}/`, `apps/web/app/{error,loading,not-found}.tsx`, `apps/web/components/`, `apps/web/test/routes*.test.ts`, plus the Slice 2 modifications to `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `next.config.ts`, `tsconfig.json`, and the compatible foundation assertion. Leave `apps/web/src/server.ts`, legacy scripts, `compose.yml`, API/domain packages, and `packages/ui/**` untouched. |

### Legacy Preservation and Deviations

- `apps/web/src/server.ts`, `apps/web/package.json` legacy scripts, generic `Dockerfile`, and `compose.yml` were not changed by Slice 2. Compose continues to select `pnpm --filter @2free/web start:legacy`.
- The implementation adds a small `turbopack.resolveAlias` map in `apps/web/next.config.ts` and a UI-source fallback in `apps/web/tsconfig.json`. This is required because the workspace `@2free/ui` source package intentionally uses package-local `@/...js` imports while Next consumes it through `transpilePackages`; it avoids modifying the shared package or its public contracts.
- No adapters, forms, mutations, dashboard/data models, API/domain/shared-model/card-number behavior, Docker migration, or legacy removal were implemented.

## Remaining Tasks

- [ ] **4.1–4.2** Workflow validation, Server Actions, idempotency, and portability.
- [ ] **5.1–5.2** Standalone/container hardening and gated legacy removal.

## Frozen Slice 2 Candidate Changed-Line Evidence

This automatic corrective rerun records the actual Phase 3 Slice 3 delta against frozen Slice 2 candidate tree `0ed35d66b0c17ef1f629b93a184e12ccc6554d4f`. The command runs from the repository root, extracts that tree to a temporary directory, and compares only the explicit Phase 3 implementation, test, shared-UI, `tasks.md`, and `apply-progress.md` paths. It does not use the mutable index.

Counting convention: Git `--numstat` additions plus deletions are counted as authored changed lines; this is not net file growth, and unchanged context is omitted. Ignored/generated `.next` output is excluded by the explicit path allowlist (no `.next` path is counted); unrelated worktree files and `node_modules` are also excluded.

```bash
BASE=0ed35d66b0c17ef1f629b93a184e12ccc6554d4f
SNAP="$(mktemp -d "${TMPDIR:-/tmp}/next-web-spanish-ui-integration-baseline.XXXXXX")"
trap 'rm -rf "$SNAP"' EXIT
git archive "$BASE" | tar -x -C "$SNAP"
set +e
git diff --no-index --no-ext-diff --numstat "$SNAP" . -- \
  apps/web/app/page.tsx apps/web/lib/dashboard-adapter.ts apps/web/lib/errors.ts apps/web/lib/money.ts \
  apps/web/test/dashboard.browser.test.ts apps/web/test/dashboard.test.ts \
  apps/web/test/routes.browser.test.ts apps/web/test/routes.test.ts apps/web/vitest.browser.config.ts \
  packages/ui/src/components/finance-dashboard.tsx packages/ui/src/index.ts packages/ui/src/models/dashboard.ts \
  packages/ui/src/styles/dashboard.css packages/ui/test/dashboard.test.tsx \
  openspec/changes/next-web-spanish-ui-integration/tasks.md \
  openspec/changes/next-web-spanish-ui-integration/apply-progress.md \
  >"$SNAP/phase3.numstat"
status=$?
set -e
test "$status" -eq 0 -o "$status" -eq 1
awk -F '\t' '{ print; add += $1; del += $2 } END { printf "TOTAL\t%d additions\t%d deletions\t%d changed lines\n", add, del, add + del }' "$SNAP/phase3.numstat"
```

Exact result from that command:

| Path | Additions | Deletions | Total |
|---|---:|---:|---:|
| `apps/web/app/page.tsx` | 7 | 9 | 16 |
| `apps/web/lib/dashboard-adapter.ts` | 139 | 0 | 139 |
| `apps/web/lib/errors.ts` | 5 | 0 | 5 |
| `apps/web/lib/money.ts` | 51 | 0 | 51 |
| `apps/web/test/dashboard.browser.test.ts` | 175 | 0 | 175 |
| `apps/web/test/dashboard.test.ts` | 158 | 0 | 158 |
| `apps/web/test/routes.browser.test.ts` | 21 | 10 | 31 |
| `apps/web/test/routes.test.ts` | 6 | 1 | 7 |
| `apps/web/vitest.browser.config.ts` | 1 | 0 | 1 |
| `packages/ui/src/components/finance-dashboard.tsx` | 30 | 4 | 34 |
| `packages/ui/src/index.ts` | 2 | 0 | 2 |
| `packages/ui/src/models/dashboard.ts` | 8 | 1 | 9 |
| `packages/ui/src/styles/dashboard.css` | 18 | 0 | 18 |
| `packages/ui/test/dashboard.test.tsx` | 18 | 0 | 18 |
| `openspec/changes/next-web-spanish-ui-integration/tasks.md` | 2 | 2 | 4 |
| `openspec/changes/next-web-spanish-ui-integration/apply-progress.md` | 101 | 7 | 108 |
| **Total** | **742** | **34** | **776** |

The allowlisted result is `742 additions + 34 deletions = 776 changed lines`, strictly below the 800-line review budget with a 24-line margin. The `apply-progress.md` row includes this evidence block itself; no forecast or estimated line count is used.

## Phase 3: Dashboard / Data (Slice 3)

### Completed Tasks

- [x] **3.1** Added `apps/web/lib/dashboard-adapter.ts`, `apps/web/lib/money.ts`, and `apps/web/lib/errors.ts`. The server-only adapter validates the typed `DashboardView` response, maps API totals to an allocation labeled `Totales agregados por moneda`, maps transactions to `Actividad reciente`, and returns a safe Spanish error for failed or malformed data. It never maps totals to balance; the model uses `{ status: "unavailable", reason: "configuration-required" }`.
- [x] **3.2** Added exact coefficient/scale string formatting, SSR and Chromium dashboard tests, semantic table/list assertions, no-card-number/no-float checks, and the bounded unavailable-balance extension in `packages/ui`. Available `DashboardMoney` continues through the unchanged `MoneyDisplay` input/rendering path.

### TDD Cycle Evidence (task-mandated; standard mode)

| Task | RED — test first | GREEN — implementation | REFACTOR — final result |
|---|---|---|---|
| 3.1 | `pnpm --filter @2free/web exec vitest run test/dashboard.test.ts` → exit 1 before implementation because `dashboard-adapter.ts` was absent; `pnpm --filter @2free/ui exec vitest run test/dashboard.test.tsx` → 1 failed of 9 because the unavailable-balance branch was absent. | Same focused commands after implementation → web 1 file, 5/5 passed; UI 1 file, 9/9 passed. | `pnpm exec prettier --write` on Slice 3 files → exit 0; final focused web/UI runs remained 5/5 and 9/9. |
| 3.2 | The same first RED tests covered exact coefficient/scale formatting, truthful labels, no placeholder balance, no card numbers, and the bounded UI state before production support existed. | `pnpm --filter @2free/web test:browser` → 3 files, 7/7 Chromium tests passed; dashboard SSR, semantic data, desktop, mobile, dark mode, and no-overflow scenarios all passed. | Final typechecks and browser tests remained green after formatting; the browser config now serializes Next dev-server files to avoid `.next` lock contention while preserving all Phase 2 browser cases. |

### Work Unit Evidence

| Evidence | Result |
|---|---|
| Focused test command and exact result | `pnpm --filter @2free/web exec vitest run test/dashboard.test.ts test/routes.test.ts` → exit 0; 2 files, 10/10 passed. `pnpm --filter @2free/ui exec vitest run test/dashboard.test.tsx` → exit 0; 1 file, 9/9 passed. |
| Runtime harness command/scenario and exact result | `pnpm test:browser` → exit 0; UI Chromium 3 files, 17/17 passed, then web Chromium 3 files, 7/7 passed. The new web harness served a typed dashboard stub through `API_URL`, verified SSR truth labels/no URL leak, semantic allocation/activity data, 1280px desktop, 390px mobile no-overflow, and dark state; existing route/legacy browser coverage remained green. |
| Build and typecheck | `pnpm --filter @2free/web build` → exit 0; Next emitted dynamic `/` and existing routes plus static `/health`. `pnpm --filter @2free/web typecheck && pnpm --filter @2free/ui typecheck` → exit 0. |
| Root quality regression | `pnpm check` → exit 0; Prettier, ESLint, all typechecks, core 33 tests, data-provider 15 passed plus 3 skipped, application 9, API 37, and UI 48 passed. |
| Rollback boundary | Revert only `apps/web/lib/{dashboard-adapter,errors,money}.ts`, `apps/web/app/page.tsx`, `apps/web/test/{dashboard,dashboard.browser}.test.ts`, the Slice 3 root-route test adjustments and browser serialization in `apps/web/test/routes.browser.test.ts`/`vitest.browser.config.ts`, `packages/ui/src/{models/dashboard.ts,index.ts}`, the unavailable-balance branch/styles in `packages/ui/src/{components/finance-dashboard.tsx,styles/dashboard.css}`, the added UI regression, and Slice 3 task/evidence entries. Leave API/application/domain/provider contracts, Phase 1/2 shell/runtime, legacy server/scripts/Docker, and workflow routes untouched. |

### Truthful Mapping Proof

- `DashboardView.totals` is copied as `DashboardTrendOrAllocation.kind: "allocation"` with visible aggregate labels and a summary explicitly stating that values do not represent available balance.
- `DashboardView.transactions` is copied as `DashboardActivity` with original IDs, dates, and exact Money DTOs; no aggregate is substituted for activity.
- `DashboardModel.balance` is unavailable/configuration-required; `FinanceDashboard` renders `No disponible` and `Configuración requerida` without a `MoneyDisplay` or zero DTO. When a real `DashboardMoney` is supplied by an existing consumer, `MoneyDisplay` still renders its supplied currency/text unchanged.
- `apps/web/lib/money.ts` formats coefficient strings using padding and grouping only; it performs no float conversion, arithmetic, provider access, or card-number handling.

### Deviations and Issues

- The web browser Vitest config sets `fileParallelism: false` because the Phase 2 and Slice 3 harnesses each start a Next dev server against the same `.next` directory; serialization prevents a test-only lock collision and does not alter application runtime behavior.
- No accounts, transactions, or portability forms/mutations were implemented. Legacy runtime/scripts/Docker remain unchanged for Slice 4.

## Remaining Tasks After Slice 3

- [ ] **4.1–4.2** Workflow validation, Server Actions, idempotency, and portability.
- [ ] **5.1–5.2** Standalone/container hardening and gated legacy removal.
