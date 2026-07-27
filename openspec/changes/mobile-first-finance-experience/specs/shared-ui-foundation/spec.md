# Delta for Shared UI Foundation

## ADDED Requirements

### Requirement: Iconoir accessible controls

The foundation MUST use `iconoir-react` for interface icons. Every icon-only control MUST have an accessible name and an associated assistive label, and icons MUST NOT be the sole non-text state signal.

#### Scenario: Named icon control

- GIVEN an icon-only action is rendered
- WHEN assistive technology inspects it
- THEN it has a programmatic accessible name and visible behavior remains keyboard operable

#### Scenario: Icon failure or unavailable state

- GIVEN an icon cannot render
- WHEN the control or state is displayed
- THEN its accessible text and semantic state remain available without relying on the icon

### Requirement: Reduced-motion, theme, focus, and contrast parity

The foundation MUST support deterministic light and dark themes, visible keyboard focus, sufficient contrast, and reduced-motion behavior that preserves final-state parity.

#### Scenario: Reduced motion

- GIVEN reduced motion is requested
- WHEN an animated transition would occur
- THEN motion is suppressed or minimized and the same final content and state are shown

#### Scenario: Theme and focus

- GIVEN either supported theme and keyboard navigation
- WHEN branded content and controls render
- THEN Spanish 2free branding, focus indicators, and contrast remain understandable without color alone
