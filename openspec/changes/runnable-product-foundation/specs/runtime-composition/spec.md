# Runtime Composition Specification

## Requirements

### Requirement: Executable composition and configuration

The system MUST expose runnable web and API applications composed from shared application/provider contracts. Configuration MUST be validated before startup and MUST use safe, non-secret defaults.

#### Scenario: Quickstart startup
- GIVEN supported Node/pnpm, installed dependencies, environment, and Compose
- WHEN the documented development command runs
- THEN web and API become reachable at documented URLs

#### Scenario: Invalid configuration
- GIVEN a missing or invalid required value
- WHEN an application starts
- THEN it fails clearly before serving requests

### Requirement: Operational readiness

The API MUST provide stable `/health` and `/version` responses. Health MUST distinguish process readiness from database readiness, and Compose MUST gate dependent startup on database readiness.

#### Scenario: Ready stack
- GIVEN API and database are available
- WHEN health and version are requested
- THEN both dependencies are ready and a stable application version is returned

#### Scenario: Database unavailable
- GIVEN the API process is running but its database is unavailable
- WHEN health is requested
- THEN database-not-ready is reported with a non-success readiness status

### Requirement: Explicit seed and reset

The system MUST provide repeatable seed and reset operations. Seed data MUST be distinguishable from user data and MUST NOT imply banking integration.

#### Scenario: Seed and reset
- GIVEN an empty development environment
- WHEN seed then reset is requested
- THEN deterministic demo data appears, then is removed
