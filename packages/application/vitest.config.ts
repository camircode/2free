import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    {
      name: "package-local-source-alias",
      resolveId(source, importer) {
        if (!source.startsWith("@/") || !importer) return null;
        const packageSource = importer.includes("/packages/core/")
          ? "../core/src"
          : importer.includes("/packages/data-provider/")
            ? "../data-provider/src"
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
      "@2free/core": fileURLToPath(new URL("../core/src", import.meta.url)),
      "@2free/data-provider": fileURLToPath(new URL("../data-provider/src", import.meta.url)),
      "@2free/auth": fileURLToPath(new URL("../auth/src", import.meta.url)),
    },
  },
});
