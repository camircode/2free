# Destructive Development Routes Specification

## Purpose

Define a fail-closed HTTP boundary for deterministic development seed/reset operations while preserving direct application and provider behavior.

## Requirements

### Requirement: Fail-closed configuration parsing

The system MUST enable destructive HTTP routes only when the dedicated capability setting is explicitly and validly enabled. Omitted, `false`, empty, malformed, unsupported, or otherwise disallowed values MUST be treated as disabled.

#### Scenario: Configuration matrix is fail-closed

- GIVEN each supported profile and capability input in the configuration matrix
- WHEN runtime configuration is parsed
- THEN only the explicitly enabled, valid capability value is enabled
- AND omitted, false, empty, invalid, or disallowed inputs remain disabled

### Requirement: Profile and capability double gate

The API MUST expose both destructive routes only when the validated capability is enabled AND the runtime profile is `local-offline` or `ci`; every other profile/capability combination MUST keep both routes disabled.

#### Scenario: Allowed profile with capability

- GIVEN a valid explicit capability and profile `local-offline` or `ci`
- WHEN the API is composed
- THEN `POST /seed` and `POST /reset` are available

#### Scenario: One gate is absent

- GIVEN either a disabled capability or a profile outside `local-offline` and `ci`
- WHEN a destructive route is requested
- THEN the API returns `404` with `not_found`

### Requirement: Indistinguishable disabled response

Disabled destructive routes MUST return the same non-discoverable `404 not_found` response for both route paths and MUST NOT reveal whether a route exists, which gate failed, or what configuration was supplied.

#### Scenario: Disabled routes are non-discoverable

- GIVEN destructive routes are disabled for any reason
- WHEN a client posts to `/seed` or `/reset`
- THEN both responses are indistinguishable `404 not_found` responses
- AND the response does not disclose configuration or authorization details

### Requirement: HTTP non-invocation guarantee

When destructive routes are disabled, HTTP requests MUST NOT invoke the injected application `seed()` or `reset()` operations, directly or indirectly.

#### Scenario: Disabled request cannot mutate data

- GIVEN spy implementations are injected for `seed()` and `reset()`
- WHEN disabled clients request either HTTP route
- THEN the response is `404 not_found`
- AND neither spy is called

### Requirement: Direct behavior preservation

Direct application and provider seed/reset operations MUST retain their existing deterministic contracts, including direct test access; this change MUST NOT weaken schema, provider, application, `/import`, or unrelated mutation behavior.

#### Scenario: Direct deterministic boundary remains available

- GIVEN a direct application/provider test invokes seed or reset
- WHEN the operation is called outside the disabled HTTP boundary
- THEN its existing result and data behavior are preserved

### Requirement: Safe defaults and controlled exposure

Compose, self-host, and example environment defaults MUST omit unconditional destructive-route enablement. Documentation and consumers MUST use an explicit, deliberate local/CI configuration when invoking these routes.

#### Scenario: Default deployment is safe

- GIVEN default Compose or self-host configuration
- WHEN `/seed` or `/reset` is requested
- THEN the response is `404 not_found`
- AND no destructive command is unconditionally executed by startup or smoke consumers

#### Scenario: Controlled local/CI use is documented

- GIVEN an operator intentionally enables the capability in an allowed profile
- WHEN the documented local/CI workflow is followed
- THEN the routes can be used deterministically
- AND consumers do not assume destructive HTTP access by default

### Requirement: Scope preservation

This change MUST NOT introduce secrets, authentication, schema, UI, or broad import changes, and MUST NOT alter persisted data contracts or unrelated consumer behavior.

#### Scenario: Out-of-scope surfaces remain unchanged

- GIVEN the secure destructive reset change is applied
- WHEN auth, schema, UI, import, and provider contracts are reviewed
- THEN no unrelated drift or new admin identity mechanism is introduced
