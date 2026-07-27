# Tasks: Reference-Aligned Spanish Finance UI

## Review Workload Forecast

| Slice | Lines | Focused test | Runtime harness | Rollback |
|---|---:|---|---|---|
| 1 Foundation | 170 | `pnpm --filter @2free/ui test -- foundation` | Token fixture; N/A backend | Foundation CSS/status/assets/docs |
| 2 Shell | 170 | `pnpm --filter @2free/ui test -- app-shell` | Chromium keyboard/mobile/desktop smoke | Shell component/CSS/tests |
| 3 Dashboard | 250 | `pnpm --filter @2free/ui test -- dashboard` | Chromium four-state fixture | Dashboard/model/fixture/tests |
| 4 Evidence | 190 | `pnpm --filter @2free/ui test:browser -- visual-harness` | Eight screenshots + optional 1440px proof | Harness/motion/evidence tests |

Estimated changed lines: 780 total; each slice below 800.
400-line budget risk: High
Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
800-line budget risk: Medium
Delivery strategy: force-chained

PR #1 base=`feature/reference-aligned-spanish-ui`; PR #2 base=PR #1 branch; PR #3 base=PR #2 branch; PR #4 base=PR #3 branch. Keep tests/docs with each implementation.

## Phase 1: Foundation (PR #1)

- [x] 1.1 Add RED tests for light/dark tokens, supplied SVG branding, non-color states, and offline/no-CDN typography; test missing binaries without downloads.
- [x] 1.2 Modify `packages/ui/src/styles/{tokens,themes,typography,foundation,status,reduced-motion,index}.css`, `status.ts`, and `2free-con-fondi.svg` usage for warm rounded semantic tokens.
- [x] 1.3 Add `packages/ui/src/styles/README.md` documenting explicit readable fallback stacks; add licensed `src/assets/fonts/` files only when supplied, never invent/download fonts.
- [x] 1.4 Make RED tests pass; run package format/type-check.

## Phase 2: Shell (PR #2)

- [x] 2.1 Add RED tests for Spanish navigation callbacks, active/focus/keyboard semantics, mobile bottom navigation, desktop no-overflow, and SSR without browser globals.
- [x] 2.2 Modify `packages/ui/src/components/app-shell.tsx` and `src/styles/app-shell.css` for consumer-owned Spanish navigation, landmarks, mobile bottom bar, deliberate desktop layout, and stable SSR markup.
- [x] 2.3 Make tests pass; verify light/dark rendering and hydration with focused unit/browser commands.

## Phase 3: Dashboard (PR #3)

- [x] 3.1 Add RED tests and `packages/ui/test/fixtures/spanish-dashboard.ts` for populated/loading/empty/error states, long-label mobile no-overflow, accessible allocation/activity data, exact Money, and no card numbers.
- [x] 3.2 Extend `packages/ui/src/models/dashboard.ts` only with consumer-supplied `progress`; modify `finance-dashboard.tsx` and `dashboard.css` for Spanish cards, `<progress>` plus text, activity, and responsive themes without arithmetic/fetch/provider changes.
- [x] 3.3 Make tests pass; verify `MoneyDisplay` inputs and formatting remain exact.

## Phase 4: Evidence / Hardening (PR #4)

- [x] 4.1 Add RED tests for scoped GSAP cleanup, feature-detected View Transitions, unsupported/reduced-motion/failure synchronous fallbacks, SSR safety, and no leakage; harden `use-scoped-motion.ts`, `view-transition.ts`, and motion CSS.
- [x] 4.2 Create `packages/ui/test/visual-harness.browser.test.tsx` with settled fixtures and exactly eight variants: `390x844`/`1280x900` × light/dark × motion/reduced-motion; keep `1440x900` separate and non-counted.
- [x] 4.3 Update branding, status, consumer-boundary, SSR/accessibility, and quality-command tests; record the deterministic visual matrix and verify no Prisma/backend/persistence changes.
