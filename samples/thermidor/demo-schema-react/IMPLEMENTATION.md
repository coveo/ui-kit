# Implementation Details

Technical decisions, workarounds, conformity validation, and known limitations for `demo-schema-react`.

## State and validation model

This sample implements the inline component-state model recorded in ADR-011 of `@coveo/thermidor-schema` (which supersedes ADR-002's AG-UI state transport). Component state travels inline through the A2-UI data model via `/state/<id>` `updateDataModel` operations, and node props resolve from it through A2-UI Data_Binding objects `{ "path": <JSON Pointer> }`. Four points define the model:

- **Client-side Zod validation is retained.** Component state written to the A2-UI data model and action payloads are validated against the generated Zod schemas derived from the Thermidor contract. The validation runs inside `@coveo/thermidor` on its transport/dispatch path (inbound `updateDataModel` ops on the surface-processing path; outbound action payloads on the dispatch path), transparently to the sample — the sample never invokes, imports, or is aware of the validators.
- **Displayed-value formatting is produced by the agent.** The agent writes pre-formatted display values into the data model; the sample renders the agent-provided formatted value as-is and applies no additional client-side formatting.
- **A2-UI is the only supported source of component state.** The sample obtains component state solely through A2-UI (the `/state` data-model bindings); component state obtained through any non-A2-UI source is unsupported.
- **Intentional divergence from A2-UI bidirectional input binding.** The sample deliberately does not use A2-UI standard bidirectional input components. In-progress user input (for example a facet search box being typed) is held in the sample's local React state and is never written to the shared A2-UI data model, and component actions are dispatched over the non-bidirectional HTTP Action_Channel.

## v1.0 → v0.9 adapter (`surfaces.tsx`)

The backend and mock API emit A2-UI messages in **v1.0** format (`createSurface` with `components[].props`). However, `@copilotkit/a2ui-renderer` (v1.61) only understands the **v0.9** format (`createSurface` + `updateComponents` with props flattened on component nodes).

The `convertV1ToV09` function in `src/a2ui/surfaces.tsx` bridges this gap by converting each v1.0 message into equivalent v0.9 messages before passing them to the renderer's `processMessages`.

### Conversion rules

| v1.0 message                              | v0.9 output                                                                                     |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `createSurface` with `components[].props` | `createSurface` (surface lifecycle) + `updateComponents` (props flattened onto component nodes) |
| `updateDataModel`                         | Same shape, version changed to `v0.9`                                                           |
| `updateComponents`                        | Same shape, version changed to `v0.9`                                                           |
| `deleteSurface`                           | Same shape, version changed to `v0.9`                                                           |

The key transformation: v1.0 puts component props in `components[].props`, while v0.9 expects them flattened directly on the component node. The adapter spreads `props` onto the node, carrying every A2-UI Data_Binding object `{ "path": <JSON Pointer> }` through byte-for-byte and preserving the single `id`/`component` identity; it never synthesizes `componentId`/`componentType`.

### When `@copilotkit/a2ui-renderer` supports v1.0

Once the renderer natively handles v1.0 messages:

1. Delete the `convertV1ToV09` function in `src/a2ui/surfaces.tsx`
2. Pass v1.0 messages directly to `processMessages` without conversion
3. Verify that `processMessages` passes `components[].props` — including each `{ "path": ... }` binding — to catalog renderers correctly, so the binder can resolve them against the A2-UI data model
4. Everything else (catalog definitions, dumb renderers reading resolved `props`, `/state` `updateDataModel` handling, `session.dispatchAction` dispatch) remains unchanged

## Single identity on component nodes (`id`/`component`)

Every emitted A2-UI node carries a **single** identity pair:

```jsonc
{
  "id": "facet-manager-2", // A2-UI node id (adjacency-list / mount key)
  "component": "FacetManager", // A2-UI component type (PascalCase, catalog renderer key + contract discriminant)
  "props": {
    // presentation values and A2-UI Data_Binding objects only, e.g. { "path": "/state/facet-manager-2/..." }
  },
}
```

`id` drives the adjacency-list tree (the renderer mounts by id) and `component` (PascalCase) resolves the catalog renderer. Contract resolution now uses the `component` discriminant directly (`findComponentContract`), so no second identity is required.

**History (the model that was removed).** Earlier iterations carried a _dual_ identity: each node also stashed `componentId`/`componentType` inside `props`, where `componentId` was the AG-UI state key (the SDK read `state.components[componentId]` via `selectRemoteControllerState`) and `componentType` (kebab-case) was the contract discriminant. That duplication existed only because component state travelled on a separate AG-UI `StateSnapshot` stream that had to be joined to the A2-UI node by identity.

Adopting the inline-state model removes the join at its root, and with it the second identity:

- Component state is now transported inline through the A2-UI data model via `/state/<id>` `updateDataModel` operations, so there is no AG-UI `state.components[componentId]` slice to join against — the `selectRemoteControllerState` identity join is gone.
- `props.componentId` / `props.componentType` are gone. The base component contract (`base/component.schema.json` in `@coveo/thermidor-schema`) now rejects a node carrying either, and identity keys are disallowed inside `props`.
- Renderers are dumb: they read resolved values from `props` (the renderer resolves the node's `{ "path": ... }` bindings) and never hydrate by identity.

This aligns the sample with the standard A2-UI data-binding and component model rather than a Thermidor-specific identity bridge.

## Skeleton detection (⚠️ partially standardized)

Skeletons are shown during streaming to indicate which components are loading. Detection has several sources, and the **observed backend behavior** (captured from a live `commerce_discovery` run) is now the reference:

| Source                        | Trigger                                                               | Status                                 |
| ----------------------------- | --------------------------------------------------------------------- | -------------------------------------- |
| `isLoading` in the data model | `createSurface.dataModel.isLoading === true`                          | ✅ Backend-emitted, A2UI-aligned       |
| `skeleton-` surfaceId prefix  | `surfaceId.startsWith("skeleton-")` (e.g. `skeleton-surface-default`) | ⚠️ Backend-emitted, non-standard       |
| `store_render_plan` tool call | Reasoning step `name: "store_render_plan"` mapped to a component type | ⚠️ Mock-only (not skeleton in backend) |

### What the live backend actually emits

On a loading surface, the backend emits a single `createSurface` message carrying **both** signals at once:

```
createSurface: {
  surfaceId: "…:skeleton-surface-default",   // skeleton- prefix
  components: [{ id: "root", component: "ProductCarousel" }],  // ← selects WHICH skeleton
  dataModel: { isLoading: true, products: { items: [] }, heading: { value: "" } }  // isLoading
}
```

It is then **replaced in place** (same `messageId`, `replace: true`) by the real content — a new `createSurface` whose `surfaceId` no longer carries the `skeleton-` prefix and whose `dataModel` omits `isLoading` and holds the real data.

- **Whether** to show a skeleton: `dataModel.isLoading === true` (data-model state — A2UI-aligned). The consumer reads `ParsedSurface.data.isLoading`.
- **Which** skeleton to show: the root node's `component` discriminant (`ProductCarousel`, `NextActionsBar`, …), mapped by `A2UISkeleton`. The skeleton is the same component type as the real content that replaces it.
- The `skeleton-` surfaceId prefix is redundant with `isLoading` for detection (kept as a fallback in `useSkeletonItems`), and `store_render_plan` is NOT the backend's skeleton trigger — it is the product render plan; the mock templates still (incorrectly) use it to simulate skeletons.

### What is A2UI-standard vs. Coveo convention

- ✅ **Standard-aligned**: loading state carried in the surface **data model** (`isLoading`), skeleton variant chosen by the component **type** (structure), skeleton→content swap via a replacing `createSurface`.
- ⚠️ **Non-standard Coveo conventions** (semantics encoded in the opaque `surfaceId`):
  - the `skeleton-` **prefix** (detection hint, redundant with `isLoading`);
  - the `-default` **suffix**, which `useSkeletonItems` reads to deduplicate generic vs specific skeletons (a generic `…-default` skeleton is dropped once a specific one for the same component type arrives), and the derived `-remaining-N` ids. This is a real behavior, not just a fallback.

### Deferred migration (separate PR)

To make skeleton handling fully data-model-driven and drop the `surfaceId` semantics, a follow-up should:

1. Move the `-default` / specific priority off the `surfaceId` suffix and into the data model (e.g. a `skeletonKind`/priority field), so `useSkeletonItems` no longer parses `surfaceId`.
2. Once detection and dedupe both read the data model, retire the `skeleton-` prefix and the `store_render_plan`-based skeleton path in the mock templates, and align the mocks to emit the backend's real skeleton shape (`createSurface` + `dataModel.isLoading`, replaced in place).

Until then, the consumer reads `dataModel.isLoading` (applied) and keeps the `skeleton-`/`-default` surfaceId logic for backward compatibility.

## Zod version mismatch

`@coveo/thermidor-schema` and this sample use **Zod 4**, but `@copilotkit/a2ui-renderer` types are built against **Zod 3**. The `ZodObject` generics are structurally incompatible at the type level (`$strip` vs `UnknownKeysParam`) even though they are runtime-compatible.

This is handled via two bridge helpers in `components.tsx` (same pattern as `convertV1ToV09`):

- `asCatalogDefinitions(definitions)` — validates the input is `Record<string, {props: ZodObject<any>}>`, then casts to `CatalogDefinitions`
- `asCatalogRenderers(renderers)` — validates the input is `Record<string, React.FC<any>>`, then casts to `CatalogRenderers`

### When `@copilotkit/a2ui-renderer` upgrades to Zod 4

1. Delete `asCatalogDefinitions` and `asCatalogRenderers` from `components.tsx`
2. Pass definitions and renderers directly to `createCatalog` without wrappers
3. Remove `import type {z} from 'zod'` (no longer needed for the bridge type constraint)

## Action dispatch and inline state transport

When a decomposed commerce control (sort, pagination, page size, facet search) is interacted with, the renderer surfaces a standard A2-UI client-to-server message through its `onAction` handler, which is wired as `onAction={session.dispatchAction}` at the `A2UIProvider`. `session.dispatchAction` is the single consumer-facing dispatch entry point exposed by `@coveo/thermidor`:

- It recovers the dispatching component from the active turn's surfaces, builds the low-level action envelope, and dispatches internally through a private path that validates the action payload against the component's generated Zod action schema before the HTTP POST. Dispatch travels over the non-bidirectional HTTP Action_Channel; it is a plain request, not A2-UI bidirectional data binding.
- It is fire-and-forget: the returned Promise always resolves and never rejects. An empty message, an unresolved component, or a payload that fails validation is dropped with a dev-only warning and nothing is sent.
- The sample never invokes, imports, or is aware of the Zod validators; validation runs inside `@coveo/thermidor` on its dispatch path.

The producer replies by writing updated component state inline through the A2-UI data model as `/state/<id>` `updateDataModel` operations rather than an AG-UI `STATE_SNAPSHOT`:

- A whole-component op targets the component's state root `statePath(id)`; a partial op targets a sub-path beneath it and updates only the addressed fields (the incremental semantics of the A2-UI data model). The renderer owns the data model and re-resolves the affected `{ "path": ... }` bindings.
- Inbound `updateDataModel` ops are validated in transit by `@coveo/thermidor` (whole-component op against the `*State` schema; partial op against the sub-schema at the target sub-path). A non-conforming op is dropped and never forwarded, so the previously rendered UI for that component stays displayed.
- In-progress user input (for example a facet search box being typed) is held in the sample's local React state and is never written to the shared data model; see `use-optimistic-facet-search.ts`.

## Conformity validation

This implementation follows the inline component-state model. The authoritative reference is ADR-011; ADR-001/ADR-002 are retained as history (ADR-002 is superseded by ADR-011):

- **ADR-011** — Inline component state through the A2-UI data model; the current model, supersedes ADR-002 ([thermidor-schema/docs/ADR-011](https://github.com/coveo-platform/thermidor-schema/blob/main/docs/ADR-011-inline-component-state-a2-ui-data-model.md))
- **ADR-001** — Foundational component contract ([thermidor-schema/docs/ADR-001](https://github.com/coveo-platform/thermidor-schema/blob/main/docs/ADR-001-thermidor-schema-contract.md)) — history
- **ADR-002** — AG-UI for controller state transport (superseded by ADR-011) ([thermidor-schema/docs/ADR-002](https://github.com/coveo-platform/thermidor-schema/blob/main/docs/ADR-002-agui-controller-state-transport.md)) — history
- **ui-kit PR #8088** — PoC sample `schema-contract-react` ([coveo/ui-kit#8088](https://github.com/coveo/ui-kit/pull/8088)) — history

### Schema conformity

| Check                                                                                                                                                                        | Status |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Component schemas follow the base component pattern (`$id`, `allOf` → base/component, `component` discriminant, `state` → `$defs`, `actions`, `additionalProperties: false`) | ✅     |
| `component` is a stable string discriminator                                                                                                                                 | ✅     |
| `component-contracts.schema.json` discriminated union includes all 9 variants                                                                                                | ✅     |
| Definition schemas have `additionalProperties: false`                                                                                                                        | ✅     |
| Actions reference `base/action.schema.json` via `allOf`                                                                                                                      | ✅     |
| Read-only components have empty `actions` object                                                                                                                             | ✅     |
| Zod generation is up to date (`pnpm run generate --check` passes)                                                                                                            | ✅     |
| Ajv/Zod cross-validation tests pass (47 tests)                                                                                                                               | ✅     |

### ADR conformity (ADR-011, inline state)

ADR-011 supersedes ADR-002. Under the inline-state model the sample conforms as follows (the AG-UI `StateSnapshot` / `selectRemoteControllerState` / `componentId`-join principles from the old ADR-002 model no longer apply):

| ADR principle                                                      | Implementation                                                                                               |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| Server-owned component state, not mutated locally by the renderer  | Server writes `/state/<id>` `updateDataModel` ops; the renderer owns the data model and resolves bindings    |
| `component` is the stable discriminator                            | Used in `ComponentContractsSchema` discriminated union and `findComponentContract`                           |
| Component state is transported inline through the A2-UI data model | `/state/<id>` `updateDataModel` ops resolved into the renderer's data model (no AG-UI `StateSnapshot`)       |
| A2-UI transports a single node identity (`id` + `component`)       | Via `createSurface` → `components[]` with top-level `id`/`component` and `{ "path": ... }` bindings in props |
| Renderers read resolved state from `props` (no identity join)      | Dumb renderers resolve `{ "path": ... }` bindings; there is no `componentId` correlation                     |
| Actions are dispatched through the single `onAction` entry point   | `onAction={session.dispatchAction}` → validated payload → HTTP Action_Channel                                |

### PoC pattern conformity (PR #8088) — historical

PR #8088 predates the inline-state model; the patterns below described the removed ADR-002 / RemoteController approach and are retained only as history. The current model replaces every one of them:

| Removed pattern (PR #8088, past)                                           | Replacement in the current inline-state model                                                                       |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `useRemoteController(stateSource, props.componentId, props.componentType)` | Dumb renderers read resolved values from `props` (`{ "path": ... }` bindings); no controller hook, no identity join |
| `controller.state` typed from the `componentType` literal                  | Resolved `props` are typed by the per-component `*State` contract via `TypedRendererProps`                          |
| `controller.dispatch('action', payload)`                                   | `onAction` → `session.dispatchAction` (single entry point; payload validated before the HTTP POST)                  |
| `useSyncExternalStore` reactive subscription in `controllers.tsx`          | The renderer's own data model drives re-render; `controllers.tsx` was removed                                       |
| AG-UI `StateSnapshot` state keyed under `componentId`                      | `/state/<id>` `updateDataModel` ops resolved into the renderer's data model                                         |

## Known limitations / Next steps

### In-flight interaction behavior (open question)

`isLoading` is intentionally not part of the current contract. The frontend still needs guidance for interactions while an action request is in flight—for example, whether to disable controls, queue subsequent actions, ignore them, or show a pending state. Define this behavior before adding loading state support.

### Dynamic composition updates not exercised (facet reorder / add / remove)

Composition is emitted **once** in the initial `createSurface` and never changed afterwards. Action responses only re-emit `/state/<id>` `updateDataModel` ops (per-component data), so the set and order of facets are fixed for the surface's lifetime: the facet-manager node's `children` (`['facet-brand-2', 'facet-price-2', 'facet-category-2']`) is a static constant. No mock scenario reorders facets, adds one, or removes one.

A real backend can reorder facets (relevance-driven) or add/remove them dynamically. Before that is supported, note the following:

- **The bridge's `updateComponents` handling is incomplete.** In `convertV1ToV09` (`surfaces.tsx`), the `createSurface` branch applies the root-id remap (`remapId`) **and** flattens `components[].props` onto each node, but the `updateComponents` branch is a bare passthrough — it does neither. A dynamic `updateComponents` whose nodes carry `props` would reach the renderer without its `{ "path": ... }` bindings (and `direction`) flattened. Making `updateComponents` symmetric with `createSurface` (remap + prop flatten) is the prerequisite for any dynamic composition update.
- **Reorder / add are supported by the protocol; remove is not, directly.** A2UI v0.9 defines `updateComponents` as _adding to or updating_ components in a surface (adjacency list via `children`); reordering the facet-manager `children` and adding a new facet node fit that contract, and `FacetManagerRenderer` already re-renders from its resolved `children` `ChildList`. There is no component-removal primitive: dropping a facet means emitting a `children` list without its id (the orphaned node lingers in the surface) or recreating the surface via `deleteSurface` + `createSurface`.

This is out of scope for the static switchover; capture it before wiring dynamic facet composition.

### Temporary workarounds (to remove when upstream dependencies evolve)

| Item                    | Description                                                                                                                                                                      | Remove when                                                                                                                      |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **v1.0 → v0.9 adapter** | The `convertV1ToV09` shim in `surfaces.tsx` can be deleted once the renderer supports v1.0 natively.                                                                             | `@copilotkit/a2ui-renderer` supports v1.0 MessageProcessor                                                                       |
| **Zod 4 type casts**    | `asCatalogDefinitions` / `asCatalogRenderers` bridge helpers in `components.tsx` due to Zod version mismatch.                                                                    | `@copilotkit/a2ui-renderer` upgrades to Zod 4                                                                                    |
| **Skeleton detection**  | Detection reads `dataModel.isLoading` (A2UI-aligned, applied); the `surfaceId` still carries non-standard `skeleton-` / `-default` semantics used for dedupe (see section above). | Migrate `-default`/`-remaining` off the `surfaceId` into the data model; align mocks to the backend skeleton shape (separate PR) |

### Consumer DX improvements (simplify what the consumer must implement)

| Item                                                          | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Owner                |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| **Extract surface parsing into thermidor**                    | `src/a2ui/types.ts` contains raw A2-UI surface parsing logic (with `as unknown as` casts) that should live in `@coveo/thermidor` rather than in the sample. Consumers should not need to parse surfaces manually — the lib should expose typed utilities.                                                                                                                                                                                                         | `packages/thermidor` |
| **Provide a high-level surface extraction utility**           | The consumer must replicate the logic in `src/a2ui/surfaces.tsx` (`getA2UIMessages`): filter activities by kind, handle per-activity-id replacement, and extract A2-UI operations. A framework-agnostic utility (e.g. `extractA2UISurfaces(activities)`) exported by thermidor would encapsulate this. The React rendering component (`ThermidorA2UISurfaces`) would remain in the consumer application.                                                          | `packages/thermidor` |
| **Extract surface-derivation helpers into thermidor**         | `findSurface` / `findCommerceSurfaceId` (scan a turn's activities for the first A2-UI `createSurface` and return its `surfaceType` / `surfaceId`) live in `src/hooks/use-navigation.ts`. A framework-agnostic utility (e.g. `findSurface(activities)` / `findCommerceSurfaceId(activities)`) exported by thermidor would let the consumer reuse the scan; the consumer's navigation logic (`deriveTransitionAction`, `useNavigation`) would remain in the sample. | `packages/thermidor` |
| **Export skeleton detection logic**                           | The consumer must parse reasoning steps, map `store_render_plan` routes to component types, and manage skeleton/real-surface subtraction. A framework-agnostic utility (e.g. `computeSkeletons(reasoningSteps, surfaces)`) exported by thermidor would encapsulate this. The React hook wrapper would remain in the consumer application.                                                                                                                         | `packages/thermidor` |
| **~~Simplify component subscription ergonomics~~ (obsolete)** | Superseded by the inline-state model. The `StateSourceProvider` / `useRemoteController(stateSource, componentId, componentType)` subscription path was removed; renderers are dumb and read resolved values from `props`, so there is no subscription boilerplate left to simplify.                                                                                                                                                                               | —                    |
| **~~Friendlier type aliases for consumers~~ (obsolete)**      | Superseded by the inline-state model. The `RemoteController`, `RemoteControllerSource`, and `RemoteControllerStateForSchema` exports were removed from `@coveo/thermidor`; consumers type renderers with the per-component `XxxProps` / `XxxAction` contract from `@coveo/thermidor-schema` (bridged locally via `TypedRendererProps`).                                                                                                                           | —                    |
| **Inline nested state in BundleDisplay contract**             | Resolved: `BundleDisplay` no longer reads other components' state via a cross-component identity join. Each tier slot carries its mounted child id (`childId`) and the renderer mounts the child via `children(slot.childId)`, so BundleDisplay reads only its own resolved `props`. Kept here to note the design intent that each component is self-contained.                                                                                                   | Backend              |

### Nice-to-have (non-blocking improvements)

| Item                                                                                              | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Unified search rendering via A2-UI**                                                            | SearchResultsPage (product grid, facets, sort, pagination) uses a separate RoutedInterface/Headless path. Evaluate with backend whether routed search could emit A2-UI surfaces (inline `/state` component state) instead, unifying the rendering pipeline. Key challenges: high-frequency bidirectional interactions (facet clicks → re-fetch), latency via converse stream vs direct API, large state volume. The `session.dispatchAction` dispatch wiring this depended on now exists, so it is no longer a prerequisite.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **Replace navigation state machine with React Router**                                            | AppShell uses a manual reducer (`useNavigation`) and conditional rendering (`view === "search"`) for routing. Migrating to React Router would simplify JSX readability (each route has its own component, no conditionals), give free browser back-button support, and make the sample more representative of a real consumer integration. It would not significantly reduce the navigation logic complexity (effects that observe turns and trigger transitions, persisted RoutedInterface refs), but improves ergonomics for anyone reading the sample as an integration example.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **`@coveo/thermidor-react` package**                                                              | React-specific glue (e.g. the `A2UIProvider` wiring and surface-rendering component) is currently implemented in each React consumer. Extracting it into a dedicated `@coveo/thermidor-react` package (or a `@coveo/thermidor/react` subpath export) would eliminate this boilerplate and ensure consumers get bug fixes and performance improvements automatically. `@coveo/thermidor` itself remains framework-agnostic. (Under the inline-state model there is no `useRemoteController` hook to extract; renderers are dumb.)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | `packages/thermidor` |
| **Cleaner generated schema names in `@coveo/thermidor-schema`**                                   | `packages/thermidor-schema/src/generated/schemas.ts` contains quicktype-invented names for anonymous sub-schemas — adjective-prefixed disambiguating names (`PurpleSearch`, `FluffySearch`, `PurpleRegularFacetSearchResult`), generic `*Class` suffixes (`PayloadClass`, `SubmitQueryClass`, `ToggleExcludeClass`), and array-item names (`ProductElement`). These are cosmetic and **internal only** — none is re-exported from `src/index.ts`, so no consumer sees them and the public API and validation behavior are unaffected. quicktype fabricates these names when a sub-schema has no `title`; giving the anonymous sub-schemas (inline `payload` objects, `items` element objects, etc.) an explicit `title` in the source `schema/**/*.json` documents makes quicktype emit that name instead. Pre-existing (not introduced by the adjacency-list work); worth a dedicated regeneration pass rather than mixing into a feature diff.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **Reduce per-schema duplication of the composition triad view and `additionalProperties: false`** | Two things are repeated across all 15 component documents under `schema/components/**`, both forced by limitations of JSON Schema `allOf`, not by choice. (1) Each document co-locates a `#/$defs/Triad` view re-declaring the member's `componentType`/`state`/`actions`/`children`/`child` without the base `allOf`, combined into `ComponentContractsTriad` (the identity-free value shape for the `composition-snapshot` map, so Ajv and the Zod projection agree) — because JSON Schema cannot strip a `required` inherited through `allOf`. (2) Each document re-declares `additionalProperties: false` at its own root — because `additionalProperties` is **not** `allOf`-aware: it only sees the same object's own `properties`, so a single declaration on the base would neither close the members nor even accept the member-declared `componentType`/`state`/`actions`. Here `additionalProperties: false` also does double duty: it is the keyword that makes quicktype project the clean identity-free triad rather than re-flattening the base identity fields into the generated `*Schema`. **The cleaner solution is `unevaluatedProperties: false`**, which _is_ `allOf`-aware and could be declared **once on the base** to close every member without per-document repetition. It was **not rejected because it's a bad idea** — it's the better modeling primitive here. Track #1 deferred it purely to keep the additive change quiet: switching the keyword on all 14 existing documents changes their long-standing contract keyword, invalidates the `facet-schemas.test.ts` assertions that each document has `additionalProperties === false`, and needs a verification that quicktype still projects the identity-free triad under `unevaluatedProperties` (the projection guarantee `additionalProperties: false` currently provides). Worth adopting in a dedicated pass: move to `unevaluatedProperties: false` on the base, drop the per-document `additionalProperties: false`, confirm the Zod projection stays identity-free, and update the structural tests. Internal only — `ComponentContractsTriad` is not re-exported. |

### Resolved

| Item                                                     | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Generate component props schemas in thermidor-schema** | ✅ The Zod generation script now produces component props schemas (`ProductCarouselPropsSchema`, `NextActionsBarPropsSchema`, etc.) from `schema/components/*.json`. Consumers import them directly — no more hand-written boilerplate in `components.tsx`.                                                                                                                                                                                                                                                                                         |
| **Wire action dispatch**                                 | ✅ Actions dispatch through the single `session.dispatchAction` entry point (wired as the renderer's `onAction`), which validates the payload against the component's Zod action schema and POSTs it over the HTTP Action_Channel on the active turn. Sort, pagination, page-size, next-actions, and facet search dispatch end-to-end; the producer responds with `/state/<id>` `updateDataModel` operations. (Earlier iterations used the now-removed `UnifiedConverseController.dispatchAction(RemoteControllerAction)` + AG-UI `StateSnapshot`.) |
