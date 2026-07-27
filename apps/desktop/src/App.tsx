import { getVersion } from "@tauri-apps/api/app";
import { isTauri } from "@tauri-apps/api/core";
import { Wallet } from "iconoir-react";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";

import { AppShell, FinanceDashboard, type NavigationItem } from "@2free/ui";
import logo from "@2free/ui/assets/2free-con-fondi.svg";
import {
  OnboardingModes,
  PortabilityExperience,
  SettingsWorkspace,
  TransactionComposer,
  type TransactionDraft,
  type TransactionSubmitResult,
} from "@2free/ui/portfolio";

import { AccountRegistration } from "./account-registration";
import { createRuntimeAdapter, type RuntimeAdapter } from "./adapters";
import { ApiAccountSettings, AuthAccess, type SessionUser } from "./auth-access";
import { initialSnapshot, type RuntimeSnapshot } from "./data";
import { AccountsManagement, TransactionsManagement } from "./finance-management";
import {
  native,
  type CapabilityReport,
  type RuntimeConfiguration,
  type RuntimeMode,
} from "./native";
import {
  askNotificationPermission,
  evaluateAndNotify,
  notificationPermission,
  type NativePermission,
} from "./notifications";
import { ProductSurfaceView } from "./product-surfaces";
import type { SyncStatus } from "./sync";

type Destination =
  | "inicio"
  | "cuentas"
  | "transacciones"
  | "presupuesto"
  | "compartidos"
  | "alertas"
  | "ajustes"
  | "portabilidad";
type Theme = "dark" | "light";

const destinations = new Set<Destination>([
  "inicio",
  "cuentas",
  "transacciones",
  "presupuesto",
  "compartidos",
  "alertas",
  "ajustes",
  "portabilidad",
]);

function isDestination(value: string): value is Destination {
  return destinations.has(value as Destination);
}

const navigation = [
  { id: "inicio", label: "Inicio" },
  { id: "cuentas", label: "Cuentas" },
  { id: "transacciones", label: "Transacciones" },
  { id: "presupuesto", label: "Presupuesto" },
] as const satisfies readonly NavigationItem[];

const secondaryNavigation = [
  { id: "compartidos", label: "Compartidos" },
  { id: "alertas", label: "Alertas" },
  { id: "portabilidad", label: "Portabilidad" },
  { id: "ajustes", label: "Ajustes" },
] as const satisfies readonly NavigationItem[];

const mobileNavigation = [
  { id: "inicio", label: "Inicio" },
  { id: "presupuesto", label: "Plan" },
  { id: "transacciones", label: "Actividad" },
  { id: "mas", label: "Más" },
] as const satisfies readonly NavigationItem[];

const cloudDefault = import.meta.env.VITE_CLOUD_API_URL?.trim() || "https://api.2free.app";
const selfHostDefault = "http://localhost:3001";

function validateApiUrl(value: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("Ingrese una URL válida para la API.");
  }
  const loopback =
    url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.hostname === "[::1]";
  if (url.protocol !== "https:" && !(url.protocol === "http:" && loopback)) {
    throw new Error("Los servidores remotos deben usar HTTPS; HTTP solo se permite en loopback.");
  }
  return url.origin;
}

function Onboarding({
  capability,
  onComplete,
}: Readonly<{
  capability: CapabilityReport;
  onComplete: (configuration: RuntimeConfiguration) => Promise<void>;
}>) {
  const [mode, setMode] = useState<RuntimeMode>("local");
  const [apiUrl, setApiUrl] = useState(selfHostDefault);
  const [feedback, setFeedback] = useState("");
  const [pending, setPending] = useState(false);

  function select(next: RuntimeMode) {
    setMode(next);
    if (next === "self-host") setApiUrl(selfHostDefault);
    setFeedback("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setFeedback("");
    try {
      const configuration: RuntimeConfiguration =
        mode === "local"
          ? { mode, syncEnabled: false }
          : {
              mode,
              apiUrl: validateApiUrl(mode === "cloud" ? cloudDefault : apiUrl),
              syncEnabled: true,
            };
      await native.saveConfiguration(configuration);
      await onComplete(configuration);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "No se pudo guardar la configuración.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="desktop-onboarding">
      <img alt="2 Free" src={logo} />
      <p className="desktop-kicker">Primera apertura</p>
      <h1>Elija dónde vivirán sus datos</h1>
      <p>
        SQLCipher conserva los datos sin conexión. La nube o el servidor propio son réplicas
        opcionales.
      </p>
      <OnboardingModes onSelect={select} selected={mode} />
      <form onSubmit={submit}>
        {mode === "self-host" ? (
          <label>
            URL de su servidor
            <input
              onChange={(event) => setApiUrl(event.target.value)}
              required
              type="url"
              value={apiUrl}
            />
          </label>
        ) : null}
        <div className="desktop-onboarding__proof">
          <strong>{capability.database}</strong>
          <span>SQLCipher {capability.cipherVersion} · clave en almacén seguro nativo</span>
        </div>
        {feedback ? <p role="alert">{feedback}</p> : null}
        <button disabled={pending} type="submit">
          {pending
            ? "Validando..."
            : mode === "local"
              ? "Comenzar sin conexión"
              : "Guardar y sincronizar"}
        </button>
      </form>
    </main>
  );
}

function ModeSettings({
  adapter,
  capability,
  onChanged,
  onSession,
}: Readonly<{
  adapter: RuntimeAdapter;
  capability: CapabilityReport;
  onChanged: (configuration: RuntimeConfiguration) => Promise<void>;
  onSession: (user?: SessionUser) => void;
}>) {
  const [mode, setMode] = useState<RuntimeMode>(adapter.configuration.mode);
  const [apiUrl, setApiUrl] = useState(adapter.configuration.apiUrl || selfHostDefault);
  const [syncEnabled, setSyncEnabled] = useState(
    adapter.configuration.syncEnabled !== false && adapter.configuration.mode !== "local",
  );
  const [feedback, setFeedback] = useState("");
  const [pending, setPending] = useState(false);

  async function apply() {
    setPending(true);
    setFeedback("");
    try {
      const target: RuntimeConfiguration =
        mode === "local"
          ? { mode, syncEnabled: false }
          : {
              mode,
              apiUrl: validateApiUrl(mode === "cloud" ? cloudDefault : apiUrl),
              syncEnabled,
            };
      await native.saveConfiguration(target);
      await onChanged(target);
      setFeedback("La réplica se reconfiguró sin eliminar ningún dato de SQLCipher.");
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : "No se pudo cambiar el modo. Se conservó el origen anterior.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="desktop-mode-settings">
      <p className="desktop-kicker">Origen activo</p>
      <h2>Cambiar modo sin perder datos</h2>
      <p>
        SQLCipher siempre es el origen local. Puede detener o cambiar la réplica sin borrar datos.
      </p>
      <p>
        <strong>Regla de conflicto:</strong> se conserva el cambio con la fecha de actualización más
        reciente; ante un empate o un cambio local pendiente, prevalece la copia local.
      </p>
      <div className="desktop-onboarding__choices">
        {(["local", "cloud", "self-host"] as const).map((value) => (
          <button
            aria-pressed={mode === value}
            key={value}
            onClick={() => {
              setMode(value);
              setApiUrl(value === "cloud" ? cloudDefault : selfHostDefault);
            }}
            type="button"
          >
            {value === "local" ? "Local" : value === "cloud" ? "Nube" : "Servidor propio"}
          </button>
        ))}
      </div>
      {mode !== "local" ? (
        <>
          {mode === "self-host" ? (
            <label>
              URL de su servidor
              <input onChange={(event) => setApiUrl(event.target.value)} value={apiUrl} />
            </label>
          ) : null}
          <AuthAccess baseUrl={mode === "cloud" ? cloudDefault : apiUrl} onSession={onSession} />
          <label className="desktop-confirm">
            <input
              checked={syncEnabled}
              onChange={(event) => setSyncEnabled(event.target.checked)}
              type="checkbox"
            />
            Replicar mientras la aplicación está abierta
          </label>
        </>
      ) : null}
      <button disabled={pending} onClick={() => void apply()} type="button">
        {pending ? "Guardando..." : "Guardar configuración de réplica"}
      </button>
      <div className="desktop-onboarding__proof">
        <strong>{capability.database}</strong>
        <span>
          {capability.keyStorage} · SQLCipher {capability.cipherVersion}
        </span>
      </div>
      {feedback ? <p role="status">{feedback}</p> : null}
    </section>
  );
}

function HomeGreeting() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";
  return (
    <header className="desktop-home__heading">
      <p>{greeting}</p>
      <h1>Su espacio financiero</h1>
    </header>
  );
}

export function App() {
  const [active, setActive] = useState<Destination>("inicio");
  const [snapshot, setSnapshot] = useState<RuntimeSnapshot>(initialSnapshot);
  const [configuration, setConfiguration] = useState<RuntimeConfiguration>();
  const [capability, setCapability] = useState<CapabilityReport>();
  const [adapter, setAdapter] = useState<RuntimeAdapter>();
  const [fatal, setFatal] = useState("");
  const [theme, setTheme] = useState<Theme>("light");
  const userThemeRef = useRef(false);
  const [version, setVersion] = useState<string>();
  const [permission, setPermission] = useState<NativePermission>("default");
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ state: "offline", pending: 0 });
  const updateSession = useCallback(
    (user?: SessionUser) => {
      if (user) void adapter?.syncNow();
    },
    [adapter],
  );

  const navigate = useCallback((next: Destination) => {
    setActive(next);
    if (window.location.hash !== `#${next}`) {
      window.history.pushState({ destination: next }, "", `#${next}`);
    }
  }, []);

  useEffect(() => {
    const initial = window.location.hash.slice(1);
    if (isDestination(initial)) setActive(initial);
    const handlePopState = () => {
      const next = window.location.hash.slice(1);
      setActive(isDestination(next) ? next : "inicio");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const activate = useCallback(async (next: RuntimeConfiguration) => {
    const nextAdapter = createRuntimeAdapter(next);
    setConfiguration(next);
    setAdapter(nextAdapter);
    try {
      setSnapshot(await nextAdapter.load());
      void nextAdapter.syncNow();
    } catch (error) {
      setFatal(error instanceof Error ? error.message : "No se pudo cargar la fuente de datos.");
    }
  }, []);

  useEffect(() => {
    if (!isTauri()) {
      setFatal("La persistencia local segura requiere ejecutar la aplicación dentro de Tauri.");
      return;
    }
    void Promise.all([
      native.initialize(),
      native.loadConfiguration(),
      getVersion(),
      notificationPermission(),
    ])
      .then(async ([report, stored, appVersion, currentPermission]) => {
        setCapability(report);
        setVersion(appVersion);
        setPermission(currentPermission);
        if (stored) await activate(stored);
      })
      .catch((error: unknown) =>
        setFatal(error instanceof Error ? error.message : "La inicialización segura falló."),
      );
  }, [activate]);

  useEffect(() => {
    const storedTheme = localStorage.getItem("2free-theme");
    if (storedTheme === "dark" || storedTheme === "light") {
      userThemeRef.current = true;
      setTheme(storedTheme);
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const syncSystemTheme = () => {
      if (!userThemeRef.current) setTheme(mediaQuery.matches ? "dark" : "light");
    };
    syncSystemTheme();
    mediaQuery.addEventListener?.("change", syncSystemTheme);
    return () => mediaQuery.removeEventListener?.("change", syncSystemTheme);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    if (userThemeRef.current) localStorage.setItem("2free-theme", theme);
    const themeColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--surface-canvas")
      .trim();
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", themeColor);
  }, [theme]);

  useEffect(() => {
    if (!adapter) return;
    const refresh = () =>
      void adapter
        .load()
        .then(setSnapshot)
        .catch(() => undefined);
    window.addEventListener("2free:data-changed", refresh);
    return () => window.removeEventListener("2free:data-changed", refresh);
  }, [adapter]);

  useEffect(() => {
    if (!adapter) return;
    const unsubscribe = adapter.subscribeSync(setSyncStatus);
    const synchronize = () => void adapter.syncNow();
    window.addEventListener("online", synchronize);
    window.addEventListener("focus", synchronize);
    const timer = window.setInterval(synchronize, 5 * 60_000);
    return () => {
      unsubscribe();
      window.removeEventListener("online", synchronize);
      window.removeEventListener("focus", synchronize);
      window.clearInterval(timer);
    };
  }, [adapter]);

  useEffect(() => {
    if (!adapter) return;
    const evaluate = () => void evaluateAndNotify(adapter.products).catch(() => undefined);
    evaluate();
    const timer = window.setInterval(evaluate, 5 * 60_000);
    return () => window.clearInterval(timer);
  }, [adapter]);

  if (fatal)
    return (
      <main className="desktop-fatal">
        <img alt="2 Free" src={logo} />
        <p className="desktop-kicker">Capacidad no disponible</p>
        <h1>La aplicación se cerró de forma segura</h1>
        <p>{fatal}</p>
        <p>No se creó una alternativa SQLite de texto plano.</p>
      </main>
    );
  if (!capability)
    return (
      <main className="desktop-loading" aria-busy="true">
        Verificando SQLCipher y el almacén seguro...
      </main>
    );
  if (!configuration || !adapter)
    return <Onboarding capability={capability} onComplete={activate} />;
  const runtimeAdapter = adapter;
  const runtimeConfiguration = configuration;

  async function reload() {
    setSnapshot(await runtimeAdapter.load());
    void runtimeAdapter.syncNow();
  }
  async function submit(draft: TransactionDraft): Promise<TransactionSubmitResult> {
    const account = snapshot.accountOptions.find((item) => item.id === draft.accountId);
    if (!account) return { status: "error", message: "La cuenta ya no está disponible." };
    try {
      setSnapshot(await runtimeAdapter.submitTransaction(draft, account));
      return {
        status: "success",
        message:
          runtimeConfiguration.syncEnabled === false || runtimeConfiguration.mode === "local"
            ? "La transacción se guardó en SQLCipher."
            : "La transacción se guardó en SQLCipher y quedó lista para sincronizar.",
      };
    } catch (error) {
      return {
        status: "error",
        message: error instanceof Error ? error.message : "No se pudo registrar la transacción.",
      };
    }
  }
  async function requestNotifications() {
    setPermission(await askNotificationPermission());
  }
  async function evaluate() {
    const count = await evaluateAndNotify(runtimeAdapter.products);
    return count
      ? `${count} alerta${count === 1 ? "" : "s"} evaluada${count === 1 ? "" : "s"}.`
      : "No existen alertas nuevas.";
  }

  const composer = <TransactionComposer accounts={snapshot.accountOptions} onSubmit={submit} />;
  const accountRegistration = (
    <AccountRegistration onCreated={reload} products={runtimeAdapter.products} />
  );
  const productSurface =
    active === "presupuesto" ? "budgets" : active === "compartidos" ? "shared" : "alerts";

  return (
    <div className="desktop-app" data-runtime-mode={configuration.mode}>
      <AppShell
        activeItemId={active}
        actions={
          <div className="desktop-app__actions">
            <span
              className="desktop-app__mode"
              data-mode={configuration.mode === "local" ? "local" : "api"}
            >
              {configuration.mode === "local"
                ? "Local · SQLCipher"
                : configuration.mode === "cloud"
                  ? "Nube administrada"
                  : "Servidor propio"}
            </span>
            <span className="desktop-app__sync" data-state={syncStatus.state}>
              {syncStatus.state === "syncing"
                ? "Sincronizando"
                : syncStatus.state === "synced"
                  ? "Sincronizado"
                  : syncStatus.state === "error"
                    ? "Error de sincronización"
                    : "Sin conexión"}
              {syncStatus.pending ? ` · ${syncStatus.pending} pendientes` : ""}
            </span>
            {configuration.apiUrl ? (
              <AuthAccess baseUrl={configuration.apiUrl} onSession={updateSession} />
            ) : null}
          </div>
        }
        brand={
          <span aria-hidden="true" className="desktop-app__wordmark">
            2 Free
          </span>
        }
        mobileNavigation={mobileNavigation}
        navigation={navigation}
        onNavigate={(itemId) => navigate(itemId as Destination)}
        secondaryNavigation={secondaryNavigation}
        onThemeToggle={() => {
          userThemeRef.current = true;
          setTheme((current) => (current === "dark" ? "light" : "dark"));
        }}
        theme={theme}
      >
        <section className="desktop-app__page" data-destination={active}>
          {active === "inicio" ? (
            <>
              <HomeGreeting />
              <section
                aria-labelledby="desktop-home-actions-title"
                className="desktop-home__actions"
              >
                <h2 id="desktop-home-actions-title">
                  {snapshot.accountOptions.length ? "Acciones rápidas" : "Primeros pasos"}
                </h2>
                <div className="desktop-home__action-list">
                  {snapshot.accountOptions.length ? (
                    <>
                      <TransactionComposer
                        accounts={snapshot.accountOptions}
                        compactTrigger
                        initialType="expense"
                        onSubmit={submit}
                        triggerLabel="Registrar una compra"
                      />
                      <TransactionComposer
                        accounts={snapshot.accountOptions}
                        compactTrigger
                        initialType="income"
                        onSubmit={submit}
                        triggerLabel="Registrar un ingreso"
                      />
                      <button
                        className="desktop-home__action"
                        onClick={() => navigate("cuentas")}
                        type="button"
                      >
                        <span aria-hidden="true">
                          <Wallet />
                        </span>
                        Ver mis cuentas
                      </button>
                    </>
                  ) : (
                    accountRegistration
                  )}
                </div>
              </section>
              {snapshot.dashboard.status === "empty" ? null : (
                <FinanceDashboard compact state={snapshot.dashboard} />
              )}
            </>
          ) : null}
          {active === "cuentas" ? (
            <AccountsManagement
              action={accountRegistration}
              adapter={runtimeAdapter}
              data={snapshot.accounts}
              onChanged={reload}
            />
          ) : null}
          {active === "transacciones" ? (
            <TransactionsManagement
              accounts={snapshot.accountOptions}
              adapter={runtimeAdapter}
              data={snapshot.transactions}
              onChanged={reload}
              registrationAction={
                snapshot.accountOptions.length ? (
                  composer
                ) : (
                  <button
                    className="ui-portfolio__button ui-portfolio__button--dark"
                    onClick={() => navigate("cuentas")}
                    type="button"
                  >
                    Crear cuenta para registrar movimientos
                  </button>
                )
              }
            />
          ) : null}
          {(["presupuesto", "compartidos", "alertas"] as Destination[]).includes(active) ? (
            <ProductSurfaceView
              notificationPermission={permission}
              onEvaluate={evaluate}
              onRequestPermission={requestNotifications}
              provider={adapter.products}
              surface={productSurface}
            />
          ) : null}
          {active === "ajustes" ? (
            <>
              {configuration.apiUrl ? <ApiAccountSettings baseUrl={configuration.apiUrl} /> : null}
              <SettingsWorkspace
                onExport={() => adapter.exportData()}
                onImport={(file) => adapter.importData(file)}
                web={false}
              />
              <ModeSettings
                adapter={adapter}
                capability={capability}
                onChanged={activate}
                onSession={updateSession}
              />
            </>
          ) : null}
          {active === "portabilidad" ? (
            <PortabilityExperience
              onExport={() => adapter.exportData()}
              onImport={(file) => adapter.importData(file)}
            />
          ) : null}
        </section>
      </AppShell>
      <footer className="desktop-app__footer">
        <span>
          {capability.database} · {capability.keyStorage}
        </span>
        {version ? <span>2 Free v{version}</span> : null}
      </footer>
    </div>
  );
}
