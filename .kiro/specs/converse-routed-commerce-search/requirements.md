# Requirements Document

## Introduction

The `/converse` endpoint backend has been updated to route non-ambiguous commerce queries directly to the commerce search API, bypassing the agent. Instead of returning an `ACTIVITY_SNAPSHOT` event, the backend now emits a custom AG-UI event with type `CUSTOM` and name `commerce-search-api-response`, whose value contains the commerce search API response body. The Thermidor package must handle this new event type to hydrate a routed commerce search sub-interface, preserving the same end-user experience as before.

## Glossary

- **Generative_Runtime**: The class (`GenerativeRuntime`) that consumes the SSE stream from the `/converse` endpoint and dispatches events to the state port.
- **Custom_Event**: An AG-UI event of type `CUSTOM` carrying a `name` string and a `value` payload, used for platform-specific extensions not covered by standard AG-UI event types.
- **Routed_Interface**: A sub-interface (commerce search or search) created when the backend routes a query directly to a search API instead of processing it through the agent.
- **Hydrate_Sub_Interface**: The function that maps an activity type string and content payload to a `RoutedInterface` by building and hydrating a commerce or search sub-interface.
- **State_Port**: The interface through which the Generative_Runtime mutates turn state (create turns, set routed interfaces, complete turns, etc.).
- **Commerce_Search_API_Response**: The JSON body returned by the commerce search API, containing products, pagination, facets, and related fields.
- **SSE_Parser**: The layer that normalizes raw SSE frames into typed `NormalizedStreamEvent` objects.

## Requirements

### Requirement 1: Handle Custom Commerce Search Event

**User Story:** As a frontend consumer of the converse endpoint, I want the Generative_Runtime to recognize and process a Custom_Event named `commerce-search-api-response`, so that routed commerce search results are displayed without going through the agent flow.

#### Acceptance Criteria

1. WHEN a Custom_Event with name `commerce-search-api-response` is received during stream consumption, THE Generative_Runtime SHALL invoke the Hydrate_Sub_Interface function with the event name as the activity type, the event value as the content payload, and the current turn prompt as the query parameter.
2. WHEN the Hydrate_Sub_Interface function returns a non-null Routed_Interface from a Custom_Event, THE Generative_Runtime SHALL set the routed interface on the current turn via the State_Port.
3. WHEN the Hydrate_Sub_Interface function returns a non-null Routed_Interface from a Custom_Event, THE Generative_Runtime SHALL complete the current turn via the State_Port.
4. WHEN a Custom_Event with name `commerce-search-api-response` results in a non-null Routed_Interface, THE Generative_Runtime SHALL treat the event as terminal, meaning no further stream events shall be dispatched for the current turn regardless of remaining events in the stream.
5. WHEN the Hydrate_Sub_Interface function returns null for a Custom_Event, THE Generative_Runtime SHALL continue dispatching subsequent stream events for the current turn without completing or failing the turn.

### Requirement 2: Pass User Query to Hydration

**User Story:** As a frontend consumer, I want the original user prompt to be forwarded during hydration of a Custom_Event-routed commerce search, so that the search box in the routed interface displays the query the user typed.

#### Acceptance Criteria

1. WHEN the Generative_Runtime invokes the Hydrate_Sub_Interface function for a Custom_Event, THE Generative_Runtime SHALL pass the current user prompt (the string provided to the most recent submit or resubmit call) as the query parameter.
2. IF the Custom_Event value includes a queryCorrection with a non-empty correctedQuery value, THEN THE Hydrate_Sub_Interface SHALL use the correctedQuery as the effective query set on the routed sub-interface search box instead of the user prompt.
3. IF the Custom_Event value does not include a queryCorrection with a non-empty correctedQuery value, THEN THE Hydrate_Sub_Interface SHALL set the user prompt as the query on the routed sub-interface search box.
4. IF the current user prompt is undefined or the query parameter is not provided, THEN THE Hydrate_Sub_Interface SHALL not set any query on the routed sub-interface search box.

### Requirement 3: Unrecognized Custom Events Are Ignored

**User Story:** As a frontend consumer, I want Custom_Events with names other than recognized routing types to be silently ignored, so that future event extensions do not break existing behavior.

#### Acceptance Criteria

1. WHEN a Custom_Event with a name that does not match any entry in the recognized activity-type routing table (currently "commerce-search-api-response" and "search-api-response") is received during stream consumption, THE Generative_Runtime SHALL return a non-terminal result with `isTerminal` equal to `false` and continue processing subsequent events in the stream.
2. WHEN a Custom_Event with an unrecognized name is received, THE Generative_Runtime SHALL NOT invoke any method on the GenerativeStatePort, leaving the turn state unchanged.
3. IF a Custom_Event with an unrecognized name is the only event in the stream before the stream closes, THEN THE Generative_Runtime SHALL treat the stream as having ended without a terminal event and fail the turn with an error indication.

### Requirement 4: Custom Event Parsing

**User Story:** As a developer, I want the SSE_Parser to correctly parse custom events from the wire format, so that the Generative_Runtime receives well-structured Custom_Event objects.

#### Acceptance Criteria

1. WHEN an SSE frame with a JSON payload containing `type: "CUSTOM"`, a `name` field (non-empty string), and a `value` field is received, THE SSE_Parser SHALL produce a NormalizedStreamEvent with type `CUSTOM`, the given name trimmed of leading and trailing whitespace, and the given value preserved in its original JSON-deserialized form (string, number, boolean, array, object, or null).
2. IF a CUSTOM-typed SSE frame has a missing, null, or whitespace-only name field, THEN THE SSE_Parser SHALL default the name to `custom`.
3. IF a CUSTOM-typed SSE frame has no `value` field present, THEN THE SSE_Parser SHALL use the `payload` field as the value; IF neither `value` nor `payload` is present, THEN THE SSE_Parser SHALL use the entire parsed JSON object as the value.
4. THE SSE_Parser SHALL preserve the full value payload without modification, truncation, or re-serialization regardless of its size or nested depth.
5. IF a CUSTOM-typed SSE frame fails AG-UI schema validation, THEN THE SSE_Parser SHALL still produce a valid Custom_Event by applying the name-defaulting and value-resolution rules defined in criteria 2 and 3, rather than returning an UnknownEvent.
