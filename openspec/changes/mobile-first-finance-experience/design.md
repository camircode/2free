# Design: Mobile-First Finance Experience

## Technical Approach

Use the real Next path as the acceptance target: `layout.tsx` → `WorkspaceShell` → `AppShell` → `HomePage` → `FinanceExperience`. `/` always receives a payload-free `locked` state containing static Spanish labels, unavailable explanations, and reference-shaped slots—never a model, value, fixture, loader, provider, or fetch.

## Architecture Decisions

| Decision | Choice | Rejected | Rationale |
|---|---|---|---|
| Route safety | `HomePage` passes `{status: "locked", message}`; output exposes `data-route-composition="reference"` and four structural slots, never a payload. | Test data in `/`, query flags, hidden visual route. | Direct `/` proof remains fail-closed. |
| Ownership | `@2free/ui` owns presentation, Iconoir, D3 geometry, models, and CSS; `apps/web` owns routing, theme, and locked entry. | Web duplicate or domain imports. | Preserves reuse and excludes domain ownership. |
| Charts/icons | Scoped D3 modules feed declarative SVG; `IconoirProvider` supplies SSR-safe defaults. | Imperative D3 or another icon set. | Deterministic hydration and naming. |
| Evidence boundary | `routes.browser.test.ts` owns real `/`; `visual-harness.browser.test.tsx` owns ready synthetic proof. Namespaces remain separate. | Harness substituting for route proof. | Prevents package-only proof. |

## Data Flow

```text
GET / (unauthenticated) → HomePage(locked) → WorkspaceShell/AppShell → safe responsive slots
UI harness fixture(ready) → FinanceExperience → pure D3 geometry → SVG + Spanish equivalent text
```

Charts use responsive `viewBox`, Spanish labels, and list/table equivalents; D3 consumes `plotValue` only.

## File Changes

| File | Action | Description |
|---|---|---|
| `packages/ui/{package.json,src/components,src/models,src/styles}` | Modify/create | Iconoir, D3, locked/ready composition, responsive layout, themes, focus, and motion. |
| `apps/web/app/{layout,page}.tsx`, `apps/web/components/workspace-shell.tsx`, `apps/web/app/globals.css` | Modify | Wire the actual locked route and shell. |
| `packages/ui/test/visual-harness.browser.test.tsx`, `apps/web/test/{routes.browser,dashboard.browser}.test.ts`, `*/test/visual-capture.ts` | Modify/create | Separate assertions and captures. |
| `test/visual-baselines/mobile-first-finance-experience/{route,harness}/`, `artifacts/visual/mobile-first-finance-experience/` | Create/generated | Baselines and comparison captures. |

## Interfaces / Contracts

```ts
type FinanceExperienceState =
  | { status: "locked"; message: string }
  | { status: "loading" | "empty" | "error"; message?: string }
  | { status: "ready"; model: FinanceExperienceModel };
type FinanceChartPoint = { label: string; plotValue: number; valueText: string };
```

`locked` cannot carry a model; `ready` is never imported by the production route.

## Testing Strategy

The route test records requests before `page.goto("/")`, checks SSR HTML, and fails on `/dashboard`, API, `API_URL`, fixture markers, currency/amount/card-number data, or any finance request. It asserts the route marker, stacked slots at `390x844`, balanced columns/no rail at `1280x900`, landmarks, 404s, and clean hydration. Harness results are labeled `harness` and cannot satisfy this proof.

Both suites capture exactly `mobile|desktop × light|dark × motion|reduced`, named `{surface}-{viewport}-{theme}-{motion}.png`, under separate baselines. `page.screenshot` follows `emulateMedia`, animation/transition freeze, ready fonts/images, two `requestAnimationFrame`s, and `[data-motion-settled="true"]`; missing baselines fail. Pass requires exact dimensions, all assertions, and ≤0.1% PNG diff; any mismatch fails. Only `VISUAL_UPDATE=1` may update baselines after review. Outputs go to `artifacts/visual/...` and cannot prove the other surface.

For every viewport/theme, reduced and normal motion must have equal final-state signatures (headings, text, `data-*` layout/state, chart summaries, active semantics); reduced mode has no running animation/transition. Non-color tests require Spanish state text/role, progress label/percentage, chart summaries, and `aria-current`/`aria-label`; color or an icon alone is insufficient.

## Threat Matrix

| Boundary | Applicability | Safe/failure behavior | Planned RED test |
|---|---|---|---|
| Next route/render | Applicable — `/` changes | Locked, payload-free output; any finance request, payload, mismatch, or wrong layout fails. | Direct SSR/network/Chromium route test. |
| Documentation-like paths | N/A — no executable classification. | No behavior. | None. |
| Git repository selection | N/A — product code does not select repositories. | No behavior. | None. |
| Commit state | N/A — no commit automation. | No behavior. | None. |
| Push state | N/A — no push automation. | No behavior. | None. |
| PR commands | N/A — chaining is delivery metadata only. | No behavior. | None. |

## Migration / Rollout

No migration or feature flag. Feature Branch Chain cap: `800` authored additions plus deletions per child. Before each task and at close, record predecessor SHA and sum `git diff --numstat <base>...HEAD`; if projected work exceeds 800, stop and split. Generated PNGs are excluded from line risk, but names/hashes remain in the receipt.

| Slice | Estimate | Evidence owner |
|---|---:|---|
| 1 foundation/evidence | +260/-70 = 330 | locked contract, capture helper, variant/baseline protocol |
| 2 shell | +310/-150 = 460 | package mobile/desktop/focus/overflow proof |
| 3 cards/charts | +520/-190 = 710 | ready harness, D3/text equivalents, reduced-motion/non-color proof |
| 4 route hardening | +390/-180 = 570 | actual `/` SSR/network/layout/captures and route-vs-harness gate |

Each slice stops only with its owned evidence green, a measured total ≤800, and no unowned acceptance work silently carried forward. No authenticated data wiring is included.

## Open Questions

None. Authenticated data remains a later Better Auth change.
