# Implementation Plan: Generative Interface

## Overview

Implement the generative interface for thermidor: a conversational layer that talks to `/converse`, manages turn history, and spawns interactive sub-interfaces when the endpoint routes to a known API. Includes a minimal React sample app demonstrating the full flow.

## Tasks

- [x] 1. Create generative domain types
  - [x] 1.1 Create `src/core/interface/generative/generative-types.ts` with `Turn`, `TurnStatus`, `RoutedInterface`, `AgentResponse`, `AgentMessage`, `A2UISurface`, `GenerativeState`, `ControllerBuilder`, and `GenerativeInterfaceOptions`. Export from `src/core/index.ts`.
    - _Requirements: 3_

- [x] 2. Create generative slice infrastructure
  - [x] 2.1 Create `src/core/internal/generative/generative-actions.ts` with scoped actions: `createTurn`, `setActiveTurnId`, `replaceTurnId`, `setRoutedInterface`, `initAgentResponse`, `appendMessage`, `appendSurface`, `completeTurn`, `failTurn`, `clearTurnResponse`. Use `getOrCreate` caching pattern.
    - _Requirements: 3, 6, 7, 10_
  - [x] 2.2 Create `src/core/internal/generative/generative-selectors.ts` with `getTurns`, `getActiveTurnId`. Use `getOrCreate` caching pattern and `createSelectSlice` pattern.
    - _Requirements: 3, 6, 10_
  - [x] 2.3 Create `src/core/internal/generative/generative-slice.ts` with initial state `{ turns: [], activeTurnId: undefined }`. Wire all action reducers. Use `getOrCreate` caching pattern.
    - _Requirements: 3, 7, 10_
  - [x] 2.4 Create `src/core/interface/generative/generative-loader.ts` for lazy slice adoption using existing loader pattern.
    - _Requirements: 10_

- [x] 3. Implement buildGenerativeInterface
  - [x] 3.1 Add `BUILDER_REGISTRY` symbol to `src/core/interface/utils/symbols.ts` and add `'generative'` to `Operations` type in interface-types.
    - _Requirements: 1_
  - [x] 3.2 Implement `buildGenerativeInterface` in `src/public/interfaces/generative.ts`. Function accepts `{ engine, options, id? }`, validates at least one use-case array, adopts the generative slice, stores builder registry, returns frozen interface. Export from `src/index.ts`.
    - _Requirements: 1_

- [x] 4. Implement GenerativeRuntime
  - [x] 4.1 Implement `GenerativeRuntime` in `src/core/interface/api/generative-endpoint/generative-runtime.ts`. Singleton-per-engine pattern. `submit(prompt)` creates turn, calls `/converse`, consumes SSE stream. `dispatchEvent` branches: `TURN_ID` → replace temp ID, recognized `ACTIVITY_SNAPSHOT` → routing mode hydration, `MESSAGE_CHUNK` → append message, unrecognized `ACTIVITY_SNAPSHOT` → append A2UI surface. `resubmit(turnId, prompt)` for retry. Stream error/completion transitions turn status.
    - _Requirements: 2, 4, 5, 7, 8_

- [x] 5. Implement sub-interface hydration
  - [x] 5.1 Define `ACTIVITY_TYPE_TO_USE_CASE` mapping. Implement `hydrateSubInterface(activityType, content)` that builds the appropriate interface, adopts result/facet/pagination slices, populates from snapshot content. Create `hydrateResultsFromSnapshot`, `hydrateFacetsFromSnapshot`, `hydratePaginationFromSnapshot` internal actions.
    - _Requirements: 4, 11_

- [x] 6. Implement buildConverseController
  - [x] 6.1 Implement `buildConverseController` in `src/public/controllers/converse/converse-controller.ts`. Accepts `{ interface: GenerativeInterface }`. `submit({ prompt })` with guards (empty prompt, concurrent streaming). `selectTurn({ id })` with guard. `retry({ id })` with guard. `state` getter via `createMemoizedStateSelector` returning `{ turns, activeTurnId, isStreaming }`. `subscribe(callback)`. Export from `src/index.ts`.
    - _Requirements: 2, 6, 8, 9_

- [x] 7. Create React sample setup
  - [x] 7.1 Create `samples/thermidor/conversation-react/src/generative-setup.ts`: build engine, create generative interface with `commerceSearchControllers` and `searchControllers` arrays, build and export converse controller.
    - _Requirements: 1, 9_

- [x] 8. Create React sample conversational UI
  - [x] 8.1 Create `ConversePage` component with prompt input (`submit` on Enter), turn history sidebar (`selectTurn` on click), active turn renderer (routed experience or agent response with messages and surfaces as JSON `<pre>`), streaming indicator, error state with retry button.
    - _Requirements: 2, 3, 5, 6, 8_

- [x] 9. Create React sample routed experience components
  - [x] 9.1 Create `RoutedCommerceResults` (product list + pagination against sub-interface) and `RoutedSearchResults` (result list + pagination against sub-interface). Wire into `ConversePage` branching on `turn.routedInterface.type`.
    - _Requirements: 4, 11_

- [x] 10. Wire sample app entry point
  - [x] 10.1 Update `App.tsx` to render `ConversePage` alongside or replacing existing conversation sample. Ensure sample builds cleanly with `vite build`.
    - _Requirements: All (integration verification)_

## Task Dependency Graph

```json
{
  "waves": [
    {"id": 0, "tasks": ["1.1"]},
    {"id": 1, "tasks": ["2.1", "2.2", "2.3", "2.4"]},
    {"id": 2, "tasks": ["3.1", "3.2"]},
    {"id": 3, "tasks": ["4.1"]},
    {"id": 4, "tasks": ["5.1"]},
    {"id": 5, "tasks": ["6.1"]},
    {"id": 6, "tasks": ["7.1"]},
    {"id": 7, "tasks": ["8.1"]},
    {"id": 8, "tasks": ["9.1"]},
    {"id": 9, "tasks": ["10.1"]}
  ]
}
```

## Notes

- This is a PoC — no backward compatibility concerns.
- The existing `ConversationRuntime` and `ConversationEndpointFacade` provide a reference implementation for streaming patterns.
- The sample app already has a working Vite + React setup with `@coveo/thermidor` as a workspace dependency.
- Sub-interface hydration reuses existing `buildCommerceInterface` / `buildSearchInterface` factories — no new interface types needed.
