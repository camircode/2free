import { describe, expect, it, vi } from "vitest";

import type { ProductDataProvider, ProductKind, ProductRecord } from "@2free/data-provider/browser";

import { SyncCoordinator, SyncingDataProvider, type SyncNativePort } from "../src/sync";
import type { PendingChange } from "../src/native";

function record(id: string, kind: ProductKind, value: unknown): ProductRecord {
  return { id, kind, value, createdAt: "2026-07-24T00:00:00Z", updatedAt: "2026-07-24T00:00:00Z" };
}

describe("local-first synchronization", () => {
  it("retains an offline mutation and retries it idempotently", async () => {
    const queue: PendingChange[] = [];
    const acknowledged = new Set<string>();
    const localProducts = {
      async create(kind: ProductKind, value: unknown) {
        queue.push({
          operationId: "operation-1",
          entityKind: `product:${kind}`,
          entityId: "local-1",
          operation: "create",
          version: 1,
          occurredAt: "2026-07-24T00:00:00Z",
          payload: value,
          attempts: 0,
        });
        return record("local-1", kind, value);
      },
    } as ProductDataProvider;
    const native: SyncNativePort = {
      pendingChanges: async () => queue.filter((change) => !acknowledged.has(change.operationId)),
      pendingCount: async () =>
        queue.filter((change) => !acknowledged.has(change.operationId)).length,
      acknowledgeChange: async (id) => {
        acknowledged.add(id);
      },
      failChange: async () => undefined,
      setSyncMapping: async () => undefined,
      getRemoteId: async () => null,
      createSyncBackup: async () => "/encrypted/backup.db",
      mergeRemote: async () => undefined,
    };
    const remoteOperations = new Map<string, ProductRecord>();
    let disconnectAfterCommit = true;
    const remoteProducts = {
      async create(kind: ProductKind, value: unknown, operationId?: string) {
        const key = operationId!;
        const result = remoteOperations.get(key) ?? record("remote-1", kind, value);
        remoteOperations.set(key, result);
        if (disconnectAfterCommit) {
          disconnectAfterCommit = false;
          throw new Error("Sin conexión después de confirmar");
        }
        return result;
      },
      exportProducts: async () => ({
        format: "2free-portable",
        version: 2,
        exportedAt: "2026-07-24T00:00:00Z",
        records: [],
      }),
    } as ProductDataProvider;
    const api = {
      products: remoteProducts,
      request: vi.fn().mockResolvedValue({ version: 1, accounts: [], transactions: [] }),
    };
    const coordinator = new SyncCoordinator(native, api);
    const provider = new SyncingDataProvider(localProducts, remoteProducts, () => undefined);

    await expect(provider.create("budget", { category: "Casa" })).resolves.toMatchObject({
      id: "local-1",
    });
    expect(await native.pendingCount()).toBe(1);
    await coordinator.synchronize();
    expect(coordinator.status().state).toBe("offline");
    expect(await native.pendingCount()).toBe(1);

    await coordinator.synchronize();
    expect(coordinator.status()).toMatchObject({ state: "synced", pending: 0 });
    expect(remoteOperations).toHaveLength(1);
    await coordinator.synchronize();
    expect(remoteOperations).toHaveLength(1);
  });

  const accountPayload = {
    id: "local-account",
    type: "debit",
    label: "Daily account",
    currency: "MXN",
    metadata: {},
    createdAt: "2026-07-24T00:00:00Z",
  };
  const transactionPayload = {
    id: "local-transaction",
    accountId: "local-account",
    amount: { currency: "MXN", coefficient: "1250", scale: 2 },
    metadata: {},
    createdAt: "2026-07-24T00:00:00Z",
  };

  it.each([
    ["account", "create", accountPayload, "accounts", "POST"],
    ["account", "update", accountPayload, "accounts/remote-account", "PATCH"],
    ["account", "delete", null, "accounts/remote-account", "DELETE"],
    ["transaction", "create", transactionPayload, "transactions", "POST"],
    ["transaction", "update", transactionPayload, "transactions/remote-transaction", "PATCH"],
    ["transaction", "delete", null, "transactions/remote-transaction", "DELETE"],
  ] as const)(
    "pushes %s %s through the matching finance endpoint",
    async (entityKind, operation, payload, expectedPath, expectedMethod) => {
      const entityId = entityKind === "account" ? "local-account" : "local-transaction";
      const change: PendingChange = {
        operationId: `operation-${entityKind}-${operation}`,
        entityKind,
        entityId,
        operation,
        version: 1,
        occurredAt: "2026-07-24T00:00:00Z",
        payload,
        attempts: 0,
      };
      let acknowledged = false;
      const mappings = new Map([
        ["account:local-account", "remote-account"],
        ["transaction:local-transaction", "remote-transaction"],
      ]);
      if (operation === "create") mappings.delete(`${entityKind}:${entityId}`);
      const setSyncMapping = vi.fn(async (kind: string, localId: string, remoteId: string) => {
        mappings.set(`${kind}:${localId}`, remoteId);
      });
      const native: SyncNativePort = {
        pendingChanges: async () => (acknowledged ? [] : [change]),
        pendingCount: async () => (acknowledged ? 0 : 1),
        acknowledgeChange: async () => {
          acknowledged = true;
        },
        failChange: async () => undefined,
        setSyncMapping,
        getRemoteId: async (kind, localId) => mappings.get(`${kind}:${localId}`) ?? null,
        createSyncBackup: async () => "/encrypted/backup.db",
        mergeRemote: async () => undefined,
      };
      const request = vi.fn(async (path: string, init?: RequestInit) => {
        if (path === "export") return { version: 1, accounts: [], transactions: [] };
        if (path === "accounts" && init?.method === "POST") {
          return { account: { ...accountPayload, id: "created-account" } };
        }
        if (path === "transactions" && init?.method === "POST") {
          return { transaction: { ...transactionPayload, id: "created-transaction" } };
        }
        return undefined;
      });
      const products = {
        exportProducts: async () => ({
          format: "2free-portable",
          version: 2,
          exportedAt: "2026-07-24T00:00:00Z",
          records: [],
        }),
      } as ProductDataProvider;

      await new SyncCoordinator(native, { products, request }).synchronize();

      const [path, init] = request.mock.calls[0]!;
      expect(path).toBe(expectedPath);
      expect(init?.method).toBe(expectedMethod);
      if (operation === "delete") {
        expect(init?.body).toBeUndefined();
      } else {
        expect(JSON.parse(String(init?.body))).toEqual(
          entityKind === "transaction"
            ? {
                accountId: "remote-account",
                amount: transactionPayload.amount,
                metadata: {},
              }
            : {
                type: "debit",
                label: "Daily account",
                currency: "MXN",
                metadata: {},
              },
        );
      }
      if (operation === "create") {
        expect(init?.headers).toMatchObject({ "idempotency-key": change.operationId });
        expect(setSyncMapping).toHaveBeenCalledWith(
          entityKind,
          entityId,
          entityKind === "account" ? "created-account" : "created-transaction",
        );
      } else {
        expect(setSyncMapping).not.toHaveBeenCalled();
      }
    },
  );

  it("retains an update and reports a useful error when its remote mapping is absent", async () => {
    const change: PendingChange = {
      operationId: "operation-unmapped-account",
      entityKind: "account",
      entityId: "local-account",
      operation: "update",
      version: 1,
      occurredAt: "2026-07-24T00:00:00Z",
      payload: accountPayload,
      attempts: 0,
    };
    const failChange = vi.fn(async () => undefined);
    const request = vi.fn(async () => ({ version: 1, accounts: [], transactions: [] }));
    const native: SyncNativePort = {
      pendingChanges: async () => [change],
      pendingCount: async () => 1,
      acknowledgeChange: async () => undefined,
      failChange,
      setSyncMapping: async () => undefined,
      getRemoteId: async () => null,
      createSyncBackup: async () => "/encrypted/backup.db",
      mergeRemote: async () => undefined,
    };
    const products = {
      exportProducts: async () => ({
        format: "2free-portable",
        version: 2,
        exportedAt: "2026-07-24T00:00:00Z",
        records: [],
      }),
    } as ProductDataProvider;
    const coordinator = new SyncCoordinator(native, { products, request });

    await coordinator.synchronize();

    expect(failChange).toHaveBeenCalledWith(
      change.operationId,
      "La cuenta todavía no tiene correspondencia remota.",
    );
    expect(coordinator.status()).toMatchObject({
      state: "error",
      pending: 1,
      message: "La cuenta todavía no tiene correspondencia remota.",
    });
  });
});
