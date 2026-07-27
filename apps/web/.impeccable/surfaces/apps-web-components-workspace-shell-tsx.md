---
version: 1
slug: "apps-web-components-workspace-shell-tsx"
primary_target: "apps/web/components/workspace-shell.tsx"
related_targets: ["apps/web/app/page.tsx","packages/ui/src/components/app-shell.tsx","packages/ui/src/components/product-workspaces.tsx"]
---

# Aplicación web autenticada

## Scope and mode

- Target: `apps/web/components/workspace-shell.tsx`
- Mode: Operate
- Related: `apps/web/app/page.tsx`, `packages/ui/src/components/app-shell.tsx`, `packages/ui/src/components/product-workspaces.tsx`

## Audience and job

Personas y hogares que necesitan registrar, revisar y comprender sus datos financieros reales. La aplicación debe revelar complejidad de forma progresiva y nunca pedir conceptos internos de base de datos.

## Task and proof

- Una sola navegación permanente por tamaño, con Iconoir y acceso a todos los destinos.
- La raíz consume el dashboard y las cuentas autenticadas; no contiene fixtures ni cifras demo.
- Los formularios empiezan con una decisión concreta y avanzan con una pregunta por paso.
- Las alertas se configuran como intenciones financieras: qué vigilar y cuándo avisar.
- GSAP explica entrada, cambio de estado y jerarquía; View Transitions mantiene continuidad entre rutas y pasos.

## Direction

“The Household Ledger” en modo operativo: información real, controles legibles y movimiento breve que conserva continuidad. La interfaz debe sentirse como un registro doméstico vivo, no como un panel técnico ni una demostración precargada.

## Constraints

- Sin datos de ejemplo en producción.
- Sin campos `source`, `field` o `comparator` visibles al usuario.
- Mantener reducción de movimiento, teclado, foco visible y áreas táctiles.
