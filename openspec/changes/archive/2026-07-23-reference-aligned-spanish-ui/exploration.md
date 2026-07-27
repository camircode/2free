## Exploration: Reference-aligned Spanish finance dashboard UI

### Current State
The existing product surface is a shared React UI package rather than a complete rendered web route. `FinanceDashboard` currently emits a generic document flow with English copy (`Dashboard ready`, `Balance`, `Recent activity`), a balance panel, a trend/allocation table or compact list, and an activity list. `AppShell` provides a conventional desktop sidebar and a narrow horizontal navigation row. The current CSS uses warm brand colors and light/dark semantic tokens, but the structure remains bordered rectangular panels and a stretched shell; it does not implement the supplied reference's mobile-first finance composition.

The web app currently contains only a server entry and browser test scaffold; no route/layout/global web composition or screenshot harness was found. The shared package owns the rendered composition and exports its stylesheet. GSAP, `@gsap/react`, View Transition fallback logic, and reduced-motion capability detection already exist and have focused unit/browser coverage. The motion implementation is enhancement-only and SSR-safe.

The current typography declares Urbanist and Open Sans fallback stacks, but the branding test explicitly documents that licensed font binaries are absent and that no `src/assets/fonts` directory exists. The package includes an exact copy of `2free con fondi.svg`; root PNG/ICO/logo variants also exist. The current dashboard model exposes balance, trend/allocation data, activity, and exact money DTOs. No card numbers are required or present in this view model.

### Affected Areas
- `packages/ui/src/components/finance-dashboard.tsx` — replace the generic dashboard DOM and English labels with the reference-aligned Spanish information hierarchy, semantic cards, progress/allocation visuals, and state variants.
- `packages/ui/src/components/app-shell.tsx` — retain consumer-owned navigation semantics but redesign composition for a bottom mobile navigation and a polished, distinct desktop shell; preserve SSR-safe callbacks and active-state behavior.
- `packages/ui/src/models/dashboard.ts` — likely extend presentation data only if allocation/progress, greeting, or navigation summary cannot be derived from existing model data; do not add card-number or persistence concerns.
- `packages/ui/src/styles/tokens.css` — add the reference's warm off-white, peach/orange, olive/mint, terracotta, radius, spacing, shadow, and responsive layout tokens while preserving the established brand palette.
- `packages/ui/src/styles/themes.css` — define dark equivalents with sufficient contrast and preserve semantic status behavior rather than merely inverting light colors.
- `packages/ui/src/styles/dashboard.css` — substantial replacement: large rounded device/card shapes, compact airy hierarchy, pills, visual bars, editorial spacing, mobile-first grid, and intentional desktop adaptation.
- `packages/ui/src/styles/app-shell.css` — substantial replacement: mobile bottom navigation, desktop navigation/header treatment, safe-area handling, and non-stretched desktop proportions.
- `packages/ui/src/styles/typography.css` and `packages/ui/src/assets/fonts/` — implement genuinely self-hosted Urbanist/Open Sans assets and `@font-face` declarations if licensed binaries are supplied; current fallback-only behavior is insufficient for the fixed requirement.
- `packages/ui/src/styles/index.css` — include any new component/font/motion styles without changing the package stylesheet export boundary.
- `packages/ui/src/assets/2free-con-fondi.svg` and logo consumers — use the supplied logo asset at appropriate shell/header sizes; retain the existing exact-copy branding invariant.
- `packages/ui/test/app-shell.browser.test.tsx` — replace layout assertions that only distinguish grid/block with visual/semantic responsive assertions, navigation placement, Spanish copy, and dark-mode behavior.
- `packages/ui/test/dashboard.test.tsx`, `packages/ui/test/app-shell.test.tsx`, `packages/ui/test/consumer-harness.test.tsx` — update structural expectations while retaining consumer composition, accessibility, SSR, and money precision coverage.
- New package/browser visual harness or screenshot fixtures — add deterministic viewport screenshots for mobile and desktop, with light/dark and reduced-motion variants; no current screenshot harness was found.
- `apps/web/src/server.ts` and future web route composition — wire the shared shell/dashboard into a real browser-rendered route only if this change owns that integration; otherwise keep the redesign package-level and state the route gap explicitly.
- `openspec/changes/runnable-product-foundation/*` — retain unchanged; its active non-UI tasks and approved review binding are dependencies, not an edit target.

### What Must Be Replaced vs Retained
| Replace | Retain |
|---|---|
| Generic English dashboard markup and status copy | `DashboardState` loading/empty/error/ready contract, with Spanish presentation copy and consumer-supplied error text policy |
| Rectangular bordered dashboard panels and table-first hierarchy | Exact money DTOs, `MoneyDisplay`, semantic headings, accessible table/list fallback where data density requires it |
| Mobile horizontal navigation row | Consumer-owned navigation items, callback, active semantics, keyboard operation, and SSR-safe markup |
| Stretched desktop shell and narrow CSS breakpoint behavior | Package-level stylesheet export and responsive semantic landmarks |
| Current token set where it cannot express reference surfaces, semantic accents, or large radii | Existing named brand colors, light/dark token architecture, focus/status semantics |
| Fallback-only typography if licensed files are available | Urbanist headings and Open Sans body intent, with local fallback if licensing/assets remain unavailable |
| Table-only trend/allocation presentation | Existing trend/allocation model; add bars/progress as a visual layer, not as a replacement for accessible values |
| No screenshot evidence | Existing Vitest/Playwright browser capability and motion tests |

### Approaches
1. **Shared-package structural redesign with a thin route harness** — redesign `@2free/ui` as the source of truth, add a minimal browser composition/screenshot harness, and keep domain data and navigation consumer-owned.
   - Pros: fixes the actual reusable rendered surface; aligns with package architecture; supports mobile and desktop evidence; avoids backend/Prisma scope.
   - Cons: requires broad component/CSS/test changes and may expose the current web route gap.
   - Effort: High

2. **Web-only page wrapper around the existing components** — leave shared components mostly intact and compose a reference-like page in `apps/web`.
   - Pros: smaller package change and faster isolated proof.
   - Cons: duplicates design behavior, leaves consumers with the failed generic UI, weakens shared UI boundaries, and cannot honestly satisfy a shared visual redesign.
   - Effort: Medium

### Recommendation
Choose the shared-package structural redesign with a thin route/screenshot harness. The user correction makes this a structural redesign, so a palette or web-only wrapper would preserve the root failure. Keep Prisma and ORM work out of scope: the current dashboard already has presentation data contracts, and the reference concerns composition, visual hierarchy, navigation, responsive behavior, and motion. Extend the model only for genuinely visible allocation/progress data that cannot be computed from supplied values. Deliver as a feature-branch chain, starting with visual primitives/tokens and typography, then shell/navigation, then dashboard composition, then browser visual evidence and hardening.

### Visual Acceptance Evidence Needed
- Deterministic screenshots at a narrow mobile viewport and at least two desktop widths, showing intentional reflow rather than a scaled mobile canvas.
- Light and dark screenshots proving warm surfaces, semantic olive/mint/terracotta accents, peach/orange highlight cards, readable contrast, and preserved brand palette.
- Mobile screenshot proving bottom navigation, safe-area spacing, pill controls, large rounded card/device shapes, allocation/progress bars, and no horizontal overflow.
- Desktop screenshot proving a composed multi-column/dashboard layout with balanced max width, not a stretched mobile stack.
- Browser assertions for Spanish UI strings, navigation active semantics, keyboard access, no card-number requests/rendering, and deterministic loading/empty/error states.
- SSR/hydration proof with no browser globals during render.
- Reduced-motion screenshot/assertion proving identical final DOM/state with no GSAP/View Transition invocation; unsupported-browser fallback proof.
- Font-loading evidence proving local Urbanist/Open Sans files and no remote font dependency, or an explicitly approved fallback decision if licensed files are unavailable.

### Responsive, Dark, and Reduced-motion Requirements
- **Responsive:** mobile-first composition; bottom navigation on narrow screens; desktop navigation and a deliberate multi-column layout at wide widths; preserve reachable essential actions, focus visibility, safe-area insets, and no overflow.
- **Dark mode:** use explicit dark semantic tokens for every new surface/accent/text/border/shadow state; verify contrast and avoid relying on color alone for status/allocation meaning.
- **Reduced motion:** call existing capability gates before GSAP/View Transitions, keep initial SSR markup stable, and make the no-animation path produce the same committed result. All decorative motion must be optional.
- **Fallback:** unsupported View Transitions, failed enhancement, absent browser globals, and reduced motion must remain functional and visually coherent without animation.

### Autonomous Chained Slice Recommendation
Use `feature-branch-chain` with four bounded slices, each independently reviewable and below the 800-line review budget:
1. **Foundation slice:** tokens, self-hosted typography, logo treatment, reusable visual primitives, light/dark foundations, and baseline screenshot harness.
2. **Shell slice:** responsive desktop/mobile shell, bottom navigation, safe-area behavior, and accessibility/browser tests.
3. **Dashboard slice:** Spanish finance hierarchy, peach highlight cards, allocation/progress visuals, activity treatments, and loading/empty/error states.
4. **Evidence slice:** GSAP/View Transition integration where useful, reduced-motion/SSR fallback tests, responsive light/dark screenshots, and visual hardening.

Do not edit `runnable-product-foundation` artifacts or introduce Prisma work unless implementation discovers a missing persisted field that is strictly necessary for the rendered reference; default to fixture/application data.

### Risks
- The supplied reference image is visual inspiration rather than a machine-readable specification; acceptance must rely on explicit screenshot criteria and reviewable visual deltas.
- The current web package is not a complete route consumer, so browser proof may require a harness or a small route composition before end-to-end evidence is meaningful.
- Self-hosted Urbanist/Open Sans binaries are absent; licensing and asset availability can block the fixed typography requirement.
- Extending `DashboardModel` risks coupling visual presentation to backend/ORM shape; keep additions presentation-oriented and derived where possible.
- Replacing navigation CSS may break existing browser assertions or consumers that assume the current class/layout details; preserve public props and semantics while treating private class structure as replaceable.
- Large rounded cards, shadows, and accent colors can reduce dense-data accessibility if values are only visual; retain semantic text/table/list representations.
- Motion enhancement can create hydration or screenshot nondeterminism if it is not disabled or settled in visual tests.

### Ready for Proposal
Yes. The proposal should explicitly call this a structural replacement of the shared UI composition, define the four chained slices, require screenshot-based acceptance across mobile/desktop and light/dark modes, and keep Prisma/backend changes out of scope unless a concrete data gap is proven.

## Result Contract

- **status:** ready
- **executive_summary:** The current shared UI is structurally unlike the supplied reference: it is English, table/panel-first, and uses a desktop sidebar with a narrow horizontal mobile row. Redesign `@2free/ui` rather than applying a palette tweak or adding a web-only wrapper. Preserve consumer-owned data/navigation, exact money handling, existing motion fallbacks, and brand assets; add Spanish copy, reference-aligned responsive composition, local fonts, dark-mode semantics, and screenshot evidence.
- **artifacts:** `openspec/changes/reference-aligned-spanish-ui/exploration.md`
- **next_recommended:** Proceed to proposal, then design/spec/tasks using four feature-branch-chain slices: foundation, shell, dashboard, and evidence/hardening.
- **risks:** Missing real web route composition; absent self-hosted font binaries; visual-reference ambiguity; regression risk from replacing private layout classes; screenshot nondeterminism around motion; accidental coupling to Prisma/backend data.
- **skill_resolution:** Loaded `/home/camir/.config/opencode/skills/sdd-explore/SKILL.md` and `/home/camir/.config/opencode/skills/cognitive-doc-design/SKILL.md`; artifacts are English technical documentation, while the future product UI copy is required to be neutral Spanish.
