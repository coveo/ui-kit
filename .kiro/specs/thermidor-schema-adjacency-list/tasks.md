# Implementation Plan: thermidor-schema-adjacency-list (track #1 — additive schema)

## Overview

This plan implements the purely additive, schema-centric track #1 of KIT-6147 inside `@coveo/thermidor-schema`, plus the single cross-package change it requires in the `@coveo/thermidor` SDK. Work proceeds incrementally: shared definition → base contract → per-member re-declaration + `commerce-search` + union → generation/exports → SDK union widening → fixtures/property/regression tests → verification → changeset.

The implementation language is TypeScript (the design and package already use TypeScript; no language question needed). Property tests use `fast-check` (already a devDependency), run ≥100 iterations each, and are tagged with the feature name `thermidor-schema-adjacency-list`.

**Out of scope (track #2, `thermidor-commerce-search-composition`):** removing `facetIds` from `FacetManagerState`, touching `surfaceRef`, modifying `packages/platform-mock-api` mock templates, modifying `samples/thermidor/demo-schema-react` renderers, mounting an A2-UI tree via CopilotKit `children(id)`, root mapping. None of the tasks below touch those.

## Tasks

- [x] 1. Add the shared child-ref definition
  - [x] 1.1 Create `schema/definitions/child-ref.schema.json`
    - New document: `$schema` draft 2020-12, absolute `$id` `https://schema.thermidor.coveo.com/definitions/child-ref.schema.json`, `title` `ChildRef`, `type` `string`, `pattern` `^[a-z][a-z0-9-]*$`, with a description noting it references another component in the same flat map by `componentId`
    - This is the single JSON-Schema-level source of truth for the component-id string ref; quicktype inlines it at each use site as `z.string().regex(...)` rather than emitting a named `ChildRefSchema` (inlining is intentional)
    - _Requirements: 1.3, 2.2_

- [x] 2. Extend the base component contract with composition fields
  - [x] 2.1 Add optional `children` and `child` to `schema/base/component.schema.json`
    - Add `children`: `type` array, `items` `$ref` → `definitions/child-ref.schema.json`, `maxItems` 1000, `default` `[]`, with a description documenting that order is backend-owned and meaningful and that referential integrity/uniqueness are not enforced at parse time
    - Add `child`: `$ref` → `definitions/child-ref.schema.json`, with a description documenting the A2-UI single-child convention
    - Leave `required` (`componentId`, `displayName`, `componentType`, `state`, `actions`) and `additionalProperties: false` unchanged — do NOT add `children`/`child` to `required`
    - _Requirements: 1.1, 1.2, 1.3, 1.5, 1.7, 2.1, 2.2, 2.5, 3.1_

- [x] 3. Re-declare composition fields per component, add commerce-search, and widen the union
  - [x] 3.1 Re-declare `children`/`child` in each of the 14 existing component documents' own `properties`
    - In each of `product-carousel`, `cart`, `next-actions-bar`, `bundle-display`, `comparison-table`, `product-list`, `pagination`, `sort`, `search-box`, `regular-facet`, `numeric-facet`, `date-facet`, `category-facet`, `facet-manager` under `schema/components/`, add `children` (array, `items` `$ref` → child-ref, `maxItems` 1000, `default` `[]`) and `child` (`$ref` → child-ref) to that document's own `properties` block, alongside the existing `componentType`/`state`/`actions`
    - Required because each document sets `additionalProperties: false` at its own root and JSON Schema `additionalProperties` does not see properties contributed through `allOf` (the central decision in the design)
    - Do NOT modify any component's `state` or `actions` — including `facet-manager`, which keeps its `facetIds` state field exactly as on `main`
    - _Requirements: 3.4, 3.5_
  - [x] 3.2 Create `schema/components/commerce-search.schema.json`
    - New surface-root component: `$schema` draft 2020-12, absolute `$id` `https://schema.thermidor.coveo.com/components/commerce-search.schema.json`, `title` `CommerceSearch`, `allOf` → base component; own `properties` with `componentType` const `commerce-search`, empty `state` (`type` object, `additionalProperties: false`), empty `actions` (`type` object, empty `properties`, `additionalProperties: false`), plus `children`/`child` referencing child-ref; `additionalProperties: false` at root
    - Preserve the base required set with no new required properties beyond the base
    - _Requirements: 4.1, 4.2, 4.5_
  - [x] 3.3 Add `commerce-search` to the `oneOf` in `schema/components/component-contracts.schema.json`
    - Add a `$ref` → `commerce-search.schema.json` as a new union member keyed on the `componentType` discriminant with a value distinct from every other member
    - _Requirements: 4.3, 4.4_
  - [x]* 3.4 Structural assertions for base/commerce-search/union (extend `tests/facet-schemas.test.ts` pattern)
    - Assert base `required` is unchanged and excludes `children`/`child`; `children`/`child` reference child-ref; `children.items` is a string ref with no component-object ref under `children`/`child`
    - Assert `commerce-search` `$id`, `componentType.const`, `allOf` → base, required set equals base set, and membership in the union with a discriminant distinct from all others
    - _Requirements: 1.7, 3.2, 4.1, 4.2, 4.3, 4.5_

- [x] 5. Wire generation reachability and regenerate the Zod projection
  - [x] 5.1 Confirm `commerce-search` generation reachability in `scripts/generate-zod.ts`
    - `commerce-search` is reached automatically via the union `oneOf`, and `crawlSchemaDocuments` pulls in the shared `child-ref` definition from the component documents' `children`/`child` `$ref`s
    - Keep the crawl/`--check`/freshness mechanism otherwise unchanged
    - _Requirements: 5.1_
  - [x] 5.2 Regenerate `src/generated/schemas.ts`
    - Run `pnpm run generate` from the package root and commit the regenerated file so it contains `CommerceSearchSchema` and `CommerceSearchPropsSchema`, with the union widened to include `commerce-search`
    - Confirm `child-ref` is inlined as `z.string().regex(...)` at each use site with NO named `ChildRefSchema` export — that inlining is expected, not a failure
    - _Requirements: 5.1, 5.8_
  - [x]* 5.3 Assert the projection is non-recursive and fresh
    - Assert the generated file contains no `z.lazy(` for the composition (`children`/`child`) fields, and that `pnpm run generate:check` passes with the committed file (extend/reuse `tests/projection.test.ts`)
    - _Requirements: 3.2, 3.3, 5.2, 5.3_

- [x] 6. Export the new schemas and types from the package entry point
  - [x] 6.1 Add new exports to `src/index.ts`
    - Export from `./generated/schemas.js`: `CommerceSearchSchema`, `CommerceSearchPropsSchema`, and the inferred types `CommerceSearch`, `CommerceSearchProps`
    - Do NOT export a named `ChildRefSchema`/`ChildRef`: `child-ref` is inlined by quicktype at each use site as `z.string().regex(...)` (no named export), which is intentional; `child-ref.schema.json` remains the single JSON-Schema-level source of the id pattern
    - _Requirements: 5.4, 5.8_

- [x] 8. Checkpoint — schema package builds and generates cleanly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Widen the `@coveo/thermidor` SDK union enumeration (only cross-package change)
  - [x] 9.1 Add a minimal `commerce-search` instance to the SDK property test
    - In `packages/thermidor/src/public/controllers/remote/remote-controller.property.test.ts`, add a minimal `commerce-search` entry to the `minimalInstances` map so the union-enumerating tests cover the new member; ensure `@coveo/thermidor` builds and its tests pass against the widened `ComponentContractsSchema`
    - Do not change SDK per-`componentId` state resolution or action dispatch
    - _Requirements: 3.6_

- [x] 10. Add composition-field fixtures and the fixture-driven table entries
  - [x] 10.1 Add valid and invalid component fixtures for the composition fields
    - Add a valid fixture populating `children` and `child`; the fixture's `facet-manager` value MUST include `state: {facetIds: [...]}` (facetIds retained in track #1) alongside additive `children`
    - Add an invalid fixture violating a composition field (e.g. a `children` item that is not an array of strings, or a `child` that does not match the id pattern)
    - _Requirements: 6.6_
  - [x] 10.2 Register the fixtures in `tests/contract.test.ts`
    - Add the valid fixture (expected accepted) and invalid fixture (expected rejected) to the fixture-driven table so both Ajv and Zod are asserted to agree
    - _Requirements: 6.3, 6.4, 6.6_

- [x] 11. Add the property-based tests (fast-check, ≥100 iterations, tagged)
  - [x]* 11.1 Property 1 — Ajv–Zod agreement per changed contract
    - **Property 1: Ajv–Zod agreement per changed contract**
    - Register all `schema/` documents in Ajv and assert `zodSchema.safeParse(x).success === Boolean(ajvValidate(x))` for the base+composition contract, `commerce-search`, and the union; tag `Feature: thermidor-schema-adjacency-list, Property 1`
    - **Validates: Requirements 6.3, 6.4, 5.5**
  - [x]* 11.2 Property 2 — Composition-field optionality
    - **Property 2: Composition-field optionality**
    - **Validates: Requirements 1.1, 1.2, 2.1, 2.3, 3.1**
  - [x]* 11.3 Property 3 — Child-reference pattern enforcement
    - **Property 3: Child-reference pattern enforcement** (including duplicate-entry arrays accepted, non-matching item rejects whole)
    - **Validates: Requirements 1.3, 1.4, 1.6, 2.2, 2.4, 5.5**
  - [x]* 11.4 Property 4 — Every component type carries composition through the base
    - **Property 4: Every component type carries composition through the base** (14 existing + `commerce-search`; `state`/`actions` validate identically with/without composition)
    - **Validates: Requirements 3.5, 4.2**
  - [x]* 11.5 Property 5 — Discriminant resolution
    - **Property 5: Discriminant resolution** (resolves each type, incl. `commerce-search`, by `componentType`)
    - **Validates: Requirements 4.4, 5.7**
  - [x]* 11.6 Property 6 — Rejection leaves invalid input unmodified
    - **Property 6: Rejection leaves invalid input unmodified** (non-array-of-strings `children` rejected, input deep-equal to pre-parse)
    - **Validates: Requirements 5.6**
- [x] 12. Backward-compat regression
  - [x]* 12.1 Confirm existing state fixtures and `migration-properties.test.ts` still pass
    - Run the existing state fixtures and `tests/migration-properties.test.ts` to confirm ALL components' `state`/`actions` — including `facet-manager` `facetIds` — are unchanged after the additive edits; no fixture or state assertion changes are expected
    - _Requirements: 3.4_

- [x] 13. Verification and packaging
  - [x] 13.1 Run the full schema-package verification suite
    - Run `pnpm run validate:schema`, `pnpm run generate:check`, `pnpm run build`, and `pnpm run test` from `packages/thermidor-schema` and confirm all pass (structural validity, freshness, no type errors, Ajv↔Zod agreement)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 5.2, 5.3_
  - [x] 13.2 Confirm mocks and both samples build/pass UNCHANGED
    - Confirm `packages/platform-mock-api`, `samples/thermidor/demo-schema-react`, and `samples/thermidor/demo-react` build and pass their tests without any edits to them (the additive fields are optional; no existing mechanism is retired)
    - _Requirements: 3.7, 3.8, 3.9_
  - [x] 13.3 Add the changeset for `@coveo/thermidor-schema`
    - Add a changeset file under `.changeset/` naming `@coveo/thermidor-schema` with a non-breaking bump (minor or patch, appropriate for a 0.x package) describing the additive composition change
    - _Requirements: 3.10, 6.7_

- [x] 14. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional test sub-tasks and can be skipped for a faster MVP.
- Each task references the specific requirement clauses it satisfies for traceability.
- Track #1 is purely additive: no component `state`/`actions` is modified, `facetIds` is retained, `surfaceRef` is untouched, and the mocks and both samples are left unchanged.
- Property tests use `fast-check` at ≥100 iterations, tagged `Feature: thermidor-schema-adjacency-list, Property {n}`.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1", "3.2"] },
    { "id": 2, "tasks": ["3.1", "3.3"] },
    { "id": 3, "tasks": ["3.4", "5.1"] },
    { "id": 4, "tasks": ["5.2"] },
    { "id": 5, "tasks": ["5.3", "6.1"] },
    { "id": 6, "tasks": ["9.1", "10.1"] },
    { "id": 7, "tasks": ["10.2", "12.1"] },
    { "id": 8, "tasks": ["11.1", "11.2", "11.3", "11.4", "11.5", "11.6"] },
    { "id": 9, "tasks": ["13.1"] },
    { "id": 10, "tasks": ["13.2", "13.3"] }
  ]
}
```
