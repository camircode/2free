## Exploration: Bootstrap the 2 Free platform

### Current State

The filesystem confirms a greenfield bootstrap, not an existing application: there is no Git repository, source manifest, application code, test suite, CI, database schema, or established runtime convention. The repository contains only initialized OpenSpec configuration, `.atl/skill-registry.md`, four root logo assets, and the active change artifacts. `openspec/config.yaml` records the intended AGPLv3 TypeScript/pnpm monorepo, Next.js web, Astro landing, Tauri clients, NestJS API, shared React/core/data-provider packages, encrypted local SQLite, optional PostgreSQL sync, Better Auth, notifications, precise-decimal finance logic, imports/exports, OpenBB, and Banxico.

The product brief is therefore a platform architecture roadmap rather than a single implementable feature. The foundational seam should be a provider-agnostic finance core consumed by local and remote adapters. Local-first must be the default workflow; cloud/self-hosted synchronization is optional. Money cannot use JavaScript floating point, card credentials must never enter the model, and revolving credit cards and charge cards require distinct domain types and repayment rules. Debit/yield accounts, shared expenses, investments, alerts, and external data integrations should build on explicit domain events and ports rather than UI or vendor-specific logic.

### Affected Areas

- `openspec/config.yaml` — authoritative bootstrap constraints, empty testing/tooling state, OpenSpec rules, and 800-line review budget.
- `openspec/specs/` — empty source-of-truth area; approved capabilities must be established by later specs.
- `openspec/changes/bootstrap-2free-platform/` — active change already contains exploration and proposal; this exploration refines the greenfield boundary without implementing code.
- Root logo assets (`*.svg`, `*.png`, `*.ico`) — presentation input for a later landing/app shell slice; they should not couple branding to domain bootstrap.
- Future `packages/core` — money, currency/rounding policy, identifiers, account/product discriminants, transactions, statements, shared expenses, investments, domain events, and privacy invariants.
- Future `packages/data-provider` and `packages/storage` — provider ports, local encrypted SQLite adapter, migrations, export/import, outbox/inbox metadata, and optional sync plumbing.
- Future `packages/ui` and app shells (`apps/web`, `apps/landing`, `apps/desktop`, later mobile) — shared responsive light/dark presentation; no financial or provider rules.
- Future `apps/api` — NestJS/PostgreSQL/Better Auth boundary for optional synchronization, managed/self-hosted operation, and server-authorized integrations.
- Future integration/notification adapters — OpenBB, Banxico, import sources, native notifications, and user-defined alert rules with provenance, scheduling, permissions, deduplication, and retries.

### MVP Boundary

The MVP should prove one privacy-safe local financial loop: create debit/yield and credit-product accounts with generated IDs and masked metadata, record categorized transactions and shared-expense splits, preserve decimal amounts, export a versioned portable envelope, and import it into a fresh local store. It should include the discriminated revolving-credit and charge-card models, but only the minimum statement/payment invariants needed to prove they are not interchangeable. It should defer production sync, auth, polished cross-platform shells, external market data, native delivery, and advanced investment/yield calculations.

### Approaches

1. **Contract-first foundation** — establish pnpm workspace/tooling, a shared finance core, provider ports, deterministic local/in-memory behavior, versioned export/import, and invariant tests before product screens.
   - Pros: protects financial correctness and privacy; makes local, web, desktop, and future mobile composition-independent; creates a reviewable first slice.
   - Cons: less immediate visual output; requires early decisions on currency, time, identity, serialization, and domain boundaries.
   - Effort: Medium

2. **Vertical web prototype** — build a Next.js dashboard with mock data, then retrofit local storage, Tauri, shared contracts, and sync.
   - Pros: fastest branding and interaction feedback; validates supplied visual direction early.
   - Cons: encourages browser-only assumptions, float arithmetic, a generic card model, and provider leakage; creates high rework around offline and portability.
   - Effort: Medium initially, High overall

3. **Backend-first platform** — implement NestJS/PostgreSQL/Better Auth and APIs before local clients.
   - Pros: centralizes authorization and synchronization concerns.
   - Cons: contradicts local-first privacy goals, delays offline value, and makes clients dependent on a remote contract before local invariants are stable.
   - Effort: High

### Recommendation

Choose **contract-first foundation**, sequenced as: (1) reproducible pnpm monorepo and quality gates; (2) core money, identity, account, transaction, statement, and privacy contracts; (3) deterministic local provider plus versioned import/export; (4) encrypted SQLite/SQLCipher storage and migration boundaries; (5) one shared React UI flow and responsive shells; (6) API/auth and explicit sync protocol; (7) notifications, external integrations, and advanced investment/yield capabilities. Keep each step as a separately verifiable change under the 800-line review budget. Treat sync as an additive protocol with outbox/inbox and explicit conflict policy, not as a side effect of persistence.

Critical seams to settle before implementation are currency-aware decimal representation and rounding, timezone/date semantics, generated IDs and idempotency, account/product discriminants, statement versus current balance, export versioning and redaction, encryption/key recovery, sync ownership/conflicts, and the exact prohibition on storing full or partial card numbers. The domain should accept issuer/brand/last-four-like display data only if the product explicitly defines it as non-sensitive metadata; safest default is generated labels and token references without card digits.

### Risks

- The repository has no tooling or runtime versions; Node/pnpm versions, package boundaries, test runner, linting, formatting, and CI must be selected and pinned before feature work.
- Financial correctness is vulnerable to floating point, implicit rounding, timezone ambiguity, duplicate imports, and conflating current, statement, and available balances.
- Credit cards and charge cards have materially different settlement and interest behavior; shared repayment logic could produce unsafe results.
- SQLCipher key lifecycle, recovery, device sync, and conflict resolution are security/availability projects, not ordinary persistence details.
- Optional cloud/self-hosted sync can accidentally violate local-first privacy or create divergent authority unless upload scope, encryption, conflict, and deletion semantics are explicit.
- Notifications may be duplicated, mistimed, or misleading without rule ownership, timezone handling, permission state, scheduling, and deduplication.
- OpenBB, Banxico, bank imports, and market providers introduce licensing, availability, schema, provenance, and rate-limit risks; adapters must isolate them.
- A platform-wide bootstrap can exceed the 800-line review budget; forecast work units and use chained slices when the implementation grows beyond one reviewable boundary.

### Ready for Proposal

Yes. Proceed with a proposal for a contract-first monorepo foundation, explicitly limiting the first implementation slice to tooling, shared domain contracts, privacy-safe local behavior, portable export/import, and tests. Treat encrypted SQLite, sync/auth, UI shells, notifications, OpenBB/Banxico, Docker deployment, and full investment/yield workflows as subsequent changes with their own specifications and security review.
