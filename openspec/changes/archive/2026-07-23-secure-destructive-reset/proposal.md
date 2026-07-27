# Proposal: Secure Destructive Reset

## Intent

Prevent accidental network access to destructive development mutations. `POST /seed` and
`POST /reset` currently dispatch through the reachable API without authentication; CORS and
loopback publishing are not authorization boundaries. Preserve deterministic local/CI setup
without inventing an admin identity system.

## Scope

### In Scope
- Require an explicit validated capability **and** the `local-offline`/`ci` profile for both routes.
- Make omitted, false, empty, invalid, and disallowed settings fail closed; disabled routes return non-discoverable `404 not_found`.
- Prove disabled HTTP never calls injected application `seed()`/`reset()` while preserving direct application/provider tests.
- Remove unconditional commands from Compose/self-host defaults, operational docs, and affected consumers; document controlled local/CI use.

### Out of Scope
- Default/admin secrets, Better Auth, partial authentication, schema/provider weakening, UI work, and broad import changes.
- Changes to direct application/provider reset behavior or unrelated mutations such as `/import`.

## Capabilities

### New Capabilities
- `destructive-development-routes`: Fail-closed, profile-restricted HTTP exposure of deterministic development seed/reset operations.

### Modified Capabilities
- None. Existing local provider/application behavior remains the direct deterministic test boundary.

## Approach

Validate a dedicated capability in runtime configuration, require the allowlisted profile in API
composition, and register/dispatch both routes only when both gates pass. Omit the capability from
`compose.yml` and `.env.example` defaults. Add configuration matrix and API spy tests proving
disabled requests cannot reach the application. Update `README.md` and smoke consumers; leave
`RuntimeApplication` and provider reset intact.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `apps/api/src/server.ts`, `apps/api/src/composition.ts` | Modified | Suppress routes unless both gates pass. |
| `packages/application/src/config.ts` | Modified | Validate capability input fail-closed. |
| `apps/api/test/runtime.test.ts`, `packages/application/test/runtime.test.ts` | Modified | HTTP non-invocation and direct deterministic proof. |
| `README.md` | Modified | Safe defaults and consumer migration. |
| `compose.yml` | Verification-only | Confirm the default profile omits the capability; make no changes. |
| `.env.example` | Verification-only | Confirm the example omits the capability; make no changes. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Misconfiguration exposes routes in a shared environment | Med | No default, strict parsing, allowlist, and matrix tests. |
| Existing smoke workflows depend on HTTP seed/reset | Med | Update consumers and document deliberate local/CI enablement. |
| Future tooling exposes provider reset directly | Low | Keep reset explicit for future auth work. |

## Rollback Plan

Revert only API capability/configuration, Compose/default, documentation, consumer, and test
changes. Do not revert provider schema or application data behavior; any re-enable remains isolated
to local/CI.

## Dependencies

- Existing runtime configuration, API harness, and application/provider contracts.

## Success Criteria

- [ ] Default Compose/self-host returns `404` for both routes without calling injected `seed()`/`reset()`.
- [ ] Only explicit capability plus `local-offline`/`ci` exposes routes; all other combinations fail closed.
- [ ] Direct and API regression tests pass; docs and consumers contain no unconditional destructive commands.
