# Requirements Document

## Introduction

This spec defines `buildUnifiedConverseController` — a controller factory that produces a conversation controller identical in public API to `buildConverseController` but backed by `UnifiedRuntime` instead of `GenerativeRuntime`. It targets the unified endpoint (v0) and requires a `GenerativeUnifiedInterface`. The factory is designed as a separate entry point for clean tree-shaking and straightforward deprecation when the legacy converse endpoint is retired.

## Glossary

- **Unified_Converse_Controller**: The controller instance produced by `buildUnifiedConverseController`, exposing conversation management operations over the unified endpoint.
- **Unified_Runtime**: The singleton runtime (`UnifiedRuntime`) that manages streaming conversation requests against the unified endpoint, including abort/cancel support.
- **Generative_Unified_Interface**: A typed interface handle (`GenerativeUnifiedInterface`) that binds the controller to a specific generative slice in the engine.
- **Generative_State_Port**: The mutation adapter that the runtime uses to dispatch state changes (turn creation, message deltas, tool calls, etc.) into the engine store.
- **Routed_Interface_Registry**: A per-interface cache that stores hydrated sub-interface entries (use case, snapshot, query) for turns that triggered search or commerce responses.
- **Serialized_Converse_State**: A JSON-serializable representation of conversation state used for persistence and restoration.
- **Turn**: A single user prompt and its associated agent response within a conversation.
- **Engine**: The central state container (`FullEngine`) managing slices, subscriptions, and mutations.

## Requirements

### Requirement 1: Controller Factory Signature

**User Story:** As a developer, I want a dedicated factory function for the unified converse controller, so that I can instantiate it with a `GenerativeUnifiedInterface` without pulling in legacy converse dependencies.

#### Acceptance Criteria

1. THE Unified_Converse_Controller factory SHALL accept an options object with a required `interface` property of type `GenerativeUnifiedInterface`
2. THE Unified_Converse_Controller factory SHALL accept an optional `conversationToRestore` property of type `SerializedConverseState`
3. THE Unified_Converse_Controller factory SHALL accept an optional `onSurfaceOperation` callback property
4. THE Unified_Converse_Controller factory SHALL return an object conforming to the `UnifiedConverseController` interface

### Requirement 2: Runtime Wiring

**User Story:** As a developer, I want the controller to wire `UnifiedRuntime` with a properly configured state port, so that streaming events are correctly dispatched to the generative slice.

#### Acceptance Criteria

1. WHEN the Unified_Converse_Controller is instantiated, THE controller SHALL obtain or create a singleton `UnifiedRuntime` instance for the engine and interface pair
2. WHEN the Unified_Converse_Controller is instantiated, THE controller SHALL create a Generative_State_Port that dispatches mutations to the generative slice via the interface's actions
3. WHEN the state port receives a `setRoutedInterface` call, THE Generative_State_Port SHALL register the entry (including `surfaceId`) in the Routed_Interface_Registry
4. WHEN the state port receives an `appendSurface` call with operations, THE Generative_State_Port SHALL invoke the `onSurfaceOperation` callback with the operations array

### Requirement 3: Submit Operation

**User Story:** As a developer, I want to submit a user prompt through the controller, so that a new conversation turn is created and streamed via the unified endpoint.

#### Acceptance Criteria

1. WHEN a valid non-empty prompt is submitted, THE Unified_Converse_Controller SHALL delegate to `UnifiedRuntime.submit()` with the prompt
2. WHEN an empty or whitespace-only prompt is submitted, THE Unified_Converse_Controller SHALL reject the submission without calling the runtime
3. WHEN a prompt is submitted while a turn is currently streaming, THE Unified_Converse_Controller SHALL reject the submission without calling the runtime

### Requirement 4: Cancel Operation

**User Story:** As a developer, I want to cancel an in-flight streaming turn, so that the user can abort long-running agent responses.

#### Acceptance Criteria

1. WHEN `cancel()` is called, THE Unified_Converse_Controller SHALL delegate to `UnifiedRuntime.cancel()`

### Requirement 5: Select Turn Operation

**User Story:** As a developer, I want to select a specific turn as active, so that the UI can display the details of a previously completed turn.

#### Acceptance Criteria

1. WHEN `selectTurn({id})` is called with an ID that exists in the turn list, THE Unified_Converse_Controller SHALL set that turn as the active turn
2. WHEN `selectTurn({id})` is called with an ID that does not exist, THE Unified_Converse_Controller SHALL leave the active turn unchanged

### Requirement 6: Retry Operation

**User Story:** As a developer, I want to retry a failed turn, so that transient errors can be recovered from without losing the original prompt.

#### Acceptance Criteria

1. WHEN `retry({id})` is called for a turn in error status, THE Unified_Converse_Controller SHALL delegate to `UnifiedRuntime.resubmit()` with the turn ID and original prompt
2. WHEN `retry({id})` is called for a turn not in error status, THE Unified_Converse_Controller SHALL take no action
3. WHEN `retry({id})` is called for a turn ID that does not exist, THE Unified_Converse_Controller SHALL take no action

### Requirement 7: Serialization

**User Story:** As a developer, I want to serialize the conversation state, so that it can be persisted and restored across sessions.

#### Acceptance Criteria

1. WHEN `serialize()` is called, THE Unified_Converse_Controller SHALL return a `SerializedConverseState` containing all turns, the active turn ID, conversation session metadata, and a timestamp
2. WHEN a turn has a routed interface, THE Unified_Converse_Controller SHALL include the use case, snapshot, and query in the serialized turn (excluding the live interface instance)
3. THE serialized output SHALL survive a JSON round-trip without data loss

### Requirement 8: Restoration

**User Story:** As a developer, I want to restore a previously serialized conversation, so that users can resume where they left off.

#### Acceptance Criteria

1. WHEN `restore(state)` is called, THE Unified_Converse_Controller SHALL hydrate the generative slice with the deserialized turns and metadata
2. WHEN a serialized turn has status `streaming`, THE Unified_Converse_Controller SHALL transition it to `error` with message "Stream was interrupted"
3. WHEN the `conversationToRestore` option is provided at construction, THE Unified_Converse_Controller SHALL hydrate state before the first state read

### Requirement 9: Clear Operation

**User Story:** As a developer, I want to clear all conversation state, so that a fresh conversation can begin.

#### Acceptance Criteria

1. WHEN `clear()` is called, THE Unified_Converse_Controller SHALL reset the generative slice to empty turns, no active turn, and no session metadata

### Requirement 10: Controller State

**User Story:** As a developer, I want to read the current conversation state reactively, so that the UI can render turns and streaming status.

#### Acceptance Criteria

1. THE Unified_Converse_Controller state SHALL include a `turns` array produced by merging state turns with the Routed_Interface_Registry
2. THE Unified_Converse_Controller state SHALL include an `activeTurn` property referencing the currently selected turn (or undefined)
3. THE Unified_Converse_Controller state SHALL include an `isStreaming` boolean that is true when any turn has status `streaming`
4. WHEN the generative slice changes, THE Unified_Converse_Controller SHALL notify subscribers with the updated state

### Requirement 11: Tree-Shaking Boundary

**User Story:** As a developer, I want the unified controller to be free of legacy converse imports, so that bundlers can eliminate unused code paths.

#### Acceptance Criteria

1. THE Unified_Converse_Controller module SHALL NOT import `GenerativeRuntime` from the generative API
2. THE Unified_Converse_Controller module SHALL NOT import `createConversationEndpointClient` or any converse-specific modules
3. THE Unified_Converse_Controller module SHALL NOT import `createHydrateSubInterface` (UnifiedRuntime handles hydration internally)

### Requirement 12: Public Export

**User Story:** As a developer, I want the unified converse controller to be exported from the public controllers barrel, so that consumers can import it directly.

#### Acceptance Criteria

1. THE controllers barrel (`controllers/index.ts`) SHALL export `buildUnifiedConverseController`, `UnifiedConverseController`, `UnifiedConverseControllerOptions`, and `UnifiedConverseControllerState`
