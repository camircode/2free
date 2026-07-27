## Exploration: Mobile-first finance experience

### Executive finding

The supplied `ui-reference.png` is a composition reference, not a recoloring target. The runnable Next.js route currently renders a fail-closed authentication message inside a desktop-sidebar-first shell; the shared finance fixture is a separate package/browser harness and is not the actual public page. The archived `reference-aligned-spanish-ui` change improved tokens and assertions, but its implementation remained a generic shell plus bordered dashboard/table primitives and did not establish the reference's mobile information architecture. This change should therefore be a structural redesign with route-level evidence, not another palette pass.

### Reference-derived acceptance characteristics

The reference shows two narrow, phone-like surfaces with an airy warm background, large rounded cards, strong editorial headings, compact supporting text, high-contrast pill/circle controls, and visual data encoded as rounded vertical bars. The product equivalent should preserve these characteristics while using Spanish copy and 2free branding:

- Mobile is the primary composition: a clear greeting/section heading, date or period context, one prominent insight/action card, then vertically stacked finance cards and activity; no sidebar or desktop table is the organizing principle.
- Navigation is compact, thumb-reachable, icon-led, and visually distinct from content. Icon-only actions require accessible names; labels must remain available to assistive technology.
- Cards use generous rounded geometry, intentional surface layering, restrained borders, soft shadows, and bounded content width. Desktop should compose those cards into balanced columns rather than stretch a mobile stack beside a permanent rail.
- Typography has a rounded/display hierarchy for headings, readable body text, short labels, and deliberate numeric emphasis. Spanish strings must not be translated by shrinking or truncating the hierarchy.
- Charts are visual summaries with accessible text equivalents. Investments, returns/yields, stocks, and related analytics need responsive SVG charts driven by D3 scales/shape/array calculations, with `viewBox`/container responsiveness and no uncontrolled DOM mutation.
- Motion is optional and reduced-motion safe. Theme, contrast, focus, safe-area padding, no horizontal overflow, and stable SSR/hydration are acceptance concerns, not polish tasks.

### Current runnable state

The real Next render path is `apps/web/app/layout.tsx` → `WorkspaceShell` → shared `AppShell` → `apps/web/app/page.tsx`. `HomePage` currently renders only `Resumen financiero` and `Autenticación requerida. Los datos financieros no están disponibles.` It intentionally does not fetch financial data. `WorkspaceShell` supplies the 2free SVG logo, route navigation, and a text theme toggle. The desktop and mobile variants are both emitted by `AppShell`; CSS hides the sidebar below `42rem` and reveals a fixed bottom navigation, but the source composition is still authored around a two-column desktop grid.

The shared `FinanceDashboard` is exercised by `packages/ui` tests and fixtures, not by the current public home route. It renders a balance card, an allocation/trend table (or compact list), and activity rows. Its model correctly preserves exact money values and unavailable balances, but it has no investment, yield, stock, or D3 chart contract. `packages/ui` has no `iconoir-react` or D3 dependency today; the only UI runtime dependencies are GSAP-related.

### Why the archived change produced recoloring rather than structural fidelity

The archived exploration/design explicitly chose to extend existing semantic CSS and preserve `AppShell`/`FinanceDashboard` public props. The resulting implementation and verification emphasized token/theme changes, rounded panels, native progress, Spanish semantics, and deterministic browser assertions. That protected useful boundaries, but it did not replace the actual route composition or introduce a reference-shaped mobile content model. In particular:

1. `AppShell` still owns a desktop sidebar grid (`17rem + content`) and only switches to a fixed bottom bar at a narrow breakpoint.
2. `FinanceDashboard` remains card/table/activity oriented, with `DashboardDataPoint.progress` and native `<progress>`, not D3 chart primitives or reference-like insight cards.
3. The real `HomePage` remains authentication-gated and never renders `FinanceDashboard`, so package visual-harness success could not prove the runnable Next UI matched the reference.
4. The archived plan treated fonts as conditional and did not add Iconoir or a charting dependency; its evidence asserted structure and computed styles rather than capturing the actual route at mobile and desktop.

### Affected areas

- `apps/web/app/layout.tsx`, `apps/web/app/page.tsx`, `apps/web/components/workspace-shell.tsx` — actual route composition, brand, navigation, theme action, and fail-closed entry state.
- `apps/web/app/globals.css` — route-level composition and responsive treatment currently describe a generic shell/message page.
- `packages/ui/src/components/app-shell.tsx` and `packages/ui/src/styles/app-shell.css` — replace inherited sidebar-first ownership with intentional mobile-first navigation while retaining consumer callbacks and semantic landmarks.
- `packages/ui/src/components/finance-dashboard.tsx`, `packages/ui/src/models/dashboard.ts`, `packages/ui/src/styles/dashboard.css` — replace table-first visual hierarchy and add presentation contracts for insight cards and chart/text equivalents without moving domain logic into UI.
- `packages/ui/src/styles/tokens.css`, `themes.css`, `typography.css`, `foundation.css`, `status.css`, `reduced-motion.css`, `index.css` — reference surfaces, typography, focus/contrast, and motion-safe foundations.
- `packages/ui/src/assets/2free-con-fondi.svg` and its consumers — retain supplied branding and verify sizing/cropping in both compositions.
- `packages/ui/package.json` and lockfile — likely add `iconoir-react` and D3 modules (prefer scoped `d3-scale`, `d3-shape`, `d3-array`, and types as needed), after compatibility review.
- `packages/ui/test/*`, `apps/web/test/dashboard.browser.test.ts` — test shared contracts and the actual Next route separately; add settled mobile/desktop browser evidence.
- `openspec/changes/archive/2026-07-23-reference-aligned-spanish-ui/*` — historical evidence only; do not modify.

### Approaches

1. **Route-first structural redesign with shared primitives** — redesign the actual Next page and shared shell/dashboard together; keep data presentation contracts in `@2free/ui`, and add a thin deterministic route fixture that remains authentication-safe.
   - Pros: acceptance tests exercise what users actually see; fixes the root fidelity gap; preserves reuse and makes the fail-closed boundary explicit.
   - Cons: larger coordination surface across `apps/web` and `packages/ui`; requires careful migration while Better Auth and Next work continues.
   - Effort: High

2. **Shared-package-only redesign** — improve the package harness and leave the Next route as an authentication message.
   - Pros: smaller isolated change and lower backend coupling.
   - Cons: cannot claim runnable UI fidelity; repeats the archived failure mode and leaves users without the reference composition.
   - Effort: Medium

3. **Web-only visual wrapper** — build a reference-like page solely in `apps/web` around existing contracts.
   - Pros: fast route proof.
   - Cons: duplicates shared UI, creates divergence between consumers, and risks weakening the fail-closed route boundary.
   - Effort: Medium

### Recommendation

Choose approach 1. Start with a mobile-first shared visual foundation and route-level harness, then deliver shell/navigation, dashboard insight composition/charts, and evidence hardening as a feature-branch chain. Use Iconoir through a consistent provider/default configuration and accessible labels. Use declarative React SVG with D3 calculations for financial visualizations. Keep all real financial data unavailable until Better Auth establishes authenticated per-user ownership; route fixtures may use clearly synthetic, non-sensitive presentation data only where the existing browser harness requires it. Do not turn this UI change into an auth, Prisma, provider, or migration change.

### Dependencies and safe implementation slices

The active Better Auth financial-boundary work is a prerequisite for any authenticated data flow, and ongoing Next migration work owns route/runtime integration. Coordinate interfaces with those changes, but do not bypass their gates. Recommended force-chained slices under the 800-line reviewer budget:

1. **Foundation and evidence harness** — Iconoir/D3 dependency decision, tokens/typography, logo treatment, accessible visual primitives, route-capable deterministic fixture, and mobile/desktop screenshot capture setup.
2. **Mobile-first shell** — bottom navigation, header/action hierarchy, safe areas, focus/keyboard behavior, and deliberate desktop adaptation; preserve `AppShell` consumer API.
3. **Finance composition and charts** — Spanish overview/insight cards, activity and account treatments, D3 responsive charts for investments/yields/stocks, semantic text/table alternatives, and all loading/empty/error/fail-closed states.
4. **Route integration and hardening** — render the accepted composition through the actual Next route without exposing financial data, validate Better Auth boundary behavior, reduced motion, dark mode, SSR/hydration, overflow, and settled mobile/desktop evidence.

Each child should state its predecessor, current boundary, follow-up, and out-of-scope work. Keep each slice independently reviewable and below 800 additions plus deletions; do not mix this feature chain with the auth/migration chain.

### Technical unknowns

- Whether the current Next route should show an authenticated shell placeholder or remain entirely fail-closed until Better Auth lands, and how that contract will be exposed during migration.
- Exact installed Next/auth versions and the safe integration point for session ownership; no UI slice should infer identity from client state.
- Iconoir package version/provider API and the smallest D3 module set compatible with the monorepo/bundler.
- Whether visual acceptance requires pixel baselines or deterministic runtime assertions; current repository evidence uses the latter and has no established screenshot-golden convention.
- Licensed font availability; do not invent or fetch remote font binaries.
- Which finance analytics are presentation fixtures versus real owned data, especially investment and stock semantics.

### Test and evidence strategy

- Render the actual Next app in Chromium at a narrow mobile viewport and at least one balanced desktop width; retain route evidence distinct from package harness evidence.
- Assert mobile-first bottom navigation, no horizontal overflow, touch target size, safe-area spacing, focus visibility, accessible names, active route semantics, and intentional desktop composition.
- Assert Spanish copy, supplied logo identity, exact supplied money formatting, semantic chart summaries, and no card numbers or unauthenticated financial payloads in SSR HTML/network requests.
- Exercise D3 charts through resize/container changes and verify SVG `viewBox`, labels, and text equivalents; do not test implementation-specific DOM mutation.
- Cover light/dark, reduced motion, unsupported animation APIs, loading/empty/error, SSR/hydration, and auth fail-closed states.
- Capture settled evidence after animations are disabled or completed. Prefer deterministic visual assertions first; add binary snapshots only if the project adopts that convention.

### Risks

- A route-level fixture could accidentally become an unauthenticated financial-data path; default all production and SSR data to unavailable until Better Auth ownership is complete.
- Replacing private shell markup can regress current consumer/browser tests; preserve public props, landmarks, callbacks, and active semantics while changing private layout classes.
- Chart semantics can become decorative-only; every visual must have readable labels, values, and non-color meaning.
- D3 and Iconoir can increase bundle size or introduce version/SSR issues; use scoped modules, provider defaults, and client-only behavior only where required.
- The reference is visual inspiration with no exact measurements; acceptance must use explicit composition criteria and side-by-side runtime evidence.
- Existing motion and theme behavior can make screenshots nondeterministic; settle or disable enhancement in evidence runs.
- Better Auth and Next migration may change route ownership; keep slices small and avoid speculative API/schema changes.

### Non-goals

- Implementing Better Auth, Prisma migrations, per-user ownership, provider persistence, stock/investment ingestion, or financial calculations.
- Exposing real financial data before the authenticated ownership boundary is complete.
- Replacing the supplied 2free brand assets or adding remote font dependencies.
- Rebuilding the entire design system or introducing a new routing architecture unrelated to this experience.
- Treating a color/token swap, package-only harness, or web-only duplicate as completion.

### Ready for Proposal

Yes. The proposal should explicitly scope a route-verified structural redesign, preserve the fail-closed Better Auth boundary and Next migration dependencies, require Iconoir and D3 decisions, define the four force-chained slices, and make mobile/desktop runtime evidence the acceptance gate.

## Result Contract

- **status:** `ready`
- **executive_summary:** The actual Next UI is an authentication message inside a desktop-sidebar-first shell, while the shared fixture remains table/card oriented; the archived change therefore verified recoloring and package semantics rather than reference-level route fidelity. Proceed with a mobile-first structural redesign using shared primitives, Iconoir, declarative D3 SVG charts, Spanish 2free branding, and route-level evidence, while preserving the Better Auth fail-closed boundary.
- **artifacts:** [`openspec/changes/mobile-first-finance-experience/exploration.md`]
- **next_recommended:** `sdd-propose`
- **risks:** Route/package mismatch; accidental unauthenticated data exposure; Better Auth/Next migration coupling; D3/Iconoir SSR and bundle decisions; visual-reference ambiguity; chart accessibility; screenshot nondeterminism.
- **skill_resolution:** `paths-injected` — loaded `/home/camir/.config/opencode/skills/sdd-explore/SKILL.md`, `/home/camir/.config/opencode/skills/cognitive-doc-design/SKILL.md`, and `/home/camir/.config/opencode/skills/chained-pr/SKILL.md` before task-specific exploration.
