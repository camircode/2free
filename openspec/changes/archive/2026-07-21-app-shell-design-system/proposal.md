# Proposal: Shared App Shell and Design System

## Intent

Define 2 Free's reusable React seam: visual language, accessible responsive shell, and fixture-backed finance surface, without coupling future consumers to routing, persistence, or backend behavior.

## Scope

### In Scope
- Create `packages/ui` with tokens, semantic themes, self-hosted Urbanist/Open Sans, and package-local `@/* -> src/*` alias.
- Provide accessible responsive shell/navigation and one fixture-backed finance dashboard using typed view models and exact-money interfaces.
- Add scoped `@gsap/react` `useGSAP` lifecycle cleanup, progressive browser View Transitions, reduced-motion handling, and a no-animation fallback.
- Add only the minimal React consumer/test harness for these contracts and workspace gates.

### Out of Scope
- Next.js/SSR product app, Astro landing implementation, Tauri/native code, SQLCipher, backend/API/auth/sync, notifications, market integrations, production data fetching, and complete finance screens.
- Reimplementing archived core/data-provider requirements; they remain view-model/fixture interfaces only.

## Capabilities

### New Capabilities
- `shared-ui-foundation`: Package boundary, tokens, themes, typography/assets, alias.
- `responsive-app-shell`: Accessible responsive shell/navigation.
- `finance-dashboard-fixture`: Responsive dashboard and accessible fixture states.
- `ui-motion-enhancement`: Scoped GSAP/View Transition enhancement and fallbacks.
- `ui-consumer-harness`: Minimal consumer and contract-test surface.

### Modified Capabilities
- None.

## Approach

Use the package-first slice: `packages/ui` owns tokens/assets and presentation; consumers supply navigation and typed view models. It owns no routes, storage, authentication, or fetching. Load licensed fonts locally with fallbacks. Scope and revert GSAP, feature-detect View Transitions, and preserve identical DOM/state behavior without motion.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `packages/ui/` | New | Package, shell, fixtures, motion, tests |
| `packages/ui/src/styles/`, `src/assets/` | New | Tokens, themes, logo/fonts |
| Workspace manifests/config | Modified | Dependencies, aliases, quality gates |
| Future `apps/web`, `apps/desktop`, `apps/landing` | Boundary only | No app implementation |

## Risks

| Risk | Likelihood | Mitigation |
|------|--------|------------|
| React/tooling or font assets expand the slice | Medium | Keep dependencies explicit; chain if the 800-line budget is exceeded |
| Motion or responsive data harms SSR/accessibility | Medium | Hydration-safe defaults, cleanup, text summaries, focus tests |
| UI duplicates domain/privacy logic | Low | Use typed view-models and existing core/provider contracts |

## Rollback Plan

Remove `packages/ui`, its harness, workspace wiring, and change-specific assets/config; existing core/provider/quality contracts remain unchanged.

## Dependencies

- React/test-rendering tooling and confirmed supplied/licensed Urbanist/Open Sans assets; no remote font/service dependency.

## Success Criteria

- [ ] `packages/ui` passes install, type, lint, format, and test commands.
- [ ] Fixture dashboard proves desktop/narrow layouts, accessible navigation, light/dark themes, and non-color data states.
- [ ] GSAP/View Transition cleanup is correct and reduced/unavailable motion produces the same result.
- [ ] No out-of-scope app, native, backend, persistence, auth, or production-fetching code is introduced.
