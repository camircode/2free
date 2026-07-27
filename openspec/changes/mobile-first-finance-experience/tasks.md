# Tasks: Mobile-First Finance Experience

## Review Workload Forecast

Estimated slices: 330, 460, 710, and 570 changed lines; each targets its predecessor.

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High
Delivery strategy: force-chained

Each apply invocation implements ONLY the next slice; no commits, pushes, PRs, or lifecycle operations. From root, resolve and record immutable `BASE_SHA=$(git rev-parse "$PREDECESSOR^{commit}")`, its tree, allowlist, raw output, and PNG hashes. Archive that tree into `SNAP`, then run `git diff --no-index --numstat SNAP . -- "${ALLOWLIST[@]}" | awk -F '\t' '{a+=$1;d+=$2} END {print a,d,a+d}'` (accept status 0/1). Allowlist intended untracked authored text; exclude unrelated files, `node_modules`, and generated/binary PNGs from authored totals, but retain PNG path/size/SHA-256. Stop before 800 additions+deletions for every slice except corrected Slice 3, which has one-time maintainer approval to pass at exactly 800; this exception does not relax any other slice budget.

### Suggested Work Units

| Unit | Focused test command | Runtime harness/evidence | Rollback boundary |
|---|---|---|---|
| 1 | `pnpm --filter @2free/ui test` + `pnpm --filter @2free/ui typecheck` | package contract/capture helper only; not route proof | foundation files/tests |
| 2 | `pnpm --filter @2free/ui test:browser -- app-shell` | package shell at 390x844/1280x900 | shell components/styles/tests |
| 3 | `pnpm --filter @2free/ui test:browser -- dashboard visual-harness` | labeled `harness`, eight deterministic variants | cards/charts/D3 files/tests |
| 4 | `pnpm --filter @2free/web test:browser -- routes dashboard`; `pnpm --filter @2free/web typecheck`; `pnpm --filter @2free/web build` | real `/` SSR/network/Chromium plus route captures | web route/evidence files |

## Phase 1: Slice 1 — Foundation / Evidence

- [x] 1.1 **RED:** test locked/ready typing, package-only fixtures, named icons, text equivalents, and rejected finance markers.
- [x] 1.2 On `feature/tracker`, add shared models/components/styles, scoped Iconoir/D3, Spanish branding, safe states, and deterministic capture helpers.
- [x] 1.3 Check contracts, UI typecheck, lint; record separate route/harness manifests and the workspace-inclusive gate.

## Phase 2: Slice 2 — Mobile-First Shell

- [x] 2.1 **RED:** browser-test safe-area navigation, landmarks/focus, `aria-current`, no rail, balanced columns, long labels, and `scrollWidth === clientWidth`.
- [x] 2.2 On Slice 1, recompose `app-shell.tsx`, `workspace-shell.tsx`, and styles for Iconoir, mobile stacking, desktop columns, Spanish branding, and SSR safety.
- [x] 2.3 Run package browser checks at 390x844/1280x900 and root lint/typecheck; capture shell evidence and gate.

## Phase 3: Slice 3 — Finance Cards / D3 Charts

- [x] 3.1 **RED:** test cards, safe states, chart summaries, overflow, reduced-motion parity, and color-independent status.
- [x] 3.2 On Slice 2, implement `FinanceExperience`, cards, and scoped D3 geometry → declarative SVG with responsive viewBox, Spanish labels, text equivalents, and no fetch/calculation.
- [x] 3.3 Run exactly eight harness captures (`mobile|desktop × light|dark × motion|reduced`), deterministic settle, ≤0.1% diff, and gate.

## Phase 4: Slice 4 — Actual Next Route Hardening / Visual Proof

- [ ] 4.1 **RED:** route-test pre-navigation requests and reject payloads, card numbers, APIs, fixtures, hydration errors, overflow, wrong layout, and 404 regressions.
- [ ] 4.2 On Slice 3, wire Next layout/page/shell/CSS so `/` passes only `{status:"locked",message}` and exposes no fixture/model/fetch/provider.
- [ ] 4.3 Run exactly eight route captures (`mobile|desktop × light|dark × motion|reduced`) separately from harness with ≤0.1% baseline diff; assert motion/non-color/hydration, then web typecheck/build and root lint.
