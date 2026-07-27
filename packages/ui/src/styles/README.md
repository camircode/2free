# Shared UI foundation

The public stylesheet is composed in `index.css` in this order: base tokens, semantic
themes, typography, accessibility foundation, statuses, reduced-motion overrides, and
then component styles. Consumers should select a theme with `data-theme="light"` or
`data-theme="dark"` on an application or package root.

## Visual tokens

`tokens.css` contains the supplied warm palette primitives (off-white, peach, olive,
mint, and terracotta), spacing, generous rounded radii, and light-default shadow and
transition values. `themes.css` maps those primitives to semantic surfaces, text,
accents, borders, focus rings, status colors, and explicit light/dark shadow values.
Do not use raw palette values in components when a semantic token is available.

Status components intentionally combine color with a visible Spanish label, symbol,
semantic role, and leading border so the state remains understandable without color.

## Typography assets

No licensed Urbanist or Open Sans font binaries were supplied with this change. The
package therefore declares local-only `@font-face` entries plus explicit readable
system fallback stacks in `typography.css`; it does not use remote `@import`, URLs, or
font service requests.

When supplied and licensed binaries with approved weights become available, add only
those files under `src/assets/fonts/` and extend the local declarations with their
approved sources. Until then, do not invent or add font binaries; the fallback stacks
preserve readable content and layout offline.

## Branding

`src/assets/2free-con-fondi.svg` is the byte-identical package copy of the supplied
root logo and is exported at `@2free/ui/assets/2free-con-fondi.svg`. Do not redraw,
optimize, reserialize, or replace the supplied SVG as part of a style change.
