import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { statusDefinitions } from "@/styles/status.js";

const packageRoot = resolve(process.cwd());
const stylesRoot = resolve(packageRoot, "src/styles");
const readStyle = (file: string): string => readFileSync(resolve(stylesRoot, file), "utf8");

describe("reference-aligned foundation", () => {
  it("exposes warm semantic palette, generous radii, and polished shadows", () => {
    const tokens = readStyle("tokens.css");

    for (const token of [
      "--brand-off-white",
      "--brand-peach",
      "--brand-olive",
      "--brand-mint",
      "--brand-terracotta",
      "--radius-xl",
      "--radius-pill",
      "--shadow-card",
      "--shadow-floating",
    ]) {
      expect(tokens, `missing foundation token ${token}`).toContain(token);
    }
  });

  it("defines complete light and dark semantic theme contracts", () => {
    const themes = readStyle("themes.css");

    expect(themes).toContain('[data-theme="light"]');
    expect(themes).toContain('[data-theme="dark"]');

    for (const token of [
      "--surface-canvas",
      "--surface-panel",
      "--surface-raised",
      "--surface-sunken",
      "--surface-glass",
      "--surface-sage",
      "--surface-peach",
      "--surface-blue",
      "--surface-pink",
      "--surface-hero-start",
      "--surface-hero-end",
      "--text-primary",
      "--text-secondary",
      "--text-muted",
      "--text-on-warm",
      "--border-subtle",
      "--accent-primary",
      "--accent-secondary",
      "--focus-ring",
      "--shadow-card",
    ]) {
      expect(themes, `missing theme token ${token}`).toContain(token);
    }

    expect(themes.match(/\[data-theme="dark"\]/g)).toHaveLength(1);
    expect(themes).toMatch(/\[data-theme="dark"\][\s\S]*--surface-canvas:\s*#[0-9a-f]{6}/i);
    expect(themes).toMatch(/\[data-theme="dark"\][\s\S]*--text-primary:\s*#[0-9a-f]{6}/i);
  });

  it("uses local-only font declarations and documents missing binaries", () => {
    const typography = readStyle("typography.css");
    const notes = readFileSync(resolve(stylesRoot, "README.md"), "utf8");

    expect(typography).toContain('font-family: "Urbanist"');
    expect(typography).toContain('src: local("Urbanist")');
    expect(typography).toContain('font-family: "Open Sans"');
    expect(typography).toContain('src: local("Open Sans")');
    expect(typography).not.toMatch(/@import\s+url\(|https?:\/\/|url\(/i);
    expect(notes).toContain("No licensed Urbanist or Open Sans font binaries");
    expect(notes).toContain("do not invent or add font binaries");
  });

  it("keeps the supplied logo byte-identical and package-exported", () => {
    const suppliedLogo = readFileSync(resolve(packageRoot, "../../2free con fondi.svg"), "utf8");
    const packageLogo = readFileSync(
      resolve(packageRoot, "src/assets/2free-con-fondi.svg"),
      "utf8",
    );
    const manifest = JSON.parse(readFileSync(resolve(packageRoot, "package.json"), "utf8")) as {
      exports: Record<string, string | Record<string, string>>;
    };

    expect(packageLogo).toBe(suppliedLogo);
    expect(manifest.exports["./assets/2free-con-fondi.svg"]).toBe(
      "./src/assets/2free-con-fondi.svg",
    );
  });

  it("names every status in Spanish and supplies a non-color marker", () => {
    expect(statusDefinitions).toEqual({
      success: { label: "Éxito", symbol: "✓" },
      warning: { label: "Advertencia", symbol: "!" },
      danger: { label: "Error", symbol: "×" },
      neutral: { label: "Información", symbol: "i" },
    });

    const statusStyles = readStyle("status.css");
    expect(statusStyles).toContain("data-status-tone");
    expect(statusStyles).toContain("border-inline-start");
  });

  it("supports both media-driven and explicit reduced-motion boundaries", () => {
    const reducedMotion = readStyle("reduced-motion.css");

    expect(reducedMotion).toContain("prefers-reduced-motion: reduce");
    expect(reducedMotion).toContain('[data-motion="reduced"]');
    expect(reducedMotion).toContain("--transition-fast: none");
    expect(reducedMotion).toContain("animation: none !important");
    expect(reducedMotion).toContain("transition: none !important");
    expect(reducedMotion).toContain("[data-motion-settled]");
    expect(reducedMotion).toContain("scroll-behavior: auto");
  });
});
