# Apply Progress: Secure Destructive Reset

## Status

- **Change**: `secure-destructive-reset`
- **Artifact store**: OpenSpec
- **Mode**: Standard tooling mode with explicit RED/GREEN/REFACTOR evidence required by the task contract
- **Delivery**: `force-chained`, `feature-branch-chain`
- **Work unit**: One atomic security unit, `fix(api): gate destructive development routes`
- **Review budget**: 800 authored changed lines

## Completed Tasks

- [x] 1.1 Add the configuration capability matrix covering omitted, false, empty, malformed, uppercase, whitespace, and exact `true`.
- [x] 1.2 Add the profile/capability HTTP matrix for `local-offline`, `ci`, `compose-cloud-dev`, and `cloud-test`.
- [x] 1.3 Add disabled-route spy tests proving identical `404 not_found` responses and zero application calls.
- [x] 2.1 Add the strict `ENABLE_DESTRUCTIVE_DEVELOPMENT_ROUTES === "true"` parser and runtime field.
- [x] 2.2 Add the exact `local-offline`/`ci` composition allowlist and exported double-gate helper.
- [x] 2.3 Gate `/seed` and `/reset` after path extraction and before application dispatch.
- [x] 2.4 Preserve direct application/provider seed/reset behavior and leave providers, schema, `/import`, and unrelated mutations unchanged.
- [x] 3.1 Remove unconditional destructive README commands and document deliberate local/CI enablement.
- [x] 3.2 Verify `compose.yml` and `.env.example` omit the capability without editing either file.
- [x] 3.3 Run normalizers, focused tests, root checks, and the exact Compose smoke with cleanup.

## TDD Cycle Evidence

| Task | Test file | RED | GREEN | REFACTOR |
|------|-----------|-----|-------|----------|
| 1.1 | `packages/application/test/runtime.test.ts` | ✅ Written; 7 failures / 2 existing tests passed | ✅ `pnpm --filter @2free/application test`: 9 passed | ✅ Composition cleanup retained 9 passed |
| 1.2 | `apps/api/test/runtime.test.ts` | ✅ Written; matrix failures exposed ungated 200 responses | ✅ `pnpm --filter @2free/api test`: 37 passed | ✅ Composition cleanup retained 37 passed |
| 1.3 | `apps/api/test/runtime.test.ts` | ✅ Written; disabled spy test received 200 and invoked calls | ✅ Same focused API command: 37 passed | ✅ Same focused API command: 37 passed |
| 2.1 | `packages/application/src/config.ts` | ✅ Configuration assertions referenced the missing field | ✅ Exact literal parser passes all 9 application tests | ✅ No behavior-changing refactor required |
| 2.2 | `apps/api/src/composition.ts` | ✅ HTTP matrix failed on profile/capability combinations | ✅ Double gate passes through API matrix | ✅ Typed allowlist cleanup retained 37 API tests |
| 2.3 | `apps/api/src/server.ts` | ✅ Disabled requests reached the application | ✅ Disabled routes return 404; enabled routes return 200 | ✅ Gate remains before dispatch/body parsing |
| 2.4 | `packages/application/test/runtime.test.ts` | ✅ Existing direct regression remained the safety net | ✅ Direct seed/reset behavior remains covered | ✅ Runtime/provider production code unchanged |

## Work Unit Evidence

| Evidence | Result |
|----------|--------|
| Focused test command and exact result | `pnpm --filter @2free/application test` → 9/9 passed; `pnpm --filter @2free/api test` → 37/37 passed after implementation and refactor. |
| Runtime harness command and exact result | `sg docker -c 'docker compose up -d --build; ...'` exact Compose smoke → `seed: 404 {"error":"not_found"}` and `reset: 404 {"error":"not_found"}`; cleanup `docker compose down` completed successfully. The first unwrapped invocation was blocked by Docker socket permissions, then the same smoke ran under the active `docker` group via `sg`. |
| Rollback boundary | Revert only `packages/application/src/config.ts`, `packages/application/test/runtime.test.ts`, `apps/api/src/composition.ts`, `apps/api/src/server.ts`, `apps/api/test/runtime.test.ts`, and `README.md`; leave Compose/env verification, providers, schema, UI, import, and direct data behavior intact. |

## Final Verification Evidence

- Source-mutating normalizer: `pnpm exec prettier --write` over the six bounded product/test/docs files; source files were formatted before final checks.
- Focused tests: application `9/9` passed; API `37/37` passed.
- Root checks: `pnpm check` passed — formatting, ESLint, TypeScript, core `33/33`, data-provider `15/15` with `3` skipped, runtime application `9/9`, runtime API `37/37`, and UI `36/36`.
- Compose smoke: exact build/start/health/POST/cleanup flow passed under `sg docker -c`; both disabled routes returned the identical JSON body and `404` status.
- Changed-line snapshot: six bounded files show `386` additions and `29` deletions in the working-tree diff (`415` authored additions/deletions counted by the local diff view); SDD artifacts are excluded from that count.
- Verification-only files: `compose.yml` and `.env.example` were read and remained unedited by this unit.

| File | Additions | Deletions |
|------|-----------|-----------|
| `packages/application/src/config.ts` | 8 | 0 |
| `packages/application/test/runtime.test.ts` | 40 | 0 |
| `apps/api/src/composition.ts` | 18 | 4 |
| `apps/api/src/server.ts` | 88 | 9 |
| `apps/api/test/runtime.test.ts` | 205 | 8 |
| `README.md` | 27 | 8 |

## Implementation Notes

- Capability parsing is literal-only: only the exact string `"true"` enables the runtime field.
- The API helper requires both the capability and profile `local-offline` or `ci`.
- Disabled POST requests use the existing JSON `404 not_found` response before `seed()`/`reset()` dispatch.
- No auth, secret, Better Auth, provider, schema, UI, or import changes were made.

## Remaining Work

- No remaining implementation tasks.
