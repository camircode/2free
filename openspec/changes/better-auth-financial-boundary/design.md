# Design: Better Auth Financial Boundary

## Approach

Pin `better-auth@1.6.23`; pin `prisma`, `@prisma/client`, and `@prisma/adapter-pg` to `7.9.0`. `@2free/auth` owns sessions and `@2free/database` owns Prisma/migrations. The flow is identity -> `FinanceScope` -> application -> owner predicates. Finance remains locked through Slice 4; raw `pg` is rollback-only, never dual-written, and is deleted after Slice 5.

## Decisions

| Decision | Choice / rationale |
|---|---|
| Auth | Shared core; Next appends `nextCookies()` last, so the API has no Next dependency. |
| DB | Baseline/import legacy SQL, then Prisma-only forward migrations to prevent drift. |
| Scope | Every application/provider operation and factory is owner-scoped; authentication alone is not isolation. |

## Flow

`Request -> session -> FinanceScope -> application -> provider -> Prisma -> DTO`.

## Contracts

```ts
type FinanceScope = Readonly<{ ownerId: string }>;
type OwnerExportV1 = Readonly<{
  version: 1; ownerId: string; accounts: readonly AccountDto[];
  transactions: readonly TransactionDto[];
}>;

interface FinanceProvider {
  createAccount(scope: FinanceScope, input: AccountInput): Promise<Account>;
  createTransaction(scope: FinanceScope, input: TransactionInput,
    idempotencyKey: string, requestFingerprint: string): Promise<Transaction>;
  listAccounts(scope: FinanceScope): Promise<readonly Account[]>;
  listTransactions(scope: FinanceScope): Promise<readonly Transaction[]>;
  export(scope: FinanceScope): Promise<string>;
  import(scope: FinanceScope, serialized: string): Promise<void>;
  reset(scope: FinanceScope): Promise<void>;
}
type FinanceProviderFactory = (scope: FinanceScope) => FinanceProvider;

interface FinanceApplication {
  listAccounts(scope: FinanceScope): Promise<readonly AccountDto[]>;
  createAccount(scope: FinanceScope, input: AccountCommand): Promise<AccountDto>;
  listTransactions(scope: FinanceScope): Promise<readonly TransactionDto[]>;
  createTransaction(scope: FinanceScope, input: TransactionCommand,
    key: string): Promise<TransactionDto>;
  dashboard(scope: FinanceScope): Promise<DashboardView>;
  snapshot(scope: FinanceScope): Promise<SnapshotView>;
  export(scope: FinanceScope): Promise<string>;
  import(scope: FinanceScope, serialized: string): Promise<SnapshotView>;
  seed(scope: FinanceScope): Promise<SeedResult>;
  reset(scope: FinanceScope): Promise<SnapshotView>;
}
```

`data-provider` owns `FinanceScope`, both provider contracts/factories, `AccountDto`, `TransactionDto`, `OwnerExportV1`, canonical export/import, and persistence mapping. `createPrismaFinanceProviderFactory(prisma, deps)` and the owner-aware in-memory factory return `FinanceProviderFactory`; the factory binds and checks the supplied scope. `core` owns entities/money/privacy; `application` owns commands/views/results; HTTP owns wire DTOs. DTOs never contain `ownerId`; only the data-provider-owned versioned owner envelope does, and it must equal the session scope.

`export(scope)` selects only that owner’s rows, sorts accounts and transactions by `id` ascending, recursively sorts metadata keys, emits envelope keys in fixed order, and uses compact canonical UTF-8 JSON with no `undefined` values. This is the sole export serializer.

## Schema

PostgreSQL uses generator `prisma-client` -> `../generated/client`; `prisma.config.ts` owns `DATABASE_URL` and migrations. `@2free/database/generated/client` is exported; `src/client.ts` uses `PrismaClient({ adapter: PrismaPg })`, a Next-dev singleton, and shutdown close. `advanced.database.generateId: () => crypto.randomUUID()` is used.

Better Auth keeps standard `User`, `Session`, `Account`, and `Verification` adapter fields, mapped to `auth_*`, with unique email/token and user/identifier indexes. `User` also has `financeAccounts`, `transactions`, `idempotencies`, `quarantinedRows`, and `migrationAudits` relations.

```prisma
model FinanceAccount {
  id String @id
  ownerId String @map("owner_id")
  type String
  label String
  currency String
  metadata Json
  statementBalanceCoefficient String?
  statementBalanceScale Int?
  createdAt DateTime @default(now()) @map("created_at")
  owner User @relation("FinanceAccountOwner", fields: [ownerId], references: [id], onDelete: Cascade)
  transactions FinanceTransaction[]
  @@unique([id, ownerId])
  @@index([ownerId])
  @@map("accounts")
}
model FinanceTransaction {
  id String @id
  ownerId String @map("owner_id")
  accountId String @map("account_id")
  currency String
  amountCoefficient String
  amountScale Int
  metadata Json
  createdAt DateTime @default(now()) @map("created_at")
  owner User @relation("FinanceTransactionOwner", fields: [ownerId], references: [id], onDelete: Cascade)
  account FinanceAccount @relation(fields: [accountId, ownerId], references: [id, ownerId], onDelete: Restrict)
  idempotency TransactionIdempotency? @relation("TransactionIdempotencyTransaction")
  @@unique([id, ownerId])
  @@index([ownerId, accountId])
  @@map("transactions")
}
model TransactionIdempotency {
  id String @id
  ownerId String @map("owner_id")
  key String
  requestFingerprint String @map("request_fingerprint")
  transactionId String @map("transaction_id")
  createdAt DateTime @default(now()) @map("created_at")
  owner User @relation("TransactionIdempotencyOwner", fields: [ownerId], references: [id], onDelete: Cascade)
  transaction FinanceTransaction @relation("TransactionIdempotencyTransaction", fields: [transactionId, ownerId], references: [id, ownerId], onDelete: Cascade)
  @@unique([ownerId, key])
  @@unique([transactionId, ownerId])
  @@index([ownerId])
  @@index([transactionId, ownerId])
  @@map("transaction_idempotency")
}
model QuarantinedFinancialRow {
  id String @id
  sourceTable String @map("source_table")
  sourceId String @map("source_id")
  payload Json
  reason String
  ownerId String? @map("owner_id")
  migrationAuditId String @map("migration_audit_id")
  owner User? @relation("QuarantineOwner", fields: [ownerId], references: [id], onDelete: SetNull)
  migrationAudit MigrationAudit @relation(fields: [migrationAuditId], references: [id], onDelete: Restrict)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  @@unique([sourceTable, sourceId])
  @@index([ownerId])
  @@index([migrationAuditId])
  @@map("quarantined_financial_rows")
}
model MigrationAudit {
  id String @id
  command String
  operatorId String @map("operator_id")
  checksum String
  rowCount Int @map("row_count")
  assignedCount Int @map("assigned_count")
  quarantinedCount Int @map("quarantined_count")
  action String
  createdAt DateTime @default(now()) @map("created_at")
  operator User @relation("MigrationAuditOperator", fields: [operatorId], references: [id], onDelete: Restrict)
  rows QuarantinedFinancialRow[]
  @@index([operatorId])
  @@index([checksum])
  @@index([action, createdAt])
  @@map("migration_audits")
}
```

The composite `FinanceTransaction(accountId, ownerId) -> FinanceAccount(id, ownerId)` and `TransactionIdempotency(transactionId, ownerId) -> FinanceTransaction(id, ownerId)` relations prove owner equality in the database. A transaction stores the canonical request fingerprint: same owner/key plus same fingerprint replays; same owner/key plus a different payload rejects without mutation; a cross-owner collision returns the same generic error and discloses nothing.

## Routing

Routes: `GET/POST /accounts`, `GET/POST /transactions`, `GET /dashboard`, `GET /snapshot`, `GET /export`, `POST /import`, `POST /seed`, `POST /reset`. Session and scope precede body parsing/provider access. Public routes are health/version/auth; unknown routes are `404`, invalid sessions `401`. Seed uses an exact owner marker and rolls back on marker/ID collision. Reset deletes only that owner’s finance/idempotency rows. Import validates schema, privacy, identity, and references before and inside one transaction; collisions are generic and nondisclosing. Idempotency rows are never exported/imported; portability carries no replay reservations, and destination keys use the normal fingerprint policy.

## Transport

`auth/src/core.ts` exports `createCoreAuth(prisma, secret, baseURL, trustedOrigins)` with `prismaAdapter`; the API exports it without Next, while Next appends `[...plugins, nextCookies()]` last. The catch-all uses `toNextJsHandler`; `proxy.ts` calls full-DB `nextAuth.api.getSession({ headers: request.headers })`, never cookie-only. Matchers cover `/cuentas`, `/transacciones`, `/portabilidad`, and `/dashboard`; auth pages remain Spanish.

`serverApiFetch` forwards `cookie`, `origin`, `referer`, `content-type`, and `idempotency-key`, preserves streamed body/`duplex: "half"`, `cache: "no-store"`, status/error text, and repeated `Set-Cookie`. State changes require exact Origin, or exact Referer when Origin is absent. CORS is credentialed, explicit-origin, `Vary: Origin`, never `*`.

Cookies are host-only: omit `Domain` entirely, always use `Path=/`, `HttpOnly`, and `SameSite=Lax`; local HTTP uses `Secure=false`, while production HTTPS (including trusted-proxy HTTPS) uses `Secure=true`. `TRUSTED_PROXY_CIDRS` is the source allowlist, matched against the normalized socket peer. Untrusted peers sending `Forwarded` or `X-Forwarded-Proto` are rejected. For a trusted peer, accept exactly one `Forwarded: proto=http|https`; if absent, accept exactly one `X-Forwarded-Proto: http|https`; if both exist they must agree and `Forwarded` wins. Comma-separated, malformed, conflicting, or unsupported values are rejected; with no forwarded header use the direct socket scheme.

## Files

Create database/auth, Prisma schema/migrations/client/bootstrap/restore, auth pages/actions, catch-all, and `apps/web/proxy.ts`; modify manifests/lockfile, API/application/provider/Next, Compose/Docker/env/tests. Slice 5 deletes `migratePostgres`, readiness, direct `pg`, `postgres-provider.ts`, and raw SQL; retain the fake provider.

## Testing

Unit: config, scope, fingerprint, canonical envelope, fake provider. Integration: Prisma schema/FKs/composite owner relations, two users, atomic portability/reset/seed, quarantine/bootstrap/restore, and migration preconditions. E2E: cookies/proxy/bridge, Spanish auth, CORS/CSRF, and HTTP/HTTPS/Docker.

## Threats

| Boundary | Applicability / safe-failure / concrete RED |
|---|---|
| HTTP routing/process | Applicable: allowlist and session-first; safe `401`/`404`/cookie/status; reject unauthenticated, forged, unknown, malformed, repeated-cookie, and cross-owner routes. |
| Shell/migration process | Applicable: Prisma is sole DDL service; abort failures; RED secret/command/fresh/existing/partial/drift/API-before-migration. |
| Documentation-like paths | N/A — no executable classifier. |
| Git repository selection | N/A — no repository selector. |
| Commit state | N/A — no commit automation. |
| Push state | N/A — no push automation. |
| PR commands | N/A — chain topology only; no command composition. |

Additional REDs: two-user operations; same-key/same-payload replay and same-key/different-payload rejection; envelope/version/identity mismatch; canonical ordering; duplicate IDs/FKs/composite owner relations; quarantine audit/bootstrap; CORS/proxy header ambiguity; local HTTP/production HTTPS. Copy these unchanged to `tasks.md`.

## Migration

Prisma is terminal. **Fresh**: no legacy tables or `_prisma_migrations`; deploy creates all. **Existing**: exactly legacy three tables plus `schema_migrations` v1/v2, no owner/auth partials; `prisma migrate resolve --applied 00000000000000_legacy_pg_baseline`, then deploy. **Partial** or **drift**: abort/repair; nonzero `prisma migrate diff --from-url "$DATABASE_URL" --to-schema-datamodel prisma/schema.prisma --exit-code` aborts. Compose runs `pnpm --filter @2free/database db:migrate` before API; readiness is Prisma connect/`SELECT 1`; delete `migratePostgres` readiness.

`db:bootstrap -- --owner-id <verified-user> --confirm` validates the named Better Auth user, never request identity, then one Prisma transaction quarantines rows and audits operator/command/checksum/counts. `db:restore -- --input export.v1.json --confirm` restores a verified export without overwriting and audits rollback. Export/quarantine precede destruction.

## Tasks

Tracker `chain/better-auth-financial-boundary` is non-mergeable and bases `main`; `slice-1` bases the tracker and later slices base predecessors. Each slice is `<800` lines with code, REDs, command, and rollback: (1) auth/db `260/760`; `pnpm install --frozen-lockfile && pnpm --filter @2free/database db:generate && pnpm --filter @2free/database test`; RED secret/schema/fresh; snapshot rollback. (2) owner `300/780`; `pnpm --filter @2free/database test && pnpm --filter @2free/data-provider test && pnpm --filter @2free/application test`; RED two-user/FK/composite-owner/fingerprint/export; quarantine/export rollback. (3) Node `260/760`; `pnpm --filter @2free/api test`; RED `401`/allowlist/bridge/forwarded-source; revert/keep `503`. (4) Next `300/790`; `pnpm --filter @2free/web typecheck && pnpm test:browser`; RED DB session/cookies/Spanish; Next/root rollback. (5) cutover `360/795`; `pnpm check && pnpm test:browser && docker compose up --build`; RED migration/rollback/CORS/proxy-header/HTTP-HTTPS/E2E; restore/delete raw `pg`.

Slices 1–4 enforce immutable `FINANCE_BOUNDARY_LOCKED`; any failed gate keeps financial workflows fail-closed (`503`). Slice 5 unlocks only after evidence. Phase 4 consumes `serverApiFetch`, views, owner-safe actions, and Spanish auth; it recreates no auth, proxy, persistence, or DTOs.

## Exclusions

Anonymous finance, default secrets, dual-write, banking, integrations, sync, social login, roles, recovery email, budgets, investments, and unrelated scope.

## Result Contract

- status: ready
- executive_summary: Better Auth 1.6.23 plus Prisma 7.9.0 provide one authenticated owner boundary; Prisma alone migrates forward, raw `pg` ends after five fail-closed slices, and cross-owner data is undisclosable.
- artifacts: `openspec/changes/better-auth-financial-boundary/design.md`
- next_recommended: Run `sdd-tasks`; preserve five predecessor slices and every applicable threat RED unchanged.
- risks: Predicate omission; migration drift; bootstrap/import disclosure; cookie/CORS/CSRF/proxy; rollback gaps.
- skill_resolution: `sdd-design`, `cognitive-doc-design`, `chained-pr`, `work-unit-commits` applied; only this artifact modified.

## Open Questions

None.
