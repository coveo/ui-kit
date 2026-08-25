# Implementation Plan: Commerce Surface Decomposition

## Overview

This plan decomposes the monolithic `ProductSearchSurface` into individually-stateful A2-UI components (`productList`, `pagination`, `sort`, `searchBox`) rendered through the existing catalog/renderer pipeline. Implementation proceeds in dependency order: schema definitions first, then runtime routing, mock API adaptation, and finally demo app renderers/layout.

## Tasks

- [x] 1. Define commerce component schemas in thermidor-schema
  - [x] 1.1 Add `SurfaceTypeSchema` and `surfaceType` field to the createSurface payload schema
    - Define `SurfaceTypeSchema` as `z.enum(['commerceSearch', 'converse'])` in `packages/thermidor-schema/src/generated/schemas.ts`
    - Export the `SurfaceType` type
    - The field is optional on the createSurface payload (existing code uses a JSON Schema → Zod generation pipeline; add the field to the generated output)
    - _Requirements: 1.1_

  - [x] 1.2 Add props schemas for decomposed commerce components
    - Add `ProductListPropsSchema` with `componentId: z.string()` and `componentType: z.literal('product-list')`
    - Add `PaginationPropsSchema` with `componentId: z.string()` and `componentType: z.literal('pagination')`
    - Add `SortPropsSchema` with `componentId: z.string()` and `componentType: z.literal('sort')`
    - Add `SearchBoxPropsSchema` with `componentId: z.string()` and `componentType: z.literal('search-box')`
    - Export corresponding TypeScript types
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [x] 1.3 Add contract schemas for decomposed commerce components
    - Add `ProductListContractSchema` (componentType `'product-list'`, state: `{ products: z.array(ProductSchema) }`, actions: `{}`)
    - Add `PaginationContractSchema` (componentType `'pagination'`, state: `{ page, pageSize, totalEntries, totalPages }`, actions: `{ selectPage: { payload: { page } } }`)
    - Add `SortContractSchema` (componentType `'sort'`, state: `{ appliedSort, availableSorts }`, actions: `{ setSort: { payload: { sortCriteria, fields } } }`)
    - Add `SearchBoxContractSchema` (componentType `'search-box'`, state: `{ query }`, actions: `{ submitQuery: { payload: { query } } }`)
    - Extend the `ComponentContractsSchema` discriminated union to include all four new schemas
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 8.1, 8.2, 8.3, 8.4_

  - [x] 1.4 Write property test for schema round-trip (Property 4)
    - **Property 4: Schema round-trip for decomposed component props**
    - Use fast-check arbitraries to generate valid props/state objects for each schema
    - Verify `parse → serialize → parse` produces an equivalent object
    - Minimum 100 iterations
    - **Validates: Requirements 8.5**

- [x] 2. Implement surfaceType-based routing in unified-runtime.ts
  - [x] 2.1 Add `extractSurfaceType` and `extractSurfaceId` helper functions
    - Add to `packages/thermidor/src/internal/api/unified/unified-runtime.ts` (or a co-located utility)
    - `extractSurfaceType` iterates operations in the A2-UI content, finds `createSurface`, returns `surfaceType` string or `undefined`
    - `extractSurfaceId` extracts `surfaceId` from the `createSurface` operation, returns empty string if missing
    - _Requirements: 1.2, 1.3_

  - [x] 2.2 Modify the `onA2uiSurface` callback to route by surfaceType
    - In `consumeStream`, update the `onA2uiSurface` callback:
      - Call `extractSurfaceType(content)` first
      - If `surfaceType` is present and equals `'commerceSearch'`: call `this.statePort.setRoutedInterface(tid, { useCase: 'decomposedCommerce', surfaceType, surfaceId })` — no SurfaceProcessor call
      - If `surfaceType` is present but not `'commerceSearch'` (e.g., `'converse'`): do nothing (no navigation signal, no SurfaceProcessor)
      - If `surfaceType` is absent: delegate to `this.surfaceProcessor.processSnapshot(tid, content)` (existing legacy path)
    - _Requirements: 2.1, 2.2, 2.3, 4.1, 4.2, 4.3, 4.4, 10.1, 10.3, 10.4_

  - [x] 2.3 Extend `RoutedInterface` / `RoutedUseCase` types for decomposed commerce
    - Add `'decomposedCommerce'` to `RoutedUseCase` (or extend the type union with a new variant)
    - The new variant carries `{ useCase: 'decomposedCommerce'; surfaceType: 'commerceSearch'; surfaceId: string }` — no `CommerceInterfaceImpl` instance
    - Update `UseCaseInterfaceMap` if needed (the decomposed variant has no `interface` field, so it may need a separate union branch)
    - _Requirements: 4.4, 5.2_

  - [x] 2.4 Write unit tests for `extractSurfaceType` and `extractSurfaceId`
    - Test extraction from valid payloads, missing field, malformed content
    - _Requirements: 1.2, 1.3_

  - [x] 2.5 Write property tests for routing logic (Properties 1, 2, 3, 5)
    - **Property 1: surfaceType routing exclusivity** — if `surfaceType` is present, SurfaceProcessor is never called
    - **Property 2: Legacy routing by absence of surfaceType** — if `surfaceType` is absent, SurfaceProcessor is called
    - **Property 3: Decomposed surfaces never trigger hydration** — surfaceType present → no CommerceInterfaceImpl, no hydrateFromCreateSurface
    - **Property 5: Navigation signal for commerceSearch** — commerceSearch → setRoutedInterface called; converse → not called
    - Use fast-check to generate arbitrary createSurface payloads with/without surfaceType
    - Minimum 100 iterations per property
    - **Validates: Requirements 1.2, 2.1, 2.2, 2.3, 4.1, 4.2, 4.3, 10.1, 10.4, 10.5**

- [x] 3. Checkpoint - Ensure schema and routing tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Update mock API to emit decomposed commerce surfaces
  - [x] 4.1 Refactor `schema-response-search.ts` to emit decomposed components with surfaceType
    - Change the `createSurface` message to include `surfaceType: 'commerceSearch'`
    - Replace the monolithic `{id: 'root', component: 'ProductSearchSurface'}` with individual component entries:
      - `{ id: 'search-box-1', component: 'search-box', props: { componentId: 'search-box-1', componentType: 'search-box' } }`
      - `{ id: 'product-list-1', component: 'product-list', props: { componentId: 'product-list-1', componentType: 'product-list' } }`
      - `{ id: 'pagination-1', component: 'pagination', props: { componentId: 'pagination-1', componentType: 'pagination' } }`
      - `{ id: 'sort-1', component: 'sort', props: { componentId: 'sort-1', componentType: 'sort' } }`
    - Move state data from `dataModel` into the component state delivered through the A2-UI renderer state source (or keep on props as appropriate for the existing RemoteController pattern)
    - Remove the monolithic `ProductSearchSurface` root component
    - _Requirements: 1.4, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [x] 4.2 Write unit tests verifying mock API response structure
    - Validate the emitted response matches the new decomposed schema (surfaceType present, individual components, no monolithic root)
    - _Requirements: 1.4, 3.1, 3.6_

- [x] 5. Implement commerce catalog renderers in demo app
  - [x] 5.1 Create `ProductListRenderer` catalog renderer
    - Create `samples/thermidor/demo-schema-react/src/a2ui/ProductList/ProductList.tsx`
    - Follow the `ProductCarouselRenderer` pattern: receive props, call `useRemoteController`, render product grid from `controller.state.products`
    - _Requirements: 7.1, 5.3_

  - [x] 5.2 Create `PaginationRenderer` catalog renderer
    - Create `samples/thermidor/demo-schema-react/src/a2ui/Pagination/Pagination.tsx`
    - Render page controls from `controller.state` (page, pageSize, totalEntries, totalPages)
    - Dispatch `selectPage` action on page change via `controller.dispatch`
    - _Requirements: 7.2, 9.1_

  - [x] 5.3 Create `SortRenderer` catalog renderer
    - Create `samples/thermidor/demo-schema-react/src/a2ui/Sort/Sort.tsx`
    - Render sort options from `controller.state` (appliedSort, availableSorts)
    - Dispatch `setSort` action on sort change via `controller.dispatch`
    - _Requirements: 7.3, 9.2_

  - [x] 5.4 Create `SearchBoxRenderer` catalog renderer
    - Create `samples/thermidor/demo-schema-react/src/a2ui/SearchBox/SearchBox.tsx`
    - Render search input from `controller.state.query`
    - Dispatch `submitQuery` action on submit via `controller.dispatch`
    - _Requirements: 7.4, 9.3_

  - [x] 5.5 Register all commerce renderers in the catalog
    - Import new props schemas from `@coveo/thermidor-schema`
    - Add catalog definitions for `ProductList`, `Pagination`, `Sort`, `SearchBox` in `components.tsx`
    - Add renderer mappings in `createThermidorCatalog()`
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [x] 5.6 Write unit tests for catalog renderers
    - Mock `useRemoteController`, verify state rendering and action dispatch for each renderer
    - Test that action dispatch calls `controller.dispatch` with correct action name and payload
    - **Validates: Requirements 7.5, 9.1, 9.2, 9.3, 9.4**

- [x] 6. Implement layout template and refactor SearchResultsPage
  - [x] 6.1 Create `DecomposedCommerceLayout` component
    - Create a layout shell component that receives `surfaceId` and `surfaceType`
    - Find components from A2-UI surface state by `componentType`
    - Arrange into spatial slots: header (search-box), main (sort, product-list, pagination)
    - Render each slot's catalog renderer via the A2-UI renderer pipeline
    - Render absent component slots as empty without error
    - _Requirements: 6.1, 6.2, 6.3, 5.3_

  - [x] 6.2 Refactor `SearchResultsPage` to branch on `routedInterface.useCase`
    - When `routedInterface.useCase === 'decomposedCommerce'`: render `DecomposedCommerceLayout`
    - When `routedInterface.useCase === 'commerceSearch'` (legacy): render existing headless-controller-based UI
    - Remove no-longer-needed headless controller imports from the decomposed path
    - _Requirements: 5.1, 5.2, 5.3, 6.1_

  - [x] 6.3 Write unit tests for layout template partial component handling (Property 6)
    - **Property 6: Partial component set handling**
    - Render layout with various subsets of the four components
    - Verify no errors and correct slot rendering
    - **Validates: Requirements 3.7, 6.3**

- [x] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Verify backward compatibility and module isolation
  - [x] 8.1 Verify legacy path still works (no regressions)
    - Ensure surfaces without `surfaceType` still route to SurfaceProcessor
    - Run existing `unified-surface-processor.test.ts` and `unified-runtime.test.ts` — they must pass without modification
    - _Requirements: 10.2, 10.5, 10.7_

  - [x] 8.2 Write import boundary test for module isolation
    - Verify the new routing code in `unified-runtime.ts` (the surfaceType branch) has no imports from `unified-surface-hydration.ts`
    - Follow the pattern in `samples/thermidor/demo-schema-react/src/a2ui/import-boundary.test.ts`
    - _Requirements: 10.3_

  - [x] 8.3 Write property test for event dispatcher ordering (Property 7)
    - **Property 7: A2-UI content is always delivered regardless of path**
    - Verify `appendSurface` and `appendActivity` are called before `onA2uiSurface` for any ACTIVITY_SNAPSHOT event
    - Minimum 100 iterations
    - **Validates: Requirements 5.3, 5.4**

- [x] 9. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- `unified-surface-processor.ts` is NOT modified — it remains the untouched legacy path
- The main thermidor change is concentrated in `unified-runtime.ts` (the `onA2uiSurface` callback)
- Commerce catalog renderers follow the same `useRemoteController` pattern as `ProductCarouselRenderer`
- The `RoutedInterface` type must be extended with a `'decomposedCommerce'` variant that carries no `CommerceInterfaceImpl` instance

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["1.3", "1.4"] },
    { "id": 2, "tasks": ["2.1", "2.3"] },
    { "id": 3, "tasks": ["2.2", "2.4", "4.1"] },
    { "id": 4, "tasks": ["2.5", "4.2", "5.1", "5.2", "5.3", "5.4"] },
    { "id": 5, "tasks": ["5.5", "5.6"] },
    { "id": 6, "tasks": ["6.1"] },
    { "id": 7, "tasks": ["6.2", "6.3"] },
    { "id": 8, "tasks": ["8.1", "8.2", "8.3"] }
  ]
}
```
