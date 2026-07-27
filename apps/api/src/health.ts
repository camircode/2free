import type { RuntimeConfig } from "@2free/application";

export type HealthState = Readonly<{
  status: "ready" | "not-ready";
  process: { ready: true };
  database: { ready: boolean; configured: true; target: "postgresql"; reason?: "unavailable" };
}>;

export function healthResponse(_config: RuntimeConfig, databaseReady: boolean): HealthState {
  return {
    status: databaseReady ? "ready" : "not-ready",
    process: { ready: true },
    database: {
      ready: databaseReady,
      configured: true,
      target: "postgresql",
      ...(databaseReady ? {} : { reason: "unavailable" as const }),
    },
  };
}
