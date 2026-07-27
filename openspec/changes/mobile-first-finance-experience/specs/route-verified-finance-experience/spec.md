# Route-Verified Finance Experience Specification

## Purpose

Prove the actual Next.js finance route independently from shared-package harness evidence while keeping finance fail-closed.

## Requirements

### Requirement: Actual route and harness evidence are separate

The system SHALL verify the production Next route at its real route entry and SHALL report package-harness evidence separately; neither evidence set MAY substitute for the other.

#### Scenario: Route proof

- GIVEN the Next application is running
- WHEN the documented finance route is opened directly
- THEN deterministic mobile and desktop evidence identifies the actual route and its rendered states

#### Scenario: Harness distinction

- GIVEN the shared UI harness is rendered
- WHEN evidence is collected
- THEN it is labeled as harness evidence and does not claim Next-route acceptance

### Requirement: Fail-closed unauthenticated delivery

The route MUST NOT serialize, SSR, or request financial payloads for an unauthenticated visitor; it SHALL render an unavailable or safe placeholder state without card numbers or real financial values.

#### Scenario: Unauthenticated request

- GIVEN no authenticated ownership context exists
- WHEN the route is server-rendered or loaded
- THEN no financial payload appears in HTML, requests, or client data and an unavailable state is shown

#### Scenario: SSR hydration safety

- GIVEN SSR runs without browser globals
- WHEN the client hydrates
- THEN no browser-global exception or hydration mismatch occurs and the safe state remains deterministic
