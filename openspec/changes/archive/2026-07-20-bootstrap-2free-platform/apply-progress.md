# Apply Progress: Bootstrap the 2 Free Contract Foundation

## Completed Tasks

- [x] 1.1 Root pnpm/Node workspace foundation and lockfile
- [x] 1.2 Shared TypeScript, lint, format configuration, and command documentation
- [x] 1.3 CI quality workflow with failure and clean-success evidence
- [x] 2.1 Core package configuration and RED money fixtures
- [x] 2.2 Immutable decimal-safe money contracts and shared validation
- [x] 2.3 Injected IDs/clocks, privacy validation, and credit-product contracts
- [x] 2.4 Separator-independent PAN remediation and package-local alias parity

## Mode

Standard Mode — `openspec/config.yaml` sets `strict_tdd: false` and no pre-existing test runner was configured.

## Work Unit Evidence

| Evidence | Exact result |
| --- | --- |
| Focused test command and exact result | `pnpm check` exited `0`: Prettier reported all matched files formatted; ESLint and `tsc --noEmit --project tsconfig.base.json` passed; `test:core` and `test:data-provider` each exited `0` with no test files yet (`--passWithNoTests`). |
| Runtime harness command/scenario and exact result | `pnpm install --frozen-lockfile && pnpm check` completed successfully. The CI-equivalent local scenario uses no network service or product runtime. |
| Non-mutating aggregate proof | A recursive SHA-256 snapshot (excluding `node_modules` and `.codegraph`) before and after `pnpm check` reported `check exit=0; tracked file changes=0`. |
| Failure proof: formatting | A deliberately unformatted temporary `.quality-format-proof.ts` made `pnpm format:check` exit `1`, reporting that file. The temporary file was removed. |
| Failure proof: lint | A temporary unused `lintProof` constant made `pnpm lint` exit `1` with `@typescript-eslint/no-unused-vars`. The temporary file was removed. |
| Failure proof: type | A temporary `string = 1` ambient declaration in `workspace.d.ts` made `pnpm typecheck` exit `2` with `TS2322` and `TS1039`. The baseline declaration was restored. |
| Failure proof: test | A temporary failing Vitest assertion made `pnpm test:core` exit `1` with `1 failed` test. The temporary test and empty directories were removed. |
| Rollback boundary | Revert `.node-version`, `.npmrc`, `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `tsconfig.base.json`, `workspace.d.ts`, `eslint.config.js`, `.prettierrc`, `.prettierignore`, `README.md`, and `.github/workflows/quality.yml`. This removes only reproducible workspace gates and no product behavior. |

## Corrective Validation: Lockfile Reproducibility

The committed `.npmrc` policy remains `auto-install-peers=false`. Because pnpm 11 reads this non-registry project setting from `pnpm-workspace.yaml`, that file now also declares `autoInstallPeers: false`. The lockfile was regenerated with the effective committed policy and now records `settings.autoInstallPeers: false`.

| Evidence | Exact result |
| --- | --- |
| Lockfile regeneration | `pnpm install --lockfile-only --no-prefer-frozen-lockfile` exited `0` in `2.3s` using pnpm `11.13.1`. |
| Frozen-install correction | `pnpm install --frozen-lockfile` exited `0`: `Lockfile is up to date, resolution step is skipped`; `Done in 703ms using pnpm v11.13.1`. |
| Focused quality correction | `pnpm check` exited `0`: Prettier reported all matched files formatted; ESLint and `tsc --noEmit --project tsconfig.base.json` passed; `test:core` and `test:data-provider` each exited `0` with no test files (`--passWithNoTests`). |
| Runtime harness correction | `pnpm install --lockfile-only --no-prefer-frozen-lockfile && pnpm install --frozen-lockfile && pnpm check` exited `0`. It exercises the CI-equivalent clean dependency/quality path without network services or a product runtime. |
| Rollback boundary | Revert `.npmrc`, `pnpm-workspace.yaml`, and `pnpm-lock.yaml` together to remove only this corrected pnpm policy/lockfile alignment; retain the prior Work Unit 1 workspace-gate files and evidence. |

## Delivery Boundary

- Strategy: `auto-chain`, `feature-branch-chain`.
- Slice: Work Unit 1 — reproducible workspace gates.
- Intended PR: child PR #1 targets the feature/tracker branch.
- Constraint: the workspace has no Git repository; no branch, commit, push, or PR was created.

## Work Unit 2: Finance Core Contracts

### TDD Cycle Evidence

| Task | RED | GREEN | REFACTOR |
| --- | --- | --- | --- |
| 2.1 | Added `money.test.ts` fixtures before production modules. `pnpm test:core` exited `1`: both suites failed module resolution for absent `../src/money.js` and `../src/account.js`. | Superseded by 2.2 implementation. | Test fixtures remain focused on public money behavior. |
| 2.2 | The 2.1 money fixtures were already RED. | `pnpm test:core` exited `0`: 2 files and 13 tests passed after `money.ts` implementation. | Centralized non-empty-string and non-negative-scale checks in `validation.ts`; arithmetic shares one integer quantization path. |
| 2.3 | Added `contracts.test.ts` before the corresponding production modules; the same RED run exited `1` because `../src/account.js` was absent. | `pnpm test:core` exited `0`: account/transaction, privacy, ID/clock, and credit-product fixtures passed. | Reused `sanitizeMetadata`, injected ID/clock helpers, and the shared `ValidationError` boundary. |

### Work Unit Evidence

| Evidence | Exact result |
| --- | --- |
| Focused test command and exact result | `pnpm test:core` exited `0`: Vitest reported `2 passed` test files and `13 passed` tests. |
| Runtime harness command/scenario and exact result | `N/A — packages/core is a pure domain-contract package with no integration/runtime boundary. Its executable Node/Vitest scenario is the focused fixture command above, which passed 13 assertions without external services.` |
| Relevant aggregate checks | `pnpm format:check && pnpm typecheck && pnpm lint && pnpm test:core && pnpm check` exited `0`. The final aggregate `pnpm check` passed formatting, lint, type checking, `2/13` core tests, and the future data-provider command with no test files (`--passWithNoTests`). |
| Rollback boundary | Revert `packages/core/` and the Work Unit 2 `tsconfig.base.json` package-include/lib update. This removes only the finance core configuration, contracts, and tests, retaining Work Unit 1 tooling. |

### Delivery Boundary

- Strategy: `auto-chain`, `feature-branch-chain`.
- Slice: Work Unit 2 — finance core contracts.
- Intended PR: child PR #2 targets the Work Unit 1 branch; its diff is limited to `packages/core/` plus the required root TypeScript program include.
- Constraint: the workspace has no Git repository; no branch, commit, push, or PR was created.

### Corrective Evidence: Privacy and Statement Precision

The corrective pass preserves Work Unit 2's task completion because all focused and aggregate evidence now passes. Metadata rejects contiguous 13–19 digit PANs and grouped PANs with whitespace, ASCII punctuation, and common visual separators; `lastFour`-style fields remain rejected while unrelated `statementYear` and `monthlyBudget` metadata remain valid. Statement payments with a greater scale than their statement now reject before arithmetic; callers must invoke `quantize` explicitly and choose its rounding mode.

| Evidence | Exact result |
| --- | --- |
| RED test command and exact result | With the original privacy/payment behavior restored temporarily, `pnpm test:core` exited `1`: Vitest reported `1 failed` file, `2 failed` tests, and `15 passed` tests. The failures proved ordinary metadata was over-rejected and a scale-3 payment against a scale-2 statement was silently accepted. The alternate- and mixed-separator PAN cases were added to the same credential-rejection fixture before the final implementation. |
| GREEN focused test command and exact result | `pnpm test:core` exited `0`: Vitest reported `2 passed` test files and `17 passed` tests. This includes alternate (`4111·1111·1111·1111`) and mixed (`4111/1111·1111_1111`) separator PAN rejection, safe metadata acceptance, and higher-precision payment rejection. |
| Aggregate command and exact result | `pnpm check` exited `0`: Prettier reported all matched files formatted; ESLint and `tsc --noEmit --project tsconfig.base.json` passed; core Vitest reported `2 passed` files and `17 passed` tests; data-provider Vitest exited `0` with no test files (`--passWithNoTests`). |
| Runtime harness command/scenario and exact result | `N/A — packages/core remains a pure domain-contract package with no external runtime boundary. The executable Node/Vitest fixture path above exercised both corrected validation paths without external services.` |
| Rollback boundary | Revert `packages/core/src/privacy.ts`, `packages/core/src/account.ts`, and `packages/core/test/contracts.test.ts` together. This removes only the corrective PAN detection and statement-payment precision behavior, retaining all prior Work Unit 1 and Work Unit 2 work. |

### Corrective Delivery Boundary

- Strategy: `auto-chain`, `feature-branch-chain`.
- Slice: Work Unit 2 corrective pass — privacy and statement precision only.
- Intended PR boundary: child PR #2 remains limited to `packages/core/`; no Phase 3+ files were changed.
- Review budget: remains within the approved 800-line Work Unit 2 boundary.
- Constraint: the workspace has no Git repository; no branch, commit, push, PR, or review artifact was created.

## Work Unit 2 Remediation: PAN Detection and Local Alias Parity

### RED → GREEN Evidence

| Step | Exact result |
| --- | --- |
| RED | After adversarial fixtures for semicolon, plus, en dash, and mixed separators were added before production changes, `pnpm test:core` exited `1`: Vitest reported `1 failed` file, `4 failed` tests, and `17 passed` tests out of `21`. The failures were the four new full-PAN separator-bypass cases. |
| GREEN | `pnpm test:core` exited `0`: Vitest reported `2 passed` test files and `21 passed` tests. It resolved `@/*` through `packages/core/vitest.config.ts` and proved the new PAN cases reject while ordinary numeric metadata remains accepted. |
| Refactor | Replaced the separator allowlist with a Unicode punctuation/symbol/whitespace candidate matcher. Detection evaluates each metadata value independently, so it cannot concatenate digits across metadata keys or letter-bearing semantic text; rejected input is not retained or included in the validation error. |

### Work Unit Evidence

| Evidence | Exact result |
| --- | --- |
| Focused test command and exact result | `pnpm test:core` exited `0`: Vitest reported `2 passed` test files and `21 passed` tests. |
| Typecheck command and exact result | `pnpm typecheck` exited `0`: `tsc --noEmit --project packages/core/tsconfig.json` and `tsc --noEmit --project tsconfig.base.json` both passed. |
| Aggregate command and exact result | `pnpm check` exited `0`: Prettier reported all matched files formatted; ESLint passed; both TypeScript programs passed; core Vitest reported `2 passed` files and `21 passed` tests; data-provider Vitest exited `0` with no test files (`--passWithNoTests`). |
| Runtime harness command/scenario and exact result | `N/A — packages/core is a pure domain-contract package with no external runtime boundary. The focused Node/Vitest fixture path exercised separator-independent credential rejection and package-local runtime alias resolution without an external service.` |
| Rollback boundary | Revert `packages/core/src/privacy.ts`, the `@/` import refactors in `packages/core/src/{account,transaction,identifiers,money}.ts` and `packages/core/test/{contracts,money}.test.ts`, `packages/core/{tsconfig.json,vitest.config.ts}`, plus the corresponding package-local typecheck and `@types/node` entries in `package.json`, `tsconfig.base.json`, and `pnpm-lock.yaml`. This removes only Work Unit 2 remediation and retains prior core behavior and all other work units. |

### Delivery Boundary

- Strategy: `auto-chain`, `feature-branch-chain`.
- Slice: Work Unit 2 remediation — PAN detection and package-local alias parity.
- Intended PR boundary: child PR #2 targets the Work Unit 1 branch; this remediation stays within `packages/core/` plus required root quality configuration and lockfile entries.
- Review budget: approved 800-line Work Unit 2 session boundary.
- Constraint: the workspace has no Git repository; no branch, commit, push, PR, or review artifact was created.

## Work Unit 3: Offline Provider Portability

### RED → GREEN Evidence

| Step | Exact result |
| --- | --- |
| RED | After the package configuration and contract fixtures were created before production modules, `pnpm test:data-provider` exited `1`: Vitest reported `1 failed` test file and `0 tests`; the suite could not resolve the absent `packages/data-provider/src/in-memory-provider.ts`. The TypeScript/Vitest package-local alias was therefore exercised before implementation. |
| GREEN | `pnpm test:data-provider` exited `0`: Vitest reported `1 passed` test file and `7 passed` tests, covering offline create/read, provider replacement via export/import, ID-sorted v1 output, exact `{ currency, coefficient: string, scale }` money, and atomic malformed, unsafe-card-data, dangling-reference, and version rejection. |
| Refactor | Centralized import object/key/date/identifier/money/metadata validation in `portability.ts`; validation completes into local immutable arrays before the provider replaces either store. |

### Work Unit Evidence

| Evidence | Exact result |
| --- | --- |
| Focused test command and exact result | `pnpm test:data-provider` exited `0`: Vitest reported `1 passed` test file and `7 passed` tests. |
| Runtime harness command/scenario and exact result | `pnpm test:data-provider` exited `0`: the provider-replacement fixture populated one fresh in-memory provider, exported its v1 envelope, imported it into another fresh in-memory provider, and asserted byte-identical deterministic export with exact scale-3 MXN money. No network, authentication service, or database was used. |
| Core regression command and exact result | `pnpm test:core` exited `0`: Vitest reported `2 passed` test files and `21 passed` tests. |
| Typecheck command and exact result | `pnpm typecheck` exited `0`: package-local Core and data-provider programs plus the root program completed without errors. |
| Aggregate command and exact result | `pnpm check` exited `0`: Prettier, ESLint, all TypeScript programs, core Vitest (`2/21`), and data-provider Vitest (`1/7`) passed. |
| Line impact | `wc -l` reports 512 lines across the eight new `packages/data-provider` package/config/source/test files; the small root typecheck/test-command and root TypeScript exclusion updates keep this Work Unit 3 slice below the approved 800-line review budget. |
| Rollback boundary | Revert `packages/data-provider/`, the data-provider entries in root `package.json` and `tsconfig.base.json`, and the package-local Core alias correction in `packages/core/tsconfig.json`. This removes only Work Unit 3 provider configuration/portability behavior while retaining Work Units 1–2. |

### Delivery Boundary

- Strategy: `auto-chain`, `feature-branch-chain`.
- Slice: Work Unit 3 — offline provider, package-local alias, and atomic v1 portability.
- Intended PR: child PR #3 targets the Work Unit 2 branch; its autonomous diff is the data-provider package plus required root quality-program configuration.
- Review budget: 512 new package lines; under the approved 800-line Work Unit 3 boundary.
- Constraint: the workspace has no Git repository; no branch, commit, push, or PR was created.

## Remaining Tasks

None.

## Work Unit 4: Final Bootstrap Verification

### Completed Tasks

- [x] 4.1 Run all documented quality commands and prove the aggregate is non-mutating.
- [x] 4.2 Run the offline CI-equivalent scenario and verify the approved bootstrap scope.

### Work Unit Evidence

| Evidence | Exact result |
| --- | --- |
| Focused test command and exact result | `pnpm check` exited `0`: Prettier reported `All matched files use Prettier code style!`; ESLint and all three configured TypeScript programs passed; core Vitest reported `2 passed` files / `21 passed` tests; data-provider Vitest reported `1 passed` file / `7 passed` tests. |
| Individual quality commands and exact result | `pnpm format:check`, `pnpm lint`, and `pnpm typecheck` each exited `0`. `pnpm test:core` exited `0` with `2 passed` files / `21 passed` tests; `pnpm test:data-provider` exited `0` with `1 passed` file / `7 passed` tests. |
| Non-mutating aggregate proof | A deterministic recursive SHA-256 content snapshot of all 48 project files, excluding `node_modules`, `.codegraph`, and `.git`, was captured immediately before and after `pnpm check`. Both snapshots had SHA-256 `e9ca7a1a133d8717a1415d7dea247cc3d600b256250b141dd52911c8171c3300`; `cmp -s` succeeded and reported `CONTENT_SNAPSHOT_RESULT=identical (project files changed=0)`. A post-CI snapshot produced the same digest and reported `POST_CI_CONTENT_SNAPSHOT=identical (project files changed=0)`. |
| Runtime harness command/scenario and exact result | `pnpm install --frozen-lockfile --offline && pnpm check` exited `0`. pnpm reported `Scope: all 3 workspace projects`, `Already up to date`, and `Done in 442ms using pnpm v11.13.1`; the following aggregate gate passed with the same `2/21` core and `1/7` provider Vitest counts. This is the documented CI install/check sequence executed without network access or a network service. |
| Local/CI parity | The GitHub workflow runs `pnpm install --frozen-lockfile` followed by `pnpm check`; the local offline equivalent used the identical frozen install and aggregate command, with the same pass result. No product runtime or external service is configured or invoked. |
| Scope verification | `pnpm list --depth -1` reported only `2free`, `@2free/core`, and `@2free/data-provider`. No `apps/` files or `*.sqlite`, `*.sqlite3`, `*.db`, `*.sql`, or `*.sqlcipher` files exist. Source search found no references to SQLite, SQLCipher, PostgreSQL, database, auth, sync, OpenBB, Banxico, GSAP, View Transitions, Next.js, Astro, Tauri, or Nest. The only credential-related source/test matches are validation patterns and negative fixtures that reject CVV, PIN, track-data, and card-number metadata; no credential is stored. |
| Rollback boundary | Revert only the Phase 4 checkbox updates in `openspec/changes/bootstrap-2free-platform/tasks.md` and this Work Unit 4 evidence section in `openspec/changes/bootstrap-2free-platform/apply-progress.md`. This removes verification records without changing workspace, core, or provider behavior. |

### Delivery Boundary

- Strategy: `auto-chain`, `feature-branch-chain`.
- Slice: final bootstrap verification work unit.
- Intended PR boundary: the final verification receipt for the preceding feature-branch-chain slices; no Git repository exists, so no branch, commit, push, PR, or review artifact was created.
- Review budget: evidence-only changes; no implementation behavior changed and no 800-line scope exception is needed.
