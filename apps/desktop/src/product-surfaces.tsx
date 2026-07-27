import { useEffect, useState } from "react";

import {
  ApiError,
  type ProductDataProvider,
  type ProductKind,
  type ProductRecord,
} from "@2free/data-provider/browser";
import {
  AlertsWorkspace,
  BudgetSavingsWorkspace,
  CardsWorkspace,
  SharedFinancesWorkspace,
  type AlertRuleForm,
  type BudgetForm,
  type CardValue,
  type ChargeCardForm,
  type CollectionState,
  type CreditCardForm,
  type DebitProfileForm,
  type ExpenseValue,
  type GoalValue,
  type GroupValue,
  type ProductRecordView,
  type SharedExpenseForm,
  type SharedGroupForm,
  type YieldAccountForm,
} from "@2free/ui/portfolio";

type ProductSurface = "alerts" | "budgets" | "cards" | "shared";

function recordView<T>(record: ProductRecord<T>): ProductRecordView<T> {
  return {
    id: record.id,
    value: record.value,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function useProducts<T>(provider: ProductDataProvider, kind: ProductKind, enabled: boolean) {
  const [state, setState] = useState<CollectionState<T>>({ status: "loading" });

  async function load() {
    setState({ status: "loading" });
    try {
      const records = await provider.list<T>(kind);
      setState({ status: "ready", records: records.map(recordView) });
    } catch (error) {
      setState({
        status: "error",
        message:
          error instanceof Error ? error.message : "No se pudo consultar la fuente de datos.",
        unauthorized: error instanceof ApiError && error.status === 401,
      });
    }
  }

  useEffect(() => {
    if (!enabled) return;
    void load();
  }, [provider, kind, enabled]);

  async function create<TInput>(value: TInput) {
    await provider.create(kind, value);
    await load();
  }

  async function update<TInput>(id: string, value: TInput) {
    await provider.update(kind, id, value);
    await load();
  }

  async function remove(id: string) {
    await provider.delete(kind, id);
    await load();
  }

  return { state, create, update, remove, refresh: load };
}

export function ProductSurfaceView({
  provider,
  surface,
  notificationPermission,
  onEvaluate,
  onRequestPermission,
}: Readonly<{
  provider: ProductDataProvider;
  surface: ProductSurface;
  notificationPermission: "default" | "denied" | "granted" | "unsupported";
  onEvaluate: () => Promise<string>;
  onRequestPermission: () => Promise<void>;
}>) {
  const activeKinds = new Set<ProductKind>(
    surface === "budgets"
      ? ["budget", "savings-goal"]
      : surface === "shared"
        ? ["shared-group", "shared-expense"]
        : surface === "cards"
          ? ["credit-card", "charge-card", "debit-profile", "yield-account"]
          : ["notification-rule"],
  );
  const budgets = useProducts<BudgetForm & { status?: "on-track" | "risk" | "exceeded" }>(
    provider,
    "budget",
    activeKinds.has("budget"),
  );
  const goals = useProducts<GoalValue>(provider, "savings-goal", activeKinds.has("savings-goal"));
  const groups = useProducts<GroupValue>(provider, "shared-group", activeKinds.has("shared-group"));
  const expenses = useProducts<ExpenseValue>(
    provider,
    "shared-expense",
    activeKinds.has("shared-expense"),
  );
  const credit = useProducts<CardValue>(provider, "credit-card", activeKinds.has("credit-card"));
  const charge = useProducts<CardValue>(provider, "charge-card", activeKinds.has("charge-card"));
  const debit = useProducts<CardValue>(provider, "debit-profile", activeKinds.has("debit-profile"));
  const yieldAccounts = useProducts<CardValue>(
    provider,
    "yield-account",
    activeKinds.has("yield-account"),
  );
  const rules = useProducts<AlertRuleForm>(
    provider,
    "notification-rule",
    activeKinds.has("notification-rule"),
  );

  if (surface === "budgets") {
    return (
      <BudgetSavingsWorkspace
        budgets={budgets.state}
        goals={goals.state}
        onCreateBudget={budgets.create}
        onCreateGoal={goals.create}
        onUpdateBudget={budgets.update}
        onUpdateGoal={goals.update}
        onDeleteBudget={budgets.remove}
        onDeleteGoal={goals.remove}
      />
    );
  }
  if (surface === "shared") {
    return (
      <SharedFinancesWorkspace
        expenses={expenses.state}
        groups={groups.state}
        onAddMember={async (groupId, userId) => {
          await provider.addSharedMember(groupId, userId);
          await groups.refresh();
        }}
        onCreateExpense={expenses.create as (value: SharedExpenseForm) => Promise<void>}
        onCreateGroup={groups.create as (value: SharedGroupForm) => Promise<void>}
        onUpdateExpense={expenses.update as never}
        onUpdateGroup={groups.update as never}
        onDeleteExpense={expenses.remove}
        onDeleteGroup={groups.remove}
      />
    );
  }
  if (surface === "cards") {
    return (
      <CardsWorkspace
        chargeCards={charge.state}
        creditCards={credit.state}
        debitProfiles={debit.state}
        onCreateCharge={charge.create as (value: ChargeCardForm) => Promise<void>}
        onCreateCredit={credit.create as (value: CreditCardForm) => Promise<void>}
        onCreateDebit={debit.create as (value: DebitProfileForm) => Promise<void>}
        onCreateYield={yieldAccounts.create as (value: YieldAccountForm) => Promise<void>}
        onUpdate={(kind, id, value) =>
          ({
            "charge-card": charge,
            "credit-card": credit,
            "debit-profile": debit,
            "yield-account": yieldAccounts,
          })[kind].update(id, value)
        }
        onDelete={(kind, id) =>
          ({
            "charge-card": charge,
            "credit-card": credit,
            "debit-profile": debit,
            "yield-account": yieldAccounts,
          })[kind].remove(id)
        }
        yieldAccounts={yieldAccounts.state}
      />
    );
  }
  return (
    <AlertsWorkspace
      notificationPermission={notificationPermission}
      onCreateRule={rules.create}
      onUpdateRule={rules.update}
      onDeleteRule={rules.remove}
      onEvaluate={onEvaluate}
      onRequestPermission={onRequestPermission}
      rules={rules.state}
    />
  );
}
