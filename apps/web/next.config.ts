import path from "node:path";
import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";

const appDir = path.dirname(fileURLToPath(import.meta.url));
const uiSourceDir = path.join(appDir, "../../packages/ui/src");
const uiSourcePath = (relativePath: string) =>
  path.relative(appDir, path.join(uiSourceDir, relativePath));

const uiPackageAliases = {
  "@/alias-probe.js": uiSourcePath("alias-probe.ts"),
  "@/components/app-shell.js": uiSourcePath("components/app-shell.tsx"),
  "@/components/chart-text-equivalent.js": uiSourcePath("components/chart-text-equivalent.tsx"),
  "@/components/dialog-focus.js": uiSourcePath("components/dialog-focus.ts"),
  "@/components/finance-dashboard.js": uiSourcePath("components/finance-dashboard.tsx"),
  "@/components/finance-experience.js": uiSourcePath("components/finance-experience.tsx"),
  "@/components/finance-safe-state.js": uiSourcePath("components/finance-safe-state.tsx"),
  "@/components/icon-control.js": uiSourcePath("components/icon-control.tsx"),
  "@/components/status.js": uiSourcePath("components/status.tsx"),
  "@/models/dashboard.js": uiSourcePath("models/dashboard.ts"),
  "@/models/finance-experience.js": uiSourcePath("models/finance-experience.ts"),
  "@/motion/capabilities.js": uiSourcePath("motion/capabilities.ts"),
  "@/motion/use-scoped-motion.js": uiSourcePath("motion/use-scoped-motion.ts"),
  "@/motion/view-transition.js": uiSourcePath("motion/view-transition.ts"),
  "@/styles/status.js": uiSourcePath("styles/status.ts"),
};

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  output: "standalone",
  outputFileTracingRoot: path.join(appDir, "../.."),
  turbopack: {
    resolveAlias: uiPackageAliases,
  },
  transpilePackages: ["@2free/ui"],
};

export default nextConfig;
