# Requirements Document

## Introduction

The `UnifiedRuntime` is a stream-processing runtime that sends user prompts to the Coveo unified endpoint (v0 AG-UI protocol) and dispatches the resulting SSE events to the `GenerativeStatePort`. It mirrors the structural patterns of `GenerativeRuntime` (singleton caching, turn lifecycle, state port dispatch) but operates on the unified endpoint's request envelope and event vocabulary. Critically, it treats `RUN_FINISHED` as non-terminal and recognizes `turn_complete` as the sole terminal success event, reflecting the multi-run turn model of the unified protocol.

## Glossary

- **UnifiedRuntime**: The runtime class responsible for sending prompts to the unified endpoint and consuming the SSE response stream
- **GenerativeStatePort**: The state mutation interface used to update the generative feature slice (turns, messages, surfaces, tool calls)
- **AgUiPayloadRequest**: The top-level request envelope sent to the unified endpoint, containing session, messages, and agentInput fields
- **Turn**: A single user-prompt-to-completion lifecycle, identified by a unique turn ID
- **SSE_Stream**: The Server-Sent Events byte stream returned by the unified endpoint
- **NormalizedStreamEvent**: A typed union of all possible events emitted by the SSE parser
- **Unified_Endpoint_Client**: The HTTP client that posts the request and returns the response stream

## Requirements

### Requirement 1: Request Envelope Construction

**User Story:** As a consuming controller, I want the runtime to build a valid `AgUiPayloadRequest` envelope from engine state, so that the unified endpoint receives all required session, message, and context data.

#### Acceptance Criteria

1. WHEN a prompt is submitted, THE UnifiedRuntime SHALL construct an `AgUiPayloadRequest` containing a `session` object with a `threadId` (from `conversationSessionId` or a generated ID), a `clientMessageId`, and empty `continuationTokens`
2. WHEN a prompt is submitted, THE UnifiedRuntime SHALL include a single user message in the `messages` array with a generated `id`, role `user`, and the prompt as `content`
3. WHEN a prompt is submitted, THE UnifiedRuntime SHALL populate the `agentInput` field with `trackingId`, `language`, `country`, `currency`, `clientId`, `message`, `conversationSessionId`, `conversationToken`, and a `context` object containing `view`, `user`, `cart`, `source`, and `custom` fields
4. WHEN navigator context is unavailable, THE UnifiedRuntime SHALL use `null` for `view.url`, `view.referrer`, and `user.userAgent`

### Requirement 2: Stream Consumption

**User Story:** As a consuming controller, I want the runtime to consume the unified endpoint SSE stream and dispatch events to the state port, so that the UI state stays synchronized with the server response.

#### Acceptance Criteria

1. WHEN the unified endpoint returns a successful response, THE UnifiedRuntime SHALL read the SSE stream using `readEventStream` and `parseSSEEvent` from the protocol layer
2. WHEN the unified endpoint returns an error response, THE UnifiedRuntime SHALL fail the turn with the error message from the client result
3. WHEN an exception is thrown during stream execution, THE UnifiedRuntime SHALL fail the turn with the exception message
4. WHEN a non-Error exception is thrown, THE UnifiedRuntime SHALL fail the turn with a default error message
5. THE UnifiedRuntime SHALL NOT import any module from `src/internal/api/conversation/`

### Requirement 3: Turn Lifecycle

**User Story:** As a consuming controller, I want the runtime to manage the full turn lifecycle (creation, streaming, completion, failure), so that the state port always reflects the correct turn status.

#### Acceptance Criteria

1. WHEN `submit(prompt)` is called, THE UnifiedRuntime SHALL create a new turn with a generated ID, the provided prompt, and status `streaming`
2. WHEN `submit(prompt)` is called, THE UnifiedRuntime SHALL set the newly created turn as the active turn
3. WHEN `resubmit(turnId, prompt)` is called, THE UnifiedRuntime SHALL clear the existing turn response and recreate it with status `streaming`
4. WHEN a `turn_started` event is received, THE UnifiedRuntime SHALL update the conversation session with the provided `conversationSessionId` and `conversationToken`
5. WHEN a `turn_complete` event is received, THE UnifiedRuntime SHALL update the conversation session and complete the turn
6. WHEN a `turn_complete` event is received, THE UnifiedRuntime SHALL treat it as the terminal success event
7. WHEN a `RUN_ERROR` event is received, THE UnifiedRuntime SHALL fail the turn with the error message (or a default if empty)
8. WHEN a `RUN_ERROR` event is received, THE UnifiedRuntime SHALL treat it as a terminal event
9. WHEN a `RUN_FINISHED` event is received, THE UnifiedRuntime SHALL NOT treat it as a terminal event
10. WHEN the stream ends without a terminal event, THE UnifiedRuntime SHALL fail the turn with a descriptive message
11. WHEN a gateway `error` event is received, THE UnifiedRuntime SHALL update the conversation session with the provided `conversationSessionId` and `conversationToken`
12. WHEN a gateway `error` event is received, THE UnifiedRuntime SHALL fail the turn with the error message from the payload (or a default message if unavailable)
13. WHEN a gateway `error` event is received, THE UnifiedRuntime SHALL treat it as a terminal event

### Requirement 4: Text Message Events

**User Story:** As a consuming controller, I want the runtime to handle text message streaming events, so that the assistant's response text is incrementally rendered.

#### Acceptance Criteria

1. WHEN a `TEXT_MESSAGE_START` event is received, THE UnifiedRuntime SHALL initialize the agent response (idempotently) and start a message with the event role
2. WHEN a `TEXT_MESSAGE_CONTENT` event is received, THE UnifiedRuntime SHALL append the delta to the current message
3. WHEN a `TEXT_MESSAGE_END` event is received, THE UnifiedRuntime SHALL acknowledge it without additional side effects

### Requirement 5: Reasoning Events

**User Story:** As a consuming controller, I want the runtime to handle reasoning message events, so that agent reasoning steps are visible in the UI.

#### Acceptance Criteria

1. WHEN a `REASONING_MESSAGE_START` event is received, THE UnifiedRuntime SHALL initialize the agent response (idempotently) and start a reasoning block
2. WHEN a `REASONING_MESSAGE_CONTENT` event is received, THE UnifiedRuntime SHALL append the reasoning delta
3. WHEN a `REASONING_MESSAGE_END` event is received, THE UnifiedRuntime SHALL end the reasoning block

### Requirement 6: Tool Call Events

**User Story:** As a consuming controller, I want the runtime to handle tool call streaming events, so that tool invocations and results are tracked in the turn state.

#### Acceptance Criteria

1. WHEN a `TOOL_CALL_START` event is received, THE UnifiedRuntime SHALL initialize the agent response (idempotently) and start a tool call with the tool call ID and name
2. WHEN a `TOOL_CALL_ARGS` event is received, THE UnifiedRuntime SHALL append the argument delta to the tool call
3. WHEN a `TOOL_CALL_END` event is received, THE UnifiedRuntime SHALL acknowledge it without additional side effects
4. WHEN a `TOOL_CALL_RESULT` event is received, THE UnifiedRuntime SHALL complete the tool call with the result content

### Requirement 7: Activity Snapshot Events

**User Story:** As a consuming controller, I want the runtime to store activity snapshots as opaque surfaces, so that surface data is available for future hydration (Task 4).

#### Acceptance Criteria

1. WHEN an `ACTIVITY_SNAPSHOT` event is received, THE UnifiedRuntime SHALL initialize the agent response (idempotently) and append the event content as an opaque surface
2. THE UnifiedRuntime SHALL NOT attempt to hydrate or interpret the surface content (deferred to Task 4)

### Requirement 8: Ignored Events

**User Story:** As a consuming controller, I want the runtime to gracefully handle events it does not process, so that unrecognized or future events do not disrupt the stream.

#### Acceptance Criteria

1. WHEN a `CUSTOM` event is received, THE UnifiedRuntime SHALL ignore it without side effects
2. WHEN a `RUN_STARTED` event is received, THE UnifiedRuntime SHALL ignore it without side effects
3. WHEN a `STATE_SNAPSHOT` event is received, THE UnifiedRuntime SHALL ignore it without side effects
4. WHEN an unknown event type is received, THE UnifiedRuntime SHALL ignore it without side effects
5. THE UnifiedRuntime SHALL NOT handle `commerce_search_api_response` or `search_api_response` events (those do not exist in the unified protocol)

### Requirement 9: Singleton Caching

**User Story:** As a consuming controller, I want one runtime instance per engine and interface combination, so that resources are shared and duplicate instances are avoided.

#### Acceptance Criteria

1. THE UnifiedRuntime SHALL maintain a singleton cache keyed by engine (WeakMap) and interface ID
2. WHEN `getInstance` is called with the same engine and interface ID, THE UnifiedRuntime SHALL return the same instance
3. WHEN `getInstance` is called with a different engine or interface ID, THE UnifiedRuntime SHALL return a different instance

### Requirement 10: Agent Response Initialization Idempotency

**User Story:** As a consuming controller, I want `initAgentResponse` to be called at most once per turn, so that the state port is not corrupted by duplicate initialization.

#### Acceptance Criteria

1. WHEN multiple events that trigger agent response initialization are received within the same turn, THE UnifiedRuntime SHALL call `initAgentResponse` exactly once
2. WHEN `resubmit` is called for a turn, THE UnifiedRuntime SHALL reset the initialization state for that turn

### Requirement 11: Stream Abort/Cancel

**User Story:** As a consuming controller, I want to cancel an in-flight stream, so that the user can stop a long-running response without waiting for completion.

#### Acceptance Criteria

1. THE UnifiedRuntime SHALL expose a `cancel()` public method
2. WHEN `cancel()` is called during an active stream, THE UnifiedRuntime SHALL abort the underlying fetch request via an AbortSignal
3. WHEN a stream is aborted via `cancel()`, THE UnifiedRuntime SHALL fail the turn with a "Cancelled" error message
4. WHEN `cancel()` is called when no stream is active, THE UnifiedRuntime SHALL have no effect (no-op)
5. WHEN `submit()` or `resubmit()` is called, THE UnifiedRuntime SHALL create a new AbortController for the stream execution
6. WHEN a previous stream is still active and `submit()` is called, THE UnifiedRuntime SHALL abort the previous stream before starting the new one
7. WHEN the stream is aborted externally (not via `cancel()`), THE UnifiedRuntime SHALL treat the abort error the same as a cancellation
