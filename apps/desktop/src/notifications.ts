import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";

import type {
  NotificationEvent,
  ProductDataProvider,
  ProductRecord,
} from "@2free/data-provider/browser";

import { native, type NativeNotificationEvent } from "./native";

export type NativePermission = "default" | "denied" | "granted" | "unsupported";

function moneyDecimal(value: unknown): string | undefined {
  if (!value || typeof value !== "object") return undefined;
  const money = value as { coefficient?: unknown; scale?: unknown };
  if (typeof money.coefficient !== "string" || !Number.isInteger(money.scale)) return undefined;
  const scale = Number(money.scale);
  const negative = money.coefficient.startsWith("-");
  const digits = (negative ? money.coefficient.slice(1) : money.coefficient).padStart(
    scale + 1,
    "0",
  );
  const point = digits.length - scale;
  return `${negative ? "-" : ""}${scale ? `${digits.slice(0, point)}.${digits.slice(point)}` : digits}`;
}

function ratioPercent(actual: unknown, limit: unknown): string | undefined {
  const left = moneyDecimal(actual);
  const right = moneyDecimal(limit);
  if (!left || !right) return undefined;
  const leftScale = left.split(".")[1]?.length ?? 0;
  const rightScale = right.split(".")[1]?.length ?? 0;
  const numerator = BigInt(left.replace(".", "")) * 10n ** BigInt(rightScale) * 10_000n;
  const denominator = BigInt(right.replace(".", "")) * 10n ** BigInt(leftScale);
  if (denominator === 0n) return undefined;
  const basisPoints = numerator / denominator;
  return `${basisPoints / 100n}.${(basisPoints % 100n).toString().padStart(2, "0")}`;
}

function daysUntil(day: number): string {
  const today = new Date();
  const target = new Date(today.getFullYear(), today.getMonth(), day);
  if (target < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
    target.setMonth(target.getMonth() + 1);
  }
  return Math.ceil((target.getTime() - today.getTime()) / 86_400_000).toString();
}

async function observations(provider: ProductDataProvider) {
  const kinds = ["budget", "credit-card", "charge-card", "yield-account"] as const;
  const [budgets, credit, charge, yields] = await Promise.all(
    kinds.map((kind) => provider.list<Record<string, unknown>>(kind)),
  );
  const result: Record<string, Record<string, string>> = {};
  const firstBudget = budgets[0]?.value;
  const usage = firstBudget ? ratioPercent(firstBudget.actual, firstBudget.limit) : undefined;
  if (usage) result.budget = { usagePercent: usage };
  const card = (credit[0] || charge[0])?.value;
  if (card) {
    const due = Number(card.dueDay);
    const cutoff = Number(card.cutoffDay);
    result["credit-card"] = {
      ...(Number.isInteger(due) ? { daysUntilDue: daysUntil(due) } : {}),
      ...(Number.isInteger(cutoff) ? { daysUntilCutoff: daysUntil(cutoff) } : {}),
      ...(moneyDecimal(card.creditUsed) ? { creditUsed: moneyDecimal(card.creditUsed)! } : {}),
    };
  }
  const yieldAccount = yields[0]?.value;
  if (yieldAccount) {
    result["yield-account"] = {
      annualPercent: String(yieldAccount.belowCapAnnualPercent ?? "0"),
    };
  }
  for (const records of [budgets, credit, charge, yields] as readonly (readonly ProductRecord<
    Record<string, unknown>
  >[])[]) {
    for (const record of records) {
      const source = result[record.kind] ?? {};
      for (const [field, value] of Object.entries(record.value)) {
        const exact =
          typeof value === "string" && /^-?\d+(?:\.\d+)?$/u.test(value)
            ? value
            : moneyDecimal(value);
        if (exact) source[field] = exact;
      }
      result[record.kind] = source;
    }
  }
  return result;
}

function eventId(event: NotificationEvent): string {
  const text = `${event.ruleId}:${event.source}:${event.field}:${event.observed}:${event.threshold}`;
  let hash = 2_166_136_261;
  for (const character of text) hash = Math.imul(hash ^ character.charCodeAt(0), 16_777_619);
  return `api-${(hash >>> 0).toString(16)}`;
}

function notificationBody(event: NotificationEvent): string {
  if (event.source === "budget" && event.field === "usagePercent") {
    return `El presupuesto alcanzó ${event.observed}% de uso.`;
  }
  if (event.field === "daysUntilDue") {
    return `Faltan ${event.observed} días para el próximo pago.`;
  }
  if (event.field === "daysUntilCutoff") {
    return `Faltan ${event.observed} días para la fecha de corte.`;
  }
  if (event.field === "creditUsed") {
    return `El crédito utilizado alcanzó ${event.observed}.`;
  }
  if (event.source === "yield-account" && event.field === "annualPercent") {
    return `El rendimiento anual registrado es ${event.observed}%.`;
  }
  return `Una condición financiera que eligió necesita su atención.`;
}

export async function notificationPermission(): Promise<NativePermission> {
  try {
    return (await isPermissionGranted()) ? "granted" : "default";
  } catch {
    return "unsupported";
  }
}

export async function askNotificationPermission(): Promise<NativePermission> {
  try {
    return (await requestPermission()) === "granted" ? "granted" : "denied";
  } catch {
    return "unsupported";
  }
}

export async function evaluateAndNotify(provider: ProductDataProvider): Promise<number> {
  const values = await observations(provider);
  const evaluated = await provider.evaluateAlerts(values);
  const events: readonly NativeNotificationEvent[] = evaluated.map((event) => ({
    ...event,
    eventId: "eventId" in event ? String(event.eventId) : eventId(event),
    name: "name" in event ? String(event.name) : "Alerta financiera",
  }));
  if (!(await isPermissionGranted())) return events.length;
  for (const event of events) {
    if (await native.wasDelivered(event.eventId)) continue;
    sendNotification({
      title: `2 Free · ${event.name}`,
      body: notificationBody(event),
    });
    await native.markDelivered(event);
  }
  return events.length;
}
