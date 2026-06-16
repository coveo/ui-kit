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
│  1. Map activityType → routed use-case                    │
│     "commerce-search-api-response" → commerceSearch       │
│     "search-api-response" → search                        │
│                                                           │
│  2. Build a sub-interface                                 │
│     buildCommerceInterface({engine}) or                   │
│     buildSearchInterface({engine})                        │
│                                                           │
│  3. Store snapshot in engine cache                        │
│     engine.storeHydrationSnapshot(subId, content)         │
│                                                           │
│  4. Dispatch hydrateFromSnapshot action                   │
│     Any already-adopted slices extract what they need:    │
│     • product-list slice reads content.products           │
│     • result-list slice reads content.results             │
│                                                           │
│  5. Return {useCase, interface} as RoutedInterface        │
│                                                           │
│  ── Later, in a React component ──                        │
│                                                           │
│  6. Developer builds controller lazily                    │
│     buildProductListController({interface: subInterface}) │
│     → adopts slice → engine re-dispatches snapshot        │
│       from cache → slice state is hydrated                │
└───────────────────────────────────────────────────────────┘
```

**Key design principles**:

- The hydration module does NOT eagerly import feature slices — tree-shaking is preserved.
- Controllers are built **lazily** in components, not registered upfront.
- The Engine caches hydration snapshots per sub-interface. When a slice is adopted later (via a controller builder), the Engine automatically re-dispatches the `hydrateFromSnapshot` action so the new slice receives the data — this makes hydration **order-independent**.

---

## State Architecture

```
Engine (Redux store)
├── {interfaceId}/generative          ← generative slice (turns, activeTurnId)
├── {subInterfaceId}/products         ← product-list slice (adopted lazily by controller)
├── {subInterfaceId}/results          ← result-list slice (adopted lazily by controller)
└── configuration                     ← shared engine config

Engine (internal)
├── #hydrationSnapshots: Map<subInterfaceId, snapshotContent>
│   └── used by #adoptSlice to re-dispatch hydrate action for late-adopted slices
└── #adoptedSlices: WeakSet<Slice>
    └── ensures idempotent adoption (duplicate calls are no-ops)
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

| Layer                    | Responsibility                                                          | Key File                          |
| ------------------------ | ----------------------------------------------------------------------- | --------------------------------- |
| **Engine**               | Redux store wrapper, slice adoption, pub/sub, hydration snapshot cache  | `engine.ts`                       |
| **Generative Interface** | Created by developer, holds SOURCE_ENGINE reference                     | `generative.ts`                   |
| **Converse Controller**  | Public API for the view layer (submit/selectTurn/retry/state/subscribe) | `converse-controller.ts`          |
| **Generative Runtime**   | SSE stream consumer, event dispatch, singleton per engine               | `generative-runtime.ts`           |
| **Endpoint Facade**      | HTTP request building via contributor registry                          | `conversation-endpoint-facade.ts` |
| **Generative Loader**    | Adopts generative slice, registers message contributor                  | `generative-loader.ts`            |
| **Hydration**            | Maps activityType → sub-interface, stores snapshot, dispatches hydrate  | `generative-hydration.ts`         |
| **Feature Slices**       | Each responds to `hydrateFromSnapshot` action, extracts its own data    | `product-list-slice.ts`, etc.     |

---

## Usage Example (React)

### 1. Setup (once per app)

```ts
// generative-setup.ts
import {
  Engine,
  buildGenerativeInterface,
  buildConverseController,
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

const generativeInterface = buildGenerativeInterface({engine});

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
          {activeTurn.agentResponse.messages.map((msg, i) => (
            <p key={i}>{msg.content}</p>
          ))}

          {activeTurn.agentResponse.toolCalls.map((tc) => (
            <div key={tc.id}>
              {tc.status === 'calling' ? '⏳' : '✓'} {tc.name}
            </div>
          ))}

          {activeTurn.agentResponse.surfaces.map((surface, i) => (
            <pre key={i}>{JSON.stringify(surface, null, 2)}</pre>
          ))}
        </>
      )}

      {activeTurn?.routedInterface?.useCase === 'commerceSearch' && (
        <ProductList interface={activeTurn.routedInterface.interface} />
      )}

      {activeTurn?.routedInterface?.useCase === 'search' && (
        <ResultList interface={activeTurn.routedInterface.interface} />
      )}
    </div>
  );
}
```

### 3. Product List (routed sub-interface, lazy controller)

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

The controller is built **lazily** when the component mounts. The Engine's snapshot cache ensures the slice receives hydrated data even though it's adopted after the `hydrateFromSnapshot` action was originally dispatched.

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

1. At hydration time, `createHydrateSubInterface` builds a sub-interface and stores the snapshot content in the Engine's cache
2. The hydration dispatches `hydrateFromSnapshot` — any slices already adopted will process it immediately
3. When a developer later builds a controller (e.g., `buildProductListController({interface: subInterface})`), the controller calls `engine.adoptSlice(slice)`
4. The Engine detects the slice belongs to a cached sub-interface (by extracting the interface ID prefix from the slice name) and automatically re-dispatches the `hydrateFromSnapshot` action
5. The newly-adopted slice receives the snapshot data in its `extraReducers` handler

If you never import `buildProductListController`, the product-list slice module is never imported by bundler-reachable code → tree-shaken out. The hydration module only imports `buildCommerceInterface` and `buildSearchInterface`, never the feature slices.

---

## Key Symbols

| Symbol          | Purpose                                                        |
| --------------- | -------------------------------------------------------------- |
| `ENGINE`        | Stores the FullEngine (internal API) on an interface           |
| `SOURCE_ENGINE` | Stores the original public Engine (for sub-interface creation) |
| `STATE_ID`      | Unique slice namespace per interface instance                  |
| `KIND`          | Discriminator ('interface' vs 'composed')                      |

---

## RoutedInterface Type (Discriminated Union)

The `RoutedInterface` type is a discriminated union. Narrowing on `useCase` also narrows the `interface` field to the correct concrete type:

```ts
type RoutedInterface =
  | {useCase: 'commerceSearch'; interface: Interface<'commerce'>}
  | {useCase: 'search'; interface: Interface<'search'>};
```

This gives compile-time safety when building controllers:

```ts
if (turn.routedInterface?.useCase === 'commerceSearch') {
  // turn.routedInterface.interface is narrowed to Interface<'commerce'>
  buildProductListController({interface: turn.routedInterface.interface}); // ✓ type-safe
}
```

---

## Error Handling

| Scenario                          | Behavior                                         |
| --------------------------------- | ------------------------------------------------ |
| Network failure                   | Turn → error status, error message stored        |
| Stream interruption               | Partial agentResponse preserved, turn → error    |
| Empty/whitespace prompt           | submit() is a no-op                              |
| Submit while streaming            | submit() is a no-op                              |
| Retry on non-error turn           | retry() is a no-op                               |
| Retry on errored turn             | Clears partial response, re-submits, → streaming |
| Duplicate slice adopt             | No-op — existing slice state preserved           |
| Snapshot for unknown slice fields | Slice initializes with defaults, no error        |
