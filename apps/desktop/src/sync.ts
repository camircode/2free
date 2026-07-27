import type { ProductDataProvider, ProductKind, ProductRecord } from "@2free/data-provider/browser";

import type {
  DesktopPortableEnvelope,
  LocalAccount,
  LocalTransaction,
  PendingChange,
} from "./native";

export type SyncState = "offline" | "syncing" | "synced" | "error";
export type SyncStatus = Readonly<{
  state: SyncState;
  pending: number;
  message?: string;
  lastSyncedAt?: string;
}>;

export interface SyncNativePort {
  pendingChanges(): Promise<readonly PendingChange[]>;
  pendingCount(): Promise<number>;
  acknowledgeChange(operationId: string): Promise<void>;
  failChange(operationId: string, message: string): Promise<void>;
  setSyncMapping(entityKind: string, localId: string, remoteId: string): Promise<void>;
  getRemoteId(entityKind: string, localId: string): Promise<string | null>;
  createSyncBackup(): Promise<string>;
  mergeRemote(envelope: DesktopPortableEnvelope): Promise<void>;
}

export interface SyncApiPort {
  products: ProductDataProvider;
  request<T>(path: string, init?: RequestInit): Promise<T>;
}

type Listener = (status: SyncStatus) => void;

function productInput(kind: ProductKind, payload: unknown): Record<string, unknown> {
  const source = { ...(payload as Record<string, unknown>) };
  delete source.id;
  delete source.status;
  delete source.members;
  delete source.paidByUserId;
  if (kind === "shared-expense" && Array.isArray(source.splits)) {
    source.splits = source.splits.map((entry) => ({
      userId: String((entry as Record<string, unknown>).userId),
      weight: String((entry as Record<string, unknown>).weight ?? "1"),
    }));
  }
  return source;
}

function financeInput(payload: unknown): Record<string, unknown> {
  const source = { ...(payload as Record<string, unknown>) };
  delete source.id;
  delete source.createdAt;
  return source;
}

export class SyncCoordinator {
  private current: SyncStatus = { state: "offline", pending: 0 };
  private running?: Promise<void>;
  private readonly listeners = new Set<Listener>();

  constructor(
    private readonly local: SyncNativePort,
    private readonly api: SyncApiPort,
  ) {}

  status(): SyncStatus {
    return this.current;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.current);
    return () => this.listeners.delete(listener);
  }

  private publish(status: SyncStatus): void {
    this.current = status;
    this.listeners.forEach((listener) => listener(status));
  }

  synchronize(): Promise<void> {
    if (this.running) return this.running;
    this.running = this.run().finally(() => {
      this.running = undefined;
    });
    return this.running;
  }

  private async run(): Promise<void> {
    const pending = await this.local.pendingCount();
    this.publish({ state: "syncing", pending });
    let failure: Error | undefined;
    for (const change of await this.local.pendingChanges()) {
      try {
        await this.push(change);
        await this.local.acknowledgeChange(change.operationId);
      } catch (error) {
        failure = error instanceof Error ? error : new Error("La réplica rechazó el cambio.");
        await this.local.failChange(change.operationId, failure.message);
      }
    }
    try {
      const [finance, products] = await Promise.all([
        this.api.request<{
          version: 1;
          accounts: readonly LocalAccount[];
          transactions: readonly LocalTransaction[];
        }>("export"),
        this.api.products.exportProducts(),
      ]);
      await this.local.createSyncBackup();
      await this.local.mergeRemote({
        format: "2free-portable",
        version: 2,
        exportedAt: products.exportedAt,
        accounts: finance.accounts,
        transactions: finance.transactions,
        records: products.records,
      });
    } catch (error) {
      failure ??= error instanceof Error ? error : new Error("No se pudo descargar la réplica.");
    }
    const remaining = await this.local.pendingCount();
    if (failure) {
      this.publish({
        state: /sesión|conexión/iu.test(failure.message) ? "offline" : "error",
        pending: remaining,
        message: failure.message,
      });
      return;
    }
    this.publish({ state: "synced", pending: remaining, lastSyncedAt: new Date().toISOString() });
  }

  private async push(change: PendingChange): Promise<void> {
    if (change.entityKind === "account") {
      if (change.operation === "create") {
        const result = await this.api.request<{ account: LocalAccount }>("accounts", {
          method: "POST",
          headers: { "content-type": "application/json", "idempotency-key": change.operationId },
          body: JSON.stringify(financeInput(change.payload)),
        });
        await this.local.setSyncMapping("account", change.entityId, result.account.id);
        return;
      }
      const remoteId = await this.local.getRemoteId("account", change.entityId);
      if (!remoteId) throw new Error("La cuenta todavía no tiene correspondencia remota.");
      await this.api.request(`accounts/${encodeURIComponent(remoteId)}`, {
        method: change.operation === "update" ? "PATCH" : "DELETE",
        ...(change.operation === "update"
          ? {
              headers: { "content-type": "application/json" },
              body: JSON.stringify(financeInput(change.payload)),
            }
          : {}),
      });
      return;
    }
    if (change.entityKind === "transaction") {
      if (change.operation === "delete") {
        const remoteId = await this.local.getRemoteId("transaction", change.entityId);
        if (!remoteId) throw new Error("La transacción todavía no tiene correspondencia remota.");
        await this.api.request(`transactions/${encodeURIComponent(remoteId)}`, {
          method: "DELETE",
        });
        return;
      }
      const payload = financeInput(change.payload);
      const localAccountId = String(payload.accountId);
      const remoteAccountId = await this.local.getRemoteId("account", localAccountId);
      if (!remoteAccountId) {
        throw new Error("La cuenta de la transacción todavía no tiene correspondencia remota.");
      }
      payload.accountId = remoteAccountId;
      if (change.operation === "create") {
        const result = await this.api.request<{ transaction: LocalTransaction }>("transactions", {
          method: "POST",
          headers: { "content-type": "application/json", "idempotency-key": change.operationId },
          body: JSON.stringify(payload),
        });
        await this.local.setSyncMapping("transaction", change.entityId, result.transaction.id);
        return;
      }
      const remoteId = await this.local.getRemoteId("transaction", change.entityId);
      if (!remoteId) throw new Error("La transacción todavía no tiene correspondencia remota.");
      await this.api.request(`transactions/${encodeURIComponent(remoteId)}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      return;
    }
    if (!change.entityKind.startsWith("product:"))
      throw new Error("El tipo de cambio local no es compatible.");
    const kind = change.entityKind.slice("product:".length) as ProductKind;
    const remoteId = await this.local.getRemoteId(change.entityKind, change.entityId);
    if (change.operation === "create") {
      const record = await this.api.products.create<
        Record<string, unknown>,
        Record<string, unknown>
      >(kind, productInput(kind, change.payload), change.operationId);
      await this.local.setSyncMapping(change.entityKind, change.entityId, record.id);
      return;
    }
    if (!remoteId) throw new Error("El producto todavía no tiene correspondencia remota.");
    if (change.operation === "update") {
      await this.api.products.update(
        kind,
        remoteId,
        productInput(kind, change.payload),
        change.operationId,
      );
    } else {
      await this.api.products.delete(kind, remoteId, change.operationId);
    }
  }
}

export class SyncingDataProvider implements ProductDataProvider {
  constructor(
    private readonly local: ProductDataProvider,
    private readonly remote: ProductDataProvider | undefined,
    private readonly sync: () => void,
  ) {}

  list<T>(kind: ProductKind) {
    return this.local.list<T>(kind);
  }
  async create<TInput, TValue = TInput>(
    kind: ProductKind,
    input: TInput,
  ): Promise<ProductRecord<TValue>> {
    const record = await this.local.create<TInput, TValue>(kind, input);
    this.sync();
    return record;
  }
  async update<TInput, TValue = TInput>(
    kind: ProductKind,
    id: string,
    input: TInput,
  ): Promise<ProductRecord<TValue>> {
    const record = await this.local.update<TInput, TValue>(kind, id, input);
    this.sync();
    return record;
  }
  async delete(kind: ProductKind, id: string): Promise<void> {
    await this.local.delete(kind, id);
    this.sync();
  }
  async addSharedMember(groupId: string, userId: string): Promise<void> {
    await this.local.addSharedMember(groupId, userId);
    this.sync();
  }
  calculateYield(id: string, balance: Parameters<ProductDataProvider["calculateYield"]>[1]) {
    return this.local.calculateYield(id, balance);
  }
  exportProducts() {
    return this.local.exportProducts();
  }
  async importProducts(envelope: Parameters<ProductDataProvider["importProducts"]>[0]) {
    await this.local.importProducts(envelope);
    this.sync();
  }
  evaluateAlerts(value: Parameters<ProductDataProvider["evaluateAlerts"]>[0]) {
    return this.local.evaluateAlerts(value);
  }
}
