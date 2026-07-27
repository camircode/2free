# Apply Progress: Reference-Aligned Spanish Finance UI

## Status

- Change: `reference-aligned-spanish-ui`
- Delivery: force-chained feature-branch-chain
- Slice: 4 of 4, Evidence / Hardening / PR #4
- Base boundary: PR #4 targets the immediately preceding PR #3 branch in the `feature/reference-aligned-spanish-ui` chain (no branch created in this session)
- Review budget: 800 lines configured; Evidence forecast 190 lines
- Changed-line forecast/actual: Phase 4 remains within the configured final-slice budget; prior Foundation/Shell/Dashboard evidence remains cumulative and retained
- Mode: Standard package tooling with explicit RED/GREEN/REFACTOR evidence
- Scope guard: only Phase 4 tasks 4.1–4.3 were applied in this slice; Foundation, Shell, and Dashboard evidence below is cumulative and retained

## Completed Tasks

- [x] 1.1 Added RED coverage for warm light/dark tokens, supplied SVG byte identity and package export, non-color status semantics, local-only typography, missing font binaries, and reduced motion.
- [x] 1.2 Added the warm off-white/peach/olive/mint/terracotta token layer, explicit light/dark semantic values, rounded radii, shadows, focus treatment, Spanish status labels, and media/attribute reduced-motion boundaries.
- [x] 1.3 Documented local-only Urbanist/Open Sans declarations, readable system fallbacks, licensed-binary restrictions, and exact supplied SVG usage. No font binaries were added because none were supplied.
- [x] 1.4 Passed focused UI tests, package type-check, ESLint for changed TypeScript, and check-only Prettier verification after formatting.
- [x] 2.1 Added RED coverage for neutral Spanish navigation labels and callbacks, active semantics in both desktop/mobile render paths, native focus/keyboard operation, disabled items, mobile bottom navigation, desktop bounds/no-overflow, theme surfaces, hydration, and SSR without browser globals.
- [x] 2.2 Added consumer-owned desktop and mobile navigation renderings with Spanish landmarks, stable CSS-controlled responsive markup, fixed safe-area-aware mobile navigation, touch-sized controls, logo sizing, bounded desktop layout, and no horizontal canvas stretch.
- [x] 2.3 Passed focused unit/browser tests, light/dark browser rendering, hydration/SSR checks, package type-check, and ESLint after formatting.
- [x] 3.1 Added RED coverage and `packages/ui/test/fixtures/spanish-dashboard.ts` for populated/loading/empty/error states, long Spanish labels, mobile no-overflow, semantic allocation/activity data, exact Money, and explicit no-card-number regression.
- [x] 3.2 Extended `DashboardDataPoint` only with optional consumer-supplied `{ percent, text }` progress; replaced the generic English dashboard with Spanish summary/allocation/activity cards, native progress plus visible text, structured table/list fallback, and mobile-first/dark-aware responsive styles.
- [x] 3.3 Passed focused unit/browser checks and type/lint/format checks while preserving the `MoneyDisplay` currency/text output and exact DTO inputs; no arithmetic, fetching, provider, ORM, card-number, shell, foundation, motion, or backend behavior was introduced.
- [x] 4.1 Added RED coverage for isolated `@gsap/react` cleanup, feature-detected View Transitions, synchronous unsupported/reduced-motion/failure fallbacks, SSR capability safety, and callback/resource leakage; hardened scoped motion context cleanup, fail-closed capability use, View Transition recovery, and reduced-motion settling CSS.
- [x] 4.2 Added a deterministic Chromium visual harness for the actual Spanish `AppShell` + `FinanceDashboard` composition with the supplied logo, warm rounded cards, responsive navigation, desktop multi-column data, progress, and activity states across exactly eight required variants; kept the 1440px proof separate and non-counted.
- [x] 4.3 Updated branding, status, consumer-boundary, SSR/accessibility, and quality-command contracts; verified the harness is public-package-only and contains no Prisma/backend/persistence/card-number behavior.

## TDD Cycle Evidence

| Task | RED | GREEN | REFACTOR |
|---|---|---|---|
| 1.1 | `pnpm --filter @2free/ui test -- foundation` — failed as intended: 1 failed file, 8 passed files; 5 failed and 31 passed tests; missing new palette/theme/font/status/reduced-motion contracts. | Same command after implementation — 9 files, 36 passed tests. | New foundation test formatted with Prettier; post-format focused run remained 9 files, 36 passed. |
| 1.2 | Covered by the 1.1 RED assertions for tokens, themes, status, and reduced motion. | Same command — 9 files, 36 passed tests. | Consolidated semantic variables, preserved compatibility aliases, and kept dark values explicit. |
| 1.3 | Covered by the 1.1 RED assertions for local-only typography and README constraints. | Same command — 9 files, 36 passed tests. | Ran source-mutating Prettier on changed CSS, TypeScript, and Markdown, then check-only verification. |
| 1.4 | Existing package checks were included in the RED baseline. | `pnpm --filter @2free/ui typecheck` — passed; `pnpm exec eslint ...` — passed; focused tests — 9 files, 36 passed. | `pnpm exec prettier --write ...` followed by `pnpm exec prettier --check ...` — all matched. |

### Phase 2 TDD Cycle Evidence

| Task | RED | GREEN | REFACTOR |
|---|---|---|---|
| 2.1 | Unit `pnpm --filter @2free/ui test -- app-shell` — exit 1 as intended: 2 files failed, 7 passed; 5 tests failed, 31 passed. Browser `pnpm --filter @2free/ui test:browser -- app-shell` — exit 1 as intended: 4 of 5 Chromium tests failed. | After the shell implementation, unit — exit 0: 9 files and 36 tests passed; browser — exit 0: 1 file and 5 tests passed. | Ran source-mutating Prettier on all changed shell files; reran both focused commands with the same passing counts. |
| 2.2 | Covered by the 2.1 RED assertions for Spanish landmarks, duplicated CSS-controlled variants, mobile fixed positioning, safe-area padding, desktop max width, and overflow. | `app-shell.tsx` and `app-shell.css` implemented the minimum consumer-owned responsive shell; Chromium verified 1280×800 desktop and 480×800/390×844 mobile behavior. | Kept public props and item/callback ownership unchanged; consolidated responsive behavior in CSS so SSR markup remains deterministic. |
| 2.3 | Covered by the 2.1 RED assertions for theme, hydration, and browser-global absence. | Chromium light/dark surface assertions and unit SSR/hydration assertions passed; package type-check and changed-file ESLint passed. | Final formatter mutation completed before check-only validation; no motion, dashboard, provider, backend, or logo-byte changes introduced. |

### Phase 1 Work Unit Evidence

| Evidence | Result |
|---|---|
| Focused test command and exact result | `pnpm --filter @2free/ui test -- foundation` — exit 0; 9 test files and 36 tests passed. Vitest's `foundation` argument currently exercises the complete UI unit set. |
| Runtime harness command/scenario and exact result | N/A — this foundation slice changes package CSS, status metadata, and static asset/font contracts only; no browser/runtime boundary is introduced before the shell and evidence slices. |
| Rollback boundary | Revert only the Phase 1 files listed below plus the four `[x]` task marks and this progress artifact; the package remains on the prior generic tokens/status language and no shell, dashboard, motion implementation, backend, Prisma, persistence, or active `runnable-product-foundation` artifact is touched. |

## Work Unit Evidence

| Evidence | Result |
|---|---|
| Focused test command and exact result | `pnpm --filter @2free/ui test -- app-shell` — exit 0; 9 unit test files and 36 tests passed. `pnpm --filter @2free/ui typecheck` — exit 0. Changed-file ESLint — exit 0. |
| Runtime harness command/scenario and exact result | `pnpm --filter @2free/ui test:browser -- app-shell` — exit 0; Chromium 1 file and 5 tests passed. Scenarios covered 1280×800 desktop grid/max-width/no-overflow, 480×800 responsive switch, 390×844 fixed mobile bar with 48px targets and content bottom padding, native Enter/Space callbacks, and light/dark surface changes. |
| Rollback boundary | Revert only `packages/ui/src/components/app-shell.tsx`, `packages/ui/src/styles/app-shell.css`, the shell portions of `packages/ui/test/app-shell.test.tsx`, `packages/ui/test/app-shell.browser.test.tsx`, and `packages/ui/test/consumer-harness.test.tsx`, plus Phase 2 task/progress evidence. This removes the responsive shell behavior without touching Foundation, Dashboard, Motion, backend, Prisma, persistence, security, or supplied logo bytes. |

## Files Changed

| File | Action | Description |
|---|---|---|
| `packages/ui/src/styles/tokens.css` | Modified | Added warm semantic palette, large radii, shadows, and transition tokens while retaining existing aliases. |
| `packages/ui/src/styles/themes.css` | Modified | Added complete explicit light/dark surfaces, text, accents, focus, status, and shadow contracts. |
| `packages/ui/src/styles/typography.css` | Modified | Added local-only self-host-ready font declarations and readable system fallbacks. |
| `packages/ui/src/styles/foundation.css` | Modified | Added high-visibility focus treatment, rounded controls, selection, SVG display, and forced-colors fallback. |
| `packages/ui/src/styles/status.css` | Modified | Added rounded status cards, semantic leading border, and polished shadow treatment. |
| `packages/ui/src/styles/reduced-motion.css` | Modified | Added explicit `data-motion="reduced"` and transition-token fallbacks alongside media-query behavior. |
| `packages/ui/src/styles/index.css` | Modified | Documented public import ordering for foundation before components. |
| `packages/ui/src/styles/status.ts` | Modified | Localized status labels to neutral Spanish while preserving tone keys and symbols. |
| `packages/ui/src/styles/README.md` | Modified | Documented semantic tokens, themes, offline typography policy, and exact logo usage. |
| `packages/ui/test/foundation.test.ts` | Created | Added foundation RED/GREEN contract tests. |
| `packages/ui/test/status-semantics-remain-accessible-without-color.test.tsx` | Modified | Updated expected status labels to Spanish. |
| `packages/ui/test/consumer-harness.test.tsx` | Modified | Updated the public status-label contract expectation. |
| `packages/ui/test/dashboard.test.tsx` | Modified | Updated existing status role names for the localized foundation labels only. |
| `openspec/changes/reference-aligned-spanish-ui/tasks.md` | Modified | Checked only tasks 1.1–1.4. |
| `openspec/changes/reference-aligned-spanish-ui/apply-progress.md` | Created | Recorded cumulative Phase 1 implementation and evidence. |

### Phase 2 Files Changed

| File | Action | Description |
|---|---|---|
| `packages/ui/src/components/app-shell.tsx` | Modified | Preserved `AppShellProps` and consumer callbacks while rendering stable desktop/mobile navigation variants with Spanish landmark names, active state, disabled state, and supplied icon/label content. |
| `packages/ui/src/styles/app-shell.css` | Modified | Added bounded desktop grid, logo treatment, focus-compatible active/hover states, no-overflow constraints, fixed mobile bottom navigation, safe-area padding, and 48px mobile targets. |
| `packages/ui/test/app-shell.test.tsx` | Modified | Added Spanish callback/active/focus/disabled assertions, deterministic SSR without `window`/`document`, and hydration coverage. |
| `packages/ui/test/app-shell.browser.test.tsx` | Modified | Added Chromium Enter/Space, 1280×800 desktop no-overflow, 480×800 and 390×844 mobile bottom-bar, and light/dark surface evidence. |
| `packages/ui/test/consumer-harness.test.tsx` | Modified | Updated consumer navigation fixtures and expectations to neutral Spanish while preserving the public package-boundary checks. |
| `openspec/changes/reference-aligned-spanish-ui/tasks.md` | Modified | Checked Phase 2 tasks 2.1–2.3 at that boundary; later slices are recorded below. |
| `openspec/changes/reference-aligned-spanish-ui/apply-progress.md` | Modified | Merged Phase 2 evidence into the cumulative Foundation progress artifact. |

### Phase 3 Files Changed

| File | Action | Description |
|---|---|---|
| `packages/ui/src/models/dashboard.ts` | Modified | Added only optional consumer-supplied progress text/percent to `DashboardDataPoint`; exact Money fields remain unchanged. |
| `packages/ui/src/components/finance-dashboard.tsx` | Modified | Replaced generic English dashboard hierarchy with neutral Spanish balance/allocation/activity cards, native progress with visible text, semantic table/list fallback, and explicit Spanish states. |
| `packages/ui/src/styles/dashboard.css` | Modified | Added warm rounded card surfaces, pills, progress styling, friendly activity rows, mobile compact fallback, desktop multi-column layout, light/dark semantic tokens, and no-overflow constraints. |
| `packages/ui/test/fixtures/spanish-dashboard.ts` | Created | Added deterministic Spanish populated/loading/empty/error models with long labels, exact DTOs, allocation progress, and activity values. |
| `packages/ui/test/dashboard.test.tsx` | Modified | Added RED/GREEN contracts for states, semantic allocation/activity data, exact MoneyDisplay formatting, no card numbers, provider boundary, and compact fallback. |
| `packages/ui/test/dashboard.browser.test.tsx` | Created | Added Chromium 390×844 no-overflow and 1280×900 multi-column/light-dark dashboard evidence. |
| `packages/ui/test/app-shell.browser.test.tsx` | Modified | Kept the existing shell browser harness on Spanish dashboard data while preserving shell-only coverage. |
| `packages/ui/test/consumer-harness.test.tsx` | Modified | Updated public consumer expectations to the Spanish dashboard hierarchy. |
| `openspec/changes/reference-aligned-spanish-ui/tasks.md` | Modified | Checked Phase 3 tasks 3.1–3.3 at that boundary; Phase 4 completion is recorded below. |
| `openspec/changes/reference-aligned-spanish-ui/apply-progress.md` | Modified | Merged Phase 3 implementation, TDD, work-unit, and rollback evidence with all prior progress. |

### Phase 4 Files Changed

| File | Action | Description |
|---|---|---|
| `packages/ui/src/motion/use-scoped-motion.ts` | Modified | Exposed the `@gsap/react` context-safe callback boundary, fail-closed capability handling, and scoped cleanup guard. |
| `packages/ui/src/motion/view-transition.ts` | Modified | Added exactly-once synchronous fallback for malformed/bare-promise enhancements while retaining finished-promise rejection recovery. |
| `packages/ui/src/styles/reduced-motion.css` | Modified | Added hard `animation/transition: none` rules for reduced and settled evidence states. |
| `packages/ui/test/motion-enhancement.test.tsx` | Modified | Added scope cleanup, callback isolation, feature detection, SSR, unsupported/reduced-motion, thrown/rejected, malformed-result, and exactly-once fallback coverage. |
| `packages/ui/test/visual-harness.browser.test.tsx` | Created | Added the actual public Spanish shell/dashboard Chromium harness with eight required variants and separate 1440px proof. |
| `packages/ui/test/foundation.test.ts` | Modified | Asserted explicit settled/reduced-motion CSS contracts. |
| `packages/ui/test/branding-assets.test.ts` | Modified | Asserted the visual harness uses the supplied logo boundary and no remote URLs. |
| `packages/ui/test/status-semantics-remain-accessible-without-color.test.tsx` | Modified | Asserted settled motion CSS and live-region semantics alongside non-color markers. |
| `packages/ui/test/consumer-harness.test.tsx` | Modified | Asserted public composition remains presentation-only with no provider/backend/card-number leakage. |
| `packages/ui/test/workspace-quality-failure.test.ts` | Modified | Asserted discoverable deterministic package/root quality and browser commands. |
| `openspec/changes/reference-aligned-spanish-ui/tasks.md` | Modified | Marked Phase 4 tasks 4.1–4.3 complete. |
| `openspec/changes/reference-aligned-spanish-ui/apply-progress.md` | Modified | Merged all 13 task states, Phase 4 evidence, matrix, rollback, and next-phase handoff. |

## Deviations and Issues

- The supplied SVG was already byte-identical and correctly exported, so its bytes were intentionally not modified; the new foundation test verifies identity and package export usage.
- No `src/assets/fonts/` directory or binaries were added because licensed Urbanist/Open Sans files were not supplied.
- The configured `strict_tdd: false` and absent cached runner metadata were preserved; explicit RED/GREEN/REFACTOR evidence was still recorded because this slice required RED tests.
- During Foundation, no shell, dashboard, evidence/motion implementation, Prisma, backend, persistence, card-number handling, or `runnable-product-foundation` artifact was changed.
- The shell forecast was 170 lines; the actual authored Phase 2 implementation/test diff is 270 additions/deletions, still keeping cumulative authored scope at 671/800. The additional lines are the paired SSR-stable desktop/mobile markup and browser evidence required by the scenarios.
- The mobile and desktop navigation trees are both rendered and selected by CSS rather than by browser globals; this intentional duplication preserves hydration-stable markup and keeps both variants consumer-owned.
- The cached testing-capabilities observation still reports no runner, but the current package has Vitest/Chromium tooling; `openspec/config.yaml` remains `strict_tdd: false`, so this was Standard mode with explicit RED/GREEN/REFACTOR evidence.
- The progress contract is intentionally optional and presentation-only; the component forwards `percent` to native `<progress>` and displays consumer-provided text without clamping, summing, formatting, fetching, or importing a provider.
- The desktop semantic table and mobile compact list intentionally coexist in stable SSR markup; CSS selects the responsive representation, while the mobile list retains labels, supplied amounts, and visible progress text as the structured fallback.
- `MoneyDisplay` was not exported, refactored, or recalculated; its public rendered currency/text shape and exact DTO inputs remain unchanged. No card-number fields or strings were added.
- The configured `strict_tdd: false` was preserved. The user-required RED/GREEN/REFACTOR evidence was recorded in Standard mode; Phase 3 itself did not introduce motion or screenshot harness work.

### Phase 3 TDD Cycle Evidence (Standard Mode)

| Task | RED | GREEN | REFACTOR |
|---|---|---|---|
| 3.1 | `pnpm --filter @2free/ui test -- dashboard` — exit 1 as intended after adding the fixture/tests: 1 failed file, 8 passed; 6 failed and 32 passed tests. `pnpm --filter @2free/ui test:browser -- dashboard` — exit 1 as intended because the new desktop composition was not implemented; 1 failed test and 6 passed. | After the model/component/style implementation and fixture wiring, focused unit and Chromium dashboard checks passed; final results are recorded below. | Replaced duplicated English browser fixture values with Spanish dashboard inputs, retained a separate long-label Chromium no-overflow test, and formatted all changed files before the final check-only run. |
| 3.2 | The same 3.1 RED assertions covered absent optional `progress`, Spanish semantic hierarchy, native progress/text, allocation columns, activity landmarks, and responsive layout. | `pnpm --filter @2free/ui test -- dashboard` — final exit 0 after implementation; 9 files and 38 tests passed. `pnpm --filter @2free/ui typecheck` — exit 0. | Kept progress values consumer-supplied and rendered them directly; retained the existing `MoneyDisplay` markup contract and separated desktop table/mobile list without adding calculations or provider dependencies. |
| 3.3 | RED included exact currency/text assertions, DTO precision non-rendering, rerender/provider-spy coverage, and explicit `card-number` source/DOM assertions. | `pnpm --filter @2free/ui test -- dashboard` — exit 0; exact formatted values and no-card-number checks passed. Changed-file ESLint and Prettier check also exited 0. | Ran source-mutating Prettier before all final check-only tests, type, lint, and browser evidence; no production arithmetic or formatting helper was introduced. |

### Phase 3 Work Unit Evidence

| Evidence | Result |
|---|---|
| Focused test command and exact result | `pnpm --filter @2free/ui test -- dashboard` — exit 0; 9 test files and 38 tests passed. `pnpm --filter @2free/ui typecheck` — exit 0. Changed-file `pnpm exec eslint ...` — exit 0. `pnpm exec prettier --check ...` — exit 0. |
| Runtime harness command/scenario and exact result | `pnpm --filter @2free/ui test:browser` — exit 0; Chromium 2 test files and 7 tests passed. Covered 390×844 long Spanish labels/no horizontal overflow and compact fallback, 1280×900 intentional multi-column layout, light/dark balance surfaces, semantic progress, plus existing shell keyboard/mobile/desktop checks. |
| Rollback boundary | Revert only `packages/ui/src/models/dashboard.ts`, `packages/ui/src/components/finance-dashboard.tsx`, `packages/ui/src/styles/dashboard.css`, `packages/ui/test/fixtures/spanish-dashboard.ts`, `packages/ui/test/dashboard.test.tsx`, `packages/ui/test/dashboard.browser.test.tsx`, the Spanish dashboard fixture portion of `packages/ui/test/app-shell.browser.test.tsx`, the Spanish dashboard expectations in `packages/ui/test/consumer-harness.test.tsx`, and Phase 3 task/progress evidence. Foundation, Shell production code, Motion, backend, Prisma, persistence, security, and logo bytes remain untouched. |

### Phase 4 TDD Cycle Evidence (Standard Mode)

| Task | RED | GREEN | REFACTOR |
|---|---|---|---|
| 4.1 | Focused package run before hardening exited 1 as intended: 3 failing files, 4 failing assertions, and 42 passing tests. Failures were the new synchronous rejected-promise/empty-result fallback assertions and the new settled-motion CSS contracts. | `pnpm --filter @2free/ui test -- motion-enhancement foundation status-semantics-remain-accessible-without-color consumer-harness branding-assets workspace-quality-failure` — exit 0; 9 files and 47 tests passed. `pnpm --filter @2free/ui typecheck` — exit 0. | Added the `@gsap/react` `contextSafe` boundary, fail-closed capability check, exactly-once recovery for malformed/bare promise enhancements, and explicit `animation/transition: none` settling rules; formatter mutation was run before final checks. |
| 4.2 | The browser assertions were introduced as RED contracts for settled styles, exact variant identity, supplied-logo composition, responsive navigation, card/progress/activity evidence, and no overflow; browser GREEN was required before completion. | `pnpm --filter @2free/ui test:browser -- visual-harness` — exit 0; 3 browser files and 17 Chromium tests passed, including the 8 required variant cases and separate 1440px proof. | Kept the harness assertion-only because no repository screenshot/golden convention exists; fixed two animation frames and `data-motion-settled` before every assertion, with no binary baselines invented. |
| 4.3 | New branding/status/consumer-boundary/SSR/accessibility/quality assertions failed where the hardened motion CSS/fallback contracts were absent, while existing boundary tests remained the acceptance baseline. | The focused package run above passed all updated contracts; the browser harness passed the public composition and accessibility/no-overflow checks. | Kept all checks package-local and public-import based; no route, provider, persistence, Prisma, backend, remote-font, or card-number code was added. |

### Phase 4 Work Unit Evidence

| Evidence | Result |
|---|---|
| Focused test command and exact result | `pnpm --filter @2free/ui test -- motion-enhancement foundation status-semantics-remain-accessible-without-color consumer-harness branding-assets workspace-quality-failure` — exit 0; Vitest 9 files and 47 tests passed. `pnpm --filter @2free/ui typecheck` — exit 0. |
| Runtime harness command/scenario and exact result | `pnpm --filter @2free/ui test:browser -- visual-harness` — exit 0; Chromium 3 files and 17 tests passed. The harness rendered the actual Spanish `AppShell` + `FinanceDashboard` composition at each required size/theme/motion combination, checked logo URL, warm rounded cards, bottom mobile navigation, desktop multi-column layout, progress/activity text, exact Money text, accessibility landmarks, settled styles, and no horizontal overflow; the optional 1440px proof remained a separate test. |
| Rollback boundary | Revert only `packages/ui/src/motion/use-scoped-motion.ts`, `packages/ui/src/motion/view-transition.ts`, `packages/ui/src/styles/reduced-motion.css`, `packages/ui/test/motion-enhancement.test.tsx`, `packages/ui/test/visual-harness.browser.test.tsx`, the Phase 4 assertions in `foundation.test.ts`, `branding-assets.test.ts`, `status-semantics-remain-accessible-without-color.test.tsx`, `consumer-harness.test.tsx`, and `workspace-quality-failure.test.ts`, plus Phase 4 task/progress evidence. Foundation, Shell, Dashboard, provider, backend, Prisma, persistence, security, and supplied logo bytes remain intact. |

### Deterministic Visual Matrix and Evidence Paths

No project screenshot/golden convention exists: the repository has no screenshot snapshot directory or `toHaveScreenshot` baseline configuration. Therefore this slice records deterministic browser assertions rather than inventing binary baselines. The assertion source is `packages/ui/test/visual-harness.browser.test.tsx`; the exact runtime log is captured outside the repository at `/tmp/opencode/2free-reference-aligned-spanish-ui/visual-harness.log` by the final check command.

| Variant | Viewport | Theme | Motion | Evidence |
|---|---:|---|---|---|
| `mobile-light-motion` | 390x844 | light | enabled, settled before assertions | `visual-harness.browser.test.tsx` |
| `mobile-light-reduced` | 390x844 | light | reduced, settled before assertions | `visual-harness.browser.test.tsx` |
| `mobile-dark-motion` | 390x844 | dark | enabled, settled before assertions | `visual-harness.browser.test.tsx` |
| `mobile-dark-reduced` | 390x844 | dark | reduced, settled before assertions | `visual-harness.browser.test.tsx` |
| `desktop-light-motion` | 1280x900 | light | enabled, settled before assertions | `visual-harness.browser.test.tsx` |
| `desktop-light-reduced` | 1280x900 | light | reduced, settled before assertions | `visual-harness.browser.test.tsx` |
| `desktop-dark-motion` | 1280x900 | dark | enabled, settled before assertions | `visual-harness.browser.test.tsx` |
| `desktop-dark-reduced` | 1280x900 | dark | reduced, settled before assertions | `visual-harness.browser.test.tsx` |

Separate optional proof: `desktop-wide-1440-proof` at 1440x900, excluded from the required eight-variant count.

## Next Work

All 13 tasks are complete. Ready for `sdd-verify`. No review lifecycle was invoked.
