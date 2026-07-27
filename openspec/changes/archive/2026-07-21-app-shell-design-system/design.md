# Design: Shared App Shell and Design System

## Technical Approach

Create a package-first React slice in `packages/ui`: it owns presentation, semantic CSS, branding, typed fixtures, and progressive motion; consumers own navigation, data, and composition. Add bounded real-browser verification for the five remaining evidence gaps without changing production behavior. No app, backend, storage, fetching, sync, notification, integration, or full finance screen is added.

## Architecture Decisions

| Decision | Choice | Alternatives considered | Rationale |
|---|---|---|---|
| Boundary | Private `@2free/ui` from `src/index.ts`; package tsconfig and Vite/Vitest map `@/*` only to local `src/*`; cross-package imports stay explicit. | Next.js-first app; token-only package | Preserves reuse and prevents alias/routing leakage. |
| Money contract | `DashboardModel` carries core `MoneyDto` plus consumer-supplied `FormattedMoney { currency, text }`; UI renders them and never parses, rounds, sums, calculates, or formats. | Numbers or UI arithmetic | Preserves exact-money meaning. |
| Responsive data | Wide layout shows supplied trend/allocation data; narrow layout shows equivalent stacked rows and summaries; activity remains a labeled list. | Hide data; color-only chart | Essential values remain available. |
| Semantics | `success`, `warning`, `danger`, and `neutral` each expose visible text, semantic marker, role/name, and theme-safe meaning. | Color-only status | Supports contrast and non-visual users. |
| Motion | Preserve scoped `@gsap/react` `useGSAP`, root/dependencies/`revertOnUpdate`, feature-detected View Transitions, exactly-once synchronous commit, rejection recovery, and reduced-motion/SSR fallback. | Global selectors; required animation | Preserves cleanup, hydration safety, and correctness without motion. |
| Browser verification | Add Vitest Browser Mode with `@vitest/browser-playwright`, Playwright-managed Chromium, and explicit `test:browser`; leave default jsdom separate. | jsdom-only; standalone e2e; framework app | Real Chromium proves native keyboard activation, computed narrow/wide CSS, and motion hydration without an app. |
| Ownership | React remains peer/test-dev; GSAP remains runtime. Vitest, jsdom, Testing Library, React types, browser provider, and Playwright are dev-only, lockfile-pinned tooling; fonts remain local. | Framework app; unowned transitive deps | Nothing browser-specific ships in the UI. |

## Data Flow

```text
consumer fixtures ──→ AppShell/FinanceDashboard ──→ semantic DOM + summaries
                                      └──→ optional scoped motion enhancement
jsdom ──→ fast contracts     Chromium ──→ native events, CSS, hydration evidence
```

## File Changes

| File | Action | Description |
|---|---|---|
| `packages/ui/package.json`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts` | Modify | Preserve aliases/jsdom default; own browser tooling and command. |
| `packages/ui/vitest.browser.config.ts` | Create | Browser Mode, `@vitest/browser-playwright`, Chromium, and the package-local `@` alias. |
| `packages/ui/src/index.ts`, `src/components/*`, `src/models/dashboard.ts`, `src/styles/*`, `src/assets/*`, `src/motion/*` | Create | UI components, styles, assets, and motion contracts. |
| `packages/ui/test/*`, `packages/ui/test/*.browser.test.tsx` | Create | Harness and RED browser tests; semantic selectors, hooks only if needed. |
| Root `package.json`, `tsconfig.base.json`, lint/lockfile config, `pnpm-lock.yaml` | Modify | Add `test:browser` and dev-tool pins; preserve aliases/typecheck. |
| `.github/workflows/quality.yml` | Create/modify | pnpm install, browser install, browser test; no npm/npx. |

## Interfaces / Contracts

`NavigationItem`/`AppShellProps` carry consumer navigation and callbacks. `DashboardState` is `loading | empty | error | ready`; ready data uses `MoneyDto` plus `FormattedMoney`. Each visual region receives an accessible summary. Browser tests are internal contracts, not public UI API.

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Contract/component | Exact display, no UI arithmetic, compact rows, statuses, roles, themes, focus, SSR | Vitest + jsdom/Testing Library; `pnpm test` remains fast jsdom. |
| Motion | Scoped cleanup, reduced/unsupported paths, thrown GSAP and rejected View Transition recovery | `motion-enhancement-failure-falls-back-to-synchronous-transition.test.ts` asserts state commits exactly once. |
| Browser final verification | Native keyboard activation; computed narrow shell and narrow/wide dashboard CSS; motion SSR-to-client hydration | Browser Mode + Playwright Chromium: real keyboard input, narrow/wide viewports, computed styles/visibility, hydration errors. Required for final verification. |
| Workspace | Frozen install, format, lint, typecheck, fast tests, browser tests | pnpm only: frozen install, `pnpm exec playwright install --with-deps chromium`, `pnpm test`, `pnpm test:browser`; no services. |

## Threat Matrix

No routing, repository, commit, push, PR, or executable-file authority boundary is added.

| Boundary | Applicability | Reason | Planned RED tests |
|---|---|---|---|
| Documentation-like paths | N/A | No executable docs. | None |
| Git repository selection | N/A | Configured workspace only. | None |
| Commit state | N/A | No index mutation. | None |
| Push state | N/A | No push. | None |
| PR commands | N/A | No PR automation. | None |

## Migration / Rollout

No data migration. Roll out dev-only browser tooling/config, `test:browser`, and CI Chromium beside jsdom; final verification requires both suites. Rollback removes browser tests/config, dev deps/lock entries, scripts, CI steps, and hooks; retain UI, aliases, GSAP, and View Transitions.

## Open Questions

- [ ] Confirm licensed Urbanist/Open Sans files and weights before adding font binaries.
- [ ] Confirm exact `@vitest/browser-playwright`/Playwright pins for Vitest 4.1.0, Node 24, and CI Chromium caching/system dependencies.
