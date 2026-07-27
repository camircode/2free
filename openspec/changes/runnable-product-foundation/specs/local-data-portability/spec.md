# Delta for Local Data Portability

## MODIFIED Requirements

### Requirement: Provider-independent local workflow

The provider contract MUST support creating sanitized entities, recording transactions, and reading them without a network, authentication service, or production database across PostgreSQL and SQLite adapters. (Previously: local behavior was specified without cloud/local adapter parity.)

#### Scenario: Offline workflow
- GIVEN a fresh local provider with no network connection
- WHEN an account and transaction are created and read
- THEN the workflow succeeds locally

#### Scenario: Provider boundary
- GIVEN domain operations through the provider contract
- WHEN the implementation is replaced by another provider
- THEN domain behavior and privacy constraints remain unchanged

### Requirement: Versioned deterministic export and import

The provider MUST export a versioned, deterministically ordered envelope of privacy-safe data and import it into PostgreSQL or SQLite while preserving exact money, currency, identifiers, and transaction meaning. Imports MUST be atomic on both adapters. Unsupported versions, malformed data, prohibited card data, and incompatible currencies MUST be rejected without partial application. (Previously: portability covered a generic local provider and did not require cross-adapter determinism.)

#### Scenario: Portable round trip
- GIVEN populated data on either adapter
- WHEN its export is imported into the other adapter
- THEN equivalent supported data and exact decimal values are available

#### Scenario: Invalid or unsafe import
- GIVEN an unsupported version, malformed payload, prohibited card data, or currency mismatch
- WHEN import is attempted
- THEN import fails atomically and the destination remains unchanged
