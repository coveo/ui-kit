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

With `VITE_COVEO_ENDPOINT=http://localhost:3456/schema`, the sample posts to the mock's `/schema/api/preview/organizations/:orgId/agents/commerce/agui/converse` route, which serves the schema-driven templates (`schema-response-*.ts` in `@coveo/platform-mock-api`). `/schema/rest/organizations/:orgId/commerce/unstable/agentic/converse` and the short `/converse-schema` route serve the same templates. The `/converse`, `/rest/...` and `/api/preview/...` routes, without the `/schema` prefix, serve older templates this sample does not support.

### Mock scenarios

| Prompt                                                                     | Scenario                                                                                                                                                                                         |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `water sports`                                                             | Stateful decomposed commerce search with products, breadbox, pagination, sorting, and brand, price, and category facets                                                                          |
| `build a beginner surfing kit with budget, mid-range, and premium options` | BundleDisplay with 3 tiers (Budget/Mid-Range/Premium), a ProductSummary per slot, and NextActionsBar                                                                                             |
| `i like cold-water surfing. compare wetsuits for it`                       | ComparisonTable with 3 wetsuits, images, prices, annotations (Standout/Trade-off/Best for), an Additional information row with related documents (6, 2 and none), AI Summary, and NextActionsBar |
| `boating safety`                                                           | Discovery with 2 ProductCarousels (Life Jackets + Boating Safety Gear) and NextActionsBar                                                                                                        |
| `tell me more about the thermoflex winter wetsuit`                         | ProductResearchCard for the ThermoFlex Winter Wetsuit with a summary, 4 bullets, 6 related documents, and NextActionsBar                                                                         |
| Any other text (fallback)                                                  | NextActionsBar with suggested follow-up actions                                                                                                                                                  |

## Available scripts

| Command                  | Description                                                                      |
| ------------------------ | -------------------------------------------------------------------------------- |
| `pnpm dev`               | Start dev server against a live backend (no configuration needed)                |
| `pnpm dev:mock`          | Build deps, start mock API, and open dev server                                  |
| `pnpm dev:agent-gateway` | Start dev server against a local agent-gateway on port 8990 (needs `.env.local`) |
| `pnpm build`             | Production build                                                                 |
| `pnpm test`              | Run Vitest unit tests                                                            |
| `pnpm preview`           | Preview production build                                                         |

## Configuration

`pnpm dev` needs no configuration. With no `VITE_COVEO_ORGANIZATION_ID` set, the
sample falls back to the public `searchuisamples` organization — the same org and
intentionally-public API key the other samples use through
`getSampleSearchEngineConfiguration()` — which has the commerce agent enabled.

To point it at your own organization, copy `.env.example` to `.env.local` and set
`VITE_COVEO_ORGANIZATION_ID`. Doing so opts out of the sample defaults **as a
bundle**: the tracking id, locale, and platform environment all belong to
`searchuisamples`, so they are not mixed into another organization's
configuration. Set the ones you need alongside it.

See [`src/public-sample-configuration.ts`](src/public-sample-configuration.ts).

## Pull-request previews

This sample is published as a [pkg.pr.new](https://pkg.pr.new) StackBlitz template,
so every PR that affects `@coveo/thermidor` gets a link that boots this app against
that PR's build of the package. Because it needs no configuration, the link is
runnable as-is.

The template set lives in
[`.github/actions/publish-preview/action.yml`](../../../.github/actions/publish-preview/action.yml).

## Architecture

The app is a single page managed by `AppShell`:

```
AppShell (A2-UI provider + the session's renderer stream)
├── LandingPage        — Prompt input with suggestion pills, until the first prompt
└── ConversationPage   — One feed of every turn, search and conversation alike, with the prompt pinned below
```

Every turn shows the blocks the server produced for it, in order: the agent's text and display surfaces, and the gateway's search blocks. A search, a facet selection and a question to the agent all stay on the same page.

- `src/a2ui/surface-stream.ts` turns every turn's `response.a2uiMessages` into one renderer stream, so an update lands on its block wherever that block is in the feed. Each surface is drawn under a render id scoped to the turn that created it (servers may reuse a surface id across turns), and actions are sent back with the server surface id.
- Only the latest turn's blocks are interactive. The session only sends actions for the surfaces of the active turn, which the sample takes to be the latest one (it never calls `retry`, which can make an earlier turn active again), so blocks of earlier turns stay visible, selected facets included, but their controls are disabled.

### ConversationPage component tree

```
ConversationPage
├── ConversationThread (renders the list of turns)
│   └── per Turn:
│       ├── UserPromptBubble
│       ├── ErrorTurnBlock (if error)
│       └── per exchange (the turn's answer, then one per follow-up sent from it):
│           └── AgentResponseBlock
│               ├── ThinkingBlock (reasoning steps + spinner)
│               ├── StreamingMessage (streamed text)
│               └── TurnSurfaces (the exchange's blocks; disabled unless it is the latest turn)
│                   ├── A2UISkeleton (in place of a loading surface)
│                   ├── ProductCarousel (dumb: reads resolved props from {path} bindings)
│                   ├── BundleDisplay (dumb: reads resolved tiers + slot child ids from props)
│                   ├── ComparisonTable (dumb: reads resolved products, attributes + related documents from props)
│                   ├── ProductResearchCard (dumb: reads resolved product, summary, bullets + related documents from props)
│                   ├── NextActionsBar (dumb: reads resolved action items; sends a follow-up action)
│                   └── CommerceSearch (a gateway search block, see below)
└── PromptInput (pinned below the feed)
```

**ConversationThread** iterates over turns and delegates rendering to the appropriate block based on turn status. The key path is through **AgentResponseBlock**, which orchestrates the streaming experience: first showing a thinking indicator, then streaming text, then the turn's blocks: a skeleton in place of each surface whose data model declares `isLoading` while the exchange streams, and finally the resolved A2-UI catalog components once component state arrives via `/state/<id>` `updateDataModel` operations resolved into the renderer's data model.

The catalog renderers (ProductCarousel, BundleDisplay, ComparisonTable, ProductResearchCard, NextActionsBar) are **dumb**: each reads its resolved values directly from `props` (the renderer resolves each `{ "path": ... }` binding against its A2-UI data model), with no identity join and no controller hydration. A renderer sends an action with `context.dispatchAction`; it reaches `AppShell`'s `onAction` handler, which forwards it to the session.

A `NextActionsBar` item starts a follow-up: its answer streams into the same turn, and the page draws it as a new exchange below the one it follows, with the chip text as the shopper's message.

**Search options** (agent-gateway ADR-008) are `NextActionsBar` items of type `searchOption`. The gateway keeps the search behind each one and forwards only `{text, type, optionId}`; tapping one dispatches `selectSearchOption {optionId}`, and the gateway opens a new commerce-search surface on the same turn. It is drawn below the answer and scrolled into view. The mock API emits no search options; they need a local Agent Gateway.

### Search blocks (decomposed commerce)

A gateway search block is a decomposed commerce-search surface, drawn in the feed through the same renderer pipeline every other surface uses. The layout lives entirely on the A2-UI composition plane: the `commerce-search` root composes two `layout-stack` columns, and each generic `layout-stack` mounts its own children (in a column or row) by id.

The composition tree the mock emits is:

```
commerce-search (root)
├── search-sidebar   (layout-stack, column) → facet-manager → regular/numeric/category facets
└── search-main      (layout-stack, column)
    ├── breadbox
    ├── search-top    (layout-stack, row) → query-summary, sort
    ├── product-list
    └── search-bottom (layout-stack, row) → pagination, page-size
```

Each mounted node is a dumb catalog component (`CommerceSearch`, `LayoutStack`, `FacetManager`, the facets, `Breadbox`, `QuerySummary`, `Sort`, `ProductList`, `Pagination`, `PageSize`) that reads its resolved component state from `props` (the renderer resolves the node's `{ "path": ... }` bindings against its A2-UI data model). Container components mount their children by name following the standard A2-UI composition convention: `CommerceSearch` mounts `buildChild(props.sidebarChild)` and `buildChild(props.mainChild)`; `LayoutStack` and `FacetManager` mount their ordered `children` list in declared order. There is no positional read of the child list. Absent components render as empty slots without error.

There is no `search-box` on this surface: the query input is the prompt pinned below the feed, so the composition starts at the `query-summary` row.

These controls dispatch component actions: an interaction (sort, page, page size, facet selection or search, breadbox) surfaces through the renderer's `onAction` handler and is queued through the session. The session recovers the dispatching component from the active turn's surfaces, validates the action payload against the component's Zod action schema, and POSTs it over the HTTP Action_Channel; the producer replies with `/state/<id>` `updateDataModel` operations. Each control shows the shopper's choice optimistically until the reply lands, and the results dim meanwhile. In-progress facet-search input is held in local React state and is never written to the shared A2-UI data model.

### Key modules

| Module                                                   | Role                                                                                                                                                                                                                                                                                                                                                             |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/context/session.tsx`                                | Creates the `@coveo/thermidor` session and injects the `ComponentContractsSchema` it validates against                                                                                                                                                                                                                                                           |
| `src/components/AppShell.tsx`                            | Wires the catalog and the `onAction` handler into `A2UIProvider`, builds the session-wide renderer stream, and starts follow-up exchanges                                                                                                                                                                                                                        |
| `src/a2ui/surface-stream.ts`                             | Builds the session's renderer stream from every turn's `response.a2uiMessages`, places each surface under the turn that created it, marks loading placeholders, and maps renderer actions back to server surface ids                                                                                                                                             |
| `src/a2ui/surfaces.tsx`                                  | `ThermidorA2UIStream` feeds the stream to the renderer; `TurnSurfaces` draws one exchange's surfaces, or a skeleton for a loading one (thermidor owns the v1.0 → v0.9 downgrade)                                                                                                                                                                                 |
| `src/a2ui/components.tsx`                                | `createThermidorCatalog()`: registers every catalog component (conversational: ProductCarousel, BundleDisplay, ComparisonTable, ProductResearchCard, ProductSummary, NextActionsBar; decomposed commerce: CommerceSearch, LayoutStack, FacetManager, RegularFacet, NumericFacet, CategoryFacet, Breadbox, QuerySummary, Sort, ProductList, Pagination, PageSize) |
| `src/a2ui/CommerceSearch/`                               | `commerce-search` root — composes the sidebar and main columns and mounts them by id via `buildChild(id)`                                                                                                                                                                                                                                                        |
| `src/a2ui/LayoutStack/`                                  | Generic layout container — stacks its declared children in a column or row (direction is a presentation node prop); reused for the sidebar, main, and top/bottom rows                                                                                                                                                                                            |
| `src/a2ui/pending-dispatch.tsx`                          | Tracks dispatches through the session's action queue, and which regions an outstanding gesture makes stale                                                                                                                                                                                                                                                       |
| `src/a2ui/use-optimistic-value.ts`                       | Holds a control's intended value while its gesture is outstanding; sort, pagination, page size, and `NextActionsBar` use it directly, the facets and breadbox through their `use-optimistic-*.ts` hooks                                                                                                                                                          |
| `src/a2ui/use-optimistic-facet-search.ts`                | Keeps in-progress facet-search input in local React state and dispatches `search` actions; never writes in-progress input to the shared data model                                                                                                                                                                                                               |
| `src/a2ui/Skeleton/`                                     | Skeletons drawn in place of loading surfaces                                                                                                                                                                                                                                                                                                                     |
| `src/components/ConversationPage/turn-segments.ts`       | Splits a turn into exchanges, one per follow-up sent from it                                                                                                                                                                                                                                                                                                     |
| `src/components/ConversationPage/AgentResponseBlock.tsx` | Orchestrates streaming display: ThinkingBlock → StreamingMessage → the exchange's surfaces                                                                                                                                                                                                                                                                       |

### Data flow (conversational turn)

```
Backend (converse stream)
  ↓ SSE events (A2-UI v1.0 messages: createSurface + /state updateDataModel ops)
  ↓
Session (thermidor, via createSession) — folds each turn's response
  ↓ turn.response.a2uiMessages (v1.0 → v0.9, {path} bindings byte-for-byte)
  ↓ turn.response.surfaces (rootComponentType, isLoading)
  ↓
AppShell — buildSurfaceStream(turns): one stream, turn-scoped render ids, loading placeholders
  ↓
ThermidorA2UIStream — processMessages (catalog resolution + updateDataModel ops → renderer data model)
  ↓
TurnSurfaces (per exchange)
  ├── A2UISkeleton for each loading surface while its exchange streams
  └── A2UIRenderer → catalog components (ProductCarousel, BundleDisplay, etc.)
        ↓ read resolved values from props ({ "path": ... } bindings resolved by the renderer)

Action dispatch (consumer → producer):
  context.dispatchAction → renderer onAction → AppShell (render id → server id)
    → session action queue → validate payload (Zod) → HTTP POST (Action_Channel)
  ↓
  producer replies with /state/<id> updateDataModel ops (re-resolved into the renderer)
```

See [IMPLEMENTATION.md](./IMPLEMENTATION.md#state-and-validation-model) for the state and validation model.

## Further reading

- [IMPLEMENTATION.md](./IMPLEMENTATION.md) — State and validation model, rendering, action dispatch, workarounds, and known limitations
