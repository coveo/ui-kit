# Consumer Handoff Contract

This document defines the preconditions that must be satisfied before any downstream consumer can resolve and use `@coveo/thermidor-schema`.

## Preconditions

A consumer's build or tests may resolve `@coveo/thermidor-schema` only after ALL of the following have passed:

1. **Schema Validation** — `pnpm run validate:schema` exits 0 (all JSON Schema documents are structurally valid with absolute `$id` fields and resolvable `$ref` references)
2. **TypeScript/Zod Projection** — `pnpm run generate` exits 0 (schemas are projected to TypeScript/Zod declarations)
3. **Source Freshness** — `pnpm run generate:check` exits 0 (committed `src/generated/schemas.ts` matches what the generator would produce)
4. **TypeScript Build** — `pnpm run build` exits 0 (TypeScript compiles to `dist/`)
5. **Contract Validation** — `pnpm run test` exits 0 (all Zod schemas match Ajv, fixtures pass, canonical IDs verified, boundary enforced)
6. **Package Validation** — Pack test passes (tarball resolves imports correctly and excludes internals)
7. **Export Inventory** — All expected value and type exports are present in `dist/index.d.ts`

## How Turbo Enforces This

Turbo's `^build` dependency rule ensures that `@coveo/thermidor-schema` is fully built before any downstream package's build starts. The package-level `turbo.json` further ensures the internal pipeline order: `validate:schema` → `generate` → `build` → `test`.

## Consumer Import Rules

- Import ONLY from `@coveo/thermidor-schema` (the package's public API)
- Do NOT import from `packages/thermidor-schema/src/`, `packages/thermidor-schema/schema/`, or `packages/thermidor-schema/scripts/`
- Do NOT import from `@coveo/thermidor-contracts` for controller contract schemas (that package is a separate, older copy)

## Published Exports

The authoritative source is the package barrel `src/index.ts` (re-exported from `src/generated/schemas.ts`). The list below is a convenience snapshot; if it disagrees with `src/index.ts`, `src/index.ts` wins.

The schema exposes flat component contracts (`componentType`, `state`, `actions`) aggregated by `ComponentContractsSchema`.

Besides the exported schemas and types listed below, the package also exports the constant `THERMIDOR_CATALOG_ID`.

### Value exports (Zod schemas)

#### Component contracts

- `ProductCarouselSchema`
- `NextActionsBarSchema`
- `BundleDisplaySchema`
- `ComparisonTableSchema`
- `ProductListSchema`
- `ProductSummarySchema`
- `PaginationSchema`
- `SortSchema`
- `RegularFacetSchema`
- `NumericFacetSchema`
- `DateFacetSchema`
- `CategoryFacetSchema`
- `FacetManagerSchema`
- `CommerceSearchSchema`
- `LayoutStackSchema`
- `QuerySummarySchema`
- `PageSizeSchema`
- `ComponentContractsSchema` (discriminated union of all component contracts)

#### Component props

- `BundleDisplayPropsSchema`
- `CategoryFacetPropsSchema`
- `CommerceSearchPropsSchema`
- `ComparisonTablePropsSchema`
- `DateFacetPropsSchema`
- `FacetManagerPropsSchema`
- `LayoutStackPropsSchema`
- `NextActionsBarPropsSchema`
- `NumericFacetPropsSchema`
- `PageSizePropsSchema`
- `PaginationPropsSchema`
- `ProductCarouselPropsSchema`
- `ProductListPropsSchema`
- `ProductSummaryPropsSchema`
- `QuerySummaryPropsSchema`
- `RegularFacetPropsSchema`
- `SortPropsSchema`

#### State, actions, value, and action-payload schemas

Each contract also exports the schemas that compose it:

- `*StateSchema`
- `*ActionsSchema`
- `*ValueSchema`
- `*PayloadSchema`

#### Shared definitions

- `ProductSchema`
- `ActionItemSchema`
- `BundleSlotSchema`
- `BundleTierSchema`
- `ComparisonAttributeSchema`
- `ComparisonProductSchema`
- `SortCriterionSchema`
- `FacetValueStateSchema`
- `SelectableFacetValueStateSchema`

### Type exports

The inferred TypeScript type for every exported schema above, for example:

- `ProductCarousel`
- `ComponentContracts`
- `Product`
- `Sort`
- `SortState`
- `NumericFacetValue`
- `ProductCarouselProps`

## Canonical Schema IDs

Component contract `$id`s follow the pattern `https://schema.thermidor.coveo.com/components/<component>.schema.json`; shared definitions use `https://schema.thermidor.coveo.com/definitions/<definition>.schema.json`. The authoritative IDs live in the JSON Schema sources under `schema/`.
