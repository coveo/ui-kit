# Design Document

## Overview

This design introduces a `buildGenerativeInterface` function and `buildConverseController` into the thermidor multi-interface architecture. The generative interface acts as a conversation orchestrator: it talks to `/converse`, manages turn history, and spawns fully interactive sub-interfaces when the endpoint routes to a known API. It follows the existing patterns (symbol-based opaque interfaces, lazy slice adoption, memoized selectors, runtime classes for streaming) while introducing a new concept of dynamically spawned child interfaces.

## Architecture

The generative interface integrates into the existing multi-interface engine architecture (ADR-002). It is a new interface type alongside search and commerce, but uniquely has the ability to spawn child sub-interfaces dynamically from API responses.

## Components and Interfaces

### High-Level Components

```
┌─────────────────────────────────────────────────────────┐
│                        Engine                           │
│  (Redux store, slice adoption, subscribe/mutate/read)   │
└────────────────────────┬────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
┌───────▼───────┐ ┌─────▼──────┐ ┌───────▼────────┐
│ SearchInterface│ │CommerceInterface│ │GenerativeInterface│
│ (existing)    │ │ (existing)      │ │ (new)            │
└───────────────┘ └────────────────┘ └────────┬─────────┘
                                              │
                                    ┌─────────▼──────────┐
                                    │ ConverseController  │
                                    │ (submit, selectTurn)│
                                    └─────────┬──────────┘
                                              │
                                    ┌─────────▼──────────┐
                                    │ GenerativeRuntime   │
                                    │ (stream, dispatch)  │
                                    └─────────┬──────────┘
                                              │
                              ┌────────────────┼────────────────┐
                              │                                 │
                    ┌─────────▼──────────┐           ┌──────────▼──────────┐
                    │ Routing Mode       │           │ Agent Mode          │
                    │ → Sub-Interface    │           │ → messages/surfaces │
                    │   (search/commerce)│           │   (opaque A2UI)     │
                    └────────────────────┘           └─────────────────────┘
```

### Data Flow

1. Developer calls `buildGenerativeInterface({ engine, options })` — registers controller builders per use case, creates a generative slice in the store.
2. Developer calls `buildConverseController({ interface: generative })` — gets a controller with `submit`, `selectTurn`, `state`, `subscribe`.
3. On `submit({ prompt })`:
   - A new turn is created in state (`streaming` status, temporary client ID).
   - The prompt + conversation context is sent to `/converse` via the existing endpoint facade pattern.
   - A `GenerativeRuntime` consumes the SSE stream.
4. Stream processing diverges by mode:
   - **Routing mode**: An `ACTIVITY_SNAPSHOT` with a recognized `activityType` arrives. The runtime hydrates a sub-interface using the registered builders, populates it from the snapshot `content`, and attaches it to the turn as `routedInterface`.
   - **Agent mode**: Messages and A2UI surfaces stream in progressively, appended to `agentResponse`.
5. On `selectTurn({ id })`: The controller updates `activeTurnId`. All turn state remains preserved.

## Detailed Design

### New Files

| Path                                                               | Purpose                                  |
| ------------------------------------------------------------------ | ---------------------------------------- |
| `src/public/interfaces/generative.ts`                              | `buildGenerativeInterface` function      |
| `src/public/controllers/converse/converse-controller.ts`           | `buildConverseController` + types        |
| `src/core/interface/generative/generative-types.ts`                | Domain types (Turn, AgentResponse, etc.) |
| `src/core/interface/generative/generative-loader.ts`               | Lazy slice adoption                      |
| `src/core/interface/api/generative-endpoint/generative-runtime.ts` | Stream consumption + dispatch            |
| `src/core/internal/generative/generative-slice.ts`                 | Redux slice for turn history             |
| `src/core/internal/generative/generative-actions.ts`               | Scoped actions                           |
| `src/core/internal/generative/generative-selectors.ts`             | Scoped selectors                         |

## Data Models

### Type Definitions

```ts
// src/core/interface/generative/generative-types.ts

export type TurnStatus = 'streaming' | 'complete' | 'error';

export interface Turn {
  id: string;
  prompt: string;
  status: TurnStatus;
  routedInterface?: RoutedInterface;
  agentResponse?: AgentResponse;
  error?: string;
}

export interface RoutedInterface {
  type: string; // e.g., 'commerce-search-api-response'
  interface: Interface<any>; // the hydrated sub-interface
}

export interface AgentResponse {
  messages: AgentMessage[];
  surfaces: A2UISurface[];
}

export interface AgentMessage {
  content: string;
  role: string;
}

// Opaque — headless stores but does not interpret
export type A2UISurface = Record<string, unknown>;

export interface GenerativeState {
  turns: Turn[];
  activeTurnId: string | undefined;
}

export type ControllerBuilder = (options: {
  interface: Interface<any>;
}) => Controller;

export interface GenerativeInterfaceOptions {
  commerceSearchControllers?: ControllerBuilder[];
  searchControllers?: ControllerBuilder[];
}
```

### `buildGenerativeInterface`

Follows the same pattern as `buildSearchInterface` / `buildConversationInterface`:

```ts
// src/public/interfaces/generative.ts

export interface BuildGenerativeInterfaceOptions {
  engine: Engine;
  options: GenerativeInterfaceOptions;
  id?: string;
}

export function buildGenerativeInterface(
  opts: BuildGenerativeInterfaceOptions
): GenerativeInterface {
  const fullEngine = getFullEngine(opts.engine);
  const interfaceId = opts.id ?? generateId();

  // Validate at least one use-case is registered
  const {commerceSearchControllers, searchControllers} = opts.options;
  if (!commerceSearchControllers?.length && !searchControllers?.length) {
    throw new Error(
      'buildGenerativeInterface requires at least one use-case with controller builders.'
    );
  }

  // Adopt the generative slice
  fullEngine.adoptSlice(getOrCreateGenerativeSlice(interfaceId));

  // Store the controller builder registry (used at hydration time)
  const builderRegistry: BuilderRegistry = {
    commerceSearchControllers: commerceSearchControllers ?? [],
    searchControllers: searchControllers ?? [],
  };

  return Object.freeze({
    [KIND]: 'interface' as const,
    [STATE_ID]: interfaceId,
    [ENGINE]: fullEngine,
    [BUILDER_REGISTRY]: builderRegistry,
    // Generative interface doesn't have its own thunks in the ADR-002 sense —
    // it delegates to sub-interfaces. Empty thunk map.
    [THUNK_FACTORIES]: {conversation: []},
    [THUNKS]: {conversation: []},
  });
}
```

Key difference from other interfaces: it carries a `[BUILDER_REGISTRY]` symbol containing the controller builder arrays, used when hydrating sub-interfaces from ACTIVITY_SNAPSHOTs.

### `buildConverseController`

```ts
// src/public/controllers/converse/converse-controller.ts

export interface ConverseController extends Controller {
  submit(options: {prompt: string}): void;
  selectTurn(options: {id: string}): void;
  readonly state: ConverseControllerState;
}

export interface ConverseControllerState {
  turns: Turn[];
  activeTurnId: string | undefined;
  isStreaming: boolean;
}

export interface ConverseControllerOptions {
  interface: GenerativeInterface;
}

export const buildConverseController = (
  options: ConverseControllerOptions
): ConverseController => {
  const fullEngine = options.interface[ENGINE];
  const stateId = options.interface[STATE_ID];
  const builderRegistry = options.interface[BUILDER_REGISTRY];

  // Ensure generative slice is loaded
  loadGenerative(fullEngine, stateId);

  const actions = getOrCreateGenerativeActions(stateId);
  const selectors = getOrCreateGenerativeSelectors(stateId);

  const runtime = GenerativeRuntime.getInstance(fullEngine, stateId, {
    builderRegistry,
    statePort: {
      /* mutations wired to actions */
    },
  });

  const controllerState = createMemoizedStateSelector(
    selectors.getTurns,
    selectors.getActiveTurnId,
    (turns, activeTurnId): ConverseControllerState => ({
      turns,
      activeTurnId,
      isStreaming: activeTurnId
        ? (turns.find((t) => t.id === activeTurnId)?.status === 'streaming' ??
          false)
        : false,
    })
  );

  return {
    submit({prompt}) {
      if (!prompt.trim()) return;
      const currentState = fullEngine.read(controllerState);
      if (currentState.isStreaming) return;
      runtime.submit(prompt);
    },
    selectTurn({id}) {
      const turns = fullEngine.read(selectors.getTurns);
      if (turns.some((t) => t.id === id)) {
        fullEngine.mutate(actions.setActiveTurnId(id));
      }
    },
    get state() {
      return fullEngine.read(controllerState);
    },
    subscribe(callback) {
      return fullEngine.subscribe(controllerState, callback);
    },
  };
};
```

### `GenerativeRuntime`

Modeled after the existing `ConversationRuntime` — a class that manages the streaming lifecycle:

```ts
// src/core/interface/api/generative-endpoint/generative-runtime.ts

export class GenerativeRuntime {
  private static cache = new WeakMap<
    FullEngine,
    Map<string, GenerativeRuntime>
  >();

  static getInstance(engine, interfaceId, config): GenerativeRuntime {
    /* singleton per engine+id */
  }

  async submit(prompt: string): Promise<void> {
    // 1. Create turn in state (temporary ID, streaming status)
    const tempId = generateId();
    this.statePort.createTurn({id: tempId, prompt, status: 'streaming'});
    this.statePort.setActiveTurnId(tempId);

    // 2. Call /converse endpoint via existing facade pattern
    const result = await this.endpointFacade.callEndpoint({
      /* request */
    });

    if (!result.success) {
      this.statePort.failTurn(tempId, result.error);
      return;
    }

    // 3. Consume SSE stream
    await this.consumeStream(tempId, result.data.stream);
  }

  private async consumeStream(
    turnId: string,
    stream: ReadableStream<Uint8Array>
  ) {
    await readConversationEventStream({
      stream,
      onEvent: (event) => this.dispatchEvent(turnId, event),
      onDone: () => this.finalizeTurn(turnId),
      onError: (err) => this.statePort.failTurn(turnId, err),
    });
  }

  private dispatchEvent(turnId: string, event: ConversationStreamEvent) {
    // Handle server-provided turn ID
    if (event.type === 'TURN_ID') {
      this.statePort.replaceTurnId(turnId, event.id);
      turnId = event.id; // track new ID going forward
    }

    // Routing mode: recognized activityType → hydrate sub-interface
    if (
      event.type === 'ACTIVITY_SNAPSHOT' &&
      this.isRecognizedActivityType(event.activityType)
    ) {
      const subInterface = this.hydrateSubInterface(
        event.activityType,
        event.content
      );
      this.statePort.setRoutedInterface(turnId, {
        type: event.activityType,
        interface: subInterface,
      });
      this.statePort.completeTurn(turnId);
      return;
    }

    // Agent mode: messages
    if (event.type === 'MESSAGE_CHUNK') {
      this.statePort.appendMessage(turnId, event);
      return;
    }

    // Agent mode: A2UI surface (opaque pass-through)
    if (
      event.type === 'ACTIVITY_SNAPSHOT' &&
      !this.isRecognizedActivityType(event.activityType)
    ) {
      this.statePort.appendSurface(turnId, event.content);
      return;
    }
  }

  private isRecognizedActivityType(activityType: string): boolean {
    // Maps activityType values to registered use-case keys
    return this.activityTypeMap.has(activityType);
  }

  private hydrateSubInterface(
    activityType: string,
    content: unknown
  ): Interface<any> {
    // 1. Determine which use-case this maps to
    const useCase = this.activityTypeMap.get(activityType)!;

    // 2. Build the appropriate interface type (search or commerce)
    //    pre-populated with the response content
    const subInterface = this.buildSubInterfaceForUseCase(useCase, content);

    return subInterface;
  }
}
```

### Generative Slice

```ts
// src/core/internal/generative/generative-slice.ts

export const initialGenerativeState: GenerativeState = {
  turns: [],
  activeTurnId: undefined,
};

export function createGenerativeSlice(interfaceId: string) {
  const actions = getOrCreateGenerativeActions(interfaceId);

  return createSlice({
    name: `${interfaceId}/generative`,
    initialState: initialGenerativeState,
    reducers: {},
    extraReducers: (builder) => {
      builder
        .addCase(actions.createTurn, (state, {payload}) => {
          state.turns.push({
            id: payload.id,
            prompt: payload.prompt,
            status: 'streaming',
          });
        })
        .addCase(actions.setActiveTurnId, (state, {payload}) => {
          state.activeTurnId = payload;
        })
        .addCase(actions.replaceTurnId, (state, {payload}) => {
          const turn = state.turns.find((t) => t.id === payload.oldId);
          if (turn) {
            turn.id = payload.newId;
            if (state.activeTurnId === payload.oldId) {
              state.activeTurnId = payload.newId;
            }
          }
        })
        .addCase(actions.setRoutedInterface, (state, {payload}) => {
          const turn = state.turns.find((t) => t.id === payload.turnId);
          if (turn) {
            turn.routedInterface = payload.routedInterface;
            turn.status = 'complete';
          }
        })
        .addCase(actions.initAgentResponse, (state, {payload}) => {
          const turn = state.turns.find((t) => t.id === payload.turnId);
          if (turn) {
            turn.agentResponse = {messages: [], surfaces: []};
          }
        })
        .addCase(actions.appendMessage, (state, {payload}) => {
          const turn = state.turns.find((t) => t.id === payload.turnId);
          if (turn?.agentResponse) {
            turn.agentResponse.messages.push(payload.message);
          }
        })
        .addCase(actions.appendSurface, (state, {payload}) => {
          const turn = state.turns.find((t) => t.id === payload.turnId);
          if (turn?.agentResponse) {
            turn.agentResponse.surfaces.push(payload.surface);
          }
        })
        .addCase(actions.completeTurn, (state, {payload}) => {
          const turn = state.turns.find((t) => t.id === payload.turnId);
          if (turn) turn.status = 'complete';
        })
        .addCase(actions.failTurn, (state, {payload}) => {
          const turn = state.turns.find((t) => t.id === payload.turnId);
          if (turn) {
            turn.status = 'error';
            turn.error = payload.error;
          }
        })
        .addCase(actions.clearTurnResponse, (state, {payload}) => {
          const turn = state.turns.find((t) => t.id === payload.turnId);
          if (turn) {
            delete turn.routedInterface;
            delete turn.agentResponse;
            delete turn.error;
          }
        });
    },
  });
}
```

### Sub-Interface Hydration

When a routing-mode ACTIVITY_SNAPSHOT arrives, the runtime needs to:

1. **Map `activityType` to a use-case key** — e.g., `'commerce-search-api-response'` → `'commerceSearchControllers'`. This mapping is defined internally (convention-based lookup table).

2. **Build a sub-interface of the correct type** — using the existing `buildSearchInterface` or `buildCommerceInterface` factory, passing the same engine.

3. **Pre-populate the sub-interface state** — inject the ACTIVITY_SNAPSHOT `content` into the sub-interface's result/facet/pagination slices without triggering an API call. This is done by directly mutating the sub-interface's feature slices after adoption:

```ts
private buildSubInterfaceForUseCase(useCase: string, content: unknown): Interface<any> {
  const engine = this.engine;

  if (useCase === 'commerceSearchControllers') {
    // Build a commerce interface
    const subInterface = buildCommerceInterface({ engine: this.publicEngine });

    // Pre-populate state from snapshot content
    const subId = subInterface[STATE_ID];
    engine.adoptSlice(getOrCreateResultListSlice(subId));
    engine.adoptSlice(getOrCreateFacetsSlice(subId));
    engine.adoptSlice(getOrCreatePaginationSlice(subId));

    // Hydrate from content (the raw API response body)
    engine.mutate(hydrateResultsFromSnapshot(subId, content));
    engine.mutate(hydrateFacetsFromSnapshot(subId, content));
    engine.mutate(hydratePaginationFromSnapshot(subId, content));

    return subInterface;
  }

  // Similar for search...
}
```

The `hydrateXFromSnapshot` actions are new internal actions that populate feature state from a raw response without triggering a new request.

### Retry Mechanism

On error, the turn exposes a `retry` action. This is implemented as a method on the converse controller:

```ts
// On the ConverseController
retry({ id }: { id: string }) {
  const turns = fullEngine.read(selectors.getTurns);
  const turn = turns.find(t => t.id === id);
  if (!turn || turn.status !== 'error') return;

  // Clear partial data
  fullEngine.mutate(actions.clearTurnResponse({ turnId: id }));
  // Re-submit
  runtime.resubmit(id, turn.prompt);
}
```

Alternatively, `retry` could be exposed on the Turn object itself within state (as a function reference). For the PoC, exposing it on the controller is simpler and avoids serialization concerns in Redux state.

### Activity Type Mapping

The mapping between server `activityType` values and registered use-case keys:

```ts
const ACTIVITY_TYPE_TO_USE_CASE: Record<
  string,
  keyof GenerativeInterfaceOptions
> = {
  'commerce-search-api-response': 'commerceSearchControllers',
  'search-api-response': 'searchControllers',
};
```

This is an internal constant. If new use cases are added, this map is extended.

## Error Handling

| Error Scenario                              | Behavior                                                                        |
| ------------------------------------------- | ------------------------------------------------------------------------------- |
| `/converse` network failure                 | Turn transitions to `error` status, error message stored on turn                |
| Stream interruption mid-turn                | Partial agent response preserved, turn set to `error`                           |
| Unrecognized `activityType` in routing mode | Turn set to `error` (no sub-interface hydrated)                                 |
| Empty/whitespace prompt                     | `submit` is a no-op, no turn created                                            |
| Submit while streaming                      | `submit` is a no-op, no turn created                                            |
| Retry on non-error turn                     | No-op                                                                           |
| Retry on errored turn                       | Clears partial response, re-submits original prompt, transitions to `streaming` |

## Correctness Properties

### Property 1: Turn Immutability

Once a turn reaches `complete` status, its `routedInterface` or `agentResponse` is never modified.

**Validates: Requirements 3.3, 3.4, 4.1, 5.3**

### Property 2: ID Consistency

After server ID replacement, all references (including `activeTurnId`) use the server-provided ID.

**Validates: Requirements 7.3, 7.4**

### Property 3: State Isolation

Each sub-interface has its own `STATE_ID` — controllers against different sub-interfaces never interfere.

**Validates: Requirements 4.4, 10.1**

### Property 4: No Redundant Fetches

Sub-interface hydration populates state from snapshot content only; no initial API call is made.

**Validates: Requirements 4.1**

### Property 5: Append-Only History

Turns are never removed from the array. New submissions append. Order is preserved.

**Validates: Requirements 10.3**

### Property 6: Single Active Stream

Only one turn can be in `streaming` status at a time (enforced by `submit` guard).

**Validates: Requirements 2.6**

## Testing Strategy

| Layer                   | Approach                                                                                         |
| ----------------------- | ------------------------------------------------------------------------------------------------ |
| Generative slice        | Unit tests — verify each action/reducer produces correct state transitions                       |
| GenerativeRuntime       | Unit tests with mocked endpoint facade and stream — verify routing vs agent mode dispatch        |
| Sub-interface hydration | Integration tests — verify controllers built against hydrated sub-interface expose correct state |
| ConverseController      | Unit tests — verify `submit`, `selectTurn`, guards, and state derivation                         |
| End-to-end              | Integration test with mocked `/converse` SSE stream — full lifecycle from submit to complete     |

## Requirements Mapping

| Requirement                                   | Design Element                                                                                |
| --------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Req 1: Build Generative Interface             | `buildGenerativeInterface` in `src/public/interfaces/generative.ts`                           |
| Req 2: Submit Prompt                          | `ConverseController.submit()` → `GenerativeRuntime.submit()`                                  |
| Req 3: Turn State Structure                   | `GenerativeState` type + generative slice                                                     |
| Req 4: Routing Mode — Sub-Interface Hydration | `GenerativeRuntime.hydrateSubInterface()` + hydrate actions                                   |
| Req 5: Agent Mode — Streaming Response        | `GenerativeRuntime.dispatchEvent()` agent-mode branch                                         |
| Req 6: Turn Navigation                        | `ConverseController.selectTurn()` → `actions.setActiveTurnId`                                 |
| Req 7: Turn ID Assignment                     | `GenerativeRuntime.dispatchEvent()` TURN_ID event + `actions.replaceTurnId`                   |
| Req 8: Error Handling                         | `GenerativeRuntime` error paths + `ConverseController.retry()`                                |
| Req 9: Converse Controller Instantiation      | `buildConverseController` function                                                            |
| Req 10: Turn History Ownership                | State lives in generative slice, persists across controller rebuilds                          |
| Req 11: Facet Generation                      | `buildFacetGeneratorController` registered in builder arrays, reactive to sub-interface state |
