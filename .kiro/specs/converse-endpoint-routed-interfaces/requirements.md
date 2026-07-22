# Requirements Document

## Introduction

When a routed commerce interface is created from a `/converse` stream event (`commerce_search_api_response`), subsequent user interactions (pagination, filtering, sorting, re-querying) currently call the Commerce API (CAPI) directly. This feature changes that behavior so routed commerce interfaces route all subsequent API calls back through the `/converse` endpoint, mapping request parameters appropriately and extracting commerce search responses from the SSE stream.

## Glossary

- **Converse_Endpoint**: The SSE streaming endpoint at `/rest/organizations/{orgId}/commerce/unstable/agentic/converse` that orchestrates agent-driven conversations and returns streamed events.
- **Routed_Interface**: A `CommerceInterfaceImpl` instance created dynamically when the Converse_Endpoint emits a `commerce_search_api_response` event. It represents the sub-interface used to display and interact with commerce search results.
- **Facade_Resolver**: A factory function (`FacadeResolverFactory`) that produces an `EndpointThunk` responsible for executing API calls when a facade (e.g., `search`) is invoked on an interface.
- **Commerce_Search_Request**: The request payload sent to CAPI at `/rest/organizations/{orgId}/commerce/v2/search`, containing fields such as `trackingId`, `language`, `country`, `currency`, `query`, `page`, `perPage`, `sort`, `facets`, `clientId`, and `context`.
- **Converse_Request**: The request payload sent to the Converse_Endpoint, containing fields such as `trackingId`, `language`, `country`, `currency`, `message`, `context`, `conversationSessionId`, `conversationToken`, and `targetEngine`.
- **CAPI**: Commerce API — the direct commerce search endpoint.

## Requirements

### Requirement 1: Converse-Routed Commerce Search Facade Resolver

**User Story:** As a developer using a routed commerce interface, I want subsequent search interactions to be routed through the Converse_Endpoint, so that the conversational context is preserved across pagination, filtering, sorting, and re-querying.

#### Acceptance Criteria

1. WHEN a Routed_Interface of type `commerceSearch` is created from a `commerce_search_api_response` converse stream event, THE Routed_Interface SHALL use a Converse_Facade_Resolver for its `search` facade instead of the default `createCommerceSearchFacadeResolver`.
2. WHEN the Converse_Facade_Resolver executes a search, THE Converse_Facade_Resolver SHALL send a request to the Converse_Endpoint with the `query` from the commerce search state mapped to the `message` field, and SHALL include `trackingId`, `language`, `country`, `currency`, and `clientId` fields from the commerce search request context.
3. WHEN the Converse_Facade_Resolver executes a search, THE Converse_Facade_Resolver SHALL include the `conversationSessionId` and `conversationToken` from the current generative state in the request, and SHALL set the `targetEngine` field to `AGENT_CORE`.
4. WHEN the Converse_Facade_Resolver executes a search, THE Converse_Facade_Resolver SHALL include `page`, `perPage`, `sort`, and `facets` parameters from the current commerce search state in the Converse_Request body.
5. WHEN the Converse_Endpoint returns a `commerce_search_api_response` event in the stream, THE Converse_Facade_Resolver SHALL extract the response payload and pass it to the existing commerce search response handler for state hydration.
6. IF the Converse_Endpoint returns an error response or the SSE stream connection fails or terminates unexpectedly, THEN THE Converse_Facade_Resolver SHALL reject the async thunk with an error so it is handled by the existing endpoint thunk error mechanism.
7. IF the `conversationSessionId` or `conversationToken` is not available in the generative state when the Converse_Facade_Resolver executes, THEN THE Converse_Facade_Resolver SHALL omit those fields from the request rather than sending empty values.

### Requirement 2: Routed Interface Injection of Converse Resolvers

**User Story:** As a developer, I want the hydration logic to automatically inject converse-aware facade resolvers when creating routed interfaces, so that no additional configuration is needed at the consumer level.

#### Acceptance Criteria

1. WHEN `createHydrateSubInterface` creates a `CommerceInterfaceImpl` from a `commerce_search_api_response` event, THE Hydration_Logic SHALL construct the interface with a partial resolver factories override where the `search` facade uses the Converse_Facade_Resolver. Non-overridden facades (e.g., `suggestions`) SHALL fall back to their default resolvers.
2. WHEN the Hydration_Logic constructs a converse facade resolver, THE Hydration_Logic SHALL provide the resolver with a reference that allows it to read the current `conversationSessionId` and `conversationToken` from the generative state at request time, rather than capturing stale values at construction time.
3. IF `createHydrateSubInterface` is called and no `conversationSessionId` is available in the generative state, THEN THE Hydration_Logic SHALL still construct the interface with the converse facade resolver, deferring credential resolution to request time.

### Requirement 3: Converse Request Parameter Mapping

**User Story:** As a developer, I want the converse request to carry all the same parameters as a direct CAPI call, so that pagination, faceting, and sorting work identically through the converse path.

#### Acceptance Criteria

1. THE Converse_Facade_Resolver SHALL map the Commerce_Search_Request `query` field to the Converse_Request `message` field.
2. THE Converse_Facade_Resolver SHALL include `trackingId`, `language`, `country`, and `currency` from the commerce search state in the Converse_Request body.
3. IF `page`, `perPage`, `sort`, or `facets` are present in the commerce search state, THEN THE Converse_Facade_Resolver SHALL include them in the Converse_Request body using the same field names and value types as the Commerce_Search_Request.
4. THE Converse_Facade_Resolver SHALL include `clientId` from the navigator context, and a `context` object containing `user` (with `userAgent`), `view` (with `url` and `referrer`), and `cart` (array of cart items) in the Converse_Request body, matching the CoveoConversationEndpointRequest `context` structure.
5. THE Converse_Facade_Resolver SHALL set `targetEngine` to `'AGENT_CORE'` in every Converse_Request.
6. IF the Commerce_Search_Request `query` field is an empty string, THEN THE Converse_Facade_Resolver SHALL set the Converse_Request `message` field to an empty string.
7. IF `sort` is present in the commerce search state but contains zero elements, THEN THE Converse_Facade_Resolver SHALL omit the `sort` field from the Converse_Request body.
8. IF `facets` is present in the commerce search state but contains zero elements, THEN THE Converse_Facade_Resolver SHALL omit the `facets` field from the Converse_Request body.

### Requirement 4: SSE Stream Response Extraction

**User Story:** As a developer, I want the converse facade resolver to correctly parse the SSE stream and extract the relevant API response event, so that subsequent searches in routed interfaces receive proper response data.

#### Acceptance Criteria

1. WHEN the Converse_Facade_Resolver receives a stream from the Converse_Endpoint, THE Converse_Facade_Resolver SHALL iterate through each `NormalizedStreamEvent` emitted by the stream, ignoring events whose `type` does not match `commerce_search_api_response` or `RUN_ERROR`, until one of those types is encountered or the stream ends.
2. WHEN the first event matching `commerce_search_api_response` is found, THE Converse_Facade_Resolver SHALL resolve its returned promise with the event object (excluding the `type` discriminant field) as the search response payload.
3. IF the stream completes without emitting a `commerce_search_api_response` or a `RUN_ERROR` event, THEN THE Converse_Facade_Resolver SHALL reject its returned promise with an error indicating that no search response was received from the stream.
4. IF the stream emits a `RUN_ERROR` event before a `commerce_search_api_response` event, THEN THE Converse_Facade_Resolver SHALL reject its returned promise with an error containing the `message` field from that event, or a default message indicating a run error if the `message` field is empty or absent.
5. IF the underlying stream connection fails (network error, abort signal triggered, or malformed SSE data), THEN THE Converse_Facade_Resolver SHALL reject its returned promise with the error propagated from the stream reader.
