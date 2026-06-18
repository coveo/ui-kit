# Implementation Plan: Commerce Search Endpoint

## Overview

This plan implements the Commerce Search v2 API client layer in `packages/thermidor`, following the proven layered architecture: Types → Client → Request Selector → Response Handler → Thunk Slice → Thunk → Interface Wiring. New domain slices (sort, triggers, query correction) are created as needed. Each task builds incrementally, wiring components together as they become available.

## Tasks

- [x] 1. Define Commerce Search Types and Client
  - [x] 1.1 Create Commerce Search request and response type interfaces
    - Create `src/api/interface/commerce-search-endpoint/commerce-search-endpoint-types.ts`
    - Define `CommerceSearchRequest` with required properties (`trackingId`, `language`, `country`, `currency`, `query`, `context` with `view.url`) and optional properties (`clientId`, `facets`, `page`, `perPage`, `sort`, `debug`, `enableResults`, `legacyFacetOptions`)
    - Define `CommerceSearchContext` with required `view` and optional `user`, `cart`, `source`, `capture`, `labels`, `custom`
    - Define `CommerceSearchResponse` with `responseId`, `products`, `results`, `facets`, `pagination`, `sort`, `triggers`, `queryCorrection`
    - Define supporting interfaces: `CommerceProduct`, `CommerceResult`, `CommerceSearchFacetRequest`, `CommerceSearchFacetResponse`, `CommerceSearchPagination`, `CommerceSearchSort`, `CommerceSearchSortCriterion`, `CommerceSearchTrigger`, `CommerceSearchQueryCorrection`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 1.2 Create Commerce Search HTTP client
    - Create `src/api/interface/commerce-search-endpoint/commerce-search-endpoint-client.ts`
    - Follow the exact pattern from `search-endpoint-client.ts`
    - Implement guard clauses for missing `organizationId` and `accessToken`
    - Build URL as `{organizationEndpoint}/rest/organizations/{organizationId}/commerce/v2/search`
    - Set headers: `Authorization: Bearer {accessToken}`, `Content-Type: application/json`, `Coveo-Organization-Id: {organizationId}`
    - Forward `AbortSignal` to the underlying HTTP request
    - Return discriminated union result: `{ success: true, data }` or `{ success: false, error }`
    - Use `transformError` for caught exceptions
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

  - [ ]\* 1.3 Write property tests for Commerce Search Client
    - **Property 1: Request Formation Correctness** — For any valid (orgId, accessToken, endpoint?) tuple, verify URL and headers are correctly constructed
    - **Validates: Requirements 2.1, 2.2**

  - [ ]\* 1.4 Write property tests for Client Response Mapping and Exception Safety
    - **Property 2: Client Response Mapping** — For any HTTP outcome, verify correct discriminated union result
    - **Property 3: Client Exception Safety** — For any exception, verify catch-and-transform behavior
    - **Validates: Requirements 2.3, 2.4, 2.8**

- [x] 2. Create new domain slices (sort, triggers, query correction)
  - [x] 2.1 Create Sort domain slice
    - Create `src/core/internal/sort/sort-slice.ts` with `SortState` (`appliedSort`, `availableSorts`)
    - Create `src/core/internal/sort/sort-actions.ts` with `getOrCreateSortActions` using factory/cache pattern
    - Create `src/core/internal/sort/sort-selectors.ts` with `getOrCreateSortSelectors` using factory/cache pattern
    - Use slice name `{interfaceId}/sort`
    - _Requirements: 4.4_

  - [x] 2.2 Create Triggers domain slice
    - Create `src/core/internal/triggers/triggers-slice.ts` with `TriggersState` (`triggers` array)
    - Create `src/core/internal/triggers/triggers-actions.ts` with `getOrCreateTriggersActions` using factory/cache pattern
    - Use slice name `{interfaceId}/triggers`
    - _Requirements: 4.5_

  - [x] 2.3 Create Query Correction domain slice
    - Create `src/core/internal/query-correction/query-correction-slice.ts` with `QueryCorrectionState` (`correction` or null)
    - Create `src/core/internal/query-correction/query-correction-actions.ts` with `getOrCreateQueryCorrectionActions` using factory/cache pattern
    - Use slice name `{interfaceId}/queryCorrection`
    - _Requirements: 4.6_

- [x] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement Commerce Search Request Selector
  - [x] 4.1 Create Commerce Search Request Selector
    - Create `src/core/internal/api/commerce-search-endpoint/commerce-search-endpoint-request-selector.ts`
    - Use `createMemoizedStateSelector` with input selectors from:
      - Configuration slice: `trackingId`, `language`, `country`, `currency`
      - Search box selectors (scoped to sharable interface ID): `query`
      - Pagination selectors (scoped to interface ID): `page`, `perPage`
      - Facets selectors (scoped to interface ID): `facets` array
      - Sort selectors (scoped to interface ID): `sort` criteria
      - Engine's navigator context provider: `context.view.url` (default to empty string when unavailable)
    - Follow the pattern from `search-endpoint-request-selector.ts` but map to the Commerce Search request shape
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [ ]\* 4.2 Write property tests for Request Selector
    - **Property 4: Request Selector State Mapping** — For any valid Redux state, verify each field maps correctly from its source
    - **Property 5: Request Selector Memoization** — For any state, verify reference equality on repeated calls and recomputation on changed inputs
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7**

- [x] 5. Implement Commerce Search Response Handler and Thunk Slice
  - [x] 5.1 Create Commerce Search Response Handler
    - Create `src/core/internal/api/commerce-search-endpoint/commerce-search-endpoint-response-handler.ts`
    - Follow the pattern from `search-endpoint-response-handler.ts`
    - Dispatch `products` and `pagination` unconditionally
    - Dispatch `facets`, `sort`, `triggers`, `queryCorrection` only when present and non-empty
    - Use `getOrCreate*Actions` factories for: product list, pagination, facets, sort, triggers, query correction
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

  - [ ]\* 5.2 Write property tests for Response Handler
    - **Property 6: Response Handler Dispatch Correctness** — For any valid response, verify unconditional dispatches and conditional dispatches for optional fields
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8**

  - [x] 5.3 Create Commerce Search Thunk Slice
    - Create `src/core/internal/api/commerce-search-endpoint/commerce-search-endpoint-thunk-slice.ts`
    - Follow the pattern from `search-endpoint-thunk-slice.ts`
    - Define state: `{ status: 'idle' | 'pending', error: string | null }`
    - Handle pending/fulfilled/rejected extra reducers
    - Use slice name `{interfaceId}/commerceSearchEndpoint`
    - Implement `getOrCreate` cache pattern for both slice and selectors
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

  - [ ]\* 5.4 Write property tests for Thunk Slice
    - **Property 7: Thunk Slice State Transitions** — For any previous state, verify pending/fulfilled/rejected transitions
    - **Property 8: Cache Pattern Idempotence** — For any interfaceId, verify getOrCreate returns same instance
    - **Validates: Requirements 5.3, 5.4, 5.5, 5.7, 5.8**

- [x] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement Commerce Search Thunk and Interface Wiring
  - [x] 7.1 Create Commerce Search Thunk factory
    - Create `src/core/internal/api/commerce-search-endpoint/commerce-search-endpoint-thunk.ts`
    - Follow the pattern from `search-endpoint-thunk.ts`
    - Factory signature: `createCommerceSearchEndpointThunk(engine: FullEngine, scope: EndpointStateScope): EndpointThunk`
    - Wire request selector, client, and response handler
    - Use action type `{sharableInterfaceId}/commerceSearchEndpoint/execute`
    - On client failure result: throw `new Error(response.error)`
    - On success with data: invoke response handler
    - On success without data: complete without invoking response handler
    - Adopt the thunk slice via `engine.adoptSlice`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9_

  - [ ]\* 7.2 Write property tests for Thunk
    - **Property 9: Naming Convention Consistency** — For any (interfaceId, composedInterfaceId?) pair, verify slice name and action type prefix
    - **Property 10: Thunk Error Propagation** — For any error string from the client, verify the thunk throws a matching Error
    - **Validates: Requirements 5.6, 6.6, 6.9**

  - [x] 7.3 Wire Commerce Search Thunk into Commerce Interface
    - Update `src/public/interfaces/commerce.ts`
    - Import `createCommerceSearchEndpointThunk` from `@/src/core/internal/api/commerce-search-endpoint/commerce-search-endpoint-thunk.js`
    - Replace the inline `createCommerceSearchThunk` stub with the imported factory
    - Remove the `createAsyncThunk` import if no longer needed by other code in the module
    - Ensure `[THUNK_FACTORIES].search` uses the new factory and `[THUNKS].search` invokes it
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ]\* 7.4 Write integration tests for end-to-end thunk flow
    - Test full flow: dispatch thunk with mocked HTTP → verify selector builds request → client called → response handler dispatches into slices
    - Test engine slice adoption: verify thunk factory calls `engine.adoptSlice`
    - Test interface wiring: build commerce interface, dispatch search, verify state updates
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.4_

- [x] 8. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- All files use ESM with `.js` extensions in imports and `@/src/...` path aliases
- The factory/cache pattern (`getOrCreate*`) ensures per-interface state isolation
- The existing `search-endpoint-*` files serve as direct templates for the commerce equivalents

## Task Dependency Graph

```json
{
  "waves": [
    {"id": 0, "tasks": ["1.1", "2.1", "2.2", "2.3"]},
    {"id": 1, "tasks": ["1.2", "4.1"]},
    {"id": 2, "tasks": ["1.3", "1.4", "4.2", "5.1", "5.3"]},
    {"id": 3, "tasks": ["5.2", "5.4", "7.1"]},
    {"id": 4, "tasks": ["7.2", "7.3"]},
    {"id": 5, "tasks": ["7.4"]}
  ]
}
```
