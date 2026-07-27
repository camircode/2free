# Design: Secure Destructive Reset

## Technical Approach

Keep `RuntimeApplication`, providers, schema, and `/import` unchanged. Add an optional fail-closed
capability, enforce the exact `local-offline`/`ci` allowlist in composition, and gate dispatch
before `seed()` or `reset()`. Disabled requests use the existing JSON `404 not_found`. Compose
and `.env.example` already omit the capability, so verify them only; migrate README consumers.

## Architecture Decisions

| Decision | Choice | Alternatives rejected | Rationale |
|---|---|---|---|
| Capability contract | `ENABLE_DESTRUCTIVE_DEVELOPMENT_ROUTES` maps to `RuntimeConfig.destructiveDevelopmentRoutes`; only exact `"true"` enables it. | Truthy/default-enabled parsing or an admin token. | Every other input fails closed without inventing authentication. |
| Profile policy | Allow only `local-offline` and `ci`; reject `compose-cloud-dev` and `cloud-test`. | Host binding, CORS, or every profile. | Reachability and origin are not authorization. |
| Dispatch boundary | `composition.ts` exposes the gate; `createApiServer` checks both gates before either POST branch. | Changing application/provider behavior or returning `401/403`. | Blocks public invocation while preserving direct tests. |
| Delivery | One bounded unit, `fix(api): gate destructive development routes`, with behavior, tests, docs, and migration. | File-type commits. | One complete, reviewable rollback boundary. |

## Data Flow

```text
process.env
   -> loadRuntimeConfig (exact boolean parser)
   -> RuntimeConfig flag + profile
   -> composition allowlist
   -> createApiServer dispatch
        | enabled -> application.seed/reset (existing responses)
        ` disabled -> writeJson(404, { error: "not_found" })
```

Select the disabled branch after path extraction, before body parsing/application calls; return
the unknown-route status, body, and content type without gate disclosure.

## File Changes

| File | Action | Description |
|---|---|---|
| `packages/application/src/config.ts` | Modify | Add the boolean field and strict parser. |
| `apps/api/src/composition.ts` | Modify | Add the profile allowlist helper. |
| `apps/api/src/server.ts` | Modify | Gate both POST dispatches before application calls. |
| `apps/api/test/runtime.test.ts` | Modify | Add matrix, default-profile, and spy tests. |
| `packages/application/test/runtime.test.ts` | Modify | Preserve direct seed/reset coverage. |
| `README.md` | Modify | Remove unconditional curl commands; document deliberate enablement. |
| `compose.yml` | Verify | Confirm default profile omits the capability; no no-op edit. |
| `.env.example` | Verify | Confirm the example omits the capability; no no-op edit. |

No changes to application runtime, providers, migrations, UI, `Dockerfile`, or import behavior.

## Interfaces / Contracts

```ts
type RuntimeConfig = Readonly<{
  // existing fields...
  destructiveDevelopmentRoutes: boolean;
}>;

function parseDestructiveDevelopmentRoutes(value: string | undefined): boolean {
  return value === "true";
}

const allowedProfiles = ["local-offline", "ci"] as const;
```

Enabled: `POST /seed` → `200` and `POST /reset` → `200` `{ reset: true, snapshot }`.
Disabled: `404` and `{ error: "not_found" }`.

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit | Parser and double gate | `it.each` all profiles and omitted, false, empty, exact true, uppercase, whitespace, and malformed values; only exact `true` plus `local-offline`/`ci` enables. |
| Integration | HTTP non-invocation and default Compose profile | Extend `apps/api/test/runtime.test.ts`: omit the capability in `loadRuntimeConfig({ APP_PROFILE: "compose-cloud-dev" })`, post both routes through `createApiServer` with `vi.fn()` seed/reset spies, and assert `404` JSON plus zero calls. Run existing `pnpm --filter @2free/api test` (or root `pnpm test:runtime`). |
| Direct regression | Application/provider contracts | Retain deterministic direct seed/reset and provider tests. |
| E2E | Browser/UI | N/A — no UI changes. |

The `apps/api/test/runtime.test.ts` case is the default-Compose harness. For deployed smoke, from
the repository root:

```sh
docker compose up -d --build
trap 'docker compose down' EXIT
until curl -fsS http://127.0.0.1:3001/health >/dev/null 2>&1; do sleep 1; done
for route in seed reset; do
  status="$(curl -sS -o "/tmp/2free-${route}.json" -w '%{http_code}' -X POST "http://127.0.0.1:3001/${route}")"
  test "$status" = "404"
  test "$(tr -d '\n' < "/tmp/2free-${route}.json")" = '{"error":"not_found"}'
done
```

Compose files are unchanged; this verifies safe defaults.

## Threat Matrix

HTTP routing is covered by the spy matrix; other supplied rows are N/A:

| Boundary | Applicability | Safe/failure behavior | Planned RED tests |
|---|---|---|---|
| Documentation-like paths | N/A — docs are prose only. | No execution. | None |
| Git repository selection | N/A — no VCS automation. | No repository selection. | None |
| Commit state | N/A — no commit automation. | No index/worktree operation. | None |
| Push state | N/A — no push automation. | No destination resolution. | None |
| PR commands | N/A — no PR automation. | No command composition. | None |

## Migration / Rollout

No migration is required. README documents
`APP_PROFILE=local-offline` or `ci` plus `ENABLE_DESTRUCTIVE_DEVELOPMENT_ROUTES=true` for an
isolated harness and removes unconditional destructive curl commands. Eight-file
inventory is `packages/application/src/config.ts`, `apps/api/src/composition.ts`,
`apps/api/src/server.ts`, `apps/api/test/runtime.test.ts`, `packages/application/test/runtime.test.ts`,
`README.md`, `compose.yml`, and `.env.example`. The first six are modified and the last two are
verification-only; rollback reverts only the first six, not provider, schema, or data behavior.
One bounded security work unit.

## Open Questions

- None.
