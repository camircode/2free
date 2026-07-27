import type { DashboardMoney, DashboardState } from "@2free/ui";
import type {
  AccountOption,
  AccountsOverviewData,
  TransactionsOverviewData,
} from "@2free/ui/portfolio";

import type { LocalAccount, LocalTransaction } from "./native";

export type RuntimeSnapshot = Readonly<{
  accountOptions: readonly AccountOption[];
  accounts: AccountsOverviewData;
  dashboard: DashboardState;
  transactions: TransactionsOverviewData;
}>;

export const initialSnapshot: RuntimeSnapshot = {
  accountOptions: [],
  accounts: {
    total: "$0 MXN",
    available: "$0",
    invested: "$0",
    credit: "$0",
    accounts: [],
  },
  transactions: { income: "$0", expenses: "$0", balance: "$0", transactions: [] },
  dashboard: { status: "empty" },
};

function align(coefficient: bigint, fromScale: number, toScale: number): bigint {
  return coefficient * 10n ** BigInt(toScale - fromScale);
}

function formatMoney(coefficient: string, scale: number, currency = "MXN", sign = false): string {
  const value = BigInt(coefficient);
  const negative = value < 0n;
  const digits = (negative ? -value : value).toString().padStart(scale + 1, "0");
  const point = digits.length - scale;
  const decimal = scale === 0 ? digits : `${digits.slice(0, point)}.${digits.slice(point)}`;
  return `${sign && !negative ? "+" : negative ? "−" : ""}$${decimal} ${currency}`;
}

function dashboardMoney(coefficient: string, scale: number, currency: string): DashboardMoney {
  return {
    exact: { coefficient, scale, currency },
    formatted: {
      currency,
      text: formatMoney(coefficient, scale, currency, true).replace(` ${currency}`, ""),
    },
  };
}

function sumTransactions(
  transactions: readonly LocalTransaction[],
  predicate: (transaction: LocalTransaction) => boolean,
): Readonly<{ coefficient: bigint; scale: number }> {
  const selected = transactions.filter(predicate);
  const scale = Math.max(0, ...selected.map((item) => item.amount.scale));
  return {
    coefficient: selected.reduce(
      (sum, item) => sum + align(BigInt(item.amount.coefficient), item.amount.scale, scale),
      0n,
    ),
    scale,
  };
}

export function snapshotFromRecords(
  accounts: readonly LocalAccount[],
  transactions: readonly LocalTransaction[],
): RuntimeSnapshot {
  const accountMap = new Map(accounts.map((account) => [account.id, account]));
  const mxnTransactions = transactions.filter((item) => item.amount.currency === "MXN");
  const scale = Math.max(0, ...mxnTransactions.map((item) => item.amount.scale));
  const income = mxnTransactions.reduce((sum, item) => {
    const value = BigInt(item.amount.coefficient);
    return value > 0n ? sum + align(value, item.amount.scale, scale) : sum;
  }, 0n);
  const expenses = mxnTransactions.reduce((sum, item) => {
    const value = BigInt(item.amount.coefficient);
    return value < 0n ? sum - align(value, item.amount.scale, scale) : sum;
  }, 0n);
  const balance = income - expenses;
  const accountItems = accounts.map((account) => {
    const transactionTotal = sumTransactions(
      transactions,
      (transaction) => transaction.accountId === account.id,
    );
    const typeLabel =
      account.type === "debit"
        ? "Débito"
        : account.type === "yield"
          ? "Cuenta con rendimiento"
          : account.type === "revolving-credit"
            ? "Crédito revolvente"
            : "Tarjeta de servicio";
    const kind =
      account.type === "yield"
        ? ("invested" as const)
        : account.type === "revolving-credit" || account.type === "charge-card"
          ? ("credit" as const)
          : ("available" as const);
    const statementBalance = account.statementBalance
      ? formatMoney(
          account.statementBalance.coefficient,
          account.statementBalance.scale,
          account.currency,
        )
      : undefined;
    return {
      id: account.id,
      label: account.label,
      detail: typeLabel,
      kind,
      balance:
        statementBalance ??
        formatMoney(
          transactionTotal.coefficient.toString(),
          transactionTotal.scale,
          account.currency,
        ),
      accent: account.currency,
      currency: account.currency,
      statementBalance: account.statementBalance
        ? formatMoney(
            account.statementBalance.coefficient,
            account.statementBalance.scale,
            account.currency,
          )
            .replace(/^[-+−]?\$/u, "")
            .replace(` ${account.currency}`, "")
        : undefined,
      transactionCount: transactions.filter((transaction) => transaction.accountId === account.id)
        .length,
      type: account.type,
    };
  });
  const transactionItems = transactions.map((item) => {
    const account = accountMap.get(item.accountId);
    const type = BigInt(item.amount.coefficient) < 0n ? ("expense" as const) : ("income" as const);
    const amountValue = formatMoney(
      (BigInt(item.amount.coefficient) < 0n
        ? -BigInt(item.amount.coefficient)
        : BigInt(item.amount.coefficient)
      ).toString(),
      item.amount.scale,
      item.amount.currency,
    )
      .replace(/^\$/u, "")
      .replace(` ${item.amount.currency}`, "");
    const dateIso = item.metadata.date || item.createdAt.slice(0, 10);
    return {
      id: item.id,
      label: item.metadata.description || "Transacción",
      account: account?.label || item.accountId,
      category: item.metadata.category || "Sin categoría",
      date: new Date(`${dateIso}T12:00:00`).toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "short",
      }),
      amount: formatMoney(item.amount.coefficient, item.amount.scale, item.amount.currency, true),
      amountValue,
      accountId: item.accountId,
      dateIso,
      draft: {
        accountId: item.accountId,
        type,
        amount: amountValue,
        date: dateIso,
        category: item.metadata.category || "",
        description: item.metadata.description || "",
      },
      type,
    };
  });
  const accountOptions = accounts.map(({ id, label, currency }) => ({ id, label, currency }));
  const currencyTotals = [...new Set(transactions.map((item) => item.amount.currency))].map(
    (currency) => {
      const total = sumTransactions(
        transactions,
        (transaction) => transaction.amount.currency === currency,
      );
      return {
        label: `Neto registrado ${currency}`,
        value: dashboardMoney(total.coefficient.toString(), total.scale, currency),
      };
    },
  );
  const dashboard: DashboardState =
    accounts.length === 0 && transactions.length === 0
      ? { status: "empty" }
      : {
          status: "ready",
          model: {
            balance: { status: "unavailable", reason: "not-calculated" },
            trendOrAllocation: {
              kind: "allocation",
              label: "Actividad neta por moneda",
              summary:
                "Suma de los ingresos y gastos registrados; no representa el saldo disponible de sus cuentas.",
              values: currencyTotals,
            },
            activity: transactions.map((transaction) => {
              const account = accountMap.get(transaction.accountId);
              const type = BigInt(transaction.amount.coefficient) < 0n ? "expense" : "income";
              return {
                id: transaction.id,
                label:
                  transaction.metadata.description ||
                  transaction.metadata.category ||
                  "Movimiento sin descripción",
                detail: [transaction.metadata.category, account?.label].filter(Boolean).join(" · "),
                type,
                date: transaction.createdAt,
                displayDate: new Date(transaction.createdAt).toLocaleDateString("es-MX", {
                  day: "2-digit",
                  month: "short",
                }),
                value: dashboardMoney(
                  transaction.amount.coefficient,
                  transaction.amount.scale,
                  transaction.amount.currency,
                ),
              };
            }),
          },
        };
  return {
    accountOptions,
    accounts: {
      total: formatMoney(balance.toString(), scale),
      available: formatMoney(balance.toString(), scale),
      invested: "$0",
      credit: "$0",
      accounts: accountItems,
    },
    transactions: {
      income: formatMoney(income.toString(), scale),
      expenses: formatMoney(expenses.toString(), scale),
      balance: formatMoney(balance.toString(), scale, "MXN", true),
      transactions: transactionItems,
    },
    dashboard,
  };
}
