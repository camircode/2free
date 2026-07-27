# Delta for Responsive App Shell

## MODIFIED Requirements

### Requirement: Intentional responsive navigation

Navigation MUST expose semantic landmarks, names, keyboard operation, visible focus, and active-state semantics. On narrow viewports it MUST provide persistent thumb-reachable bottom navigation with safe-area spacing; on desktop it MUST form deliberate balanced columns without a permanent rail, accidental wrapping, or hidden essential actions.
(Previously: Desktop navigation could be arranged as navigation and content without requiring balanced columns or excluding a permanent sidebar.)

#### Scenario: Mobile bottom navigation

- GIVEN a viewport below the narrow-layout breakpoint
- WHEN the shell renders and a destination is activated
- THEN bottom navigation remains thumb reachable, respects the safe area, and does not obscure main content

#### Scenario: Desktop composition

- GIVEN a wide viewport
- WHEN the shell renders
- THEN context, insight, finance, and activity form stable balanced columns without a permanent rail or horizontal overflow

### Requirement: Stable SSR-safe shell output

The shell MUST render deterministic markup without browser globals during SSR and MUST avoid hydration mismatch when responsive, theme, or client-only enhancements initialize.
(Previously: The shell required SSR-safe deterministic output and hydration without structural mismatch.)

#### Scenario: Server render and hydration

- GIVEN the shell is rendered with no `window` or `document`
- WHEN the client hydrates at mobile or desktop width
- THEN hydration completes without browser-global errors or structural mismatch

#### Scenario: Overflow and safe areas

- GIVEN long Spanish labels and a device safe area
- WHEN the shell renders
- THEN `scrollWidth` equals `clientWidth` and essential controls remain visible and reachable
