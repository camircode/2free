# Apply Progress: Shared App Shell and Design System

## Execution

- **Mode:** Standard Mode with explicit RED → GREEN sequencing.
- **Delivery:** auto-chain, feature-branch-chain, PR #3 based on the PR #2 branch.
- **Assigned boundary:** Work Unit 4 / Phase 4 tasks 4.1–4.3 only, based on PR #3.
- **Status:** 12/12 tasks complete; Phase 4 is complete.

## Completed Work

### Phase 1 — Package Foundation

- [x] 1.1 Package, aliases, React/tooling pins, and package gate.
- [x] 1.2 Semantic themes, status meanings, focus visibility, and reduced-motion CSS.
- [x] 1.3 Offline logo asset and local typography fallback contract.

Evidence: the prior foundation run passed `pnpm --filter @2free/ui test` (3 files, 8 tests), the UI typecheck, and `pnpm check`.

### Phase 2 — Shell and Dashboard

- [x] 2.1 Consumer-composed responsive `AppShell` with named landmarks, active navigation semantics, deterministic focus order, narrow layout, and SSR-safe render output.
- [x] 2.2 Typed `DashboardModel` using exact `@2free/core` `MoneyDto` plus `{ currency, text }` `FormattedMoney`; fixture-backed balance, trend/allocation, and recent activity display.
- [x] 2.3 Loading, empty, error, and ready status rendering with accessible text summaries, non-color status semantics, compact narrow data rows, and prop-only scope.

RED → GREEN evidence:

| Task | RED | GREEN |
|---|---|---|
| 2.1 | Shell test imports failed because `AppShell` did not exist. | Shell tests passed: landmarks, active callback, keyboard order, narrow marker, and static SSR markup. |
| 2.2 | Dashboard test imports failed because `FinanceDashboard` did not exist. | Fixture tests passed: supplied formatted values, currency context, summaries, and compact rows. |
| 2.3 | State tests failed because the dashboard state renderer did not exist. | Four state semantics and prop-only boundary tests passed. |

## Work Unit Evidence

- **Focused tests:** `pnpm --filter @2free/ui test -- dashboard shell` — PASS, 5 test files and 14 tests.
- **Package typecheck:** `pnpm --filter @2free/ui typecheck` — PASS, `tsc --noEmit --project tsconfig.json` exited 0.
- **Workspace gate:** `pnpm check` — PASS: formatting, lint, all typechecks, 24 core tests, and 9 data-provider tests.
- **Runtime harness:** Vitest/jsdom renders consumer navigation and dashboard fixtures, activates navigation, renders SSR static markup, checks all four states, and verifies compact values. No service, browser API, storage, fetch, or network boundary exists.
- **Rollback boundary:** Remove the Phase 2 shell/dashboard/model files, responsive styles and imports, focused tests, public exports, UI core contract declaration, and this Phase 2 evidence; retain Phase 1 foundation and core/data-provider contracts.
- **Line impact:** Approximately 700 authored added/changed lines, within the 800-line feature-chain budget and bounded to PR #2.

## Phase 3 — Motion, Harness, and Gates

- [x] 3.1 Scoped `@gsap/react` motion lifecycle, reduced-motion and SSR-safe capability detection, and exactly-once View Transition fallback.
- [x] 3.2 Public-import React consumer harness covering shell, dashboard, themes, aliases, assets, accessibility, and motion without product behavior.
- [x] 3.3 Root test/quality scripts, TSX lint coverage, and frozen-install CI workflow.

RED → GREEN evidence:

| Task | RED | GREEN |
|---|---|---|
| 3.1 | Motion helper imports were unavailable; the focused suite failed 7/7. | Motion suite passed scoped GSAP isolation, `revertOnUpdate`, unmount cleanup, reduced motion, SSR-like rendering, unsupported transitions, and thrown/rejected exactly-once fallback tests. |
| 3.2 | No public-import consumer harness existed. | Public `@2free/ui` harness passed shell, dashboard, theme, asset, alias, accessibility, and motion contract assertions. |
| 3.3 | Root aggregate UI test, CI quality workflow, and TSX lint coverage were absent. | Root format, lint, typecheck, test, check, and offline frozen-install commands passed. |

## Work Unit 3 Evidence

- **Focused tests:** `pnpm --filter @2free/ui test -- motion-enhancement consumer-harness` — PASS, 7 test files and 23 tests.
- **Package typecheck:** `pnpm --filter @2free/ui typecheck` — PASS, `tsc --noEmit --project tsconfig.json` exited 0.
- **Runtime harness:** jsdom public-import consumer plus browser-capability mocks passed shell/dashboard/theme/asset/accessibility/motion contracts, including SSR-like `renderToStaticMarkup` with `window` and `document` unavailable. No app route, storage, service, network, or native boundary exists.
- **Non-mutating check:** `pnpm install --frozen-lockfile --offline` — PASS, already up to date; `git diff --check` — PASS.
- **Workspace gates:** `pnpm format:check` — PASS; `pnpm lint` — PASS; `pnpm typecheck` — PASS; `pnpm test` — PASS with 24 core, 9 data-provider, and 23 UI tests; `pnpm check` — PASS.
- **Rollback boundary:** Remove `packages/ui/src/motion/`, motion and consumer harness tests, motion exports, root `test`/`test:ui`/`ci:quality` scripts, TSX lint coverage, and `.github/workflows/quality.yml`; retain Phase 1/2 UI and core/data-provider contracts.
- **Line impact:** The new motion/harness/CI files contain 408 lines; including existing-file exports, scripts, lint wiring, and Phase 3 evidence, the authored PR #3 slice is approximately 460 lines, within the 800-line feature-chain budget. Supplied logo and generated lockfile lines are excluded.

## Phase 4 — Browser Verification

- [x] 4.1 Vitest Browser Mode is configured in `packages/ui/vitest.browser.config.ts` with the package-local `@/*` alias, `@vitest/browser@4.1.0`, `@vitest/browser-playwright@4.1.0`, and `playwright@1.61.1` as dev-only dependencies. `test:browser` runs only `*.browser.test.*` files; the jsdom config explicitly excludes them.
- [x] 4.2 Chromium browser tests cover native Enter/Space activation, computed wide/narrow shell and dashboard CSS after `page.viewport` changes plus `getComputedStyle`, and SSR-to-client motion hydration without console errors.
- [x] 4.3 Root and CI quality paths use pnpm-only frozen install, explicit `pnpm exec playwright install chromium`, quality gates, and browser verification.

RED → GREEN evidence:

| Task | RED | GREEN |
|---|---|---|
| 4.1 | `pnpm --filter @2free/ui test:browser` failed because the package script did not exist. | Browser config, exact Vitest 4.1.0 provider pins, lockfile, aliases, and deterministic script were added; explicit Chromium installation passed. |
| 4.2 | Browser tests initially failed on the unsupported locator `focus()` method and React `act` warning. | Tests use real DOM focus plus Vitest `userEvent.keyboard`, `page.viewport`, computed styles, and hydration checks; `1` file / `3` browser tests passed. |
| 4.3 | `pnpm test` initially included browser files in jsdom and failed before the explicit exclusion. | jsdom exclusion restored `pnpm test`; frozen install, format, lint, typecheck, check, and browser CI path all passed. |

## Work Unit 4 Evidence

- **Focused browser tests:** `pnpm --filter @2free/ui test:browser` — PASS, 1 file / 3 tests, Chromium, Vitest 4.1.0.
- **Existing jsdom suite:** `pnpm --filter @2free/ui test` — PASS, 8 files / 30 tests; browser files remain excluded from the default suite.
- **Chromium prerequisite:** `pnpm exec playwright install chromium` — PASS, Playwright 1.61.1 downloaded Chromium 149.0.7827.55 and its headless shell to the Playwright cache.
- **Workspace quality:** `pnpm test` — PASS, 2 core files / 27 tests, 1 data-provider file / 10 tests, 8 UI files / 30 tests; `pnpm typecheck` — PASS; `pnpm format:check` — PASS; `pnpm lint` — PASS; `pnpm check` — PASS.
- **CI-equivalent:** `pnpm ci:quality` — PASS: frozen install, explicit pnpm Chromium installation, format, lint, all typechecks, aggregate jsdom tests, and browser tests (1 file / 3 tests).
- **Runtime harness:** Vitest Browser Mode with Playwright Chromium exercised native keyboard dispatch, responsive CSS at 1280×800 and 480×800, and client hydration of the scoped GSAP component. No app route, service, storage, fetch, network, backend, or native boundary exists.
- **Rollback boundary:** Remove `packages/ui/vitest.browser.config.ts`, `packages/ui/test/app-shell.browser.test.tsx`, browser-only dev dependencies and lockfile entries, `test:browser`/`ci:quality` browser commands, the jsdom browser exclusion, the CI Chromium step, and Phase 4 task/evidence text; retain all Phase 1–3 UI implementation and evidence.
- **Line impact:** Approximately 205 authored lines for the Phase 4 config, tests, scripts, CI wiring, and evidence; generated lockfile entries are excluded. The slice remains autonomous and below the feature-chain review budget.

## Remaining Work

None — all 12 tasks are complete. Ready for `sdd-verify`.

## Bounded Remediation Evidence

- **Binding:** lineage `review-a4ca8fa9300b6025`, generation `1`, fix batch `1`, failed evidence revision `sha256:e16cb4121be5c5da77e1794d5c475f64392dd6f759888dc55557b5587cc06278`.
- **Focused tests:** `pnpm --filter @2free/ui test -- app-shell dashboard motion-enhancement consumer-harness status-semantics-remain-accessible-without-color workspace-quality-failure` — PASS, 8 files / 30 tests, exit 0, output SHA-256 `sha256:987d0bceae9aaccef314d09742b1b2a75ce60dec4ae99d2d0514478c8ba0b041`.
- **Runtime harness:** deterministic jsdom shell/dashboard/theme/font/keyboard/viewport/SSR-hydration/GSAP/public-consumer checks plus temporary Prettier violation — PASS, same 8 files / 30 tests, exit 0.
- **Workspace gates:** `pnpm test` PASS (2 core files / 24, 1 provider file / 9, 8 UI files / 30); `pnpm typecheck` PASS; `pnpm check` PASS. Exact hashes are in `remediation-report.jsonl`.
- **Rollback boundary:** remove only the six remediation test-file changes, this evidence section, and `remediation-report.jsonl`; retain all prior product implementation and Phase 1–3 evidence.
- **Changed-line impact:** 173 net authored lines; within the 200-line correction budget; no production behavior changed.
