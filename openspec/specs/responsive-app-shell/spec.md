# Responsive App Shell Specification

## Purpose

Provide an accessible, consumer-composed shell and navigation for future React web and desktop surfaces.

## Requirements

### Requirement: Consumer-composed Spanish shell

The shell MUST accept navigation state and actions from its consumer, MUST use neutral Spanish labels supplied by the composition, and MUST NOT own routes, authentication, persistence, network fetching, or native commands.

#### Scenario: Navigation composition

- GIVEN a consumer supplies Spanish navigation items, current location, and an activation callback
- WHEN a user activates an item
- THEN the shell identifies the active item and invokes the supplied callback without owning routing

#### Scenario: Reuse boundary

- GIVEN a web or desktop React consumer supplies equivalent inputs
- WHEN the shell renders
- THEN it remains reusable without backend, Tauri, or browser-app coupling

### Requirement: Intentional responsive navigation

Navigation MUST expose semantic landmarks, names, keyboard operation, visible focus, and active-state semantics. On narrow viewports it MUST provide a persistent bottom navigation; on desktop it MUST provide an intentional composition with navigation and content arranged without accidental wrapping or hidden essential actions.

#### Scenario: Mobile bottom navigation

- GIVEN a viewport below the narrow-layout breakpoint
- WHEN the shell renders
- THEN the bottom navigation remains reachable, its destinations are operable, and main content is not obscured

#### Scenario: Desktop composition

- GIVEN a wide viewport
- WHEN the shell renders
- THEN navigation, header, and main content form a stable readable composition with no horizontal overflow

### Requirement: Stable SSR-safe shell output

The shell MUST render deterministic markup without browser globals during SSR and MUST avoid hydration mismatch when responsive, theme, or client-only enhancements initialize.

#### Scenario: Server render and hydration

- GIVEN the shell is rendered in an SSR-like environment with no `window` or `document`
- WHEN the client hydrates it
- THEN initial markup remains valid and hydration completes without browser-global errors or structural mismatch
