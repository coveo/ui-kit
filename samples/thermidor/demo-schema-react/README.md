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
| `pnpm dev:local`         | Start dev server using your `.env.local`                                         |
| `pnpm dev:mock`          | Build deps, start mock API, and open dev server                                  |
| `pnpm dev:agent-gateway` | Start dev server against a local agent-gateway on port 8990 (needs `.env.local`) |
| `pnpm build`             | Production build                                                                 |
| `pnpm test`              | Run Vitest unit tests                                                            |
| `pnpm preview`           | Preview production build                                                         |

## Configuration

`pnpm dev` needs no configuration. It runs Vite in `demo` mode, which loads the
committed [`.env.demo`](.env.demo). In `demo` mode, Vite gives `.env.demo`
precedence over `.env.local`, so `pnpm dev` ignores your `.env.local`.

To point the sample at your own organization, copy `.env.example` to `.env.local`,
set `VITE_COVEO_ORGANIZATION_ID`, and run `pnpm dev:local`. With no
`VITE_COVEO_ORGANIZATION_ID` set, `pnpm dev:local` falls back to the public
`searchuisamples` organization — the same org and intentionally-public API key
the other samples use through `getSampleSearchEngineConfiguration()` — which has
the commerce agent enabled. Setting an organization opts out of those defaults
**as a bundle**: the agent configuration id, tracking id, and platform environment all belong to
`searchuisamples`, so they are not mixed into another organization's
configuration. Set the ones you need alongside it: `VITE_COVEO_AGENT_CONFIGURATION_ID`
and `VITE_COVEO_TRACKING_ID` are required. The locale comes from the configured agent.

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
├── LandingPage        — The search box with suggestion pills, until the first prompt
└── ConversationPage   — One feed of every turn, search and conversation alike, with the search box pinned below
```

Every turn shows the blocks the server produced for it, in order: the agent's text and display surfaces, and the gateway's search blocks. A search, a facet selection and a question to the agent all stay on the same page.

- `AppShell` feeds `session.a2uiMessages`, the whole session's renderer stream, to a single renderer, so an update lands on its block wherever that block is in the feed. Surfaces live in the session (`@coveo/thermidor` ADR-018), and each turn's `response.surfaces` tells the page where to draw them. Actions go back to the session as they are.
- Only the latest turn's blocks are interactive. The session accepts actions on any live surface; keeping earlier blocks read-only is the sample's choice, so blocks of earlier turns stay visible, selected facets included, but their controls are disabled.

### ConversationPage component tree

```
ConversationPage
├── ConversationThread (renders the list of turns)
│   └── per Turn:
│       ├── UserPromptBubble (the prompt, or the text of the follow-up chip that opened the turn)
│       ├── ErrorTurnBlock (if error)
│       └── AgentResponseBlock
│           ├── ThinkingBlock (reasoning steps + spinner)
│           ├── StreamingMessage (streamed text)
│           └── TurnSurfaces (the turn's blocks; disabled unless it is the latest turn)
│               ├── A2UISkeleton (in place of a loading surface)
│               ├── ProductCarousel (dumb: reads resolved props from {path} bindings)
│               ├── BundleDisplay (dumb: reads resolved tiers + slot child ids from props)
│               ├── ComparisonTable (dumb: reads resolved products, attributes + related documents from props)
│               ├── ProductResearchCard (dumb: reads resolved product, summary, bullets + related documents from props)
│               ├── NextActionsBar (dumb: reads resolved action items; sends a follow-up action)
│               └── CommerceSearch (a gateway search block, see below)
└── SessionSearchBox (pinned below the feed: the session shell's search box)
```

**ConversationThread** iterates over turns and delegates rendering to the appropriate block based on turn status. The key path is through **AgentResponseBlock**, which orchestrates the streaming experience: first showing a thinking indicator, then streaming text, then the turn's blocks: a skeleton in place of each surface whose data model declares `isLoading` while the turn streams, and finally the resolved A2-UI catalog components once component state arrives via `/state/<id>` `updateDataModel` operations resolved into the renderer's data model.

The catalog renderers (ProductCarousel, BundleDisplay, ComparisonTable, ProductResearchCard, NextActionsBar) are **dumb**: each reads its resolved values directly from `props` (the renderer resolves each `{ "path": ... }` binding against its A2-UI data model), with no identity join and no controller hydration. A renderer sends an action with `context.dispatchAction`; it reaches `AppShell`'s `onAction` handler, which forwards it to the session.

A `NextActionsBar` item starts a follow-up: Agent Gateway announces its actions as turn-opening with the bar, so `@coveo/thermidor` answers it in a new turn, which the page draws right below the answer it follows, with the chip text as the shopper's message.

**Search options** (agent-gateway ADR-008) are `NextActionsBar` items of type `searchOption`. The gateway keeps the search behind each one and forwards only `{text, type, optionId}`; tapping one dispatches `selectSearchOption {optionId, text}`, and the gateway opens a new commerce-search surface in a turn of its own, drawn below the answer it follows, with the option's text as the shopper's message. The mock API emits no search options; they need a local Agent Gateway.

### Session shell and query suggestions

The session sends `initialize` as soon as it is created, and the producer answers with the session shell: a surface that lives for the whole session, whose `SessionShell` root holds a `SearchBox` and its `QuerySuggestions`. `SessionSearchBox` draws it where the page's prompt input goes, on both pages:

- while the session opens, a disabled input of the same shape stands in its place;
- once it has opened without a shell, or failed to, a plain input without suggestions does;
- the shell is found in `session.surfaces` by its root component type, and is never drawn among a turn's surfaces.

The `SearchBox` renderer draws the input and gives what is typed to `QuerySuggestions`, which sends it with `fetchSuggestions` once typing pauses and the session is free, and shows its completions in the search box's dropdown. The last completions stay shown while newer ones are on their way, and the typed query is bold where it starts a word; facet search results bold it wherever it appears. Selecting a completion submits it. A submit cancels a suggestion in flight first (`submitQuery`), so a suggestion never holds a prompt back.

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

There is no `search-box` on this surface: the query input is the session shell's search box pinned below the feed, so the composition starts at the `query-summary` row.

These controls dispatch component actions: an interaction (sort, page, page size, facet selection or search, breadbox) surfaces through the renderer's `onAction` handler and is sent through the session, one request at a time. The session recovers the dispatching component from its live surfaces, validates the action payload against the component's Zod action schema, and POSTs it over the HTTP Action_Channel; the producer replies with `/state/<id>` `updateDataModel` operations. Each control shows the shopper's choice optimistically until the reply lands, and the results dim meanwhile. In-progress facet-search input is held in local React state and is never written to the shared A2-UI data model.

### Key modules

| Module                                                   | Role                                                                                                                                                                                                                                                                                                                                                             |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/context/session.tsx`                                | Creates the `@coveo/thermidor` session and injects the `ComponentContractsSchema` it validates against                                                                                                                                                                                                                                                           |
| `src/components/AppShell.tsx`                            | Reads the session through one `useSyncExternalStore(session.subscribe, session.getSnapshot)`, passes `session.dispatchAction` to `A2UIProvider` as its `onAction`, and feeds the session's renderer stream (`session.a2uiMessages`) to the renderer                                                                                                              |
| `src/components/SessionSearchBox/`                       | Draws the session shell's search box where the page's prompt input goes, a disabled input while the session opens, or a plain input if it opened without one                                                                                                                                                                                                     |
| `src/a2ui/SearchBox/`, `src/a2ui/QuerySuggestions/`      | The shell's search box: the input, and the completions of its query, fetched with `fetchSuggestions`                                                                                                                                                                                                                                                             |
| `src/a2ui/surfaces.tsx`                                  | `ThermidorA2UIStream` feeds the stream to the renderer; `TurnSurfaces` draws one turn's surfaces, or a skeleton for a loading one (thermidor owns the v1.0 → v0.9 downgrade)                                                                                                                                                                                     |
| `src/a2ui/components.tsx`                                | `createThermidorCatalog()`: registers every catalog component (conversational: ProductCarousel, BundleDisplay, ComparisonTable, ProductResearchCard, ProductSummary, NextActionsBar; decomposed commerce: CommerceSearch, LayoutStack, FacetManager, RegularFacet, NumericFacet, CategoryFacet, Breadbox, QuerySummary, Sort, ProductList, Pagination, PageSize) |
| `src/a2ui/CommerceSearch/`                               | `commerce-search` root — composes the sidebar and main columns and mounts them by id via `buildChild(id)`                                                                                                                                                                                                                                                        |
| `src/a2ui/LayoutStack/`                                  | Generic layout container — stacks its declared children in a column or row (direction is a presentation node prop); reused for the sidebar, main, and top/bottom rows                                                                                                                                                                                            |
| `src/a2ui/session-request.tsx`                           | Reads the session's request in flight: the surface lock rule (`isBlocking`: every request but the facet search and suggestion actions it lists in `NON_BLOCKING_ACTIONS`, by component), `useGesture`, which runs a gesture's optimistic update in a transition that lasts until the session has answered it, `useLatestWhenFree` and `submitQuery`              |
| `src/a2ui/use-optimistic-facet-search.ts`                | Keeps in-progress facet-search input in local React state and dispatches `search` once typing pauses; never writes in-progress input to the shared data model                                                                                                                                                                                                    |
| `src/a2ui/Skeleton/`                                     | Skeletons drawn in place of loading surfaces                                                                                                                                                                                                                                                                                                                     |
| `src/components/ConversationPage/AgentResponseBlock.tsx` | Orchestrates streaming display: ThinkingBlock → StreamingMessage → the turn's surfaces                                                                                                                                                                                                                                                                           |

### Data flow (conversational turn)

```
Backend (converse stream)
  ↓ SSE events (A2-UI v1.0 messages: createSurface + /state updateDataModel ops)
  ↓
Session (thermidor, via createSession) — folds each turn's response
  ↓ session.a2uiMessages (v1.0 → v0.9, {path} bindings byte-for-byte, only grows)
  ↓ turn.response.surfaces (rootComponentType, isLoading)
  ↓
AppShell — one renderer stream, loading placeholders from turn.response.surfaces
  ↓
ThermidorA2UIStream — processMessages (catalog resolution + updateDataModel ops → renderer data model)
  ↓
TurnSurfaces (per turn)
  ├── A2UISkeleton for each loading surface while its turn streams
  └── A2UIRenderer → catalog components (ProductCarousel, BundleDisplay, etc.)
        ↓ read resolved values from props ({ "path": ... } bindings resolved by the renderer)

Action dispatch (consumer → producer):
  context.dispatchAction → renderer onAction → AppShell → session
    → one request at a time → validate payload (Zod) → HTTP POST (Action_Channel)
  ↓
  producer replies with /state/<id> updateDataModel ops (re-resolved into the renderer)
```

See [IMPLEMENTATION.md](./IMPLEMENTATION.md#state-and-validation-model) for the state and validation model.

## Further reading

- [IMPLEMENTATION.md](./IMPLEMENTATION.md) — State and validation model, rendering, action dispatch, workarounds, and known limitations
