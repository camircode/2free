declare module "@2free/core/identifiers.js" {
  export interface IdGenerator {
    next(): string;
  }
  export interface Clock {
    now(): Date;
  }
}

declare module "@2free/core/money.js" {
  export type Money = Readonly<{ currency: string; coefficient: bigint; scale: number }>;
  export type MoneyDto = { currency: string; coefficient: string; scale: number };
  export function moneyFromDto(dto: MoneyDto): Money;
  export function moneyToDto(money: Money): MoneyDto;
  export function moneyFromDecimal(currency: string, value: string, scale: number): Money;
}

declare module "@2free/core/privacy.js" {
  export type Metadata = Readonly<Record<string, string>>;
  export function sanitizeMetadata(value: unknown): Metadata;
  export function assertPrivacySafeText(value: string, field: string): void;
}

declare module "@2free/core/validation.js" {
  export class ValidationError extends Error {}
  export function requireNonEmptyString(value: unknown, field: string): string;
}

declare module "@2free/core/account.js" {
  import type { Clock, IdGenerator } from "@2free/core/identifiers.js";
  import type { Metadata } from "@2free/core/privacy.js";
  import type { Money } from "@2free/core/money.js";

  export type AccountType = "debit" | "yield" | "revolving-credit" | "charge-card";
  type AccountBase = Readonly<{
    id: string;
    label: string;
    currency: string;
    metadata: Metadata;
    createdAt: string;
  }>;
  export type Account =
    | (AccountBase & Readonly<{ type: "debit" | "yield" }>)
    | (AccountBase &
        Readonly<{ type: "revolving-credit" | "charge-card"; statementBalance: Money }>);
  export function createAccount(
    input: Readonly<{
      type: AccountType;
      label: string;
      currency: string;
      metadata?: Record<string, string>;
      statementBalance?: Money;
    }>,
    dependencies: Readonly<{ ids: IdGenerator; clock: Clock }>,
  ): Account;
  export function updateAccount(
    account: Account,
    input: Readonly<{
      type: AccountType;
      label: string;
      currency: string;
      metadata?: Record<string, string>;
      statementBalance?: Money;
    }>,
  ): Account;
}

declare module "@2free/core/transaction.js" {
  import type { Clock, IdGenerator } from "@2free/core/identifiers.js";
  import type { Money } from "@2free/core/money.js";
  import type { Metadata } from "@2free/core/privacy.js";

  export type Transaction = Readonly<{
    id: string;
    accountId: string;
    amount: Money;
    metadata: Metadata;
    createdAt: string;
  }>;
  export function createTransaction(
    input: Readonly<{ accountId: string; amount: Money; metadata?: Record<string, string> }>,
    dependencies: Readonly<{ ids: IdGenerator; clock: Clock }>,
  ): Transaction;
  export function updateTransaction(
    transaction: Transaction,
    input: Readonly<{ accountId: string; amount: Money; metadata?: Record<string, string> }>,
  ): Transaction;
}
