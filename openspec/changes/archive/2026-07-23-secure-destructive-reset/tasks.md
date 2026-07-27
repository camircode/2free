# Tasks: Secure Destructive Reset

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 450–650 authored lines |
| 400-line budget risk | Medium |
| Chained PRs recommended | Yes |
| Suggested split | One atomic first work unit/PR in the feature-branch chain; do not split implementation, security tests, and docs because they form one safety boundary |
| Delivery strategy | force-chained |
| Chain strategy | feature-branch-chain |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Complete the atomic secure destructive-route implementation, security regression tests, and consumer documentation; do not split this safety boundary | PR #1; base = feature/tracker branch | `pnpm --filter @2free/api test && pnpm --filter @2free/application test` | Exact Compose smoke: `docker compose up -d --build`; POST `/seed` and `/reset` must each return `404`/`{"error":"not_found"}`; `docker compose down` cleanup | Revert the six modified files only; leave compose/env verification, providers, schema, UI, import, and direct data behavior intact |

## Phase 1: RED Tests and Configuration Contract

- [x] 1.1 In `packages/application/test/runtime.test.ts`, add failing matrix tests for omitted, `false`, empty, malformed, uppercase, whitespace, and exact `true`; only exact `true` parses enabled.
- [x] 1.2 In `apps/api/test/runtime.test.ts`, add failing profile/capability matrix tests proving only `local-offline`/`ci` plus enabled capability opens both routes; all other combinations return `404`.
- [x] 1.3 Add failing spy tests in `apps/api/test/runtime.test.ts` for disabled `/seed` and `/reset`: identical JSON `404 not_found`, zero `seed()`/`reset()` calls, and no gate disclosure.

## Phase 2: GREEN Gate Implementation

- [x] 2.1 Modify `packages/application/src/config.ts` with `destructiveDevelopmentRoutes` and exact fail-closed `ENABLE_DESTRUCTIVE_DEVELOPMENT_ROUTES === "true"` parsing.
- [x] 2.2 Modify `apps/api/src/composition.ts` with the exact `local-offline`/`ci` profile allowlist and exported double-gate result.
- [x] 2.3 Modify `apps/api/src/server.ts` to check the composed gate after path extraction and before body parsing/application calls; preserve enabled `200` responses and disabled `404` behavior.
- [x] 2.4 Preserve direct application/provider seed/reset behavior in `packages/application/test/runtime.test.ts`; do not alter providers, schema, `/import`, or unrelated mutations.

## Phase 3: Consumer Migration and Verification

- [x] 3.1 Modify `README.md` to remove unconditional destructive curl commands and document deliberate `local-offline`/`ci` capability enablement.
- [x] 3.2 Verify `compose.yml` and `.env.example` omit capability defaults; make no changes to either file.
- [x] 3.3 Run focused tests, full checks, and the exact Compose smoke command; confirm no auth/secret/schema/provider/UI/import drift and no more than six modified files.
