# Delta for Finance Dashboard Fixture

## MODIFIED Requirements

### Requirement: Exact-money, private view-model boundary

The dashboard MUST consume typed view models preserving exact Money and currency meaning and MUST display supplied formatted values through the existing `MoneyDisplay` presentation contract, preserving its public inputs and rendered formatting semantics. It MUST NOT recalculate, convert to floating point, persist, fetch, expose card numbers, or alter domain/provider contracts.
(Previously: The fixture displayed exact supplied Money values without product workflows.)

#### Scenario: Exact display
- GIVEN a model supplies an exact amount, currency, and formatted value
- WHEN balance or activity renders
- THEN `MoneyDisplay` presents the supplied value and currency context unchanged, with no card number displayed

#### Scenario: Model update
- GIVEN a consumer supplies a new view model
- WHEN the dashboard rerenders
- THEN only presentation changes; no domain operation, provider mutation, or sensitive-data expansion occurs

### Requirement: Truthful dashboard mapping and states

The fixture MUST use neutral Spanish copy and include heading, summary cards, allocation/progress, recent activity, and loading, empty, error, and populated states. API totals MUST be labeled as aggregates or allocations, transactions MUST be labeled as activity, and balance MUST be explicitly “No disponible” or “Configuración requerida” when no real balance exists. It MUST support readable mobile and desktop compositions.
(Previously: The fixture presented generic populated and non-populated dashboard states.)

#### Scenario: Aggregate mapping
- GIVEN the API supplies totals, allocations, and transactions but no real balance
- WHEN the dashboard renders
- THEN Spanish labels identify aggregates/allocation and activity, while balance shows “No disponible” or “Configuración requerida”, never zero as a placeholder

#### Scenario: Non-populated state
- GIVEN loading, empty, or error data at mobile or desktop width
- WHEN the dashboard renders
- THEN an accessible Spanish explanation and an appropriate non-color semantic state are visible

### Requirement: Accessible data communication

Dashboard values MUST have accessible labels and text summaries; visual progress, allocation, status, and activity MUST NOT rely on color or animation alone. Where allocation or activity requires tabular interpretation, the fixture MUST expose a semantic table or clearly defined equivalent structured-data fallback with associated headers, labels, and values. The fixture MUST NOT add budgets, investments, account management, backend, sync, notifications, or integrations.
(Previously: Accessible presentation excluded product workflows and exposed equivalent structured data.)

#### Scenario: Equivalent text
- GIVEN a user cannot perceive a chart, color, or animation
- WHEN they inspect the dashboard
- THEN labels and text communicate the same essential values and state

#### Scenario: Structured allocation and activity data
- GIVEN a user needs to compare allocation or activity values non-visually
- WHEN they inspect the dashboard data
- THEN associated labels, headers, and exact values are available structurally

#### Scenario: No-overflow layout
- GIVEN the smallest supported mobile viewport and long Spanish labels
- WHEN values render
- THEN content remains readable without horizontal scrolling or clipped essential information
