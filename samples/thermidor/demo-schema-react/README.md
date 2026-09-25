# Thermidor Demo Schema React

A React sample demonstrating contract-driven A2-UI rendering using `@coveo/thermidor-schema`.

This sample uses catalog-based A2-UI resolution with validated component contracts from `@coveo/thermidor-schema`.

## Running locally with the Mock API

```bash
pnpm dev:mock
```

This single command:

1. Force-builds `@coveo/platform-mock-api`, `@coveo/mock-converse-api`, and `@coveo/thermidor`
2. Builds the sample `@samples/thermidor-demo-schema-react`
3. Starts the mock Converse API on port 3456
4. Starts the Vite dev server at http://localhost:5173 (pointing to `http://localhost:3456/schema`)

The mock API is automatically stopped when you close Vite (Ctrl+C).

This sample uses the `/converse-schema` route on the mock server (via `VITE_COVEO_ENDPOINT=http://localhost:3456/schema`). This routes to dedicated schema-driven templates (`schema-response-*.ts`) that are separate from the legacy templates used by `demo-react` on the standard `/converse` route. Both samples share the same mock server but don't interfere with each other.

### Mock scenarios

| Prompt                                                                     | Scenario                                                                                                                   | Status                 |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| `water sports`                                                             | Stateful decomposed commerce search with products, pagination, sorting, and brand, price, and category facets              | ✅ Fully functional    |
| `wetsuits`                                                                 | Former decomposed commerce search scenario                                                                                 | ❌ No longer supported |
| `build a beginner surfing kit with budget, mid-range, and premium options` | BundleDisplay with 3 tiers (Budget/Mid-Range/Premium), product-list state per slot, and NextActionsBar                     | ✅ Fully functional    |
| `i like cold-water surfing. compare wetsuits for it`                       | ComparisonTable with 3 wetsuits, images, prices, annotations (Standout/Trade-off/Best for), AI Summary, and NextActionsBar | ✅ Fully functional    |
| `boating safety`                                                           | Discovery with 2 ProductCarousels (Life Jackets + Boating Safety Gear) and NextActionsBar                                  | ✅ Fully functional    |
| Any other text (fallback)                                                  | NextActionsBar with suggested follow-up actions                                                                            | ✅ Fully functional    |
| `what should i pack for a snorkeling trip?`                                | Conversational with surfaces (built for `demo-react`, legacy format)                                                       | ❌ Not supported       |
| `kayaks`                                                                   | Routed commerce search (built for `demo-react`)                                                                            | ❌ Not supported       |
| `surfboard care`                                                           | Routed search (built for `demo-react`)                                                                                     | ❌ Not supported       |

## Available scripts

| Command         | Description                                                     |
| --------------- | --------------------------------------------------------------- |
| `pnpm dev`      | Start dev server (requires backend credentials in `.env.local`) |
| `pnpm dev:mock` | Build deps, start mock API, and open dev server                 |
| `pnpm build`    | Production build                                                |
| `pnpm test`     | Run Vitest unit tests                                           |
| `pnpm preview`  | Preview production build                                        |

## Architecture

The app is structured around three views managed by `AppShell`:

```
AppShell (providers + navigation)
├── LandingPage        — Prompt input with suggestion pills
├── ConversationPage   — Chat with A2-UI rendering (catalog-driven)
└── SearchResultsPage  — Mounts the decomposed commerce-search surface through the A2-UI renderer pipeline (the `commerce-search` root composes two `layout-stack` columns that mount the rest of the surface by id)
```

Navigation is determined by what the backend returns:

- Turn whose discovered surface has a `rootComponentType` of `CommerceSearch` → SearchResultsPage mounting the surface via `ThermidorA2UISurfaces`
- Turn with `agentResponse` (reasoning steps / surfaces) → ConversationPage (A2-UI catalog renderers)

### ConversationPage component tree

```
ConversationPage
├── ProductTargeting (layout: prompt input + product targeting pills)
│   ├── PromptInput (text field + submit)
│   ├── Targeting toolbar (attach button, product pills, clear)
│   └── TargetingProvider (context for targeting mode)
│       └── ConversationThread (renders the list of turns)
│           └── per Turn:
│               ├── UserPromptBubble
│               ├── ErrorTurnBlock (if error)
│               ├── RoutedTurnBlock (if routed to search)
│               └── AgentResponseBlock (if agentResponse)
│                   ├── ThinkingBlock (reasoning steps + spinner)
│                   ├── StreamingMessage (streamed text)
│                   ├── A2UISkeleton[] (placeholders during streaming)
│                   └── ThermidorA2UISurfaces (catalog resolution)
│                       ├── ProductCarousel (dumb: reads resolved props from {path} bindings)
│                       ├── BundleDisplay (dumb: reads resolved tiers + slot child ids from props)
│                       ├── ComparisonTable (dumb: reads resolved products + attributes from props)
│                       └── NextActionsBar (dumb: reads resolved action items; dispatch via onAction)
└── "Back to search" floating button (if canGoBackToSearch)
```

**ProductTargeting** wraps the entire conversation view. It provides the prompt input, a toolbar for attaching product context (users can click products in the conversation to pin them), and injects selected product names into the prompt on submit.

**ConversationThread** iterates over turns and delegates rendering to the appropriate block based on turn status. The key path is through **AgentResponseBlock**, which orchestrates the streaming experience: first showing a thinking indicator, then streaming text, then skeleton placeholders (inferred from `store_render_plan` tool calls), and finally the resolved A2-UI catalog components once component state arrives via `/state/<id>` `updateDataModel` operations resolved into the renderer's data model.

The catalog renderers (ProductCarousel, BundleDisplay, ComparisonTable, NextActionsBar) are **dumb**: each reads its resolved values directly from `props` (the renderer resolves each `{ "path": ... }` binding against its A2-UI data model), with no identity join and no controller hydration. Actions surface through the renderer's `onAction` handler, wired to `session.dispatchAction`.

### SearchResultsPage (decomposed commerce)

SearchResultsPage reads the active turn's A2-UI activities and hands them to `ThermidorA2UISurfaces`, mounting the decomposed commerce-search surface through the same renderer pipeline every other surface uses. The layout lives entirely on the A2-UI composition plane: the `commerce-search` root composes two `layout-stack` columns, and each generic `layout-stack` mounts its own children (in a column or row) by id.

The composition tree the mock emits is:

```
commerce-search (root)
├── search-sidebar   (layout-stack, column) → facet-manager → regular/numeric/category facets
└── search-main      (layout-stack, column)
    ├── search-top    (layout-stack, row) → query-summary, sort
    ├── product-list
    └── search-bottom (layout-stack, row) → pagination, page-size
```

Each mounted node is a dumb catalog renderer (`CommerceSearchRenderer`, `LayoutStackRenderer`, `FacetManagerRenderer`, the facet renderers, `QuerySummaryRenderer`, `SortRenderer`, `ProductListRenderer`, `PaginationRenderer`, `PageSizeRenderer`) that reads its resolved component state from `props` (the renderer resolves the node's `{ "path": ... }` bindings against its A2-UI data model). Container renderers mount their children by name following the standard A2-UI composition convention: `CommerceSearch` mounts `children(props.sidebarChild)` and `children(props.mainChild)`; `LayoutStack` and `FacetManager` mount their ordered `children` `ChildList` in declared order. There is no positional read of the child list. Absent components render as empty slots without error.

There is no `search-box` on this surface: the query input is the app-level search bar above the surface, so the composition starts at the `query-summary` row.

These controls dispatch component actions: an interaction (sort, page, page-size, facet search) surfaces through the renderer's `onAction` handler, which is wired to `session.dispatchAction`. `session.dispatchAction` recovers the dispatching component from the active turn's surfaces, validates the action payload against the component's Zod action schema, and POSTs it over the HTTP Action_Channel; the producer replies with `/state/<id>` `updateDataModel` operations. In-progress facet-search input is held in local React state and is never written to the shared A2-UI data model.

### Key modules

| Module                                                   | Role                                                                                                                                                                                                                                                                                                                                                |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/hooks/use-navigation.ts`                            | Navigation state machine (view transitions, persisted RoutedInterface, submit handling)                                                                                                                                                                                                                                                             |
| `src/a2ui/components.tsx`                                | Catalog definitions and renderers registered via `createCatalog`: conversational (ProductCarousel, BundleDisplay, ComparisonTable, NextActionsBar, ProductSummary) and decomposed commerce (CommerceSearch, LayoutStack, FacetManager, RegularFacet, NumericFacet, CategoryFacet, QuerySummary, Sort, ProductList, Pagination, PageSize, SearchBox) |
| `src/a2ui/CommerceSearch/`                               | `commerce-search` root renderer — composes the sidebar and main columns and mounts them by id via the A2-UI `children(id)` function                                                                                                                                                                                                                 |
| `src/a2ui/LayoutStack/`                                  | Generic layout container renderer — stacks its declared children in a column or row (direction is a presentation node prop); reused for the sidebar, main, and top/bottom rows                                                                                                                                                                      |
| `src/a2ui/surfaces.tsx`                                  | Mounts the renderer-ready v0.9 stream read off `response.a2uiMessages` (thermidor owns the v1.0 → v0.9 downgrade)                                                                                                                                                                                                                                   |
| `src/a2ui/use-optimistic-facet-search.ts`                | Keeps in-progress facet-search input in local React state ("backend wins" reconcile) and dispatches a validated `search` action over the HTTP Action_Channel; never writes in-progress input to the shared data model                                                                                                                               |
| `src/a2ui/Skeleton/`                                     | Skeleton placeholders during streaming                                                                                                                                                                                                                                                                                                              |
| `src/components/ConversationPage/AgentResponseBlock.tsx` | Orchestrates streaming display: ThinkingBlock → StreamingMessage → Skeletons → A2UI Surfaces                                                                                                                                                                                                                                                        |

### Data flow (conversational turn)

```
Backend (converse stream)
  ↓ SSE events (A2-UI v1.0 messages: createSurface + /state updateDataModel ops)
  ↓
Session (thermidor, via createSession) — validates inbound updateDataModel ops in transit
  ↓ state.activeTurn.agentResponse
  ↓
AgentResponseBlock
  ├── Skeletons (from store_render_plan tool calls)
  └── ThermidorA2UISurfaces
        ↓ thermidor response.a2uiMessages (v1.0 → v0.9, {path} bindings byte-for-byte)
        ↓ processMessages (catalog resolution + updateDataModel ops → renderer data model)
        ↓
        Dumb Catalog Renderers (ProductCarousel, BundleDisplay, etc.)
          ↓ read resolved values from props ({ "path": ... } bindings resolved by the renderer)
          ↓
          Rendered component

Action dispatch (consumer → producer):
  renderer onAction → session.dispatchAction → validate payload (Zod) → HTTP POST (Action_Channel)
  ↓
  producer replies with /state/<id> updateDataModel ops (re-resolved into the renderer)
```

### Key differences from demo-react

- Imports component contracts from `@coveo/thermidor-schema` (generated Zod schemas + TypeScript types)
- Each node carries a single `id`/`component` identity (no `props.componentId`/`componentType`); contract resolution uses the `component` discriminant
- Component state is delivered inline through the A2-UI data model via `/state/<id>` `updateDataModel` operations (not AG-UI `StateSnapshot`); renderers read resolved values from `{ "path": ... }` bindings
- Dumb renderers read resolved props directly — no `buildRemoteController` / `selectRemoteControllerState` identity join; BundleDisplay reads its resolved tiers and per-slot child ids from its own props
- Container composition uses the standard A2-UI named-slot convention (`sidebarChild`/`mainChild`; ordered `children`), mounted by name via the renderer's `children(id)` function
- Actions are dispatched through a single entry point, `session.dispatchAction` wired as the renderer's `onAction`, over the HTTP Action_Channel
- Props schemas for catalog components are generated by `@coveo/thermidor-schema` and imported directly

### State and validation model

This sample follows the state and validation model recorded in [ADR-011](https://github.com/coveo-platform/thermidor-schema/blob/main/docs/ADR-011-inline-component-state-a2-ui-data-model.md) of `@coveo/thermidor-schema`:

- **Client-side Zod validation is retained.** Component state written to the A2-UI data model and action payloads are validated against the generated Zod schemas derived from the Thermidor contract. The validation runs inside `@coveo/thermidor` on its transport/dispatch path, transparently to the sample — the sample never invokes, imports, or is aware of the validators.
- **Displayed-value formatting is produced by the agent.** The agent writes pre-formatted display values into the data model; the sample renders the agent-provided formatted value as-is and applies no additional client-side formatting.
- **A2-UI is the only supported source of component state.** The sample obtains component state solely through A2-UI (the `/state` data-model bindings); component state obtained through any non-A2-UI source is unsupported.
- **Intentional divergence from A2-UI bidirectional input binding.** The sample deliberately does not use A2-UI standard bidirectional input components. In-progress user input (for example a facet search box being typed) is held in the sample's local React state and is never written to the shared A2-UI data model, and component actions are dispatched over the non-bidirectional HTTP Action_Channel.

## Further reading

- [IMPLEMENTATION.md](./IMPLEMENTATION.md) — Conformity validation, workarounds, known limitations, and next steps
