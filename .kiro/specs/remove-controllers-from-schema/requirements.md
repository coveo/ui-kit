# Requirements Document

## Introduction

Implementation of Option B from ADR-006 of the Thermidor Schema: remove the `controllers` abstraction from the public schema and expose `state` and `actions` directly on components. The public contract (JSON Schema + generated Zod types) becomes flatter and consumer-oriented. The SDK controller (`buildRemoteController`) continues to exist as an internal implementation detail with renamed parameters (`componentId` + `componentType`).

## Glossary

- **Thermidor_Schema**: The `@coveo/thermidor-schema` package containing the canonical JSON schemas and generated Zod code that define the public contract between the backend (producer) and the frontend (consumer).
- **Thermidor_SDK**: The `@coveo/thermidor` package containing the runtime implementation of the headless engine, including `buildRemoteController`.
- **Public_Contract**: The set of JSON Schema files under `schema/` and the generated TypeScript/Zod code that constitute the public interface between parties.
- **Component_Schema**: A JSON Schema file describing a UI component, its state structure, and its permitted actions.
- **ComponentContractsSchema**: The Zod discriminated union (discriminant: `componentType`) indexing all available component contracts. Replaces `ControllerContractsSchema`.
- **ControllerContractsSchema**: The existing Zod discriminated union (discriminant: `controllerSchema`) to be removed.
- **surfaceId**: A2-UI surface envelope identifier used for layout composition. Not used in AG-UI state indexing or SDK API.
- **componentId**: Globally unique identifier for a component instance, assigned by the backend. Serves as the single correlation key between A2-UI composition messages (the `id` field on component nodes) and AG-UI state messages (`state.components[componentId]`). Replaces `controllerId` from Option A.
- **componentType**: Component type (e.g., `"Cart"`, `"ProductCarousel"`). Used to resolve the appropriate Zod contract.
- **buildRemoteController**: SDK function that encapsulates state resolution, Zod validation, referential caching, reactive subscribe, and action dispatch.
- **Script_Generation**: The `scripts/generate-zod.ts` script that transforms canonical JSON schemas into TypeScript Zod code using recursive schema crawling from a root index document (currently `controller-contracts.schema.json`) rather than a hardcoded list of entries.
- **BundleSlot**: An object in BundleDisplay state containing a `surfaceRef` that references another surface by its identifier.
- **Platform_Mock_API**: The `@coveo/platform-mock-api` package containing mock HTTP server responses that simulate the Coveo backend A2-UI/AG-UI transport messages for local development and testing.
- **Demo_Schema_React**: The sample application at `samples/thermidor/demo-schema-react` (package identity `@samples/thermidor-demo-schema-react`) that demonstrates contract-driven rendering using `@coveo/thermidor-schema` and `@coveo/thermidor`. This consumer must be updated to use the new Option B API.

## Requirements

### Requirement 1: Restructure the Base Component Schema

**User Story:** As a schema consumer, I want components to expose `state` and `actions` directly, so that I can navigate the contract without traversing an unnecessary `controllers` indirection level.

#### Acceptance Criteria

1. THE Thermidor_Schema SHALL define the base component schema (`base/component.schema.json`) with required properties `componentId`, `displayName`, `componentType`, `state`, and `actions`, with `additionalProperties` set to `false`, and without a `controllers` property.
2. WHEN a component schema is validated, THE Thermidor_Schema SHALL require `componentType` to be a non-empty string matching the kebab-case pattern `^[a-z][a-z0-9]*(-[a-z0-9]+)*$` with a maximum length of 128 characters.
3. WHEN a component schema is validated, THE Thermidor_Schema SHALL require `state` to be an object that permits an empty object (`{}`) for components with no observable state.
4. WHEN a component schema is validated, THE Thermidor_Schema SHALL require `actions` to be an object where each value conforms to `base/action.schema.json`, permitting an empty object (`{}`) for components that expose no actions.
5. THE Thermidor_Schema SHALL remove the file `base/controller.schema.json` and all `$ref` references to it, so that no schema in the hierarchy resolves to or depends on the controller base schema.
6. IF a component schema document contains a `controllers` property, THEN THE Thermidor_Schema SHALL reject validation with an error indicating an unrecognized property.

---

### Requirement 2: Migrate Controller Contracts to Component Contracts

**User Story:** As a producer (backend), I want each component type to have a unique contract identified by `componentType`, so that I can produce state and actions without the intermediate controller wrapper.

#### Acceptance Criteria

1. THE Thermidor_Schema SHALL provide a component contract for each existing controller contract: ProductList → `"product-carousel"`, Cart → `"cart"`, NextActions → `"next-actions-bar"`, BundleDisplay → `"bundle-display"`, and ComparisonTable → `"comparison-table"`, where the `componentType` value matches the kebab-case component identifier used in the existing component schema `$id` path segment.
2. WHEN a component contract is defined, THE Thermidor_Schema SHALL declare a `componentType` property as a JSON Schema `const` string literal that serves as the discriminant for the component contracts index, replacing the `controllerSchema` URI previously used as discriminant in `controller-contracts.schema.json`.
3. WHEN a component contract is defined, THE Thermidor_Schema SHALL include `state` and `actions` properties directly on the component contract object (no intermediate `controllers` map), retaining the identical JSON Schema structure (property names, types, `required` arrays, and `$defs` sections) from the corresponding controller contract.
4. THE Thermidor_Schema SHALL provide a new component contracts index file (`component-contracts.schema.json`) that uses a `oneOf` containing `$ref` entries to each component contract, with `componentType` as the discriminant property across all entries.
5. WHEN migration is complete, THE Thermidor_Schema SHALL remove the entire `controllers/` directory (including `controller-contracts.schema.json` and all individual controller schema files: `product-list.schema.json`, `cart.schema.json`, `next-actions.schema.json`, `bundle-display.schema.json`, `comparison-table.schema.json`).
6. WHEN a component contract is defined, THE Thermidor_Schema SHALL not reference `base/controller.schema.json` via `allOf`; each component contract SHALL reference only `base/component.schema.json` (or no base schema) as its structural parent.

---

### Requirement 3: Update Concrete Component Schemas

**User Story:** As a schema consumer, I want each concrete component file (cart, product-carousel, etc.) to reference `state` and `actions` directly, so that I can read the complete contract of a component in a single document.

#### Acceptance Criteria

1. WHEN a concrete component schema (e.g., `components/cart.schema.json`) is defined, THE Thermidor_Schema SHALL declare `state` and `actions` as required top-level properties of the component object and SHALL NOT include a `controllers` property.
2. WHEN a concrete component schema is defined, THE Thermidor_Schema SHALL include a `componentType` property whose value is a JSON Schema `const` literal matching the PascalCase title of the component (e.g., `"Cart"`, `"ProductCarousel"`, `"NextActionsBar"`, `"BundleDisplay"`, `"ComparisonTable"`).
3. THE Thermidor_Schema SHALL update all five concrete component schemas (cart, product-carousel, next-actions-bar, bundle-display, comparison-table) so that each schema defines `componentType`, `state`, and `actions` as top-level required properties following criteria 1 and 2.
4. WHEN a concrete component schema references the base component schema via `allOf`, THE Thermidor_Schema SHALL ensure validation passes without the `controllers` property, which requires the base `component.schema.json` to remove `controllers` from its `required` array and its `properties` definition.
5. WHEN a concrete component schema is validated against its own definition, THE Thermidor_Schema SHALL pass JSON Schema Draft 2020-12 validation with a conformant instance containing `componentType`, `state`, and `actions` but no `controllers` property.

---

### Requirement 4: Update Zod Code Generation

**User Story:** As an SDK developer, I want the generation script to produce a `ComponentContractsSchema` (discriminated union on `componentType`), so that runtime contract resolution uses the new discriminant.

#### Acceptance Criteria

1. WHEN `pnpm run generate` is executed in `thermidor-schema`, THE Script_Generation SHALL produce a `ComponentContractsSchema` discriminated union with `componentType` as discriminant.
2. WHEN `pnpm run generate` is executed, THE Script_Generation SHALL NOT produce a `ControllerContractsSchema` discriminated union.
3. WHEN `pnpm run generate` is executed, THE Script_Generation SHALL produce component contract Zod schemas (e.g., `CartComponentContractSchema`) containing `componentType` literal, `state`, and `actions`.
4. WHEN `pnpm run generate` is executed, THE Script_Generation SHALL produce simplified component props schemas containing `componentId` (string) and `componentType` (literal) — without nested `controllers` objects or `surfaceId`.
5. WHEN `pnpm run generate` is executed, THE Script_Generation SHALL continue to produce all existing state, payload, and definition schemas (Product, CartItem, CartState, etc.) unchanged.
6. WHEN `pnpm run generate:check` is executed after generation, THE Script_Generation SHALL report that schemas are up to date (exit 0).
7. WHEN the Script_Generation loads the root index document, THE Script_Generation SHALL change `loadControllerIndex()` to load `component-contracts.schema.json` instead of `controller-contracts.schema.json` as the entry point for recursive schema crawling.
8. WHEN the Script_Generation identifies component contracts during recursive crawling, THE Script_Generation SHALL use a component detection heuristic (`document.properties?.componentType?.const === document.$id` path-segment match or equivalent) replacing the current controller detection heuristic (`document.properties?.controllerSchema?.const === document.$id`).
9. WHEN the Script_Generation constructs discriminated unions via `loadDiscriminatedUnions()`, THE Script_Generation SHALL use `'componentType'` as the discriminator string instead of `'controllerSchema'`.
10. WHEN the Script_Generation renders component props schemas via `loadComponentPropsEntries()`, THE Script_Generation SHALL read `componentId` and `componentType` fields from component schema documents instead of reading `controllers` from `doc.properties?.controllers?.properties`.

---

### Requirement 5: Update `thermidor-schema` Package Exports

**User Story:** As a consumer of the `@coveo/thermidor-schema` package, I want to import `ComponentContractsSchema` and its associated types, so that I can use the new contract in my code.

#### Acceptance Criteria

1. THE Thermidor_Schema SHALL export `ComponentContractsSchema` (a Zod discriminated union keyed on `componentType`) and its inferred type `ComponentContracts` from the package entry point.
2. THE Thermidor_Schema SHALL NOT export `ControllerContractsSchema` or `ControllerContracts` from the package entry point.
3. THE Thermidor_Schema SHALL export one component contract schema and its inferred type for each component type: `CartComponentContractSchema`, `ProductListComponentContractSchema`, `NextActionsComponentContractSchema`, `BundleDisplayComponentContractSchema`, and `ComparisonTableComponentContractSchema`.
4. THE Thermidor_Schema SHALL continue to export all state schemas (`CartStateSchema`, `ProductListStateSchema`, `NextActionsStateSchema`, `BundleDisplayStateSchema`, `ComparisonTableStateSchema`), all payload schemas (`SetItemsPayloadSchema`, `UpdateItemQuantityPayloadSchema`, `SelectActionPayloadSchema`), and all entity schemas (`ProductSchema`, `CartItemSchema`, `ActionItemSchema`, `BundleSlotSchema`, `BundleTierSchema`, `ComparisonAttributeSchema`, `ComparisonProductSchema`) with their inferred types unchanged.
5. THE Thermidor_Schema SHALL export component props schemas (`CartPropsSchema`, `ProductCarouselPropsSchema`, `NextActionsBarPropsSchema`, `BundleDisplayPropsSchema`, `ComparisonTablePropsSchema`) each defining a flat structure containing a `componentId` field (string) and a `componentType` field (literal matching the component type), with no `controllers` property and no `surfaceId` field.
6. IF a consumer imports `ControllerContractsSchema` or `ControllerContracts` from the package entry point, THEN THE Thermidor_Schema SHALL produce a compile-time resolution error.

---

### Requirement 6: Adapt `buildRemoteController` to the New Contract

**User Story:** As a frontend developer using the SDK, I want `buildRemoteController` to accept `componentId` and `componentType` instead of `controllerId` and `contract`, so that I benefit from an API aligned with the new schema.

#### Acceptance Criteria

1. WHEN `buildRemoteController` is called, THE Thermidor_SDK SHALL accept options `{source, componentId, componentType}` instead of `{source, controllerId, contract}`.
2. WHEN `buildRemoteController` resolves a contract, THE Thermidor_SDK SHALL perform a lookup in `ComponentContractsSchema` using `componentType` as discriminant.
3. IF an unknown `componentType` is provided, THEN THE Thermidor_SDK SHALL throw an error indicating the unknown component contract.
4. THE Thermidor_SDK SHALL expose a `ComponentType` type (derived from `ComponentContracts['componentType']`) replacing `RemoteControllerSchemaId`.

---

### Requirement 7: Adapt State Resolution in RemoteController

**User Story:** As a frontend developer, I want the RemoteController to index state by `componentId` in `state.components[componentId]`, so that transport/state correlation uses the new globally unique identifier.

#### Acceptance Criteria

1. WHEN `selectRemoteControllerState` reads the AG-UI snapshot, THE Thermidor_SDK SHALL resolve state from the path `state.activeTurn.agentResponse.state.components[componentId]` instead of `state.activeTurn.agentResponse.state.controllers[controllerId]`.
2. WHEN the RemoteController dispatches an action, THE Thermidor_SDK SHALL send `{componentId, componentType, action, payload}` instead of `{controllerId, controllerSchema, action, payload}`.
3. IF the snapshot does not contain a `components` key or does not contain an entry for the given `componentId`, THEN THE Thermidor_SDK SHALL return a singleton empty object (same reference identity on every call) so that downstream reference-equality checks do not trigger spurious re-renders.
4. WHILE the raw state reference at `state.components[componentId]` is identical to the previously read reference, THE Thermidor_SDK SHALL return the previously validated state without re-executing Zod schema validation.

---

### Requirement 8: Adapt RemoteController Type Utilities

**User Story:** As a TypeScript developer, I want the RemoteController type utilities (`RemoteControllerActionNameForSchema`, `RemoteControllerStateForSchema`, etc.) to use `componentType` as a generic parameter, so that type inference works with the new discriminant.

#### Acceptance Criteria

1. THE Thermidor_SDK SHALL export a `ComponentType` type alias derived from `ComponentContracts['componentType']`, replacing `RemoteControllerSchemaId`.
2. THE Thermidor_SDK SHALL parameterize `RemoteController<TComponentType>` by a `TComponentType extends ComponentType` generic (e.g., `"Cart"`) that resolves the matching `ComponentContractsSchema` entry via the `componentType` discriminant.
3. THE Thermidor_SDK SHALL derive `RemoteControllerActionNameForSchema<TComponentType>`, `RemoteControllerActionPayloadForSchema<TComponentType, TAction>`, and `RemoteControllerStateForSchema<TComponentType>` from the `ComponentContractsSchema` entry whose `componentType` literal matches `TComponentType`.
4. WHEN `controller.dispatch(action, payload)` is called, THE Thermidor_SDK SHALL constrain `action` to `RemoteControllerActionNameForSchema<TComponentType>` and `payload` to `RemoteControllerActionPayloadForSchema<TComponentType, TAction>` at compile-time, and SHALL validate the payload against the resolved Zod schema at runtime before dispatching.
5. IF a `TComponentType` value not present in `ComponentContractsSchema` is provided to `buildRemoteController`, THEN THE Thermidor_SDK SHALL produce a compile-time type error (no matching entry in the discriminated union) and SHALL throw an error at runtime indicating the unknown component type.
6. THE Thermidor_SDK SHALL export `ComponentType`, `RemoteController`, `RemoteControllerSource`, `RemoteControllerContractSchemaFor`, `RemoteControllerOptions`, `RemoteControllerActionNameForSchema`, `RemoteControllerActionPayloadForSchema`, and `RemoteControllerStateForSchema` from the package entry point (`packages/thermidor/src/public/controllers/index.ts`), where the `RemoteControllerContractSchemaFor` utility type (renamed from the internal `ControllerContractSchemaFor`) resolves to a `ComponentContractSchemaFor` equivalent parameterized by `componentType`.
7. THE Thermidor_SDK SHALL remove the `RemoteControllerSchemaId` type alias and all internal references to `controllerSchema`-based discriminant resolution from the public API surface.

---

### Requirement 9: Update Unit Tests

**User Story:** As an SDK developer, I want the `buildRemoteController` unit tests to reflect the new API (`componentId` + `componentType`), so that behavior is validated against the new contract.

#### Acceptance Criteria

1. WHEN tests call `buildRemoteController`, THE test suite SHALL pass `{source, componentId, componentType}` as options, where `componentId` is a globally unique string identifying the component instance and `componentType` is a valid `ComponentContractsSchema` discriminant value.
2. WHEN tests create a mock source snapshot, THE test suite SHALL structure state as `{components: {[componentId]: stateValue}}` instead of `{controllers: {[controllerId]: stateValue}}`, where the `componentId` key matches the value passed to `buildRemoteController`.
3. WHEN tests verify dispatched actions, THE test suite SHALL assert the payload object contains exactly `{componentId, componentType, action, payload}`, where `componentId` and `componentType` match the values passed at controller construction and `action`/`payload` match the dispatched call arguments.
4. WHEN tests verify subscriber notifications, THE test suite SHALL assert that changing the `components[componentId]` slice triggers the callback, and that changing a different `components[otherComponentId]` slice does not trigger it.
5. WHEN tests verify contract resolution, THE test suite SHALL assert that `buildRemoteController` resolves the Zod contract automatically from `componentType` via `ComponentContractsSchema`, without the caller passing a `contract` option.
6. IF the `componentType` value does not match any entry in `ComponentContractsSchema`, THEN `buildRemoteController` SHALL throw an error indicating the unknown component type.
7. THE test suite SHALL pass without failures when running `pnpm run test` scoped to the thermidor package.

---

### Requirement 10: Schema Round-Trip Validation

**User Story:** As a schema maintainer, I want JSON Schema validation and Zod generation to produce consistent results, so that a document valid according to the JSON Schema is also valid according to the generated Zod schema.

#### Acceptance Criteria

1. FOR ALL valid component contract JSON documents, parsing with the generated Zod `ComponentContractsSchema` then serializing back with `JSON.parse(JSON.stringify(...))` SHALL produce a deep-equal object (property order notwithstanding).
2. WHEN `pnpm run generate` is executed in `thermidor-schema`, THE generation script SHALL exit with code 0 and produce a `src/generated/schemas.ts` file that exports a `ComponentContractsSchema` discriminated union keyed on `componentType`.
3. WHEN `pnpm run validate:schema` is executed in `thermidor-schema`, THE validation script SHALL report zero errors against all JSON Schema files under `schema/base/` and `schema/components/`.
4. WHEN a catalog JSON document references components defined under `schema/components/`, THE Thermidor_Schema SHALL validate it successfully against `base/catalog.schema.json`.
5. IF a document includes a `controllers` property on a component, THEN THE Thermidor_Schema SHALL reject it with a validation error indicating that `controllers` is not a permitted property.
6. WHEN `pnpm run generate:check` is executed in `thermidor-schema`, THE generation script SHALL exit with code 0, confirming that `src/generated/schemas.ts` is up-to-date with the current JSON Schema files.

---

### Requirement 11: Preserve Data Type Backward Compatibility

**User Story:** As a developer using shared types (Product, CartItem, etc.), I want these types to remain identical after the migration, so that nothing breaks in the code that uses them.

#### Acceptance Criteria

1. THE Thermidor_Schema SHALL preserve all definition schemas (`definitions/product.schema.json`, `definitions/cart-item.schema.json`, `definitions/action-item.schema.json`, `definitions/bundle-tier.schema.json`, `definitions/comparison-attribute.schema.json`, `definitions/comparison-product.schema.json`) with identical property names, property types, required fields, and nesting structure as their pre-migration versions.
2. THE Thermidor_Schema SHALL preserve all state shape schemas (CartState, ProductListState, NextActionsState, BundleDisplayState, ComparisonTableState) with identical property names, property types, required fields, and nesting structure as their pre-migration versions.
3. THE Thermidor_Schema SHALL preserve all action payload schemas (SetItemsPayload, UpdateItemQuantityPayload, SelectActionPayload) with identical property names, property types, required fields, and nesting structure as their pre-migration versions.
4. THE Thermidor_Schema SHALL preserve the `base/action.schema.json` structure with identical property names, property types, required fields, and nesting structure as its pre-migration version.
5. THE Thermidor_Schema SHALL generate TypeScript types from the preserved schemas that are structurally identical to the pre-migration types, such that existing consumer code passes type-checking without modification.
6. IF a definition schema, state shape schema, or action payload schema is modified during the migration, THEN THE Thermidor_Schema build SHALL fail, indicating which schema properties differ from their pre-migration baseline.

---

### Requirement 12: Migrate Platform Mock API Response Templates

**User Story:** As a developer running the local dev environment, I want the mock server responses to use the Option B structure (`componentId` + `componentType`, no `controllers`), so that the end-to-end flow exercises the new schema contract.

#### Acceptance Criteria

1. WHEN a schema response template defines component props within an `ActivitySnapshot` `createSurface` message, THE Platform_Mock_API SHALL NOT include a `controllers` property in any component's `props` object across all four affected templates (`schema-response-fallback.ts`, `schema-response-discovery.ts`, `schema-response-comparison.ts`, `schema-response-bundle.ts`).
2. WHEN a schema response template emits a `StateSnapshot`, THE Platform_Mock_API SHALL use `components` as the top-level key (indexed by `componentId`, the globally unique `id` field from the corresponding component nodes in `createSurface`) instead of `controllers` (previously indexed by `controllerId`).
3. WHEN a schema response template previously referenced a controller schema URI constant (e.g., `PRODUCT_LIST_CONTROLLER_SCHEMA`, `NEXT_ACTIONS_CONTROLLER_SCHEMA`, `BUNDLE_CONTROLLER_SCHEMA`, `COMPARISON_TABLE_CONTROLLER_SCHEMA`), THE Platform_Mock_API SHALL remove those constants since `controllerSchema` URIs are no longer part of the transport contract.
4. WHEN a component in a `createSurface` message previously derived its state correlation from `controllerId`, THE Platform_Mock_API SHALL correlate state using the `componentId` (the `id` field of the component node, which is globally unique), e.g., state for a `NextActionsBar` component with id `'next-actions-root'` is stored at `components['next-actions-root']`.
5. WHEN the `StateSnapshot` helper function signature or the `ActivitySnapshot` helper type definitions reference a `controllers` structure, THE Platform_Mock_API SHALL update those type definitions to accept the `components`-keyed structure; IF the helpers are already structure-agnostic (accepting `Record<string, unknown>`), THEN no signature change is required.
6. WHEN the updated mock responses are served to the demo application, THE Platform_Mock_API SHALL produce valid A2-UI transport messages that the Thermidor SDK (using `buildRemoteController` with `componentId` + `componentType`) can consume and render correctly end-to-end.
7. THE Platform_Mock_API SHALL preserve the existing state shape within each component entry (product lists, cart items, comparison data, next-actions, bundle tiers) unchanged — only the indexing key changes from `controllers[controllerId]` to `components[componentId]`.

---

### Requirement 13: Migrate Demo Schema React Sample Consumer

**User Story:** As a developer running the demo-schema-react sample, I want the consumer hook and component renderers to use the new `componentId` + `componentType` API, so that the sample demonstrates the correct Option B usage pattern end-to-end.

#### Acceptance Criteria

1. THE Demo_Schema_React SHALL replace `useAdvertisedController` in `src/a2ui/controllers.tsx` with a `useRemoteController` hook that accepts `(source: RemoteControllerSource, componentId: string, componentType: ComponentType)` and calls `buildRemoteController({source, componentId, componentType})`, removing all references to `ControllerContracts`, `ControllerAdvertisement`, `controllerId`, `controllerSchema`, and `AdvertisedRemoteController`.
2. WHEN a component renderer (ProductCarousel, NextActionsBar, BundleDisplay, ComparisonTable) consumes its controller, THE Demo_Schema_React SHALL call `useRemoteController(stateSource, props.componentId, props.componentType)` instead of `useAdvertisedController(stateSource, props.controllers.X)`, removing all access to `props.controllers`.
3. THE Demo_Schema_React SHALL update the `BundleDisplayRenderer` to resolve nested product-list state via `selectRemoteControllerState(stateSource.state, slot.componentId)` instead of the single-key `selectRemoteControllerState(stateSource.state, slot.surfaceRef)`.
4. THE Demo_Schema_React SHALL update `src/a2ui/controllers.test.ts` to:
   - Remove all imports of `CartControllerContractSchema`, `CartControllerContract`, and controller-based types from `@coveo/thermidor-schema`.
   - Structure mock source state as `{components: {[componentId]: stateValue}}` instead of `{controllers: {[controllerId]: stateValue}}`.
   - Call `buildRemoteController` with `{source, componentId, componentType}` instead of `{source, controllerId, contract}`.
   - Assert dispatched actions contain `{componentId, componentType, action, payload}` instead of `{controllerId, controllerSchema, action, payload}`.
   - Call `selectRemoteControllerState` with the new two-argument signature `(state, componentId)` instead of the two-argument `(state, controllerId)`.
5. THE Demo_Schema_React SHALL update `src/a2ui/components.test.ts` to:
   - Remove all imports of `CartControllerContractSchema`, `ProductListControllerContractSchema`, and controller-based types from `@coveo/thermidor-schema`.
   - Validate `ProductCarouselPropsSchema` with flat `{componentId, componentType}` input instead of nested `{controllers: {productListController: {controllerId, controllerSchema}}}`.
   - Replace controller contract validation tests (`ControllerContractSchema.shape.state`, `ControllerContractSchema.shape.actions`) with component contract equivalents using `ComponentContractsSchema` or the individual component schemas (e.g., `CartSchema.shape.state`, `CartSchema.shape.actions`).
   - Assert that props schema `componentType` literals match the expected values from the component contracts.
6. THE Demo_Schema_React SHALL NOT import `ControllerContracts`, `ControllerContractsSchema`, `CartControllerContractSchema`, `ProductListControllerContractSchema`, `AdvertisedRemoteController`, or `RemoteControllerSchemaId` from any source — enforced by the existing `import-boundary.test.ts` pattern or equivalent.
7. THE Demo_Schema_React SHALL build successfully (`pnpm --filter @samples/thermidor-demo-schema-react build` exits 0) and all tests SHALL pass (`pnpm --filter @samples/thermidor-demo-schema-react test` exits 0) after the migration.
