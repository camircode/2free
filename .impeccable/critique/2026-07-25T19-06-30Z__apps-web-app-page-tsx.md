---
target: apps/web/app/page.tsx
total_score: 21
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 4
timestamp: 2026-07-25T19-06-30Z
slug: apps-web-app-page-tsx
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|---:|---|
| 1 | Visibility of System Status | 2/4 | Loading and status components exist, but locked states disappear and successful transactions do not visibly reconcile the dashboard. |
| 2 | Match System / Real World | 2/4 | Spanish labels are familiar, but “Saldo disponible” has no balance and activity is rendered as generic records. |
| 3 | User Control and Freedom | 3/4 | Native transaction dialog provides cancel and close paths; financial entries have no undo. |
| 4 | Consistency and Standards | 3/4 | Shared shell and tokens are strong, but terminology, voice, and active “Más” behavior drift across sizes. |
| 5 | Error Prevention | 2/4 | Client validation is useful, but account/API failures can become an empty-account state. |
| 6 | Recognition Rather Than Recall | 2/4 | Navigation and field labels are visible, but activity omits account, category, and description context. |
| 7 | Flexibility and Efficiency | 2/4 | Direct transaction entry is efficient, but there are no shortcuts, repeat-entry aids, or batch paths. |
| 8 | Aesthetic and Minimalist Design | 2/4 | Warm and coherent, but the root stacks a quick-action card, status banner, three elevated panels, and multiple pills. |
| 9 | Error Recovery | 2/4 | Form errors preserve input, but authentication and API recovery paths are ambiguous and lack explicit retry states. |
| 10 | Help and Documentation | 1/4 | Helpful microcopy exists, but there is no contextual help for totals, data freshness, or unavailable balance semantics. |
| **Total** |  | **21/40** | **Acceptable: significant improvements needed** |

## Design Specificity Verdict

The implementation is product-specific at the visual-system level, but still category-interchangeable at the decision level. The warm paper palette, Urbanist/Open Sans pairing, terracotta and olive signals, responsive navigation, Spanish financial vocabulary, and restrained motion support “The Household Ledger.” The root dashboard, however, resolves into a familiar generic card dashboard. Privacy, ownership, household context, portability, and data control are largely absent from the authenticated first viewport.

## Overall Impression

The shell feels warm, credible, and operationally composed. The central problem is not visual polish: the first screen does not clearly establish what is true, what changed, or what the user should understand before acting. The biggest opportunity is to make the root a trustworthy ledger entry point: one meaningful financial truth, recognizable activity, explicit state semantics, and one clear action.

## What's Working

- The warm paper, terracotta, olive, and mint system is coherent and aligned with the Household Ledger direction without becoming decorative noise.
- `WorkspaceShell` and `AppShell` provide labelled desktop navigation, mobile bottom navigation, active-page semantics, theme support, safe-area padding, and reduced-motion handling.
- `TransactionComposer` uses a native dialog, explicit income/expense choice, labelled inputs, inline validation, cancel behavior, and preserved form data on failure.

## Priority Issues

### [P1] The dashboard’s primary truth is unavailable and its activity is not recognizable

- **Why it matters:** Financial software earns trust through accurate, interpretable evidence. The main dashboard cannot show a real balance and strips useful transaction context.
- **Evidence:** `apps/web/lib/dashboard-adapter.ts:99-117`; `packages/ui/src/components/finance-dashboard.tsx:197-212` and `:164-175`.
- **Fix:** Reframe the hero around a metric the data can actually prove. If balance is unavailable, make that limitation explicit and provide a recovery path. Preserve recognizable activity details and distinguish currency totals from balance.
- **Suggested command:** `$impeccable clarify`

### [P1] Signed-out, empty, and API-failure states collapse into the same experience

- **Why it matters:** A new user, a signed-out user, and a broken API should not all see an apparent “create your first account” state.
- **Evidence:** `apps/web/lib/finance-pages-adapter.ts:38-45`; `apps/web/app/page.tsx:23-29`; `packages/ui/src/components/finance-dashboard.tsx:241-243`.
- **Fix:** Give session-required, genuinely empty, and unavailable states separate language, status, and actions. Avoid silently converting infrastructure failure into an empty workspace.
- **Suggested command:** `$impeccable harden`

### [P1] Successful transaction entry does not visibly close the loop

- **Why it matters:** The success message confirms submission, but the visible dashboard can remain stale after the dialog closes. Users cannot immediately verify the record they created.
- **Evidence:** `apps/web/components/transaction-registration.tsx:12-33`; `packages/ui/src/components/portfolio-workspaces.tsx:442-461`; `apps/web/app/page.tsx:10-31`.
- **Fix:** Make completion prove the result in the surrounding workspace through refreshed activity, a visible updated timestamp, or an explicit pending/reconciled state.
- **Suggested command:** `$impeccable harden`

### [P1] The authentication overlay is not as keyboard-safe as the transaction dialog

- **Why it matters:** `AuthAccess` presents a custom dialog without explicit focus placement, containment, restoration, Escape handling, or `aria-describedby`; keyboard users can lose context.
- **Evidence:** `apps/web/components/auth-access.tsx:99-177`; compare `packages/ui/src/components/portfolio-workspaces.tsx:343-465`.
- **Fix:** Treat authentication as a first-class modal interaction with predictable keyboard entry, exit, announcement, background isolation, and focus restoration.
- **Suggested command:** `$impeccable audit`

### [P2] The root hierarchy is card-heavy and the primary action is semantically vague

- **Why it matters:** “Mantenga su balance al día” sounds like a balance-management task, while the action is “Registrar transacción.” Repeated status and elevated cards weaken the one-dominant-figure rule.
- **Evidence:** `apps/web/app/page.tsx:18-31`; `packages/ui/src/components/finance-dashboard.tsx:189-229`.
- **Fix:** Give the first viewport one dominant financial idea and one clear action. Reserve elevation for actionable or layered surfaces; use spacing and tone for passive grouping.
- **Suggested command:** `$impeccable distill`

## Persona Red Flags

### Alex, power user

- The transaction action is easy to find, but the form still requires six visible inputs and offers no keyboard shortcut, repeat-entry path, or bulk workflow.
- After submission, the dashboard does not provide immediate proof that the new record is visible.
- Secondary navigation requires opening “Más” before Alex can reach six product areas.

### Sam, accessibility-dependent user

- Shared focus styling and semantic navigation are strong.
- The custom auth dialog lacks explicit focus management and Escape behavior.
- Transaction field errors set `aria-invalid` but are not explicitly associated with error text through `aria-describedby`.

### Casey, distracted mobile user

- Bottom navigation, safe-area padding, one-column dialog layout, and sticky mobile actions are appropriate.
- The transaction draft is component state only, so interruption, route changes, or reload can discard work.
- The web flow provides no explicit offline or queued-entry state for a slow or unavailable connection.

## Minor Observations

- Product context requires neutral Spanish without voseo, but transaction copy uses “Elegí,” “Ingresá,” and “querés.”
- Formal and informal address mix across the shell: “Mantenga,” “Vuelva,” and “Tu.”
- The dashboard table caption says “Valores por categoría” while the data is aggregated by currency.
- The authenticated header exposes logout but no visible user or household identity.
- The web wordmark is text-based rather than using the supplied official logo asset.

## Questions to Consider

- If the most important number is unavailable, should the first viewport really present a “ready” dashboard?
- Is the root surface primarily for reviewing financial truth or registering a transaction?
- What does a successful transaction prove if the activity list behind the modal remains stale?
- Would a household know which person, data source, and financial space it is viewing without opening settings?
