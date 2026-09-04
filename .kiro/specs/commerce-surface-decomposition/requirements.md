# Requirements Document

## Introduction

This feature decomposes the monolithic `ProductSearchSurface` / `ProductListingSurface` A2-UI root component into individual, independently-stateful A2-UI components (productList, pagination, sort, searchBox). Routing and layout decisions are driven by an explicit `surfaceType` field on the `createSurface` payload, eliminating the need for `CommerceInterfaceImpl` hydration, Redux store population, and headless controller instantiation. Commerce search surfaces are rendered through the same A2-UI catalog/renderer pipeline already used for converse surfaces.

## Glossary

- **Surface_Processor**: The Thermidor internal module (`unified-surface-processor.ts`) responsible for receiving A2-UI operations from the backend stream and determining how to process them (hydration, navigation signals, lifecycle management).
- **Surface_Hydration**: The current process (`unified-surface-hydration.ts`) that creates a `CommerceInterfaceImpl`, populates a Redux store via response handlers, and returns a live interface for headless controllers.
- **A2UI_Renderer**: The `@copilotkit/a2ui-renderer` pipeline that resolves catalog component types to React renderers and provides surface-level rendering. Already used for converse surfaces (ProductCarousel, BundleDisplay, etc.).
- **Remote_Controller**: The `buildRemoteController` abstraction that subscribes to server-pushed component state and exposes `dispatch` for sending actions back through the unified stream.
- **Surface_Type**: An explicit string discriminant on the `createSurface` payload that declares the semantic purpose of a surface (e.g., `commerceSearch`, `converse`), used for routing and layout selection.
- **Routed_Interface**: The current mechanism that carries a hydrated `CommerceInterfaceImpl` instance from the Surface_Processor to the navigation layer and then to `SearchResultsPage` for headless controller instantiation.
- **Catalog_Renderer**: A React component registered in the A2-UI catalog that renders a specific `componentType` using state and actions provided by a Remote_Controller.
- **Layout_Template**: A React component that arranges A2-UI rendered components into spatial slots (header, sidebar, main) based on the Surface_Type.
- **Demo_App**: The `samples/thermidor/demo-schema-react` sample application.
- **Thermidor_Schema**: The `packages/thermidor-schema` package containing Zod schemas for A2-UI component contracts.
- **Mock_API**: The `packages/platform-mock-api` package providing mock backend responses for development and testing.

## Requirements

### Requirement 1: surfaceType field on createSurface payload

**User Story:** As a renderer developer, I want the `createSurface` payload to declare a `surfaceType`, so that I can determine which page layout to render without inspecting individual component names.

#### Acceptance Criteria

1. THE Thermidor_Schema SHALL define a `surfaceType` field on the `createSurface` payload schema with allowed values `commerceSearch` and `converse`.
2. WHEN a `createSurface` message includes a `surfaceType` field, THE Surface_Processor SHALL extract and propagate the `surfaceType` value to the navigation signal layer.
3. WHEN a `createSurface` message omits the `surfaceType` field, THE Surface_Processor SHALL treat the surface as having no routed navigation (equivalent to current behavior for unknown component types).
4. THE Mock_API SHALL include a valid `surfaceType` value in all `createSurface` responses for commerce search scenarios.

### Requirement 2: Navigation via surfaceType replaces root component inspection

**User Story:** As a Thermidor maintainer, I want navigation decisions to use `surfaceType` instead of checking for a root component named `ProductSearchSurface`, so that the routing logic is decoupled from component structure.

#### Acceptance Criteria

1. WHEN the Surface_Processor receives a `createSurface` operation with `surfaceType` equal to `commerceSearch`, THE Surface_Processor SHALL signal a routed navigation event to the state port.
2. WHEN the Surface_Processor receives a `createSurface` operation with `surfaceType` equal to `converse`, THE Surface_Processor SHALL NOT signal a routed navigation event.
3. THE Surface_Processor SHALL NOT use the `getStatefulCommerceRootKind` function or the `hasStatefulCommerceRootComponent` function for any purpose in the decomposed surface module.
4. THE Demo_App navigation hook SHALL continue receiving navigation signals and routing to the search results page without code changes to the hook itself (the signal mechanism remains the same; only the internal trigger changes).

### Requirement 3: Decomposed commerce components in createSurface

**User Story:** As a renderer developer, I want the backend to send individual component entries (productList, pagination, sort, searchBox) in the `createSurface` components array, so that each component carries its own state independently.

#### Acceptance Criteria

1. WHEN the Mock_API emits a `commerceSearch` surface, THE Mock_API SHALL include separate component entries for `productList`, `pagination`, `sort`, and `searchBox` in the `components` array.
2. THE `productList` component entry SHALL carry a `state` object containing a `products` array.
3. THE `pagination` component entry SHALL carry a `state` object containing `page`, `pageSize`, `totalEntries`, and `totalPages` fields.
4. THE `sort` component entry SHALL carry a `state` object containing `appliedSort` and `availableSorts` fields.
5. THE `searchBox` component entry SHALL carry a `state` object containing a `query` string field.
6. THE Mock_API SHALL NOT emit a monolithic `ProductSearchSurface` root component for commerce search scenarios once decomposition is complete.
7. IF a `commerceSearch` surface includes only a subset of the decomposed components (e.g., only `productList` and `pagination`), THE Surface_Processor and Demo_App SHALL handle the partial component set without error.

### Requirement 4: Eliminate CommerceInterfaceImpl hydration for decomposed surfaces

**User Story:** As a Thermidor maintainer, I want decomposed commerce surfaces to bypass `CommerceInterfaceImpl` hydration, so that state flows directly from A2-UI component state rather than through a hydrated Redux store.

#### Acceptance Criteria

1. WHEN the Surface_Processor receives a `createSurface` operation with a recognized `surfaceType` and decomposed components, THE Surface_Processor SHALL NOT instantiate a `CommerceInterfaceImpl`.
2. WHEN the Surface_Processor receives a `createSurface` operation with a recognized `surfaceType` and decomposed components, THE Surface_Processor SHALL NOT call `createCommerceSearchEndpointResponseHandler` or `hydrateFromCreateSurface`.
3. WHEN the Surface_Processor receives a `createSurface` operation with a recognized `surfaceType` and decomposed components, THE Surface_Processor SHALL NOT store a hydration snapshot in the engine.
4. THE navigation signal for decomposed commerce surfaces SHALL carry the `surfaceType` and `surfaceId` without carrying a `CommerceInterfaceImpl` instance.

### Requirement 5: Eliminate headless controller usage in SearchResultsPage

**User Story:** As a demo app developer, I want SearchResultsPage to render commerce components through the A2-UI renderer instead of instantiating headless controllers, so that the rendering path is consistent with converse surfaces.

#### Acceptance Criteria

1. THE Demo_App SearchResultsPage SHALL NOT call `buildProductListController`, `buildPaginationController`, or `buildSortController`.
2. THE Demo_App SearchResultsPage SHALL NOT receive or consume a `CommerceInterfaceImpl` instance via props or context.
3. THE Demo_App SearchResultsPage SHALL render decomposed commerce components (productList, pagination, sort, searchBox) through their respective Catalog_Renderers via the A2UI_Renderer pipeline.
4. WHEN a decomposed component's state is updated by the backend, THE Catalog_Renderer for that component SHALL reflect the updated state through its Remote_Controller subscription.

### Requirement 6: SearchResultsPage as a layout template

**User Story:** As a renderer developer, I want SearchResultsPage to act as a layout shell that places A2-UI rendered components into spatial slots, so that the layout is driven by surfaceType and decoupled from data fetching.

#### Acceptance Criteria

1. WHEN the Demo_App navigates to the search results view for a `commerceSearch` surface, THE Layout_Template SHALL arrange components into header (searchBox) and main (sort, productList, pagination) slots.
2. THE Layout_Template SHALL use `componentType` to identify and place components into the correct spatial slots, but SHALL NOT access component state or actions directly. State and actions are consumed exclusively by the Catalog_Renderers.
3. IF a component entry is absent from the surface's components array, THEN THE Layout_Template SHALL render the corresponding slot as empty without error.

### Requirement 7: Commerce catalog renderers for decomposed components

**User Story:** As a demo app developer, I want catalog renderers for productList, pagination, sort, and searchBox, so that these components render correctly when the A2-UI renderer resolves them from the catalog.

#### Acceptance Criteria

1. THE Demo_App SHALL register a Catalog_Renderer for `productList` that renders a product grid from the component's state via Remote_Controller.
2. THE Demo_App SHALL register a Catalog_Renderer for `pagination` that renders page controls from the component's state via Remote_Controller.
3. THE Demo_App SHALL register a Catalog_Renderer for `sort` that renders sort options from the component's state via Remote_Controller.
4. THE Demo_App SHALL register a Catalog_Renderer for `searchBox` that renders a search input from the component's state via Remote_Controller.
5. THE Remote_Controller SHALL support dispatching actions both from user interactions and programmatically. WHEN an interaction affects application state (e.g., changes page, changes sort), THE Catalog_Renderer SHALL dispatch the corresponding action through the Remote_Controller, which sends it back through the unified stream. Non-state-changing interactions (e.g., hover effects, input focus) SHALL be handled locally without dispatching.

### Requirement 8: Component schema definitions for decomposed commerce components

**User Story:** As a schema maintainer, I want Zod schemas for the props and state of each decomposed commerce component, so that the contract between backend and renderer is validated at compile time.

#### Acceptance Criteria

1. THE Thermidor_Schema SHALL define a props schema for `productList` including `componentId`, `componentType`, and state fields for `products`.
2. THE Thermidor_Schema SHALL define a props schema for `pagination` including `componentId`, `componentType`, and state fields for `page`, `pageSize`, `totalEntries`, and `totalPages`.
3. THE Thermidor_Schema SHALL define a props schema for `sort` including `componentId`, `componentType`, and state fields for `appliedSort` and `availableSorts`.
4. THE Thermidor_Schema SHALL define a props schema for `searchBox` including `componentId`, `componentType`, and state fields for `query`.
5. FOR ALL decomposed commerce component schemas, parsing a valid props object then serializing then parsing again SHALL produce an equivalent object (round-trip property).

### Requirement 9: Actions dispatched through the unified stream

**User Story:** As a renderer developer, I want user interactions on decomposed commerce components to dispatch actions back through the converse/unified stream, so that the backend remains the source of truth for state coherence.

#### Acceptance Criteria

1. WHEN a user changes the page in the pagination Catalog_Renderer, THE Remote_Controller SHALL dispatch a page-change action through the unified stream to the backend.
2. WHEN a user changes the sort order in the sort Catalog_Renderer, THE Remote_Controller SHALL dispatch a sort-change action through the unified stream to the backend.
3. WHEN a user submits a query in the searchBox Catalog_Renderer, THE Remote_Controller SHALL dispatch a query-submit action through the unified stream to the backend.
4. WHEN the backend processes a dispatched action and pushes updated state for a component via the stream, THE Catalog_Renderer for that component SHALL re-render with the new state received through its Remote_Controller. IF the backend response does not include updated state for a given component, THAT component SHALL NOT re-render.

### Requirement 10: Backward compatibility with clean module separation

**User Story:** As a Thermidor maintainer, I want the legacy monolithic hydration path to be cleanly separated from the new decomposed path in distinct modules, so that the legacy code can be removed in a single file-deletion operation when the backend fully migrates.

#### Acceptance Criteria

1. THE Surface_Processor SHALL delegate `createSurface` operations to one of two distinct modules based on the presence of the `surfaceType` field: surfaces with a `surfaceType` field SHALL always be routed to the decomposed surface module regardless of other payload contents, and surfaces without `surfaceType` SHALL be evaluated for legacy routing.
2. THE legacy surface module SHALL encapsulate all `CommerceInterfaceImpl` hydration logic, `getStatefulCommerceRootKind` checks, `hasStatefulCommerceRootComponent` checks, and Redux store population in a single file that can be deleted without affecting the decomposed path.
3. THE decomposed surface module SHALL have no imports from or dependencies on the legacy surface module.
4. WHEN a `createSurface` operation includes a `surfaceType` field, THE Surface_Processor SHALL route it exclusively to the decomposed surface module regardless of the presence of a root component.
5. WHEN a `createSurface` operation omits the `surfaceType` field but contains a root component named `ProductSearchSurface` or `ProductListingSurface`, THE Surface_Processor SHALL route it to the legacy surface module. WHEN a `createSurface` operation omits the `surfaceType` field and does NOT contain a recognized legacy root component, THE Surface_Processor SHALL NOT route it to either module for commerce processing.
6. THE Surface_Processor SHALL log a deprecation warning when routing a surface to the legacy module.
7. WHEN the legacy surface module is deleted in a future cleanup, THE Surface_Processor and decomposed surface module SHALL continue to compile and function without modification beyond removing the legacy branch and import.
