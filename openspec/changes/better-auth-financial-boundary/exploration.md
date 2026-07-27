## Exploration: Better Auth financial boundary

### Current State
The repository has a TypeScript pnpm monorepo with a custom Node HTTP API (`apps/api`) and a Next 16 app (`apps/web`). The API currently dispatches financial reads and writes directly to one process-wide `RuntimeApplication`: `/snapshot`, `/accounts`, `/transactions`, `/dashboard`, `/export`, and `/import` have no session check. Development `/seed` and `/reset` are separately profile-gated, but `/snapshot` is not a financial-safe public route. The Next root was deliberately changed to fail closed in Spanish, but the existing route and server-only adapter do not yet authenticate users or forward cookies.

The current PostgreSQL provider is a direct `pg` implementation with hand-applied SQL migrations. `accounts` and `transactions` are global tables; transactions reference accounts, but neither table has an owner/user key. The in-memory provider and application contracts are likewise singleton-shaped (`listAccounts()`, `dashboard()`, `export()`, etc.). Therefore authentication alone would only turn a global shared financial dataset into a dataset visible to every authenticated user: it does not provide isolation. A secure first usable workflow requires both identity/session enforcement and ownership-aware persistence/application calls, or must keep financial workflows unavailable until ownership is complete.

There is no Better Auth or Prisma package/configuration today. `compose.yml` supplies PostgreSQL, API, and web containers but no auth secret, trusted-origin setting, Prisma generation/migration step, cookie proxy policy, or API session forwarding contract. Existing tests are Vitest plus Playwright/browser tests; API tests instantiate in-memory applications and browser tests use ad hoc HTTP fixtures, so auth and cross-user isolation need explicit test fixtures and database lifecycle strategy.

### Affected Areas
- `apps/api/src/server.ts` — Authenticate before every financial read/write/export/import/dashboard endpoint; parse Node headers with Better Auth and preserve CORS/preflight behavior.
- `apps/api/src/composition.ts` — Share the auth/database boundary with the runtime provider and construct user-scoped application/provider access.
- `apps/api/package.json`, `apps/api/src/*` — Add Better Auth handler/session dependencies and Fetch Request/`auth.handler` integration without weakening the custom Node server.
- `apps/web/app/*`, `apps/web/lib/server-api.ts`, `apps/web/lib/dashboard-adapter.ts` — Add Spanish sign-in/sign-up and authenticated route/server-action flows; use `auth.api.getSession({ headers })`, `nextCookies()` last in Server Actions, and forward the incoming cookie to server-side API calls.
- `apps/web/app/api/auth/[...all]/route.ts` (new) — Next catch-all Better Auth handler through `toNextJsHandler`.
- `packages/auth` (new) — Shared Better Auth secret/config, Prisma adapter, trusted origins, and session utilities usable by Next and the Node API; fail startup when a production secret is absent rather than using a default.
- `packages/database` (new or equivalent shared boundary) — Prisma schema/client, PostgreSQL migration/generation, Better Auth `User`, `Session`, `Account`, and `Verification` models, plus ownership relations for financial data.
- `packages/application/src/runtime.ts`, `product.ts`, provider contracts, and mappings — Carry authenticated user identity into all financial operations and require owner-scoped list/read/write/import/export calls.
- `packages/data-provider/src/migrations/001_initial.sql`, `002_transaction_idempotency.sql`, `postgres-provider.ts`, `in-memory-provider.ts` — Replace global access with owner predicates/foreign keys; stage replacement of the raw `pg` provider and SQL migrations under Prisma's single migration authority.
- `packages/core/src/account.ts`, `transaction.ts`, `portability.ts` — Add ownership at the persistence/application boundary without leaking it into public export DTOs unless ownership is required for import semantics.
- `compose.yml`, `Dockerfile`, env/config files, and root/package manifests — Provide `BETTER_AUTH_SECRET`, trusted origins, database URL, Prisma generate/migrate startup ordering, and secure self-host defaults.
- `apps/api/test/*`, `apps/web/test/*`, `packages/data-provider/test/*` — Add unauthenticated denial, cookie forwarding, two-user isolation, import/export ownership, CSRF/trusted-origin, and migration tests.
- `openspec/specs/finance-core/spec.md`, `local-data-portability/spec.md`, and relevant web/runtime specs — Existing singleton/global assumptions must be delta-reviewed before implementation.

### Approaches
1. **Shared `packages/auth` + Prisma ownership boundary (recommended)** — Introduce Better Auth v1.6.23 with the Prisma PostgreSQL adapter and shared auth configuration. Prisma is the single target ORM and migration authority for Better Auth tables and financial PostgreSQL ownership. Baseline/import the existing SQL migration state into Prisma migration history, then replace the raw `pg` provider/migrations in stages; Prisma owns all forward schema changes. Add auth tables and owner keys/relations, then make the application/provider API accept a user scope. Next uses the catch-all handler and server session API; the custom API validates the same session with `fromNodeHeaders` before dispatch. Deliver in chained slices: schema/auth foundation, ownership/data access, API enforcement, Next UI/actions, then hardening and migration/rollback verification.
   - Pros: One session contract, self-hostable PostgreSQL deployment, explicit ownership guarantees, least chance of Next/API divergence, rollbackable slices.
    - Cons: Requires schema migration and broad provider/application signature changes; existing global data needs an explicit migration policy, and the staged provider replacement needs rollback/export tooling.
   - Effort: High

2. **Shared Better Auth first, defer ownership** — Add Better Auth and gate all existing endpoints, but keep the singleton provider/data model temporarily.
   - Pros: Smaller initial diff and quick login/session plumbing.
   - Cons: NOT secure for financial use; every authenticated user sees the same accounts/transactions. It can only be a fail-closed foundation with financial data still disabled, not a usable product slice.
   - Effort: Medium, but insufficient as a release boundary

3. **Separate auth service/Next-only sessions with API bearer forwarding** — Keep auth in the web app and forward a token to the Node API, or introduce a separate identity service.
   - Pros: Less shared-package work initially; can isolate deployment concerns.
   - Cons: Violates the requested shared self-hostable boundary, duplicates session validation, complicates cookies/CORS/CSRF and direct API clients, and still requires ownership changes.
   - Effort: High

### Recommendation
Choose Approach 1, with the smallest secure outcome defined as **one authenticated user's isolated financial workspace**. Do not resume authenticated dashboard/account/transaction workflows until ownership is enforced in both database queries and application/provider contracts. Prisma is the single target ORM and migration authority for both Better Auth and financial PostgreSQL ownership: baseline/import the existing SQL migrations into Prisma migration history, replace the raw `pg` provider and hand-applied migrations in staged slices, and let Prisma own all forward schema changes. The rollout must include a rollback/export strategy for each provider and migration step; it must not become an indefinite bridge or dual-write system. Every query, mutation, dashboard aggregation, export, and import must receive the authenticated user id; imports must not accept or overwrite another user's identifiers without owner checks. Existing global rows need a staged policy: assign them to an explicit bootstrap owner only when configured, otherwise quarantine/disable them rather than exposing them.

Use a feature-branch chain under the 800-line review budget. The likely slices are: (1) auth/database package and env/migration foundation; (2) owner-aware schema/provider/application contracts and tests; (3) API session middleware/handler and endpoint enforcement; (4) Next handler, session-aware server calls/actions, and Spanish auth UI; (5) Docker, migration/rollback tooling, CSRF/CORS/cookie hardening, and end-to-end isolation tests. Each slice must include its tests and a rollback boundary; the tracker remains non-mergeable until the full boundary is present.

### Risks
- Authentication without `userId` predicates is a cross-user financial data disclosure; this is the primary blocker, not a follow-up enhancement.
- Existing `pg` migrations/provider and requested Prisma adapter can diverge during replacement; Prisma must be the only forward migration authority, with baselining/import, startup ordering, rollback, and export procedures verified.
- Cookies sent from Next Server Actions to the internal API require explicit header forwarding; browser CORS and trusted origins must not be confused with server-to-server requests.
- Better Auth must use a non-default secret; self-hosting needs documented generation and startup failure behavior, not a checked-in fallback.
- `SameSite`, secure-cookie behavior behind reverse proxies, trusted origins, CORS credentials, and CSRF protection must be tested for local HTTP and production HTTPS separately.
- In-memory test providers can accidentally bypass ownership; tests need two authenticated principals against a real isolated database or an owner-aware fake with equivalent predicates.
- Existing global data, idempotency keys, exports, imports, seed/reset routes, and transaction/account foreign keys need an explicit migration, quarantine, rollback, and export plan while the raw `pg` provider is replaced.
- Direct API callers may not have browser cookies; the supported contract must define cookie session forwarding and reject unauthenticated direct access rather than silently accepting a weaker credential.

### Ready for Proposal
Yes, provided the proposal makes ownership a hard acceptance boundary: authenticated access alone is not sufficient, and global financial rows must remain unavailable until assigned or migrated safely. The proposal should preserve the existing Spanish fail-closed root while adding Spanish auth entry points, use the requested Better Auth v1.6.23 patterns, name the Prisma-versus-existing-provider migration decision, and define the feature-branch-chain slices plus per-slice verification and rollback.

### Result Contract
- status: ready
- executive_summary: Better Auth must share a Prisma-backed PostgreSQL boundary with financial ownership; authenticated access is not releasable until every financial operation is owner-scoped and fails closed. Prisma is the single ORM and forward migration authority, with the existing raw `pg` provider and SQL migrations baselined/imported and replaced in stages rather than retained as an indefinite bridge or dual-write path.
- artifacts: `openspec/changes/better-auth-financial-boundary/exploration.md`
- next_recommended: Create the proposal and design for the five-slice feature-branch chain, including Prisma migration baselining, raw-`pg` replacement checkpoints, rollback/export strategy, global-row quarantine/bootstrap policy, and two-user isolation verification.
- risks: Cross-user disclosure without database and application owner predicates; migration-authority drift during raw-`pg` replacement; unsafe global-row assignment; cookie/CSRF/trusted-origin mistakes; non-default secret and proxy cookie configuration failures; test providers bypassing ownership; rollback/export gaps.
- skill_resolution: `sdd-explore` applied; `chained-pr` applied to preserve the feature-branch-chain and 800-line slice budget; `work-unit-commits` applied so each slice carries its tests, verification, and rollback boundary. Only this exploration artifact was modified; no source or other artifact edits were made.
