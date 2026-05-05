# Unified Interface Example

This example shows how a UI can use a single `Engine` instance to support both traditional search and conversational / generative flows, and hand off between them when the interaction mode changes.

The important design point is that there is no separate "chat engine" and "search engine". One `Engine` owns all state, and the UI composes feature controllers on top of it.

## Goal

Build a single search surface that can:

- start as a classic search box + result list
- switch into an assistant-first flow when orchestration decides that a conversational answer is more appropriate
- carry context between both modes using the same shared state tree

## Assumptions

- The application creates exactly one `Engine` for this page or experience.
- The engine is configured during app bootstrap before API-backed flows are used.
- Search remains the source of truth for search state.
- Conversation remains the source of truth for turn history and streaming output.
- `ContextBridgeController` is used to copy relevant search context into the conversation flow.

## Where The Adapters Come From

The unified UI still needs environment-specific I/O. That is what the adapters provide.

- `transport` is the runtime transport implementation used to send HTTP requests and open streaming connections. In a browser app, this would typically wrap `fetch` and SSE-style streaming behavior.
- `auth` is the token provider used by API-backed conversational flows. It knows how to retrieve and refresh the current access token for the experience.
- `persistence` is the runtime persistence implementation used to hydrate and save controller state across reloads. In a browser app, this can use IndexedDB.
- `orchestrationAdapter` is the decision provider used by `OrchestrationController`. It decides whether the next interaction should stay search-first, switch to assistant-first, or run in blended mode.

These values are usually created during app bootstrap and then passed into the feature shell that builds controllers.

```typescript
import {
  BrowserTransportAdapter,
  DefaultAuthAdapter,
  IndexedDbPersistenceAdapter,
  LocalHeuristicOrchestrationAdapter,
} from '@coveo/headless-future';

const auth = new DefaultAuthAdapter({
  tokenEndpoint: '/token',
});

const transport = new BrowserTransportAdapter({
  baseUrl: 'https://platform.cloud.coveo.com',
  getAuthToken: () => auth.getToken(),
});

const persistence = new IndexedDbPersistenceAdapter();
const orchestrationAdapter = new LocalHeuristicOrchestrationAdapter();
```

The example below assumes those adapter instances already exist.

## High-Level Shape

```typescript
import {
  Engine,
  buildSearchBoxController,
  buildResultListController,
  buildConversationController,
  buildOrchestrationController,
  buildSurfaceController,
  buildContextBridgeController,
} from '@coveo/headless-future';

const engine = new Engine();

// Assume engine configuration already happened during bootstrap.
// These adapter instances also come from bootstrap code:
// - transport: request/stream transport implementation
// - auth: token provider for authenticated conversational requests
// - persistence: browser persistence implementation (IndexedDB)
// - orchestrationAdapter: mode-decision provider for search vs assistant handoff

const searchBox = buildSearchBoxController(engine);
const resultList = buildResultListController(engine);
const conversation = buildConversationController(engine, {
  transport,
  auth,
  persistence,
});
const orchestration = buildOrchestrationController(
  engine,
  orchestrationAdapter
);
const surfaces = buildSurfaceController(engine, persistence);
const contextBridge = buildContextBridgeController(engine, persistence);
```

Every controller above talks to the same engine state.

That means:

- search state can inform conversation state
- conversation state can publish context back to search state
- orchestration can switch UI mode without replacing the engine
- structured surfaces can render assistant output without owning business logic

## Example: One Shell, Two Interaction Modes

```typescript
import {
  BrowserTransportAdapter,
  DefaultAuthAdapter,
  IndexedDbPersistenceAdapter,
  LocalHeuristicOrchestrationAdapter,
  Engine,
  buildSearchBoxController,
  buildResultListController,
  buildConversationController,
  buildOrchestrationController,
  buildSurfaceController,
  buildContextBridgeController,
} from '@coveo/headless-future';

type UnifiedMode = 'search-first' | 'assistant-first' | 'blended';

const engine = new Engine();

// Assume configuration already happened during app initialization.
// For example, bootstrap code would populate the configuration slice
// before this feature starts making API calls.

const auth = new DefaultAuthAdapter({
  tokenEndpoint: '/token',
});

const transport = new BrowserTransportAdapter({
  baseUrl: 'https://platform.cloud.coveo.com',
  getAuthToken: () => auth.getToken(),
});

const persistence = new IndexedDbPersistenceAdapter();
const orchestrationAdapter = new LocalHeuristicOrchestrationAdapter();

const searchBox = buildSearchBoxController(engine);
const resultList = buildResultListController(engine);
const conversation = buildConversationController(engine, {
  transport,
  auth,
  persistence,
});
const orchestration = buildOrchestrationController(
  engine,
  orchestrationAdapter
);
const surfaces = buildSurfaceController(engine, persistence);
const contextBridge = buildContextBridgeController(engine, persistence);

let currentMode: UnifiedMode = 'search-first';

function render() {
  const searchState = {
    query: searchBox.query,
    results: resultList.state.results,
  };

  const conversationState = conversation.state;
  const orchestrationState = orchestration.state;
  const surfaceState = surfaces.surfaces;
  const streamState = conversation.state.streaming;

  renderUnifiedShell({
    mode: currentMode,
    search: searchState,
    conversation: conversationState,
    orchestration: orchestrationState,
    surfaces: surfaceState,
    streaming: streamState,
  });
}

searchBox.subscribe(() => {
  contextBridge.syncSearchQuery(searchBox.query);
  render();
});

resultList.subscribe(() => {
  render();
});

conversation.subscribe(() => {
  render();
});

orchestration.subscribe(() => {
  currentMode = orchestration.state.currentMode;
  render();
});

surfaces.subscribe(() => {
  render();
});

async function handleSubmit(input: string) {
  // Ask orchestration which experience should lead this interaction.
  await orchestration.requestModeHint({
    lastUserMessage: input,
    searchResultsCount: resultList.state.results.length,
  });

  const mode = orchestration.state.currentMode;

  if (mode === 'search-first') {
    searchBox.updateQuery(input);
    searchBox.submit();
    return;
  }

  if (mode === 'assistant-first') {
    contextBridge.syncSearchQuery(searchBox.query);
    await conversation.submitTurn(input);
    return;
  }

  // blended mode
  searchBox.updateQuery(input);
  searchBox.submit();

  contextBridge.syncSearchQuery(input);
  await conversation.submitTurn(input, {
    metadata: {
      source: 'blended-mode',
    },
  });
}

function handleResultSelected(resultId: string) {
  const nextSelections = [resultId];

  contextBridge.publishAssistantSelectionsToSearch({
    products: nextSelections,
  });

  render();
}

async function handleAskAssistantFromSearch(input: string) {
  // Search has already established context. Copy the relevant parts into the
  // shared context domain before starting the turn.
  contextBridge.syncSearchQuery(searchBox.query);

  await conversation.submitTurn(input, {
    metadata: {
      entrypoint: 'search-results',
    },
  });
}

function handleAbortAssistant() {
  conversation.abortTurn('user-cancelled');
}

render();
```

## What This Example Demonstrates

### 1. Search and conversation share one engine

The same `Engine` instance is passed to every controller. No state needs to be copied between separate stores, and no mode switch needs to recreate the application state.

### 2. Orchestration changes the UI mode, not the engine model

`OrchestrationController` decides whether the experience should stay search-first, become assistant-first, or run in blended mode. That affects which controller the UI calls first, but the underlying state model stays unified.

### 3. Handoff happens through shared context, not ad hoc props

`ContextBridgeController` is the contract between discovery and conversation.

Examples:

- the current query is copied into shared context with `syncSearchQuery`
- selected products can be published with `publishAssistantSelectionsToSearch`
- the UI can later use shared context to enrich conversation requests or annotate search results

### 4. Streaming telemetry is nested in conversation state

`ConversationController` owns turns, message history, and streaming telemetry in `conversation.state.streaming`. The UI reads one controller state object without coordinating a separate streaming controller.

### 5. Structured surfaces stay render-agnostic

`SurfaceController` exposes a normalized collection of structured assistant surfaces. The UI decides how to render them, but the core state remains serializable and framework-agnostic.

### 6. Persistence wiring stays centralized

`IndexedDbPersistenceAdapter` is created once during bootstrap and shared across persistence-aware controllers.

That gives conversation, surfaces, and shared context a consistent hydration and persistence model without creating separate storage code paths in the UI shell.

## Recommended UI Composition

In practice, a unified page usually ends up with three UI regions:

1. Input region
   The main entry field routes to `handleSubmit(input)`.
2. Discovery region
   Search results, facets, and other classic discovery UI read from search controllers.
3. Assistant region
   Conversation history, streaming status, and structured surfaces read from conversational controllers.

The orchestration mode determines which regions are emphasized:

- `search-first`: show discovery first, assistant optionally collapsed
- `assistant-first`: show conversation first, discovery as supporting context
- `blended`: show both side-by-side or stacked in one flow

## Minimal Handoff Sequence

The typical handoff from search to assistant looks like this:

1. User types into the shared input.
2. `OrchestrationController` evaluates the intent.
3. If the interaction remains search-first, the UI submits through `SearchBoxController`.
4. If the interaction becomes assistant-first, the UI submits through `ConversationController`.
5. Before the assistant turn starts, `ContextBridgeController` synchronizes the current discovery context.
6. Assistant responses stream in through `ConversationController` state updates.
7. Any structured surfaces are exposed through `SurfaceController`.

## Why This Matters

This design keeps the implementation aligned with the core architectural decision for headless-future:

- one engine
- one shared state tree
- multiple controllers over the same state
- orchestration represented as state, not as a separate runtime model

That is what makes search and conversational handoff predictable, testable, and framework-agnostic.
