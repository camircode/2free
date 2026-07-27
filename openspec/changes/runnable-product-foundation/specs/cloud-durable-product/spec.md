# Cloud Durable Product Specification

## Requirements

### Requirement: Durable account and transaction workflows

The cloud product MUST create and read accounts and transactions through application use cases backed by PostgreSQL. Money MUST retain exact decimal value and currency; persisted account data MUST reject prohibited payment-card data.

#### Scenario: Create workflow
- GIVEN a ready PostgreSQL-backed API
- WHEN a valid account and transaction are submitted
- THEN they are persisted and returned with exact amount and currency

#### Scenario: Privacy and currency rejection
- GIVEN card-like sensitive data or mismatched currencies
- WHEN creation or import is requested
- THEN it is rejected and no unsafe entity persists

### Requirement: Atomic deterministic portability

The cloud provider MUST export a versioned deterministic envelope and import supported data atomically, preserving identifiers, ordering, exact money, currency, and transaction meaning.

#### Scenario: Export/import round trip
- GIVEN populated cloud data
- WHEN it is exported and imported into an empty destination
- THEN equivalent data is available with byte-stable ordering

#### Scenario: Failed import
- GIVEN malformed, unsupported, unsafe, or conflicting data
- WHEN import is attempted
- THEN the transaction rolls back completely with a stable error

### Requirement: Restart durability

PostgreSQL persistence MUST survive API/web restarts and MUST use explicitly compatible migrations.

#### Scenario: Restart readback
- GIVEN persisted records and an unchanged database
- WHEN the API restarts
- THEN records remain readable with unchanged values

#### Scenario: Migration failure
- GIVEN an unavailable or incompatible migration
- WHEN startup is attempted
- THEN the API remains not-ready and does not claim durable readiness

### Requirement: API proof

Automated API integration coverage MUST assert workflows, portability, privacy rejection, atomicity, health, and restart behavior.

#### Scenario: Contract evidence
- GIVEN the cloud test environment
- WHEN the integration suite runs
- THEN every listed success and failure behavior is asserted
