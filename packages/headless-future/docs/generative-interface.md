# Generative Interface — Architecture & Developer Guide

## Overview

The **Generative Interface** is a conversational layer in headless-future that talks to a `/converse` SSE endpoint, manages turn history, and dynamically spawns interactive sub-interfaces when the endpoint routes a prompt to a known API (e.g., commerce search).

It supports two operational modes:

- **Routing mode** — the endpoint determines the prompt maps to a known API, calls it, and returns products/results directly
- **Agent mode** — the endpoint streams progressive responses including text messages, tool calls, and opaque A2UI surfaces

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         React App                               │
│                                                                 │
│  ┌──────────────────┐    ┌──────────────────────────────────┐  │
│  │ ConversePage      │    │ RoutedCommerceResults             │  │
│  │ • prompt input    │    │ • uses buildProductListController │  │
│  │ • turn sidebar    │    │ • renders products from state     │  │
│  │ • messages/tools  │    └──────────────────────────────────┘  │
│  └────────┬─────────┘                                           │
│           │ converseController.submit({prompt})                  │
└───────────┼─────────────────────────────────────────────────────┘
            │
┌───────────▼─────────────────────────────────────────────────────┐
│                    ConverseController                            │
│                                                                 │
│  • submit({prompt}) — guards, delegates to runtime              │
│  • selectTurn({id}) — navigation                                │
│  • retry({id}) — error recovery                                 │
│  • state: {turns, activeTurnId, activeTurn, isStreaming}        │
│  • subscribe(callback)                                          │
└───────────┬─────────────────────────────────────────────────────┘
            │
┌───────────▼─────────────────────────────────────────────────────┐
│                    GenerativeRuntime                             │
│                                                                 │
│  Singleton per engine+interfaceId. Manages the SSE lifecycle.   │
│                                                                 │
│  submit(prompt) → createTurn → callEndpoint → consumeStream     │
│                                                                 │
│  dispatchEvent(event) branches by event type:                   │
│    TEXT_MESSAGE_*  → appendMessage to agentResponse             │
│    TOOL_CALL_*    → track tool calls in agentResponse           │
│    ACTIVITY_SNAPSHOT (recognized) → hydrate sub-interface       │
│    ACTIVITY_SNAPSHOT (unrecognized) → append as A2UI surface    │
│    RUN_FINISHED / turn_complete → completeTurn                  │
│    RUN_ERROR → failTurn                                         │
└───────────┬─────────────────────────────────────────────────────┘
            │
            │ callEndpoint()
            ▼
┌─────────────────────────────────────────────────────────────────┐
│              ConversationEndpointFacade                          │
│                                                                 │
│  Builds the HTTP request from contributor registry:             │
│    • generative-loader registers a contributor that reads       │
│      the active turn's prompt from the generative slice         │
│    • configuration-loader adds trackingId, context, etc.        │
│                                                                 │
│  Sends POST to /converse, returns SSE ReadableStream            │
└─────────────────────────────────────────────────────────────────┘
```

---

## The Hydration Flow (Routing Mode)

When `/converse` returns an `ACTIVITY_SNAPSHOT` with a recognized `activityType`:

```
ACTIVITY_SNAPSHOT {activityType: "commerce-search-api-response", content: {...}}
                │
                ▼
┌───────────────────────────────────────────────────────────┐
│              createHydrateSubInterface                     │
│                                                           │
│  1. Map activityType → use-case key                       │
│     "commerce-search-api-response" → commerceSearchCtrl   │
│                                                           │
│  2. Build a sub-interface                                 │
│     buildCommerceInterface({engine})                       │
│                                                           │
│  3. Invoke registered controller builders                 │
│     Each builder adopts its own slice:                    │
│     buildProductListController → adopts product-list slice│
│                                                           │
│  4. Dispatch hydrateFromSnapshot action                   │
│     Each adopted slice extracts what it needs:            │
│     • product-list slice reads content.products           │
│     • pagination slice reads content.pagination           │
│     • facets slice reads content.facets                   │
│                                                           │
│  5. Return {useCase, interface} as RoutedInterface          │
└───────────────────────────────────────────────────────────┘
```

**Key design principle**: The hydration module does NOT eagerly import feature slices. Each controller builder brings its own slice — this preserves tree-shaking. If you don't register `buildProductListController`, the product-list slice code is never bundled.

---

## State Architecture

```
Engine (Redux store)
├── {interfaceId}/generative          ← generative slice (turns, activeTurnId)
├── {subInterfaceId}/products         ← product-list slice (adopted by builder)
├── {subInterfaceId}/pagination       ← pagination slice (adopted by builder)
├── {subInterfaceId}/facets           ← facets slice (adopted by builder)
└── configuration                     ← shared engine config
```

Each sub-interface gets its own `STATE_ID`, so slices from different turns never collide.

---

## Turn Lifecycle

```
                    submit("kayaks")
                         │
                         ▼
              ┌─────────────────────┐
              │  status: streaming  │
              │  prompt: "kayaks"   │
              │  id: temp-uuid      │
              └──────────┬──────────┘
                         │
         ┌───────────────┼───────────────────┐
         │               │                   │
    Routing Mode    Agent Mode          Error
         │               │                   │
         ▼               ▼                   ▼
  ┌─────────────┐ ┌──────────────┐   ┌─────────────┐
  │ routedIface │ │ agentResp    │   │ status:error│
  │ status:     │ │ messages[]   │   │ error: msg  │
  │  complete   │ │ toolCalls[]  │   └─────────────┘
  └─────────────┘ │ surfaces[]   │
                  │ status:      │
                  │  complete    │
                  └──────────────┘
```

---

## How the Pieces Connect

| Layer                    | Responsibility                                                                 | Key File                                              |
| ------------------------ | ------------------------------------------------------------------------------ | ----------------------------------------------------- |
| **Engine**               | Redux store wrapper, slice adoption, pub/sub                                   | `engine.ts`                                           |
| **Generative Interface** | Created by developer, holds builder registry + SOURCE_ENGINE                   | `generative.ts`                                       |
| **Converse Controller**  | Public API for the view layer (submit/selectTurn/retry/state/subscribe)        | `converse-controller.ts`                              |
| **Generative Runtime**   | SSE stream consumer, event dispatch, singleton per engine                      | `generative-runtime.ts`                               |
| **Endpoint Facade**      | HTTP request building via contributor registry                                 | `conversation-endpoint-facade.ts`                     |
| **Generative Loader**    | Adopts generative slice, registers message contributor                         | `generative-loader.ts`                                |
| **Hydration**            | Maps activityType → sub-interface, invokes builders, dispatches hydrate action | `generative-hydration.ts`                             |
| **Feature Slices**       | Each responds to `hydrateFromSnapshot` action, extracts its own data           | `product-list-slice.ts`, `result-list-slice.ts`, etc. |

---

## Usage Example (React)

### 1. Setup (once per app)

```ts
// generative-setup.ts
import {
  Engine,
  buildGenerativeInterface,
  buildConverseController,
  buildProductListController,
  buildResultListController,
} from '@coveo/headless-future';

const engine = new Engine({
  configuration: {organizationId: '...', accessToken: '...'},
  navigatorContextProvider: () => ({
    clientId: sessionStorage.getItem('clientId') ?? crypto.randomUUID(),
    location: window.location.href,
    referrer: document.referrer,
    userAgent: navigator.userAgent,
  }),
});

const generativeInterface = buildGenerativeInterface({
  engine,
  options: {
    // Register what controllers you want for each use-case.
    // Only registered controllers get bundled & hydrated.
    commerceSearchControllers: [buildProductListController],
    searchControllers: [buildResultListController],
  },
});

export const converseController = buildConverseController({
  interface: generativeInterface,
});
```

### 2. Conversation UI

```tsx
// ConversePage.tsx
import {useState, useEffect} from 'react';
import {converseController} from './generative-setup';

export function ConversePage() {
  const [state, setState] = useState(converseController.state);
  const [prompt, setPrompt] = useState('');

  useEffect(
    () =>
      converseController.subscribe(() => setState(converseController.state)),
    []
  );

  const {activeTurn, isStreaming} = state;

  return (
    <div>
      <input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            converseController.submit({prompt});
            setPrompt('');
          }
        }}
      />

      {isStreaming && <p>Streaming...</p>}

      {activeTurn?.agentResponse && (
        <>
          {/* Messages */}
          {activeTurn.agentResponse.messages.map((msg, i) => (
            <p key={i}>{msg.content}</p>
          ))}

          {/* Tool calls (thinking steps) */}
          {activeTurn.agentResponse.toolCalls.map((tc) => (
            <div key={tc.id}>
              {tc.status === 'calling' ? '⏳' : '✓'} {tc.name}
            </div>
          ))}

          {/* A2UI surfaces (opaque pass-through) */}
          {activeTurn.agentResponse.surfaces.map((surface, i) => (
            <pre key={i}>{JSON.stringify(surface, null, 2)}</pre>
          ))}
        </>
      )}

      {/* Routed commerce results */}
      {activeTurn?.routedInterface?.useCase === 'commerceSearch' && (
        <ProductList interface={activeTurn.routedInterface.interface} />
      )}
    </div>
  );
}
```

### 3. Product List (routed sub-interface)

```tsx
// ProductList.tsx
import {useState, useEffect} from 'react';
import {buildProductListController} from '@coveo/headless-future';

export function ProductList({interface: subInterface}) {
  const controller = buildProductListController({interface: subInterface});
  const [state, setState] = useState(controller.state);

  useEffect(() => controller.subscribe(() => setState(controller.state)), []);

  return (
    <ul>
      {state.products.map((p) => (
        <li key={p.permanentid}>
          {p.ec_name} — ${p.ec_price}
        </li>
      ))}
    </ul>
  );
}
```

---

## Event Types (AG-UI Protocol)

| Event                              | Handled By          | Effect                                    |
| ---------------------------------- | ------------------- | ----------------------------------------- |
| `turn_started`                     | Runtime             | No-op (stream started)                    |
| `RUN_STARTED`                      | Default (ignored)   | —                                         |
| `STATE_SNAPSHOT`                   | Default (ignored)   | —                                         |
| `TEXT_MESSAGE_START`               | Runtime             | Ensures agentResponse is initialized      |
| `TEXT_MESSAGE_CONTENT`             | Runtime             | Appends message delta                     |
| `TEXT_MESSAGE_END`                 | Runtime             | No-op (message complete)                  |
| `TOOL_CALL_START`                  | Runtime             | Creates tool call entry (status: calling) |
| `TOOL_CALL_ARGS`                   | Runtime             | Accumulates args string                   |
| `TOOL_CALL_END`                    | Runtime             | No-op (args complete)                     |
| `TOOL_CALL_RESULT`                 | Runtime             | Sets result, status → completed           |
| `ACTIVITY_SNAPSHOT` (recognized)   | Runtime → Hydration | Builds sub-interface, hydrates state      |
| `ACTIVITY_SNAPSHOT` (unrecognized) | Runtime             | Appends as opaque A2UI surface            |
| `RUN_FINISHED`                     | Runtime             | completeTurn                              |
| `RUN_ERROR`                        | Runtime             | failTurn with error message               |
| `turn_complete`                    | Runtime             | completeTurn (terminal)                   |

---

## Tree-Shaking & Lazy Loading

The generative hydration module imports **zero feature slices** at the top level. The mechanism:

1. Developer registers builders: `commerceSearchControllers: [buildProductListController]`
2. At hydration time, `createHydrateSubInterface` calls each builder against the sub-interface
3. Each builder internally calls `engine.adoptSlice(getOrCreateProductListSlice(stateId))`
4. After all builders have adopted their slices, the hydration dispatches a single `hydrateFromSnapshot` action
5. Each adopted slice responds to this action in its `extraReducers`, extracting only the fields it cares about

If you never register `buildProductListController`, the product-list slice module is never imported by bundler-reachable code → tree-shaken out.

---

## Key Symbols

| Symbol             | Purpose                                                        |
| ------------------ | -------------------------------------------------------------- |
| `ENGINE`           | Stores the FullEngine (internal API) on an interface           |
| `SOURCE_ENGINE`    | Stores the original public Engine (for sub-interface creation) |
| `STATE_ID`         | Unique slice namespace per interface instance                  |
| `BUILDER_REGISTRY` | The registered controller builders on the generative interface |
| `KIND`             | Discriminator ('interface' vs 'composed')                      |

---

## Error Handling

| Scenario                | Behavior                                         |
| ----------------------- | ------------------------------------------------ |
| Network failure         | Turn → error status, error message stored        |
| Stream interruption     | Partial agentResponse preserved, turn → error    |
| Empty/whitespace prompt | submit() is a no-op                              |
| Submit while streaming  | submit() is a no-op                              |
| Retry on non-error turn | retry() is a no-op                               |
| Retry on errored turn   | Clears partial response, re-submits, → streaming |
