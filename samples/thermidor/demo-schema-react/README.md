# Thermidor Demo Schema React

A React sample demonstrating contract-driven A2-UI rendering using `@coveo/thermidor-schema`.

This sample duplicates `samples/thermidor/demo-react` and refactors the A2-UI rendering layer to use catalog-based resolution with validated controller contracts from `@coveo/thermidor-schema`.

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

| Prompt                                                                     | Scenario                                                                                                                   | Status              |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| `wetsuits`                                                                 | Routed commerce search — navigates to SearchResultsPage with product grid                                                  | ✅ Fully functional |
| `build a beginner surfing kit with budget, mid-range, and premium options` | BundleDisplay with 3 tiers (Budget/Mid-Range/Premium), product-list controllers per slot, and NextActionsBar               | ✅ Fully functional |
| `i like cold-water surfing. compare wetsuits for it`                       | ComparisonTable with 3 wetsuits, images, prices, annotations (Standout/Trade-off/Best for), AI Summary, and NextActionsBar | ✅ Fully functional |
| `boating safety`                                                           | Discovery with 2 ProductCarousels (Life Jackets + Boating Safety Gear) and NextActionsBar                                  | ✅ Fully functional |
| Any other text (fallback)                                                  | NextActionsBar with suggested follow-up actions                                                                            | ✅ Fully functional |
| `what should i pack for a snorkeling trip?`                                | Conversational with surfaces (built for `demo-react`, legacy format)                                                       | ❌ Not supported    |
| `kayaks`                                                                   | Routed commerce search (built for `demo-react`)                                                                            | ❌ Not supported    |
| `surfboard care`                                                           | Routed search (built for `demo-react`)                                                                                     | ❌ Not supported    |

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
└── SearchResultsPage  — Product grid, facets, sort, pagination (RoutedInterface)
```

Navigation is determined by what the backend returns:

- Turn with `routedInterface` → SearchResultsPage (Headless classic controllers)
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
│                       ├── ProductCarousel (useAdvertisedController → product-list state)
│                       ├── BundleDisplay (useAdvertisedController → bundle tiers + nested product-lists)
│                       ├── ComparisonTable (useAdvertisedController → products + attributes)
│                       └── NextActionsBar (useAdvertisedController → action items + dispatch)
└── "Back to search" floating button (if canGoBackToSearch)
```

**ProductTargeting** wraps the entire conversation view. It provides the prompt input, a toolbar for attaching product context (users can click products in the conversation to pin them), and injects selected product names into the prompt on submit.

**ConversationThread** iterates over turns and delegates rendering to the appropriate block based on turn status. The key path is through **AgentResponseBlock**, which orchestrates the streaming experience: first showing a thinking indicator, then streaming text, then skeleton placeholders (inferred from `store_render_plan` tool calls), and finally the resolved A2-UI catalog components once controller state arrives via StateSnapshot.

The catalog renderers (ProductCarousel, BundleDisplay, ComparisonTable, NextActionsBar) each use `useAdvertisedController` to subscribe to their controller's state slice reactively — no prop drilling needed beyond the initial `props.controllers` advertisement from the surface message.

### Key modules

| Module                                                   | Role                                                                                                                               |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `src/hooks/use-navigation.ts`                            | Navigation state machine (view transitions, persisted RoutedInterface, submit handling)                                            |
| `src/a2ui/components.tsx`                                | Catalog definitions and renderers (ProductCarousel, BundleDisplay, ComparisonTable, NextActionsBar) registered via `createCatalog` |
| `src/a2ui/controllers.tsx`                               | `useAdvertisedController` hook — reactive controller state via `useSyncExternalStore`                                              |
| `src/a2ui/state-source-context.tsx`                      | React context providing `EngineStateSource` to catalog renderers                                                                   |
| `src/a2ui/surfaces.tsx`                                  | Extracts A2-UI messages from activities, converts v1.0 → v0.9, passes to catalog resolver                                          |
| `src/a2ui/Skeleton/`                                     | Skeleton placeholders during streaming                                                                                             |
| `src/components/ConversationPage/AgentResponseBlock.tsx` | Orchestrates streaming display: ThinkingBlock → StreamingMessage → Skeletons → A2UI Surfaces                                       |

### Data flow (conversational turn)

```
Backend (converse stream)
  ↓ SSE events (AG-UI StateSnapshot + A2-UI v1.0 messages)
  ↓
UnifiedConverseController (thermidor)
  ↓ state.activeTurn.agentResponse
  ↓
AgentResponseBlock
  ├── Skeletons (from store_render_plan tool calls)
  └── ThermidorA2UISurfaces
        ↓ convertV1ToV09 adapter
        ↓ processMessages (catalog resolution)
        ↓
        Catalog Renderers (ProductCarousel, BundleDisplay, etc.)
          ↓ useAdvertisedController(stateSource, props.controllers.xxx)
          ↓ selectRemoteControllerState(state, controllerId)
          ↓
          Rendered component with typed controller state
```

### Key differences from demo-react

- Imports controller contracts from `@coveo/thermidor-schema` (generated Zod schemas + TypeScript types)
- Contract-driven surfaces use `props.controllers` with `controllerId` + `controllerSchema` for typed controller resolution
- Controller state is delivered via AG-UI `StateSnapshot` and read by `buildRemoteController` from `@coveo/thermidor`
- BundleDisplay resolves product-list controllers from the same StateSnapshot via `selectRemoteControllerState`
- Props schemas for catalog components are defined locally and validated at runtime via Zod

## Further reading

- [IMPLEMENTATION.md](./IMPLEMENTATION.md) — Conformity validation, workarounds, known limitations, and next steps
