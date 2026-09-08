# Implementation Plan: Remove Controllers from Schema

## Overview

Implement Option B from ADR-006: remove the `controllers` abstraction from the Thermidor public schema and expose `state` and `actions` directly on components. The migration follows the order: JSON Schema layer → generation script → run generation → update exports → SDK runtime → SDK tests → mock templates → cleanup → sample consumer.

## Tasks

- [x] 1. Restructure JSON Schema layer
  - [x] 1.1 Rewrite `base/component.schema.json` to remove `controllers` and add `componentId`, `displayName`, `componentType`, `state`, `actions` as required top-level properties with `additionalProperties: false`
    - Remove the `controllers` property entirely
    - Add `componentType` with pattern `^[a-z][a-z0-9]*(-[a-z0-9]+)*$` and maxLength 128
    - Add `state` as object (empty `{}` valid)
    - Add `actions` as object with `additionalProperties` referencing `base/action.schema.json`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.6_

  - [x] 1.2 Create `components/component-contracts.schema.json` with a `oneOf` discriminated by `componentType` referencing all five component contracts
    - Reference `product-carousel.schema.json`, `cart.schema.json`, `next-actions-bar.schema.json`, `bundle-display.schema.json`, `comparison-table.schema.json`
    - _Requirements: 2.4_

  - [x] 1.3 Rewrite all five component contract schemas under `schema/components/` to inline `componentType` (const literal), `state`, and `actions` as top-level properties, referencing `base/component.schema.json` via `allOf`
    - `components/cart.schema.json` — componentType `"cart"`
    - `components/product-carousel.schema.json` — componentType `"product-carousel"`
    - `components/next-actions-bar.schema.json` — componentType `"next-actions-bar"`
    - `components/bundle-display.schema.json` — componentType `"bundle-display"`
    - `components/comparison-table.schema.json` — componentType `"comparison-table"`
    - Each must define `state` and `actions` with the same structure as the corresponding controller contract
    - Do NOT reference `base/controller.schema.json`
    - _Requirements: 2.1, 2.2, 2.3, 2.6, 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 1.4 Delete `base/controller.schema.json`
    - _Requirements: 1.5, 2.6_

  - [x] 1.5 Delete the entire `schema/controllers/` directory (including `controller-contracts.schema.json`, `product-list.schema.json`, `cart.schema.json`, `next-actions.schema.json`, `bundle-display.schema.json`, `comparison-table.schema.json`)
    - _Requirements: 2.5_

- [x] 2. Update Zod code generation script
  - [x] 2.1 Update `scripts/generate-zod.ts`: rename `loadControllerIndex` to `loadComponentIndex`, change the entry point URI to `components/component-contracts.schema.json`
    - _Requirements: 4.1, 4.7_

  - [x] 2.2 Update the component detection heuristic: replace `loadControllerDocuments` with `loadComponentContractDocuments` filtering on `document.properties?.componentType?.const`
    - _Requirements: 4.8_

  - [x] 2.3 Update `loadDiscriminatedUnions`: change discriminator from `'controllerSchema'` to `'componentType'` and update member type name resolution
    - _Requirements: 4.9_

  - [x] 2.4 Update `loadComponentPropsEntries` to emit flat `{componentId: z.string(), componentType: z.literal(...)}` props schemas instead of nested `controllers` objects
    - Remove `surfaceId` from generated props schemas
    - _Requirements: 4.4, 4.10_

  - [x] 2.5 Rename `loadControllerStateEntry`/`loadControllerPayloadEntries` to `loadComponentStateEntry`/`loadComponentPayloadEntries` with matching logic updates to read `state` and `actions` from the top-level component contract
    - _Requirements: 4.3, 4.5_

- [x] 3. Run generation and validate output
  - [x] 3.1 Run `pnpm run generate` in `packages/thermidor-schema` and verify it produces `src/generated/schemas.ts` with `ComponentContractsSchema` discriminated on `componentType`
    - Verify exit code 0
    - Verify generated output contains component contract schemas, state schemas, payload schemas, entity schemas unchanged
    - _Requirements: 4.1, 4.2, 4.5, 4.6, 10.2_

  - [x] 3.2 Run `pnpm run generate:check` and verify exit 0 (schemas are fresh)
    - _Requirements: 10.6_

  - [x] 3.3 Run `pnpm run validate:schema` and verify zero errors against `schema/base/` and `schema/components/`
    - _Requirements: 10.3_

- [x] 4. Update `thermidor-schema` package exports
  - [x] 4.1 Update `src/index.ts`: export `ComponentContractsSchema`, `ComponentContracts`, individual component contract schemas (`CartSchema`, `ProductCarouselSchema`, `NextActionsBarSchema`, `BundleDisplaySchema`, `ComparisonTableSchema`) and their types; remove all `ControllerContractsSchema`, `ControllerContracts`, and individual controller contract exports
    - Keep all state, payload, entity, and props schema exports unchanged
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [x] 5. Checkpoint - Ensure schema package builds
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Adapt SDK runtime (`remote-controller.ts`)
  - [x] 6.1 Update types: replace `RemoteControllerSchemaId` with `ComponentType` (derived from `ComponentContracts['componentType']`), update `RemoteControllerContractSchemaFor`, `RemoteControllerStateForSchema`, `RemoteControllerActionNameForSchema`, `RemoteControllerActionPayloadForSchema` to use `componentType` discriminant
    - _Requirements: 6.4, 8.1, 8.2, 8.3_

  - [x] 6.2 Update `RemoteControllerOptions` to accept `{source, componentId, componentType}` instead of `{source, controllerId, contract}`
    - _Requirements: 6.1_

  - [x] 6.3 Update `buildRemoteController` to resolve the contract via `ComponentContractsSchema` using `componentType` as discriminant, throw for unknown types
    - Implement `findComponentContract(componentType)` helper
    - _Requirements: 6.2, 6.3_

  - [x] 6.4 Update `selectRemoteControllerState` to read from `state.components[componentId]` instead of `state.controllers[controllerId]`, returning singleton empty object when missing
    - _Requirements: 7.1, 7.3_

  - [x] 6.5 Update dispatch to send `{componentId, componentType, action, payload}` instead of `{controllerId, controllerSchema, action, payload}`
    - _Requirements: 7.2, 8.4_

  - [x] 6.6 Update `RemoteController` interface: remove `AdvertisedRemoteController`, add `componentId` readonly property, parameterize by `TComponentType extends ComponentType`
    - _Requirements: 8.5, 8.7_

  - [x] 6.7 Update `packages/thermidor/src/public/controllers/index.ts` exports: export `ComponentType`, remove `RemoteControllerSchemaId` and `AdvertisedRemoteController`
    - _Requirements: 8.6_

- [x] 7. Update SDK unit tests
  - [x] 7.1 Rewrite `remote-controller.test.ts`: update all calls to use `{source, componentId, componentType}` options, structure mock state as `{components: {[componentId]: state}}`, assert dispatch payload contains `{componentId, componentType, action, payload}`
    - Test state selection from `state.components[componentId]`
    - Test that unknown `componentType` throws
    - Test subscriber isolation (changing one component slice triggers callback, changing a different slice does not)
    - Test singleton empty object reference identity for missing state
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

  - [x] 7.2 Write property test: Schema round-trip preservation (Property 1)
    - **Property 1: Schema round-trip preservation**
    - For any valid component contract, parsing with `ComponentContractsSchema` and serializing back produces a deep-equal object
    - **Validates: Requirements 10.1**

  - [x] 7.3 Write property test: Component contract resolution (Property 3)
    - **Property 3: Component contract resolution**
    - For any valid `componentType` in the union, `findComponentContract(componentType)` returns the unique matching entry with `state` and `actions` shapes
    - **Validates: Requirements 6.2, 8.2**

  - [x] 7.4 Write property test: State selector isolation (Property 4)
    - **Property 4: State selector isolation**
    - For any two distinct componentIds in a snapshot, `selectRemoteControllerState` returns the correct isolated slice
    - **Validates: Requirements 7.1, 7.4**

  - [x] 7.5 Write property test: Empty state singleton identity (Property 5)
    - **Property 5: Empty state singleton identity**
    - For any source without a `components` key or entry, `selectRemoteControllerState` returns the same singleton reference
    - **Validates: Requirements 7.3**

  - [x] 7.6 Write property test: Action dispatch payload round-trip (Property 6)
    - **Property 6: Action dispatch payload round-trip**
    - For any valid action payload, `dispatch` invokes `source.dispatchAction` with matching `{componentId, componentType, action, payload}`
    - **Validates: Requirements 7.2, 9.3**

  - [x] 7.7 Write property test: Invalid payload rejection (Property 7)
    - **Property 7: Invalid payload rejection**
    - For any invalid payload, `dispatch` rejects and does not call `source.dispatchAction`
    - **Validates: Requirements 6.4, 9.6**

- [x] 8. Checkpoint - Ensure SDK builds and tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Update Platform Mock API templates
  - [x] 9.1 Update `schema-response-fallback.ts`: remove `controllers` from component props, use `components` keyed by `componentId` in `StateSnapshot`, remove controller schema URI constants
    - _Requirements: 12.1, 12.2, 12.3, 12.4_

  - [x] 9.2 Update `schema-response-discovery.ts`: same pattern — remove `controllers` props, use `components[componentId]` state
    - _Requirements: 12.1, 12.2, 12.3, 12.4_

  - [x] 9.3 Update `schema-response-comparison.ts`: same pattern
    - _Requirements: 12.1, 12.2, 12.3, 12.4_

  - [x] 9.4 Update `schema-response-bundle.ts`: same pattern (multi-component surface with nested product carousels)
    - _Requirements: 12.1, 12.2, 12.3, 12.4_

  - [x] 9.5 Update `schema-response-search.ts`: same pattern
    - _Requirements: 12.1, 12.2, 12.3, 12.4_

  - [x] 9.6 Update shared constants/helpers (`shared.ts`, `events.ts`): remove controller schema URI constants, update `StateSnapshot`/`ActivitySnapshot` helper type signatures if needed
    - _Requirements: 12.3, 12.5, 12.7_

- [x] 10. Checkpoint - Ensure mock API package builds
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Migrate demo-schema-react sample consumer
  - [x] 11.1 Replace `useAdvertisedController` with `useRemoteController` hook in `src/a2ui/controllers.tsx`: accept `(source, componentId, componentType)`, call `buildRemoteController({source, componentId, componentType})`, remove all `ControllerContracts`/`ControllerAdvertisement`/`AdvertisedRemoteController` references
    - _Requirements: 13.1_

  - [x] 11.2 Update all component renderers (ProductCarousel, NextActionsBar, BundleDisplay, ComparisonTable) to call `useRemoteController(stateSource, props.componentId, props.componentType)` instead of `useAdvertisedController(stateSource, props.controllers.X)`
    - Update BundleDisplay to use `selectRemoteControllerState(stateSource.state, slot.componentId)`
    - _Requirements: 13.2, 13.3_

  - [x] 11.3 Update `src/a2ui/controllers.test.ts`: use `{components: {[componentId]: state}}` mock structure, call `buildRemoteController` with new options, assert `{componentId, componentType, action, payload}` dispatch
    - _Requirements: 13.4_

  - [x] 11.4 Update `src/a2ui/components.test.ts`: validate props with flat `{componentId, componentType}`, replace controller contract tests with component contract equivalents
    - _Requirements: 13.5_

  - [x] 11.5 Verify `import-boundary.test.ts` rejects imports of removed symbols (`ControllerContracts`, `ControllerContractsSchema`, `CartControllerContractSchema`, `ProductListControllerContractSchema`, `AdvertisedRemoteController`, `RemoteControllerSchemaId`)
    - _Requirements: 13.6_

- [x] 12. Final checkpoint - Ensure full build and tests pass
  - Run `pnpm run build` across all affected packages
  - Run `pnpm run test` scoped to thermidor, thermidor-schema, platform-mock-api, and demo-schema-react
  - Run `pnpm run lint:check`
  - Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 9.7, 10.6, 12.6, 13.7_

- [x] 13. Write property test: Zod generation idempotence (Property 2)
  - **Property 2: Zod generation idempotence**
  - Running the generation script twice produces byte-identical output in `src/generated/schemas.ts`
  - **Validates: Requirements 10.2, 10.6**

- [x] 14. Write property test: Data type backward compatibility (Property 8)
  - **Property 8: Data type backward compatibility**
  - For any valid instance of definition, state, or payload schemas, parsing with post-migration Zod schemas succeeds identically to pre-migration
  - **Validates: Requirements 11.1, 11.2, 11.3, 11.5**

- [x] 15. Write property test: Controllers property rejection (Property 9)
  - **Property 9: Controllers property rejection**
  - For any component JSON document containing a `controllers` property, validation against `base/component.schema.json` fails
  - **Validates: Requirements 1.6, 10.5**

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at schema, SDK, and mock layers
- Property tests validate universal correctness properties from the design document
- The migration order (schema → generation → exports → SDK → mocks → cleanup → consumer) ensures a green build at each checkpoint
- All definition schemas (Product, CartItem, ActionItem, etc.), state schemas, and payload schemas remain structurally unchanged — only the container and indexing model changes

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["1.3"] },
    { "id": 2, "tasks": ["1.4", "1.5"] },
    { "id": 3, "tasks": ["2.1", "2.2", "2.3", "2.4", "2.5"] },
    { "id": 4, "tasks": ["3.1", "3.2", "3.3"] },
    { "id": 5, "tasks": ["4.1"] },
    { "id": 6, "tasks": ["6.1", "6.2"] },
    { "id": 7, "tasks": ["6.3", "6.4", "6.5", "6.6"] },
    { "id": 8, "tasks": ["6.7"] },
    { "id": 9, "tasks": ["7.1", "7.2", "7.3", "7.4", "7.5", "7.6", "7.7"] },
    { "id": 10, "tasks": ["9.1", "9.2", "9.3", "9.4", "9.5"] },
    { "id": 11, "tasks": ["9.6"] },
    { "id": 12, "tasks": ["11.1"] },
    { "id": 13, "tasks": ["11.2", "11.3", "11.4"] },
    { "id": 14, "tasks": ["11.5"] }
  ]
}
```
