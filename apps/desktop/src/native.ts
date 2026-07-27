import { invoke } from "@tauri-apps/api/core";

import type {
  MoneyDto,
  NotificationEvent,
  PortableProductEnvelope,
  ProductDataProvider,
  ProductKind,
  ProductRecord,
} from "@2free/data-provider/browser";

export type RuntimeMode = "local" | "cloud" | "self-host";
export type RuntimeConfiguration = Readonly<{
  mode: RuntimeMode;
  apiUrl?: string;
  syncEnabled?: boolean;
}>;
export type CapabilityReport = Readonly<{
  database: "sqlcipher-verified";
  keyStorage: "os-secure-store";
  cipherVersion: string;
  databasePath: string;
}>;

export type LocalAccount = Readonly<{
  id: string;
  type: "debit" | "yield" | "revolving-credit" | "charge-card";
  label: string;
  currency: string;
  metadata: Readonly<Record<string, string>>;
  createdAt: string;
  statementBalance?: MoneyDto;
}>;

export type LocalTransaction = Readonly<{
  id: string;
  accountId: string;
  amount: MoneyDto;
  metadata: Readonly<Record<string, string>>;
  createdAt: string;
}>;

export type AccountInput = Omit<LocalAccount, "id" | "createdAt">;
export type TransactionInput = Omit<LocalTransaction, "id" | "createdAt">;

export type DesktopPortableEnvelope = PortableProductEnvelope &
  Readonly<{
    accounts: readonly LocalAccount[];
    transactions: readonly LocalTransaction[];
  }>;

export type NativeNotificationEvent = NotificationEvent &
  Readonly<{ eventId: string; name: string }>;

export type PendingChange = Readonly<{
  operationId: string;
  entityKind: string;
  entityId: string;
  operation: "create" | "update" | "delete";
  version: number;
  occurredAt: string;
  payload: unknown;
  attempts: number;
}>;

export const native = {
  initialize: () => invoke<CapabilityReport>("local_initialize"),
  loadConfiguration: () => invoke<RuntimeConfiguration | null>("load_runtime_configuration"),
  saveConfiguration: (configuration: RuntimeConfiguration) =>
    invoke<void>("save_runtime_configuration", { configuration }),
  listAccounts: () => invoke<readonly LocalAccount[]>("local_list_accounts"),
  createAccount: (input: AccountInput) => invoke<LocalAccount>("local_create_account", { input }),
  updateAccount: (id: string, input: AccountInput) =>
    invoke<LocalAccount>("local_update_account", { id, input }),
  deleteAccount: (id: string) => invoke<void>("local_delete_account", { id }),
  listTransactions: () => invoke<readonly LocalTransaction[]>("local_list_transactions"),
  createTransaction: (input: TransactionInput) =>
    invoke<LocalTransaction>("local_create_transaction", { input }),
  updateTransaction: (id: string, input: TransactionInput) =>
    invoke<LocalTransaction>("local_update_transaction", { id, input }),
  deleteTransaction: (id: string) => invoke<void>("local_delete_transaction", { id }),
  exportPortable: () => invoke<DesktopPortableEnvelope>("local_export_portable"),
  importPortable: (envelope: DesktopPortableEnvelope) =>
    invoke<void>("local_import_portable", { envelope }),
  createSyncBackup: () => invoke<string>("local_create_sync_backup"),
  pendingChanges: () => invoke<readonly PendingChange[]>("local_pending_changes"),
  pendingCount: () => invoke<number>("local_sync_pending_count"),
  acknowledgeChange: (operationId: string) =>
    invoke<void>("local_acknowledge_change", { operationId }),
  failChange: (operationId: string, message: string) =>
    invoke<void>("local_fail_change", { operationId, message }),
  setSyncMapping: (entityKind: string, localId: string, remoteId: string) =>
    invoke<void>("local_set_sync_mapping", { entityKind, localId, remoteId }),
  getRemoteId: (entityKind: string, localId: string) =>
    invoke<string | null>("local_get_remote_id", { entityKind, localId }),
  mergeRemote: (envelope: DesktopPortableEnvelope) =>
    invoke<void>("local_merge_remote", { envelope }),
  evaluateNotifications: (
    observations: Readonly<Record<string, Readonly<Record<string, string>>>>,
  ) => invoke<readonly NativeNotificationEvent[]>("local_evaluate_notifications", { observations }),
  wasDelivered: (eventId: string) =>
    invoke<boolean>("local_notification_was_delivered", { eventId }),
  markDelivered: (event: NativeNotificationEvent) =>
    invoke<void>("local_mark_notification_delivered", {
      eventId: event.eventId,
      ruleId: event.ruleId,
      occurredAt: event.occurredAt,
    }),
};

function divideExact(
  value: bigint,
  divisor: bigint,
): Readonly<{ coefficient: string; scale: number }> {
  const scale = 8;
  return { coefficient: ((value * 10n ** BigInt(scale)) / divisor).toString(), scale };
}

export class TauriProductProvider implements ProductDataProvider {
  list<T>(kind: ProductKind) {
    return invoke<readonly ProductRecord<T>[]>("local_list_products", { kind });
  }

  create<TInput, TValue = TInput>(kind: ProductKind, input: TInput) {
    return invoke<ProductRecord<TValue>>("local_create_product", { kind, input });
  }

  update<TInput, TValue = TInput>(kind: ProductKind, id: string, input: TInput) {
    return invoke<ProductRecord<TValue>>("local_update_product", { kind, id, input });
  }

  delete(kind: ProductKind, id: string) {
    return invoke<void>("local_delete_product", { kind, id });
  }

  addSharedMember(groupId: string, userId: string) {
    return invoke<void>("local_add_shared_member", { groupId, userId });
  }

  async calculateYield(id: string, balance: MoneyDto): Promise<MoneyDto> {
    const record = (await this.list<Record<string, unknown>>("yield-account")).find(
      (item) => item.id === id,
    );
    if (!record) throw new Error("La cuenta con rendimiento no existe.");
    const annual = String(record.value.belowCapAnnualPercent ?? "0");
    const dayBasis = BigInt(String(record.value.dayBasis ?? "365"));
    const [whole = "0", fraction = ""] = annual.split(".");
    const rate = BigInt(`${whole}${fraction}`);
    const rateScale = 10n ** BigInt(fraction.length);
    const result = divideExact(BigInt(balance.coefficient) * rate, rateScale * 100n * dayBasis);
    return {
      currency: balance.currency,
      coefficient: result.coefficient,
      scale: balance.scale + result.scale,
    };
  }

  async exportProducts(): Promise<PortableProductEnvelope> {
    const envelope = await native.exportPortable();
    return {
      format: envelope.format,
      version: envelope.version,
      exportedAt: envelope.exportedAt,
      records: envelope.records,
    };
  }

  async importProducts(envelope: PortableProductEnvelope): Promise<void> {
    const current = await native.exportPortable();
    await native.importPortable({ ...current, records: envelope.records });
  }

  evaluateAlerts(observations: Readonly<Record<string, Readonly<Record<string, string>>>>) {
    return native.evaluateNotifications(observations);
  }
}
