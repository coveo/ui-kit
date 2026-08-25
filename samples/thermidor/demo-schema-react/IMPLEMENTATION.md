# Implementation Details

Technical decisions, workarounds, conformity validation, and known limitations for `demo-schema-react`.

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

The key transformation: v1.0 puts component props in `components[].props` (with `componentId` and `componentType`), while v0.9 expects them flattened directly on the component node. The adapter spreads `props` onto the node.

### When `@copilotkit/a2ui-renderer` supports v1.0

Once the renderer natively handles v1.0 messages:

1. Delete the `convertV1ToV09` function in `src/a2ui/surfaces.tsx`
2. Pass v1.0 messages directly to `processMessages` without conversion
3. Verify that `processMessages` passes `components[].props` (including `componentId` and `componentType`) to catalog renderers correctly
4. Everything else (catalog definitions, renderers, `useRemoteController`, `StateSnapshot` handling) remains unchanged

## Skeleton detection (⚠️ needs clarification)

Skeletons are shown during streaming to indicate which components are loading. The current implementation supports **two detection sources**, but only one is actively used:

| Source                        | Trigger                                                                                     | Origin             | Status         |
| ----------------------------- | ------------------------------------------------------------------------------------------- | ------------------ | -------------- |
| `store_render_plan` tool call | Reasoning step with `name: "store_render_plan"` and `args.route` mapped to a component type | Mock API templates | ✅ Active      |
| `skeleton-` surfaceId prefix  | Backend sends a surface with `surfaceId.startsWith("skeleton-")`                            | PoC (PR #8088)     | ⚠️ Speculative |
| `isLoading` prop              | Backend sends a surface with `componentProps.isLoading === true`                            | PoC (PR #8088)     | ⚠️ Speculative |

**Open questions:**

- Neither `skeleton-` prefix nor `isLoading` prop are documented in ADR-001 or ADR-002. Should we standardize one of these as the official skeleton contract?
- The real backend does not currently emit skeleton surfaces. When it does, which mechanism will it use?
- Should `store_render_plan` tool calls remain the primary skeleton trigger, or should the backend own skeleton lifecycle via explicit surface messages?

The speculative sources are kept to stay aligned with `demo-react` but may be removed if the backend standardizes on a different mechanism.

## Zod version mismatch

`@coveo/thermidor-schema` and this sample use **Zod 4**, but `@copilotkit/a2ui-renderer` types are built against **Zod 3**. The `ZodObject` generics are structurally incompatible at the type level (`$strip` vs `UnknownKeysParam`) even though they are runtime-compatible.

This is handled via two bridge helpers in `components.tsx` (same pattern as `convertV1ToV09`):

- `asCatalogDefinitions(definitions)` — validates the input is `Record<string, {props: ZodObject<any>}>`, then casts to `CatalogDefinitions`
- `asCatalogRenderers(renderers)` — validates the input is `Record<string, React.FC<any>>`, then casts to `CatalogRenderers`

### When `@copilotkit/a2ui-renderer` upgrades to Zod 4

1. Delete `asCatalogDefinitions` and `asCatalogRenderers` from `components.tsx`
2. Pass definitions and renderers directly to `createCatalog` without wrappers
3. Remove `import type {z} from 'zod'` (no longer needed for the bridge type constraint)

## Conformity validation

This implementation has been validated against the following references:

- **ADR-001** — Hierarchical controller-based schema ([thermidor-schema/docs/ADR-001](https://github.com/coveo-platform/thermidor-schema/blob/main/docs/ADR-001-hierarchical-controller-schema.md))
- **ADR-002** — AG-UI for controller state transport, A2-UI for surface composition ([thermidor-schema/docs/ADR-002](https://github.com/coveo-platform/thermidor-schema/blob/main/docs/ADR-002-agui-controller-state-transport.md))
- **thermidor-schema PR #17** — Controller schema pattern reference ([coveo-platform/thermidor-schema#17](https://github.com/coveo-platform/thermidor-schema/pull/17))
- **ui-kit PR #8088** — PoC sample `schema-contract-react` ([coveo/ui-kit#8088](https://github.com/coveo/ui-kit/pull/8088))

### Schema conformity

| Check                                                                                                                                                                     | Status |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Component schemas follow the base component pattern (`$id`, `allOf` → base/component, `componentType` const, `state` → `$defs`, `actions`, `additionalProperties: false`) | ✅     |
| `componentType` is a stable const string discriminator                                                                                                                    | ✅     |
| `component-contracts.schema.json` discriminated union includes all 5 variants                                                                                             | ✅     |
| Definition schemas have `additionalProperties: false`                                                                                                                     | ✅     |
| Actions reference `base/action.schema.json` via `allOf`                                                                                                                   | ✅     |
| Read-only components have empty `actions` object                                                                                                                          | ✅     |
| Zod generation is up to date (`pnpm run generate --check` passes)                                                                                                         | ✅     |
| Ajv/Zod cross-validation tests pass (47 tests)                                                                                                                            | ✅     |

### ADR conformity

| ADR principle                                                         | Implementation                                                                     |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Component state is backend-owned, immutable on the frontend           | State delivered via AG-UI `StateSnapshot`, never mutated locally                   |
| `componentType` is the stable discriminator                           | Used in `ComponentContractsSchema` discriminated union and `findComponentContract` |
| AG-UI `StateSnapshot` transports component state                      | `setStateSnapshot` stores in `agentResponse.state.components`                      |
| A2-UI transports component identity (`componentId` + `componentType`) | Via `createSurface` → `components[].props.{componentId, componentType}`            |
| Frontend correlates component identity with state by `componentId`    | `selectRemoteControllerState(state, componentId)`                                  |
| Actions are dispatched via the remote controller, not via callbacks   | `controller.dispatch('selectAction', {...})`                                       |

### PoC pattern conformity (PR #8088)

| Pattern                                                                    | Implementation                                                              |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `useRemoteController(stateSource, props.componentId, props.componentType)` | Used in catalog renderers (ProductCarousel, BundleDisplay, ComparisonTable) |
| `controller.state` is automatically typed from the `componentType` literal | Via `typeof SCHEMA_ID` → TypeScript infers the correct state type           |
| `controller.dispatch('action', payload)` without casts                     | Used in `CatalogNextActionsBar`                                             |
| `useSyncExternalStore` for reactive subscription                           | Added in `controllers.tsx`                                                  |
| `StateSnapshot` contains state directly under componentId (not wrapped)    | `{components: {'bundle-root': {tiers: [...]}}}`                             |

## Known limitations / Next steps

### Temporary workarounds (to remove when upstream dependencies evolve)

| Item                    | Description                                                                                                                            | Remove when                                                |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| **v1.0 → v0.9 adapter** | The `convertV1ToV09` shim in `surfaces.tsx` can be deleted once the renderer supports v1.0 natively.                                   | `@copilotkit/a2ui-renderer` supports v1.0 MessageProcessor |
| **Zod 4 type casts**    | `asCatalogDefinitions` / `asCatalogRenderers` bridge helpers in `components.tsx` due to Zod version mismatch.                          | `@copilotkit/a2ui-renderer` upgrades to Zod 4              |
| **Skeleton detection**  | Three detection mechanisms coexist (see section above). Only `store_render_plan` tool calls are active; the other two are speculative. | Backend team standardizes skeleton contract                |

### Consumer DX improvements (simplify what the consumer must implement)

| Item                                                | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Owner                |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| **Extract surface parsing into thermidor**          | `src/a2ui/types.ts` contains raw A2-UI surface parsing logic (with `as unknown as` casts) that should live in `@coveo/thermidor` rather than in the sample. Consumers should not need to parse surfaces manually — the lib should expose typed utilities.                                                                                                                                                                                                                                                      | `packages/thermidor` |
| **Provide a high-level surface extraction utility** | The consumer must replicate the logic in `src/a2ui/surfaces.tsx` (`getA2UIMessages`): filter activities by kind, handle per-activity-id replacement, and extract A2-UI operations. A framework-agnostic utility (e.g. `extractA2UISurfaces(activities)`) exported by thermidor would encapsulate this. The React rendering component (`ThermidorA2UISurfaces`) would remain in the consumer application.                                                                                                       | `packages/thermidor` |
| **Export skeleton detection logic**                 | The consumer must parse reasoning steps, map `store_render_plan` routes to component types, and manage skeleton/real-surface subtraction. A framework-agnostic utility (e.g. `computeSkeletons(reasoningSteps, surfaces)`) exported by thermidor would encapsulate this. The React hook wrapper would remain in the consumer application.                                                                                                                                                                      | `packages/thermidor` |
| **Simplify component subscription ergonomics**      | The consumer still mounts a `StateSourceProvider` and calls `useRemoteController(stateSource, componentId, componentType)`. The hand-written `stateSource` adapter object is no longer needed — the `UnifiedConverseController` satisfies `RemoteControllerSource` directly and is passed straight to `StateSourceProvider`. The React context/hook layer would remain in the consumer application.                                                                                                            | `packages/thermidor` |
| **Friendlier type aliases for consumers**           | The exported types `RemoteController`, `RemoteControllerSource`, `RemoteControllerStateForSchema` carry internal naming. Exporting consumer-facing aliases like `ComponentController<T>`, `ComponentControllerSource`, and `ComponentState<T>` would improve discoverability and readability in consumer code without breaking existing imports.                                                                                                                                                               | `packages/thermidor` |
| **Inline nested state in BundleDisplay contract**   | `BundleDisplay` currently reads other components' state (product-list slots) via `selectRemoteControllerState` + an unsafe `as ProductListState` cast. This cross-component state access is a workaround. The backend should inline product data directly in the BundleDisplay state (e.g. `tiers[].slots[].products[]` instead of `tiers[].slots[].surfaceRef`), making each component fully self-contained. This eliminates the need for any typed helper or cross-component access pattern on the frontend. | Backend              |

### Nice-to-have (non-blocking improvements)

| Item                                                   | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Unified search rendering via A2-UI**                 | SearchResultsPage (product grid, facets, sort, pagination) uses a separate RoutedInterface/Headless path. Evaluate with backend whether routed search could emit A2-UI surfaces with controllers instead, unifying the rendering pipeline. Key challenges: high-frequency bidirectional interactions (facet clicks → re-fetch), latency via converse stream vs direct API, large state volume. The `dispatchAction` wiring this depended on now exists, so it is no longer a prerequisite.                                                                                          |
| **Replace navigation state machine with React Router** | AppShell uses a manual reducer (`useNavigation`) and conditional rendering (`view === "search"`) for routing. Migrating to React Router would simplify JSX readability (each route has its own component, no conditionals), give free browser back-button support, and make the sample more representative of a real consumer integration. It would not significantly reduce the navigation logic complexity (effects that observe turns and trigger transitions, persisted RoutedInterface refs), but improves ergonomics for anyone reading the sample as an integration example. |
| **`@coveo/thermidor-react` package**                   | The `useRemoteController` hook is currently copy-pasted into each React consumer. Extracting it into a dedicated `@coveo/thermidor-react` package (or a `@coveo/thermidor/react` subpath export) would eliminate this boilerplate and ensure consumers get bug fixes and performance improvements automatically. `@coveo/thermidor` itself remains framework-agnostic.                                                                                                                                                                                                              | `packages/thermidor` |

### Resolved

| Item                                                     | Description                                                                                                                                                                                                                                                                                                                                                      |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Generate component props schemas in thermidor-schema** | ✅ The Zod generation script now produces component props schemas (`ProductCarouselPropsSchema`, `NextActionsBarPropsSchema`, etc.) from `schema/components/*.json`. Consumers import them directly — no more hand-written boilerplate in `components.tsx`.                                                                                                      |
| **Wire remote controller action dispatch**               | ✅ `UnifiedConverseController` now exposes `dispatchAction(action: RemoteControllerAction)`, which builds the A2uiAction envelope and POSTs it to the Converse API on the active turn. Sort, pagination, page-size, and next-actions dispatch end-to-end; the backend responds with an updated `StateSnapshot`. Remote controller actions are no longer a no-op. |
