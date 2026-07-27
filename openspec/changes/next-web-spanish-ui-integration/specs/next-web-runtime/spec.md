# Next Web Runtime Specification

## Purpose

Define the Next.js 16 App Router SSR web runtime that consumes the existing API/domain and shared UI contracts without expanding backend or authentication scope.

## Requirements

### Requirement: SSR composition and boundaries

The web application MUST use Next.js 16 App Router SSR. Server routes MUST fetch only serializable view data; client islands MUST own interactive navigation and forms, with explicit server/client boundaries and no domain or API contract changes.

#### Scenario: Server-rendered route
- GIVEN a supported Spanish route and API response
- WHEN a request is rendered
- THEN the route returns SSR HTML using the shared UI model and no browser-only API in the server boundary

#### Scenario: Interactive island
- GIVEN a form or navigation control requires browser state
- WHEN the user interacts with it
- THEN only the client island handles the interaction and preserves the existing API contract

### Requirement: Shared visual foundation

The runtime MUST consume the shared UI components, CSS, and logo, use the app-local `@` alias, and use Tailwind v4 with one authoritative template CSS source. It MUST NOT duplicate template CSS.

#### Scenario: Shared asset rendering
- GIVEN any supported page
- WHEN it renders
- THEN shared styling and logo assets are used and the app-local alias resolves

#### Scenario: CSS scan
- GIVEN workspace UI and application templates
- WHEN production CSS is built
- THEN Tailwind v4 scans required sources without duplicate template CSS

### Requirement: Spanish routes and resilient states

All user-facing routes, loading states, and errors MUST use neutral Spanish copy and MUST support responsive, dark, motion, and reduced-motion fallback behavior.

#### Scenario: Route states
- GIVEN `/`, `/cuentas`, `/transacciones`, or `/portabilidad`
- WHEN loading, empty, success, or failure occurs
- THEN the route presents an accessible Spanish state such as “Cargando…”, “No hay datos”, or “No se pudo completar la operación”

#### Scenario: Reduced motion
- GIVEN a user prefers reduced motion or motion APIs are unavailable
- WHEN the UI transitions
- THEN it settles to an equivalent non-motion presentation without lost information

### Requirement: Finance workflow preservation

The web runtime MUST expose accounts, transactions, and portability create/read/update/delete or equivalent supported workflows with validation, idempotency, import/export, and safe non-sensitive errors. It MUST preserve API/domain ownership and MUST NOT add auth, backend, banking, or provider behavior.

#### Scenario: Valid mutation
- GIVEN a valid account or transaction form
- WHEN it is submitted with the required idempotency key
- THEN the existing API performs the operation and repeated submission does not duplicate it

#### Scenario: Invalid or unsafe failure
- GIVEN invalid input, malformed import, or an API failure
- WHEN the operation is attempted
- THEN Spanish validation or safe error text is shown without card numbers, secrets, or internal details

### Requirement: Standalone delivery and migration gate

The application MUST produce a standalone production build runnable with pnpm and Docker. The legacy server MUST remain until build, browser, workflow, accessibility, and container parity evidence passes; only then MAY it be deleted.

#### Scenario: Production smoke
- GIVEN a clean checkout and supported Node/pnpm/Docker environment
- WHEN the standalone image is built and started
- THEN Spanish SSR routes and API-backed workflows are reachable

#### Scenario: Deletion gate
- GIVEN legacy and Next implementations coexist
- WHEN parity checks have not all passed
- THEN the legacy server remains available
