## Exploration: runnable-product-foundation

### Current State

The repository is a pnpm/TypeScript package-first monorepo. `@2free/core` owns exact decimal money, privacy-safe accounts, transactions, and credit-product invariants. `@2free/data-provider` exposes a provider-agnostic `FinanceProvider`; its only implementation is an in-memory provider with atomic versioned JSON import/export. `@2free/ui` owns the React shell and dashboard presentation contracts, including loading, empty, error, and populated states, but deliberately performs no fetching or persistence. Browser Mode tests currently verify the UI consumer harness, responsiveness, accessibility, and hydration.

There is no executable application, `apps/` workspace, root development entrypoint, API, production persistence adapter, Compose stack, health/version endpoint, or durable seeded data. The README explicitly describes applications and databases as intentionally absent. OpenSpec configuration still contains bootstrap-era assumptions, although the archived contract foundation and `app-shell-design-system` specs are now the authoritative evidence.

The first operable program should therefore be a real product foundation, not a demo. Web/cloud should be the first executable slice because it establishes the shared application composition, API boundary, durable persistence, operational contracts, and end-to-end proof with the fewest platform-specific unknowns. Local-first should follow as a second executable target against the same core/provider contracts, not as a fork of domain rules.

### Affected Areas

- `package.json`, `pnpm-workspace.yaml`, package manifests, TypeScript/Vitest configs — add workspace entrypoints, scripts, build/typecheck/test orchestration, and explicit runtime configuration conventions.
- `packages/core` — remain the sole owner of money, privacy, account, transaction, and product invariants; add only contracts required by real application use cases.
- `packages/data-provider` — preserve `FinanceProvider` as the application port; add a durable adapter behind it and migration/transaction semantics without leaking SQL types into core or UI.
- `packages/ui` — consume application view models and operation states; extend only where the meaningful product surface needs account, transaction, import/export, and actionable error/loading states.
- New `apps/web` — executable Next.js web/cloud consumer of the shared UI and application-facing client boundary.
- New `apps/api` — executable NestJS API translating HTTP/application commands to the provider port; expose `/health` and `/version` contracts.
- New `packages/application` (recommended) — use-case/query orchestration and DTO/view-model mapping shared by API and local runtime, preventing duplicate dashboard/account/transaction rules.
- New persistence package/adapter — PostgreSQL implementation first, with schema migrations, explicit transaction boundaries, and repository/provider contract tests.
- New local runtime/package — SQLite-backed implementation behind the same provider/application ports; SQLCipher-compatible seams must be capability-gated, not advertised as encryption until proven in the target build.
- `compose.yml`, `.env.example`, README — PostgreSQL/API/web local stack, health checks, version compatibility, safe defaults, seed/demo workflow, and quickstart.
- Browser/integration/E2E test configuration — API/provider integration tests, web browser tests, Compose-backed persistence checks, and local offline restart/import-export checks.

### Approaches

1. **Web/cloud first, shared application port, local-first second** — implement a meaningful cloud slice with Next.js + NestJS + PostgreSQL, then add SQLite/local execution using the same core and application contracts.
   - Pros: produces the first genuinely runnable product quickly; validates deployment-shaped boundaries and durable behavior; avoids duplicate business rules; keeps the two targets chained into reviewable slices.
   - Cons: local-first capabilities arrive after the cloud slice; provider and sync abstractions must be designed early even though sync is not delivered immediately.
   - Effort: High

2. **Local-first first, then add cloud/API persistence** — make SQLite the primary executable target and later introduce API/PostgreSQL.
   - Pros: proves offline durability early and can reuse existing in-memory portability concepts.
   - Cons: adds desktop/runtime packaging and encryption uncertainty before operational web boundaries are validated; risks a second application composition and a later cloud rewrite.
   - Effort: High

3. **Single full-stack slice implementing both targets concurrently** — deliver web/cloud and local-first in one large change.
   - Pros: demonstrates target parity immediately.
   - Cons: exceeds the 800-line review budget, couples unresolved storage/runtime decisions, and makes failures difficult to isolate; directly conflicts with chained reviewable work units.
   - Effort: Very high

### Recommendation

Choose approach 1 and chain the program as bounded work units. Keep `core` and the provider contract free of SQL, HTTP, React, and runtime concerns. Introduce an application package for use cases and stable view-model mapping so API and local consumers converge on one domain/application behavior. The first release surface should be a real dashboard plus account list/create, transaction list/create, deterministic import/export, explicit loading/empty/error states, seeded/demo data, and durable restart behavior. It need not include budgets, investments, notifications, authentication, sync, or banking integrations.

Recommended chained units, each forecast below the 800-line review budget (tests/config included):

1. **Runtime and composition foundation — ~500–700 changed lines.** Add `apps/web`, `apps/api`, `packages/application`, root scripts, environment schema, `/health` and `/version`, Compose wiring, and a documented quickstart. Use an in-memory adapter initially only inside the executable composition, with a real seed path and API/web smoke proof; do not call this production persistence.
2. **Cloud durable product slice — ~650–800 lines.** Add PostgreSQL schema/migrations and adapter, transactional provider contract tests, account/transaction use cases, dashboard queries, import/export endpoints, deterministic seed, and restart durability. Add API integration tests and a Chromium E2E journey covering create/read/export/import and error states.
3. **Web meaningful UX completion — ~550–750 lines.** Replace harness-only composition with routed product screens for dashboard, accounts, transactions, and portability; wire loading/empty/error states, accessible forms, and server error mapping. Extend Browser Mode/E2E coverage without moving business rules into React.
4. **Local-first durable target — ~650–800 lines.** Add a SQLite adapter using the same provider/application contract, local runtime entrypoint, schema migration/recovery behavior, offline operation, and durable restart tests. Define a storage-encryption capability boundary and prove the chosen SQLCipher-compatible driver in CI or explicitly report it unsupported; never imply encryption from plain SQLite.
5. **Target parity and release verification — ~450–650 lines.** Add shared contract tests across PostgreSQL and SQLite, export/import portability between targets, offline/local browser or runtime verification, Compose health/version checks, failure-mode documentation, and final quickstart/release gates. Optional sync remains a later change.

Runtime contracts should include a machine-readable health response that distinguishes process readiness from database readiness, a stable application version response, validated environment configuration, and Compose health checks that gate API/web startup on PostgreSQL readiness. The quickstart should state Node/pnpm versions, `pnpm install --frozen-lockfile`, environment setup, `pnpm dev`, `docker compose up`, seed/reset commands, test commands, and expected URLs.

Persistence should map rows to domain objects at the adapter boundary, preserve integer/string decimal representation and currency, validate privacy on writes/import, and use database transactions for multi-entity import. Adapter tests must assert the same rejection and atomicity behavior as the in-memory provider. SQLite should use a repository/driver interface that can later bind to SQLCipher; a plain SQLite implementation must be labeled unencrypted. No sync protocol or banking connector is required by the current requirements.

### Risks

- Adding framework packages and multiple apps can consume the review budget; keep each unit independently runnable and avoid broad generated scaffolding.
- PostgreSQL and SQLite may expose different transaction, typing, locking, and migration behavior; shared contract tests are mandatory.
- SQLCipher support varies by Node/native driver and build environment; treat encryption as a verified capability, not an architectural claim.
- API DTOs can accidentally become a second domain model; centralize use cases and mapping in `packages/application`.
- Existing UI specs prohibit production fetching/persistence inside presentation components; the product consumer must supply state from application boundaries.
- Seed/demo data must be explicit and resettable, never mixed with user data or treated as a banking import.
- Cross-target export compatibility needs a version policy before either adapter evolves its schema.
- Authentication, authorization, sync, notifications, investments, budgets, external market data, OpenBB, Banxico, and all banking integrations remain out of scope unless separately approved by requirements.

### Ready for Proposal

Yes. The proposal should name the chained slices and acceptance boundaries above, explicitly select web/cloud as the first executable target, require shared core/application/provider contracts, and reserve local-first for the subsequent slice. It should not promise SQLCipher encryption, sync, or banking integrations before separate evidence and requirements exist.
