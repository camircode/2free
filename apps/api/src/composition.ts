import {
  createRuntimeApplication,
  type RuntimeApplication,
  type RuntimeConfig,
  type RuntimeProfile,
} from "@2free/application";
import { createCoreAuth } from "@2free/auth";
import {
  createPrismaProductProvider,
  DataEncryption,
  encryptLegacyFinanceData,
  createPrismaFinanceProviderFactory,
  getPrismaClient,
  type PrismaClient,
} from "@2free/database";
import type { ProductDataProvider } from "@2free/data-provider";

const destructiveDevelopmentProfiles: readonly RuntimeProfile[] = ["local-offline", "ci"];

export function isDestructiveDevelopmentRoutesEnabled(config: RuntimeConfig): boolean {
  return (
    config.destructiveDevelopmentRoutes && destructiveDevelopmentProfiles.includes(config.profile)
  );
}

export function createApplication(
  config: RuntimeConfig,
  prisma: PrismaClient = getPrismaClient(config.databaseUrl),
): RuntimeApplication {
  return createRuntimeApplication(
    createPrismaFinanceProviderFactory(
      prisma,
      undefined,
      DataEncryption.fromBase64(config.dataEncryptionKey, config.profile === "ci"),
    ),
  );
}

export type ApiComposition = Readonly<{
  config: RuntimeConfig;
  prisma: PrismaClient;
  application: RuntimeApplication;
  auth: ReturnType<typeof createCoreAuth>;
  products: ProductDataProvider;
  prepare(): Promise<void>;
}>;

export function createApiComposition(config: RuntimeConfig): ApiComposition {
  const prisma = getPrismaClient(config.databaseUrl);
  const encryption = DataEncryption.fromBase64(config.dataEncryptionKey, config.profile === "ci");
  return Object.freeze({
    config,
    prisma,
    application: createApplication(config, prisma),
    auth: createCoreAuth(
      prisma,
      config.auth.secret,
      config.auth.baseURL,
      config.auth.trustedOrigins,
    ),
    products: createPrismaProductProvider(prisma, encryption),
    prepare:
      config.profile === "ci"
        ? async () => undefined
        : async () => encryptLegacyFinanceData(prisma, encryption),
  });
}
