import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    {
      name: "workspace-source-alias",
      resolveId(source, importer) {
        if (!source.startsWith("@/") || !importer) return null;
        const packageSource = importer.includes("/packages/core/")
          ? "../../packages/core/src"
          : importer.includes("/packages/data-provider/")
            ? "../../packages/data-provider/src"
            : "./src";
        return resolve(
          fileURLToPath(new URL(packageSource, import.meta.url)),
          source.slice(2).replace(/\.js$/, ".ts"),
        );
      },
    },
  ],
  resolve: {
    alias: {
      "@2free/application": fileURLToPath(
        new URL("../../packages/application/src", import.meta.url),
      ),
      "@2free/database": fileURLToPath(new URL("../../packages/database/src", import.meta.url)),
      "@2free/auth": fileURLToPath(new URL("../../packages/auth/src", import.meta.url)),
      "@2free/core": fileURLToPath(new URL("../../packages/core/src", import.meta.url)),
      "@2free/data-provider": fileURLToPath(
        new URL("../../packages/data-provider/src", import.meta.url),
      ),
    },
  },
});
