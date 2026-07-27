# Delta for UI Consumer Harness

## MODIFIED Requirements

### Requirement: Deterministic visual and contract evidence

The harness MUST provide deterministic evidence separately from actual Next-route proof, covering exactly eight mobile/desktop × light/dark × motion/reduced-motion variants plus optional desktop responsive proof. Evidence MUST include named controls, text equivalents, safe states, SSR/hydration safety, contrast/focus, and no-overflow.
(Previously: The harness provided eight variants and package contracts without requiring explicit separation from Next-route acceptance.)

#### Scenario: Eight variants

- GIVEN fixed synthetic fixtures and settled rendering
- WHEN the eight defined viewport/theme/motion captures are taken
- THEN exactly those captures reproduce final state without animation variance and are labeled harness evidence

#### Scenario: Deterministic runtime matrix

- GIVEN mobile and desktop runtimes with safe, loading, empty, error, and unavailable fixtures
- WHEN focused contracts run
- THEN each state, SSR/hydration check, and accessibility/overflow assertion produces a deterministic pass or actionable failure

### Requirement: Minimal reference-aligned consumer

The harness MUST consume public UI imports and Spanish 2free composition while remaining presentation-only; it MUST NOT add authentication, persistence, ingestion, financial calculations, or network financial payloads.
(Previously: The harness excluded application behavior, backend, authentication, persistence, and full finance screens.)

#### Scenario: Consumer composition

- GIVEN the harness supplies typed synthetic models and shell navigation
- WHEN it renders
- THEN it proves shared UI reuse without claiming actual Next-route acceptance or exposing finance payloads
