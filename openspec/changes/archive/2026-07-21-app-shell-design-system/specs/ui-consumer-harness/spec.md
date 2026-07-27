# UI Consumer Harness Specification

## Purpose

Provide the smallest React consumer and contract-test surface that proves shared UI reuse and workspace quality without becoming a product application.

## Requirements

### Requirement: Minimal consumer reuse

The harness MUST consume the package through its public presentation boundary, supply navigation and typed fixture view models, and MUST NOT add application routes, persistence, backend, authentication, sync, notifications, integrations, native code, or full finance screens.

#### Scenario: Consumer contract

- GIVEN the harness supplies shell and dashboard inputs
- WHEN it renders the shared UI
- THEN the shared components render through public imports and the harness owns only composition and fixtures

#### Scenario: Reuse boundary inspection

- GIVEN a future web, desktop, or landing consumer is considered
- WHEN dependencies are inspected
- THEN app navigation/dashboard behavior is reusable only by React consumers, while landing reuse is limited to tokens and logo assets

### Requirement: Contract coverage

The harness MUST test semantic tokens and themes, logo/font fallback, keyboard and responsive navigation, dashboard states and accessible data summaries, exact-money display boundaries, motion cleanup, reduced-motion and View Transition fallback, and SSR/hydration-safe rendering.

#### Scenario: Focused contract run

- GIVEN the UI package and harness are installed
- WHEN focused UI tests run
- THEN each listed contract has a deterministic pass or an actionable failure

### Requirement: Workspace quality commands

The workspace MUST document and execute deterministic install, format check, lint, type check, and test commands for the UI package, and the automated gate MUST run the same checks without external services.

#### Scenario: Clean quality validation

- GIVEN supported Node.js and pnpm versions on a clean checkout
- WHEN `pnpm install`, `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, and `pnpm test` run
- THEN installation and every check complete successfully

#### Scenario: Quality failure

- GIVEN a formatting, lint, type, or test violation
- WHEN its corresponding command runs
- THEN it exits non-zero and identifies the failing check
