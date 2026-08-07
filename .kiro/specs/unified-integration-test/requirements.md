# Requirements Document

## Introduction

This spec defines an integration test suite for the unified endpoint flow in the thermidor package. The test validates that `buildUnifiedConverseController`, `UnifiedRuntime`, surface hydration, and sub-controllers work together end-to-end when wired through a real Engine. Only the HTTP transport (fetch) is mocked; all internal state management is real.

## Glossary

- **Engine**: The central state container that holds all slices and dispatches mutations
- **UnifiedConverseController**: The public controller that orchestrates conversational interactions via the unified endpoint
- **UnifiedRuntime**: Internal runtime that manages stream consumption, turn lifecycle, and surface processing
- **GenerativeUnifiedInterface**: The interface handle that provides generative (conversational) capabilities through the unified endpoint
- **SSE_Stream**: A server-sent-event byte stream (`ReadableStream<Uint8Array>`) returned by the unified endpoint
- **Surface_Hydration**: The process of creating a live `CommerceInterface` from an `ACTIVITY_SNAPSHOT` containing `createSurface` operations
- **RoutedInterface**: A hydrated sub-interface (e.g., `CommerceInterface`) attached to a turn after surface creation
- **PaginationController**: A sub-controller that attaches to a commerce interface and dispatches page-change actions
- **Turn**: A single user prompt and its associated response lifecycle (streaming → complete | error)

## Requirements

### Requirement 1: Text Agent Response Round-Trip

**User Story:** As a developer, I want to verify that submitting a prompt through the unified converse controller produces correct turn state with agent text messages, so that I can trust the full pipeline works end-to-end.

#### Acceptance Criteria

1. WHEN a prompt is submitted via `UnifiedConverseController.submit`, THE UnifiedRuntime SHALL create a turn with status `streaming`
2. WHEN the mocked SSE_Stream emits `TEXT_MESSAGE_START`, `TEXT_MESSAGE_CONTENT`, and `TEXT_MESSAGE_END` events, THE UnifiedConverseController SHALL accumulate the text delta into the turn's agent response messages
3. WHEN the mocked SSE_Stream emits `turn_complete`, THE UnifiedConverseController SHALL transition the turn status to `complete`
4. WHEN the full stream is consumed, THE UnifiedConverseController state SHALL contain one turn with the submitted prompt and the accumulated agent text

### Requirement 2: Surface Hydration Round-Trip

**User Story:** As a developer, I want to verify that an `ACTIVITY_SNAPSHOT` with `createSurface` produces a hydrated `CommerceInterface` accessible via `routedInterface`, so that I can trust surface creation works end-to-end.

#### Acceptance Criteria

1. WHEN the mocked SSE_Stream emits an `ACTIVITY_SNAPSHOT` event with `activityType: "a2ui-surface"` containing a `createSurface` operation, THE UnifiedConverseController SHALL create a `RoutedInterface` with `useCase: "commerceSearch"`
2. WHEN surface hydration completes, THE RoutedInterface SHALL expose a live `CommerceInterface` that reflects the data model from the `createSurface` payload (products, pagination, facets)
3. WHEN a `PaginationController` is attached to the hydrated `CommerceInterface`, THE PaginationController state SHALL reflect the pagination values from the initial data model

### Requirement 3: Surface Interaction and State Update

**User Story:** As a developer, I want to verify that controller actions on a hydrated surface dispatch unified endpoint requests and apply `updateDataModel` responses, so that I can trust surface interactions work end-to-end.

#### Acceptance Criteria

1. WHEN `PaginationController.selectPage` is called on the hydrated interface, THE UnifiedRuntime SHALL issue a new unified endpoint request with the action intent
2. WHEN the response SSE_Stream contains `updateDataModel` operations for `/pagination` and `/products`, THE PaginationController state SHALL reflect the updated pagination values
3. WHEN the response SSE_Stream contains `updateDataModel` operations, THE Engine state SHALL reflect the new product list data

### Requirement 4: Error Handling

**User Story:** As a developer, I want to verify that stream errors produce correct error state on the turn, so that I can trust error paths work end-to-end.

#### Acceptance Criteria

1. WHEN the mocked SSE_Stream emits a `RUN_ERROR` event, THE UnifiedConverseController SHALL transition the turn status to `error`
2. WHEN a `RUN_ERROR` event contains a message, THE turn's error field SHALL contain that message
3. IF the SSE_Stream ends without a terminal event, THEN THE UnifiedConverseController SHALL mark the turn as `error` with an appropriate message

### Requirement 5: Cancel Behavior

**User Story:** As a developer, I want to verify that cancelling a streaming turn aborts the stream and produces the correct error state, so that I can trust cancel works end-to-end.

#### Acceptance Criteria

1. WHEN `UnifiedConverseController.cancel` is called during an active stream, THE UnifiedRuntime SHALL abort the fetch request via AbortSignal
2. WHEN the stream is aborted, THE turn status SHALL transition to `error` with message "Cancelled"

### Requirement 6: Retry Behavior

**User Story:** As a developer, I want to verify that retrying a failed turn re-submits the prompt and produces a successful turn, so that I can trust retry works end-to-end.

#### Acceptance Criteria

1. WHEN `UnifiedConverseController.retry` is called with a failed turn's id, THE UnifiedRuntime SHALL resubmit the original prompt
2. WHEN the retry stream completes successfully, THE turn status SHALL transition to `complete` with the new agent response

### Requirement 7: Real Engine and Mock Boundary

**User Story:** As a developer, I want to verify that the integration test uses real Engine state management and only mocks at the network boundary, so that I can trust the test validates real internal behavior.

#### Acceptance Criteria

1. THE integration test SHALL use a real `Engine` instance (not mocked)
2. THE integration test SHALL use a real `buildGenerativeUnifiedInterface` to create the interface
3. THE integration test SHALL use a real `buildUnifiedConverseController` to create the controller
4. THE integration test SHALL mock only `createUnifiedEndpointClient` to return controllable SSE_Streams
5. THE integration test SHALL configure the Engine with valid `organizationId` and `accessToken` so the client is invoked

### Requirement 8: Controller Barrel Export

**User Story:** As a developer, I want to verify that `buildUnifiedConverseController` is exported from the controllers barrel, so that consumers can import it from the public API.

#### Acceptance Criteria

1. THE controllers barrel (`controllers/index.ts`) SHALL export `buildUnifiedConverseController`
2. THE controllers barrel SHALL export the `UnifiedConverseController`, `UnifiedConverseControllerOptions`, and `UnifiedConverseControllerState` types
