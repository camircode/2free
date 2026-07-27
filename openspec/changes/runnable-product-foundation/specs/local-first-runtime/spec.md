# Local-First Runtime Specification

## Requirements

### Requirement: Offline SQLite operation

The local runtime MUST execute account, transaction, query, and portability workflows without network access using SQLite behind the same application/provider contracts as cloud.

#### Scenario: Offline workflow
- GIVEN no network connection
- WHEN an account and transaction are created and queried
- THEN the workflow succeeds with the same exact-money and privacy rules

#### Scenario: SQLite failure
- GIVEN a missing, locked, or corrupt database
- WHEN the runtime starts or writes
- THEN it reports an actionable failure and does not claim success

### Requirement: Local restart durability

The local runtime MUST apply explicit schema recovery/migration behavior and preserve committed records across normal restarts.

#### Scenario: Restart readback
- GIVEN committed local records
- WHEN the runtime stops and starts
- THEN records remain readable with unchanged identifiers and values

### Requirement: Explicit encryption capability reporting

The runtime MUST report whether the target build has verified SQLCipher capability. Plain SQLite MUST be labeled unencrypted and MUST NOT be described as encrypted.

#### Scenario: Unsupported capability
- GIVEN no verified SQLCipher support
- WHEN capabilities are queried
- THEN encryption is reported unsupported/unencrypted

#### Scenario: Verified capability
- GIVEN a CI- or target-verified SQLCipher build
- WHEN capabilities are queried
- THEN the verified capability and target scope are reported
