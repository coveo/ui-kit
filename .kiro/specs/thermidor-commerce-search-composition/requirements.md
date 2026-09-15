# Requirements Document

## Introduction

This feature — `thermidor-commerce-search-composition` (KIT-6147 track #2) — mounts the **real A2-UI adjacency-list composition tree end-to-end through the CopilotKit renderer** in the `samples/thermidor/demo-schema-react` sample, and updates the `packages/platform-mock-api` Thermidor mock templates so the emitted surfaces can be mounted by id.

It is the direct follow-up to `thermidor-schema-adjacency-list` (KIT-6147 track #1), which is a **prerequisite** and is assumed complete. Track #1 is **purely additive and schema-centric**: it delivered the schema contract additions (`children`/`child` optional on the base component contract, the `Composition_Snapshot_Contract` with `rootId` plus its `CompositionSnapshotEntry` view, the `commerce-search` surface-root component type, the regenerated Zod projection, and the widened SDK union). Track #1 delivered **only** those non-breaking schema additions. Track #1 deliberately left the runtime unchanged: it left `facetIds` on `FacetManagerState` and `surfaceRef` on the bundle slots **unchanged**, left the mock templates **unchanged** (they still emit `facetIds` in the facet-manager AG-UI state and `surfaceRef` on the bundle slots, and do **not** yet place `children`/`child`/`rootId` on the A2-UI component nodes), and left the `demo-schema-react` renderers (`FacetManager`, `BundleDisplay`) **unchanged** (still using the current "Scenario X" mechanism of `main`). Track #1 did **not** mount any tree via CopilotKit's `children(id)`, did **not** resolve the "root mapping" problem, and did **not** remove any composition from AG-UI state. This spec (#2) starts from that state and owns the **entire adjacency-list switchover** on the runtime side.

**Real state of `main` this spec starts from:**
- `FacetManager.tsx` reads facet ordering via `const {facetIds} = controller.state` (AG-UI state) and additionally receives a `childComponents: Map` prop.
- `BundleDisplay.tsx` reads `slot.surfaceRef` and calls `selectRemoteControllerState(..., slot.surfaceRef)` to obtain products.
- The mock templates emit `facetIds` in the facet-manager state and `surfaceRef` on the bundle slots; they do **not** yet emit `children`/`child`/`rootId` on the A2-UI component nodes.
- No `resolveChildIds` workaround exists.

**What this spec (#2) owns.** Because track #1 is additive-only, this spec performs the full switchover: (a) it **removes** `facetIds` from `FacetManagerState` in the `@coveo/thermidor-schema` contract and migrates facet ordering to `children` on the `facet-manager` A2-UI node, and **removes** `surfaceRef` from the bundle slots and migrates it to `children` on the bundle root (the product-lists become A2-UI nodes referenced by the bundle root); (b) it places `children`/`child`/`rootId` on the A2-UI component nodes emitted by the mock `createSurface.components[]`, moving composition out of the AG-UI state; (c) it resolves the root mapping so the renderer mounts surfaces whose declared root id is not `"root"`; and (d) it converts `CommerceSearch`, `FacetManager`, and `BundleDisplay` into true A2-UI renderers that mount their children via `children(id)`, removing the `childComponents` map / `EMPTY_CHILD_COMPONENTS` remnants.

The rendering path is `@copilotkit/a2ui-renderer` (v1.61.2). Its renderer contract is `RendererProps<T> = { props: T; children: (id: string) => React.ReactNode; dispatch?: (action) => void }`: a custom catalog renderer receives a `children(id)` function that mounts any child component by its id — the native adjacency-list mounting mechanism. The renderer begins the tree at a component whose `id` is literally `"root"` (it mounts a deferred child with `id: "root"`). The established obstacle — the **root mapping problem** — is that the mock surfaces declare real root ids such as `commerce-search-2` (via `createSurface.rootId`) and `bundle-root`, not `"root"`, so the renderer cannot locate the root of a decomposed surface unless the root id is mapped to `"root"` (or an equivalent mechanism is introduced). The `convertV1ToV09` adapter in `surfaces.tsx` (which flattens each v1.0 message to the v0.9 shape the renderer understands, so `children`/`child` on the A2-UI node already survive into the v0.9 `{id, component, children}` node) is the expected place to resolve this mapping and to ensure every child node of a decomposed surface is emitted as a v0.9 component.

The model this feature realizes: **composition lives on the A2-UI plane** (which components exist, what contains what, in what order, via `children`/`child`/`rootId` on the A2-UI component nodes), while **per-component data lives on the AG-UI plane** (`state` keyed by `componentId`); the two planes are correlated **only** by `componentId` (ADR-002, ADR-006, ADR-007). The renderers walk the A2-UI composition to decide *what to mount and in what order*, and read AG-UI state by `componentId` to decide *what to show*.

Scope of this spec:
1. Remove `facetIds` from `FacetManagerState` in the `@coveo/thermidor-schema` contract and migrate facet ordering to `children` on the `facet-manager` A2-UI node; remove `surfaceRef` from the bundle slots and migrate it to `children` on the bundle root.
2. Resolve the root mapping so the renderer mounts surfaces whose declared root id is not `"root"` (decomposed `commerce-search`, `bundle-display`).
3. Ensure the mock `createSurface.components[]` emits every node of each decomposed surface (root + search box + facet manager + product list + sort + pagination + each facet, and the bundle slot product-lists) with its `children`/`child`/`rootId` on the A2-UI plane, moving composition out of the AG-UI state, so the renderer can mount the whole tree by id.
4. Convert `CommerceSearch`, `FacetManager`, and `BundleDisplay` into true A2-UI renderers that mount their children through `children(id)` in `children` order, reading composition from the A2-UI renderer props (never from AG-UI state).
5. Preserve the AG-UI/A2-UI boundary: `children`/`child`/`rootId` are never read from or written to AG-UI state; per-component data stays in AG-UI keyed by `componentId`.
6. Register the required catalog entries/renderers (notably `CommerceSearch`) in `components.tsx` and remove the now-unnecessary workaround remnants (e.g. the fabricated `childComponents: Map` / `EMPTY_CHILD_COMPONENTS`).
7. Keep the sample building and passing its tests; keep `samples/thermidor/demo-react` (the real-backend sample) untouched and passing; keep the mock payloads valid against the track #1 schema (`CompositionSnapshot` / the `CompositionSnapshotEntry` view).
8. Remove the `surfaceType` field (`Surface_Type_Field`) that `commerce-surface-decomposition` introduced to carry surface-routing intent, and route navigation on the `componentType` of the Root_Component (the ADR-007 model, where the root's `componentType` carries the intent a separate `surfaceType` concept would otherwise carry — ADR-007 Annex A §4.3). This spans three layers: (a) the `@coveo/thermidor` SDK — remove `surfaceType` from `CreateSurfacePayload` and its validation, remove `extractSurfaceType`, and remove the `surfaceType`-based branch of `onA2uiSurface`, adapting the affected SDK tests; (b) the `packages/platform-mock-api` mock templates — remove `surfaceType` from the five templates that emit it; (c) the `demo-schema-react` sample — replace all `surfaceType`-based routing in `use-navigation.ts` with routing derived from the Root_Component's `componentType`, where a `commerce-search` root routes to the search-results page and every other root `componentType` (as well as the absence of a surface) routes to inline conversation. Because `commerce-surface-decomposition` (a separate, completed spec) introduced `surfaceType`, this spec deliberately and knowingly partially unwinds that earlier spec in favor of the ADR-007 model.

Out of scope: broad modification of the `@coveo/thermidor-schema` contract (this spec **consumes** the track #1 contract as delivered) — with **one explicitly permitted schema change**: removing `facetIds` from `FacetManagerState` (and the associated Zod regeneration and changeset), because facet ordering moves onto the A2-UI `children` plane. The `@coveo/thermidor` SDK is likewise modified beyond merely consuming the widened union: this spec **explicitly permits** removing `facetIds`-related consumption **and** removing `surfaceType` from `CreateSurfacePayload` (its validation, the `extractSurfaceType` helper, and the `surfaceType`-based routing branch of `onA2uiSurface`, with the affected SDK tests adapted), because surface-routing intent moves onto the Root_Component's `componentType`. In short, the SDK carries several permitted changes (`facetIds` and `surfaceType`), not a single one. Also out of scope: any change to `samples/thermidor/demo-react` (the Real_Backend_Sample stays untouched and unchanged); backend/server payload work; broader consolidation of composition cases beyond the two decomposed surfaces named here.

**Action wiring scope note.** This spec does **not** change how component actions are wired. Actions remain dispatched through the current mechanism (`useRemoteController`/`dispatchAction` / the CopilotKit renderer `dispatch`); mounting children via the Children_Mount_Function changes only *what is mounted and in what order*, not how a mounted component dispatches actions.

**Constraints and source of truth.** The behavior of `@copilotkit/a2ui-renderer` v1.61.2 (how it locates the surface root, how a custom renderer receives `children(id)`, and how a renderer accesses its own node's child ids) is the decisive technical unknown. The acceptance criteria below capture these as **verifiable outcomes** (e.g. "the renderer mounts a surface whose root id is not `root`") without over-specifying the implementation mechanism. ADR-002, ADR-006, and ADR-007 (with Annex A) are the source of truth for the plane boundary; where this document and the ADRs disagree, the ADRs prevail. `samples/thermidor/demo-react` must not be modified and must keep building and passing its tests.

## Glossary

- **A2UI_Renderer**: The `@copilotkit/a2ui-renderer` package (v1.61.2) that mounts A2-UI surfaces in the `demo-schema-react` sample. Its custom-renderer contract is `RendererProps<T> = { props: T; children: (id: string) => React.ReactNode; dispatch?: (action) => void }`.
- **Children_Mount_Function**: The `children` function of type `(id: string) => React.ReactNode` passed to a custom renderer by the A2UI_Renderer; calling it with a component id mounts that component (the native adjacency-list mounting mechanism).
- **Renderer_Root_Id**: The literal component id `"root"` at which the A2UI_Renderer begins mounting a surface's tree.
- **Declared_Root_Id**: The real component id a mock surface declares as the top of its composition tree via `createSurface.rootId` (e.g. `commerce-search-2`, `bundle-root`), which is not equal to the Renderer_Root_Id.
- **Root_Mapping**: The mechanism that lets the A2UI_Renderer locate and mount a surface whose Declared_Root_Id is not equal to the Renderer_Root_Id.
- **Surface_Bridge**: The `samples/thermidor/demo-schema-react/src/a2ui/surfaces.tsx` module, including `convertV1ToV09`, `getA2UIMessages`, and `ThermidorA2UISurfaces`, which translates v1.0 A2-UI messages into the v0.9 messages the A2UI_Renderer consumes and drives surface mounting.
- **V1_To_V09_Adapter**: The `convertV1ToV09` function inside the Surface_Bridge, which flattens each v1.0 `createSurface`/`updateComponents` message into v0.9 component nodes of the form `{id, component, children, child, ...props}`.
- **A2UI_Component_Node**: An entry of `createSurface.components[]` on the A2-UI plane, carrying the node `id`, its catalog `component` name, its `props` (including `componentId` and `componentType`), and its composition fields `children`/`child`.
- **Decomposed_Surface**: An A2-UI surface whose root component composes other components by id rather than rendering a monolithic layout — specifically the commerce-search surface (root `commerce-search`) and the bundle surface (root `bundle-display`).
- **Commerce_Search_Renderer**: The `demo-schema-react` catalog renderer for the `commerce-search` surface-root component. It mounts its children (search box, facet manager, product list, sort, pagination) through the Children_Mount_Function in `children` order.
- **Facet_Manager_Renderer**: The `demo-schema-react` catalog renderer for the `facet-manager` component. It mounts its facet children through the Children_Mount_Function in `children` order.
- **Bundle_Display_Renderer**: The `demo-schema-react` catalog renderer for the `bundle-display` component. It mounts its slot product-list children through the Children_Mount_Function while reading product data from AG-UI state keyed by `componentId`.
- **Catalog_Registration**: The catalog definitions and renderers wired in `samples/thermidor/demo-schema-react/src/a2ui/components.tsx` via `createThermidorCatalog`.
- **Mock_Search_Template**: The `packages/platform-mock-api/src/converse/templates/schema-response-search.ts` template that emits the commerce-search surface.
- **Mock_Bundle_Template**: The `packages/platform-mock-api/src/converse/templates/schema-response-bundle.ts` template that emits the bundle surface.
- **AG_UI_State**: The per-component `state` transport delivered by AG-UI `StateSnapshot`/`StateDelta`, keyed by `componentId` (ADR-002, ADR-006). It carries component data, never composition.
- **A2_UI_Composition_Plane**: The A2-UI plane on which composition (`children`/`child`/`rootId` on A2UI_Component_Nodes) is expressed (ADR-002, ADR-007).
- **Component_Id_Correlation**: The rule that a component's A2-UI composition node and its AG-UI state entry are linked solely by a shared `componentId`.
- **Schema_Package**: The `@coveo/thermidor-schema` package, providing the `children`/`child` composition fields on the base component contract and the widened `ComponentContracts` union, delivered additively by track #1. This spec consumes the track #1 contract as delivered, with one permitted change: removing the `Facet_Ids_Field` from the `Facet_Manager_State`. (**Descoped:** an earlier revision also provided a `Composition_Snapshot_Contract` / `CompositionSnapshotEntry` view; that contract was removed from `@coveo/thermidor-schema`, so requirements 8.4/8.5 below are not implemented on this branch.)
- **Facet_Manager_State**: The `FacetManagerState` shape in the `@coveo/thermidor-schema` contract that carries the facet manager's per-component data in the AG_UI_State.
- **Facet_Ids_Field**: The `facetIds` field currently declared on the `Facet_Manager_State`, carrying the facet ordering in the AG_UI_State; removed by this spec in favor of the `facet-manager` A2UI_Component_Node's `children`.
- **Surface_Ref_Field**: The `surfaceRef` field currently declared on each bundle slot, referencing the product data surface for that slot; removed by this spec in favor of the bundle root A2UI_Component_Node's `children`.
- **Surface_Type_Field**: The `surfaceType` field on the `createSurface` payload (`CreateSurfacePayload` in the `@coveo/thermidor` SDK), introduced by the separate, completed `commerce-surface-decomposition` spec to carry surface-routing intent (values such as `commerceSearch` and `converse`); removed by this spec in favor of the Root_Component's `componentType`.
- **Root_Component**: The A2UI_Component_Node located at `components[rootId]` of a surface, where `rootId` is the `createSurface.rootId` field delivered by track #1; its `componentType` carries the surface-routing intent that the Surface_Type_Field previously carried.
- **Surface_Intent_Routing**: The navigation rule in the Schema_Sample that derives which destination to show from the Root_Component's `componentType` — a `commerce-search` Root_Component routes to the search-results page, while every other Root_Component `componentType`, and the absence of a surface, routes to inline conversation.
- **Extract_Surface_Type_Helper**: The `extractSurfaceType(content)` function in `packages/thermidor/src/internal/api/unified/unified-runtime.ts` that reads the Surface_Type_Field; removed by this spec.
- **Unified_Surface_Callback**: The `onA2uiSurface` callback in `packages/thermidor/src/internal/api/unified/unified-runtime.ts` whose current `surfaceType`-based branch delegates to the legacy SurfaceProcessor only when the Surface_Type_Field is absent; the Surface_Type_Field-based branch is removed by this spec.
- **Real_Backend_Sample**: `samples/thermidor/demo-react`, which uses the real backend through the `@coveo/thermidor` SDK and must not be modified.
- **Schema_Sample**: `samples/thermidor/demo-schema-react`, the mock-driven sample this feature modifies.

## Requirements

### Requirement 1: Root mapping for surfaces whose root id is not `"root"`

**User Story:** As a developer of the Schema_Sample, I want the A2UI_Renderer to locate and mount a surface whose Declared_Root_Id differs from the Renderer_Root_Id, so that decomposed surfaces such as commerce-search and bundle-display render through the renderer instead of a bespoke layout.

#### Acceptance Criteria

1. WHEN the Surface_Bridge processes a `createSurface` message whose Declared_Root_Id is a value other than `"root"` and that Declared_Root_Id exactly matches (case-sensitive, full-string) the id of exactly one A2UI_Component_Node in that surface, THE Surface_Bridge SHALL resolve the Root_Mapping so that the A2UI_Renderer mounts the surface starting from the component identified by that Declared_Root_Id.
2. WHEN a Decomposed_Surface is mounted, THE A2UI_Renderer SHALL render the component identified by the Declared_Root_Id as the top of the surface's component tree.
3. WHERE a `createSurface` message declares no explicit Declared_Root_Id, THE Surface_Bridge SHALL preserve the existing behavior of mounting from the Renderer_Root_Id `"root"`.
4. IF a `createSurface` message declares a Declared_Root_Id that does not exactly match the id of any A2UI_Component_Node in that surface, THEN THE Schema_Sample SHALL mount no component tree for that surface, SHALL leave every other surface's mounted component tree unchanged, and SHALL complete processing without raising an unhandled error.
5. WHEN the Root_Mapping is resolved for a surface, THE Surface_Bridge SHALL preserve every `componentId` and `componentType` carried in each A2UI_Component_Node's `props`, so that AG-UI state lookups keyed by `componentId` continue to resolve.

### Requirement 2: Mock surfaces emit every composed node with its composition fields

**User Story:** As a consumer of the mock API, I want each Decomposed_Surface to emit all of its component nodes with their `children`/`child` on the A2-UI plane, so that the A2UI_Renderer can mount the entire tree by id.

#### Acceptance Criteria

1. THE Mock_Search_Template SHALL emit, in `createSurface.components[]`, exactly one A2UI_Component_Node for the commerce-search root and exactly one A2UI_Component_Node for each of the search box, facet manager, product list, sort, pagination, and every facet composed under the surface, with each A2UI_Component_Node carrying a unique non-empty `id`.
2. THE Mock_Search_Template SHALL declare the commerce-search root A2UI_Component_Node's `children` as the ids of the top-level components it composes, listed in layout order (search box, facet manager, sort, pagination, product list), and SHALL declare the facet manager A2UI_Component_Node's `children` as the ids of the facets it composes, listed in the same order the facets are emitted, where every id in each `children` list matches the `id` of an A2UI_Component_Node emitted in the same `createSurface.components[]`.
3. THE Mock_Bundle_Template SHALL emit, in `createSurface.components[]`, exactly one A2UI_Component_Node for the bundle-display root and exactly one A2UI_Component_Node for each slot product-list component composed under the bundle root, and SHALL declare the bundle root A2UI_Component_Node's `children` as the ids of those slot product-list components in slot-enumeration order, where every id matches the `id` of an A2UI_Component_Node emitted in the same `createSurface.components[]`.
4. THE Mock_Search_Template and the Mock_Bundle_Template SHALL place `children`/`child` and the Declared_Root_Id only on the A2UI_Component_Nodes and the `createSurface`, and SHALL NOT place any `children`, `child`, or `rootId` field in the AG_UI_State.
5. WHEN a mock template emits per-component data, THE mock template SHALL deliver that data through the AG_UI_State keyed by each component's `componentId`, where each AG_UI_State key equals the `componentId` declared on exactly one emitted A2UI_Component_Node and each emitted A2UI_Component_Node's `componentId` equals its own `id`.
6. WHEN the V1_To_V09_Adapter converts a mock `createSurface` message, THE Surface_Bridge SHALL emit one v0.9 component node per A2UI_Component_Node, each retaining its original `id`, its catalog `component`, and its `children`/`child` composition fields unchanged, and SHALL preserve the absence of a composition field when the source A2UI_Component_Node declares none rather than fabricating one.
7. IF the facet manager composes no facets, THEN THE Mock_Search_Template SHALL declare the facet manager A2UI_Component_Node's `children` as an empty ordered list rather than omitting the `children` field.
8. IF the bundle root composes no slot product-list components, THEN THE Mock_Bundle_Template SHALL declare the bundle root A2UI_Component_Node's `children` as an empty ordered list rather than omitting the `children` field.

### Requirement 3: CommerceSearch is an A2-UI renderer that mounts its children by id

**User Story:** As a developer, I want the Commerce_Search_Renderer to mount its children through the Children_Mount_Function in composition order, so that the commerce-search surface layout is driven by the A2-UI composition rather than hard-coded in the sample.

#### Acceptance Criteria

1. THE Commerce_Search_Renderer SHALL conform to the A2UI_Renderer custom-renderer contract, receiving `props` and the Children_Mount_Function.
2. WHEN the Commerce_Search_Renderer renders, THE Commerce_Search_Renderer SHALL derive its ordered child ids solely from the composition provided through its A2-UI renderer inputs, and SHALL mount each child exactly once by calling the Children_Mount_Function with that child's id.
3. WHEN the Commerce_Search_Renderer mounts its children, THE Commerce_Search_Renderer SHALL mount them from first to last preserving the index order declared by the root's `children` list.
4. THE Commerce_Search_Renderer SHALL NOT read composition (`children`/`child`) from the AG_UI_State.
5. WHEN the commerce-search root declares an empty `children` list, THE Commerce_Search_Renderer SHALL make zero calls to the Children_Mount_Function and SHALL render without raising an error.
6. IF a child id declared in the root's `children` list has no corresponding component in the composition, THEN THE Commerce_Search_Renderer SHALL skip mounting that child id, SHALL mount the remaining declared child ids in their declared order, and SHALL render without raising an error.

### Requirement 4: FacetManager becomes a true A2-UI renderer

**User Story:** As a developer, I want the Facet_Manager_Renderer to mount its facet children through the Children_Mount_Function, so that facet ordering comes from A2-UI composition and no longer from a fabricated component map or AG-UI state.

#### Acceptance Criteria

1. THE Facet_Manager_Renderer SHALL conform to the A2UI_Renderer custom-renderer contract, receiving `props` and the Children_Mount_Function.
2. WHEN the Facet_Manager_Renderer renders and the facet manager's composition is available, THE Facet_Manager_Renderer SHALL obtain its ordered facet child ids from the composition provided through its A2-UI renderer inputs.
3. WHEN the Facet_Manager_Renderer has obtained its ordered facet child ids, THE Facet_Manager_Renderer SHALL mount each facet by calling the Children_Mount_Function once per child id, preserving the exact sequence declared by the facet manager's `children` list.
4. THE Facet_Manager_Renderer SHALL NOT read facet ordering from the AG_UI_State, SHALL NOT read the Facet_Ids_Field, and SHALL NOT construct a fabricated flat component map to obtain its child ids.
5. WHILE the facet manager's composition is not yet available, THE Facet_Manager_Renderer SHALL mount no facets and SHALL render without raising an error.
6. WHEN the facet manager declares an empty `children` list, THE Facet_Manager_Renderer SHALL mount no facets and SHALL render without raising an error.
7. IF a child id declared in the facet manager's `children` list has no corresponding component in the composition, THEN THE Facet_Manager_Renderer SHALL skip mounting that child id, SHALL mount the remaining declared child ids in their declared order, and SHALL render without raising an error.

### Requirement 5: BundleDisplay is fully adjacency-list, correlating composition and data by componentId

**User Story:** As a developer, I want the Bundle_Display_Renderer to mount its slot product-lists through the Children_Mount_Function while reading product data from AG-UI state keyed by the same `componentId`, so that the bundle is composed on the A2-UI plane and populated from the AG-UI plane, linked only by `componentId`.

#### Acceptance Criteria

1. THE Bundle_Display_Renderer SHALL conform to the A2UI_Renderer custom-renderer contract, receiving `props` and the Children_Mount_Function.
2. WHEN the Bundle_Display_Renderer renders its slot product-list children, THE Bundle_Display_Renderer SHALL mount each child by calling the Children_Mount_Function with the child's id, using the ids declared by the bundle root's `children` list in their declared order.
3. WHEN a mounted slot product-list child renders its product data, THE Schema_Sample SHALL source that product data from the AG_UI_State entry whose key is exactly equal to the mounted child's `componentId` (Component_Id_Correlation).
4. IF a mounted slot product-list child's `componentId` has no matching AG_UI_State entry, THEN THE Schema_Sample SHALL render that child with an empty product data set and SHALL NOT raise an error.
5. THE Bundle_Display_Renderer SHALL NOT read composition (`children`/`child`) from the AG_UI_State and SHALL NOT read the Surface_Ref_Field to locate its slot product-list children.
6. WHEN the bundle root declares an empty `children` list, THE Bundle_Display_Renderer SHALL mount zero slot product-lists and SHALL render without raising an error.

### Requirement 6: Catalog registration and removal of workaround remnants

**User Story:** As a maintainer of the Schema_Sample, I want the new renderers registered in the catalog and the obsolete workaround code removed, so that the catalog reflects the adjacency-list model with no dead scaffolding.

#### Acceptance Criteria

1. THE Catalog_Registration SHALL register a catalog definition and renderer entry for the `commerce-search` surface-root component, resolving it to the Commerce_Search_Renderer.
2. THE Catalog_Registration SHALL register the Facet_Manager_Renderer and the Bundle_Display_Renderer as the renderers for the `facet-manager` and `bundle-display` catalog entries respectively, each conforming to the A2UI_Renderer custom-renderer contract.
3. WHEN the new renderers are registered, THE Catalog_Registration SHALL remove the workaround remnants that supplied child components outside the Children_Mount_Function, including the fabricated `childComponents` map and the `EMPTY_CHILD_COMPONENTS` placeholder.
4. WHEN a component's `componentType` is resolved by the Catalog_Registration, THE Schema_Sample SHALL select the renderer whose catalog entry matches that `componentType`, including resolving `commerce-search` to the Commerce_Search_Renderer.
5. IF a component's `componentType` has no matching catalog entry, THEN THE Schema_Sample SHALL decline to render that component, preserve the state of all successfully resolved components, and surface an error indication identifying the unresolved `componentType`.
6. WHEN the Catalog_Registration completes registration, THE Catalog_Registration SHALL expose exactly one renderer entry per catalog `componentType`, resolving each of `commerce-search`, `facet-manager`, and `bundle-display` to its corresponding renderer with no remaining reference to the fabricated `childComponents` map or the `EMPTY_CHILD_COMPONENTS` placeholder.

### Requirement 7: Mock templates updated to mount the full tree

**User Story:** As a consumer of the mock API, I want the Mock_Search_Template and Mock_Bundle_Template updated to emit the full A2-UI node tree required for mounting, so that the Schema_Sample renders the decomposed surfaces end-to-end.

#### Acceptance Criteria

1. THE Mock_Search_Template SHALL emit the commerce-search surface with exactly one Declared_Root_Id and one A2UI_Component_Node for each of the following mount targets reachable through the Children_Mount_Function: the root, the search box, the facet manager, each facet, the product list, the sort, and the pagination.
2. IF the Mock_Search_Template emits a commerce-search surface in which the Declared_Root_Id has no matching A2UI_Component_Node, or any A2UI_Component_Node referenced by a `children` list is absent, THEN THE Mock_Search_Template SHALL reject the composition and produce an error indication that names the missing node, without emitting a partial tree.
3. THE Mock_Bundle_Template SHALL emit the bundle surface with exactly one Declared_Root_Id and one A2UI_Component_Node for the bundle root plus one A2UI_Component_Node for each slot product-list reachable through the Children_Mount_Function.
4. IF the Mock_Bundle_Template emits a bundle surface in which the Declared_Root_Id has no matching A2UI_Component_Node, or any slot product-list A2UI_Component_Node referenced by a `children` list is absent, THEN THE Mock_Bundle_Template SHALL reject the composition and produce an error indication that names the missing node, without emitting a partial tree.
5. WHEN the mock templates emit an updated composition following a user action, THE mock templates SHALL deliver every per-component data change through the AG_UI_State keyed by `componentId`, and THE mock templates SHALL exclude all composition fields from the AG_UI_State.
6. THE mock templates SHALL preserve the existing surface behavior for query, facets, sort, pagination, and bundle tiers such that each rendered surface presents field-for-field identical data to the surface rendered before the composition change, with all such data sourced from the AG_UI_State.

### Requirement 8: Verification — sample builds and tests pass, mocks validate, real-backend sample untouched

**User Story:** As a maintainer, I want the Schema_Sample to build and pass its tests, the mock payloads to validate against the schema, and the Real_Backend_Sample to remain untouched and passing, so that the composition change is proven end-to-end without regressing the real-backend path.

#### Acceptance Criteria

1. WHEN the Schema_Sample build runs, THE Schema_Sample SHALL compile with a success (zero) exit status and report zero type errors, and IF one or more type errors occur, THEN the build SHALL complete with a non-success (non-zero) exit status and emit a diagnostic identifying each offending source location.
2. WHEN the Schema_Sample unit tests run, THE Schema_Sample SHALL complete with a success (zero) exit status when all tests pass, and IF one or more unit tests fail, THEN the test run SHALL complete with a non-success (non-zero) exit status and identify each failing test by name.
3. WHERE the Schema_Sample defines end-to-end (Playwright) tests, WHEN the end-to-end test suite runs, THE Schema_Sample SHALL complete the suite with a success (zero) exit status when all tests pass, and IF one or more end-to-end tests fail, THEN the suite SHALL complete with a non-success (non-zero) exit status and identify each failing test by name.
4. _(DESCOPED — the `composition-snapshot` contract was removed from `@coveo/thermidor-schema`; not implemented on this branch.)_ WHEN a mock template's emitted surface is assembled into a `Composition_Snapshot_Contract` (Declared_Root_Id plus the flat component map), THE assembled snapshot SHALL be accepted by the Schema_Package `CompositionSnapshot` validation, and IF validation does not accept the snapshot, THEN the validation SHALL produce an error identifying the offending component id and the failed constraint.
5. _(DESCOPED — the `composition-snapshot` contract was removed from `@coveo/thermidor-schema`; not implemented on this branch.)_ WHEN each emitted A2UI_Component_Node's component contract is validated, THE node SHALL be accepted by the Schema_Package `CompositionSnapshotEntry` validation for its `componentType`, and IF the node is not accepted for its `componentType`, THEN the validation SHALL produce an error identifying the offending node id and its `componentType`.
6. WHEN the facet manager's per-component data is validated against the regenerated Facet_Manager_State contract, THE AG_UI_State entry SHALL be accepted without carrying the Facet_Ids_Field, and IF the entry carries a Facet_Ids_Field or omits a required field, THEN the validation SHALL produce an error identifying the offending field.
7. THE feature SHALL NOT modify any Real_Backend_Sample source file, and WHEN the Real_Backend_Sample build and test suites run, THE Real_Backend_Sample SHALL complete each with a success (zero) exit status using the real backend through the `@coveo/thermidor` SDK.
8. WHERE a public package's source is modified, THE feature SHALL include a changeset file that names each affected public package, declares a semver bump level of `major`, `minor`, or `patch` for each, and includes a non-empty human-readable description of the change.

### Requirement 9: Migrate composition off AG-UI state — remove `facetIds` and `surfaceRef`

**User Story:** As a maintainer, I want the facet ordering and the bundle slot references to move from the AG_UI_State onto the A2-UI `children` plane, so that composition lives entirely on the A2_UI_Composition_Plane and no composition data remains in per-component state.

#### Acceptance Criteria

1. THE feature SHALL remove the Facet_Ids_Field from the Facet_Manager_State in the Schema_Package contract, SHALL regenerate the Zod projection so the regenerated projection contains no Facet_Ids_Field, and SHALL include a changeset for the `@coveo/thermidor-schema` package describing the removal.
2. WHEN the Mock_Search_Template emits the facet manager, THE Mock_Search_Template SHALL express facet ordering solely through the facet-manager A2UI_Component_Node's `children` list and SHALL NOT emit the Facet_Ids_Field in the AG_UI_State.
3. THE feature SHALL remove the Surface_Ref_Field from each bundle slot, and WHEN the Mock_Bundle_Template emits the bundle surface, THE Mock_Bundle_Template SHALL express each slot's product-list association solely through the bundle root A2UI_Component_Node's `children` list, mounting each slot product-list as an A2UI_Component_Node, and SHALL NOT emit the Surface_Ref_Field.
4. WHEN a mounted slot product-list child renders its product data, THE Schema_Sample SHALL source that product data from the AG_UI_State entry keyed by the mounted child's `componentId` rather than through any Surface_Ref_Field.
5. WHEN the mock templates move composition from the AG_UI_State onto the A2UI_Component_Nodes, THE mock templates SHALL place `children`/`child`/`rootId` only on the A2UI_Component_Nodes and the `createSurface`, and SHALL leave the AG_UI_State carrying per-component data keyed by `componentId` with no composition field (ADR-002, ADR-006).
6. WHEN the Facet_Ids_Field and the Surface_Ref_Field are removed, THE Schema_Sample SHALL contain no remaining read of either field, no fabricated `childComponents` map, and no `EMPTY_CHILD_COMPONENTS` placeholder.

### Requirement 10: Surface routing by root componentType (remove `surfaceType`)

**User Story:** As a maintainer, I want surface-routing intent to move off the Surface_Type_Field and onto the Root_Component's `componentType`, so that navigation follows the ADR-007 model (the root's `componentType` carries the intent) and no separate `surfaceType` concept remains across the SDK, the mocks, and the Schema_Sample.

#### Acceptance Criteria

1. THE feature SHALL remove the Surface_Type_Field from the `CreateSurfacePayload` declaration in the `@coveo/thermidor` SDK and SHALL remove the validation that checks `surfaceType` is a string, so that the payload contract no longer declares or validates a Surface_Type_Field.
2. THE feature SHALL remove the Extract_Surface_Type_Helper and SHALL remove the Surface_Type_Field-based branch of the Unified_Surface_Callback, so that the SDK routes surfaces without reading a Surface_Type_Field.
3. WHEN the SDK tests that exercise the Surface_Type_Field are updated, THE feature SHALL remove or adapt `extract-surface-type.test.ts` and SHALL remove or adapt the Surface_Type_Field-based Properties in `unified-routing-properties.test.ts` so that no SDK test asserts on a Surface_Type_Field, and THE affected SDK test suites SHALL complete with a success (zero) exit status.
4. THE feature SHALL remove the Surface_Type_Field from each of the five `packages/platform-mock-api` templates that emit it (`schema-response-search.ts`, `schema-response-bundle.ts`, `schema-response-comparison.ts`, `schema-response-discovery.ts`, `schema-response-fallback.ts`), so that no mock template emits a Surface_Type_Field on `createSurface`.
5. WHEN the Root_Component of a mounted surface has `componentType` equal to `commerce-search`, THE Schema_Sample SHALL route to the search-results page.
6. WHEN the Root_Component of a mounted surface has any `componentType` other than `commerce-search`, THE Schema_Sample SHALL route to inline conversation.
7. WHEN there is no surface to route, THE Schema_Sample SHALL route to inline conversation.
8. THE feature SHALL adapt `samples/thermidor/demo-schema-react/src/hooks/use-navigation.ts` (including `findSurface`, `findCommerceSurfaceId`, and `deriveTransitionAction`) so that Surface_Intent_Routing derives the destination from the Root_Component's `componentType` (resolved via `createSurface.rootId` and `components[rootId]`) and SHALL NOT read the Surface_Type_Field, and SHALL adapt the affected sample tests (`ConversationPage.integration.test.tsx`, `AppShell.test.tsx`, `AppShell.bidirectional.test.tsx`) so that no sample test constructs a payload carrying a Surface_Type_Field.
9. THE Schema_Sample SHALL preserve observably equivalent navigation behavior after the switchover: exactly one Root_Component `componentType` (`commerce-search`) SHALL route to the search-results page and every other Root_Component `componentType` SHALL route to inline conversation, matching the pre-change behavior in which only `surfaceType === 'commerceSearch'` routed to search.
10. WHEN the existing mock scenarios are routed after the switchover, THE Schema_Sample SHALL continue to route the search scenario (`water sports`) to the search-results page and SHALL continue to route the bundle, comparison, discovery, and fallback scenarios to inline conversation.
11. WHEN the affected SDK test and Schema_Sample test suites run after the switchover, THE feature SHALL complete each with a success (zero) exit status, and IF one or more tests fail, THEN the run SHALL complete with a non-success (non-zero) exit status and identify each failing test by name.
