# Target Parity and Release Specification

## Requirements

### Requirement: Shared adapter contract

PostgreSQL and SQLite adapters MUST pass the same contract suite for accounts, transactions, exact Money, privacy rejection, deterministic export/import, atomicity, and failure semantics.

#### Scenario: Equivalent contract results
- GIVEN identical fixtures
- WHEN the shared suite runs against both adapters
- THEN observable results and rejection categories match

#### Scenario: Atomic failure parity
- GIVEN a payload failing validation midway
- WHEN import runs on either adapter
- THEN neither adapter leaves partial state

### Requirement: Cross-target portability

The versioned portability format MUST be accepted across cloud and local targets when supported, with explicit rejection for unsupported versions or incompatible data.

#### Scenario: Cloud-to-local and local-to-cloud
- GIVEN a valid export from either target
- WHEN it is imported into the other target
- THEN identifiers, exact values, currencies, and meaning are retained

### Requirement: Release gates and boundaries

A release MUST pass quickstart, Compose health/version, migrations, API integration, Chromium E2E, local offline/restart, contract, and portability gates. Documentation MUST keep authentication, authorization, sync, notifications, budgets, investments, market data, OpenBB, Banxico, generic integrations, and banking integrations out of scope.

#### Scenario: Gate failure
- GIVEN any required gate fails or encryption is unverified
- WHEN readiness is evaluated
- THEN release is blocked and the failure is reported

#### Scenario: Passing release
- GIVEN every gate passes on declared targets
- WHEN readiness is evaluated
- THEN release eligibility and target/version evidence are recorded
