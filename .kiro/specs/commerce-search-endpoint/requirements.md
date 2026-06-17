# Requirements Document

## Introduction

This feature adds a full Commerce Search API client layer to the `headless-future` package. It mirrors the existing search endpoint architecture (client → types → request selector → response handler → thunk slice → thunk → interface wiring) but targets the Commerce Search v2 API at `/rest/organizations/{organizationId}/commerce/v2/search`. The commerce interface already exists with stub thunks containing TODO comments; this feature replaces those stubs with a production-ready implementation.

## Glossary

- **Commerce_Search_Client**: The HTTP client module responsible for building the URL, attaching authentication headers, issuing the POST request to the Commerce Search v2 API, and returning a discriminated union result (success with data or failure with error).
- **Commerce_Search_Request_Selector**: A memoized state selector that composes Redux state from feature selectors (search box, pagination, facets, sort, configuration) into the Commerce Search v2 API request shape.
- **Commerce_Search_Response_Handler**: A function that receives the API response and dispatches the response data into the appropriate domain slices (product list, pagination, facets, sort, triggers, query correction).
- **Commerce_Search_Thunk_Slice**: A Redux Toolkit slice that tracks the pending/idle/error status of the commerce search async thunk, following the cache pattern for per-interface state isolation.
- **Commerce_Search_Thunk**: An async thunk factory function that wires the request selector, client, and response handler together, and adopts the thunk slice into the engine.
- **Commerce_Interface**: The public interface builder (`buildCommerceInterface`) that wires thunk factories with `[THUNKS]` and `[THUNK_FACTORIES]` symbols.
- **Engine**: The Redux store wrapper that manages slice adoption, state reading, and mutation dispatching.
- **EndpointStateScope**: An object containing `interfaceId` and optional `composedInterfaceId` used to namespace state per interface instance.
- **Configuration_Slice**: The existing Redux slice holding organizationId, accessToken, trackingId, language, country, currency, and endpoint values.
- **Discriminated_Union_Result**: A TypeScript union type where success responses carry `{ success: true, data }` and failure responses carry `{ success: false, error }`.

## Requirements

### Requirement 1: Commerce Search Request and Response Types

**User Story:** As a developer, I want well-defined TypeScript interfaces for the Commerce Search v2 request and response, so that type safety is enforced across all layers.

#### Acceptance Criteria

1. THE Commerce_Search_Client module SHALL export a `CommerceSearchRequest` interface with required properties: `trackingId` (string), `language` (string), `country` (string), `currency` (string), `query` (string), and `context` (object containing a `view` object with required `url` string property).
2. THE Commerce_Search_Client module SHALL export a `CommerceSearchRequest` interface with optional properties: `clientId` (string), `facets` (array of facet request objects each containing at least a `field` string and a `type` string), `page` (number), `perPage` (number), `sort` (array of sort criterion objects each containing at least a `sortCriteria` string), `debug` (boolean), `enableResults` (boolean), and `legacyFacetOptions` (object with optional `freezeFacetOrder` boolean).
3. THE Commerce_Search_Client module SHALL export a `CommerceSearchRequest` interface where the `context` object supports optional properties: `user` (object with optional `userAgent` string), `cart` (array of cart item objects each with required `productId` string and required `quantity` number), `source` (array of strings), `capture` (boolean), `labels` (record of string to string), and `custom` (record of string to unknown).
4. THE Commerce_Search_Client module SHALL export a `CommerceSearchResponse` interface with properties: `responseId` (string), `products` (array of product objects), `results` (array of result objects), `facets` (array of facet response objects), `pagination` (object with `page` number, `perPage` number, `totalEntries` number, and `totalPages` number properties), `sort` (object with `appliedSort` object and `availableSorts` array), `triggers` (array of trigger objects), and `queryCorrection` (query correction object or undefined when no correction applies).
5. IF a required property of `CommerceSearchRequest` (`trackingId`, `language`, `country`, `currency`, `query`, or `context.view.url`) is missing, THEN THE Commerce_Search_Client module SHALL produce a TypeScript compile-time error preventing construction of the request object.

### Requirement 2: Commerce Search HTTP Client

**User Story:** As a developer, I want an HTTP client that calls the Commerce Search v2 endpoint, so that the API communication is encapsulated in a single module.

#### Acceptance Criteria

1. WHEN called with a request and configuration, THE Commerce_Search_Client SHALL send a POST request to `{organizationEndpoint}/rest/organizations/{organizationId}/commerce/v2/search` with the request object as the JSON body.
2. THE Commerce_Search_Client SHALL include an `Authorization` header with value `Bearer {accessToken}`, a `Content-Type` header with value `application/json`, and a `Coveo-Organization-Id` header with the organization ID value.
3. WHEN the underlying HTTP call returns a successful response, THE Commerce_Search_Client SHALL return a Discriminated_Union_Result with `success: true` and the parsed response body as `data`.
4. WHEN the underlying HTTP call returns a non-successful response, THE Commerce_Search_Client SHALL return a Discriminated_Union_Result with `success: false` and the error string from the HTTP response, or a fallback error message indicating the commerce search request failed if no error string is provided.
5. IF the configuration is missing an organizationId, THEN THE Commerce_Search_Client SHALL return a Discriminated_Union_Result with `success: false` and an error message indicating the organization ID is not set, without making an HTTP request.
6. IF the configuration is missing an accessToken, THEN THE Commerce_Search_Client SHALL return a Discriminated_Union_Result with `success: false` and an error message indicating the access token is not set, without making an HTTP request.
7. WHERE an AbortSignal is provided in the call options, THE Commerce_Search_Client SHALL forward the signal to the underlying HTTP request for cancellation support.
8. IF the underlying HTTP call throws an exception, THEN THE Commerce_Search_Client SHALL return a Discriminated_Union_Result with `success: false` and the error transformed via `transformError` as the error string.

### Requirement 3: Commerce Search Request Selector

**User Story:** As a developer, I want a memoized selector that composes Redux state into the Commerce Search API request shape, so that the thunk can build requests declaratively from state.

#### Acceptance Criteria

1. THE Commerce_Search_Request_Selector SHALL read `trackingId`, `language`, `country`, and `currency` from the Configuration_Slice and include them as top-level properties of the returned request object.
2. THE Commerce_Search_Request_Selector SHALL read the query value from the search box selectors scoped to the sharable interface ID (`scope.composedInterfaceId ?? scope.interfaceId`) and map it to the `query` property of the Commerce Search request.
3. THE Commerce_Search_Request_Selector SHALL read pagination values from the pagination selectors scoped to `scope.interfaceId` and map them to the `page` and `perPage` properties of the Commerce Search request.
4. THE Commerce_Search_Request_Selector SHALL read facet state from the facets selectors scoped to `scope.interfaceId` and map the selected facet values to the `facets` array property of the Commerce Search request, returning an empty array when no facet values are selected.
5. THE Commerce_Search_Request_Selector SHALL read sort state from the sort selectors scoped to `scope.interfaceId` and map sort criteria to the `sort` property of the Commerce Search request, returning an empty array when no sort criteria are set.
6. THE Commerce_Search_Request_Selector SHALL obtain the current URL from the Engine's navigator context provider (`NavigatorContextProvider`) and assign it to the `context.view.url` property of the Commerce Search request. IF the navigator context provider is not configured or returns a null location, THEN THE Commerce_Search_Request_Selector SHALL set `context.view.url` to an empty string.
7. THE Commerce_Search_Request_Selector SHALL return a memoized result using `createMemoizedStateSelector` that only recomputes when at least one input selector returns a value not equal by reference to its previously returned value.

### Requirement 4: Commerce Search Response Handler

**User Story:** As a developer, I want a response handler that dispatches Commerce Search response data into the correct domain slices, so that UI controllers receive updated state.

#### Acceptance Criteria

1. WHEN a Commerce Search API call returns a response with `success: true` and non-null `data`, THE Commerce_Search_Response_Handler SHALL dispatch the `products` array into the product list slice scoped to the interface ID.
2. WHEN a successful response is received, THE Commerce_Search_Response_Handler SHALL dispatch pagination data (`page`, `perPage`, `totalEntries`, `totalPages`) into the pagination slice scoped to the interface ID.
3. WHEN a successful response contains a non-empty `facets` array, THE Commerce_Search_Response_Handler SHALL dispatch facet data from the `facets` array into the facets slice scoped to the interface ID.
4. WHEN a successful response contains a `sort` object, THE Commerce_Search_Response_Handler SHALL dispatch sort data from the `sort` object into the sort slice scoped to the interface ID.
5. WHEN the response contains a non-empty `triggers` array, THE Commerce_Search_Response_Handler SHALL dispatch trigger data into the triggers slice scoped to the interface ID.
6. WHEN the response contains a `queryCorrection` object, THE Commerce_Search_Response_Handler SHALL dispatch query correction data into the query correction slice scoped to the interface ID.
7. IF the `products` array is empty in a successful response, THEN THE Commerce_Search_Response_Handler SHALL dispatch an empty array into the product list slice scoped to the interface ID, clearing any previously stored products.
8. IF an optional response field (`facets`, `sort`, `triggers`, `queryCorrection`) is absent or empty, THEN THE Commerce_Search_Response_Handler SHALL not dispatch into the corresponding domain slice, preserving the existing slice state.

### Requirement 5: Commerce Search Thunk Slice

**User Story:** As a developer, I want a Redux slice that tracks the async status of commerce search requests, so that UI controllers can display loading and error states.

#### Acceptance Criteria

1. THE Commerce_Search_Thunk_Slice SHALL maintain a `status` field with possible values `idle` or `pending`, initialized to `idle`.
2. THE Commerce_Search_Thunk_Slice SHALL maintain an `error` field (string or null), initialized to `null`.
3. WHEN the commerce search thunk transitions to pending state, THE Commerce_Search_Thunk_Slice SHALL set `status` to `pending` and `error` to `null`.
4. WHEN the commerce search thunk transitions to fulfilled state, THE Commerce_Search_Thunk_Slice SHALL set `status` to `idle` and leave the `error` field unchanged.
5. WHEN the commerce search thunk transitions to rejected state, THE Commerce_Search_Thunk_Slice SHALL set `status` to `idle` and `error` to the value of `action.error.message`, falling back to a default error string if the message is undefined.
6. THE Commerce_Search_Thunk_Slice SHALL use the slice name pattern `{interfaceId}/commerceSearchEndpoint` for per-interface state isolation.
7. THE Commerce_Search_Thunk_Slice SHALL use a cache pattern (getOrCreate) to return the same slice instance for the same interface ID.
8. THE Commerce_Search_Thunk_Slice SHALL expose cached, per-interface selectors for `status` and `error` so that UI controllers can read the current loading and error state.

### Requirement 6: Commerce Search Thunk Factory

**User Story:** As a developer, I want an async thunk factory that wires the request selector, client, and response handler together, so that dispatching a single action executes the full commerce search flow.

#### Acceptance Criteria

1. THE Commerce_Search_Thunk SHALL be created by a factory function that accepts a FullEngine and an EndpointStateScope and returns an EndpointThunk, conforming to the EndpointThunkFactory type signature.
2. WHEN dispatched, THE Commerce_Search_Thunk SHALL read state using the Commerce_Search_Request_Selector to build the request.
3. WHEN dispatched, THE Commerce_Search_Thunk SHALL read endpoint client configuration (organizationId, accessToken, endpoint) from the Configuration_Slice.
4. WHEN dispatched, THE Commerce_Search_Thunk SHALL call the Commerce_Search_Client with the built request and configuration.
5. WHEN the Commerce_Search_Client returns a successful result with data, THE Commerce_Search_Thunk SHALL invoke the Commerce_Search_Response_Handler with the engine and response data.
6. IF the Commerce_Search_Client returns a result where success is false, THEN THE Commerce_Search_Thunk SHALL throw an Error whose message is the error string from the client result.
7. IF the Commerce_Search_Client returns a successful result where data is absent, THEN THE Commerce_Search_Thunk SHALL complete without invoking the Commerce_Search_Response_Handler and without throwing an error.
8. THE Commerce_Search_Thunk factory SHALL adopt the Commerce_Search_Thunk_Slice into the Engine during creation, keyed by the sharableInterfaceId.
9. THE Commerce_Search_Thunk SHALL use the action type pattern `{sharableInterfaceId}/commerceSearchEndpoint/execute`, where sharableInterfaceId is derived as `scope.composedInterfaceId ?? scope.interfaceId`.

### Requirement 7: Commerce Interface Integration

**User Story:** As a developer, I want the commerce interface to use the real commerce search thunk instead of the stub, so that calling the search operation on a commerce interface triggers actual API calls.

#### Acceptance Criteria

1. THE Commerce_Interface `buildCommerceInterface` function SHALL assign a Commerce_Search_Thunk factory (a function conforming to the `EndpointThunkFactory` type signature imported from the internal API modules) as the sole entry in the `[THUNK_FACTORIES]` record under the `search` key.
2. THE Commerce_Interface `buildCommerceInterface` function SHALL instantiate the Commerce_Search_Thunk by invoking the factory with the `FullEngine` instance and `EndpointStateScope` and store the resulting `EndpointThunk` in the `[THUNKS]` record under the `search` key.
3. THE Commerce_Interface SHALL remove the existing inline stub function `createCommerceSearchThunk` that contains the TODO comment and its associated `createAsyncThunk` import (if no longer needed by other code in the module).
4. WHEN the `search` thunk returned in `[THUNKS].search` is dispatched, THE Commerce_Interface SHALL trigger an actual commerce search API call rather than executing an empty no-op function body.
