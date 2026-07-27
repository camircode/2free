# Aplicación Tauri local-first

La primera apertura ofrece tres modos: local, nube administrada y servidor propio. El modo local no
requiere cuenta ni red. Los modos API validan `/health` antes de guardar la elección y usan cookies de
sesión Better Auth con `credentials: include`. La nube administrada toma su URL inicial de
`VITE_CLOUD_API_URL`; el servidor propio comienza en `http://localhost:3001`, igual que Compose.

## Base local y clave

La persistencia financiera local usa `rusqlite` compilado con
`bundled-sqlcipher-vendored-openssl`. Antes de migrar o consultar datos, Rust ejecuta `PRAGMA key`,
comprueba `PRAGMA cipher_version`, verifica que la base responda con la clave y activa
`PRAGMA foreign_keys = ON`. La capacidad solo se presenta como `sqlcipher-verified` después de esas
comprobaciones en tiempo de ejecución.

La clave aleatoria de 256 bits y la configuración de modo se guardan fuera de SQLite mediante el
almacén seguro nativo del sistema: Keychain en Apple, Credential Manager en Windows, Secret Service
en Linux y Keystore en Android. Si SQLCipher o el almacén seguro no están disponibles, la aplicación
se cierra de forma segura y no crea una base SQLite de texto plano.

> **Advertencia de recuperación:** la base y la clave son necesarias para recuperar los datos
> locales. Eliminar la entrada del almacén seguro, restablecer el sistema o copiar únicamente el
> archivo `.db` vuelve inaccesible esa base. Exporte periódicamente un sobre portable v2 y protéjalo
> como un respaldo financiero.

## Cambio de modo

La sección **Ajustes** permite cambiar el origen sin borrar el anterior. La aplicación valida el API,
exige una sesión autenticada y una confirmación explícita, descarga una copia local previa y solo
activa el destino después de completar la importación. Si una carga falla, conserva la configuración,
la base local y el respaldo. La migración API a local se aplica en una transacción SQLCipher.

Los servidores remotos deben usar HTTPS. HTTP se acepta únicamente para `localhost`, `127.0.0.1` o
`::1`. La CSP permite HTTPS y API locales sin conceder permisos amplios de shell o sistema de archivos.

## Notificaciones nativas

La aplicación integra `tauri-plugin-notification` en Rust y JavaScript con el permiso
`notification:default`. Solicita autorización al usuario, evalúa reglas al iniciar y cada cinco
minutos mientras permanece abierta, y genera notificaciones nativas para vencimientos, cortes,
presupuestos, tarjetas, rendimiento y umbrales personalizados. Los identificadores entregados se
guardan en SQLCipher para evitar duplicados. No se usa el calendario del sistema.

## Desarrollo y compilación

```bash
pnpm dev:desktop
pnpm build:desktop
pnpm tauri:dev
pnpm tauri:build
pnpm --filter @2free/desktop tauri info
```

Tauri requiere Rust estable y los prerrequisitos nativos de cada plataforma.

## Android e iOS

La base Rust, el almacén seguro y el plugin de notificaciones incluyen rutas para Android/iOS. No se
descargan SDK desde este repositorio. Inicialice y ejecute los destinos solo después de instalar los
SDK externos:

```bash
pnpm tauri:android:init
pnpm tauri:android:dev
pnpm tauri:ios:init
pnpm tauri:ios:dev
```

Android necesita Android Studio, SDK, NDK y las variables de entorno que solicita Tauri. iOS necesita
macOS, Xcode y el SDK de iOS.
