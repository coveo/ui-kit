# Implementation Plan: thermidor-demo-schema-react

## Overview

Create `samples/thermidor/demo-schema-react` by copying `samples/thermidor/demo-react` wholesale, then refactoring the A2-UI layer to use catalog-based contract-driven rendering with controllers sourced from `@coveo/thermidor-schema` (v2 format). The implementation follows the established pattern from `samples/thermidor/schema-contract-react` (the reference), adapting it for the v2 contract format where:
- The discriminator field is `controllerSchema` (not `schemaId`)
- Props schemas are defined locally (not imported from the contract package)
- Controller contract schemas use PascalCase + `Schema` suffix naming

The refactoring ADDS new files (`controllers.tsx`, `components.tsx`, `surfaces.tsx`) alongside the existing A2-UI infrastructure (`types.ts`, `SurfaceRenderer/`, `ProductCarousel/`, etc.) and modifies `SurfaceRenderer` for hybrid catalog + direct rendering.

## Tasks

- [x] 1. Scaffold sample by copying demo-react and updating identity
  - [x] 1.1 Copy the entire `samples/thermidor/demo-react/` directory to `samples/thermidor/demo-schema-react/`
    - Copy all files and directories recursively
    - Preserve directory structure exactly (src/, public/, configs, index.html, etc.)
    - _Requirements: 1.1, 1.7, 1.8, 1.9_

  - [x] 1.2 Update `samples/thermidor/demo-schema-react/package.json` with new identity and dependencies
    - Change `"name"` to `"@samples/thermidor-demo-schema-react"`
    - Add dependency `"@coveo/thermidor-schema": "workspace:*"`
    - Add dependency `"@copilotkit/a2ui-renderer": "1.61.2"`
    - Add dependency `"zod": "catalog:"`
    - Verify no `@coveo/thermidor-contracts` dependency exists
    - Keep all existing dependencies (`@coveo/thermidor`, `dompurify`, `marked`, `react`, `react-dom`)
    - Keep all devDependencies unchanged
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6, 1.10_

  - [x] 1.3 Run `pnpm install` to resolve workspace dependencies and generate lockfile entries
    - Ensure `@coveo/thermidor-schema` and `@copilotkit/a2ui-renderer` resolve correctly
    - _Requirements: 1.10, 7.8_

- [x] 2. Create the contract-driven A2-UI layer files
  - [x] 2.1 Create `samples/thermidor/demo-schema-react/src/a2ui/controllers.tsx`
    - Adapt the pattern from `samples/thermidor/schema-contract-react/src/a2ui/controllers.tsx`
    - Import `ControllerContracts` type from `@coveo/thermidor-schema` (NOT `@coveo/thermidor-contracts`)
    - Use `ControllerContracts['controllerSchema']` as the discriminator type (v2 format, replaces v1's `ControllerContracts['schemaId']`)
    - Import `buildRemoteController`, `AdvertisedRemoteController`, `RemoteControllerSource` from `@coveo/thermidor`
    - Export type `ControllerAdvertisement<TSchema>` with fields `{controllerId: string; controllerSchema: TSchema}`
    - Export type `EngineStateSource = RemoteControllerSource`
    - Export `useAdvertisedController` hook that calls `buildRemoteController({source, controllerId, contract})` and memoizes with `useMemo`
    - The hook destructures `{controllerId, controllerSchema: contract}` from the advertisement — the field is named `controllerSchema` but the value is passed as `contract` parameter to `buildRemoteController`
    - _Requirements: 3.17, 4.1, 4.2, 4.9, 4.10, 7.1_

  - [x] 2.2 Create `samples/thermidor/demo-schema-react/src/a2ui/components.tsx`
    - Adapt the pattern from `samples/thermidor/schema-contract-react/src/a2ui/components.tsx`
    - Import `createCatalog`, `CatalogDefinitions`, `CatalogRenderers` from `@copilotkit/a2ui-renderer`
    - Import `z` from `zod` (for local props schema construction)
    - Import `useAdvertisedController` and `EngineStateSource` from `./controllers.js`
    - Import `ProductListControllerContractSchema` and `CartControllerContractSchema` from `@coveo/thermidor-schema` (for extracting canonical schema ID literals)
    - **Define props schemas LOCALLY** — do NOT import `productCarouselPropsSchema` or `cartPropsSchema` (they don't exist in `@coveo/thermidor-schema`)
    - Extract schema ID literals: `const PRODUCT_LIST_SCHEMA_ID = ProductListControllerContractSchema.shape.controllerSchema.value` and `const CART_SCHEMA_ID = CartControllerContractSchema.shape.controllerSchema.value`
    - Define `productCarouselPropsSchema = z.strictObject({controllers: z.strictObject({productListController: z.strictObject({controllerId: z.string(), controllerSchema: z.literal(PRODUCT_LIST_SCHEMA_ID)})})})` 
    - Define `cartPropsSchema = z.strictObject({controllers: z.strictObject({cartController: z.strictObject({controllerId: z.string(), controllerSchema: z.literal(CART_SCHEMA_ID)})})})` 
    - Export `THERMIDOR_CATALOG_ID` constant: `'https://schema.thermidor.coveo.com/a2-ui/catalog.json'`
    - Export `thermidorCatalogDefinitions` object satisfying `CatalogDefinitions` with ProductCarousel and Cart entries
    - Export `createThermidorCatalog(stateSource: EngineStateSource)` function:
      - Create renderers satisfying `CatalogRenderers<typeof thermidorCatalogDefinitions>`
      - ProductCarousel renderer: call `useAdvertisedController(stateSource, props.controllers.productListController)`, render product grid from `controller.state?.products ?? []`
      - Cart renderer: call `useAdvertisedController(stateSource, props.controllers.cartController)`, compute `total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)`, render cart lines and total
      - Return `createCatalog(thermidorCatalogDefinitions, renderers, {catalogId: THERMIDOR_CATALOG_ID, includeBasicCatalog: true})`
    - _Requirements: 3.1, 3.2, 3.3, 3.5, 3.6, 3.7, 3.15, 3.16, 3.18, 3.19, 4.3, 4.4, 4.8_

  - [x] 2.3 Create `samples/thermidor/demo-schema-react/src/a2ui/surfaces.tsx`
    - Copy directly from `samples/thermidor/schema-contract-react/src/a2ui/surfaces.tsx` — this file has NO contract-specific imports
    - Exports `getA2UIMessages(activities: Activity[]): A2UIMessage[]` — extracts raw A2-UI operations from Thermidor activities, handles `activity.replace` by clearing accumulated messages
    - Exports `ThermidorA2UISurfaces({messages})` component that:
      - Uses `useA2UI()` from `@copilotkit/a2ui-renderer` to get `{clearSurfaces, processMessages}`
      - On messages change: clears surfaces then calls `processMessages(messages)`
      - Renders `<A2UIRenderer surfaceId={id} />` for each surface ID extracted from the messages
    - Helper `getSurfaceIds(messages)` parses `createSurface`/`deleteSurface` operations to track active surface IDs
    - _Requirements: 3.4, 3.8, 3.10, 3.11, 3.12_

- [x] 3. Wire catalog rendering into the existing app shell
  - [x] 3.1 Modify `samples/thermidor/demo-schema-react/src/a2ui/SurfaceRenderer/SurfaceRenderer.tsx` for hybrid catalog + direct rendering
    - Keep ALL existing imports for BundleDisplay, NextActionsBar, ComparisonTable, ComparisonSummary, Skeleton
    - Keep the existing `parseSurfaceSnapshots` infrastructure, skeleton logic, and `RenderItem` types
    - Remove the ProductCarousel import (`A2UIProductCarousel`) — it's now handled by the catalog
    - Remove `'ProductCarousel'` from the switch statement's case branches
    - Add `'Cart'` to `KNOWN_COMPONENTS` set (it's now recognized but rendered by catalog)
    - In `A2UISurfaceComponent`: for `'ProductCarousel'` and `'Cart'` cases, return `null` (these are rendered by `ThermidorA2UISurfaces` via catalog resolution, not by the SurfaceRenderer)
    - Keep the switch for BundleDisplay, NextActionsBar, ComparisonTable, ComparisonSummary unchanged
    - The catalog-resolved components (ProductCarousel, Cart) are rendered SEPARATELY by `ThermidorA2UISurfaces` in the parent — the `SurfaceRenderer` only needs to NOT render them to avoid duplication
    - _Requirements: 3.4, 3.9, 3.13_

  - [x] 3.2 Wire A2UIProvider and ThermidorA2UISurfaces into the app
    - Modify `samples/thermidor/demo-schema-react/src/App.tsx`:
      - Import `A2UIProvider` from `@copilotkit/a2ui-renderer`
      - Import `createThermidorCatalog` from `./a2ui/components.js`
      - Import `getA2UIMessages`, `ThermidorA2UISurfaces` from `./a2ui/surfaces.js`
      - Follow the schema-contract-react `App.tsx` pattern:
        - Create the catalog once using `createThermidorCatalog(converseController)` where the ConverseController is the `EngineStateSource`
        - Wrap the component tree with `<A2UIProvider catalog={catalog}>`
        - Compute `a2uiMessages` with `useMemo(() => getA2UIMessages(turn?.agentResponse?.activities ?? []), [turn?.agentResponse?.activities])`
        - Render `<ThermidorA2UISurfaces messages={a2uiMessages} />` alongside the existing content
    - The exact integration point depends on how the demo-react shell accesses the ConverseController; if it uses context, create a `CatalogProvider` component in `src/context/catalog.tsx` that:
      - Gets the Converse controller from the existing context
      - Creates the catalog with it as the state source
      - Provides `A2UIProvider` to children
    - Insert `CatalogProvider` inside `GenerativeInterfaceProvider` wrapping `AppShell` in `App.tsx`
    - Place `ThermidorA2UISurfaces` in the conversation page component where catalog surfaces should render
    - _Requirements: 3.4, 3.16, 4.5, 4.6, 4.8_

- [x] 4. Checkpoint - Verify build succeeds
  - Run `pnpm --filter @samples/thermidor-demo-schema-react build` and ensure exit 0
  - Fix any TypeScript compilation errors
  - Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 1.12_

- [x] 5. Create test suites for contract-driven rendering
  - [x] 5.1 Create `samples/thermidor/demo-schema-react/src/a2ui/controllers.test.ts`
    - Adapt the pattern from `samples/thermidor/schema-contract-react/src/a2ui/controllers.test.ts`
    - Import `selectRemoteControllerState`, `buildRemoteController`, `RemoteControllerSource` from `@coveo/thermidor`
    - Import `CartControllerContractSchema` and its types from `@coveo/thermidor-schema` (NOT `@coveo/thermidor-contracts`)
    - Test: `selectRemoteControllerState` selects the advertised controller slice from active turn state; unknown controller returns `{}`
    - Test: CartControllerContract type validates against its Zod schema (`CartControllerContractSchema.parse(...)`) using v2 structure with `controllerSchema` discriminator and nested `actions`
    - Test: `buildRemoteController` dispatches actions via `dispatchAction` with shape `{controllerId, controllerSchema, action, payload}`
    - Use fixed fixtures (inline mock `source` objects), no network, no randomness
    - Gate action dispatch tests if `dispatchAction` unavailable (Porte_Prérequis_Action)
    - _Requirements: 4.1, 4.2, 4.7, 6.12_

  - [x] 5.2 Create `samples/thermidor/demo-schema-react/src/a2ui/components.test.ts`
    - Adapt the pattern from `samples/thermidor/schema-contract-react/src/a2ui/components.test.ts`
    - Import `thermidorCatalogDefinitions`, `productCarouselPropsSchema`, `cartPropsSchema`, `THERMIDOR_CATALOG_ID` from `./components.js`
    - Import `ProductListControllerContractSchema`, `CartControllerContractSchema`, `ProductSchema`, `CartItemSchema` from `@coveo/thermidor-schema`
    - Test group "accepts valid controller advertisements":
      - ProductCarousel props accept `{controllers: {productListController: {controllerId: 'x', controllerSchema: 'https://schema.thermidor.coveo.com/controllers/product-list.schema.json'}}}` → `safeParse.success === true`
      - Cart props accept `{controllers: {cartController: {controllerId: 'x', controllerSchema: 'https://schema.thermidor.coveo.com/controllers/cart.schema.json'}}}` → `safeParse.success === true`
    - Test group "validates Product and CartItem against v2 schema constraints":
      - ProductSchema accepts valid product with `permanentid`, `ec_name`, `additionalFields: {}`
      - ProductSchema rejects `ec_rating: 6` (max 5)
      - CartItemSchema rejects `price: -1` (v2 requires `min(0)`)
      - CartItemSchema accepts `price: 0` (v2 allows 0)
      - CartItemSchema rejects `quantity: 1.5` (v2 requires integer)
      - CartItemSchema rejects `quantity: 0` (v2 requires `min(1)`)
    - Test group "enforces controller contract literals and closed objects":
      - ProductCarousel props reject wrong schema ID (cart schema in productListController) → `safeParse.success === false`
      - Cart props reject extra unexpected properties → `safeParse.success === false` (strictObject)
    - Test group "validates controller state and action contracts (v2 nested actions)":
      - `ProductListControllerContractSchema.shape.state.safeParse({products: [...]})` → success
      - `CartControllerContractSchema.shape.state.safeParse({items: []})` → success
      - `CartControllerContractSchema.shape.actions.shape.setItems.shape.payload.safeParse({items: [valid item]})` → success
      - `CartControllerContractSchema.shape.actions.shape.updateItemQuantity.shape.payload.safeParse({item: {quantity: 0}})` → fails (quantity min 1)
    - Use fixed fixtures, no network, no randomness
    - _Requirements: 3.1, 3.2, 3.3, 3.14, 6.2, 6.3, 6.4, 6.5, 6.11_

  - [x] 5.3 Create `samples/thermidor/demo-schema-react/src/a2ui/surfaces.test.ts`
    - Adapt the pattern from `samples/thermidor/schema-contract-react/src/a2ui/surfaces.test.ts`
    - Import `getA2UIMessages` from `./surfaces.js`
    - Test: passes raw A2-UI operations through and honors `activity.replace` (when `replace: true`, previously accumulated messages are cleared before adding new ones)
    - Test with fixed activity fixtures containing `kind: 'a2ui-surface'` and `payload: {a2ui_operations: [...]}`
    - _Requirements: 3.11, 3.12, 6.6, 6.7_

  - [x] 5.4 Create `samples/thermidor/demo-schema-react/src/a2ui/import-boundary.test.ts`
    - Scan all `.ts` and `.tsx` source files under `src/` recursively
    - Test: No file imports from `@coveo/thermidor-contracts`
    - Test: No file imports from internal paths (`packages/thermidor-schema/src`, `packages/thermidor-schema/schema`, `packages/thermidor-schema/scripts`, `packages/thermidor-schema/generated`)
    - Test: No file imports `productCarouselPropsSchema` or `cartPropsSchema` from `@coveo/thermidor-schema` (these don't exist there)
    - Use `readdirSync` recursively and `readFileSync` to scan; report offending file path and matched pattern on failure
    - _Requirements: 7.1, 7.2, 7.3, 7.5, 7.6, 7.7_

- [x] 6. Final checkpoint - Verify build and all tests pass
  - Run `pnpm --filter @samples/thermidor-demo-schema-react build` and ensure exit 0
  - Run `pnpm --filter @samples/thermidor-demo-schema-react test` and ensure exit 0
  - Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 1.12, 1.13, 6.8, 6.9, 6.10_

## Notes

- All code is TypeScript (React + Vite + Vitest), following existing monorepo conventions
- The `@copilotkit/a2ui-renderer` version `1.61.2` matches the schema-contract-react reference
- **Critical v2 adaptation**: `@coveo/thermidor-schema` does NOT export props schemas (`productCarouselPropsSchema`, `cartPropsSchema`). These must be defined locally in `components.tsx` using `z.strictObject()` with literals extracted from contract schemas.
- **Critical v2 adaptation**: The discriminator field is `controllerSchema` (not `schemaId`). The type is `ControllerContracts['controllerSchema']`.
- **Critical v2 adaptation**: Actions are nested under `actions` field: `CartControllerContractSchema.shape.actions.shape.setItems.shape.payload` instead of top-level `contract.setItems`.
- **Critical pattern from reference**: `surfaces.tsx` provides `getA2UIMessages` and `ThermidorA2UISurfaces` — these handle feeding A2-UI operations to the catalog's `processMessages` pipeline. Without this file, catalog resolution won't work.
- Action bridge scenarios (setItems, updateItemQuantity) are gated/skipped until `dispatchAction` is available on ConverseController (Porte_Prérequis_Action)
- Mock server (`packages/mock-converse-api` on localhost:3456) is reused as-is — no new mock creation needed
- The `dev:mock` script is inherited from demo-react unchanged
- No property-based testing — all validation uses fixed fixtures per Validation_Vitest_Fixe
- `samples/thermidor/demo-react` and `packages/thermidor-schema` must remain completely unmodified
- Tasks marked with `*` are optional and can be skipped for faster MVP
- Checkpoints ensure incremental validation

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["1.3"] },
    { "id": 3, "tasks": ["2.1", "2.3"] },
    { "id": 4, "tasks": ["2.2"] },
    { "id": 5, "tasks": ["3.1", "3.2"] },
    { "id": 6, "tasks": ["5.1", "5.2", "5.3", "5.4"] }
  ]
}
```
