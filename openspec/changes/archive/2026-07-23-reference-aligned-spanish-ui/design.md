# Design: Reference-Aligned Spanish Finance UI

## Technical Approach

Deliver the proposal as four ordered, UI-only slices. Reuse the verified symbols `AppShell`/`AppShellProps` in `packages/ui/src/components/app-shell.tsx`, `FinanceDashboard`/`FinanceDashboardProps`/`MoneyDisplay` in `packages/ui/src/components/finance-dashboard.tsx`, `DashboardMoney`/`DashboardDataPoint`/`DashboardModel`/`DashboardState` in `packages/ui/src/models/dashboard.ts`, `StatusMessage` in `packages/ui/src/components/status.tsx`, `statusDefinitions`/`StatusTone` in `packages/ui/src/styles/status.ts`, `useScopedMotion` in `packages/ui/src/motion/use-scoped-motion.ts`, and `runViewTransition` in `packages/ui/src/motion/view-transition.ts`. Change their presentation to the supplied warm, rounded reference with neutral Spanish copy. No Prisma, backend, provider, persistence, route ownership, or domain-contract drift.

## Architecture Decisions

| Decision | Choice | Alternatives rejected | Rationale |
|---|---|---|---|
| Presentation boundary | Preserve existing props, exact `MoneyDto`/`DashboardState`, consumer callbacks, and package-local `@/*` alias. | Web-only wrapper or ORM-shaped props. | Keeps `@2free/ui` reusable and presentation-only. |
| View model | Consumers provide existing `DashboardModel`; `DashboardDataPoint.progress` is a proposed optional field with precomputed `percent` and `text`. | UI arithmetic, fetching, or provider imports. | Protects precision, ownership, and no-card-number behavior. |
| Visual system | Extend the existing semantic CSS files and use the existing `packages/ui/src/assets/2free-con-fondi.svg`. | Raw colors or a utility rewrite. | Matches repository conventions and supports light/dark themes. |
| Enhancement | Reuse `useScopedMotion` and `runViewTransition`; keep a package-local proposed evidence harness. | Required animation, CDN fonts, or product routes. | Static SSR output and synchronous reduced-motion/failure fallbacks remain usable. |

## Data Flow

```text
consumer fixture/view data (mapper proposed)
  -> existing AppShellProps / DashboardState
  -> existing AppShell / FinanceDashboard / MoneyDisplay
  -> semantic Spanish DOM + tokenized CSS

navigation intent -> existing runViewTransition -> consumer onNavigate
```

`DashboardMoney.exact` and `formatted` remain unchanged. The proposed progress field is supplied by the consumer; UI performs no calculation, fetch, ORM work, or card-number rendering. Existing `@/*` resolution remains `src/*` in `packages/ui/tsconfig.json` and `packages/ui/vite.config.ts`.

## File Changes

| Exact repository-relative path(s) | Action | Description |
|---|---|---|
| `packages/ui/src/components/app-shell.tsx`; `packages/ui/src/components/finance-dashboard.tsx`; `packages/ui/src/models/dashboard.ts` | Modify | Spanish hierarchy, responsive shell, cards, allocation/progress, activity, and four states; model extension is explicitly proposed. |
| `packages/ui/src/styles/tokens.css`; `packages/ui/src/styles/themes.css`; `packages/ui/src/styles/typography.css`; `packages/ui/src/styles/foundation.css`; `packages/ui/src/styles/status.css`; `packages/ui/src/styles/reduced-motion.css`; `packages/ui/src/styles/app-shell.css`; `packages/ui/src/styles/dashboard.css`; `packages/ui/src/styles/index.css`; `packages/ui/src/styles/status.ts` | Modify | Warm rounded tokens, themes, focus, Spanish status definitions, typography fallback, mobile bottom navigation, desktop composition, and accessible visuals. |
| `packages/ui/src/assets/2free-con-fondi.svg` | Retain/use | Preserve supplied branding; no replacement asset contract. |
| `packages/ui/src/assets/fonts/`; `packages/ui/src/styles/README.md` | Conditional create/modify | Add licensed local fonts only when supplied; otherwise document explicit fallback stacks. |
| `packages/ui/test/fixtures/spanish-dashboard.ts`; `packages/ui/test/visual-harness.browser.test.tsx` | Create (proposed) | Deterministic Spanish fixture and screenshot evidence. |
| `packages/ui/test/app-shell.test.tsx`; `packages/ui/test/app-shell.browser.test.tsx`; `packages/ui/test/dashboard.test.tsx`; `packages/ui/test/consumer-harness.test.tsx`; `packages/ui/test/motion-enhancement.test.tsx`; `packages/ui/test/branding-assets.test.ts`; `packages/ui/test/status-semantics-remain-accessible-without-color.test.tsx` | Modify | Cover accessibility, SSR, responsive layout, themes, exact money, motion fallbacks, assets, and screenshots. |

No `apps/api`, `packages/data-provider`, Prisma/backend, spec, or tasks artifact is changed.

## Interfaces / Contracts

```ts
// Proposed extension; the current type has only label and value.
type DashboardDataPoint = Readonly<{
  label: string;
  value: DashboardMoney;
  progress?: Readonly<{ percent: number; text: string }>;
}>;
```

Progress uses native `<progress max={100}>` plus visible Spanish text and the existing `MoneyDisplay`; structured table/list text remains the fallback. Error payloads remain consumer-provided.

## Testing Strategy

| Layer | Coverage | Approach |
|---|---|---|
| Unit/SSR | Exact values, Spanish semantics, four states, progress, aliases, assets, no arithmetic/fetch. | Extend current Vitest and markup tests. |
| Browser | Keyboard semantics, mobile bottom bar, desktop composition, overflow, themes, hydration, reduced motion, and failures. | Existing Chromium suite with mocked capabilities. |
| Visual | Exactly eight Cartesian variants: `390x844` and `1280x900` × light/dark × motion/reduced-motion. | Fixed settled fixture; `1440x900` is a separate responsive proof and is not counted in the eight. |

## Threat Matrix

`N/A` — the changed shell is a UI component, not shell-command integration; no application routing, subprocess, VCS/PR automation, executable classification, or OS process boundary is introduced.

## Migration / Rollout

No migration or feature flag. Use four chained slices, each below the configured 800-line review budget: (1) foundation—tokens, themes, typography, status, branding; (2) shell—responsive `AppShell` navigation; (3) dashboard—Spanish `FinanceDashboard`, states, and proposed progress; (4) evidence/hardening—motion fallbacks, SSR/accessibility tests, and fixed screenshots. Each child targets the immediately preceding slice and rolls back independently. No backend or Prisma work is included.

## Open Questions

None. Font binaries remain optional because the documented local fallback is already decided; evidence sizes are fixed above.

## Result Contract

- `status`: `success`
- `executive_summary`: Corrected the design artifact with verified symbols, exact paths, fixed screenshot evidence, preserved UI-only scope, four chained slices, and the required downstream phase.
- `artifacts`: [`openspec/changes/reference-aligned-spanish-ui/design.md`] (only file modified)
- `next_recommended`: `sdd-tasks`
- `risks`: Missing licensed font binaries remain non-blocking through explicit fallbacks; fixed fixtures and viewports limit visual drift.
- `skill_resolution`: `paths-injected` — loaded `/home/camir/.config/opencode/skills/sdd-design/SKILL.md` and `/home/camir/.config/opencode/skills/cognitive-doc-design/SKILL.md` before work.
