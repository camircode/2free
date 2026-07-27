# UI Consumer Harness Specification

## Purpose

Provide the smallest React consumer and contract-test surface that proves shared UI reuse and workspace quality without becoming a product application.

## Requirements

### Requirement: Minimal reference-aligned consumer

The harness MUST consume public UI imports, supply Spanish shell navigation and typed fixture models, and prove mobile/desktop light/dark compositions without becoming an application. It MUST NOT add routes, persistence, backend, authentication, sync, notifications, integrations, native code, or full finance screens.

#### Scenario: Consumer composition

- GIVEN the harness supplies shell and dashboard inputs
- WHEN it renders the shared UI
- THEN public components produce the Spanish reference-aligned surface while the harness owns only composition and fixtures

### Requirement: Deterministic visual and contract evidence

The harness MUST provide a deterministic screenshot matrix of exactly eight full Cartesian variants: narrow mobile and standard desktop viewport × light and dark theme × motion-enabled and reduced-motion mode. It MUST test tokens/assets, Spanish copy, navigation, dashboard states, accessibility, exact Money/no-card-number behavior, motion fallbacks, SSR safety, and no-overflow. An additional 1440px desktop capture MAY be recorded as a separate responsive proof and MUST NOT count toward the eight variants.

#### Scenario: Eight screenshot variants

- GIVEN fixed fixture data and settled rendering
- WHEN these captures are taken: mobile-light-motion, mobile-light-reduced, mobile-dark-motion, mobile-dark-reduced, desktop-light-motion, desktop-light-reduced, desktop-dark-motion, and desktop-dark-reduced
- THEN exactly those eight full variants are reproducible and contain the expected final state without animation variance

#### Scenario: Additional desktop responsive proof

- GIVEN the eight required variants have been captured
- WHEN a 1440px desktop capture is taken
- THEN it verifies responsive composition separately and is excluded from the eight-variant count

#### Scenario: Focused contract run

- GIVEN the package and harness are installed without external services
- WHEN focused UI tests run
- THEN each listed contract has a deterministic pass or an actionable failure

### Requirement: Workspace quality commands

The workspace MUST document and execute deterministic install, format, lint, type-check, and test commands for the UI package; failures MUST exit non-zero and identify the failing check.

#### Scenario: Clean quality validation

- GIVEN supported Node.js and pnpm versions on a clean checkout
- WHEN `pnpm install`, `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, and `pnpm test` run
- THEN installation and every check complete successfully

#### Scenario: Quality failure

- GIVEN a formatting, lint, type, or test violation
- WHEN its corresponding command runs
- THEN it exits non-zero and identifies the failing check
