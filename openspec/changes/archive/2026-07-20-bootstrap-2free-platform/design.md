# Design: Bootstrap the 2 Free Contract Foundation

## Technical Approach

Build a reproducible pnpm TypeScript workspace: `@2free/core` owns validated finance rules; `@2free/data-provider` owns a persistence-independent port and deterministic in-memory adapter. Sanitized data flows through the port and versioned JSON round-trips into a fresh adapter. No app, database, remote service, or payment credential is in scope.

## Architecture Decisions

| Decision | Choice | Alternative / tradeoff | Rationale |
|---|---|---|---|
| Tooling | Pin Node/pnpm in `.node-version`, `engines`, and `packageManager`; commit lockfile; use TypeScript, ESLint, Prettier, Vitest. | Latest/npm. | Reproducible clean checkout and CI. |
| Quality gates | Document install, format/write and check, lint, typecheck, focused tests, and non-mutating aggregate `check`. | Ad-hoc commands. | A visible, safe validation path. |
| Money | Immutable `{ currency, coefficient: bigint, scale }` (`coefficient × 10^-scale`); decimal-string construction; integer arithmetic; caller supplies scale and `HALF_EVEN`/`HALF_UP`/`DOWN`. Reject mismatched currency and implicit precision loss. | `number` or implicit rules. | Exact values; business policy stays explicit. |
| Serialization | `{ currency, coefficient: string, scale }`; validate integer string and non-negative scale. | JSON numbers/display strings. | Exact `bigint` round trip. |
| IDs, products, privacy | Inject IDs/clocks; discriminate debit, yield, revolving-credit, charge-card; validate flat metadata and reject credential terms and normalized 4–19 digit runs. | Global IDs, generic card, redaction. | Deterministic tests, no credentials, distinct payment rules. |
| Portability | ID-sorted v1 envelope; validate schema, references, money, duplicates, privacy, then atomically replace a fresh store. | Dump/merge. | Deterministic, provider-independent, all-or-nothing import. |
| Local `@` alias | Every package/app maps `@/*` only to its own `src/*`. TypeScript paths, Vitest/Vite resolution, and production bundler MUST agree. Apply now to `packages/core`; apply to `packages/data-provider` when created and future apps on creation. | Root-wide/cross-package alias. | `@` never targets the monorepo root or another package; cross-package code uses declared package imports. |
| Future app-shell motion | Defer GSAP and browser View Transitions; add no dependency or UI code here. A future React shell uses `@gsap/react` `useGSAP`, scoped root refs, lifecycle cleanup, declared dependencies, and `revertOnUpdate` for state-driven recreation. | Ad-hoc effects/bootstrap animation. | Preserves contract-first scope with a safe UI seam. Progressively enhance route/state updates with View Transitions, honor reduced motion, and provide the identical no-animation fallback. |

## Data Flow

```text
input -> core rules -> FinanceProvider -> InMemoryFinanceProvider
            | privacy/exact money |       |
            +-> canonical v1 export -> validate -> replace
```

## File Changes

| File | Action | Description |
|---|---|---|
| Root manifests, quality configs, README, CI | Create | Pinned workspace and non-mutating gates. |
| `packages/core/{package.json,tsconfig.json,src/*,test/*}` | Create | Finance contracts/tests and local TypeScript/Vitest `@` resolution. |
| `packages/data-provider/{package.json,tsconfig.json,src/*,test/*}` | Create | Provider, adapter, portability tests, and the same local alias rule. |

## Interfaces / Contracts

```ts
type RoundingMode = "HALF_EVEN" | "HALF_UP" | "DOWN";
type Money = Readonly<{ currency: string; coefficient: bigint; scale: number }>;
type Decimal = Readonly<{ coefficient: bigint; scale: number }>;
type MoneyDto = { currency: string; coefficient: string; scale: number };
declare function add(a: Money, b: Money, scale: number, mode: RoundingMode): Money;
```

`Decimal` is unitless; combined money requires identical currency. The provider creates/reads accounts and transactions and exposes `export(): string` / `import(serialized: string): void`; invalid input raises typed validation without mutation. `@/x` always means `<current package>/src/x`. Alias configuration is changed and tested as one TypeScript/Vitest/bundler contract. Future motion first checks reduced-motion and View Transition support; GSAP selectors remain inside the shell ref scope.

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit | Decimal parsing/arithmetic/rounding, currency rejection, DTO equality; IDs, privacy, product invariants. | Vitest tables with faked clock/IDs. |
| Contract | Offline provider boundary and replacement rules. | Shared in-memory suite. |
| Integration | Exact round trip and atomic malformed/unsafe/version rejection. | Fresh-provider fixtures. |
| CI | Quality failures and non-mutating `check`; local alias resolution. | Workflow and focused commands. |
| Future UI | Alias parity; reduced-motion, unavailable View Transitions, and animation cleanup. | Add only with the React shell; no GSAP/UI tests now. |

## Threat Matrix

N/A — this change adds no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary. Future app-shell routing/motion work must assess the matrix.

## Migration / Rollout

No migration required. Future envelope versions need an explicit decoder/migration and atomic rejection of unsupported versions.

## Open Questions

- [ ] Confirm the supported currency-code allowlist; this slice does not infer ISO minor-unit scales.
