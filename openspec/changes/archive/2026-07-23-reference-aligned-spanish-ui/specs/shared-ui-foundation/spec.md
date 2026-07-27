# Delta for Shared UI Foundation

## MODIFIED Requirements

### Requirement: Reference-aligned semantic foundation

The UI package MUST expose semantic tokens for warm rounded surfaces, typography, spacing, focus, status, light theme, and dark theme. Supplied logo assets MUST be available through the package boundary. Status and focus MUST remain understandable without color alone.
(Previously: The foundation exposed generic semantic tokens and supplied branding.)

#### Scenario: Theme and logo rendering
- GIVEN a consumer selects light or dark theme with supplied branding
- WHEN the foundation renders
- THEN tokens resolve to the selected theme, the supplied logo is visible, and content/focus remain readable

#### Scenario: Non-color state
- GIVEN a state is success, warning, empty, or error
- WHEN it is rendered in either theme
- THEN text, labels, icons, patterns, or semantic markup identify the state in addition to color

### Requirement: Local typography and fallback

Urbanist headings and Open Sans body text MUST use local licensed binaries when available, MUST NOT request a CDN, and MUST declare explicit readable fallback stacks when binaries are unavailable.
(Previously: Local Urbanist and Open Sans assets were required with fallbacks.)

#### Scenario: Offline fonts
- GIVEN the consumer has no network access
- WHEN branded text renders
- THEN no remote font request occurs and local fonts or declared fallbacks render readable layout

#### Scenario: Missing binaries
- GIVEN one or both font binaries cannot load
- WHEN typography initializes
- THEN the fallback stack renders without an exception or unusable overflow

### Requirement: Package-local presentation boundary

The package MUST keep aliases and imports within its source and MUST remain presentation-only: it MUST NOT own routes, storage, authentication, fetching, persistence, sync, finance arithmetic, card numbers, or backend behavior.
(Previously: The package-local boundary excluded routes, data ownership, and finance arithmetic.)

#### Scenario: Exact consumer boundary
- GIVEN a component receives typed data and navigation through props
- WHEN it renders
- THEN it presents supplied values and callbacks without mutating providers or adding persistence/backend behavior
