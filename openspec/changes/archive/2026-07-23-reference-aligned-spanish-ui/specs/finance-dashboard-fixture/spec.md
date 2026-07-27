# Delta for Finance Dashboard Fixture

## MODIFIED Requirements

### Requirement: Exact-money, private view-model boundary

The dashboard MUST consume typed view models preserving exact Money and currency meaning and MUST display supplied formatted values through the existing `MoneyDisplay` presentation contract, preserving its public inputs and rendered formatting semantics. It MUST NOT recalculate, convert to floating point, persist, fetch, expose card numbers, or alter domain/provider contracts.
(Previously: Exact money and privacy-sensitive handling were protected, but card-number preservation was not explicit.)

#### Scenario: Exact display
- GIVEN a model supplies an exact amount, currency, and formatted value
- WHEN balance or activity renders
- THEN `MoneyDisplay` presents the supplied value and currency context unchanged, with no card number displayed

#### Scenario: Model update
- GIVEN a consumer supplies a new view model
- WHEN the dashboard rerenders
- THEN only presentation changes; no domain operation, provider mutation, or sensitive-data expansion occurs

### Requirement: Reference-aligned Spanish dashboard states

The fixture MUST use neutral Spanish copy and include a heading, balance/summary cards, progress/allocation visualization, recent activity, and explicit loading, empty, error, and populated states. It MUST support readable mobile and desktop compositions.
(Previously: The fixture required generic summary, trend/allocation data, and activity states.)

#### Scenario: Populated reference state
- GIVEN populated fixture data at mobile or desktop width
- WHEN the dashboard renders
- THEN cards, progress/allocation, and activity appear in a stable composition with readable Spanish labels

#### Scenario: Non-populated state
- GIVEN loading, empty, or error data
- WHEN the dashboard renders
- THEN a neutral Spanish explanation and an appropriate non-color semantic state are visible

### Requirement: Accessible data communication

Dashboard values MUST have accessible labels and text summaries; visual progress, allocation, status, and activity MUST NOT rely on color or animation alone. Where allocation or activity requires tabular interpretation, the fixture MUST expose a semantic table or a clearly defined equivalent structured-data fallback with programmatically associated headers, labels, and values. The fixture MUST NOT add budgets, investments, account management, full finance screens, backend, sync, notifications, or integrations.
(Previously: Accessible summaries and fixture scope were required.)

#### Scenario: Equivalent text
- GIVEN a user cannot perceive a chart, color, or animation
- WHEN they inspect the dashboard
- THEN labels and text communicate the same essential values and state

#### Scenario: Structured allocation and activity data
- GIVEN a user needs to compare allocation or activity values non-visually
- WHEN they inspect the dashboard data
- THEN a semantic table or defined equivalent structured-data fallback exposes associated labels, headers, and values

#### Scenario: No-overflow layout
- GIVEN the smallest supported mobile viewport
- WHEN long Spanish labels and values render
- THEN content remains readable without horizontal scrolling or clipped essential information
