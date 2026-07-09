# Requirements Document

## Introduction

The `/converse` endpoint backend has been updated to route non-ambiguous commerce queries directly to the commerce search API, bypassing the agent. Instead of returning an `ACTIVITY_SNAPSHOT` event, the backend now emits a named SSE event `commerce-search-api-response` (or `search-api-response` for non-commerce search), whose data payload contains the search API response body. The Thermidor package must handle these new named event types to hydrate a routed search sub-interface, preserving the same end-user experience as before.

## Glossary

- **Generative_Runtime**: The class (`GenerativeRuntime`) that consumes the SSE stream from the `/converse` endpoint and dispatches events to the state port.
- **Named_SSE_Event**: An SSE frame where the event type is carried in the `event:` field (e.g., `event: commerce-search-api-response`) and the JSON payload is in the `data:` field. After parsing, the event name becomes the `type` field and the payload properties are spread into the event object.
- **Routed_Interface**: A sub-interface (commerce search or search) created when the backend routes a query directly to a search API instead of processing it through the agent.
- **Hydrate_Sub_Interface**: The function that maps an activity type string and content payload to a `RoutedInterface` by building and hydrating a commerce or search sub-interface.
- **State_Port**: The interface through which the Generative_Runtime mutates turn state (create turns, set routed interfaces, complete turns, etc.).
- **Commerce_Search_API_Response**: The JSON body returned by the commerce search API, containing products, pagination, facets, and related fields.
- **SSE_Parser**: The layer that normalizes raw SSE frames into typed `NormalizedStreamEvent` objects.

## Requirements

### Requirement 1: Handle Routed Commerce Search Event

**User Story:** As a frontend consumer of the converse endpoint, I want the Generative_Runtime to recognize and process a named SSE event `commerce-search-api-response`, so that routed commerce search results are displayed without going through the agent flow.

#### Acceptance Criteria

1. WHEN a named SSE event with type `commerce-search-api-response` is received during stream consumption, THE Generative_Runtime SHALL invoke the Hydrate_Sub_Interface function with the event type as the activity type, the entire event object as the content payload, and the current turn prompt as the query parameter.
2. WHEN the Hydrate_Sub_Interface function returns a non-null Routed_Interface from a routed search event, THE Generative_Runtime SHALL set the routed interface on the current turn via the State_Port.
3. WHEN the Hydrate_Sub_Interface function returns a non-null Routed_Interface from a routed search event, THE Generative_Runtime SHALL complete the current turn via the State_Port.
4. WHEN a routed search event results in a non-null Routed_Interface, THE Generative_Runtime SHALL treat the event as terminal, meaning no further stream events shall be dispatched for the current turn regardless of remaining events in the stream.
5. WHEN the Hydrate_Sub_Interface function returns null for a routed search event, THE Generative_Runtime SHALL continue dispatching subsequent stream events for the current turn without completing or failing the turn.

### Requirement 2: Pass User Query to Hydration

**User Story:** As a frontend consumer, I want the original user prompt to be forwarded during hydration of a routed commerce search event, so that the search box in the routed interface displays the query the user typed.

#### Acceptance Criteria

1. WHEN the Generative_Runtime invokes the Hydrate_Sub_Interface function for a routed search event, THE Generative_Runtime SHALL pass the current user prompt (the string provided to the most recent submit or resubmit call) as the query parameter.
2. IF the event payload includes a queryCorrection with a non-empty correctedQuery value, THEN THE Hydrate_Sub_Interface SHALL use the correctedQuery as the effective query set on the routed sub-interface search box instead of the user prompt.
3. IF the event payload does not include a queryCorrection with a non-empty correctedQuery value, THEN THE Hydrate_Sub_Interface SHALL set the user prompt as the query on the routed sub-interface search box.
4. IF the current user prompt is undefined or the query parameter is not provided, THEN THE Hydrate_Sub_Interface SHALL not set any query on the routed sub-interface search box.

### Requirement 3: Remove Hydration from ACTIVITY_SNAPSHOT

**User Story:** As a developer, I want the ACTIVITY_SNAPSHOT case to only handle A2UI surface rendering (appendSurface), so that routing logic is consolidated in the named event handlers and there is no dead code path.

#### Acceptance Criteria

1. WHEN an ACTIVITY_SNAPSHOT event is received, THE Generative_Runtime SHALL append the content as a surface via the State_Port without attempting hydration.
2. THE Generative_Runtime SHALL NOT invoke the Hydrate_Sub_Interface function from the ACTIVITY_SNAPSHOT handler.

### Requirement 4: SSE Parser Named Event Handling

**User Story:** As a developer, I want the SSE_Parser to correctly promote named SSE events (like `commerce-search-api-response`) into typed `NormalizedStreamEvent` objects, so that the Generative_Runtime can match them in the dispatch switch.

#### Acceptance Criteria

1. WHEN an SSE frame with `event: commerce-search-api-response` (or `event: search-api-response`) and a JSON `data:` payload is received, THE SSE_Parser SHALL produce a NormalizedStreamEvent with `type` set to the event name and all payload fields spread into the event object.
2. THE SSE_Parser SHALL preserve the full payload without modification, truncation, or re-serialization regardless of its size or nested depth.