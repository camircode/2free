import { defineConfig } from "vitest/config";

import { packageSrcAlias } from "./vite.config.js";

export default defineConfig({
  resolve: {
    alias: packageSrcAlias,
  },
  test: {
    environment: "jsdom",
    include: ["test/**/*.test.ts", "test/**/*.test.tsx"],
    exclude: ["test/**/*.browser.test.ts", "test/**/*.browser.test.tsx"],
  },
});
