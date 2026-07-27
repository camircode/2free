---
version: 1
slug: "apps-desktop-src-app-tsx"
primary_target: "apps/desktop/src/App.tsx"
related_targets: ["apps/desktop/src/styles.css","packages/ui/src/components/app-shell.tsx","packages/ui/src/styles/app-shell.css"]
---

# Aplicación Tauri y onboarding

## Scope and mode

- Target: `apps/desktop/src/App.tsx`
- Mode: Operate
- Related: `apps/desktop/src/styles.css`, `packages/ui/src/components/app-shell.tsx`, `packages/ui/src/styles/app-shell.css`

## Audience and job

Personas y hogares que necesitan empezar sin conocimientos técnicos, elegir dónde viven sus datos y registrar o revisar información financiera en escritorio y móvil. El onboarding debe permitir elegir un modo tocando la tarjeta completa y completar solo la configuración imprescindible.

## Task and proof

- Primary task: elegir modo local, nube administrada o servidor propio y continuar.
- Cloud managed: usa la URL definida por `VITE_CLOUD_API_URL`; nunca solicita una URL.
- Self-host: solicita una URL con valor inicial `http://localhost:3001` y valida HTTPS remoto o HTTP loopback.
- Proof: SQLCipher activo, clave en almacén seguro y réplica opcional explicados en lenguaje cotidiano.

## Direction

“The Household Ledger” en modo operativo: jerarquía editorial contenida, tarjetas seleccionables de alta claridad y un único sistema de navegación adaptativo. El momento memorable es elegir con confianza dónde viven los datos sin enfrentarse a infraestructura innecesaria.

## Constraints

- Una sola navegación primaria por tamaño; sin barras o iconos repetidos.
- Barra inferior compacta con áreas seguras en móvil; navegación legible y contenida en escritorio.
- Objetivos táctiles de al menos 44px en iOS y 48dp en Android.
- Formularios complejos bajo demanda y por pasos.
- Español neutral y estados comprensibles sin depender solo del color.

## Unresolved

- La distribución final por plataforma dependerá de los artefactos de GitHub Releases.
