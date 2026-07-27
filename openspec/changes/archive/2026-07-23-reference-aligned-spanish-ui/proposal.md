# Proposal: Reference-Aligned Spanish Finance UI

## Intent

Replace the failed generic shared UI with a structural redesign aligned to the supplied finance-dashboard reference. Make `@2free/ui` a warm, rounded, mobile-first finance surface with neutral Spanish product copy while preserving domain, privacy, and accessibility boundaries.

## Scope

### In Scope
- Four feature-branch-chain slices below the 800-line review budget: foundation, shell, dashboard, and evidence/hardening.
- Mobile-first warm surfaces, bottom navigation, deliberate desktop layout, semantic light/dark brand palette, logo assets, rounded cards, and allocation/progress visuals.
- Spanish UI; self-hosted Urbanist headings/Open Sans body when licensed files exist, with a non-CDN fallback otherwise.
- GSAP/@gsap/react and View Transitions as progressive enhancement with reduced-motion, SSR, unsupported-browser, and failure fallbacks.
- Deterministic screenshots for mobile/desktop, light/dark, and reduced-motion variants.

### Out of Scope
- Prisma, backend, persistence, authentication, sync, or new fields unless a concrete visual-data gap is proven.
- Card numbers, Money/domain-contract changes, consumer-owned data/navigation changes, or edits to `runnable-product-foundation` artifacts.

## Capabilities

### New Capabilities
- None; this amends the archived `app-shell-design-system` capability set.

### Modified Capabilities
- `shared-ui-foundation`, `responsive-app-shell`, `finance-dashboard-fixture`, `ui-motion-enhancement`, and `ui-consumer-harness`: update reference-aligned tokens/assets, shell behavior, Spanish dashboard states, motion fallbacks, and screenshot/browser evidence.

`runnable-product-foundation` is a dependency; its artifacts remain unchanged.

## Approach

Keep `@2free/ui` as the presentation source of truth and add a route/screenshot harness. Preserve exact Money DTOs, `MoneyDisplay`, semantic landmarks, data-provider boundaries, SSR-safe rendering, accessible text/table fallbacks, and the no-card-number rule. Deliver in order: tokens/fonts/logo; shell/navigation; dashboard composition; motion, screenshots, and hardening.

## Affected Areas

| Area | Impact | Description |
|---|---|---|
| `packages/ui/src/components`, `src/styles`, `src/assets` | Modified | Shared Spanish composition, shell, themes, fonts, and branding. |
| `packages/ui/test`, browser/screenshot harness | Modified/New | Accessibility, SSR, motion fallback, and visual evidence. |
| `apps/web` | Boundary | Minimal route composition only if needed for evidence. |

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Missing fonts or route harness | Med | Approved local fallback; keep harness thin. |
| Visual or motion nondeterminism | Med | Fixed screenshot matrix and settled states. |
| Data/accessibility regression | Low | Preserve contracts and semantic value fallbacks. |

## Rollback Plan

Revert the four slices independently, restoring prior components/styles/tests and removing only change-specific assets and harness wiring. No backend or active foundation artifact requires rollback.

## Dependencies

- Supplied reference/logo assets, font files, and motion capability gates.

## Success Criteria

- [ ] Screenshots prove the Spanish reference-aligned UI at mobile and desktop widths in light and dark themes.
- [ ] Reduced-motion and unsupported-browser paths produce the same usable final state without animation.
- [ ] Accessibility, SSR safety, exact Money behavior, provider boundaries, and card-number prohibition remain verified.
