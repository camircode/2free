# Apply Progress: Mobile-First Finance Experience

## Status

- Change: `mobile-first-finance-experience`; artifact store: OpenSpec.
- Corrective rerun: Slice 3 / tasks 3.1–3.3; attempt 2, final automatic retry; mode: Standard. Slice 1 / tasks 1.1–1.3 and Slice 2 / tasks 2.1–2.3 remain complete; Slice 4 is still pending.
- Delivery: force-chained `feature-branch-chain`; no branch, commit, PR, lifecycle, Slice 4 route integration, auth, persistence, ingestion, or calculation work performed.
- Review budget: each child normally stops before 800 authored additions plus deletions. Slice 1 remains 761 additions + 1 deletion = 762. Slice 2 measured 234 additions + 82 deletions = 316. Corrected Slice 3 measures 724 additions + 76 deletions = 800, with binaries excluded only from the authored-line total.
- User decision: the maintainer explicitly approved corrected Slice 3 at exactly 800 as a one-time exception. It accepts this closed, evidenced correction only; it is not an inclusive 800 cap or a general budget relaxation, so Slice 4 and all other slices must still stop before 800.

## Completed Tasks

- [x] 1.1 Added RED contracts for locked/ready typing, package-only ready fixtures, named icons, chart text equivalents, and route finance-marker rejection.
- [x] 1.2 Added scoped `iconoir-react`, `d3-array`, `d3-scale`, and `d3-shape`; shared state/chart models, safe/Iconoir/text primitives, Spanish-safe styles, and deterministic capture helpers.
- [x] 1.3 Passed focused/full UI tests, UI browser evidence, route safety, route Chromium, typechecks, targeted lint, targeted format checks, and the workspace-inclusive workload gate.
- [x] 2.1 Added RED browser/unit contracts for safe-area thumb navigation, semantic landmarks/focus, `aria-current`, no rail, balanced desktop columns, long Spanish labels, and `scrollWidth === clientWidth`.
- [x] 2.2 Recomposed the shared shell and `WorkspaceShell` with Iconoir navigation/theme icons, mobile-first stacking, balanced desktop content columns, Spanish branding, and deterministic SSR-safe output.
- [x] 2.3 Passed package shell browser evidence at `390x844` and `1280x900`, route/browser safety, typechecks, root lint, and targeted format checks; the workspace-inclusive Slice 2 gate is green.
- [x] 3.1 Added RED contracts for reference-shaped context/period controls, insight/cards, safe states, chart summaries, overflow, reduced-motion parity, and non-color state meaning, including explicit stock/acciones copy.
- [x] 3.2 Added the shared presentation-only `FinanceExperience`, typed cards/activity model, scoped D3 geometry, declarative responsive SVG, scrollable exact-size harness frame, and Spanish text equivalents; no fetching or domain calculations.
- [x] 3.3 Corrected immutable predecessor identity, actual binary allowlist paths, exact 390x844/1280x900 capture writing, clipping assertions, and eight deterministic harness comparisons; final workload is exactly 800 and Slice 4 remains pending.
- [ ] 4.1–4.3 remain pending; no later task checkbox was changed.

## RED/GREEN/REFACTOR Evidence

| Task | RED | GREEN | REFACTOR |
|---|---|---|---|
| 1.1 | Missing-import RED: `pnpm --filter @2free/ui exec vitest run test/finance-experience-foundation.test.tsx test/visual-capture.test.ts` — exit 1 before the initial foundation implementation; 2 suites failed on missing `iconoir-react`/evidence imports. Route-marker RED is recorded separately below and is not claimed as a missing-import failure. | The same focused command — exit 0; 2 files and 9 tests passed. `pnpm --filter @2free/web exec vitest run test/finance-route-safety.test.ts` — exit 0; 1 file and 3 tests passed. | Locked/safe states retain `model?: never`; ready data remains under `packages/ui/test/fixtures/`; route marker assertions now cover all claimed production files. |
| 1.2 | RED imports covered absent primitives and dependencies. | `pnpm --filter @2free/ui test` — exit 0; 11 files and 57 tests passed. `pnpm --filter @2free/ui test:browser` — exit 0; 3 files and 17 Chromium tests passed. | `settleVisualCapture` now owns media emulation, animation/transition freeze, fonts/images, two-frame settling, and the explicit settled marker without implementing Slice 3 captures. |
| 1.3 | Controlled route-marker mutation proof below; no claim that the production route itself was broken before this corrective rerun. | UI/web typechecks, targeted ESLint, targeted Prettier checks, route safety, and route Chromium all exited 0. | Evidence statements were narrowed to the checks actually run; route and harness namespaces remain separate. |

### Truthful route-marker RED boundary

Before the route-safety correction, an isolated controlled mutation appended `fetch("/dashboard")` to the concatenated claimed production sources (`app/layout.tsx`, `app/page.tsx`, and `components/workspace-shell.tsx`) and ran a real `node:assert` negative assertion. It failed with `AssertionError [ERR_ASSERTION]: controlled predecessor route marker` (exit 1). This proves the safety contract rejects a marker mutation; it does not fabricate a failure in the unchanged predecessor production route and is distinct from the missing-import RED above. The final route test retains an equivalent passing regression test named `fails closed for a controlled marker mutation`.

Exact RED proof command:

```sh
node --input-type=module -e 'import { readFile } from "node:fs/promises"; import path from "node:path"; import assert from "node:assert/strict"; const root = process.cwd(); const files = ["apps/web/app/layout.tsx", "apps/web/app/page.tsx", "apps/web/components/workspace-shell.tsx"]; const source = (await Promise.all(files.map((file) => readFile(path.join(root, file), "utf8")))).join("\n"); const controlledMutation = `${source}\nfetch("/dashboard");\n`; const financeRequestMarker = /\bfetch\s*\(|\/dashboard|API_URL|127\.0\.0\.1:3001|api:3001/iu; assert.doesNotMatch(controlledMutation, financeRequestMarker, "controlled predecessor route marker");'
```

## Separate Evidence Manifests

| Surface | Manifest and boundary |
|---|---|
| Route | `apps/web/test/finance-route-safety.test.ts` reads exactly `app/layout.tsx`, `app/page.tsx`, and `components/workspace-shell.tsx`; the request/payload scan runs over their concatenated source and rejects request/API markers, fixture/model markers, ready states, literal PAN/card-number patterns, and common amount forms including `MXN 100`, `$100`, and `100 MXN`. It does not claim route production files changed. |
| Harness | `packages/ui/test/fixtures/finance-experience.ts`, `finance-experience-foundation.test.tsx`, `visual-capture.ts`, and `visual-capture.test.ts`; ready synthetic data is package/test-only and capture names use `route|harness` namespaces. `assertNonColorState` requires status semantics plus meaningful explanatory letters after removing SVG/aria-hidden glyphs; metadata and a glyph alone fail. |

## Workspace-Inclusive Workload Gate

- Immutable predecessor: `BASE_SHA=3decdd369618a015c1a73e9c0620ae149c83f10b`; `git cat-file -t` = `tree`; `BASE_TREE=3decdd369618a015c1a73e9c0620ae149c83f10b`.
- Snapshot archive command: `git archive 3decdd369618a015c1a73e9c0620ae149c83f10b | tar -x -C /tmp/opencode/mobile-first-finance-experience-slice-1-corrected/SNAP`.
- Snapshot: `/tmp/opencode/mobile-first-finance-experience-slice-1-corrected/SNAP`.
- Exact workload argv:

```sh
git diff --no-index --no-ext-diff --numstat \
  /tmp/opencode/mobile-first-finance-experience-slice-1-corrected/SNAP . -- \
  packages/ui/package.json \
  pnpm-lock.yaml \
  packages/ui/src/index.ts \
  packages/ui/src/models/finance-experience.ts \
  packages/ui/src/components/chart-text-equivalent.tsx \
  packages/ui/src/components/finance-safe-state.tsx \
  packages/ui/src/components/icon-control.tsx \
  packages/ui/src/styles/index.css \
  packages/ui/src/styles/presentation-primitives.css \
  packages/ui/test/fixtures/finance-experience.ts \
  packages/ui/test/finance-experience-foundation.test.tsx \
  packages/ui/test/visual-capture.ts \
  packages/ui/test/visual-capture.test.ts \
  apps/web/test/finance-route-safety.test.ts
```

- Exact summation argv: `awk -F '\t' '{print; a+=$1; d+=$2} END {printf "TOTAL\t%d additions\t%d deletions\t%d changed lines\n", a, d, a+d}' /tmp/opencode/mobile-first-finance-experience-slice-1-corrected/slice-1-corrected.numstat`.
- Diff command status: `1` (expected differences from the immutable snapshot).
- Raw allowlisted numstat:

```text
61	0	/dev/null => ./apps/web/test/finance-route-safety.test.ts
5	1	{/tmp/opencode/mobile-first-finance-experience-slice-1-corrected/SNAP => .}/packages/ui/package.json
61	0	/dev/null => ./packages/ui/src/components/chart-text-equivalent.tsx
42	0	/dev/null => ./packages/ui/src/components/finance-safe-state.tsx
63	0	/dev/null => ./packages/ui/src/components/icon-control.tsx
22	0	{/tmp/opencode/mobile-first-finance-experience-slice-1-corrected/SNAP => .}/packages/ui/src/index.ts
40	0	/dev/null => ./packages/ui/src/models/finance-experience.ts
1	0	{/tmp/opencode/mobile-first-finance-experience-slice-1-corrected/SNAP => .}/packages/ui/src/styles/index.css
68	0	/dev/null => ./packages/ui/src/styles/presentation-primitives.css
136	0	/dev/null => ./packages/ui/test/finance-experience-foundation.test.tsx
28	0	/dev/null => ./packages/ui/test/fixtures/finance-experience.ts
90	0	/dev/null => ./packages/ui/test/visual-capture.test.ts
123	0	/dev/null => ./packages/ui/test/visual-capture.ts
21	0	{/tmp/opencode/mobile-first-finance-experience-slice-1-corrected/SNAP => .}/pnpm-lock.yaml
TOTAL	761 additions	1 deletions	762 changed lines
```

- The allowlist excludes unrelated workspace overlays, OpenSpec artifacts, `node_modules`, and generated/binary PNGs from authored totals. `ui-reference.png` remains separately identified: 366218 bytes, SHA-256 `0ad7d9b653f5db2f4bc5f4c6716d73091d4fe366703c9598be789e904432f6a4`.

## Work Unit Evidence

| Evidence | Result |
|---|---|
| Focused tests | `pnpm --filter @2free/ui exec vitest run test/finance-experience-foundation.test.tsx test/visual-capture.test.ts` — exit 0; 2 files/9 tests. `pnpm --filter @2free/ui typecheck` — exit 0. `pnpm --filter @2free/web exec vitest run test/finance-route-safety.test.ts` — exit 0; 1 file/3 tests. |
| Full UI/browser runtime | `pnpm --filter @2free/ui test` — exit 0; 11 files/57 tests. `pnpm --filter @2free/ui test:browser` — exit 0; 3 files/17 Chromium tests. |
| Route browser runtime | `pnpm --filter @2free/web exec vitest run --config vitest.browser.config.ts test/routes.browser.test.ts` — exit 0; 1 file/3 Chromium tests. |
| Typecheck | `pnpm --filter @2free/web typecheck` — exit 0; `next typegen` and `tsc --noEmit` completed successfully. |
| Lint | `pnpm exec eslint packages/ui/test/visual-capture.ts packages/ui/test/visual-capture.test.ts apps/web/test/finance-route-safety.test.ts` — exit 0. Targeted to the corrected Slice 1 files; no unrelated workspace lint was broadened. |
| Format | `pnpm exec prettier --check packages/ui/test/visual-capture.ts packages/ui/test/visual-capture.test.ts apps/web/test/finance-route-safety.test.ts` — exit 0; all matched files use Prettier style. |
| Rollback boundary | Revert only the corrected Slice 1 foundation/evidence files in the exact workload allowlist, especially `packages/ui/test/visual-capture.ts`, `packages/ui/test/visual-capture.test.ts`, and `apps/web/test/finance-route-safety.test.ts`, plus Slice 1 task/progress evidence. Do not revert unrelated workspace overlays or any production route/shell files. |

## Risks / Deviations

- No deviation from the corrected design; no Slice 3 capture generation or production route integration was added.
- `settleVisualCapture` now requires a Playwright-compatible `emulateMedia` method from callers and maps `motion` to `no-preference` and `reduced` to `reduce` before injecting the deterministic freeze.
- No PNG was generated or changed; the supplied reference asset identity remains unchanged.

## Slice 2 RED/GREEN/REFACTOR Evidence

Slice 2 ran in Standard mode (`strict_tdd: false` in `openspec/config.yaml`), but the owned shell contracts were written and executed RED before the production shell changes.

| Task | RED | GREEN | REFACTOR |
|---|---|---|---|
| 2.1 | `pnpm --filter @2free/ui exec vitest run test/app-shell.test.tsx` — exit 1 before implementation; 1 file, 6 tests, 3 failed. `pnpm --filter @2free/ui test:browser -- app-shell visual-harness` — exit 1 before implementation; 3 files, 19 tests, 12 failed and 7 passed. Failures covered the predecessor sidebar, missing header navigation, missing named theme Iconoir control, safe-area/column CSS, long-label overflow, and legacy harness selectors. | `pnpm --filter @2free/ui exec vitest run test/app-shell.test.tsx` — exit 0; 1 file and 6 tests passed. `pnpm --filter @2free/ui exec vitest run --config vitest.browser.config.ts test/app-shell.browser.test.tsx` — exit 0; 1 file and 7 Chromium tests passed, including exact `390x844` and `1280x900` assertions. | Navigation is emitted in the header and fixed mobile footer rather than an `aside`; active buttons retain `aria-current="page"`, labels remain visible, focus remains native/visible, and Iconoir controls carry `aria-label` plus an assistive `aria-describedby` label. |
| 2.2 | The same RED unit/browser contracts above were the failing predecessor boundary; no production shell code was changed before those failures were captured. | `pnpm --filter @2free/ui test:browser` — exit 0; 3 files and 19 Chromium tests passed. `pnpm --filter @2free/ui typecheck` — exit 0. `pnpm --filter @2free/web typecheck` — exit 0. | `AppShell` now owns the scoped `IconoirProvider`, default product navigation icons, and named theme action; `WorkspaceShell` continues to own route/theme state and view transitions. The Next/Turbopack-compatible local import intentionally omits `.js` for `icon-control`. |
| 2.3 | RED was established by the owned shell contract suite before implementation; quality commands were not used as a substitute for the RED boundary. | `pnpm --filter @2free/web exec vitest run test/routes.test.ts test/finance-route-safety.test.ts` — exit 0; 2 files and 8 tests. `pnpm --filter @2free/web test:browser -- routes` — exit 0; 3 files and 6 Chromium tests. `pnpm lint` — exit 0. `pnpm exec prettier --check ...` — exit 0; all changed files formatted. `pnpm exec tsc --noEmit --project tsconfig.base.json` — exit 0. | Existing package harness and route browser selectors were updated only for the new shell boundary. Evidence is explicitly shell/package and route-safety evidence; it does not claim Slice 3 cards/charts or Slice 4 final route visual acceptance. |

## Slice 2 Workspace-Inclusive Workload Gate

- Immutable predecessor snapshot: `/tmp/opencode/mobile-first-finance-experience-slice-2-predecessor-20260723-full/SNAP`.
- Snapshot manifest: `/tmp/opencode/mobile-first-finance-experience-slice-2-predecessor-20260723-full/manifest.json`; manifest SHA-256 `2586ede793833c872c7f2a6f589953372033444de02f0c2c60ec2b8e48106ff9`.
- Snapshot identity: `HEAD=42038f2dca8ee557f5a16717f04a6b0d8db955a4`, `HEAD_TREE=26450e050db323cadac666c68ac252d974520b0a`; every allowlisted predecessor entry was mode `0664` and its exact path/byte count/SHA-256 is recorded in the manifest.
- Supplemental immutable predecessor snapshot for the shell compatibility unit test: `/tmp/opencode/mobile-first-finance-experience-slice-2-route-test-predecessor-20260723/SNAP`; manifest SHA-256 `2d545c47c586503f717a6c5622d56ec5f56d7756fc593ed8393f060ec2857c17`.
- Supplied binary evidence identity retained: `ui-reference.png`, mode `0664`, 366218 bytes, SHA-256 `0ad7d9b653f5db2f4bc5f4c6716d73091d4fe366703c9598be789e904432f6a4`.
- Exact Slice 2 allowlist and argv (workspace-inclusive, including previously untracked authored text):

```sh
git diff --no-index --no-ext-diff --numstat \
  /tmp/opencode/mobile-first-finance-experience-slice-2-predecessor-20260723-full/SNAP . -- \
  packages/ui/src/components/app-shell.tsx \
  packages/ui/src/styles/app-shell.css \
  packages/ui/test/app-shell.test.tsx \
  packages/ui/test/app-shell.browser.test.tsx \
  packages/ui/test/visual-harness.browser.test.tsx \
  apps/web/components/workspace-shell.tsx \
  apps/web/test/routes.browser.test.ts
```

- Exact supplemental argv:

```sh
git diff --no-index --no-ext-diff --numstat \
  /tmp/opencode/mobile-first-finance-experience-slice-2-route-test-predecessor-20260723/SNAP . -- \
  apps/web/test/routes.test.ts
```

- Both `git diff --no-index` commands exited `1`, the expected difference status. Raw allowlisted numstat was:

```text
2	11	{/tmp/opencode/mobile-first-finance-experience-slice-2-predecessor-20260723-full/SNAP => .}/apps/web/components/workspace-shell.tsx
2	2	{/tmp/opencode/mobile-first-finance-experience-slice-2-predecessor-20260723-full/SNAP => .}/apps/web/test/routes.browser.test.ts
71	22	{/tmp/opencode/mobile-first-finance-experience-slice-2-predecessor-20260723-full/SNAP => .}/packages/ui/src/components/app-shell.tsx
48	40	{/tmp/opencode/mobile-first-finance-experience-slice-2-predecessor-20260723-full/SNAP => .}/packages/ui/src/styles/app-shell.css
69	3	{/tmp/opencode/mobile-first-finance-experience-slice-2-predecessor-20260723-full/SNAP => .}/packages/ui/test/app-shell.browser.test.tsx
38	1	{/tmp/opencode/mobile-first-finance-experience-slice-2-predecessor-20260723-full/SNAP => .}/packages/ui/test/app-shell.test.tsx
2	2	{/tmp/opencode/mobile-first-finance-experience-slice-2-predecessor-20260723-full/SNAP => .}/packages/ui/test/visual-harness.browser.test.tsx
TOTAL	232 additions	81 deletions	313 changed lines

2	1	{/tmp/opencode/mobile-first-finance-experience-slice-2-route-test-predecessor-20260723/SNAP => .}/apps/web/test/routes.test.ts
TOTAL	2 additions	1 deletions	3 changed lines
COMBINED	234 additions	82 deletions	316 changed lines
```

- The combined raw authored total is `316`, below the per-slice cap of `800` with `484` lines remaining. No generated PNG, dependency, route payload, finance card, chart, auth, persistence, ingestion, or calculation text was added to this Slice 2 allowlist.

## Slice 2 Work Unit Evidence

| Evidence | Result |
|---|---|
| Focused test command and exact result | `pnpm --filter @2free/ui exec vitest run --config vitest.browser.config.ts test/app-shell.browser.test.tsx` — exit 0; 1 file and 7 Chromium tests passed. Assertions cover `390x844`, `1280x900`, fixed bottom navigation, safe-area spacing, long Spanish labels, landmarks, keyboard activation, focus, `aria-current`, Iconoir theme control, no rail, balanced shell columns, and `scrollWidth === clientWidth`. |
| Runtime harness command/scenario and exact result | `pnpm --filter @2free/web test:browser -- routes` — exit 0; 3 files and 6 Chromium tests passed for real Next route SSR/route navigation, theme/reduced-motion behavior, 404/health checks, and fail-closed finance/network safety. This is route/browser safety support, not final Slice 4 visual acceptance. |
| Package shell evidence | `pnpm --filter @2free/ui test:browser` — exit 0; 3 files and 19 Chromium tests passed. The shell viewport assertions are package evidence at `390x844` and `1280x900`; they are not a claim that Slice 3 finance cards/charts or Slice 4 route captures are complete. |
| Unit, route safety, type, lint, and format checks | `pnpm --filter @2free/ui test` — exit 0; 11 files and 59 tests. `pnpm --filter @2free/ui typecheck` — exit 0. `pnpm --filter @2free/web exec vitest run test/routes.test.ts test/finance-route-safety.test.ts` — exit 0; 2 files and 8 tests. `pnpm --filter @2free/web typecheck` — exit 0. `pnpm exec tsc --noEmit --project tsconfig.base.json` — exit 0. `pnpm lint` — exit 0. Targeted `pnpm exec prettier --check` — exit 0. |
| Rollback boundary | Revert only `packages/ui/src/components/app-shell.tsx`, `packages/ui/src/styles/app-shell.css`, `apps/web/components/workspace-shell.tsx`, the Slice 2 shell contract updates in `packages/ui/test/app-shell.test.tsx`, `packages/ui/test/app-shell.browser.test.tsx`, `packages/ui/test/visual-harness.browser.test.tsx`, and the corresponding shell selector assertions in `apps/web/test/routes.test.ts` and `apps/web/test/routes.browser.test.ts`. Do not revert Slice 1 foundation/evidence files, unrelated workspace overlays, route pages, auth, persistence, or generated artifacts. |

## Slice 2 Risks / Deviations

- No deviation from the corrected design. Iconoir remains owned by `@2free/ui`; `apps/web` does not add a duplicate icon dependency.
- The 12-column desktop grid is a shell layout scaffold for later card composition; Slice 3 owns all finance cards, charts, D3 geometry, and ready fixtures.
- The package/browser shell evidence is deterministic structural/runtime evidence, not PNG baseline evidence and not final route/chart acceptance.

## Next Slice

Slice 4 owns only tasks 4.1–4.3: actual Next route hardening, locked route composition, route-vs-harness proof, and route captures. Do not wire authenticated data, persistence, ingestion, calculations, or claim route acceptance from this Slice 3 evidence.

## Slice 3 RED/GREEN/REFACTOR Evidence

Slice 3 corrective rerun ran in Standard mode (`strict_tdd: false` in `openspec/config.yaml`) with the prior explicit RED-first contracts preserved.

| Task | RED | GREEN | REFACTOR |
|---|---|---|---|
| 3.1 | Initial RED: `pnpm --filter @2free/ui exec vitest run test/finance-experience.test.tsx` — exit 1 before implementation because `FinanceExperience` was absent; browser harness RED likewise failed before the public export existed. | `pnpm --filter @2free/ui exec vitest run test/finance-experience.test.tsx test/finance-experience-foundation.test.tsx test/visual-capture.test.ts` — exit 0; 3 files/13 tests. Full UI unit — exit 0; 12 files/63 tests. | The stock series now says `Mercado de acciones` and `Variación suministrada de acciones del mercado por periodo.`; synthetic values remain fixture-supplied and safe states remain model-free. |
| 3.2 | The unit/browser RED boundaries above were captured before the presentation component, model, styles, and chart changes. | `pnpm --filter @2free/ui typecheck` — exit 0. D3 `d3-array`, `d3-scale`, and `d3-shape` still feed declarative SVG with `viewBox="0 0 320 180"`; no fetch, provider, persistence, or domain arithmetic was added. | The harness root no longer uses `100vh` or hidden overflow; its exact-size capture frame remains scrollable, and targeted assertions cover context, insight, account cards, charts, and activity. |
| 3.3 | Existing visual RED: the first post-implementation browser run rejected `expect(page).toMatchScreenshot` (8 failures) until it targeted a browser element. Fresh validator RED then identified the stale predecessor manifest, wrong baseline paths, missing binary identity rows, shrunk captures, clipping, and vague stock equivalent; no production route failure was fabricated. | `VISUAL_UPDATE=1 pnpm --filter @2free/ui exec vitest run --config vitest.browser.config.ts test/visual-harness.browser.test.tsx --update` — exit 0; 1 file/9 tests. Normal rerun — exit 0; 1 file/9 tests. Full UI browser — exit 0; 3 files/18 Chromium tests. | `page.viewport` remains the exact 390x844/1280x900 contract; the iframe capture transform and `scale: "css"` prevent runner scaling from shrinking stored PNGs, and the eight matcher comparisons pass at `allowedMismatchedPixelRatio: 0.001` with no diff files. |

## Slice 3 Work Unit Evidence

| Evidence | Result |
|---|---|
| Focused tests | `pnpm --filter @2free/ui exec vitest run test/finance-experience.test.tsx test/finance-experience-foundation.test.tsx test/visual-capture.test.ts` — exit 0; 3 files/13 tests. |
| Full UI unit tests | `pnpm --filter @2free/ui test` — exit 0; 12 files/63 tests. |
| UI browser/runtime harness | `pnpm --filter @2free/ui test:browser` — exit 0; 3 files/18 Chromium tests. The capture-writing file contributed 9 tests: one matrix identity check plus exactly eight harness captures. |
| Capture-writing suite | `pnpm --filter @2free/ui exec vitest run --config vitest.browser.config.ts test/visual-harness.browser.test.tsx` — exit 0; 1 file/9 tests. All eight comparisons passed with the configured 0.001 (0.1%) mismatch limit; no diff PNGs remained. |
| UI typecheck | `pnpm --filter @2free/ui typecheck` — exit 0; TypeScript completed successfully. |
| Web route safety | `pnpm --filter @2free/web exec vitest run test/routes.test.ts test/finance-route-safety.test.ts` — exit 0; 2 files/8 tests. This is route safety support only; Slice 3 does not claim final route acceptance. |
| Web browser safety | `pnpm --filter @2free/web test:browser -- routes` — exit 0; 3 files/6 Chromium tests. Existing route/browser safety was rerun without implementing Slice 4 route integration. |
| Web typecheck | `pnpm --filter @2free/web typecheck` — exit 0; `next typegen` and `tsc --noEmit` completed successfully. |
| Targeted lint | `pnpm exec eslint packages/ui/src/components/finance-experience.tsx packages/ui/src/components/finance-safe-state.tsx packages/ui/src/models/finance-experience.ts packages/ui/src/index.ts packages/ui/test/finance-experience.test.tsx packages/ui/test/fixtures/finance-experience.ts packages/ui/test/visual-capture.ts packages/ui/test/visual-harness.browser.test.tsx packages/ui/vitest.browser.config.ts` — exit 0; no diagnostics. CSS was checked by Prettier, not passed to ESLint. |
| Targeted format | `pnpm exec prettier --check packages/ui/package.json packages/ui/src/components/finance-experience.tsx packages/ui/src/components/finance-safe-state.tsx packages/ui/src/models/finance-experience.ts packages/ui/src/index.ts packages/ui/src/styles/index.css packages/ui/src/styles/finance-experience.css packages/ui/test/finance-experience.test.tsx packages/ui/test/fixtures/finance-experience.ts packages/ui/test/visual-capture.ts packages/ui/test/visual-harness.browser.test.tsx packages/ui/vitest.browser.config.ts` — exit 0; all matched files use Prettier style. |
| Runtime harness command/scenario | `pnpm --filter @2free/ui exec vitest run --config vitest.browser.config.ts test/visual-harness.browser.test.tsx` — exit 0; it exercised mobile/desktop, light/dark, motion/reduced, exact viewport dimensions, responsive columns, scroll reachability, no horizontal overflow, chart summaries, non-color status, final-state parity, and baseline comparison. |
| Rollback boundary | Revert only `packages/ui/package.json`, `pnpm-lock.yaml`, `packages/ui/src/components/finance-experience.tsx`, `packages/ui/src/components/finance-safe-state.tsx`, `packages/ui/src/models/finance-experience.ts`, `packages/ui/src/styles/finance-experience.css`, `packages/ui/src/styles/index.css`, `packages/ui/src/index.ts`, `packages/ui/test/finance-experience.test.tsx`, `packages/ui/test/fixtures/finance-experience.ts`, `packages/ui/test/visual-capture.ts`, `packages/ui/test/visual-harness.browser.test.tsx`, `packages/ui/vitest.browser.config.ts`, and the eight `test/visual-baselines/.../harness` plus eight `artifacts/visual/.../harness` binaries. Do not revert Slice 1 foundation, Slice 2 shell, existing Next route files, unrelated workspace overlays, or auth/data work. |

## Slice 3 Workspace-Inclusive Workload Gate

- Immutable predecessor snapshot: `/tmp/opencode/mobile-first-finance-experience-slice-3-predecessor-20260724/SNAP`; the primary Slice 3 paths were copied from the current workspace before edits, and the later-added package/lockfile entries were frozen before those paths changed; this is not a `HEAD` predecessor.
- Corrected predecessor allowlist: `/tmp/opencode/mobile-first-finance-experience-slice-3-predecessor-20260724/allowlist.txt`; SHA-256 `7399890f0f09efa2ba2fcd1ee831cd2041b1946d48cf3c947aa9eaefdab39fc8`; 31 entries, including the actual `test/visual-baselines/...` paths and all 16 generated binary paths.
- Corrected predecessor manifest: `/tmp/opencode/mobile-first-finance-experience-slice-3-predecessor-20260724/manifest.tsv`; SHA-256 `8f29a543b54c2dc858feabab1d525d8be7b1cbfcdbdd0d14c5346e59fc310bdc`; 31 rows. Recomputed verification returned `manifest matches SNAP: True`. `finance-experience.tsx`, `finance-experience.css`, and `finance-experience.test.tsx` are truthfully `absent`; every present row records mode `0664`, byte count, and SHA-256 from SNAP; all 16 binary predecessor rows are also truthfully `absent`.
- Exact workload argv:

```sh
git diff --no-index --no-ext-diff --numstat \
  /tmp/opencode/mobile-first-finance-experience-slice-3-predecessor-20260724/SNAP . -- \
  packages/ui/src/components/finance-experience.tsx \
  packages/ui/src/components/finance-safe-state.tsx \
  packages/ui/src/models/finance-experience.ts \
  packages/ui/src/styles/finance-experience.css \
  packages/ui/src/styles/index.css \
  packages/ui/src/index.ts \
  packages/ui/vitest.browser.config.ts \
  packages/ui/test/fixtures/finance-experience.ts \
  packages/ui/test/finance-experience.test.tsx \
  packages/ui/test/dashboard.test.tsx \
  packages/ui/test/visual-harness.browser.test.tsx \
  packages/ui/test/visual-capture.ts \
  packages/ui/test/visual-capture.test.ts \
  test/visual-baselines/mobile-first-finance-experience/harness/harness-mobile-light-motion.png \
  test/visual-baselines/mobile-first-finance-experience/harness/harness-mobile-light-reduced.png \
  test/visual-baselines/mobile-first-finance-experience/harness/harness-mobile-dark-motion.png \
  test/visual-baselines/mobile-first-finance-experience/harness/harness-mobile-dark-reduced.png \
  test/visual-baselines/mobile-first-finance-experience/harness/harness-desktop-light-motion.png \
  test/visual-baselines/mobile-first-finance-experience/harness/harness-desktop-light-reduced.png \
  test/visual-baselines/mobile-first-finance-experience/harness/harness-desktop-dark-motion.png \
  test/visual-baselines/mobile-first-finance-experience/harness/harness-desktop-dark-reduced.png \
  artifacts/visual/mobile-first-finance-experience/harness/harness-mobile-light-motion.png \
  artifacts/visual/mobile-first-finance-experience/harness/harness-mobile-light-reduced.png \
  artifacts/visual/mobile-first-finance-experience/harness/harness-mobile-dark-motion.png \
  artifacts/visual/mobile-first-finance-experience/harness/harness-mobile-dark-reduced.png \
  artifacts/visual/mobile-first-finance-experience/harness/harness-desktop-light-motion.png \
  artifacts/visual/mobile-first-finance-experience/harness/harness-desktop-light-reduced.png \
  artifacts/visual/mobile-first-finance-experience/harness/harness-desktop-dark-motion.png \
  artifacts/visual/mobile-first-finance-experience/harness/harness-desktop-dark-reduced.png \
  packages/ui/package.json \
  pnpm-lock.yaml
```

- Diff status: `1` (expected differences from the immutable predecessor). Exact summation argv: `awk -F '\t' '{print; if ($1 ~ /^[0-9]+$/ && $2 ~ /^[0-9]+$/) {a+=$1; d+=$2}} END {printf "TOTAL\t%d additions\t%d deletions\t%d changed lines\n", a, d, a+d}' /tmp/opencode/mobile-first-finance-experience-slice-3-predecessor-20260724/slice-3-corrected.numstat`.
- Final raw authored total: `724` additions + `76` deletions = `800` changed lines. Binary rows are retained in the raw output as `-/-` and excluded only from this authored-line arithmetic; the one-time maintainer-approved Slice 3 exception is exactly met, with no remaining margin.

## Slice 3 Capture Manifest / Binary Hashes

All current files below are mode `0664`. The baseline and artifact namespaces are separate identity surfaces; all 16 PNGs are retained in evidence. The matcher result for all eight variant comparisons was pass at `allowedMismatchedPixelRatio: 0.001` (0.1%), with no diff files left in the artifact directory.

| Surface | Variant | Dimensions | Bytes | SHA-256 |
|---|---|---:|---:|---|
| `harness` baseline | `mobile-light-motion` | 390x844 | 50013 | `b8f83a22775502ada2c794a96b4bb4ea79c224c8fd7506a07b71c6ae9bf241ac` |
| `harness` baseline | `mobile-light-reduced` | 390x844 | 50013 | `b8f83a22775502ada2c794a96b4bb4ea79c224c8fd7506a07b71c6ae9bf241ac` |
| `harness` baseline | `mobile-dark-motion` | 390x844 | 51450 | `b5312c7dacaae15a5ba2fa8dfa711a83ab94c4cf9fe1c8b9b33abe3e616f9111` |
| `harness` baseline | `mobile-dark-reduced` | 390x844 | 51450 | `b5312c7dacaae15a5ba2fa8dfa711a83ab94c4cf9fe1c8b9b33abe3e616f9111` |
| `harness` baseline | `desktop-light-motion` | 1280x900 | 56763 | `78aa318c1cbb29950f72e6686ac9413efddf9ae9b605a554f935977a43197e56` |
| `harness` baseline | `desktop-light-reduced` | 1280x900 | 56806 | `703715215d1d0a7183e6afa1c0feac1d81dca601273711019d279771a45a1770` |
| `harness` baseline | `desktop-dark-motion` | 1280x900 | 58029 | `c06c6dde349cf264a7672f4935690d9f8f447def81112c6b2fa9a8d3850d56db` |
| `harness` baseline | `desktop-dark-reduced` | 1280x900 | 58578 | `4831774bc1ec25498e164d7fadf8e8307dd44b6a9fc1f3ae66e506fd09b47c51` |
| `harness` artifact | `mobile-light-motion` | 390x844 | 40564 | `4d782e199b5ce1d8fa4999da42e443c66da1716729f4998a10ef70f7c05ddfa4` |
| `harness` artifact | `mobile-light-reduced` | 390x844 | 40564 | `4d782e199b5ce1d8fa4999da42e443c66da1716729f4998a10ef70f7c05ddfa4` |
| `harness` artifact | `mobile-dark-motion` | 390x844 | 41545 | `499f559052b793d11ec9607c5b1492910f287b5324769ac451e160124aa850da` |
| `harness` artifact | `mobile-dark-reduced` | 390x844 | 41545 | `499f559052b793d11ec9607c5b1492910f287b5324769ac451e160124aa850da` |
| `harness` artifact | `desktop-light-motion` | 1280x900 | 48037 | `37e801e90af5e5aa5a385b701923d9bda49281a9d900d146c45ad2a11a23bbfa` |
| `harness` artifact | `desktop-light-reduced` | 1280x900 | 48345 | `e57512955f1d4fdb3caf8cb9641650dd82370912cafe7095cdfea58aca7c2700` |
| `harness` artifact | `desktop-dark-motion` | 1280x900 | 48980 | `a150a4ed60507afc7b07cd6d07131af2974fccf70d4c4eee7424577ef1673532` |
| `harness` artifact | `desktop-dark-reduced` | 1280x900 | 48999 | `b583f0f47ac3a25b563ec38057141ea4be509ab71ff561f69bdd7831ab0174af` |

The supplied composition authority remains unchanged: `ui-reference.png`, mode `0664`, 366218 bytes, SHA-256 `0ad7d9b653f5db2f4bc5f4c6716d73091d4fe366703c9598be789e904432f6a4`.

## Slice 3 Risks / Deviations

- No Slice 4 route integration, authenticated payload, persistence, ingestion, provider, or financial calculation was added.
- Scoped D3 type packages remain UI dev dependencies because the existing runtime D3 modules had no resolvable declarations; runtime scope remains `d3-array`, `d3-scale`, and `d3-shape`.
- The capture helper compensates for Vitest's scaled iframe by transforming only that iframe element and using CSS-pixel screenshots; it does not mutate the shared runner container or screenshot a padded child. The mobile capture frame uses a subpixel width solely to avoid Chromium rounding while the stored PNG remains exactly 390x844.
- `FinanceExperience` remains additive and leaves the older `FinanceDashboard` consumer contract intact; the new harness is the only ready-state capture surface.

## Next Slice Boundary

Slice 4 remains pending and may add only route RED tests, locked `apps/web` composition/hardening, separate route captures, and final route typecheck/build/lint proof. It must not reuse these package harness captures as route acceptance and must preserve the fail-closed unauthenticated boundary.
