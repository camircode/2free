import { invoke } from "@tauri-apps/api/core";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiRuntimeAdapter, LocalAdapter, SyncingRuntimeAdapter } from "../src/adapters";
import type { AccountInput, TransactionInput } from "../src/native";

vi.mock("@tauri-apps/api/core", () => ({ invoke: vi.fn() }));

const account: AccountInput = {
  type: "debit",
  label: "Daily account",
  currency: "MXN",
  metadata: {},
};
const transaction: TransactionInput = {
  accountId: "account-1",
  amount: { currency: "MXN", coefficient: "1250", scale: 2 },
  metadata: {},
};

describe("runtime finance mutations", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(invoke).mockReset();
  });

  it("routes local updates and deletes through the native commands", async () => {
    vi.mocked(invoke)
      .mockResolvedValueOnce({ ...account, id: "account-1", createdAt: "created" })
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({ ...transaction, id: "transaction-1", createdAt: "created" })
      .mockResolvedValueOnce(undefined);
    const adapter = new LocalAdapter({ mode: "local" });

    await adapter.updateAccount("account-1", account);
    await adapter.deleteAccount("account-1");
    await adapter.updateTransaction("transaction-1", transaction);
    await adapter.deleteTransaction("transaction-1");

    expect(vi.mocked(invoke).mock.calls).toEqual([
      ["local_update_account", { id: "account-1", input: account }],
      ["local_delete_account", { id: "account-1" }],
      ["local_update_transaction", { id: "transaction-1", input: transaction }],
      ["local_delete_transaction", { id: "transaction-1" }],
    ]);
  });

  it("uses PATCH and DELETE for API finance mutations", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const url = String(input);
      const body = url.includes("transactions")
        ? { transaction: { ...transaction, id: "transaction/1", createdAt: "created" } }
        : { account: { ...account, id: "account/1", createdAt: "created" } };
      return new Response(init?.method === "DELETE" ? null : JSON.stringify(body), {
        status: init?.method === "DELETE" ? 204 : 200,
        headers: { "content-type": "application/json" },
      });
    });
    vi.stubGlobal("fetch", fetchMock);
    const adapter = new ApiRuntimeAdapter({ mode: "cloud", apiUrl: "https://api.example.test" });

    await adapter.updateAccount("account/1", account);
    await adapter.deleteAccount("account/1");
    await adapter.updateTransaction("transaction/1", transaction);
    await adapter.deleteTransaction("transaction/1");

    expect(fetchMock.mock.calls.map(([url, init]) => [String(url), init?.method])).toEqual([
      ["https://api.example.test/accounts/account%2F1", "PATCH"],
      ["https://api.example.test/accounts/account%2F1", "DELETE"],
      ["https://api.example.test/transactions/transaction%2F1", "PATCH"],
      ["https://api.example.test/transactions/transaction%2F1", "DELETE"],
    ]);
  });

  it("requests synchronization after each local finance mutation", async () => {
    vi.mocked(invoke)
      .mockResolvedValueOnce({ ...account, id: "account-1", createdAt: "created" })
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({ ...transaction, id: "transaction-1", createdAt: "created" })
      .mockResolvedValueOnce(undefined);
    const syncNow = vi
      .spyOn(SyncingRuntimeAdapter.prototype, "syncNow")
      .mockResolvedValue(undefined);
    const adapter = new SyncingRuntimeAdapter({
      mode: "cloud",
      apiUrl: "https://api.example.test",
      syncEnabled: true,
    });

    await adapter.updateAccount("account-1", account);
    await adapter.deleteAccount("account-1");
    await adapter.updateTransaction("transaction-1", transaction);
    await adapter.deleteTransaction("transaction-1");

    expect(syncNow).toHaveBeenCalledTimes(4);
  });
});
