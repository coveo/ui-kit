# Requirements Document

## Introduction

The generative interface is a new interface type within the thermidor multi-interface architecture (ADR-002). It provides a conversational layer that talks to a `/converse` endpoint, owns turn history, and spawns fully interactive sub-interfaces when the endpoint routes a prompt to a real API (e.g., commerce search, search). It supports both a "routing mode" (instant API delegation) and an "agent mode" (progressive streaming with messages, tool calls, and opaque A2UI surfaces).

## Glossary

- **Generative_Interface**: A headless interface type created by `buildGenerativeInterface` that holds conversation state and spawns sub-interfaces from `/converse` responses.
- **Converse_Controller**: A standalone controller that manages prompt submission, turn navigation, and streaming state for the Generative_Interface.
- **Turn**: A single prompt-response cycle containing an id, prompt text, status, and optional routed interface or agent response.
- **Routing_Mode**: An operational mode where `/converse` determines the prompt maps to a known API, calls that API, and returns an ACTIVITY_SNAPSHOT containing the response body.
- **Agent_Mode**: An operational mode where `/converse` streams progressive responses including messages, tool calls, and ACTIVITY_SNAPSHOT events with A2UI surfaces.
- **ACTIVITY_SNAPSHOT**: A response payload from `/converse` containing an `activityType` (e.g., `commerce-search-api-response`) and `content` (the API response body or A2UI surface data).
- **Sub_Interface**: A fully interactive headless interface hydrated from ACTIVITY_SNAPSHOT content, enabling standard controllers (pagination, facets, sort) to operate against the real API.
- **A2UI_Surface**: An opaque data blob passed through from the `/converse` endpoint to the view layer for rendering.
- **Controller_Builder**: A function (e.g., `buildProductListController`, `buildFacetGeneratorController`) that creates a controller instance given an interface.
- **Engine**: The opaque runtime container that manages state, as defined in ADR-002.
- **Facet_Generator_Controller**: A reactive controller that produces facet state purely from the response data, without prior configuration.

## Requirements

### Requirement 1: Build Generative Interface

**User Story:** As a developer, I want to create a generative interface with registered controller builders, so that headless knows which controllers are available for each use case when hydrating sub-interfaces.

#### Acceptance Criteria

1. THE `buildGenerativeInterface` function SHALL accept an Engine and an options object containing arrays of Controller_Builders keyed by use case (e.g., `commerceSearchControllers`, `searchControllers`).
2. THE `buildGenerativeInterface` function SHALL return a Generative_Interface instance that can be passed as the `interface` parameter to `buildConverseController` and to `composeInterfaces`.
3. WHEN a Generative_Interface is created, THE Generative_Interface SHALL initialize with an empty `turns` array, an undefined `activeTurnId`, and `isStreaming` set to false.
4. IF the options object does not contain at least one use-case key with a Controller_Builders array, THEN THE `buildGenerativeInterface` function SHALL throw an error indicating that at least one use-case with Controller_Builders is required.

### Requirement 2: Submit Prompt

**User Story:** As a developer, I want to submit a user prompt through the converse controller, so that a new turn is created and sent to the `/converse` endpoint.

#### Acceptance Criteria

1. THE Converse_Controller SHALL expose a `submit` action that accepts an object with a `prompt` string property.
2. WHEN `submit` is called, THE Converse_Controller SHALL create a new Turn with `streaming` status and add it to the turn history.
3. WHEN `submit` is called, THE Converse_Controller SHALL send the prompt and turn history to the `/converse` endpoint.
4. WHEN `submit` is called, THE Converse_Controller SHALL set the newly created Turn as the active turn.
5. IF `submit` is called with a prompt that is empty or contains only whitespace, THEN THE Converse_Controller SHALL not create a Turn and shall not send a request to the `/converse` endpoint.
6. IF `submit` is called while another Turn is in `streaming` status, THEN THE Converse_Controller SHALL not create a new Turn and shall not send a request to the `/converse` endpoint.

### Requirement 3: Turn State Structure

**User Story:** As a developer, I want each turn to expose a consistent state structure, so that I can render the appropriate UI for each turn's outcome.

#### Acceptance Criteria

1. THE Converse_Controller state SHALL expose a `turns` array, an `activeTurnId` (undefined when no turns exist), and an `isStreaming` boolean that is `true` if and only if the active Turn has a status of `streaming`.
2. Each Turn SHALL contain an `id` (server-provided string), a `prompt` (the submitted text), and a `status` (one of `streaming`, `complete`, or `error`).
3. WHEN a Turn results in routing mode, THE Turn SHALL contain a `routedInterface` object with a `type` string (the activity type) and an `interface` (the hydrated Sub_Interface), and SHALL NOT contain an `agentResponse` property.
4. WHEN a Turn results in agent mode, THE Turn SHALL contain an `agentResponse` object with a `messages` array (each message containing a `content` string and a `role` string) and a `surfaces` array of A2UI_Surface objects, and SHALL NOT contain a `routedInterface` property.
5. WHILE a Turn has a status of `streaming`, THE Turn SHALL contain neither a `routedInterface` nor an `agentResponse` property until the mode is determined by the server response.

### Requirement 4: Routing Mode — Sub-Interface Hydration

**User Story:** As a developer, I want routed turns to produce a fully interactive sub-interface pre-hydrated from the response, so that I can use standard controllers without an additional API fetch.

#### Acceptance Criteria

1. WHEN `/converse` returns an ACTIVITY_SNAPSHOT with an `activityType` that matches a key in the registered use-case Controller_Builder arrays, THE Generative_Interface SHALL hydrate a Sub_Interface from the ACTIVITY_SNAPSHOT `content` without issuing a redundant API call.
2. THE Sub_Interface SHALL be a fully interactive headless interface that supports standard controller operations (pagination, facet selection, sort) against the real API.
3. WHEN hydrating a Sub_Interface, THE Generative_Interface SHALL select Controller_Builders from the registered use-case array matching the `activityType` for that Sub_Interface.
4. WHEN a developer builds a controller against a Sub_Interface, THE controller SHALL expose the same state shape and support the same actions as one built against a directly constructed interface of the same type.
5. IF `/converse` returns an ACTIVITY_SNAPSHOT with an `activityType` that does not match any key in the registered use-case Controller_Builder arrays, THEN THE Generative_Interface SHALL not hydrate a Sub_Interface and the Turn SHALL be set to `error` status.

### Requirement 5: Agent Mode — Streaming Response

**User Story:** As a developer, I want agent-mode turns to progressively stream messages and surfaces, so that I can render partial results as they arrive.

#### Acceptance Criteria

1. WHILE `/converse` is streaming in agent mode, THE Converse_Controller SHALL append each message received from the stream as a separate entry to the active Turn's `agentResponse.messages` array.
2. WHILE `/converse` is streaming in agent mode, WHEN an ACTIVITY_SNAPSHOT event arrives, THE Converse_Controller SHALL append the contained A2UI_Surface object to the active Turn's `agentResponse.surfaces` array.
3. WHEN the stream completes, THE Converse_Controller SHALL set the active Turn status to `complete`.
4. THE Converse_Controller SHALL treat A2UI_Surface objects as opaque pass-through data without interpretation or transformation.
5. IF the stream fails after partial messages or surfaces have been appended, THEN THE Converse_Controller SHALL preserve the already-appended messages and surfaces in the Turn's `agentResponse` and set the Turn status to `error`.
6. WHEN a Turn enters agent-mode streaming, THE Converse_Controller SHALL initialize the Turn's `agentResponse` with an empty `messages` array and an empty `surfaces` array before appending any streamed data.

### Requirement 6: Turn Navigation

**User Story:** As a developer, I want to navigate between turns, so that users can revisit previous conversation results.

#### Acceptance Criteria

1. THE Converse_Controller SHALL expose a `selectTurn` action that accepts an object with an `id` string property.
2. WHEN `selectTurn` is called with an id matching an existing Turn's current id (including a temporary client-generated id), THE Converse_Controller SHALL set `activeTurnId` to the specified Turn id.
3. IF `selectTurn` is called with an id that does not match any existing Turn's current id, THEN THE Converse_Controller SHALL not modify the `activeTurnId`.
4. WHEN a Turn is navigated away from via `selectTurn`, THE Turn state (including its Sub_Interface and any in-progress stream) SHALL remain preserved in the turn history.
5. IF `selectTurn` is called while a Turn is in `streaming` status, THEN THE Converse_Controller SHALL continue processing the stream for that Turn in the background without interruption.

### Requirement 7: Turn ID Assignment

**User Story:** As a developer, I want turn IDs to come from the server, so that turns are consistently identifiable across client and server.

#### Acceptance Criteria

1. WHEN `/converse` responds, THE Converse_Controller SHALL assign the server-provided id to the corresponding Turn.
2. WHILE a Turn is in `streaming` status and awaiting a server-provided id, THE Turn SHALL use a temporary client-generated id that is unique across all Turns in the current turn history.
3. WHEN the server-provided id is received, THE Converse_Controller SHALL replace the temporary id with the server-provided id on the corresponding Turn and, IF `activeTurnId` currently equals the temporary id, THEN THE Converse_Controller SHALL update `activeTurnId` to the server-provided id.
4. WHEN the server-provided id replaces the temporary id, THE Converse_Controller SHALL ensure the Turn remains locatable in the `turns` array by its new id.

### Requirement 8: Error Handling

**User Story:** As a developer, I want failed turns to enter an error state with a retry mechanism, so that users can recover from transient failures.

#### Acceptance Criteria

1. IF the `/converse` request fails due to a network error, server error response, or response timeout, THEN THE Converse_Controller SHALL set the Turn status to `error`.
2. WHILE a Turn is in `error` status, THE Turn SHALL expose a `retry` action.
3. WHEN `retry` is called on an errored Turn, THE Converse_Controller SHALL clear any previous partial response data from that Turn and resubmit the original prompt with the existing turn history to the `/converse` endpoint.
4. WHEN `retry` is called, THE Turn status SHALL transition from `error` to `streaming`.
5. IF `retry` is called on a Turn that is not in `error` status, THEN THE Converse_Controller SHALL not modify the Turn.

### Requirement 9: Converse Controller Instantiation

**User Story:** As a developer, I want to build a converse controller by passing a generative interface, so that it follows the same pattern as other headless controllers.

#### Acceptance Criteria

1. THE `buildConverseController` function SHALL accept an options object with an `interface` property of type Generative_Interface and SHALL return a Converse_Controller instance.
2. THE Converse_Controller SHALL expose a `state` property that returns the current turn state structure as defined in Requirement 3, updating synchronously when the underlying store changes.
3. THE Converse_Controller SHALL expose a `subscribe` method that accepts a listener callback invoked whenever `state` changes and returns an unsubscribe function that removes the listener when called.
4. WHEN `subscribe` is called, THE Converse_Controller SHALL invoke the listener immediately with the current state before subsequent change-driven invocations.

### Requirement 10: Turn History Ownership

**User Story:** As a developer, I want headless to own the turn history, so that the conversation state is managed consistently and persists across controller rebuilds.

#### Acceptance Criteria

1. THE Generative_Interface SHALL own and persist the complete turn history for the lifetime of its Engine instance.
2. WHEN a Converse_Controller is rebuilt against the same Generative_Interface, THE Converse_Controller SHALL expose all existing Turns and the current `activeTurnId` in its initial state emission.
3. THE turn history SHALL be append-only at the collection level; Turns SHALL NOT be removed or reordered by new submissions, but individual Turn properties (status, id, agentResponse, routedInterface) SHALL update according to their lifecycle rules.

### Requirement 11: Facet Generation

**User Story:** As a developer, I want facets to be generated reactively from the response data, so that I do not need to configure them ahead of time.

#### Acceptance Criteria

1. WHEN the Facet_Generator_Controller is built against a Sub_Interface, THE Facet_Generator_Controller SHALL expose a `state` property containing a `facets` array, where each entry includes a `field` string, a `values` array of objects each containing a `value` string, a `numberOfResults` number, and an `isSelected` boolean.
2. THE Facet_Generator_Controller SHALL NOT require facet field names, facet types, or any other facet configuration to be provided at registration time or at build time.
3. WHEN the Sub_Interface response data changes (e.g., after pagination or sort), THE Facet_Generator_Controller SHALL reactively update its `facets` array while preserving the `isSelected` state for values that remain present in the updated response.
4. THE Facet_Generator_Controller SHALL expose a `toggleFacetValue` action that accepts an object with a `field` string and a `value` string, and toggles the `isSelected` state of the matching facet value.
5. IF the Sub_Interface response data contains no facet information, THEN THE Facet_Generator_Controller SHALL expose an empty `facets` array.
