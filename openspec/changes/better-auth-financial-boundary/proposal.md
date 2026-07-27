# Proposal: Better Auth Financial Boundary

## Intent

Replace the unauthenticated, process-global financial boundary with Better Auth 1.6.23 and owner-scoped PostgreSQL. Prisma is the sole ORM and forward-migration authority: baseline/import raw `pg` history, then replace that provider in stages. Keep finance fail-closed until ownership is complete.

## Scope

### In Scope
- Better Auth/Prisma foundation; non-default secret (startup fails if absent).
- User identity through every layer and every financial read/write/dashboard/export/import; require owner predicates and prove two-user isolation.
- Quarantine global rows unless an explicit bootstrap-owner migration assigns them.
- `toNextJsHandler` catch-all, `auth.api.getSession({ headers })`, final `nextCookies()`, Server Actions, cookie forwarding, and Spanish sign-in/up.
- Custom Node API validates the same session; harden CSRF, trusted origins, cookies, CORS, and proxies.
- Five slices `<800` lines; tracker non-mergeable until complete.

### Out of Scope
- Anonymous finance, default secrets, indefinite raw-`pg` bridge/dual-write, and banking/integrations.

## Capabilities

### New Capabilities
- `better-auth-session`: Shared identity/session, handler, config, Spanish auth.
- `financial-ownership-boundary`: Owner predicates, API enforcement, isolation.
- `prisma-financial-migration`: Prisma authority, replacement, quarantine, export/rollback.

### Modified Capabilities
- `finance-core`: Ownership boundary; preserve money/privacy.
- `local-data-portability`: Owner-scoped atomic portability.

## Approach

1. Auth/database foundation and imported Prisma baseline.
2. Owner schema/relations, predicates, scoped contracts, quarantine, and isolation.
3. Node API session middleware and endpoint enforcement.
4. Next handler/session/actions and Spanish auth UI; retain the fail-closed root.
5. Cookie/CSRF/origin/proxy hardening, rollback/export, raw-`pg` replacement, and E2E gates.

## Affected Areas

| Area | Impact | Description |
|---|---|---|
| `packages/auth`, `packages/database` | New | Auth/Prisma schema/session. |
| `packages/application`, `packages/data-provider` | Modified | Scoped contracts/provider. |
| `apps/api/src/{server,composition}.ts`; `apps/web/**` | New/Modified | Session API and Next auth/UI. |
| Compose, Docker, env, migrations, tests | Modified | Hardening/isolation gates. |

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Missing predicates leak finances | High | Predicates and two-user tests. |
| Migration drift or unsafe assignment | High | Baseline, quarantine, export. |
| Cookie/CSRF/proxy divergence | Med | Same-session HTTP/HTTPS tests. |

## Rollback Plan

Revert slices independently; retain the prior provider and fail-closed Next state until checkpoints pass. Export before migration; restore verified backup/export and quarantine ownerless rows. Never use weaker credentials or dual-write.

## Dependencies

- PostgreSQL/Compose, Better Auth 1.6.23, Prisma.
- Blocks `next-web-spanish-ui-integration` Phase 4; migration amends active `runnable-product-foundation` runtime/provider specs.

## Success Criteria

- [ ] Every financial read/write, dashboard, export, and import requires the session and owner predicate; two users are isolated.
- [ ] Global rows stay quarantined without bootstrap ownership; malformed/cross-owner imports are atomic.
- [ ] Next/API session parity, Spanish auth, no-default-secret startup, and origin/cookie/CSRF/proxy hardening pass.
- [ ] Prisma owns forward migrations, raw `pg` replacement, rollback/export, and tracker release after five slices.
