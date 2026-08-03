# Design Document: Unified Search Thunk

## Overview

This design introduces the unified search facade resolver, async thunk, and stream extractor for the thermidor package. The key design decision is that each controller interaction sends a **specific action** (e.g., `select_page`, `toggle_facet`, `set_sort`) to the unified endpoint via an `actionIntent` discriminated union on the thunk arg type. This replaces the previous `restore_state` catch-all approach which lost facet hints, couldn't replicate `fetch_more`, and collapsed sort options.

The `actionIntent` is passed by controllers when dispatching the thunk. The unified thunk reads `actionIntent.name` and `actionIntent.context` to build the `A2uiAction` directly — it does NOT infer the action from engine state. The converse thunk ignores `actionIntent` (it's optional on the arg type) and continues to read full state as before.

Controllers always perform optimistic state mutations AND pass `actionIntent`. The thunk decides what to use:
- **Unified thunk**: Uses `actionIntent` for the action, reads engine state only for the request envelope (trackingId, language, etc.)
- **Converse thunk**: Ignores `actionIntent`, reads full engine state

## Architecture

```mermaid
graph TD
    subgraph "User Interaction"
        Controller["Controller dispatch<br/>(paginate, sort, facet, search)"]
    end

    subgraph "src/internal/utils/"
        Types["interface-types.ts<br/>EndpointThunkArg + ActionIntent"]
    end

    subgraph "src/internal/api/unified/"
        Facade["unified-search-facade.ts<br/>FacadeResolver"]
        Thunk["unified-search-thunk.ts<br/>createAsyncThunk"]
        Extractor["unified-stream-extractor.ts<br/>extractUpdateDataModelOps"]
        Hydration["unified-surface-hydration.ts<br/>applyDataModelUpdate"]
        Client["unified-endpoint-client.ts<br/>(existing)"]
    end

    subgraph "Engine State (envelope only)"
        Generative["Generative selectors"]
        Cart["Cart selectors"]
        Config["Configuration selectors"]
        Navigator["Navigator context"]
    end

    Controller -->|"actionIntent: {name, context}"| Facade
    Facade --> Thunk
    Thunk --> Generative
    Thunk --> Cart
    Thunk --> Config
    Thunk --> Navigator
    Thunk -->|AgUiPayloadRequest| Client
    Client -->|SSE stream| Extractor
    Extractor -->|ExtractedUpdate[]| Thunk
    Thunk --> Hydration
```

The data flow is:

1. A controller optimistically mutates local state, then dispatches the thunk with `{engine, actionIntent}`.
2. The thunk reads `actionIntent.name` and `actionIntent.context` directly (no state inference).
3. The thunk reads engine state only for the request envelope (trackingId, language, conversationSessionId, etc.).
4. It assembles the `A2uiAction` from the intent and wraps it in an `AgUiPayloadRequest`.
5. It calls the unified endpoint client, receiving an SSE stream.
6. The stream extractor reads `ACTIVITY_SNAPSHOT` events, collecting `updateDataModel` operations.
7. Each extracted update is applied to the interface via `applyDataModelUpdate`.
8. The backend-authoritative data replaces whatever optimistic state was set.

## Components and Interfaces

### 1. Type Extension (`interface-types.ts`)

The `EndpointThunk` arg type is extended with an optional `actionIntent`:

```typescript
import type {AsyncThunk} from '@reduxjs/toolkit';
import type {FullEngine} from '@/src/internal/engine/index.js';
import type {
  ExecuteSearchContext,
  ToggleFacetContext,
  ToggleExcludeFacetContext,
  DeselectAllFacetsContext,
  ToggleNumericFacetContext,
  SetNumericFacetRangeContext,
  SelectPageContext,
  SetPageSizeContext,
  SetSortContext,
  FetchMoreContext,
  RestoreStateContext,
  OverrideCorrectionContext,
  SelectProductsContext,
} from '@/src/internal/api/unified/unified-endpoint-types.js';

export type ActionIntent =
  | {name: 'execute_search'; context: ExecuteSearchContext}
  | {name: 'toggle_facet'; context: ToggleFacetContext}
  | {name: 'toggle_exclude_facet'; context: ToggleExcludeFacetContext}
  | {name: 'deselect_all_facets'; context: DeselectAllFacetsContext}
  | {name: 'toggle_numeric_facet'; context: ToggleNumericFacetContext}
  | {name: 'set_numeric_facet_range'; context: SetNumericFacetRangeContext}
  | {name: 'select_page'; context: SelectPageContext}
  | {name: 'set_page_size'; context: SetPageSizeContext}
  | {name: 'set_sort'; context: SetSortContext}
  | {name: 'fetch_more'; context: FetchMoreContext}
  | {name: 'restore_state'; context: RestoreStateContext}
  | {name: 'override_correction'; context: OverrideCorrectionContext}
  | {name: 'select_products'; context: SelectProductsContext};

export interface EndpointThunkArg {
  engine: FullEngine;
  actionIntent?: ActionIntent;
}

export type EndpointThunk = AsyncThunk<void, EndpointThunkArg, {}>;
```

**Design decisions:**
- `actionIntent` is optional so the converse thunk (which ignores it) doesn't need changes at the type level.
- The discriminated union ensures type safety — each `name` is paired with its correct context type.
- Context types are reused from `unified-endpoint-types.ts` (already defined there).

### 2. Facade Resolver (`unified-search-facade.ts`)

A thin factory that captures interface handles and surface ID in a closure, producing a `FacadeResolver` compatible with `CommerceInterfaceImpl`.

```typescript
import type {FacadeResolver, InterfaceHandle} from '@/src/internal/utils/index.js';
import {createUnifiedSearchEndpointThunk} from './unified-search-thunk.js';

export function createUnifiedSearchFacadeResolver(
  generativeInterface: InterfaceHandle,
  cartInterface: InterfaceHandle,
  surfaceId: string
): FacadeResolver {
  return (iface) =>
    createUnifiedSearchEndpointThunk(iface, generativeInterface, cartInterface, surfaceId);
}
```

**Design decision:** The facade captures `generativeInterface`, `cartInterface`, and `surfaceId` — all three are known at hydration time. It returns a `FacadeResolver` (not a made-up `FacadeResolverFactory`), matching the existing type `(iface: InterfaceHandle) => EndpointThunk`.

### 3. Async Thunk (`unified-search-thunk.ts`)

Key responsibilities:

1. Read `actionIntent` from the thunk arg (throw if missing)
2. Build `A2uiAction` directly from `actionIntent.name` and `actionIntent.context`
3. Read generative/cart/config state for the request envelope only
4. Build the full `AgUiPayloadRequest`
5. Call the unified endpoint client
6. Extract `updateDataModel` operations from the response stream
7. Apply each update to the base interface
8. Register with `CommerceSearchEndpointSlice` for loading/error state

```typescript
export function createUnifiedSearchEndpointThunk(
  iface: InterfaceHandle,
  generativeInterface: InterfaceHandle,
  cartInterface: InterfaceHandle,
  surfaceId: string
): EndpointThunk;
```

The thunk implementation:

```typescript
const thunk = createAsyncThunk<void, EndpointThunkArg>(
  `${stateId}/unifiedSearchEndpoint/execute`,
  async ({engine, actionIntent}) => {
    if (!actionIntent) {
      throw new Error('Unified search thunk requires an actionIntent');
    }

    const action: A2uiAction = {
      surfaceId,
      name: actionIntent.name,
      sourceComponentId: 'thermidor',
      timestamp: new Date().toISOString(),
      actionId: null,
      wantResponse: false,
      context: actionIntent.context,
    };

    // Read envelope data from engine state
    const conversationSessionId = engine.read(generativeSelectors.getConversationSessionId);
    const conversationToken = engine.read(generativeSelectors.getConversationToken);
    const cart = engine.read(cartSelectors.getCartContext);
    const navigatorContext = engine.getNavigatorContextProvider()?.();
    const config = engine.read(configSelectors.getEndpointClientConfiguration);
    const {trackingId, language, country, currency} = engine.read(envelopeSelector);

    const request: AgUiPayloadRequest = {
      session: {
        threadId: conversationSessionId || generateId(),
        clientMessageId: generateId(),
        continuationTokens: {},
      },
      messages: [],
      requestContext: {},
      forwardedProps: {},
      agentInput: {
        trackingId,
        language,
        country,
        currency,
        clientId: navigatorContext?.clientId ?? undefined,
        message: null,
        action,
        conversationSessionId,
        conversationToken,
        context: {
          view: {
            url: navigatorContext?.location ?? null,
            referrer: navigatorContext?.referrer ?? null,
          },
          user: {userAgent: navigatorContext?.userAgent ?? null},
          cart: cart ?? [],
          source: [],
          custom: {},
        },
        pinnedProducts: [],
      },
    };

    const client = createUnifiedEndpointClient();
    const result = await client.call(request, config);

    if (!result.success) {
      throw new Error(result.error);
    }

    const updates = await extractUpdateDataModelOperationsFromStream(result.data.stream);
    for (const update of updates) {
      applyDataModelUpdate(engine, iface, update.path, update.value);
    }
  }
);
```

**Design decisions:**

- The thunk action type prefix is `{stateId}/unifiedSearchEndpoint/execute` to distinguish from the converse thunk.
- `sourceComponentId` is `'thermidor'` (identifies the client library).
- `actionId` is `null` because actions are client-initiated, not responses to server-suggested actions.
- `wantResponse` is `false` — backend team confirmed it's a no-op for search actions.
- The thunk does NOT read search state (query, pagination, facets, sort) from the engine — it uses `actionIntent.context` directly.
- The thunk still reads engine state for the request envelope (trackingId, language, conversationSessionId, cart, navigator context).
- `messages` is `[]` (not a conversational turn).

### 4. Stream Extractor (`unified-stream-extractor.ts`)

Consumes the SSE response stream and extracts `updateDataModel` operations from `ACTIVITY_SNAPSHOT` events with `activityType === 'a2ui-surface'`.

```typescript
export interface ExtractedUpdate {
  path: string;
  value: unknown;
}

export async function extractUpdateDataModelOperationsFromStream(
  stream: ReadableStream<Uint8Array>
): Promise<ExtractedUpdate[]>;
```

**Implementation details:**

- Uses `readEventStream` + `parseSSEEvent` from `@/src/internal/api/protocol/`
- Collects all `updateDataModel` operations across all `ACTIVITY_SNAPSHOT` events
- Rejects immediately on `RUN_ERROR` events
- Resolves with collected updates when stream completes
- Propagates stream errors via the `onError` callback

**Design decision:** The extractor returns a `Promise<ExtractedUpdate[]>` rather than streaming updates one-by-one. This simplifies the thunk logic (await then loop) and matches the pattern where all updates from a single interaction are applied atomically.

### 5. Controller Changes

Controllers pass `actionIntent` alongside the engine when dispatching:

```typescript
// Pagination controller — selectPage(page):
this.engine.mutate(this.#actions.setFirstResult(page * pageSize)); // optimistic
this.engine.mutate(this.#thunk({
  engine: this.engine,
  actionIntent: {name: 'select_page', context: {page}},
}));

// Sort controller — sortBy(criterion):
this.engine.mutate(this.#sortActions.sortBy(criterion)); // optimistic
this.engine.mutate(this.#thunk({
  engine: this.engine,
  actionIntent: {name: 'set_sort', context: {sortCriteria, fields}},
}));

// SearchBox controller — submit():
await this.engine.mutate(this.#thunk({
  engine: this.engine,
  actionIntent: {name: 'execute_search', context: {query}},
}));
```

**Design decision:** Controllers always optimistically update state AND pass `actionIntent`. This keeps controller code uniform across the converse and unified paths:
- The converse thunk ignores `actionIntent` and reads full state.
- The unified thunk uses `actionIntent` and ignores local search state.
- When the unified response comes back, backend-authoritative data replaces optimistic state.

### 6. Hydration Wiring Changes (`unified-surface-hydration.ts`)

The existing `hydrateFromCreateSurface` function is modified to accept interface handles:

```typescript
export function hydrateFromCreateSurface(
  engine: FullEngine,
  payload: CreateSurfacePayload,
  generativeInterface: InterfaceHandle,
  cartInterface: InterfaceHandle
): UnifiedHydrationResult | null;
```

Changes:
- Remove the `noopSearchResolver` constant
- Import and use `createUnifiedSearchFacadeResolver(generativeInterface, cartInterface, payload.surfaceId)` as the search resolver
- Pass the new parameters through from the runtime

### 7. Runtime Changes (`unified-runtime.ts`)

The `processA2uiOperations` method passes `generativeInterface` and `cartInterface` to `hydrateFromCreateSurface`:

```typescript
const result = hydrateFromCreateSurface(
  this.engine,
  op.createSurface,
  this.config.generativeInterface,
  this.config.cartInterface
);
```

The runtime already stores config with interface handles — no structural changes needed.

## Data Models

### ActionIntent → A2uiAction Mapping

| ActionIntent field | A2uiAction field |
|---|---|
| `actionIntent.name` | `name` |
| `actionIntent.context` | `context` |
| (captured in closure) | `surfaceId` |
| `'thermidor'` | `sourceComponentId` |
| `new Date().toISOString()` | `timestamp` |
| `null` | `actionId` |
| `false` | `wantResponse` |

### AgUiPayloadRequest Assembly (envelope)

| Field | Source |
|---|---|
| `session.threadId` | `conversationSessionId` or `generateId()` |
| `session.clientMessageId` | `generateId()` |
| `session.continuationTokens` | `{}` |
| `messages` | `[]` (no user message for actions) |
| `agentInput.message` | `null` |
| `agentInput.action` | Constructed `A2uiAction` from `actionIntent` |
| `agentInput.trackingId` | Configuration selector |
| `agentInput.language` | Configuration selector |
| `agentInput.country` | Configuration selector |
| `agentInput.currency` | Configuration selector |
| `agentInput.clientId` | Navigator context |
| `agentInput.conversationSessionId` | Generative selector |
| `agentInput.conversationToken` | Generative selector |
| `agentInput.context.view` | Navigator context (`location`, `referrer`) |
| `agentInput.context.user` | Navigator context (`userAgent`) |
| `agentInput.context.cart` | Cart selector |
| `agentInput.context.source` | `[]` |
| `agentInput.context.custom` | `{}` |
| `agentInput.pinnedProducts` | `[]` |

### ExtractedUpdate Shape

```typescript
{
  path: string;   // e.g. "/products", "/pagination", "/facets", "/"
  value: unknown; // the new data for that path
}
```

## Error Handling

| Scenario | Handling |
|---|---|
| `actionIntent` not provided | Thunk throws `Error('Unified search thunk requires an actionIntent')` |
| Client returns `success: false` | Thunk throws `Error(result.error)` → slice records error |
| `RUN_ERROR` SSE event | Stream extractor rejects → thunk throws → slice records error |
| Stream network failure | Stream extractor rejects → thunk throws → slice records error |
| No `updateDataModel` in stream | Extractor resolves with `[]`, thunk completes without mutations |
| `applyDataModelUpdate` for unknown path | Existing `default` case in switch — silently ignored |

The thunk integrates with `CommerceSearchEndpointSlice`:
- `pending` → sets `status: 'pending'`
- `fulfilled` → sets `status: 'idle'`
- `rejected` → sets `status: 'idle'`, stores `error`

## Testing Strategy

### Why Property-Based Testing Does Not Apply

This feature is HTTP client wiring + intent-to-action mapping + stream event filtering. The logic consists of:
- Passing through `actionIntent.name` and `actionIntent.context` to a fixed `A2uiAction` structure
- Reading engine state for envelope fields and mapping to a fixed request structure
- Calling an HTTP client and inspecting the result discriminant
- Iterating SSE events and filtering by event type/activity type
- Applying operations via an existing function

There are no complex transformations, parsers, or serializers where input variation would reveal edge cases through randomized testing. The intent-to-action mapping is a direct pass-through (no transformation). Example-based unit tests with mocked dependencies provide complete coverage.

### Unit Tests

**`unified-stream-extractor.test.ts`**:

| Test Case | Validates |
|---|---|
| Returns empty array when stream has no ACTIVITY_SNAPSHOT events | Req 6.3 |
| Extracts updateDataModel operations from a2ui-surface snapshots | Req 6.1, 6.2 |
| Ignores ACTIVITY_SNAPSHOT events with non-a2ui-surface activityType | Req 6.2 |
| Collects updates from multiple ACTIVITY_SNAPSHOT events | Req 6.2 |
| Rejects on RUN_ERROR event | Req 6.4 |
| Rejects on stream error | Req 6.5 |
| Preserves operation order | Req 7.2 |

**`unified-search-thunk.test.ts`**:

| Test Case | Validates |
|---|---|
| Throws if actionIntent is not provided | Req 3.8 |
| Uses actionIntent.name as A2uiAction.name | Req 3.1 |
| Uses actionIntent.context as A2uiAction.context | Req 3.2 |
| Sets surfaceId from closure | Req 3.3 |
| Sets sourceComponentId to 'thermidor' | Req 3.4 |
| Sets wantResponse to false | Req 3.7 |
| Sets actionId to null | Req 3.6 |
| Builds AgUiPayloadRequest with null message and action set | Req 4.1 |
| Includes conversationSessionId and conversationToken | Req 4.2 |
| Includes trackingId, language, country, currency | Req 4.3 |
| Includes navigator context in agentInput.context | Req 4.4 |
| Includes cart items from cart selectors | Req 4.5 |
| Includes valid session object | Req 4.6 |
| Calls unified endpoint client with request and config | Req 5.1 |
| Throws on client failure | Req 5.2 |
| Passes stream to extractor on success | Req 5.3 |
| Applies extracted updates to base interface in order | Req 7.1, 7.2 |
| Completes without modifying state when no updates extracted | Req 7.3 |
| Registers thunk with CommerceSearchEndpointSlice | Req 8.1 |

**`unified-search-facade.test.ts`**:

| Test Case | Validates |
|---|---|
| Returns a FacadeResolver function | Req 2.1 |
| Resolver produces an EndpointThunk when invoked with interface handle | Req 2.2 |
| Captures surfaceId and interface handles in closure | Req 2.3 |

**Controller tests (update existing)**:

| Test Case | Validates |
|---|---|
| Pagination selectPage passes actionIntent with select_page | Req 10.1 |
| Pagination setPageSize passes actionIntent with set_page_size | Req 10.2 |
| Sort sortBy passes actionIntent with set_sort | Req 10.3 |
| SearchBox submit passes actionIntent with execute_search | Req 10.4 |
| Controllers still perform optimistic mutations | Req 10.5 |

### Test Framework

- Vitest (project standard)
- Mock `createUnifiedEndpointClient` to return controllable streams
- Mock engine `read()` to return configurable state
- Mock `readEventStream` for stream extractor tests
- Verify calls to `applyDataModelUpdate` via spies
