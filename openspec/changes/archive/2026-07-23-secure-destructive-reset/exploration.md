## Exploration: secure-destructive-reset

### Current State
The API creates a PostgreSQL-backed `RuntimeApplication` in `apps/api/src/composition.ts`. The
runtime application exposes `seed()` and `reset()` in `packages/application/src/runtime.ts`; reset
delegates to the provider's optional `reset()` method, and the PostgreSQL provider truncates
`transaction_idempotency`, `transactions`, and `accounts`.

`apps/api/src/server.ts` currently publishes both `POST /seed` and `POST /reset` without any
authentication or environment check. The route is reachable through the same server created for
Compose and is therefore reachable by any client able to reach the API port. CORS only controls
browser-origin headers and is not authorization. `POST /import` is also a state-mutating route, but
its provider contract validates and rejects conflicting/unsafe imports atomically; it is not the
unconditional database wipe demonstrated by `/reset`.

Runtime profiles are validated but currently have no capability semantics. The default profile is
`compose-cloud-dev`; Compose binds the API to loopback on the host, but the container listens on
`0.0.0.0`, and network reachability is not a security boundary. The README currently documents both
destructive commands. Application tests intentionally exercise deterministic seed/reset directly,
while the API runtime test currently proves normal routes but does not prove that public HTTP cannot
reach `application.reset()`.

The product may later use Better Auth, but no authentication boundary exists in this bounded change.
Adding a partial auth system or inventing an admin identity model would expand the security surface
and exceed the requested fix.

### Affected Areas
- `apps/api/src/server.ts` — remove or capability-gate the public `/reset` and `/seed` dispatches; add an HTTP regression test proving a public request cannot invoke `application.reset()`.
- `packages/application/src/config.ts` — if an opt-in capability is retained, validate it fail-closed as an explicit runtime setting rather than inferring authorization from CORS or host binding.
- `apps/api/test/runtime.test.ts` — cover default production/self-host behavior and ensure injected applications are not called through disabled destructive routes.
- `packages/application/test/runtime.test.ts` — preserve direct deterministic `seed()`/`reset()` coverage; these are test/dev application capabilities, not evidence that HTTP exposure is safe.
- `compose.yml` — do not enable destructive HTTP capabilities by default; if an opt-in is supported, require an explicit developer-only environment value and keep it absent from the default service environment.
- `README.md` — remove unconditional public reset/seed curl commands and document the safe deterministic test/dev mechanism, if one remains.
- `packages/data-provider/src/postgres-provider.ts` — no production behavior should be weakened; retain provider reset only for explicitly controlled application/test use.
- `packages/application/src/runtime.ts` — likely unchanged if the boundary is enforced at HTTP composition; verify direct application reset remains deterministic and isolated.
- `openspec/specs/local-data-portability/spec.md` — review for compatibility with local deterministic workflows; no portability requirement should imply a public destructive endpoint.

### Approaches
1. **Remove destructive HTTP routes entirely** — delete `POST /reset` and `POST /seed` from the API; retain direct application/provider capabilities for tests and controlled local tooling.
   - Pros: smallest public attack surface; no secret lifecycle; no production route discoverability; fail-closed by construction; simplest proof that HTTP cannot reach reset.
   - Cons: existing Compose/README smoke workflows lose their HTTP seed/reset commands; a future controlled dev workflow needs a CLI or test harness.
   - Effort: Low

2. **Explicit environment/profile capability gate** — keep the routes only when an explicit,
   validated opt-in is enabled for a narrowly defined local/CI profile; default the capability to
   disabled, including Compose and self-host defaults. Gate `/seed` alongside `/reset` because both
   are administrative mutation endpoints and exposing one advertises the other as an admin surface.
   - Pros: preserves deterministic HTTP setup for deliberate local/CI harnesses; no authentication
     system is invented; fail-closed and auditable when the setting has no default; can hide routes
     entirely (404) when disabled.
   - Cons: adds configuration and a foot-gun if operators enable it in a shared environment; an
     environment flag is not authorization; requires profile validation, documentation, and tests.
   - Effort: Medium

3. **Admin secret/authentication gate** — require a dedicated secret or future Better Auth admin
   identity before allowing reset/seed.
   - Pros: could support a remote administrative workflow and gives a stronger boundary than a
     profile flag when implemented correctly.
   - Cons: no existing auth/session infrastructure; secret transport, rotation, timing-safe
     comparison, logging, failure behavior, and deployment policy would need design; a default
     secret is unsafe and explicitly disallowed here; over-scopes this bounded fix.
   - Effort: High

### Recommendation
Use **Approach 2**, with a deliberately narrow contract: destructive development routes are disabled
unless an explicit capability setting is true *and* the runtime profile is `local-offline` or `ci`.
The setting MUST have no default, MUST reject empty/invalid values, and MUST NOT be enabled by the
default Compose or self-host configuration. When disabled, `/reset` and `/seed` should return the
same non-discoverable `404 not_found` behavior as unknown routes, without constructing a destructive
call path. No secret or Better Auth implementation should be introduced in this change.

This preserves deterministic HTTP setup for intentional local/CI harnesses while making the
production-like `compose-cloud-dev` default safe. Direct application tests continue to prove the
deterministic reset/seed contract independently. If the implementation team can provide an equally
usable controlled CLI/test harness in the same change, Approach 1 is safer and should supersede the
flag; absent that harness, the explicit double gate is the smallest compatibility-preserving fix.

`/seed` should be gated with `/reset`: seed is not destructive by itself, but it is an administrative
mutation and would otherwise leave a publicly discoverable privileged boundary adjacent to the
removed reset capability. `/import` should remain separate and retain its existing atomic validation
contract; this exploration does not authorize broad removal of ordinary data workflows.

### Risks
- A profile/flag gate can be misconfigured in a shared environment; tests must cover omitted, false,
  invalid, and disallowed-profile combinations, and Compose must omit the capability entirely.
- Returning `404` rather than `401/403` changes existing smoke expectations and requires README and
  harness updates, but avoids route discoverability and does not pretend that authentication exists.
- Existing scripts or operators may rely on HTTP seed/reset; identify all consumers before apply and
  provide a documented local/CI replacement or explicit opt-in procedure.
- Provider/application reset remains a destructive capability if another future route or tool exposes
  it; the review should verify the complete call graph and not only the literal `/reset` string.
- Better Auth integration later must define ownership, authorization, auditability, and secret/session
  handling separately rather than treating this environment gate as a permanent admin model.

### Rollback and Review Scope
Rollback is limited to the API capability/configuration/docs/tests changed for this OpenSpec change:
restore the route dispatch and associated configuration/test expectations, without reverting provider
schema, migration, or application data behavior. Before rollback, verify that any re-enabled route is
bound only to an intentionally isolated local/CI runtime.

Review scope is bounded to `apps/api`, runtime configuration, Compose defaults, README operational
instructions, and tests/consumers of seed/reset/import. The expected implementation should remain
well below the 800-line review budget and should be delivered as one focused security work unit with
its regression tests included; no UI, Better Auth, schema, or unrelated import redesign belongs in
this change.

### Ready for Proposal
Yes. The proposal should state that the security boundary is HTTP capability suppression by default,
with an explicit local/CI-only opt-in solely to preserve deterministic setup. It should require
fail-closed configuration, no default secret, no destructive route discoverability in Compose/self-host
defaults, regression coverage proving `application.reset()` is never reached through public HTTP, and
an explicit rollback boundary.

## Result Contract

status: ready
executive_summary: >-
  The exploration recommends an explicit, fail-closed local/CI-only capability gate
  for destructive HTTP seed/reset routes, disabled by default in Compose and self-host
  configurations, with no authentication or secret system introduced in this change.
artifacts:
  - `openspec/changes/secure-destructive-reset/exploration.md`
next_recommended: proposal
risks:
  - A misconfigured profile/capability flag could expose destructive routes in a shared environment.
  - Existing HTTP seed/reset consumers and 404 expectations require migration and regression coverage.
  - Direct application/provider reset remains destructive if exposed by a future route or tool.
skill_resolution: >-
  `sdd-explore` and `work-unit-commits` were loaded; the exploration is complete and
  should proceed to proposal without modifying source files or creating additional artifacts.

- **Artifact store:** OpenSpec
- **Change:** `secure-destructive-reset`
- **Artifact language:** English
- **Files created:** This exploration artifact only
- **Source files modified:** None
- **Delivery strategy:** Force-chained feature branch
- **Review budget:** 800 authored changed lines
- **Implementation boundary:** API/runtime configuration, Compose defaults, operational docs, and focused regression tests only
- **Explicit exclusions:** Better Auth implementation, default/admin secrets, schema changes, UI work, and broad import redesign
