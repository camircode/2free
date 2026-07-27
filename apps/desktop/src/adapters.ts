import { ApiProvider, type ProductDataProvider } from "@2free/data-provider/browser";
import type { AccountOption, TransactionDraft } from "@2free/ui/portfolio";

import { initialSnapshot, snapshotFromRecords, type RuntimeSnapshot } from "./data";
import {
  native,
  TauriProductProvider,
  type AccountInput,
  type DesktopPortableEnvelope,
  type LocalAccount,
  type LocalTransaction,
  type RuntimeConfiguration,
  type TransactionInput,
} from "./native";
import { SyncCoordinator, SyncingDataProvider, type SyncStatus } from "./sync";

export interface RuntimeAdapter {
  readonly configuration: RuntimeConfiguration;
  readonly products: ProductDataProvider;
  load(): Promise<RuntimeSnapshot>;
  updateAccount(id: string, input: AccountInput): Promise<LocalAccount>;
  deleteAccount(id: string): Promise<void>;
  updateTransaction(id: string, input: TransactionInput): Promise<LocalTransaction>;
  deleteTransaction(id: string): Promise<void>;
  submitTransaction(draft: TransactionDraft, account: AccountOption): Promise<RuntimeSnapshot>;
  exportData(): Promise<string>;
  importData(file: File): Promise<string>;
  syncNow(): Promise<void>;
  subscribeSync(listener: (status: SyncStatus) => void): () => void;
}

export function downloadJson(contents: string, prefix = "2free"): void {
  const url = URL.createObjectURL(new Blob([contents], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${prefix}-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function amountCoefficient(amount: string, type: TransactionDraft["type"]): string {
  const [whole = "0", fraction = ""] = amount.trim().split(".");
  const coefficient = `${whole}${fraction.padEnd(2, "0")}`.replace(/^0+(?=\d)/u, "") || "0";
  return type === "expense" ? `-${coefficient}` : coefficient;
}

export class LocalAdapter implements RuntimeAdapter {
  readonly products: ProductDataProvider = new TauriProductProvider();

  constructor(readonly configuration: RuntimeConfiguration) {}

  async load(): Promise<RuntimeSnapshot> {
    const [accounts, transactions] = await Promise.all([
      native.listAccounts(),
      native.listTransactions(),
    ]);
    return snapshotFromRecords(accounts, transactions);
  }

  async submitTransaction(draft: TransactionDraft, account: AccountOption) {
    await native.createTransaction({
      accountId: draft.accountId,
      amount: {
        currency: account.currency,
        coefficient: amountCoefficient(draft.amount, draft.type),
        scale: 2,
      },
      metadata: {
        category: draft.category.trim(),
        date: draft.date,
        description: draft.description.trim(),
        type: draft.type,
      },
    });
    return this.load();
  }

  updateAccount(id: string, input: AccountInput) {
    return native.updateAccount(id, input);
  }

  deleteAccount(id: string) {
    return native.deleteAccount(id);
  }

  updateTransaction(id: string, input: TransactionInput) {
    return native.updateTransaction(id, input);
  }

  deleteTransaction(id: string) {
    return native.deleteTransaction(id);
  }

  async exportData() {
    downloadJson(JSON.stringify(await native.exportPortable(), null, 2), "2free-portable-v2");
    return "La copia cifrada se exportó como sobre portable v2.";
  }

  async importData(file: File) {
    if (file.size > 5_000_000) throw new Error("El archivo supera el límite de 5 MB.");
    await native.createSyncBackup();
    await native.importPortable(JSON.parse(await file.text()) as DesktopPortableEnvelope);
    window.dispatchEvent(new Event("2free:data-changed"));
    return "El respaldo portable v2 se importó en una transacción cifrada.";
  }

  async syncNow() {}
  subscribeSync(listener: (status: SyncStatus) => void) {
    listener({ state: "offline", pending: 0, message: "La réplica está desactivada." });
    return () => {};
  }
}

type ApiPayload = Readonly<{
  accounts?: readonly LocalAccount[];
  transactions?: readonly LocalTransaction[];
}>;

export class ApiRuntimeAdapter implements RuntimeAdapter {
  readonly products: ProductDataProvider;
  private readonly baseUrl: string;

  constructor(readonly configuration: RuntimeConfiguration) {
    if (!configuration.apiUrl) throw new Error("El modo API requiere una URL.");
    this.baseUrl = `${configuration.apiUrl.replace(/\/$/u, "")}/`;
    this.products = new ApiProvider(configuration.apiUrl);
  }

  async request<T>(path: string, init?: RequestInit): Promise<T> {
    let response: Response;
    try {
      response = await fetch(new URL(path, this.baseUrl), {
        ...init,
        credentials: "include",
      });
    } catch {
      throw new Error("Sin conexión con la réplica; los datos locales se conservaron.");
    }
    const payload = (await response.json().catch(() => null)) as T & { message?: string };
    if (!response.ok) {
      throw new Error(
        response.status === 401
          ? "La sesión de API no está disponible. Inicie sesión para continuar."
          : payload?.message || `La API rechazó la operación (${response.status}).`,
      );
    }
    return payload;
  }

  async load() {
    try {
      const [accountPayload, transactionPayload] = await Promise.all([
        this.request<ApiPayload>("accounts"),
        this.request<ApiPayload>("transactions"),
      ]);
      return snapshotFromRecords(
        accountPayload.accounts ?? [],
        transactionPayload.transactions ?? [],
      );
    } catch (error) {
      if (error instanceof Error && error.message.includes("sesión")) throw error;
      return initialSnapshot;
    }
  }

  async submitTransaction(draft: TransactionDraft, account: AccountOption) {
    await this.request("transactions", {
      method: "POST",
      headers: { "content-type": "application/json", "idempotency-key": crypto.randomUUID() },
      body: JSON.stringify({
        accountId: draft.accountId,
        amount: {
          currency: account.currency,
          coefficient: amountCoefficient(draft.amount, draft.type),
          scale: 2,
        },
        metadata: {
          category: draft.category.trim(),
          date: draft.date,
          description: draft.description.trim(),
          type: draft.type,
        },
      }),
    });
    return this.load();
  }

  updateAccount(id: string, input: AccountInput) {
    return this.request<{ account: LocalAccount }>(`accounts/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    }).then((payload) => payload.account);
  }

  async deleteAccount(id: string) {
    await this.request(`accounts/${encodeURIComponent(id)}`, { method: "DELETE" });
  }

  updateTransaction(id: string, input: TransactionInput) {
    return this.request<{ transaction: LocalTransaction }>(
      `transactions/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      },
    ).then((payload) => payload.transaction);
  }

  async deleteTransaction(id: string) {
    await this.request(`transactions/${encodeURIComponent(id)}`, { method: "DELETE" });
  }

  async exportData() {
    const [finance, products] = await Promise.all([
      this.request<Record<string, unknown>>("export"),
      this.products.exportProducts(),
    ]);
    downloadJson(JSON.stringify({ ...finance, products }, null, 2), "2free-api");
    return "La copia de la API se exportó correctamente.";
  }

  async importData(file: File) {
    const payload = JSON.parse(await file.text()) as Record<string, unknown>;
    await this.request("import", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (payload.products) {
      await this.products.importProducts(payload.products as never);
    }
    window.dispatchEvent(new Event("2free:data-changed"));
    return "La API validó e importó el respaldo.";
  }

  async syncNow() {}
  subscribeSync(listener: (status: SyncStatus) => void) {
    listener({ state: "synced", pending: 0 });
    return () => {};
  }
}

export class SyncingRuntimeAdapter extends LocalAdapter {
  override readonly products: ProductDataProvider;
  private readonly coordinator: SyncCoordinator;

  constructor(configuration: RuntimeConfiguration) {
    super(configuration);
    const api = new ApiRuntimeAdapter(configuration);
    this.coordinator = new SyncCoordinator(native, api);
    this.products = new SyncingDataProvider(new TauriProductProvider(), api.products, () => {
      void this.syncNow();
    });
  }

  override async submitTransaction(draft: TransactionDraft, account: AccountOption) {
    const snapshot = await super.submitTransaction(draft, account);
    void this.syncNow();
    return snapshot;
  }

  override async updateAccount(id: string, input: AccountInput) {
    const account = await super.updateAccount(id, input);
    void this.syncNow();
    return account;
  }

  override async deleteAccount(id: string) {
    await super.deleteAccount(id);
    void this.syncNow();
  }

  override async updateTransaction(id: string, input: TransactionInput) {
    const transaction = await super.updateTransaction(id, input);
    void this.syncNow();
    return transaction;
  }

  override async deleteTransaction(id: string) {
    await super.deleteTransaction(id);
    void this.syncNow();
  }

  override syncNow() {
    return this.coordinator.synchronize();
  }

  override subscribeSync(listener: (status: SyncStatus) => void) {
    return this.coordinator.subscribe(listener);
  }
}

export function createRuntimeAdapter(configuration: RuntimeConfiguration): RuntimeAdapter {
  return configuration.mode === "local" || configuration.syncEnabled === false
    ? new LocalAdapter(configuration)
    : new SyncingRuntimeAdapter(configuration);
}
