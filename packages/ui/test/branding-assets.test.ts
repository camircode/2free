import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const root = resolve(process.cwd(), "../..");
const packageRoot = resolve(process.cwd());

describe("offline branding and typography fallbacks", () => {
  it("packages one exact copy of the supplied logo", () => {
    const suppliedLogo = readFileSync(resolve(root, "2free con fondi.svg"), "utf8");
    const packageLogo = readFileSync(
      resolve(packageRoot, "src/assets/2free-con-fondi.svg"),
      "utf8",
    );

    expect(packageLogo).toBe(suppliedLogo);
  });

  it("uses explicit fallback stacks without requiring font binaries or remote fonts", () => {
    const typography = readFileSync(resolve(packageRoot, "src/styles/typography.css"), "utf8");
    const typographyNotes = readFileSync(resolve(packageRoot, "src/styles/README.md"), "utf8");

    expect(typography).toContain('"Urbanist"');
    expect(typography).toContain('"Open Sans"');
    expect(typography).not.toMatch(/@import\s+url\(|https?:\/\//);
    expect(typographyNotes).toContain("No licensed Urbanist or Open Sans font binaries");
    expect(existsSync(resolve(packageRoot, "src/assets/fonts"))).toBe(false);
  });

  it("keeps the visual harness on the supplied package asset boundary", () => {
    const harness = readFileSync(
      resolve(packageRoot, "test/visual-harness.browser.test.tsx"),
      "utf8",
    );

    expect(harness).toContain("2free-con-fondi.svg");
    expect(harness).toContain("exactly the required eight Cartesian variants");
    expect(harness).not.toMatch(/https?:\/\//);
  });
});
