# Shared UI Foundation Specification

## Purpose

Define the reusable visual and package boundary for 2 Free React consumers without owning routes, data, or domain rules.

## Requirements

### Requirement: Semantic design tokens and themes

The UI package MUST expose semantic 2 Free tokens for color, typography, spacing, focus, status, and surfaces. It MUST provide light and dark themes whose status meaning and focus visibility do not depend on color alone.

#### Scenario: Theme rendering

- GIVEN a consumer selects light or dark theme
- WHEN the UI foundation is rendered
- THEN semantic tokens resolve to that theme and readable content, focus, and status indicators remain available

#### Scenario: Non-color status

- GIVEN a dashboard state is success, warning, empty, or error
- WHEN it is presented with either theme
- THEN text or semantic markup identifies the state in addition to color

### Requirement: Local typography and supplied branding

The package MUST load supplied/licensed Urbanist and Open Sans assets locally with explicit fallback stacks and MUST expose the supplied `2free con fondi.svg` logo without a remote font dependency.

#### Scenario: Asset availability

- GIVEN a consumer loads the package without network access
- WHEN branded text and the logo render
- THEN local assets or declared fallbacks render without requesting a remote font or service

#### Scenario: Missing optional font asset

- GIVEN a font file is unavailable in a supported environment
- WHEN typography renders
- THEN the fallback stack preserves readable content and layout without failing the consumer

### Requirement: Package-local import boundary

The package MUST map `@/*` only to its own `src/*` and MUST use explicit package imports for core/provider contracts. It MUST NOT own routes, storage, authentication, fetching, backend behavior, persistence, sync, notifications, integrations, or finance arithmetic.

#### Scenario: Consumer import

- GIVEN a React consumer imports a UI component
- WHEN the package resolves its internal alias
- THEN resolution remains inside `packages/ui/src` and does not depend on a consumer's alias

#### Scenario: Boundary enforcement

- GIVEN a component receives data and navigation through props
- WHEN it renders
- THEN it performs presentation only and leaves domain arithmetic and data ownership outside the package
