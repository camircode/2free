# Tasks: Bootstrap the 2 Free Contract Foundation

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated changed lines | 700–850 authored lines |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 quality → PR 2 core/remediation → PR 3 provider |
| Delivery strategy | auto-chain |
| Chain strategy | feature-branch-chain |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|---|---|---|---|---|---|
| 1 | Reproducible workspace gates | PR 1 | `pnpm check` | CI workflow on clean checkout | Root tooling/config and workflow files |
| 2 | Validated finance domain contracts and local alias | PR 2 | `pnpm test:core` | Node/Vitest domain fixtures; no external service | `packages/core` and alias config only |
| 3 | Offline provider, local alias, and atomic portability | PR 3 | `pnpm test:data-provider` | Fresh in-memory provider export/import scenario | `packages/data-provider` only |

## Phase 1: Workspace Foundation

- [x] 1.1 Create `.node-version`, `.npmrc`, `package.json`, `pnpm-workspace.yaml`, and `pnpm-lock.yaml`; pin Node/pnpm and expose scripts.
- [x] 1.2 Create shared configs and `README.md`; make `check` non-mutating and document clean-checkout commands.
- [x] 1.3 Create `.github/workflows/quality.yml` with frozen install and root `pnpm check`; RED-prove quality violations fail, then GREEN with the clean workspace.

## Phase 2: Core Contracts (RED → GREEN → Refactor)

- [x] 2.1 Create `packages/core` configuration and RED Vitest fixtures for decimal parsing, round trips, currency mismatch, explicit rounding, and precision-loss rejection.
- [x] 2.2 Implement `packages/core/src/money.ts` with immutable `Money`, `Decimal`, DTO parsing, integer arithmetic, `HALF_EVEN`/`HALF_UP`/`DOWN`, and explicit quantization; make 2.1 pass, then refactor shared validation.
- [x] 2.3 Add RED tests and implement core identifiers, privacy, account, and transaction modules for injected IDs/clocks, sanitized metadata, credential rejection, and distinct credit-product invariants.
- [x] 2.4 Remediation: RED-prove separator-independent PAN rejection, close the credential bypass, and configure/prove package-local `@/* -> src/*` resolution in TypeScript and Vitest/Vite.

## Phase 3: Provider Portability (RED → GREEN → Refactor)

- [x] 3.1 Create `packages/data-provider` configuration; configure/prove its package-local TypeScript/Vitest `@/* -> src/*` alias; add RED tests for offline CRUD, provider boundaries, deterministic v1 export, exact money, and atomic rejection.
- [x] 3.2 Implement `packages/data-provider/src/provider.ts`, `in-memory-provider.ts`, and `portability.ts`; validate schema/references/privacy before replacing state, then make 3.1 pass and refactor shared import validation.

## Phase 4: Verification

- [x] 4.1 Run `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test:core`, `pnpm test:data-provider`, and `pnpm check`; confirm `check` changes no files.
- [x] 4.2 Run the clean-checkout/CI scenario without network services; record parity and verify no applications, credentials, databases, or roadmap integrations were added.

## FUTURE UI APP-SHELL FOLLOW-UP (separate SDD change; not counted here)

GSAP plus browser View Transitions remain out of scope: no UI app shell exists. A separate named SDD change should add `@gsap/react` `useGSAP` with scoped refs, cleanup, dependencies, and `revertOnUpdate`; progressively enhance View Transitions, honor reduced-motion, and accept an identical no-animation fallback. No executable checkbox belongs here.
