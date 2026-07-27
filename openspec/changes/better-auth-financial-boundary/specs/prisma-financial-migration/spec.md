# Prisma Financial Migration Specification

## Purpose

Make Prisma the sole forward authority while safely replacing raw `pg` history.

## Requirements

### Requirement: Prisma baseline and staged replacement

The system MUST establish and explicitly baseline/import existing raw-`pg` financial migration history before replacement, MUST use Prisma as the sole forward schema and migration authority, and MUST remove raw `pg` access in explicit stages. It MUST NOT maintain indefinite dual-write behavior.

#### Scenario: Forward migration
- GIVEN a schema change is approved
- WHEN it is applied forward
- THEN Prisma MUST be the only migration authority and the schema MUST be reproducible

#### Scenario: Staged raw-pg removal
- GIVEN a replacement stage has not passed its verification gate
- WHEN financial writes are attempted
- THEN the system MUST retain the prior safe path or fail closed, never silently dual-write

#### Scenario: Baseline and imported history
- GIVEN existing raw-`pg` schema and migration history
- WHEN the migration program begins
- THEN the history MUST be recorded in the Prisma baseline/import before any replacement migration is applied

### Requirement: Migration quarantine and recovery

Migration MUST quarantine unknown or ownerless rows, support explicit bootstrap ownership, and produce a verified export before destructive replacement, with a tested rollback path.

#### Scenario: Unassignable legacy data
- GIVEN legacy data cannot be assigned to a verified owner
- WHEN the baseline migration runs
- THEN it MUST quarantine the data and preserve it for review

#### Scenario: Failed replacement
- GIVEN staged verification fails
- WHEN rollback is requested
- THEN the system MUST restore the verified prior state or export without weaker credentials

#### Scenario: Verified export before migration
- GIVEN a destructive replacement is proposed
- WHEN its preflight gate runs
- THEN a restorable export MUST be created and verified before migration may proceed
