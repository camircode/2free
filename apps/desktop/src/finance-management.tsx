import { EditPencil, Trash, Xmark } from "iconoir-react";
import { useRef, useState, type FormEvent, type ReactNode } from "react";

import {
  AccountsOverview,
  TransactionsOverview,
  type AccountOverviewItem,
  type AccountsOverviewData,
  type AccountOption,
  type TransactionDraft,
  type TransactionListItem,
  type TransactionsOverviewData,
} from "@2free/ui/portfolio";

import type { RuntimeAdapter } from "./adapters";

type Feedback = Readonly<{ tone: "error" | "success"; message: string }>;

function money(value: string, currency: string, negative = false) {
  if (!/^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/u.test(value.trim())) {
    throw new Error("Ingrese un monto válido con hasta dos decimales.");
  }
  const [whole = "0", fraction = ""] = value.trim().split(".");
  const coefficient = `${whole}${fraction.padEnd(2, "0")}`.replace(/^0+(?=\d)/u, "") || "0";
  return { currency, coefficient: negative ? `-${coefficient}` : coefficient, scale: 2 };
}

function RecordButton({
  children,
  danger = false,
  onClick,
}: Readonly<{ children: ReactNode; danger?: boolean; onClick: () => void }>) {
  return (
    <button data-danger={danger || undefined} onClick={onClick} type="button">
      {children}
    </button>
  );
}

export function AccountsManagement({
  action,
  adapter,
  data,
  onChanged,
}: Readonly<{
  action: ReactNode;
  adapter: RuntimeAdapter;
  data: AccountsOverviewData;
  onChanged: () => Promise<void>;
}>) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [editing, setEditing] = useState<AccountOverviewItem>();
  const [deleting, setDeleting] = useState<AccountOverviewItem>();
  const [feedback, setFeedback] = useState<Feedback>();
  const [pending, setPending] = useState(false);

  function open(account: AccountOverviewItem, mode: "edit" | "delete") {
    setFeedback(undefined);
    if (mode === "edit") setEditing(account);
    else setDeleting(account);
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
    setEditing(undefined);
    setDeleting(undefined);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const values = new FormData(event.currentTarget);
    const label = String(values.get("label") ?? "").trim();
    const statementBalance = String(
      values.get("statementBalance") ?? editing.statementBalance ?? "0",
    );
    setPending(true);
    setFeedback(undefined);
    try {
      await adapter.updateAccount(editing.id, {
        type: editing.type,
        label,
        currency: editing.currency,
        metadata: {},
        ...(editing.type === "revolving-credit" || editing.type === "charge-card"
          ? { statementBalance: money(statementBalance, editing.currency) }
          : {}),
      });
      await onChanged();
      close();
    } catch (error) {
      setFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "No se pudo actualizar la cuenta.",
      });
    } finally {
      setPending(false);
    }
  }

  async function remove() {
    if (!deleting || deleting.transactionCount > 0) return;
    setPending(true);
    setFeedback(undefined);
    try {
      await adapter.deleteAccount(deleting.id);
      await onChanged();
      close();
    } catch (error) {
      setFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "No se pudo eliminar la cuenta.",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <AccountsOverview
        action={action}
        data={data}
        renderActions={(account) => (
          <>
            <RecordButton onClick={() => open(account, "edit")}>
              <EditPencil /> Editar
            </RecordButton>
            <RecordButton danger onClick={() => open(account, "delete")}>
              <Trash /> Eliminar
            </RecordButton>
          </>
        )}
      />
      <dialog
        aria-labelledby="desktop-account-dialog-title"
        className="ui-transaction-dialog finance-record-dialog"
        onClose={() => {
          setEditing(undefined);
          setDeleting(undefined);
        }}
        ref={dialogRef}
      >
        <div className="ui-transaction-dialog__top">
          <h2 id="desktop-account-dialog-title">{editing ? "Editar cuenta" : "Eliminar cuenta"}</h2>
          <button aria-label="Cerrar" onClick={close} type="button">
            <Xmark />
          </button>
        </div>
        {editing ? (
          <form onSubmit={submit}>
            <label>
              Nombre
              <input autoFocus defaultValue={editing.label} maxLength={80} name="label" required />
            </label>
            <label>
              Moneda
              <input disabled value={editing.currency} />
            </label>
            {editing.statementBalance !== undefined ? (
              <label>
                Saldo actual
                <input
                  defaultValue={editing.statementBalance}
                  inputMode="decimal"
                  name="statementBalance"
                  required
                />
              </label>
            ) : null}
            {feedback ? (
              <p data-tone={feedback.tone} role="alert">
                {feedback.message}
              </p>
            ) : null}
            <div className="ui-transaction-dialog__actions">
              <button onClick={close} type="button">
                Cancelar
              </button>
              <button
                className="ui-portfolio__button ui-portfolio__button--dark"
                disabled={pending}
                type="submit"
              >
                {pending ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>
        ) : deleting ? (
          <div className="finance-record-dialog__confirmation">
            <p>
              {deleting.transactionCount > 0
                ? `Esta cuenta tiene ${deleting.transactionCount} movimiento${deleting.transactionCount === 1 ? "" : "s"}. Elimine primero las transacciones asociadas.`
                : `Se eliminará “${deleting.label}”. Esta acción no se puede deshacer.`}
            </p>
            {feedback ? (
              <p data-tone={feedback.tone} role="alert">
                {feedback.message}
              </p>
            ) : null}
            <div className="ui-transaction-dialog__actions">
              <button onClick={close} type="button">
                Cancelar
              </button>
              <button
                className="ui-portfolio__button ui-portfolio__button--dark"
                disabled={pending || deleting.transactionCount > 0}
                onClick={() => void remove()}
                type="button"
              >
                {pending ? "Eliminando..." : "Eliminar cuenta"}
              </button>
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}

export function TransactionsManagement({
  accounts,
  adapter,
  data,
  onChanged,
  registrationAction,
}: Readonly<{
  accounts: readonly AccountOption[];
  adapter: RuntimeAdapter;
  data: TransactionsOverviewData;
  onChanged: () => Promise<void>;
  registrationAction: ReactNode;
}>) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [editing, setEditing] = useState<TransactionListItem>();
  const [deleting, setDeleting] = useState<TransactionListItem>();
  const [feedback, setFeedback] = useState<Feedback>();
  const [pending, setPending] = useState(false);

  function open(item: TransactionListItem, mode: "edit" | "delete") {
    setFeedback(undefined);
    if (mode === "edit") setEditing(item);
    else setDeleting(item);
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
    setEditing(undefined);
    setDeleting(undefined);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const values = new FormData(event.currentTarget);
    const draft: TransactionDraft = {
      accountId: String(values.get("accountId")),
      type: String(values.get("type")) as TransactionDraft["type"],
      amount: String(values.get("amount")),
      date: String(values.get("date")),
      category: String(values.get("category") ?? "").trim(),
      description: String(values.get("description") ?? "").trim(),
    };
    const account = accounts.find((item) => item.id === draft.accountId);
    if (!account) {
      setFeedback({ tone: "error", message: "La cuenta seleccionada ya no está disponible." });
      return;
    }
    setPending(true);
    setFeedback(undefined);
    try {
      await adapter.updateTransaction(editing.id, {
        accountId: draft.accountId,
        amount: money(draft.amount, account.currency, draft.type === "expense"),
        metadata: {
          category: draft.category,
          date: draft.date,
          description: draft.description,
          type: draft.type,
        },
      });
      await onChanged();
      close();
    } catch (error) {
      setFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "No se pudo actualizar la transacción.",
      });
    } finally {
      setPending(false);
    }
  }

  async function remove() {
    if (!deleting) return;
    setPending(true);
    setFeedback(undefined);
    try {
      await adapter.deleteTransaction(deleting.id);
      await onChanged();
      close();
    } catch (error) {
      setFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "No se pudo eliminar la transacción.",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <TransactionsOverview
        data={data}
        registrationAction={registrationAction}
        renderActions={(item) => (
          <>
            <RecordButton onClick={() => open(item, "edit")}>
              <EditPencil /> Editar
            </RecordButton>
            <RecordButton danger onClick={() => open(item, "delete")}>
              <Trash /> Eliminar
            </RecordButton>
          </>
        )}
      />
      <dialog
        aria-labelledby="desktop-transaction-dialog-title"
        className="ui-transaction-dialog finance-record-dialog"
        onClose={() => {
          setEditing(undefined);
          setDeleting(undefined);
        }}
        ref={dialogRef}
      >
        <div className="ui-transaction-dialog__top">
          <h2 id="desktop-transaction-dialog-title">
            {editing ? "Editar transacción" : "Eliminar transacción"}
          </h2>
          <button aria-label="Cerrar" onClick={close} type="button">
            <Xmark />
          </button>
        </div>
        {editing ? (
          <form onSubmit={submit}>
            <label>
              Cuenta
              <select defaultValue={editing.accountId} name="accountId" required>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Tipo
              <select defaultValue={editing.type} name="type">
                <option value="expense">Gasto</option>
                <option value="income">Ingreso</option>
              </select>
            </label>
            <label>
              Monto
              <input
                defaultValue={editing.amountValue}
                inputMode="decimal"
                name="amount"
                required
              />
            </label>
            <label>
              Fecha
              <input defaultValue={editing.dateIso} name="date" required type="date" />
            </label>
            <label>
              Categoría
              <input defaultValue={editing.category} name="category" required />
            </label>
            <label>
              Descripción
              <input defaultValue={editing.label} name="description" required />
            </label>
            {feedback ? (
              <p data-tone={feedback.tone} role="alert">
                {feedback.message}
              </p>
            ) : null}
            <div className="ui-transaction-dialog__actions">
              <button onClick={close} type="button">
                Cancelar
              </button>
              <button
                className="ui-portfolio__button ui-portfolio__button--dark"
                disabled={pending}
                type="submit"
              >
                {pending ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>
        ) : deleting ? (
          <div className="finance-record-dialog__confirmation">
            <p>
              Se eliminará “{deleting.label}” por {deleting.amount}. Esta acción no se puede
              deshacer.
            </p>
            {feedback ? (
              <p data-tone={feedback.tone} role="alert">
                {feedback.message}
              </p>
            ) : null}
            <div className="ui-transaction-dialog__actions">
              <button onClick={close} type="button">
                Cancelar
              </button>
              <button
                className="ui-portfolio__button ui-portfolio__button--dark"
                disabled={pending}
                onClick={() => void remove()}
                type="button"
              >
                {pending ? "Eliminando..." : "Eliminar transacción"}
              </button>
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
