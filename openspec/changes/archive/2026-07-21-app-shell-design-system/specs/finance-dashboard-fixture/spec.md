# Finance Dashboard Fixture Specification

## Purpose

Demonstrate responsive, accessible finance presentation using fixtures and typed view models, without implementing a finance product.

## Requirements

### Requirement: Exact-money view-model boundary

The dashboard MUST consume typed view models that preserve exact money and currency meaning and MUST display supplied formatted values. It MUST NOT perform domain arithmetic, floating-point conversion, persistence, fetching, or privacy-sensitive data handling.

#### Scenario: Exact display

- GIVEN a view model contains an exact amount, currency, and display value
- WHEN the dashboard renders a balance or activity row
- THEN the supplied display value and currency context are shown without recalculation

#### Scenario: Boundary protection

- GIVEN a consumer provides an updated view model
- WHEN the dashboard rerenders
- THEN presentation changes reflect the model and no domain operation or provider mutation occurs

### Requirement: Representative responsive states

The fixture dashboard MUST include a heading, summary/balance region, responsive trend or allocation data, and recent activity. It MUST support desktop and narrow layouts plus loading, empty, error, and populated states.

#### Scenario: Populated desktop state

- GIVEN populated fixture data and a wide viewport
- WHEN the dashboard renders
- THEN summary, data visualization or table, and activity are visible with a readable desktop arrangement

#### Scenario: Narrow and non-populated states

- GIVEN a narrow viewport or loading, empty, or error fixture state
- WHEN the dashboard renders
- THEN data uses a readable compact alternative and each state has an explicit text explanation

### Requirement: Accessible data communication and scope

Dashboard data MUST have accessible labels and text summaries and MUST NOT rely on color or animation alone. The change MUST NOT add transactions, budgets, investments, account management, full finance screens, backend, sync, notifications, or integrations.

#### Scenario: Assistive technology summary

- GIVEN a user cannot perceive a chart or color distinction
- WHEN they inspect the dashboard
- THEN labels and a text summary communicate the same essential values and state

#### Scenario: Out-of-scope request

- GIVEN a component would require production fetching or finance rules
- WHEN the fixture surface is evaluated
- THEN it remains a fixture/view-model boundary and exposes no such behavior
