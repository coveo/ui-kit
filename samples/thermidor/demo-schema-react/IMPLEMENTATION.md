# Implementation Details

Technical decisions, workarounds, and known limitations for `demo-schema-react`.

## State and validation model

This sample implements the inline component-state model recorded in [ADR-012](https://github.com/coveo-platform/thermidor-schema/blob/beta/docs/ADR-012-inline-component-state-a2-ui-data-model.md) of `@coveo/thermidor-schema` (which supersedes ADR-002's AG-UI state transport). Component state travels inline through the A2-UI data model via `/state/<id>` `updateDataModel` operations, and node props resolve from it through A2-UI Data_Binding objects `{ "path": <JSON Pointer> }`. Four points define the model:

- **Validation runs inside `@coveo/thermidor`.** The sample injects the contract once (`ComponentContractsSchema`, passed as `contracts` to `createSession` in `src/context/session.tsx`) and never calls a validator itself. The session validates outbound action payloads before it sends them, and inbound `updateDataModel` ops before it applies them to `session.state`. The renderer is fed from `session.a2uiMessages` instead, which is not filtered; see [Known limitations](#inbound-component-state-reaches-the-renderer-without-validation).
- **Display text comes from the agent; prices and counts are formatted locally.** Labels, headings, and summaries are rendered as the agent wrote them. Prices are formatted by `formatPrice` (`$12.34`) and result counts by `toLocaleString()`.
- **A2-UI is the only supported source of component state.** The sample obtains component state solely through A2-UI (the `/state` data-model bindings); component state obtained through any non-A2-UI source is unsupported.
- **Intentional divergence from A2-UI bidirectional input binding.** The sample deliberately does not use A2-UI standard bidirectional input components. In-progress user input (for example a facet search box being typed) is held in the sample's local React state and is never written to the shared A2-UI data model, and component actions are dispatched over the non-bidirectional HTTP Action_Channel.

## v1.0 → v0.9 downgrade (owned by `@coveo/thermidor`)

Agent Gateway emits A2-UI **v1.0** exclusively. Every available renderer consumes **v0.9**:
`@copilotkit/a2ui-renderer` builds its `MessageProcessor` from `@a2ui/web_core/v0_9`, and
`@a2ui/web_core@0.9.0` publishes no `v1_0` subpath.

**The sample does not perform this conversion.** `@coveo/thermidor` converts the stream to
v0.9 and exposes it for the whole session as `session.a2uiMessages`, which the sample feeds
to one renderer through `ThermidorA2UIStream` (see
[Rendering every turn on one page](#rendering-every-turn-on-one-page)). Consumers write no
version-aware code of their own.

The conversion, its rationale, and its retirement condition live in the package:
`packages/thermidor/src/session/a2ui-v09-projection.ts`, recorded as interim debt in the
ADR-015 addendum. In short: splitting v1.0's single `createSurface` into `createSurface` +
`updateComponents` is the only load-bearing transformation, because the v0.9
`processCreateSurfaceMessage` reads only `{ surfaceId, catalogId, theme, sendDataModel }` and
silently discards inline `components[]`. Flat v1.0 nodes are forwarded byte-for-byte, so every
`{ "path": ... }` binding and composition link survives; `updateDataModel` and `deleteSurface`
pass through.

## Flat component nodes (`id`/`component`)

Every emitted A2-UI node follows the A2-UI v1.0 flat adjacency-list shape
([ADR-013](https://github.com/coveo-platform/thermidor-schema/blob/beta/docs/ADR-013-flat-adjacency-list-node-conformance.md)):
a single identity pair, with presentation props, Data_Binding objects, and composition links at
the top level. There is no `props` wrapper.

```jsonc
{
  "id": "facet-brand-2", // A2-UI node id (adjacency-list / mount key)
  "component": "RegularFacet", // A2-UI component type (catalog renderer key + contract discriminant)
  "values": {"path": "/state/facet-brand-2/values"}, // Data_Binding into the surface's data model
}
```

`id` drives the adjacency-list tree (the renderer mounts by id) and `component` (PascalCase) selects the catalog renderer. `@coveo/thermidor` resolves the contract from the `component` discriminant directly, so no second identity is needed. The earlier `props.componentId` / `props.componentType` pair, which existed only to join an AG-UI state slice to its node, was removed with the AG-UI state transport, and the base component contract now rejects a node carrying either.

Renderers read resolved values from `props` (the renderer resolves each `{ "path": ... }` binding against the surface's data model) and never hydrate by identity.

## Catalog and Zod version

`@copilotkit/a2ui-renderer` is built against **Zod 3**. The sample therefore pins `zod@3` and imports every runtime schema from the Zod 3 projection, `@coveo/thermidor-schema/zod3`: the per-component `*PropsSchema`, `ComponentContractsSchema`, and `THERMIDOR_CATALOG_ID`. Types come from either entry point: some files import them from the package root (`Product`, `SortAction`), while the facets and the breadbox import theirs (`RegularFacetAction`, `RegularFacetProps`, `BreadboxFacet`, …) from `@coveo/thermidor-schema/zod3`.

Each catalog component is declared with the renderer's `createReactComponent({name, schema}, render)`, where `name` is the node's `component` and `schema` its `*PropsSchema`. `createThermidorCatalog()` (`src/a2ui/components.tsx`) registers them as `new Catalog(THERMIDOR_CATALOG_ID, components)`. No type casts or bridge helpers are needed.

When the renderer moves to Zod 4, switch every `@coveo/thermidor-schema/zod3` import, schemas and types alike, to the package root and drop the `zod@3` pin.

## Rendering every turn on one page

The conversation is a single feed: every turn keeps its blocks on the page, and a search, a facet selection, and a question to the agent all stay in place.

- **One renderer stream for the session.** Surfaces live in the session (`@coveo/thermidor` ADR-018): a surface lives from its `createSurface` until its `deleteSurface`, whichever turn carries them. `AppShell` feeds `session.a2uiMessages`, which only grows, to one renderer; `ThermidorA2UIStream` feeds it only the messages it has not seen. Each turn's `response.surfaces` lists the live surfaces it created, so the page draws them under that turn. A producer mints a new surface id for each surface it creates; the mock does so for every prompt.
- **Only the latest turn is interactive.** The session resolves an action's component across every live surface, so earlier blocks could take actions. The sample still keeps them read-only: `TurnSurfaces` wraps every turn but the latest in a disabled `fieldset`, so earlier blocks stay readable, selected facets included, but cannot be used.
- **Follow-up exchanges.** `@coveo/thermidor` streams an action's response into the turn that is already shown. For `NextActionsBar` actions (`selectAction`, `selectSearchOption`), `AppShell` records how much the turn held when the action was sent (`startFollowUp`), and `splitTurn` (`src/components/ConversationPage/turn-segments.ts`) draws the answer as its own exchange after the one it follows.

## Loading placeholders (✅ data-model driven)

While an exchange streams, a skeleton marks each block that is still loading. A2-UI defines no skeleton: a loading placeholder is an ordinary surface whose **data model** declares `isLoading: true`, and it follows the A2-UI surface lifecycle. The sample infers nothing from `surfaceId`s, which the spec treats as opaque, nor from reasoning steps.

| Question                   | Answer                                                                                         |
| -------------------------- | ---------------------------------------------------------------------------------------------- |
| **Whether** to show one    | The surface's data model has `isLoading: true`                                                 |
| **Which** skeleton to show | The root node's `component` (`ProductCarousel`, `NextActionsBar`, …), mapped by `A2UISkeleton` |
| **When** it ends           | The agent deletes the surface (`deleteSurface`), or writes `isLoading: false`                  |
| **While** it is drawn      | Its exchange streams: the turn is `streaming`, or its follow-up is in flight                   |

### What the agent emits

In Thermidor mode, the agent announces a block with a placeholder (a bare root with no bindings), then streams the content in a snapshot that **replaces the placeholder's activity in place** (same `messageId`, `replace: true`), so the block keeps its position:

```
// placeholder
createSurface: {
  surfaceId: "<opaque>",
  components: [{ id: "root", component: "ProductCarousel" }],
  dataModel: { isLoading: true }
}

// content, in the same activity
deleteSurface: { surfaceId: "<placeholder id>" }
createSurface: { surfaceId: "<content id>", components: [...] }
```

A placeholder the agent abandons is deleted the same way. The mock templates emit this shape, with placeholder ids derived from each template's `runId`. Each one announces its main block (`ProductCarousel`, `BundleDisplay`, `ComparisonTable`, `ProductResearchCard`) right after routing, before the content streams; the `NextActionsBar` placeholder comes only after the main block's content and state, shortly before the actions themselves.

### How the sample draws it

- `@coveo/thermidor` derives `response.surfaces` from the stream: each `DiscoveredSurface` carries `rootComponentType` and `isLoading`, and a deleted surface leaves the list.
- `AppShell` maps each loading surface's id to its root component type (`loadingSurfaces`). `ThermidorA2UIStream` feeds the renderer and shares that map with the page it wraps.
- `TurnSurfaces` draws `A2UISkeleton` for a loading surface in the place its content takes, and the `A2UIRenderer` otherwise.
- A placeholder is drawn only while its exchange streams (`TurnSurfaces`' `isStreaming`: the last exchange of a `streaming` turn, or of the turn whose follow-up is in flight). A placeholder the agent never deletes (a cancelled run, an error, a restored session) is abandoned once the exchange ends, and nothing is drawn for it. It stays in `surfacesByTurn`, so the split of a turn into follow-up exchanges is unchanged.

## Action dispatch and inline state transport

A catalog component sends an action with the renderer's `context.dispatchAction(action)`. The renderer surfaces it as an A2-UI client-to-server message through the `onAction` handler of `A2UIProvider`, which `AppShell` wires to its own `handleAction`:

- The session sends one request at a time, withholds a dispatch made while another request is in flight, and exposes the one in flight (`request` in `session.getSnapshot()`). `src/a2ui/session-request.tsx` turns it into the sample's lock rule: every request locks the active surface except a facet search (`search`, `clearSearch`, `showMoreSearchResults`), so typing in a facet search keeps the surface usable. `useGesture` drops a gesture while any request is in flight, a facet search included, and reads `session.request` synchronously, so a double click never sends twice, even before the lock renders. A facet search that fires during a request waits until the session is free, sending the latest query.
- A failed action never fails a turn: `actionError` in `session.getSnapshot()` names it, and `TurnSurfaces` shows its message in an alert under the block it came from (matched on `surfaceId`), until the next action or prompt.
- While the surface is locked, `TurnSurfaces` disables the active turn's `fieldset` and sets `aria-busy`. The whole surface dims and ignores the pointer, only after 150 ms so a fast reply never flashes it; the exchange that streams is disabled without dimming, so its content arrives at full strength. Focus returns to the control the shopper used once the surface unlocks, without scrolling. The prompt input is disabled by the same rule.
- `NextActionsBar` actions (`selectAction`, `selectSearchOption`) start a [follow-up exchange](#rendering-every-turn-on-one-page) before they are sent.

A prompt is sent with `session.dispatchAction({name: 'submitPrompt', payload: {prompt}})`, which opens a new turn.

For a component action, `@coveo/thermidor`:

- recovers the dispatching component from the session's live surfaces, validates the action payload against the component's generated Zod action schema, and POSTs it over the non-bidirectional HTTP Action_Channel. It is a plain request, not A2-UI bidirectional data binding;
- never rejects: a message with no `userAction`, an unresolved component, or a payload that fails validation is withheld with a dev-only warning and nothing is sent.

The producer replies by writing updated component state inline through the A2-UI data model as `/state/<id>` `updateDataModel` operations:

- A whole-component op targets the component's state root (`/state/<id>`); a partial op targets a sub-path beneath it and updates only the addressed fields (the incremental semantics of the A2-UI data model). The renderer owns the data model and re-resolves the affected `{ "path": ... }` bindings.
- `@coveo/thermidor` validates each inbound op in transit (a whole-component op against the `*State` schema, a partial op against the sub-schema at its path) before applying it to `session.state`. The renderer stream is not filtered by that validation; see [Known limitations](#inbound-component-state-reaches-the-renderer-without-validation).

## Optimistic updates

Search controls show the shopper's choice right away instead of waiting for the producer's reply:

- Each control shows the value its gesture expects with React's `useOptimistic`. `useGesture` (`src/a2ui/session-request.tsx`) runs the gesture in a transition that applies the optimistic value, and sends the action through `session.sendAndWait()`, so the optimistic value shows until the session has answered the gesture, whatever the outcome, then gives way to the producer's. Sort, pagination and page size do it in their component; the facets and the breadbox go through a `use-optimistic-*.ts` hook next to their component, which computes the expected value. A gesture sent while the surface is locked is dropped before it changes anything.
- The surface lock dims the results while a gesture is in flight, so the product list and the query summary never read as current while a control already shows the new choice.
- Facet search keeps the typed text in local state (`use-optimistic-facet-search.ts`) rather than as an optimistic hold, and sends one search once typing pauses (200 ms). A keystroke that never reaches the producer leaves the field untouched, and the field is never written to the shared data model.
- The Breadbox moves focus after a removal once the surface unlocks: a locked surface's buttons are disabled and can't take focus.

## Related decisions

`@coveo/thermidor-schema` ([repository](https://github.com/coveo-platform/thermidor-schema/tree/beta/docs)):

- **ADR-012** — Inline component state through the A2-UI data model; supersedes ADR-002 (AG-UI controller state transport).
- **ADR-013** — Flat A2-UI v1.0 adjacency-list node.
- **ADR-007** — A2-UI adjacency-list composition.

`@coveo/thermidor` (`packages/thermidor/docs/internal/adr/`):

- **ADR-015** — Surface derivation (`response.surfaces`), with addenda for the v0.9 renderer projection and for loading placeholders.
- **ADR-016** — Inline-state consumption: renderers read resolved props, and `session.dispatchAction` is the single dispatch entry point (the remote controller was removed).

How the sample follows them:

| Principle                                                          | Implementation                                                                                            |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| Server-owned component state, not mutated locally by the renderer  | Server writes `/state/<id>` `updateDataModel` ops; the renderer owns the data model and resolves bindings |
| Component state is transported inline through the A2-UI data model | `/state/<id>` `updateDataModel` ops resolved into the renderer's data model (no AG-UI `StateSnapshot`)    |
| A node carries a single identity (`id` + `component`)              | Flat nodes in `createSurface.components[]`, with `{ "path": ... }` bindings at the top level              |
| Renderers read resolved state from `props` (no identity join)      | Each `createReactComponent` renderer reads `props`; there is no `componentId` correlation                 |
| Containers mount their children by name or ordered list            | `CommerceSearch` mounts `sidebarChild` / `mainChild`; `LayoutStack` and `FacetManager` mount `children`   |
| Actions go through the session's single dispatch path              | `context.dispatchAction` → `onAction` → session → validated payload → HTTP Action_Channel                 |

## Known limitations / Next steps

### Inbound component state reaches the renderer without validation

`@coveo/thermidor` validates inbound `updateDataModel` ops only on their way into `session.state`, and the sample never reads `session.state`. `session.a2uiMessages` is derived from the raw activities, so the renderer receives:

- every `updateDataModel` op, conforming or not;
- the state seeded inline by `createSurface.dataModel` (keys such as `/state/<nodeId>`), which the projection turns into `updateDataModel` ops and which `session.state` never reads at all.

Non-conforming component state from the producer therefore still changes what the sample renders. Closing this gap belongs in `@coveo/thermidor`, not in the sample, and must cover both paths: filtering only the projected `updateDataModel` ops would still let the `createSurface.dataModel` seed through.

### Dynamic composition updates not exercised (facet reorder / add / remove)

Composition is emitted **once** in the initial `createSurface` and never changed afterwards. Action responses only re-emit `/state/<id>` `updateDataModel` ops (per-component data), so the set and order of facets are fixed for the surface's lifetime: the facet-manager node's `children` (`['facet-brand-2', 'facet-price-2', 'facet-category-2']`) is a static constant. No mock scenario reorders facets, adds one, or removes one.

A real backend can reorder facets (relevance-driven) or add/remove them dynamically. Before that is supported, note the following:

- **`updateComponents` is a bare pass-through.** In the projection (`packages/thermidor/src/session/a2ui-v09-projection.ts`), `createSurface` splits into `createSurface` + `updateComponents`, while an inbound `updateComponents` is forwarded as-is. Under the flat v1.0 node model that is correct, but it has never been exercised by a real dynamic composition update, so treat it as unverified rather than known-good.
- **Reorder / add are supported by the protocol; remove is not, directly.** A2UI v0.9 defines `updateComponents` as _adding to or updating_ components in a surface (adjacency list via `children`); reordering the facet-manager `children` and adding a new facet node fit that contract, and `FacetManager` already re-renders from its resolved `children` list. There is no component-removal primitive: dropping a facet means emitting a `children` list without its id (the orphaned node lingers in the surface) or recreating the surface via `deleteSurface` + `createSurface`.

Capture this before wiring dynamic facet composition.

### Temporary workarounds (to remove when upstream dependencies evolve)

| Item                      | Description                                                                                                                                                           | Remove when                                                           |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| **v1.0 → v0.9 downgrade** | Owned by `@coveo/thermidor` (`session.a2uiMessages`); see the ADR-015 addendum.                                                                                       | `@a2ui/web_core` ships a `v1_0` subpath AND the renderer imports it   |
| **Zod 3 projection**      | The sample pins `zod@3` and imports runtime schemas from `@coveo/thermidor-schema/zod3` to match the renderer.                                                        | `@copilotkit/a2ui-renderer` upgrades to Zod 4                         |
| **Follow-up exchanges**   | `startFollowUp` / `splitTurn` split one turn into exchanges because an action's response streams into the turn already shown, which also does not count as streaming. | `@coveo/thermidor` models an action's run as its own exchange or turn |

### Consumer DX improvements (simplify what the consumer must implement)

| Item                        | Description                                                                                                                                 | Owner                |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| **Follow-ups as exchanges** | Consumers rebuild exchanges from activity and message counts (`turn-segments.ts`). Exposing them on the turn would remove that bookkeeping. | `packages/thermidor` |
