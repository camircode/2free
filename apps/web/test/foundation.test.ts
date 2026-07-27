import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const workspaceRoot = path.resolve(webRoot, "../..");

async function readWorkspaceFile(relativePath: string): Promise<string> {
  return await readFile(path.join(workspaceRoot, relativePath), "utf8");
}

async function readWorkspaceJson(relativePath: string): Promise<Record<string, unknown>> {
  return JSON.parse(await readWorkspaceFile(relativePath)) as Record<string, unknown>;
}

async function readWebFile(relativePath: string): Promise<string> {
  return await readFile(path.join(webRoot, relativePath), "utf8");
}

async function readJson(relativePath: string): Promise<Record<string, unknown>> {
  return JSON.parse(await readWebFile(relativePath)) as Record<string, unknown>;
}

describe("Next foundation contract", () => {
  it("pins the Next runtime and retains the legacy web entrypoints", async () => {
    const packageJson = await readJson("package.json");
    const dependencies = packageJson.dependencies as Record<string, string>;
    const devDependencies = packageJson.devDependencies as Record<string, string>;
    const scripts = packageJson.scripts as Record<string, string>;

    expect(dependencies).toMatchObject({
      "@2free/ui": "workspace:*",
      next: "16.2.11",
      react: "19.2.7",
      "react-dom": "19.2.7",
      "server-only": "0.0.1",
    });
    expect(devDependencies).toMatchObject({
      "@tailwindcss/postcss": "4.3.3",
      "@types/react": "19.2.17",
      "@types/react-dom": "19.2.3",
      tailwindcss: "4.3.3",
    });
    expect(scripts).toMatchObject({
      build: "next build",
      dev: "next dev",
      "dev:legacy": "tsx watch src/server.ts",
      start: "next start",
      "start:legacy": "tsx src/server.ts",
      typecheck: "next typegen && tsc --noEmit",
    });

    const rootPackageJson = await readWorkspaceJson("package.json");
    const rootScripts = rootPackageJson.scripts as Record<string, string>;
    expect(rootScripts.typecheck).toContain("pnpm --filter @2free/web typecheck");

    const nextConfig = await readWebFile("next.config.ts");
    expect(nextConfig).toContain('output: "standalone"');
    expect(nextConfig).toContain('transpilePackages: ["@2free/ui"]');
    expect(nextConfig).toContain('outputFileTracingRoot: path.join(appDir, "../..")');

    const tsconfig = await readWebFile("tsconfig.json");
    expect(tsconfig).toContain('"@/*": ["./*"');
    expect(tsconfig).toContain('"types/**/*.d.ts"');

    const postcssConfig = await readWebFile("postcss.config.mjs");
    expect(postcssConfig).toContain('"@tailwindcss/postcss"');

    const legacyServer = await readWebFile("src/server.ts");
    expect(legacyServer).toContain("export function createWebServer");
    expect(legacyServer).toContain("process.env.PUBLIC_API_URL");

    const compose = await readWorkspaceFile("compose.yml");
    expect(compose).toContain("dockerfile: apps/web/Dockerfile");
  });

  it("keeps the API Docker command on the explicit API entrypoint", async () => {
    const dockerfile = await readWorkspaceFile("apps/api/Dockerfile");
    const apiPackageJson = await readWorkspaceJson("apps/api/package.json");
    const apiScripts = apiPackageJson.scripts as Record<string, string>;

    expect(dockerfile).toContain('CMD ["pnpm", "--filter", "@2free/api", "start"]');
    expect(apiScripts.start).toBe("node dist/main.js");
  });

  it("keeps API_URL and shared assets on the server-side boundary", async () => {
    const layout = await readWebFile("app/layout.tsx");
    const page = await readWebFile("app/page.tsx");
    const globals = await readWebFile("app/globals.css");
    const serverApi = await readWebFile("lib/server-api.ts");

    expect(layout).toContain('import "@2free/ui/styles.css";');
    expect(layout).toContain('import logo from "@2free/ui/assets/2free-con-fondi.svg";');
    expect(serverApi.startsWith('import "server-only";')).toBe(true);
    expect(serverApi).toContain("environment.API_URL");
    expect(serverApi).toContain('throw new Error("API_URL must be configured")');

    expect(`${layout}\n${page}`).not.toMatch(/API_URL|127\.0\.0\.1:3001|api:3001/);
    expect(globals).toContain('@import "tailwindcss";');
    expect(globals).toContain('@source "../../packages/ui/src";');
    expect(globals).toContain('@source "./";');
    expect(globals).not.toContain("@font-face");
    expect(globals).not.toContain("ui-shell__");
  });
});
