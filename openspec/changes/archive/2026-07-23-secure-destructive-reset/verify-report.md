```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:97ddca1cefa01d7fc8246cb6e657af4c9f7296fba1f90100b6f4373faf6f431a
verdict: pass
blockers: 0
critical_findings: 0
requirements: 7/7
scenarios: 9/9
test_command: pnpm check
test_exit_code: 0
test_output_hash: sha256:9ac435cb75aba8f037940ae755d0da0ec8aa1697ab5becc3ab5bb04b87c142f3
build_command: pnpm typecheck
build_exit_code: 0
build_output_hash: sha256:12171caca244df171d7684d1d762eb9ef4d063927e222ab71f8794b9937f300b
```

## Verification Report

**Change**: `secure-destructive-reset`  
**Version**: N/A  
**Mode**: Standard (strict TDD disabled by `openspec/config.yaml`)

### Completeness

| Metric | Value |
|---|---:|
| Requirements | 7 total / 7 compliant |
| Scenarios | 9 total / 9 compliant |
| Tasks total | 10 |
| Tasks complete | 10 |
| Tasks incomplete | 0 |

All ten tasks are checked in `tasks.md` and all ten are recorded complete in `apply-progress.md`.

### Build & Tests Execution

| Check | Exact command | Exit | Output hash |
|---|---|---:|---|
| Full quality gate | `pnpm check` | 0 | `sha256:9ac435cb75aba8f037940ae755d0da0ec8aa1697ab5becc3ab5bb04b87c142f3` |
| TypeScript build/type check | `pnpm typecheck` | 0 | `sha256:12171caca244df171d7684d1d762eb9ef4d063927e222ab71f8794b9937f300b` |
| Application focused tests | `pnpm --filter @2free/application test` | 0 | `sha256:85c14c00827d72e2f8a60426722773da435ce81ae65a43df423148ad69c6ea2e` |
| API focused tests | `pnpm --filter @2free/api test` | 0 | `sha256:93f74144215bd826f1431c77f5d3e2a56a9cdfee0f9c2803f883642e71729ab5` |
| Parser matrix | `pnpm --filter @2free/application test -- -t 'parses destructive route capability'` (full application file: `9/9`) | 0 | `sha256:77d5b58b3c5704ea8bf54e6201b3040b81ca808dfbce644f5b3be88b3eb9d032` |
| Enabled local/CI and disabled profile matrix | `pnpm --filter @2free/api test -- -t 'opens destructive routes only'` (full API file: `37/37`) | 0 | `sha256:4a27805c4d702578bfaa2dc9f0520b37e5fb053740bd9d4b0762a766e3db8a1a` |
| Disabled zero-invocation spies | `pnpm --filter @2free/api test -- -t 'does not disclose disabled gates'` (full API file: `37/37`) | 0 | `sha256:76bb5074e675a3dc4889ffffafc57055ffe65f46306944ad6819dddd88408bc1` |
| Scope audit | `python3 - <<'PY'` assertion script shown below | 0 | `sha256:da590d174f193ca6f9f36fc041d37bc2302cd74fe613e33089f44050b0b1e14d` |
| Exact default Compose smoke | `sg docker -c '<exact script shown below>'` | 0 | `sha256:8779ff408f0cc2b250d007fc3485570429122b776c98de3db9e8b1f5a445ddcb` |
| Compose cleanup confirmation | `sg docker -c 'ids=$(docker compose ps -q); test -z "$ids"'` | 0 | `sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |

`pnpm check` passed formatting, ESLint, TypeScript, core `33/33`, data-provider `15/15` with `3` skipped, application `9/9`, API `37/37`, and UI `36/36`. No coverage runner or threshold is configured; coverage is **N/A**, not a failed check.

The Compose smoke built and started the default profile, observed healthy services, returned `404 {"error":"not_found"}` for both `POST /seed` and `POST /reset`, and removed all containers and the network successfully.

Exact Compose smoke command:

```sh
sg docker -c 'set -e; trap "docker compose down" EXIT; docker compose up -d --build; until curl -fsS http://127.0.0.1:3001/health >/dev/null 2>&1; do sleep 1; done; for route in seed reset; do status="$(curl -sS -o "/tmp/2free-${route}.json" -w "%{http_code}" -X POST "http://127.0.0.1:3001/${route}")"; printf "%s: %s " "$route" "$status"; tr -d "\n" < "/tmp/2free-${route}.json"; printf "\n"; test "$status" = "404"; test "$(tr -d "\n" < "/tmp/2free-${route}.json")" = "{\"error\":\"not_found\"}"; done'
```

The scope audit command asserted that Compose and `.env.example` omit the capability, protected
provider/schema/UI files contain neither the capability nor the composition gate, the `/import`
contract remains present, and README documents deliberate local/CI use.

Exact scope audit command:

```sh
python3 - <<'PY'
from pathlib import Path
root = Path('.')
capability = 'ENABLE_DESTRUCTIVE_DEVELOPMENT_ROUTES'
gate = 'isDestructiveDevelopmentRoutesEnabled'
assert capability not in (root / 'compose.yml').read_text()
assert capability not in (root / '.env.example').read_text()
for path in [
    root / 'packages/data-provider/src/provider.ts',
    root / 'packages/data-provider/src/in-memory-provider.ts',
    root / 'packages/data-provider/src/postgres-provider.ts',
    root / 'packages/data-provider/src/migrations/001_initial.sql',
    root / 'packages/ui/src/components/app-shell.tsx',
    root / 'packages/ui/src/components/finance-dashboard.tsx',
]:
    text = path.read_text()
    assert capability not in text
    assert gate not in text
server = (root / 'apps/api/src/server.ts').read_text()
assert 'if (path === "/import" && method === "POST")' in server
assert 'await application.import(JSON.stringify(await requestBody(request)))' in server
readme = (root / 'README.md').read_text()
assert 'APP_PROFILE=local-offline ENABLE_DESTRUCTIVE_DEVELOPMENT_ROUTES=true' in readme
assert 'curl -X POST http://localhost:3001/seed' in readme
assert 'curl -X POST http://localhost:3001/reset' in readme
print('compose capability default: absent')
print('.env.example capability default: absent')
print('provider/schema/UI capability drift: absent')
print('import route contract: preserved')
print('controlled local/CI documentation: present')
PY
```

### Spec Compliance Matrix

| Requirement | Scenario | Runtime/static evidence | Result |
|---|---|---|---|
| Fail-closed configuration parsing | Configuration matrix is fail-closed | `packages/application/test/runtime.test.ts` — capability matrix passed within the `9/9` application suite | ✅ COMPLIANT |
| Profile and capability double gate | Allowed profile with capability | `apps/api/test/runtime.test.ts` — `local-offline` and `ci` with exact `true`; enabled `200` responses and application calls within the `37/37` API suite | ✅ COMPLIANT |
| Profile and capability double gate | One gate is absent | Same API matrix covers omitted/invalid capability and `compose-cloud-dev`/`cloud-test`; all disabled cases `404` within the `37/37` API suite | ✅ COMPLIANT |
| Indistinguishable disabled response | Disabled routes are non-discoverable | API matrix and disabled-spy test assert identical `{"error":"not_found"}` bodies and no gate disclosure | ✅ COMPLIANT |
| HTTP non-invocation guarantee | Disabled request cannot mutate data | Disabled-spy test asserts `seed()` and `reset()` are each called zero times | ✅ COMPLIANT |
| Direct behavior preservation | Direct deterministic boundary remains available | `packages/application/test/runtime.test.ts` direct seed/idempotent seed/reset test plus data-provider tests in `pnpm check` | ✅ COMPLIANT |
| Safe defaults and controlled exposure | Default deployment is safe | Exact Compose smoke returned `404`/`not_found`; Compose and `.env.example` omit the capability; cleanup confirmed | ✅ COMPLIANT |
| Safe defaults and controlled exposure | Controlled local/CI use is documented | README explicit local/CI command plus API runtime matrix for both allowed profiles | ✅ COMPLIANT |
| Scope preservation | Out-of-scope surfaces remain unchanged | Scope audit found no capability/gate drift in provider, schema, or UI; `/import` contract preserved; no auth/secret additions | ✅ COMPLIANT |

**Compliance summary**: 9/9 scenarios compliant.

### Correctness

| Requirement | Status | Evidence |
|---|---|---|
| Strict capability parser | ✅ Implemented | `loadRuntimeConfig` enables only exact `ENABLE_DESTRUCTIVE_DEVELOPMENT_ROUTES === "true"`; all seven matrix inputs pass. |
| Profile/capability double gate | ✅ Implemented | `isDestructiveDevelopmentRoutesEnabled` requires the capability and exactly `local-offline` or `ci`. |
| Pre-dispatch non-disclosure | ✅ Implemented | `createApiServer` gates `/seed` and `/reset` after path extraction and before body parsing or application dispatch. |
| Disabled response contract | ✅ Implemented | Both disabled routes use the existing JSON `404 { error: "not_found" }` response. |
| Direct deterministic behavior | ✅ Implemented | Runtime application/provider seed and reset contracts remain covered and pass. |
| Safe defaults and migration | ✅ Implemented | Compose and `.env.example` omit the capability; README removes default destructive calls and documents deliberate use. |
| Scope boundary | ✅ Implemented | No auth, secret, schema, provider, UI, or broad import drift detected by the scope audit. |

### Design Coherence

| Decision | Followed? | Notes |
|---|---|---|
| Literal-only capability contract | ✅ Yes | Configuration field and exact parser match the design interface. |
| `local-offline`/`ci` profile allowlist | ✅ Yes | Allowlist is explicit and rejects cloud/default profiles. |
| Gate at HTTP dispatch boundary | ✅ Yes | Disabled branch precedes body parsing and `seed()`/`reset()` calls. |
| One atomic security work unit | ✅ Yes | Implementation, tests, documentation, and migration are bounded to the six intended modified paths; Compose/env are verification-only. |

### Task Verification

| Task | Status | Runtime/source evidence |
|---|---|---|
| 1.1 configuration RED/GREEN matrix | ✅ Complete | Application parser matrix passed. |
| 1.2 profile/capability HTTP matrix | ✅ Complete | API matrix passed for all four profiles and seven capability inputs. |
| 1.3 disabled-route spies | ✅ Complete | Both disabled routes returned `404`; both spies had zero calls. |
| 2.1 strict configuration parser | ✅ Complete | Exact literal parser implemented and tested. |
| 2.2 composition allowlist/double gate | ✅ Complete | Composition helper and API matrix passed. |
| 2.3 server dispatch gate | ✅ Complete | Gate precedes body parsing and application dispatch; runtime tests passed. |
| 2.4 direct behavior preservation | ✅ Complete | Direct application/provider tests passed; protected scope audit passed. |
| 3.1 README migration | ✅ Complete | Unconditional Compose calls removed; deliberate local/CI workflow documented. |
| 3.2 Compose/env verification | ✅ Complete | Both defaults omit capability and remained byte-identical to the approved target fingerprints. |
| 3.3 final verification | ✅ Complete | Focused tests, `pnpm check`, exact Compose smoke, cleanup, and scope audit all passed. |

### Integrity and Scope Evidence

The approved target fingerprints remained unchanged during this verification. The eight bounded files
(`config.ts`, composition, server, both runtime test files, README, `compose.yml`, and `.env.example`)
matched the preserved target fingerprints, including `compose.yml` and `.env.example` as verification-only
files. The worktree contains unrelated pre-existing staged/unstaged/untracked changes; they were not
treated as part of this change, and no implementation or planning file other than this report was edited.

Protected-surface assertions passed for data-provider source/migrations, UI components, and the `/import`
route. The audit found no destructive-route capability or composition-gate symbols in those protected
surfaces.

### Issues Found

**CRITICAL**: None.  
**WARNING**: None.  
**SUGGESTION**: None.

### Verdict

**PASS**

All seven requirements, nine scenarios, and ten tasks are complete. Runtime tests, type checking, full
quality checks, exact default Compose smoke, cleanup, and scope checks passed with zero critical findings.

## Result Contract

```yaml
status: success
executive_summary: Final independent verification passed for secure-destructive-reset; all requirements, scenarios, tasks, runtime checks, and scope checks are compliant.
artifacts:
  - openspec/changes/secure-destructive-reset/verify-report.md
next_recommended: sdd-archive
risks: None
skill_resolution: paths-injected — sdd-verify and work-unit-commits
```
