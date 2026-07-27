# Responsive App Shell Specification

## Purpose

Provide an accessible, consumer-composed shell and navigation for future React web and desktop surfaces.

## Requirements

### Requirement: Consumer-composed shell

The shell MUST accept navigation state and actions from its consumer and MUST NOT own routes, authentication, persistence, network fetching, or native commands.

#### Scenario: Navigation composition

- GIVEN a consumer supplies navigation items, current location, and an activation callback
- WHEN a user activates an item
- THEN the shell identifies the active item and invokes the supplied callback without changing route ownership

#### Scenario: Reuse boundary

- GIVEN a future web or desktop React consumer
- WHEN it supplies equivalent shell inputs
- THEN the same presentation contract works without backend, Tauri, or browser-app coupling

### Requirement: Accessible responsive navigation

Navigation MUST expose semantic landmarks, accessible names, keyboard operation, visible focus, and active-state semantics. It MUST present a persistent desktop navigation mode and an equivalent narrow/mobile mode without hiding essential actions.

#### Scenario: Keyboard navigation

- GIVEN a keyboard user enters the navigation
- WHEN they traverse and activate items
- THEN focus order is deterministic, focus is visible, and the selected destination is announced semantically

#### Scenario: Narrow viewport

- GIVEN the viewport cannot support the desktop navigation layout
- WHEN the shell renders
- THEN navigation remains operable through the narrow layout and the main content remains reachable

### Requirement: Stable SSR-safe shell output

The shell MUST render deterministic markup without reading browser globals during render and MUST avoid hydration mismatch when responsive or client-only enhancements initialize.

#### Scenario: Server render and hydration

- GIVEN the shell is rendered in an SSR-like environment with no `window` or `document`
- WHEN the client hydrates it
- THEN initial markup remains valid and hydration completes without browser-global errors or structural mismatch
