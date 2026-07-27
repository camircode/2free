# Tasks: Next Web Spanish UI Integration

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated changed lines | 1,400–2,000 total; each slice <800, target <400 authored |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 foundation → PR 2 shell/routes → PR 3 dashboard/data → PR 4 workflows → PR 5 hardening/removal |
| Delivery strategy | force-chained |
| Chain strategy | feature-branch-chain |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR/base | Focused test command | Runtime harness | Rollback boundary |
|---|---|---|---|---|---|
| 1 | Runtime | PR1 → feature/tracker | `pnpm --filter @2free/web build` | Dev SSR smoke | New config/runtime |
| 2 | Shell/routes | PR2 → PR1 | `pnpm exec vitest run apps/web/test/routes` | Chromium exact routes | Shell/routes |
| 3 | Dashboard/data | PR3 → PR2 | `pnpm exec vitest run apps/web/test/dashboard` | Mobile/desktop/dark Chromium | Adapter/UI model |
| 4 | Workflows | PR4 → PR3 | `pnpm exec vitest run apps/web/test/workflows` | CRUD, retry, import/export | Actions/forms |
| 5 | Gates/removal | PR5 → PR4 | `pnpm check && pnpm exec playwright test` | Frozen Compose/standalone/a11y | Docker/legacy |

## Phase 1: Foundation / Runtime (Slice 1)

- [x] 1.1 RED/GREEN: test then configure pinned Next 16.2.11, React 19.2.7, Tailwind 4.3.3, `@/*`, standalone tracing, pnpm scripts, `package.json`, `next.config.ts`, `postcss.config.mjs`, `tsconfig.json`, `types/assets.d.ts`; retain `src/server.ts` and legacy scripts.
- [x] 1.2 RED/GREEN: test no browser `API_URL`, exact `@2free/ui/styles.css`/logo imports, Tailwind scan; add `layout.tsx`, `globals.css`, server-only `lib/server-api.ts` (`api:3001` Compose, `127.0.0.1:3001` local). Verify build; rollback new runtime files.

## Phase 2: Shell / Routes (Slice 2)

- [x] 2.1 RED/GREEN: test unknown-route 404 and SSR Spanish states on exact `/`, `/cuentas`, `/transacciones`, `/portabilidad`; add pages, `loading.tsx`, `not-found.tsx`, `error.tsx`, `WorkspaceShell`, responsive/dark navigation.
- [x] 2.2 RED/GREEN: test reduced-motion information parity and client boundaries; add `motion-enhancement.tsx`, styling, `health/route.ts`; run Chromium, retain legacy runtime.

## Phase 3: Dashboard / Data (Slice 3)

- [x] 3.1 RED/GREEN: test aggregate/allocation and activity labels; absent balance is “No disponible”/“Configuración requerida”, never zero; add typed `dashboard-adapter.ts`, `money.ts`, `errors.ts`, and only the bounded `packages/ui` extension if required.
- [x] 3.2 RED/GREEN: test exact Money/currency/format, no float/card numbers, semantic data, no mobile overflow; add dashboard tests and verify mobile/desktop states.

## Phase 4: Workflows (Slice 4)

- [ ] 4.1 RED/GREEN: test malformed/503 safe error `No se pudo completar la operación`, allowlist validation, and no sensitive leak; add typed `actions.ts`, `validation.ts`, and account/transaction/portability forms.
- [ ] 4.2 RED/GREEN: test reused `Idempotency-Key`, atomic import/export, restart readback; wire Server Actions, JSON, and `revalidatePath` (`/` + affected page; all four after import).

## Phase 5: Hardening / Legacy Removal (Slice 5)

- [ ] 5.1 RED/GREEN: test standalone `.next/standalone/apps/web/server.js`, `Dockerfile.web`, `/health`, frozen install, `pnpm check`, Chromium/workflow/a11y/responsive/dark/motion parity; then switch Compose.
- [ ] 5.2 RED/GREEN: test legacy remains on any failed gate; only after all pass delete `apps/web/src/server.ts`, legacy scripts, old Docker selection; rollback to Slice 4 and rerun parity.
