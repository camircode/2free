# Delta for Local Data Portability

## MODIFIED Requirements

### Requirement: Provider-independent local workflow

The provider contract MUST support sanitized entities, transactions, and reads without network, auth service, or production database, while requiring an explicit owner identity and owner predicate for every operation. (Previously: Local workflows did not require ownership.)

#### Scenario: Offline workflow
- GIVEN a fresh local provider and authenticated local owner without network
- WHEN an account and transaction are created and read
- THEN the workflow MUST succeed only within that owner’s scope

#### Scenario: Sanitized creation and transaction recording
- GIVEN an authenticated local owner provides safe account data and a valid transaction
- WHEN the provider creates the entity and records the transaction
- THEN both MUST persist sanitized data with generated identifiers and exact money semantics

#### Scenario: Provider boundary
- GIVEN domain operations through the provider contract
- WHEN the implementation is replaced
- THEN owner isolation, domain behavior, and privacy constraints MUST remain unchanged

### Requirement: Versioned deterministic export and import

The provider MUST export a versioned envelope of privacy-safe, owner-scoped data and import it while preserving exact money, currency, identifiers, transaction meaning, and owner identity. Unsupported versions, malformed data, unknown owners, cross-owner records, or card data MUST be rejected atomically. (Previously: Portability was atomic but not owner-scoped.)

#### Scenario: Portable round trip
- GIVEN a provider scoped to owner A
- WHEN its export is imported into a fresh provider for owner A
- THEN equivalent data and exact decimals MUST restore only for A

#### Scenario: Invalid or unsafe import
- GIVEN an unsupported version, malformed payload, card data, or owner mismatch
- WHEN import is attempted
- THEN it MUST fail atomically and leave the destination unchanged

#### Scenario: Cross-owner portability rejection
- GIVEN an export contains records for owner B
- WHEN owner A imports it
- THEN import MUST fail atomically and MUST NOT create, update, or reveal any record
