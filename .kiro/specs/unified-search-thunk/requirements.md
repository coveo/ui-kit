# Requirements Document

## Introduction

This feature implements the unified search facade resolver and thunk for the thermidor package. When a user interacts with a hydrated `CommerceInterface` (e.g., selects a page, toggles a facet, changes sort), the controller dispatches the thunk with an `actionIntent` that specifies the exact action (e.g., `select_page`, `toggle_facet`, `set_sort`). The thunk uses this intent directly to construct the `A2uiAction` sent to the unified endpoint. The server processes the specific action and returns `updateDataModel` operations which are applied to refresh the interface.

Using `restore_state` as a catch-all was rejected because it loses `freezeCurrentValues`/`preventAutoSelect` facet hints, cannot replicate `fetch_more` semantics, doesn't update `ignoredQueryTriggers` for `override_correction`, and collapses `availableSorts` on `set_sort`. Each controller interaction must send the specific action name and context.

## Glossary

- **Unified_Endpoint**: The Coveo agentic converse API (`/commerce/unstable/agentic/converse`) that accepts `AgUiPayloadRequest` messages and returns SSE streams
- **Facade_Resolver**: A function `(iface: InterfaceHandle) => EndpointThunk` that produces an async thunk responsible for executing a search request
- **Unified_Search_Thunk**: The async thunk created by the facade resolver that sends a specific action (via `actionIntent`) and applies the response
- **ActionIntent**: A discriminated union on the thunk arg that specifies the exact action name and typed context for the server (e.g., `{name: 'select_page', context: {page: 2}}`)
- **EndpointThunkArg**: The argument type for `EndpointThunk`, extended with an optional `actionIntent` field: `{engine: FullEngine; actionIntent?: ActionIntent}`
- **A2uiAction**: The action envelope sent to the server, containing `surfaceId`, `name`, `sourceComponentId`, `timestamp`, `actionId`, `wantResponse`, and `context`
- **Surface_Id**: A server-assigned identifier for a hydrated surface, captured at hydration time
- **ACTIVITY_SNAPSHOT**: An SSE stream event of type `a2ui-surface` containing `updateDataModel` operations
- **UpdateDataModel_Operation**: An operation within an `ACTIVITY_SNAPSHOT` that updates a specific path in the interface data model
- **Unified_Stream_Extractor**: A function that consumes the response stream and extracts `updateDataModel` operations from `ACTIVITY_SNAPSHOT` events

## Requirements

### Requirement 1: EndpointThunk Arg Extension

**User Story:** As a developer, I want the `EndpointThunk` arg type to include an optional `actionIntent`, so that controllers can specify the exact action to send to the unified endpoint.

#### Acceptance Criteria

1. THE EndpointThunkArg type SHALL extend the existing `{engine: FullEngine}` shape with an optional `actionIntent?: ActionIntent` field
2. THE ActionIntent type SHALL be a discriminated union on the `name` field with variants: `execute_search`, `toggle_facet`, `toggle_exclude_facet`, `deselect_all_facets`, `toggle_numeric_facet`, `set_numeric_facet_range`, `select_page`, `set_page_size`, `set_sort`, `fetch_more`, `restore_state`, `override_correction`, `select_products`
3. WHEN `actionIntent` is not provided, THE existing converse thunk SHALL continue to operate unchanged (backward compatible)
4. THE ActionIntent context types SHALL reuse the existing context interfaces defined in `unified-endpoint-types.ts` (e.g., `SelectPageContext`, `ToggleFacetContext`, `SetSortContext`)

### Requirement 2: Facade Resolver Creation

**User Story:** As a developer, I want a unified search facade resolver factory, so that hydrated CommerceInterfaces use the unified endpoint for search interactions.

#### Acceptance Criteria

1. WHEN `createUnifiedSearchFacadeResolver` is called with a `generativeInterface` handle, a `cartInterface` handle, and a `surfaceId`, THE Unified_Search_Facade SHALL return a `FacadeResolver` compatible with the `CommerceInterface` resolver interface
2. WHEN the returned resolver is invoked with an interface handle, THE Unified_Search_Facade SHALL produce an `EndpointThunk` that targets the unified endpoint
3. THE Unified_Search_Facade SHALL capture the `surfaceId`, `generativeInterface`, and `cartInterface` in a closure so they are available to the thunk at execution time

### Requirement 3: Action Construction from Intent

**User Story:** As a developer, I want the thunk to construct the `A2uiAction` directly from the `actionIntent`, so that the server receives the exact action name and context without state inference.

#### Acceptance Criteria

1. WHEN the thunk executes with an `actionIntent`, THE Unified_Search_Thunk SHALL use `actionIntent.name` as the `A2uiAction.name` field
2. WHEN the thunk executes with an `actionIntent`, THE Unified_Search_Thunk SHALL use `actionIntent.context` as the `A2uiAction.context` field
3. THE Unified_Search_Thunk SHALL set the `A2uiAction.surfaceId` to the captured surface ID from the closure
4. THE Unified_Search_Thunk SHALL set `sourceComponentId` to `'thermidor'`
5. THE Unified_Search_Thunk SHALL set `timestamp` to the current ISO string
6. THE Unified_Search_Thunk SHALL set `actionId` to `null`
7. THE Unified_Search_Thunk SHALL set `wantResponse` to `false`
8. IF `actionIntent` is not provided, THEN THE Unified_Search_Thunk SHALL throw an error indicating that an actionIntent is required

### Requirement 4: Request Envelope Construction

**User Story:** As a developer, I want the thunk to build a complete `AgUiPayloadRequest`, so that the unified endpoint receives all necessary context alongside the action.

#### Acceptance Criteria

1. THE Unified_Search_Thunk SHALL build an `AgUiPayloadRequest` with `agentInput.message` set to null and `agentInput.action` set to the constructed `A2uiAction`
2. THE Unified_Search_Thunk SHALL include `conversationSessionId` and `conversationToken` from the generative state selectors in `agentInput`
3. THE Unified_Search_Thunk SHALL include `trackingId`, `language`, `country`, and `currency` from configuration selectors in `agentInput`
4. THE Unified_Search_Thunk SHALL include navigator context (clientId, view url, referrer, userAgent) in `agentInput.context`
5. THE Unified_Search_Thunk SHALL include cart items from the cart selectors in `agentInput.context.cart`
6. THE Unified_Search_Thunk SHALL include a valid `session` object with a `threadId` derived from the `conversationSessionId` (or a generated ID), a generated `clientMessageId`, and empty `continuationTokens`

### Requirement 5: Request Execution

**User Story:** As a developer, I want the thunk to send the request through the unified endpoint client, so that the action reaches the server.

#### Acceptance Criteria

1. WHEN the request is built, THE Unified_Search_Thunk SHALL call `createUnifiedEndpointClient().call()` with the request and endpoint client configuration
2. IF the client returns `success: false`, THEN THE Unified_Search_Thunk SHALL throw an error with the client error message
3. IF the client returns `success: true`, THEN THE Unified_Search_Thunk SHALL pass the response stream to the stream extractor

### Requirement 6: Stream Response Extraction

**User Story:** As a developer, I want a stream extractor that finds `updateDataModel` operations in the response, so that the interface state can be refreshed.

#### Acceptance Criteria

1. WHEN the response stream is consumed, THE Unified_Stream_Extractor SHALL read SSE events using the existing `readEventStream` utility
2. WHEN an `ACTIVITY_SNAPSHOT` event with `activityType` of `a2ui-surface` is encountered, THE Unified_Stream_Extractor SHALL extract the `updateDataModel` operations from the event content
3. WHEN the stream completes without any `updateDataModel` operations, THE Unified_Stream_Extractor SHALL resolve with an empty array
4. IF a `RUN_ERROR` event is encountered, THEN THE Unified_Stream_Extractor SHALL reject with the error message
5. IF the stream fails or is aborted, THEN THE Unified_Stream_Extractor SHALL propagate the error

### Requirement 7: Data Model Application

**User Story:** As a developer, I want the thunk to apply `updateDataModel` operations to the interface, so that controllers observe fresh data after an interaction.

#### Acceptance Criteria

1. WHEN `updateDataModel` operations are extracted from the stream, THE Unified_Search_Thunk SHALL apply each operation to the scoped `baseInterface` using the existing `applyDataModelUpdate` function
2. THE Unified_Search_Thunk SHALL apply operations in the order they appear in the stream
3. IF no `updateDataModel` operations are found in the response, THEN THE Unified_Search_Thunk SHALL complete without modifying the interface state

### Requirement 8: Loading State Management

**User Story:** As a developer, I want the thunk to integrate with the commerce search endpoint thunk slice, so that controllers can observe loading and error states.

#### Acceptance Criteria

1. WHEN the thunk is created, THE Unified_Search_Thunk SHALL register the thunk with the `CommerceSearchEndpointSlice` via `getOrCreateCommerceSearchEndpointSlice`
2. WHILE the thunk is executing, THE CommerceSearchEndpointSlice SHALL report status as `pending`
3. WHEN the thunk completes successfully, THE CommerceSearchEndpointSlice SHALL report status as `idle`
4. IF the thunk is rejected, THEN THE CommerceSearchEndpointSlice SHALL report status as `idle` with the error message stored

### Requirement 9: Hydration Wiring

**User Story:** As a developer, I want the surface hydration to use the real unified search facade resolver, so that controller interactions are handled by the unified endpoint.

#### Acceptance Criteria

1. WHEN `hydrateFromCreateSurface` creates a `CommerceInterface`, THE Unified_Surface_Hydration SHALL use `createUnifiedSearchFacadeResolver` with the `generativeInterface` handle, `cartInterface` handle, and the `surfaceId` from the `CreateSurfacePayload`
2. THE Unified_Surface_Hydration SHALL accept a `generativeInterface` parameter and a `cartInterface` parameter so the facade resolver has access to generative and cart state
3. THE Unified_Runtime SHALL pass its `generativeInterface` and `cartInterface` references to the hydration function

### Requirement 10: Controller Dispatch with ActionIntent

**User Story:** As a developer, I want controllers to pass `actionIntent` when dispatching the thunk, so that the unified endpoint receives the specific action for each interaction.

#### Acceptance Criteria

1. WHEN the pagination controller dispatches `selectPage`, THE Pagination_Controller SHALL pass `actionIntent: {name: 'select_page', context: {page}}` to the thunk
2. WHEN the pagination controller dispatches `setPageSize`, THE Pagination_Controller SHALL pass `actionIntent: {name: 'set_page_size', context: {pageSize}}` to the thunk
3. WHEN the sort controller dispatches `sortBy`, THE Sort_Controller SHALL pass `actionIntent: {name: 'set_sort', context: {sortCriteria, fields}}` to the thunk
4. WHEN the search-box controller dispatches `submit`, THE SearchBox_Controller SHALL pass `actionIntent: {name: 'execute_search', context: {query}}` to the thunk
5. THE controllers SHALL continue to perform optimistic state mutations before dispatching the thunk (the converse thunk uses the state; the unified thunk uses the intent)
6. THE public API of controllers SHALL remain unchanged (consumers call the same methods with the same signatures)
