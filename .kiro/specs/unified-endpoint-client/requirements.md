# Requirements Document

## Introduction

This feature creates an independent HTTP client for the v0 unified endpoint (AgentGateway / AG-UI protocol) in the thermidor package. The unified endpoint uses a different request envelope (`AgUiPayloadRequest`) compared to the existing converse endpoint's flat request shape. The client lives in its own directory (`src/internal/api/unified/`) with no shared code with the existing conversation client, making it easy to delete when the converse endpoint is retired.

## Glossary

- **Unified_Endpoint_Client**: The HTTP client responsible for sending `AgUiPayloadRequest` payloads to the unified converse endpoint and returning a streaming response.
- **AgUiPayloadRequest**: The top-level request envelope sent to the unified endpoint, containing session metadata, messages, and agent input.
- **CommerceAguiRequestModel**: The `agentInput` field within the request envelope, containing commerce-specific context (tracking, locale, cart, actions).
- **A2uiAction**: A structured UI action envelope sent in lieu of a text message, describing a user interaction (facet toggle, sort change, pagination, etc.).
- **Request_Selector**: A function that reads engine state (configuration, generative, cart, navigator context) and builds the `AgUiPayloadRequest`.
- **Engine_State**: The Redux-like state tree managed by thermidor's engine, including configuration, generative, and cart slices.

## Requirements

### Requirement 1: Unified Endpoint Type Definitions

**User Story:** As a developer, I want comprehensive TypeScript type definitions for the AG-UI request envelope, so that the request contract is statically enforced at compile time.

#### Acceptance Criteria

1. THE Unified_Endpoint_Client module SHALL export an `AgUiPayloadRequest` interface with fields: `session`, `messages`, `requestContext`, `forwardedProps`, and `agentInput`
2. THE Unified_Endpoint_Client module SHALL export a `CommerceAguiRequestModel` interface with fields: `trackingId`, `language`, `country`, `currency`, `clientId`, `message`, `action`, `conversationSessionId`, `conversationToken`, `context`, and `pinnedProducts`
3. THE Unified_Endpoint_Client module SHALL export an `A2uiAction` interface with fields: `surfaceId`, `name`, `sourceComponentId`, `timestamp`, `actionId`, `wantResponse`, and `context`
4. THE Unified_Endpoint_Client module SHALL export action context interfaces for search actions: `ExecuteSearchContext`, `ToggleFacetContext`, `DeselectAllFacetsContext`, `ToggleNumericFacetContext`, `SetNumericFacetRangeContext`, `SelectPageContext`, `SetPageSizeContext`, `SetSortContext`, `FetchMoreContext`, `RestoreStateContext`, `OverrideCorrectionContext`, `SelectProductsContext`
5. THE Unified_Endpoint_Client module SHALL export action context interfaces for suggestion actions: `FetchSuggestionsContext`, `FacetSearchContext`
6. THE Unified_Endpoint_Client module SHALL export action context interfaces for analytics actions: `CartActionContext`, `ProductClickContext`, `ProductViewContext`, `PurchaseContext`
7. THE `CommerceAguiRequestModel` interface SHALL enforce that exactly one of `message` or `action` is defined per request through TypeScript discriminated types or documentation constraints

### Requirement 2: Unified Endpoint HTTP Client

**User Story:** As a developer, I want an HTTP client that sends AG-UI requests to the unified converse endpoint and returns a streaming response, so that the engine can process server-sent events from the unified endpoint.

#### Acceptance Criteria

1. WHEN the Unified_Endpoint_Client is called with valid configuration, THE Unified_Endpoint_Client SHALL send a POST request to `{organizationEndpoint}/rest/organizations/{orgId}/commerce/unstable/agentic/converse`
2. THE Unified_Endpoint_Client SHALL include an `Authorization: Bearer {accessToken}` header on every request
3. THE Unified_Endpoint_Client SHALL include a `Content-Type: application/json` header and an `Accept: text/event-stream` header on every request
4. THE Unified_Endpoint_Client SHALL include a feature flag overrides header with `cpd-stateful-commerce-enabled: true`
5. WHEN the HTTP response has a 2xx status code and a non-null body, THE Unified_Endpoint_Client SHALL return a success result containing the response body as `ReadableStream<Uint8Array>`
6. WHEN the HTTP response has a non-2xx status code, THE Unified_Endpoint_Client SHALL return a failure result with a human-readable error message derived from the status code
7. IF a network error occurs during the request, THEN THE Unified_Endpoint_Client SHALL return a failure result with a transformed error message
8. IF the organization ID is not configured, THEN THE Unified_Endpoint_Client SHALL return a failure result without making an HTTP request
9. IF the access token is not configured, THEN THE Unified_Endpoint_Client SHALL return a failure result without making an HTTP request
10. WHEN the HTTP response has a 2xx status code but the body is null, THE Unified_Endpoint_Client SHALL return a failure result indicating an empty stream response
11. WHEN an AbortSignal is provided, THE Unified_Endpoint_Client SHALL forward the signal to the underlying fetch call

### Requirement 3: Unified Request Selector

**User Story:** As a developer, I want a request selector that builds the `AgUiPayloadRequest` from engine state, so that the client receives a properly constructed request envelope without manual assembly.

#### Acceptance Criteria

1. THE Request_Selector SHALL read `trackingId`, `language`, `country`, and `currency` from the configuration selectors
2. THE Request_Selector SHALL read `conversationSessionId`, `conversationToken`, and the active message from the generative selectors
3. THE Request_Selector SHALL read the cart context from the cart selectors
4. THE Request_Selector SHALL accept navigator context (clientId, userAgent, location, referrer) to populate the view and user context fields
5. THE Request_Selector SHALL produce a memoized output that only recomputes when its input selectors change
6. THE Request_Selector SHALL populate `agentInput.message` with the active message from the generative state
7. THE Request_Selector SHALL populate `agentInput.context.view` with the navigator location and referrer
8. THE Request_Selector SHALL populate `agentInput.context.cart` from the cart selector output

### Requirement 4: Module Independence

**User Story:** As a developer, I want the unified endpoint client to be completely independent from the conversation endpoint client, so that either can be removed without affecting the other.

#### Acceptance Criteria

1. THE Unified_Endpoint_Client module SHALL reside in `src/internal/api/unified/` with no imports from `src/internal/api/conversation/`
2. THE Unified_Endpoint_Client module SHALL re-use shared infrastructure (error handling utilities, organization endpoint resolver, memoized selectors) through their existing public paths
3. THE Unified_Endpoint_Client module SHALL export all public types and the client factory through a barrel `index.ts` file
