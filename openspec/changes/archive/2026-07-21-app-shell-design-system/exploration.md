## Exploration: Shared React app shell and design system

### Current State

The repository now contains only the completed contract foundation: a pinned pnpm/TypeScript workspace, ESLint/Prettier/Vitest quality gates, `@2free/core`, `@2free/data-provider`, package-local `@/* -> src/*` aliases, exact-money/privacy contracts, and portable in-memory data behavior. There are no `apps/`, React entry points, UI packages, browser runtime, SSR framework, Tauri project, CSS system, font files, or UI tests. The root contains supplied logo artwork, including `2free con fondi.svg`, whose observed palette includes warm cream (`#F9EDDE`/`#FBF7EC`), terracotta red (`#BA402D`/`#B73322`), and sage green (`#B2C693`). The archived bootstrap explicitly deferred GSAP, View Transitions, and all shell code.

The first UI change should therefore establish a reusable presentation seam rather than pretend that a full finance application already exists. A small React UI package can expose tokens, primitives, shell/navigation composition, motion utilities, and a fixture-backed representative dashboard. It should consume `@2free/core`/provider contracts through typed view models, never own financial rules or persistence, and remain usable by future web, Tauri, and other React surfaces. Astro landing should share brand tokens/assets only; it should not import app navigation or dashboard behavior.

### Affected Areas

- `packages/ui/` — new shared React package for tokens, accessible primitives, shell composition, dashboard fixture/view models, and motion boundaries.
- `packages/ui/src/styles/` — CSS custom properties for the 2 Free palette, semantic light/dark themes, typography, spacing, responsive layout, and reduced-motion policy.
- `packages/ui/src/assets/` or a documented asset boundary — package the supplied logo without duplicating or coupling it to a specific app bundler.
- `packages/ui/src/motion/` — `@gsap/react` `useGSAP` helpers with a scoped root ref, dependency-aware cleanup, and no-animation fallback; View Transition capability detection and progressive enhancement.
- `packages/ui/test/` — component/contract tests for accessibility semantics, theme behavior, responsive data states, reduced motion, unavailable View Transitions, and GSAP cleanup.
- `packages/ui/package.json`, `tsconfig.json`, test/bundler config — workspace dependency declarations and the established package-local `@/* -> src/*` alias convention.
- `apps/web/` or a narrowly scoped shell harness — future consumer/SSR integration point; do not create a full web product in this change.
- `apps/desktop/` (future Tauri) — reuse boundary to preserve browser-independent React UI; no Tauri commands or native persistence in this slice.
- `apps/landing/` (future Astro) — share generated/static tokens and logo assets only, not React app-shell state or finance screens.
- `pnpm-workspace.yaml`, root scripts, lockfile, and CI — include the UI package in deterministic install, typecheck, lint, test, and formatting gates.

### Approaches

1. **Package-first shared UI slice (recommended)** — create `packages/ui` with tokens, a small accessible primitive set, `AppShell`/navigation, and one fixture-backed dashboard surface; validate it through a minimal React test harness rather than a complete app.
   - Pros: smallest reusable seam; preserves package-local aliases and domain/provider boundaries; directly testable; supports later Next.js, Tauri, and other React consumers.
   - Cons: requires choosing a React/test DOM toolchain before a visible app exists; SSR integration remains a follow-up.
   - Effort: Medium

2. **Next.js vertical slice** — create a web app first and extract shared components after the dashboard is visible.
   - Pros: fastest browser/SSR feedback and realistic routing.
   - Cons: couples the first UI contract to Next.js; risks app-specific imports, browser-only motion, and rework for Tauri; larger review surface.
   - Effort: High

3. **Design-token-only foundation** — define palette, typography, logo, themes, and CSS primitives without a React shell or dashboard.
   - Pros: lowest implementation risk and easy Astro sharing.
   - Cons: does not prove navigation, finance-data responsiveness, accessibility, SSR, or motion boundaries; postpones the most important composition decisions.
   - Effort: Low

### Recommendation

Choose the package-first shared UI slice. Add only the React dependencies needed by `packages/ui`, keep `@/*` mapped to that package's own `src/*`, and use explicit `@2free/core`/`@2free/data-provider` imports across package boundaries. Define semantic tokens rather than scattering raw palette values: light and dark themes must preserve contrast, focus visibility, and status meaning. Self-host Urbanist for display/brand and Open Sans for readable data/UI text; the change should include font-face loading and fallback stacks, but only when the actual font files/licensing/source are supplied or explicitly added as assets.

The representative surface should be a static/fixture-driven dashboard: shell navigation, page heading, a balance/summary region, one responsive trend or allocation visualization/table, and a recent-activity list using exact-money formatting supplied by a view-model boundary. It must demonstrate desktop/sidebar and narrow/mobile navigation/data layouts without implementing transactions, budgets, investments, account management, or backend loading.

Motion is enhancement, never a dependency of correctness. `useGSAP` should receive a shell/container ref and perform all selector work inside that scope; cleanup must revert on unmount and declared state changes. Route/state transitions may call `document.startViewTransition` only after feature detection, and both GSAP and View Transitions must be bypassed for `prefers-reduced-motion` or unsupported environments. The same DOM/state result must be produced with animation disabled. Avoid reading `window`, `document`, or media queries during SSR render; use client effects or hydration-safe defaults to prevent markup mismatch.

The package should expose presentational components and token/style assets, not route ownership, storage, authentication, Tauri commands, or network fetching. A future app supplies navigation state and data. Landing may consume the brand token subset and logo, while app-only interaction tokens/components remain private to the React UI package.

### Risks

- Adding a React test/rendering stack can expand the workspace dependency and lockfile footprint; keep the first package dependency set explicit and test only the supported browser/SSR contracts.
- Self-hosted fonts need confirmed files, licensing, preload strategy, and fallback metrics; missing assets should not silently become remote font dependencies.
- Financial UI can accidentally reimplement money arithmetic or expose prohibited metadata; view models must format existing exact values and preserve the privacy contract.
- GSAP selectors, layout effects, or `window` access can break SSR/hydration or leak animations across component instances unless all work is scoped and cleaned up.
- View Transition support is uneven and its API can reject or be unavailable; feature detection, reduced-motion handling, and a synchronous fallback are mandatory.
- Responsive tables/charts may become unreadable or misleading on small screens; define a compact list/card alternative and accessible text summaries rather than relying on color or animation.
- Reusing the entire app shell in Astro would introduce unnecessary React/runtime coupling; share tokens/assets at a deliberate boundary instead.
- The slice must not drift into backend, SQLCipher, sync, notifications, market integrations, or complete domain screens; those remain separate changes.

### Explicit Deferrals

Backend/API, authentication, SQLCipher/encrypted storage, sync/conflict handling, notifications, market integrations (including OpenBB/Banxico), production data fetching, full account/transaction/budget/investment screens, mobile-native shell code, and landing-page implementation are out of scope.

### Ready for Proposal

Yes. The proposal should approve one reviewable `packages/ui` slice plus only the minimum consumer/test harness needed to prove browser, SSR/hydration, Tauri reuse, responsive data presentation, accessibility, themes, and motion fallbacks. It should forecast chained work if the React/tooling setup and UI implementation exceed the 800-line review budget.
