# Delta for Finance Dashboard Fixture

## MODIFIED Requirements

### Requirement: Reference-aligned Spanish dashboard states

The fixture MUST use Spanish 2free-branded copy and include context, insight, stacked finance/activity cards, charts, and explicit loading, empty, error, and unavailable states. It MUST support mobile-first hierarchy and deliberate desktop columns while remaining synthetic and presentation-only.
(Previously: The fixture required Spanish heading, balance/summary cards, progress/allocation visualization, activity, and loading, empty, error, and populated states.)

#### Scenario: Populated responsive state

- GIVEN populated synthetic fixture data at mobile or desktop width
- WHEN the dashboard renders
- THEN the mobile hierarchy stacks context, insight, finance, and activity, while desktop uses balanced columns without a permanent rail

#### Scenario: Safe non-populated states

- GIVEN loading, empty, error, or unavailable data
- WHEN the dashboard renders
- THEN a Spanish explanation and non-color semantic state appear without invented or real financial payloads

### Requirement: Accessible data communication

Dashboard values MUST have accessible labels and Spanish text summaries; visual status, allocation, activity, and charts MUST NOT rely on color or animation alone. The fixture MUST expose structured equivalents and MUST preserve no-overflow behavior.
(Previously: Allocation and activity required semantic structured-data fallbacks and non-color communication.)

#### Scenario: Equivalent text

- GIVEN a user cannot perceive a visual
- WHEN they inspect the dashboard
- THEN text communicates the same essential values and state

#### Scenario: No-overflow layout

- GIVEN the smallest supported mobile viewport and long Spanish content
- WHEN the dashboard renders
- THEN no essential information is clipped or horizontally scrolled
