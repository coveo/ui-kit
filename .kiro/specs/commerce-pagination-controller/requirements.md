# Requirements Document

## Introduction

A pagination controller for the commerce search endpoint in `packages/headless-future`. The controller adopts the existing pagination slice, exposes pagination state (current page, page size, total count, total pages), and provides navigation methods (nextPage, previousPage, selectPage) that update pagination state and re-execute the commerce search thunk. It follows the same controller pattern as the existing product-list controller.

Additionally, the pagination controller is integrated into the `conversation-react` sample app so that when a generative response spawns a commerce search sub-interface, that sub-interface renders both a product list and pagination controls. This demonstrates per-sub-interface context isolation: paginating within one sub-interface only affects that sub-interface's state.

## Glossary

- **Pagination_Controller**: The public controller that exposes pagination state and navigation methods for a commerce search interface.
- **Pagination_Slice**: The Redux Toolkit slice at `src/core/internal/pagination/` that stores firstResult, pageSize, and totalCount for a given interface.
- **Commerce_Search_Thunk**: The async thunk that executes a commerce search request and dispatches the response through the response handler.
- **Interface**: The commerce interface object created by `buildCommerceInterface()`, providing engine access and search thunks.
- **Page**: A zero-indexed page number derived from `firstResult / pageSize`.
- **Total_Pages**: The total number of pages derived from `Math.ceil(totalCount / pageSize)`.
- **Conversation_React_Sample**: The sample application at `samples/headless-future/conversation-react/` that demonstrates generative interfaces with routed sub-interfaces.
- **RoutedCommerceResults**: The React component in the sample that renders a commerce search sub-interface's product list (and now, pagination controls).

## Requirements

### Requirement 1: Build Pagination Controller

**User Story:** As a developer, I want to build a pagination controller for a commerce interface, so that I can read and control pagination state for search results.

#### Acceptance Criteria

1. WHEN `buildPaginationController` is called with a commerce interface, THE Pagination_Controller SHALL register and read from the pagination slice scoped to that interface's state ID, such that subsequent state reads reflect that slice's `firstResult`, `pageSize`, and `totalCount` values.
2. WHEN `buildPaginationController` is called with a commerce interface, THE Pagination_Controller SHALL return an object with a `state` property and a `subscribe` method conforming to the base Controller interface.
3. WHEN `buildPaginationController` is called with a commerce interface and no search has yet been executed, THE Pagination_Controller SHALL expose an initial state with `page` equal to 0, `pageSize` equal to the slice's default value, `totalCount` equal to 0, and `totalPages` equal to 0.

### Requirement 2: Expose Pagination State

**User Story:** As a developer, I want to read the current pagination state, so that I can display pagination information in my UI.

#### Acceptance Criteria

1. THE Pagination_Controller SHALL expose a `state.page` property representing the current zero-indexed page number derived from `Math.floor(firstResult / pageSize)`.
2. THE Pagination_Controller SHALL expose a `state.pageSize` property representing the number of results per page, with a default value matching the pagination slice's initial `pageSize` before any search response is received.
3. THE Pagination_Controller SHALL expose a `state.totalCount` property representing the total number of results available, with a default value of 0 before any search response is received.
4. THE Pagination_Controller SHALL expose a `state.totalPages` property representing `Math.ceil(totalCount / pageSize)`, with a default value of 0 before any search response is received.

### Requirement 3: Navigate to a Specific Page

**User Story:** As a developer, I want to navigate to a specific page by number, so that I can implement any pagination UI pattern (next, previous, jump to page) using a single method.

#### Acceptance Criteria

1. WHEN `selectPage` is called with a zero-indexed page number, THE Pagination_Controller SHALL dispatch a `setFirstResult` action with the value `page * pageSize` and then execute the Commerce_Search_Thunk to fetch results for that page.
2. IF `selectPage` is called with a page number less than 0, THEN THE Pagination_Controller SHALL not dispatch any action or execute any thunk.
3. IF `selectPage` is called with a page number greater than or equal to `Math.ceil(totalCount / pageSize)`, THEN THE Pagination_Controller SHALL not dispatch any action or execute any thunk.
4. IF `selectPage` is called with the same page number as the current page, THEN THE Pagination_Controller SHALL not dispatch any action or execute any thunk.

### Requirement 4: Subscribe to State Changes

**User Story:** As a developer, I want to subscribe to pagination state changes, so that my UI re-renders when pagination state updates.

#### Acceptance Criteria

1. WHEN `subscribe` is called with a callback, THE Pagination_Controller SHALL invoke the callback each time the pagination state changes.
2. WHEN the subscription is no longer needed, THE Pagination_Controller SHALL return an unsubscribe function that stops invoking the callback.

### Requirement 5: Sample Integration — Pagination in RoutedCommerceResults

**User Story:** As a developer exploring the sample app, I want to see pagination controls on each commerce search sub-interface generated by a conversational prompt, so that I can verify context isolation works correctly — paginating one sub-interface does not affect another.

#### Acceptance Criteria

1. WHEN a generative response creates a commerce search sub-interface, THE RoutedCommerceResults component SHALL build a Pagination_Controller bound to that sub-interface.
2. THE RoutedCommerceResults component SHALL render pagination controls (Previous / Next buttons and a page indicator showing `page + 1` of `totalPages`).
3. WHEN the user clicks "Next", THE RoutedCommerceResults component SHALL call `paginationController.selectPage(currentPage + 1)`, triggering a commerce search API call scoped to that sub-interface only.
4. WHEN the user clicks "Previous", THE RoutedCommerceResults component SHALL call `paginationController.selectPage(currentPage - 1)`, triggering a commerce search API call scoped to that sub-interface only.
5. WHEN the current page is the first page, THE "Previous" button SHALL be disabled.
6. WHEN the current page is the last page, THE "Next" button SHALL be disabled.
7. IF multiple commerce search sub-interfaces are rendered simultaneously, THEN paginating one SHALL not affect the product list or pagination state of any other sub-interface.

### Requirement 6: Export Pagination Controller from Package

**User Story:** As a developer, I want to import the pagination controller from the `@coveo/headless-future` package, so that I can use it in my application.

#### Acceptance Criteria

1. THE `@coveo/headless-future` package SHALL export `buildPaginationController` from its public controllers index.
2. THE `@coveo/headless-future` package SHALL export the `PaginationController` type and `PaginationControllerState` type from its public controllers index.
