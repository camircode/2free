import { describe, expect, it } from "vitest";

import { snapshotFromRecords } from "../src/data";

describe("desktop finance presentation", () => {
  it("maps encrypted records to the same complete dashboard and management contracts as web", () => {
    const snapshot = snapshotFromRecords(
      [
        {
          id: "account-1",
          type: "debit",
          label: "Cuenta diaria",
          currency: "MXN",
          metadata: {},
          createdAt: "2026-07-01T12:00:00Z",
        },
      ],
      [
        {
          id: "transaction-1",
          accountId: "account-1",
          amount: { currency: "MXN", coefficient: "-12550", scale: 2 },
          metadata: {
            category: "Alimentos",
            date: "2026-07-26",
            description: "Mercado",
            type: "expense",
          },
          createdAt: "2026-07-26T12:00:00Z",
        },
      ],
    );

    expect(snapshot.dashboard).toMatchObject({
      status: "ready",
      model: {
        balance: { status: "unavailable", reason: "not-calculated" },
        activity: [{ id: "transaction-1", type: "expense" }],
      },
    });
    expect(snapshot.accounts.accounts[0]).toMatchObject({
      currency: "MXN",
      transactionCount: 1,
      type: "debit",
    });
    expect(snapshot.transactions.transactions[0]).toMatchObject({
      accountId: "account-1",
      amountValue: "125.50",
      dateIso: "2026-07-26",
      draft: { description: "Mercado", type: "expense" },
    });
  });

  it("uses the explicit empty dashboard state for a new local workspace", () => {
    expect(snapshotFromRecords([], []).dashboard).toEqual({ status: "empty" });
  });
});
