# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Users

2 Free está dirigido principalmente a personas y hogares que necesitan comprender y administrar presupuesto, gastos, ahorro y crédito sin ceder el control de sus datos. Las funciones compartidas sirven a parejas, familias y grupos; el self-hosting atiende a quienes desean operar su propia infraestructura, pero la experiencia cotidiana no debe exigir conocimientos técnicos.

## Product Purpose

2 Free ofrece una vista unificada de la vida financiera y herramientas para registrar movimientos, planificar, anticipar riesgos y seguir el crecimiento patrimonial. El producto tiene éxito cuando una persona puede tomar decisiones financieras informadas, recibir alertas útiles y elegir dónde se almacenan o sincronizan sus datos.

## Positioning

La misma aplicación funciona localmente con una base cifrada, puede sincronizarse con el servicio administrado o conectarse a una instancia self-hosted. Esta combinación de privacidad local, portabilidad y despliegue abierto permite cambiar de modo sin abandonar la interfaz ni perder la propiedad de la información.

## Operating Context

- Web autenticada conectada siempre a una API.
- Aplicaciones Tauri para escritorio y móvil, operativas sin conexión mediante SQLCipher.
- Sincronización opcional con el servicio administrado o una API self-hosted desplegada con Docker Compose.
- Registro frecuente de transacciones y revisión periódica de presupuestos, tarjetas y cuentas con rendimiento.
- Alertas nativas y web como mecanismo principal de seguimiento; el calendario es solo complementario.
- Exportación e importación portable para respaldo y migración entre modos.

## Capabilities and Constraints

- Presupuestos, metas de ahorro, gastos compartidos y contabilidad personal.
- Modelos distintos para tarjetas de crédito revolvente, tarjetas de servicio, débito y cuentas con rendimiento.
- Reglas de notificación automáticas y personalizadas.
- Better Auth, NestJS, Prisma y PostgreSQL para web, cloud-managed y self-hosting.
- SQLCipher local y sincronización opcional para Tauri.
- Montos exactos; los cálculos financieros no usan punto flotante binario.
- Nunca se solicita ni almacena un número de tarjeta completo o parcial.
- La URL del servicio cloud-managed es una configuración de compilación definida por el desarrollador, no una decisión del usuario.
- La URL solo se solicita para una instancia self-hosted.
- Los formularios complejos deben ser progresivos y presentarse bajo demanda, no como campos permanentes repartidos por la página.
- Los artefactos descargables de escritorio y Android se publican mediante GitHub Releases.

## Brand Commitments

- Nombre: 2 Free.
- Comunicación en español neutral, sin voseo rioplatense.
- Enfoque privacy-first, local-first y open source.
- Licencia GNU AGPLv3.
- Los logotipos suministrados deben conservarse como activos oficiales; `2free con fondi.svg` es el icono de aplicación preferido.
- La interfaz actual establece un lenguaje editorial cálido que debe mantenerse coherente entre landing, web, escritorio y móvil.

## Evidence on Hand

- Logo principal e iconos: `2free con fondi.svg`, `2free con texto debajo.png`, `2free.ico`, `2free.png`.
- Referencia visual original: `ui-reference.png`.
- Aplicación web: `apps/web/`.
- Aplicación Tauri compartida para escritorio y móvil: `apps/desktop/`.
- Landing pública: `apps/landing/`.
- Stack self-hosted: `compose.yml`.
- No existen todavía URLs definitivas confirmadas para el repositorio público, GitHub Releases o el servicio cloud-managed; deben configurarse sin inventarlas.

## Product Principles

1. La comprensión financiera precede a la complejidad técnica.
2. Los datos pertenecen a la persona y deben poder moverse entre modos.
3. Local es una capacidad completa, no una demostración reducida.
4. Las alertas deben anticipar decisiones, no generar ruido.
5. Una función financiera compleja debe presentarse de forma progresiva, comprensible y reversible.

## Accessibility & Inclusion

La experiencia debe ser operable con teclado, tecnologías de asistencia y entrada táctil. El color nunca es el único indicador de estado. Los objetivos táctiles, el contraste, el movimiento reducido, el lenguaje claro y la adaptación a pantallas móviles forman parte del funcionamiento básico.
