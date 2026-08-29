# Implementation Plan: A2-UI Contract-Driven Mock

## Overview

This plan implements three new conversational A2-UI scenarios (NextActionsBar, BundleDisplay, ComparisonTable) by creating JSON Schema definitions, generating Zod schemas, rewriting mock templates to use the v1.0 format, and registering catalog renderers in the demo sample. Work is organized in layers: schemas first, then generation, then templates and renderers, then tests.

## Tasks

- [x] 1. Create JSON Schema definition files
  - [x] 1.1 Create `packages/thermidor-schema/schema/definitions/action-item.schema.json`
    - Define `ActionItem` with required `text` (string) and `type` (enum: `"followup"`, `"search"`) properties
    - Follow the pattern of `definitions/product.schema.json` and `definitions/cart-item.schema.json`
    - Set `$id` to `https://schema.thermidor.coveo.com/definitions/action-item.schema.json`
    - Set `additionalProperties: false`
    - _Requirements: 1.3_

  - [x] 1.2 Create `packages/thermidor-schema/schema/definitions/bundle-tier.schema.json`
    - Define `BundleTier` with required `label` (string), `description` (string), and `slots` (array) properties
    - Define `BundleSlot` in `$defs` with required `categoryLabel` (string) and `surfaceRef` (string)
    - Set `$id` to `https://schema.thermidor.coveo.com/definitions/bundle-tier.schema.json`
    - Set `additionalProperties: false` on both objects
    - _Requirements: 2.3, 2.4_

  - [x] 1.3 Create `packages/thermidor-schema/schema/definitions/comparison-product.schema.json`
    - Define `ComparisonProduct` with required `productId`, `name`, `values` (additionalProperties: string) and optional `imageUrl` (format: uri), `price` (number), `rating` (number, min 0, max 5)
    - Set `$id` to `https://schema.thermidor.coveo.com/definitions/comparison-product.schema.json`
    - Set `additionalProperties: false`
    - _Requirements: 3.3_

  - [x] 1.4 Create `packages/thermidor-schema/schema/definitions/comparison-attribute.schema.json`
    - Define `ComparisonAttribute` with required `key` (string) and `label` (string)
    - Set `$id` to `https://schema.thermidor.coveo.com/definitions/comparison-attribute.schema.json`
    - Set `additionalProperties: false`
    - _Requirements: 3.4_

- [x] 2. Create controller JSON Schema files
  - [x] 2.1 Create `packages/thermidor-schema/schema/controllers/next-actions.schema.json`
    - Define `NextActionsControllerContract` following the `product-list.schema.json` pattern
    - Set `controllerSchema` const to `https://schema.thermidor.coveo.com/controllers/next-actions.schema.json`
    - Define `NextActionsState` in `$defs` with required `actions` array referencing `action-item.schema.json`
    - Define `actions` object with required `selectAction` action. `selectAction` payload requires `text` (string) and `type` (enum: `"followup"`, `"search"`). Add a `SelectActionAction` definition in `$defs`
    - Include `allOf` reference to `base/controller.schema.json`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 2.2 Create `packages/thermidor-schema/schema/controllers/bundle-display.schema.json`
    - Define `BundleDisplayControllerContract` following the `product-list.schema.json` pattern
    - Set `controllerSchema` const to `https://schema.thermidor.coveo.com/controllers/bundle-display.schema.json`
    - Define `BundleDisplayState` in `$defs` with required `tiers` array referencing `bundle-tier.schema.json`
    - Set empty `actions` object (read-only controller)
    - Include `allOf` reference to `base/controller.schema.json`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [x] 2.3 Create `packages/thermidor-schema/schema/controllers/comparison-table.schema.json`
    - Define `ComparisonTableControllerContract` following the `product-list.schema.json` pattern
    - Set `controllerSchema` const to `https://schema.thermidor.coveo.com/controllers/comparison-table.schema.json`
    - Define `ComparisonTableState` in `$defs` with required `products` (array of comparison-product) and `attributes` (array of comparison-attribute)
    - Set empty `actions` object (read-only controller)
    - Include `allOf` reference to `base/controller.schema.json`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 3. Create component JSON Schema files and update controller-contracts
  - [x] 3.1 Create `packages/thermidor-schema/schema/components/next-actions-bar.schema.json`
    - Follow the `product-carousel.schema.json` pattern
    - Reference `base/component.schema.json` via `allOf`
    - Declare a `controllers` object with required `nextActionsController` field referencing the next-actions controller schema
    - _Requirements: 1.7_

  - [x] 3.2 Create `packages/thermidor-schema/schema/components/bundle-display.schema.json`
    - Follow the `product-carousel.schema.json` pattern
    - Reference `base/component.schema.json` via `allOf`
    - Declare a `controllers` object with required `bundleDisplayController` field referencing the bundle-display controller schema
    - _Requirements: 2.8_

  - [x] 3.3 Create `packages/thermidor-schema/schema/components/comparison-table.schema.json`
    - Follow the `product-carousel.schema.json` pattern
    - Reference `base/component.schema.json` via `allOf`
    - Declare a `controllers` object with required `comparisonTableController` field referencing the comparison-table controller schema
    - _Requirements: 3.8_

  - [x] 3.4 Update `packages/thermidor-schema/schema/controllers/controller-contracts.schema.json`
    - Add `$ref` entries for next-actions, bundle-display, and comparison-table to the `oneOf` array in `ControllerContracts`
    - The discriminated union should now have 5 variants (product-list, cart, next-actions, bundle-display, comparison-table)
    - _Requirements: 1.6, 2.7, 3.7, 8.4_

- [x] 4. Run schema generation and update exports
  - [x] 4.1 Run `pnpm run generate` in `packages/thermidor-schema`
    - Execute the generation script to produce Zod schemas for the new controllers in `src/generated/schemas.ts`
    - Verify the generated file includes `NextActionsControllerContractSchema`, `BundleDisplayControllerContractSchema`, `ComparisonTableControllerContractSchema`, and definition schemas
    - _Requirements: 8.1_

  - [x] 4.2 Update `packages/thermidor-schema/src/index.ts` to export new schemas and types
    - Export the new controller contract schemas: `NextActionsControllerContractSchema`, `BundleDisplayControllerContractSchema`, `ComparisonTableControllerContractSchema`
    - Export definition schemas: `ActionItemSchema`, `BundleTierSchema`, `ComparisonProductSchema`, `ComparisonAttributeSchema`
    - Export state types: `NextActionsState`, `BundleDisplayState`, `ComparisonTableState`
    - Export state schemas: `NextActionsStateSchema`, `BundleDisplayStateSchema`, `ComparisonTableStateSchema`
    - Export definition types: `ActionItem`, `BundleTier`, `ComparisonProduct`, `ComparisonAttribute`
    - _Requirements: 8.2, 8.3_

- [x] 5. Checkpoint - Verify schema generation
  - Ensure `pnpm run build` passes for `packages/thermidor-schema`, ask the user if questions arise.

- [x] 6. Rewrite mock templates in `packages/platform-mock-api`
  - [x] 6.1 Rewrite `packages/platform-mock-api/src/converse/templates/response5.ts` (fallback — NextActionsBar)
    - Replace existing content with a v1.0 format template following the `response4.ts` pattern
    - Emit an optional text message via TEXT_MESSAGE_START/CONTENT/END events
    - Emit an `ActivitySnapshot` with `activityType: 'a2ui-surface'` containing a `createSurface` message with `surfaceId`, `catalogId` (`https://schema.thermidor.coveo.com/a2-ui/catalog.json`), and a `NextActionsBar` component entry with `controllerId` and `controllerSchema` in props
    - Emit a `StateSnapshot` with `snapshot.controllers[controllerId]` containing state with at least 2 action items (one `"followup"`, one `"search"`)
    - Wrap with `buildConversationResponse` (TurnStarted, RunStarted, RunFinished, TurnComplete)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 9.1, 9.2, 9.3, 9.4_

  - [x] 6.2 Rewrite `packages/platform-mock-api/src/converse/templates/response1.ts` (BundleDisplay)
    - Replace existing content with a v1.0 format template
    - Emit a text message introducing the surfing kit tiers
    - Emit an `ActivitySnapshot` with `createSurface` containing a `BundleDisplay` component entry with `controllerId` and `controllerSchema` in props
    - Emit a `StateSnapshot` with controller state containing exactly 3 tiers (budget, mid-range, premium) each with slots referencing product surfaces
    - Emit additional `ActivitySnapshot` and/or `StateSnapshot` entries for the product-list controllers referenced by bundle slots
    - Wrap with `buildConversationResponse`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 9.1, 9.2, 9.3, 9.4, 9.5_

  - [x] 6.3 Rewrite `packages/platform-mock-api/src/converse/templates/response8.ts` (ComparisonTable)
    - Replace existing content with a v1.0 format template
    - Emit a text message introducing the wetsuit comparison
    - Emit an `ActivitySnapshot` with `createSurface` containing a `ComparisonTable` component entry with `controllerId` and `controllerSchema` in props
    - Emit a `StateSnapshot` with controller state containing at least 3 products and at least 3 comparison attributes
    - Wrap with `buildConversationResponse`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 7. Register catalog renderers in `samples/thermidor/demo-schema-react`
  - [x] 7.1 Update `samples/thermidor/demo-schema-react/src/a2ui/components.tsx` to add new catalog definitions and renderers
    - Import `NextActionsControllerContractSchema`, `BundleDisplayControllerContractSchema`, `ComparisonTableControllerContractSchema` from `@coveo/thermidor-schema`
    - Define props schemas (`nextActionsBarPropsSchema`, `bundleDisplayPropsSchema`, `comparisonTablePropsSchema`) with the controller advertisement shape
    - Add `NextActionsBar`, `BundleDisplay`, `ComparisonTable` entries to `thermidorCatalogDefinitions`
    - Implement `NextActionsBar` renderer: call `useAdvertisedController` with `nextActionsController` props, render an actions list. On action button click, the renderer SHALL call `controller.dispatch('selectAction', {text, type})` (not a callback prop). This differentiates it from the legacy `A2UINextActionsBar` in `SurfaceRenderer.tsx`.
    - Implement `BundleDisplay` renderer: call `useAdvertisedController` with `bundleDisplayController` props, render tiered layout
    - Implement `ComparisonTable` renderer: call `useAdvertisedController` with `comparisonTableController` props, render tabular comparison
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [x] 8. Checkpoint - Build and verify end-to-end
  - Ensure `pnpm run build` passes for `packages/platform-mock-api` and `samples/thermidor/demo-schema-react`, ask the user if questions arise.

- [x] 9. Write unit tests and property-based tests
  - [x] 9.1 Add test fixtures and extend `packages/thermidor-schema/tests/contract.test.ts`
    - Create valid fixture JSON files for each new state type (e.g., `next-actions-state.valid.json`, `bundle-display-state.valid.json`, `comparison-table-state.valid.json`)
    - Create invalid fixture JSON files for rejection cases
    - Add fixture entries to the fixtures array for Ajv/Zod cross-validation
    - Add tests for the 5-variant discriminated union (accepting all variants, rejecting unknown discriminators)
    - _Requirements: 1.6, 2.7, 3.7, 8.4_

  - [ ]* 9.2 Write property-based tests for controller state round-trip (Property 1)
    - Create `packages/thermidor-schema/tests/property-roundtrip.test.ts`
    - Use `fast-check` to generate arbitrary valid `NextActionsState`, `BundleDisplayState`, `ComparisonTableState` objects
    - Verify: `JSON.stringify → JSON.parse → zodSchema.parse` produces a deeply-equal object for each
    - Minimum 100 iterations per property
    - **Property 1: Controller state round-trip (serialization)**
    - **Validates: Requirements 1.2, 1.3, 2.2, 2.3, 2.4, 3.2, 3.3, 3.4, 8.5**

  - [ ]* 9.3 Write property-based tests for discriminated union (Property 2 & 3)
    - Create or extend `packages/thermidor-schema/tests/property-union.test.ts`
    - Use `fast-check` to generate arbitrary valid controller contract objects across all 5 schemas
    - **Property 2**: Verify `ControllerContractsSchema.safeParse` succeeds and `controllerSchema` matches the input discriminator
    - **Property 3**: Verify invalid `controllerSchema` strings are rejected
    - Minimum 100 iterations per property
    - **Property 2: Controller contract discriminated union accepts all variants**
    - **Validates: Requirements 1.6, 2.7, 3.7, 8.4**
    - **Property 3: Invalid controller schema discriminator rejects parse**
    - **Validates: Requirements 8.4**

  - [ ]* 9.4 Extend `samples/thermidor/demo-schema-react/src/a2ui/components.test.ts` with new catalog tests
    - Add tests verifying new props schemas accept valid controller advertisements
    - Add tests verifying props schemas reject wrong `controllerSchema` literals
    - Add tests verifying local props schema literals match the contract schema values
    - _Requirements: 7.2, 7.3, 7.4_

- [x] 10. Final checkpoint - Ensure all tests pass
  - Run `pnpm run test` for `packages/thermidor-schema` and `samples/thermidor/demo-schema-react`
  - Run `pnpm run lint:fix` to ensure linting passes
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- Templates response1, response5, response8 are **rewritten** (not created fresh) — the prompt-to-template mapping in `generate-response.ts` remains unchanged
- The code generation step (4.1) is critical — schema names in `src/generated/schemas.ts` are determined by the `title` fields in the JSON Schemas
- The legacy `A2UINextActionsBar` component in `src/a2ui/NextActionsBar/` and its `onAction` callback wiring through `SurfaceRenderer → AgentResponseBlock → ConversationThread → ConversationPage` will be superseded by the catalog renderer approach. No explicit removal task is needed now — the catalog renderer takes precedence when registered.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3", "1.4"] },
    { "id": 1, "tasks": ["2.1", "2.2", "2.3"] },
    { "id": 2, "tasks": ["3.1", "3.2", "3.3", "3.4"] },
    { "id": 3, "tasks": ["4.1"] },
    { "id": 4, "tasks": ["4.2"] },
    { "id": 5, "tasks": ["6.1", "6.2", "6.3", "7.1"] },
    { "id": 6, "tasks": ["9.1", "9.2", "9.3", "9.4"] }
  ]
}
```
