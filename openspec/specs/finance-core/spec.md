# Finance Core Specification

## Requirements

### Requirement: Decimal-safe money

Money values MUST preserve currency and exact decimal meaning without JavaScript floating-point storage or implicit conversion. Operations with incompatible currencies MUST be rejected, and rounding MUST be explicit.

#### Scenario: Exact round trip

- GIVEN a currency amount with fractional minor units
- WHEN it is stored, calculated, and serialized
- THEN its value and currency remain exact after deserialization

#### Scenario: Currency mismatch

- GIVEN money values with different currencies
- WHEN an arithmetic operation combines them without an explicit conversion
- THEN the operation MUST be rejected

### Requirement: Privacy-safe financial entities

Accounts and transactions MUST use generated identifiers and sanitized metadata. The model MUST reject full or partial card numbers, CVV, PIN, track data, and equivalent payment credentials.

#### Scenario: Safe account creation

- GIVEN an account label, type, currency, and non-sensitive metadata
- WHEN the account is created
- THEN it receives a generated identifier and stores no payment credential

#### Scenario: Sensitive metadata rejection

- GIVEN metadata containing a full or partial card number or payment credential
- WHEN an account or transaction is created
- THEN validation MUST fail and the sensitive value MUST NOT be persisted

### Requirement: Distinct credit-product semantics

The core MUST represent `revolving-credit` and `charge-card` as distinct models with testable statement and payment invariants. They MUST NOT be interchangeable.

#### Scenario: Revolving-credit behavior

- GIVEN a revolving-credit account with an unpaid statement balance
- WHEN a payment below the statement balance is recorded
- THEN the remaining balance MUST remain payable under those rules

#### Scenario: Charge-card behavior

- GIVEN a charge-card account with a statement balance due
- WHEN a payment below the due balance is recorded
- THEN the result MUST be rejected or marked delinquent under charge-card rules
