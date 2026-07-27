# Delta for Finance Core

## MODIFIED Requirements

### Requirement: Decimal-safe money

Money values MUST preserve currency and exact decimal meaning without JavaScript floating-point storage or implicit conversion. Incompatible currencies MUST be rejected, rounding MUST be explicit, and every operation MUST require the authenticated owner predicate. (Previously: Money rules had no ownership boundary.)

#### Scenario: Exact round trip after deserialization
- GIVEN an owner creates a fractional currency amount
- WHEN it is stored, serialized, deserialized, and calculated
- THEN value, currency, and owner MUST remain exact with no binary-float drift

#### Scenario: Currency mismatch
- GIVEN an owner combines different currencies without conversion
- WHEN the arithmetic operation runs
- THEN it MUST be rejected without mutation

### Requirement: Privacy-safe financial entities

Accounts and transactions MUST use generated identifiers, sanitized metadata, and an authenticated owner predicate. The model MUST accept safe account inputs, but MUST reject full or partial card numbers, CVV, PIN, track data, and equivalent payment credentials. (Previously: Privacy constraints lacked ownership enforcement.)

#### Scenario: Safe account creation
- GIVEN an authenticated owner provides safe account data
- WHEN the account is created
- THEN it MUST receive a generated owner-scoped identifier and no credential

#### Scenario: Sensitive metadata rejection
- GIVEN account or transaction input contains a full or partial card number or another payment credential
- WHEN an account or transaction is created
- THEN validation MUST fail and the value MUST NOT persist

### Requirement: Distinct credit-product semantics

The core MUST represent `revolving-credit` and `charge-card` as distinct models with testable statement and payment invariants. They MUST NOT be interchangeable, and every operation MUST enforce the authenticated owner predicate. (Previously: Credit semantics lacked ownership enforcement.)

#### Scenario: Revolving-credit behavior
- GIVEN an owner has an unpaid revolving-credit statement
- WHEN a payment below its balance is recorded
- THEN the remaining balance MUST remain payable under those rules

#### Scenario: Charge-card behavior
- GIVEN an owner has a charge-card balance due
- WHEN a payment below the due balance is recorded
- THEN it MUST be rejected or marked delinquent under charge-card rules

## ADDED Requirements

### Requirement: Fail-closed financial tracker

The financial tracker MUST remain disabled until all five boundary slices pass: transport hardening, raw-`pg` replacement, rollback/export, end-to-end two-user isolation, and the complete finance-core/local-portability verification set. Money precision and privacy constraints MUST remain unchanged.

#### Scenario: Incomplete five-slice boundary
- GIVEN any of the five boundary slices has not passed its verification gate
- WHEN a financial workflow is requested
- THEN it MUST fail closed without exposing or mutating financial data
