import { Xmark } from "iconoir-react";
import { useEffect, useRef, useState, type FormEvent } from "react";

export type SessionUser = Readonly<{ email: string; name?: string }>;

type Feedback = Readonly<{ tone: "error" | "success"; message: string }>;

async function request(baseUrl: string, path: string, body?: Record<string, string>) {
  const response = await fetch(new URL(path, `${baseUrl.replace(/\/$/u, "")}/`), {
    method: body ? "POST" : "GET",
    credentials: "include",
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = (await response.json().catch(() => null)) as {
    user?: SessionUser;
    message?: string;
    error?: string;
  } | null;
  return { payload, response };
}

export function AuthAccess({
  baseUrl,
  onSession,
}: Readonly<{ baseUrl: string; onSession: (user?: SessionUser) => void }>) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [user, setUser] = useState<SessionUser>();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [feedback, setFeedback] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let active = true;
    void request(baseUrl, "api/auth/get-session")
      .then(({ payload, response }) => {
        if (!active) return;
        const current = response.ok ? payload?.user : undefined;
        setUser(current);
        onSession(current);
      })
      .catch(() => {
        if (active) onSession(undefined);
      });
    return () => {
      active = false;
    };
  }, [baseUrl, onSession]);

  function open() {
    setFeedback("");
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
    setFeedback("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const email = String(values.get("email") ?? "").trim();
    const password = String(values.get("password") ?? "");
    const name = String(values.get("name") ?? "").trim();
    setPending(true);
    setFeedback("");
    try {
      const { payload, response } = await request(
        baseUrl,
        mode === "sign-up" ? "api/auth/sign-up/email" : "api/auth/sign-in/email",
        mode === "sign-up" ? { email, password, name } : { email, password },
      );
      if (!response.ok) throw new Error(payload?.message || "No se pudo completar el acceso.");
      const current = payload?.user ?? { email, name };
      setUser(current);
      onSession(current);
      window.dispatchEvent(new Event("2free:session-changed"));
      close();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "No se pudo completar el acceso.");
    } finally {
      setPending(false);
    }
  }

  async function signOut() {
    setPending(true);
    setFeedback("");
    try {
      const { response } = await request(baseUrl, "api/auth/sign-out", {});
      if (!response.ok) throw new Error("No se pudo cerrar la sesión.");
      setUser(undefined);
      onSession(undefined);
      window.dispatchEvent(new Event("2free:session-changed"));
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "No se pudo cerrar la sesión.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="desktop-auth-access">
      {user ? (
        <>
          <span className="desktop-auth-access__identity">{user.name || user.email}</span>
          <button disabled={pending} onClick={() => void signOut()} type="button">
            {pending ? "Cerrando..." : "Salir"}
          </button>
        </>
      ) : (
        <button onClick={open} type="button">
          Iniciar sesión
        </button>
      )}
      {feedback && user ? <span role="alert">{feedback}</span> : null}
      <dialog
        aria-labelledby="desktop-auth-title"
        className="ui-transaction-dialog desktop-auth-dialog"
        onCancel={(event) => {
          event.preventDefault();
          close();
        }}
        ref={dialogRef}
      >
        <div className="ui-transaction-dialog__top">
          <div>
            <p className="desktop-kicker">Acceso a la réplica</p>
            <h2 id="desktop-auth-title">
              {mode === "sign-in" ? "Iniciar sesión" : "Crear una cuenta"}
            </h2>
          </div>
          <button aria-label="Cerrar" onClick={close} type="button">
            <Xmark />
          </button>
        </div>
        <form className="desktop-auth" onSubmit={submit}>
          {mode === "sign-up" ? (
            <label>
              Nombre
              <input autoComplete="name" name="name" required />
            </label>
          ) : null}
          <label>
            Correo
            <input autoComplete="email" name="email" required type="email" />
          </label>
          <label>
            Contraseña
            <input
              autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
              minLength={8}
              name="password"
              required
              type="password"
            />
          </label>
          {feedback ? <p role="alert">{feedback}</p> : null}
          <button disabled={pending} type="submit">
            {pending ? "Conectando..." : mode === "sign-in" ? "Acceder" : "Crear cuenta"}
          </button>
          <button
            className="desktop-link-button"
            onClick={() => setMode((current) => (current === "sign-in" ? "sign-up" : "sign-in"))}
            type="button"
          >
            {mode === "sign-in" ? "Crear una cuenta" : "Ya existe una cuenta"}
          </button>
        </form>
      </dialog>
    </div>
  );
}

export function ApiAccountSettings({ baseUrl }: Readonly<{ baseUrl: string }>) {
  const [status, setStatus] = useState<"loading" | "ready" | "signed-out" | "error">("loading");
  const [user, setUser] = useState<SessionUser>();
  const [feedback, setFeedback] = useState<Feedback>();
  const [pending, setPending] = useState<"name" | "password" | null>(null);

  useEffect(() => {
    let active = true;
    void request(baseUrl, "api/auth/get-session")
      .then(({ payload, response }) => {
        if (!active) return;
        if (response.ok && payload?.user) {
          setUser(payload.user);
          setStatus("ready");
        } else setStatus(response.ok || response.status === 401 ? "signed-out" : "error");
      })
      .catch(() => {
        if (active) setStatus("error");
      });
    return () => {
      active = false;
    };
  }, [baseUrl]);

  async function updateName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = String(new FormData(event.currentTarget).get("name") ?? "").trim();
    setPending("name");
    setFeedback(undefined);
    try {
      const { payload, response } = await request(baseUrl, "api/auth/update-user", { name });
      if (!response.ok) throw new Error(payload?.message || "No se pudo actualizar el nombre.");
      setUser((current) => (current ? { ...current, name } : current));
      setFeedback({ tone: "success", message: "Nombre actualizado." });
    } catch (error) {
      setFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "No se pudo actualizar el nombre.",
      });
    } finally {
      setPending(null);
    }
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const currentPassword = String(values.get("currentPassword") ?? "");
    const newPassword = String(values.get("newPassword") ?? "");
    if (newPassword !== String(values.get("confirmation") ?? "")) {
      setFeedback({ tone: "error", message: "La confirmación no coincide." });
      return;
    }
    setPending("password");
    setFeedback(undefined);
    try {
      const { payload, response } = await request(baseUrl, "api/auth/change-password", {
        currentPassword,
        newPassword,
      });
      if (!response.ok) throw new Error(payload?.message || "No se pudo cambiar la contraseña.");
      form.reset();
      setFeedback({ tone: "success", message: "Contraseña actualizada." });
    } catch (error) {
      setFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "No se pudo cambiar la contraseña.",
      });
    } finally {
      setPending(null);
    }
  }

  return (
    <section aria-labelledby="desktop-account-settings-title" className="account-settings">
      <div className="account-settings__intro">
        <h2 id="desktop-account-settings-title">Administre su cuenta</h2>
        <p>Actualice su identidad y sus credenciales de la réplica conectada.</p>
      </div>
      {status === "loading" ? (
        <p className="account-settings__state" role="status">
          Cargando la cuenta...
        </p>
      ) : status === "signed-out" ? (
        <div className="account-settings__state" role="status">
          Inicie sesión desde el encabezado para administrar la cuenta.
        </div>
      ) : status === "error" ? (
        <p className="account-settings__state" role="alert">
          No se pudo cargar la cuenta.
        </p>
      ) : user ? (
        <div className="account-settings__forms">
          <form className="account-settings__form" onSubmit={updateName}>
            <h3>Nombre visible</h3>
            <label className="account-settings__field">
              Nombre
              <input defaultValue={user.name ?? ""} name="name" required />
            </label>
            <button disabled={pending !== null} type="submit">
              {pending === "name" ? "Guardando..." : "Guardar nombre"}
            </button>
          </form>
          <form className="account-settings__form" onSubmit={changePassword}>
            <h3>Cambiar contraseña</h3>
            <label className="account-settings__field">
              Contraseña actual
              <input
                autoComplete="current-password"
                name="currentPassword"
                required
                type="password"
              />
            </label>
            <label className="account-settings__field">
              Nueva contraseña
              <input
                autoComplete="new-password"
                minLength={8}
                name="newPassword"
                required
                type="password"
              />
            </label>
            <label className="account-settings__field">
              Confirmar contraseña
              <input
                autoComplete="new-password"
                minLength={8}
                name="confirmation"
                required
                type="password"
              />
            </label>
            <button disabled={pending !== null} type="submit">
              {pending === "password" ? "Actualizando..." : "Cambiar contraseña"}
            </button>
          </form>
          {feedback ? (
            <p
              className={`account-settings__feedback account-settings__feedback--${feedback.tone}`}
              role={feedback.tone === "error" ? "alert" : "status"}
            >
              {feedback.message}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
