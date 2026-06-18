# Implementation Plan: Commerce Pagination Controller

## Overview

Implement a `PaginationController` for commerce search interfaces following the same pattern as `ProductListController`. The controller adopts the existing pagination slice, exposes derived page state, provides a guarded `selectPage` method, and is integrated into the `RoutedCommerceResults` sample component.

## Tasks

- [x] 1. Create pagination controller types and implementation
  - [x] 1.1 Create pagination controller types file
    - Create `packages/thermidor/src/public/controllers/pagination/pagination-controller-types.ts`
    - Define `PaginationControllerState` interface with `page`, `pageSize`, `totalCount`, `totalPages`
    - Define `PaginationController` interface extending `Controller` with `readonly state` and `selectPage(page: number): void`
    - Define `PaginationControllerOptions` interface with `interface: Interface & Requires<'search'>`
    - Follow the same type pattern as `product-list-controller-types.ts`
    - _Requirements: 1.2, 2.1, 2.2, 2.3, 2.4, 3.1_

  - [x] 1.2 Create pagination controller implementation
    - Create `packages/thermidor/src/public/controllers/pagination/pagination-controller.ts`
    - Implement `buildPaginationController` function that:
      - Extracts `engine` and `stateId` from `options.interface` via `ENGINE` and `STATE_ID` symbols
      - Adopts the pagination slice via `engine.adoptSlice(getOrCreatePaginationSlice(stateId))`
      - Creates selectors via `getOrCreatePaginationSelectors(stateId)`
      - Composes a memoized `controllerState` selector deriving `page` (Math.floor(firstResult/pageSize)) and `totalPages` (Math.ceil(totalCount/pageSize))
      - Handles `pageSize === 0` edge case (defaults page and totalPages to 0)
      - Returns controller with `state` getter, `subscribe`, and `selectPage`
    - Implement `selectPage(page)` with guard clauses:
      - No-op if `page < 0`
      - No-op if `page >= totalPages`
      - No-op if `page === currentPage`
      - Otherwise dispatch `setFirstResult(page * pageSize)` via `engine.mutate`
      - Then execute all search thunks from `options.interface[THUNKS].search`
    - Use `getOrCreatePaginationActions(stateId)` for dispatching `setFirstResult`
    - _Requirements: 1.1, 1.2, 1.3, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2_

  - [ ]\* 1.3 Write property tests for pagination controller
    - Create `packages/thermidor/src/public/controllers/pagination/pagination-controller.test.ts`
    - Use fast-check with Vitest
    - **Property 1: Derived state correctness** — For any valid pagination slice state where pageSize > 0, verify `state.page === Math.floor(firstResult / pageSize)` and `state.totalPages === Math.ceil(totalCount / pageSize)`
    - **Validates: Requirements 2.1, 2.4**
    - **Property 2: Valid selectPage dispatches correct firstResult** — For any state and page p where 0 <= p < totalPages and p !== currentPage, verify setFirstResult dispatched with p \* pageSize and thunk executed once
    - **Validates: Requirements 3.1**
    - **Property 3: selectPage is a no-op for invalid or redundant input** — For any page p where p < 0 OR p >= totalPages OR p === currentPage, verify no dispatch and no thunk execution
    - **Validates: Requirements 3.2, 3.3, 3.4**
    - **Property 5: Context isolation across interfaces** — For two distinct interfaces sharing the same engine, paginating one does not change the other's state
    - **Validates: Requirements 5.7**
    - _Requirements: 2.1, 2.4, 3.1, 3.2, 3.3, 3.4, 5.7_

  - [ ]\* 1.4 Write unit tests for pagination controller
    - Add example-based tests to the same test file or a separate `pagination-controller.unit.test.ts`
    - Test controller conforms to Controller interface (has `state`, `subscribe`)
    - Test initial state values: page=0, pageSize=10, totalCount=0, totalPages=0
    - Test `subscribe` returns an unsubscribe function that stops callbacks
    - **Property 4: Subscribe invokes callback on state change** — verify callback count equals number of distinct derived state transitions
    - **Validates: Requirements 4.1**
    - _Requirements: 1.2, 1.3, 4.1, 4.2_

- [x] 2. Export pagination controller from package
  - [x] 2.1 Update public controllers index
    - Modify `packages/thermidor/src/public/controllers/index.ts`
    - Add export for `buildPaginationController` from `./pagination/pagination-controller.js`
    - Add type exports for `PaginationController`, `PaginationControllerOptions`, `PaginationControllerState` from `./pagination/pagination-controller-types.js`
    - _Requirements: 6.1, 6.2_

- [x] 3. Checkpoint - Verify controller builds and tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Integrate pagination into sample app
  - [x] 4.1 Update RoutedCommerceResults component with pagination controls
    - Modify `samples/thermidor/conversation-react/src/RoutedCommerceResults.tsx`
    - Import `buildPaginationController` and `PaginationControllerState` from `@coveo/thermidor`
    - In the `useEffect`, build a second controller: `buildPaginationController({ interface: props.interface })`
    - Add local React state for `PaginationControllerState`
    - Subscribe to pagination controller state changes
    - Render pagination controls below the product list:
      - "Previous" button calling `selectPage(currentPage - 1)`, disabled when `page === 0`
      - Page indicator showing `Page {page + 1} of {totalPages}`
      - "Next" button calling `selectPage(currentPage + 1)`, disabled when `page >= totalPages - 1`
    - Hide pagination controls when `totalPages <= 1`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

- [x] 5. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The controller follows the exact same pattern as `buildProductListController` for consistency

## Task Dependency Graph

```json
{
  "waves": [
    {"id": 0, "tasks": ["1.1"]},
    {"id": 1, "tasks": ["1.2"]},
    {"id": 2, "tasks": ["2.1", "1.3", "1.4"]},
    {"id": 3, "tasks": ["4.1"]}
  ]
}
```
