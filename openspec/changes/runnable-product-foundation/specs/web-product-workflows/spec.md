# Web Product Workflows Specification

## Requirements

### Requirement: Routed product surface

The web product MUST provide routable dashboard, accounts, transactions, and portability screens. Presentation MUST consume application view models and MUST NOT own domain or persistence rules.

#### Scenario: Navigate product
- GIVEN the web application is available
- WHEN each documented route is opened and reloaded
- THEN its corresponding screen renders and the route is preserved

#### Scenario: Account and transaction journey
- GIVEN an accounts or transactions screen
- WHEN valid input is submitted
- THEN the new entity appears with exact displayed amount and currency

### Requirement: Observable operation states

Each data-driven screen MUST expose loading, empty, populated, and actionable error states. Server failures MUST not expose secrets or raw infrastructure details.

#### Scenario: Empty and error states
- GIVEN no records or an unavailable API
- WHEN the screen loads
- THEN distinct guidance and a retry/action affordance are shown

#### Scenario: Loading state
- GIVEN a pending request
- WHEN the route renders
- THEN a perceivable loading state is shown and duplicate submissions are prevented

### Requirement: Accessible forms and feedback

Forms, navigation, tables, status messages, and retry actions MUST be keyboard operable, labeled, and understandable with assistive technology.

#### Scenario: Accessible validation
- GIVEN invalid input
- WHEN submission is attempted
- THEN field errors are associated, perceivable, and focus moves predictably

### Requirement: Browser proof

Chromium E2E tests MUST cover navigation, create/read, portability, restart-backed data, representative states, and accessibility.

#### Scenario: Reviewable journey
- GIVEN the Compose-backed product
- WHEN the browser suite runs
- THEN the documented journey passes without harness-only data shortcuts
