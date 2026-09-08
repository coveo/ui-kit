# Implementation Plan: thermidor-contracts-typescript-build

## Overview

Create the `packages/thermidor-schema` package (`@coveo/thermidor-schema`) by faithfully reproducing the TypeScript projection pipeline from PR #17 of `coveo-platform/thermidor-schema` (commit `b046dea970dcdb427065f9daf61c910d172fc31e`). The implementation follows a linear pipeline: scaffold package → copy schema inputs → adapt scripts → generate TypeScript/Zod source → build dist → validate with fixed-input Vitest suites → document adaptations and consumer handoff.

## Tasks

- [x] 1. Scaffold package structure and configuration
  - [x] 1.1 Create `packages/thermidor-schema/package.json` with monorepo-aligned versions
    - Use `@coveo/thermidor-schema` as package name, version `0.0.1`
    - Set `type: "module"`, `main: "./dist/index.js"`, `types: "./dist/index.d.ts"`
    - Define `exports` map with `"."` and `"./package.json"` entries
    - Add `zod: "catalog:"` as dependency
    - Add `typescript: "catalog:"` and `vitest: "catalog:"` as devDependencies
    - Add placeholder devDependencies for `quicktype-core`, `ajv`, `ajv-formats` (requires approval gate — see task 3.1)
    - Define scripts: `validate:schema`, `generate`, `validate:freshness:src`, `validate:freshness:dist`, `build`, `test`, `clean`
    - Set `files: ["dist"]` and `publishConfig.access: "public"`
    - Do NOT add `engines` or `packageManager` fields (inherited from root)
    - _Requirements: 1.8, 3.1, 3.2, 3.3, 9.1, 9.2, 9.3, 9.4, 9.5, 9.13, 9.14_

  - [x] 1.2 Create `packages/thermidor-schema/tsconfig.json`
    - Extend `../../tsconfig.json`
    - Set `rootDir: "src/"`, `outDir: "dist/"`, `declaration: true`
    - Set `module: "NodeNext"`, `moduleResolution: "NodeNext"`, `target: "ES2022"`
    - Enable `strict`, `noUnusedLocals`, `noUnusedParameters`
    - Include `src/**/*.ts`
    - _Requirements: 1.4, 4.10, 8.6_

  - [x] 1.3 Create `packages/thermidor-schema/turbo.json` with package-level task graph
    - Define `validate:schema` task with inputs `["schema/**/*.json", "scripts/validate-schema.ts"]`
    - Define `generate` task with `dependsOn: ["validate:schema"]`, inputs `["schema/**/*.json", "scripts/generate-zod.ts"]`, outputs `["src/generated/**"]`
    - Define `build` task with `dependsOn: ["generate"]`, inputs `["src/**/*.ts", "tsconfig.json"]`, outputs `["dist/**"]`
    - Define `test` task with `dependsOn: ["build"]`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.12, 4.13, 4.14, 4.15, 4.16_

  - [x] 1.4 Create `packages/thermidor-schema/vitest.config.ts`
    - Configure Vitest with `include: ['tests/**/*.test.ts']`
    - _Requirements: 6.16, 6.17_

- [x] 2. Copy JSON Schema inputs from external reference
  - [x] 2.1 Create `packages/thermidor-schema/schema/controllers/product-list.schema.json`
    - Reproduce byte-identical content from reference PR (commit `b046dea`)
    - Ensure `$id` is `https://schema.thermidor.coveo.com/controllers/product-list.schema.json`
    - Ensure `$schema` is `https://json-schema.org/draft/2020-12/schema`
    - _Requirements: 1.1, 5.3, 8.4_

  - [x] 2.2 Create `packages/thermidor-schema/schema/controllers/cart.schema.json`
    - Reproduce byte-identical content from reference PR (commit `b046dea`)
    - Ensure `$id` is `https://schema.thermidor.coveo.com/controllers/cart.schema.json`
    - Ensure `$schema` is `https://json-schema.org/draft/2020-12/schema`
    - _Requirements: 1.1, 5.4, 8.4_

- [x] 3. Create and adapt generator/validation scripts
  - [x] 3.1 Add local devDependencies (`quicktype-core@26.0.0`, `ajv@8.20.0`, `ajv-formats@3.0.1`)
    - These dependencies are NOT in the monorepo catalog
    - Add them ONLY to `packages/thermidor-schema/package.json` as devDependencies
    - Do NOT modify `pnpm-workspace.yaml` catalog section
    - Run `pnpm install` from monorepo root to update lockfile
    - Document in ADAPTATIONS.md (task 10) that these are Dépendance_Locale_de_Générateur
    - **Requires explicit maintainer approval before proceeding (Porte_d_Approbation)**
    - _Requirements: 2.8, 9.8, 9.9, 9.10_

  - [x] 3.2 Create `packages/thermidor-schema/scripts/validate-schema.ts`
    - Import `Ajv` from `ajv` and `addFormats` from `ajv-formats`
    - Read all `.json` files from `schema/` directory recursively
    - Validate each file is a valid JSON Schema (draft 2020-12)
    - Validate each file has an absolute URI `$id` field
    - Validate internal `$ref` resolution succeeds
    - Exit 0 on success, exit 1 with JSON diagnostic on validation failure, exit 2 on infrastructure error
    - Use `node --experimental-strip-types` for execution (defined in package.json script)
    - _Requirements: 1.2, 4.1, 4.8, 4.12, 8.3_

  - [x] 3.3 Create `packages/thermidor-schema/scripts/generate-zod.ts`
    - Import `quicktype-core` for JSON Schema → Zod transformation
    - Read validated schema files from `schema/`
    - Produce deterministic TypeScript/Zod declarations
    - Write output to `src/generated/schemas.ts`
    - Preserve canonical `$id` as literal string in generated Zod schemas
    - Exit 0 on success, exit 1 with JSON diagnostic on failure, exit 2 on infrastructure error
    - Ensure determinism: same inputs → byte-identical output
    - _Requirements: 1.2, 1.3, 4.2, 4.9, 8.3_

  - [x] 3.4 Create `packages/thermidor-schema/scripts/check-freshness.ts`
    - Accept argument `src` or `dist` to determine which directory to check
    - For `src`: re-run generation in-memory, diff against committed `src/generated/`
    - For `dist`: re-run build in-memory, diff against committed `dist/`
    - Report first divergent path in lexicographic order with expected/observed content
    - Exit 0 if fresh, exit 1 with diagnostic on staleness, exit 2 on infrastructure error
    - _Requirements: 4.3, 4.4, 4.17, 4.18_

- [x] 4. Run generation and build pipeline
  - [x] 4.1 Run schema validation and generation to produce `src/generated/schemas.ts`
    - Execute `pnpm run validate:schema` in `packages/thermidor-schema`
    - Execute `pnpm run generate` in `packages/thermidor-schema`
    - Verify `src/generated/schemas.ts` exists and contains expected Zod schemas
    - Verify canonical IDs are preserved as literals in generated output
    - _Requirements: 1.3, 4.1, 4.2, 4.9, 5.3, 5.4_

  - [x] 4.2 Create `packages/thermidor-schema/src/index.ts` barrel re-export
    - Re-export all public API from `./generated/schemas`
    - Export value exports: `productListControllerContract`, `productListControllerStateSchema`, `cartControllerContract`, `cartControllerStateSchema`, `cartControllerContractSetItemsPayloadSchema`, `cartControllerContractUpdateItemQuantityPayloadSchema`, `controllerContracts`, `productSchema`, `cartItemSchema`, `productCarouselPropsSchema`, `cartPropsSchema`
    - Export type exports: `ProductListController`, `ProductListControllerState`, `CartController`, `CartControllerState`, `SetItemsPayload`, `UpdateItemQuantityPayload`, `Product`, `CartItem`, `ControllerContracts`
    - _Requirements: 3.1, 3.5, 3.9, 3.10, 5.1, 5.2, 5.5, 5.6, 5.7, 5.8, 5.9_

  - [x] 4.3 Run build to produce `dist/`
    - Execute `pnpm run build` in `packages/thermidor-schema`
    - Verify `dist/index.js`, `dist/index.d.ts`, `dist/generated/schemas.js`, `dist/generated/schemas.d.ts` exist
    - Verify TypeScript compilation succeeds with zero errors
    - _Requirements: 1.6, 3.2, 3.3, 3.4, 4.10_

- [x] 5. Checkpoint - Ensure generation and build succeed
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Create test fixtures
  - [x] 6.1 Create valid and invalid fixtures for product-list contract
    - Create `tests/fixtures/product-list.valid.json` — a value that the product-list controller state schema accepts
    - Create `tests/fixtures/product-list.invalid.json` — a value that the product-list controller state schema rejects (e.g., missing required field, wrong type)
    - Fixtures must be reproduced from or consistent with external reference test data
    - _Requirements: 1.5, 5.10, 5.11, 6.8, 8.5_

  - [x] 6.2 Create valid and invalid fixtures for cart contract
    - Create `tests/fixtures/cart.valid.json` — a value the cart controller state schema accepts
    - Create `tests/fixtures/cart.invalid.json` — a value the cart controller state schema rejects
    - _Requirements: 1.5, 5.12, 5.13, 6.8, 8.5_

  - [x] 6.3 Create valid and invalid fixtures for setItems payload
    - Create `tests/fixtures/set-items.valid.json` — a valid setItems payload
    - Create `tests/fixtures/set-items.invalid.json` — an invalid setItems payload
    - _Requirements: 1.5, 5.14, 5.15, 6.8, 8.5_

  - [x] 6.4 Create valid and invalid fixtures for updateItemQuantity payload
    - Create `tests/fixtures/update-item-quantity.valid.json` — a valid updateItemQuantity payload
    - Create `tests/fixtures/update-item-quantity.invalid.json` — an invalid updateItemQuantity payload
    - _Requirements: 1.5, 5.16, 5.17, 6.8, 8.5_

- [x] 7. Create test suites
  - [x] 7.1 Create `tests/schema-validation.test.ts`
    - Test that valid schemas (`product-list.schema.json`, `cart.schema.json`) are accepted by ajv validation
    - Test that an inline fixture with missing `$id` is rejected with a diagnostic
    - Test that an inline fixture with a relative URI `$id` is rejected with a diagnostic
    - _Requirements: 6.1, 6.2, 4.8_

  - [x] 7.2 Create `tests/projection.test.ts`
    - Test that re-running generation produces byte-identical output to committed `src/generated/schemas.ts`
    - Test that canonical IDs from schema `$id` values appear as string literals in generated Zod schemas
    - _Requirements: 6.3, 4.9_

  - [x] 7.3 Create `tests/freshness.test.ts`
    - Test that committed `src/generated/` passes freshness check (result: `accepté`)
    - Test that a modified fixture vs committed source fails freshness with first divergent path (result: `rejeté`)
    - Test that committed `dist/` passes freshness check (result: `accepté`)
    - Test that a modified fixture vs committed dist fails freshness with first divergent path (result: `rejeté`)
    - _Requirements: 6.4, 6.5, 4.17_

  - [x] 7.4 Create `tests/contract.test.ts`
    - Test product-list valid fixture → Zod parse succeeds
    - Test product-list invalid fixture → Zod parse fails with diagnostic
    - Test cart valid fixture → Zod parse succeeds
    - Test cart invalid fixture → Zod parse fails with diagnostic
    - Test setItems valid fixture → Zod parse succeeds
    - Test setItems invalid fixture → Zod parse fails with diagnostic
    - Test updateItemQuantity valid fixture → Zod parse succeeds
    - Test updateItemQuantity invalid fixture → Zod parse fails with diagnostic
    - Test discriminated union accepts known schemaIds
    - Test discriminated union rejects unknown schemaId
    - _Requirements: 5.10, 5.11, 5.12, 5.13, 5.14, 5.15, 5.16, 5.17, 5.19, 6.8, 6.9_

  - [x] 7.5 Create `tests/canonical-ids.test.ts`
    - Test that product-list contract exposes literal `https://schema.thermidor.coveo.com/controllers/product-list.schema.json`
    - Test that cart contract exposes literal `https://schema.thermidor.coveo.com/controllers/cart.schema.json`
    - _Requirements: 5.3, 5.4, 5.18, 6.10_

  - [x] 7.6 Create `tests/boundary.test.ts`
    - Test that package exports map does not expose `src/generated`, `scripts/`, or `schema/`
    - Test that `dist/` contains only `.js` and `.d.ts` files (no source, schema, or scripts)
    - _Requirements: 3.5, 3.6, 3.8, 6.15_

  - [x] 7.7 Create `tests/pack.test.ts`
    - Test that `npm pack` succeeds after build
    - Test that JS import `@coveo/thermidor-schema` resolves to `dist/index.js`
    - Test that TS types resolve to `dist/index.d.ts`
    - Test that tarball contains `dist/` directory
    - Test that tarball excludes `schema/`, `scripts/`, `src/generated/`
    - Test that export inventory matches all expected value + type exports from the reference
    - _Requirements: 6.12, 6.13, 6.14, 6.15, 3.2, 3.3_

  - [x] 7.8 Create `tests/spot-check-equivalence.test.ts`
    - Import from `@coveo/thermidor-schema` (new package) and from `../../thermidor-contracts/src/generated/catalog-contracts` (existing)
    - Test that every Zod schema export name in existing contracts also exists in new package
    - Test that product-list valid/invalid fixtures produce same safeParse result in both packages
    - Test that cart valid/invalid fixtures produce same safeParse result in both packages
    - Test that setItems valid/invalid fixtures produce same safeParse result in both packages
    - Test that updateItemQuantity valid/invalid fixtures produce same safeParse result in both packages
    - Test type compatibility with compile-time assertions (satisfies/conditional types)
    - Note: this import from thermidor-contracts is ONLY for this test file, not a runtime pattern
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

- [x] 8. Checkpoint - Ensure all test suites pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Create documentation artifacts
  - [x] 9.1 Create `packages/thermidor-schema/ADAPTATIONS.md`
    - Document each named adaptation with: name, category, justification, external value, adapted value
    - Include TypeScript version adaptation (external 7.0.2 → monorepo catalog 6.0.3)
    - Include Vitest version adaptation (external 4.1.10 → catalog, same version)
    - Include pnpm version adaptation (external 11.17.0 → root 10.34.5)
    - Include Node engines adaptation (external `>=22.6.0` → root `^22.14.0 || ^24.11.0`)
    - Include packageManager field adaptation (external `pnpm@11.17.0` → omitted, inherited)
    - Include workspace integration adaptation (standalone lockfile → monorepo pnpm-lock.yaml)
    - Include oxfmt version adaptation (external 0.61.0 → root devDeps, same version)
    - Categories limited to: Alignement_de_Version_Monorepo, Intégration_Workspace_Monorepo
    - _Requirements: 8.7, 8.8, 8.9, 8.13, 8.14, 2.14_

  - [x] 9.2 Create `packages/thermidor-schema/CONSUMER-HANDOFF.md`
    - Document all 8 preconditions that must pass before downstream consumers can resolve `@coveo/thermidor-schema`
    - List: Validation_de_Schéma, Projection_TypeScript_Zod, Validation_de_Fraîcheur (src), Build_Schema, Validation_de_Fraîcheur (dist), Validation_de_Contrat, Validation_de_Package, Inventaire_d_Exports_Publiés validated
    - Explain that Turbo's `^build` dependency ensures ordering at the task graph level
    - State that future consumers (Échantillon_React_Contractuel) must import exclusively from `@coveo/thermidor-schema`
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10, 7.11_

- [x] 10. Full pipeline validation
  - [x] 10.1 Run complete Turbo pipeline and verify end-to-end success
    - Run `pnpm run validate:schema` → verify exit 0
    - Run `pnpm run generate` → verify exit 0 and `src/generated/schemas.ts` is fresh
    - Run `pnpm run validate:freshness:src` → verify exit 0
    - Run `pnpm run build` → verify exit 0 and `dist/` produced
    - Run `pnpm run validate:freshness:dist` → verify exit 0
    - Run `pnpm run test` → verify all 8 test suites pass
    - Verify that `pnpm turbo run build --filter=@coveo/thermidor-schema` succeeds with full task graph
    - _Requirements: 4.1–4.11, 6.11, 6.16_

- [x] 11. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP — no tasks in this plan are marked optional since all are core implementation
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Task 3.1 (adding local devDependencies) requires explicit maintainer approval via the Porte_d_Approbation gate before execution
- The spot-check equivalence test (7.8) imports from `packages/thermidor-contracts` solely for one-time validation — this is NOT a runtime dependency pattern
- All tests use fixed inputs and deterministic expected outputs (no PBT, no random generators, no clocks, no network)
- The design explicitly states no Correctness Properties section — property-based testing does not apply

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3", "1.4"] },
    { "id": 1, "tasks": ["2.1", "2.2"] },
    { "id": 2, "tasks": ["3.1", "3.2", "3.3", "3.4"] },
    { "id": 3, "tasks": ["4.1"] },
    { "id": 4, "tasks": ["4.2"] },
    { "id": 5, "tasks": ["4.3"] },
    { "id": 6, "tasks": ["6.1", "6.2", "6.3", "6.4"] },
    { "id": 7, "tasks": ["7.1", "7.2", "7.3", "7.5", "7.6"] },
    { "id": 8, "tasks": ["7.4", "7.7", "7.8"] },
    { "id": 9, "tasks": ["9.1", "9.2"] },
    { "id": 10, "tasks": ["10.1"] }
  ]
}
```
