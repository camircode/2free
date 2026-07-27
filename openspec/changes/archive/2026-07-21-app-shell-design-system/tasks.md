# Tasks: Shared App Shell and Design System

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated changed lines | 850–1,050 authored lines |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 foundation → PR 2 shell/dashboard → PR 3 motion/harness/gates → PR 4 browser verification |
| Delivery strategy | auto-chain |
| Chain strategy | feature-branch-chain |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|---|---|---|---|---|---|
| 1 | Foundation | PR #1, tracker base | `pnpm --filter @2free/ui test` | jsdom; no service | UI foundation files/config |
| 2 | Shell/dashboard | PR #2, PR #1 base | `pnpm --filter @2free/ui test -- dashboard shell` | React fixture; no backend | shell/dashboard files |
| 3 | Motion/gates | PR #3, PR #2 base | `pnpm check` | jsdom/mocks; no service | motion, harness, root gates |
| 4 | Browser verification | PR #4, PR #3 base | `pnpm --filter @2free/ui test:browser` | Vitest Browser Mode + Playwright Chromium; requires `pnpm exec playwright install --with-deps chromium` | browser config/tests/deps/scripts/CI only |

## Phase 1: Package Foundation (PR #1)
- [x] 1.1 RED/GREEN: create `packages/ui` manifests/configs, local `@/*` alias, and React/Vitest/jsdom/Testing Library pins; package gate passed.
- [x] 1.2 RED/GREEN: add `packages/ui/src/styles/*` semantic themes, focus/status/reduced-motion CSS; 6 theme tests passed.
- [x] 1.3 RED/GREEN: add `packages/ui/src/assets/2free-con-fondi.svg` and local typography fallbacks; offline asset/font tests passed.

## Phase 2: Shell and Dashboard (PR #2)
- [x] 2.1 RED/GREEN: add `src/components/app-shell.tsx` responsive landmarks, semantics, focus, and SSR markup; shell tests passed.
- [x] 2.2 RED/GREEN: add `src/models/dashboard.ts` and dashboard components with exact `MoneyDto`/`FormattedMoney`; fixture tests passed.
- [x] 2.3 RED/GREEN: add four dashboard states, summaries, compact rows, and prop-only boundary; state tests passed.

## Phase 3: Motion, Harness, and Gates (PR #3)
- [x] 3.1 RED/GREEN: add `src/motion/*` scoped GSAP/View Transition fallbacks; 7 motion tests passed.
- [x] 3.2 RED/GREEN: add public-import consumer harness; shell/dashboard/theme/asset/accessibility/motion tests passed.
- [x] 3.3 RED/GREEN: wire root scripts, TSX lint, and `.github/workflows/quality.yml`; frozen install, format, lint, typecheck, test, check, and CI quality passed.

## Phase 4: Browser Verification (PR #4, based on PR #3)
- [x] 4.1 RED: add `@vitest/browser`, `@vitest/browser-playwright`, Playwright Chromium devDependencies, package-local aliases, `packages/ui/vitest.browser.config.ts`, and deterministic `test:browser`; GREEN after explicit pnpm Chromium installation prerequisite.
- [x] 4.2 RED/GREEN: add `packages/ui/test/*.browser.test.tsx` for native keyboard activation, computed wide/narrow shell/dashboard layouts, and motion-component client hydration; retain jsdom `pnpm test`.
- [x] 4.3 RED/GREEN: add pnpm-only browser install/CI commands in `package.json` and `.github/workflows/quality.yml`; rerun `pnpm install --frozen-lockfile`, `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:browser`, `pnpm check`, update `apply-progress.md` evidence.

## Scope Guard
No application/runtime product scope. Threat matrix is N/A. Rollback Phase 4 only by removing browser tests/config, dev dependencies/lock entries, scripts, and CI steps; retain all Phase 1–3 implementation and evidence.
