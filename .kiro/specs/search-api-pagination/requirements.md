# Requirements Document

## Introduction

This feature adds pagination controls (page navigation and results-per-page selection) for search API response sub-interfaces in the `conversation-react` sample application. The existing `buildPaginationController` in `headless-future` is reused — it already works for both commerce and search interfaces because both share the same pagination slice (`firstResult`, `pageSize`, `totalCount`). The search endpoint request selector already maps `firstResult` and `pageSize` to the Search API's `firstResult` and `numberOfResults` request body fields. The work here is extending the `RoutedSearchResults` component with a results-per-page selector and verifying that the pagination controller's `selectPage` and `setPageSize` methods correctly trigger re-fetches against the search endpoint.

## Glossary

- **Pagination_Controller**: The existing `headless-future` controller (`buildPaginationController`) that exposes pagination state and navigation methods for any interface that has a `search` thunk.
- **Search_Interface**: A sub-interface built by `buildSearchInterface` that dispatches against the Coveo Search API endpoint using `firstResult` and `numberOfResults` request body parameters.
- **Commerce_Interface**: A sub-interface built by `buildCommerceInterface` that dispatches against the Commerce Search API endpoint using `page` and `perPage` request body parameters.
- **Search_Endpoint_Request_Selector**: The selector in `search-endpoint-request-selector.ts` that derives the Search API request body from pagination slice state, mapping `firstResult` → `firstResult` and `pageSize` → `numberOfResults`.
- **RoutedSearchResults**: The React component in `conversation-react` that renders search results and pagination controls for a routed search sub-interface.
- **Conversation_React_Sample**: The sample application at `samples/headless-future/conversation-react/` that demonstrates generative interfaces with routed sub-interfaces.
- **Page_Size**: The number of results requested per page, controlled by `setPageSize` on the Pagination_Controller. Default is 10.
- **First_Result**: The zero-indexed offset of the first result to return, derived from `page * pageSize`.

## Requirements

### Requirement 1: Pagination Controller Reuse for Search Interfaces

**User Story:** As a developer, I want the same `buildPaginationController` that works for commerce to also work for search API interfaces, so that I have a single consistent pagination API regardless of the backend endpoint.

#### Acceptance Criteria

1. WHEN `buildPaginationController` is called with a Search_Interface, THE Pagination_Controller SHALL register and read from the pagination slice scoped to that interface's state ID, exposing `page`, `pageSize`, `totalCount`, and `totalPages` in its state.
2. WHEN `selectPage` is called on a Pagination_Controller bound to a Search_Interface, THE Pagination_Controller SHALL dispatch `setFirstResult` with value `page * pageSize` and execute the search endpoint thunk, causing a Search API request with the updated `firstResult` value.
3. WHEN `setPageSize` is called on a Pagination_Controller bound to a Search_Interface, THE Pagination_Controller SHALL dispatch `setFirstResult(0)` and `setPageSize(newSize)`, then execute the search endpoint thunk, causing a Search API request with `firstResult` equal to 0 and `numberOfResults` equal to the new page size.
4. IF `selectPage` is called with a page number that is negative, equal to or exceeding `totalPages`, or equal to the current page, THEN THE Pagination_Controller SHALL not dispatch any action or execute any thunk.
5. IF `setPageSize` is called with a value less than 1, THEN THE Pagination_Controller SHALL not dispatch any action or execute any thunk.

### Requirement 2: Search Endpoint Request Mapping

**User Story:** As a developer, I want the search endpoint request to correctly map pagination state to the Search API contract (`firstResult` and `numberOfResults`), so that page navigation produces the correct API calls.

#### Acceptance Criteria

1. THE Search_Endpoint_Request_Selector SHALL map the pagination slice's `firstResult` value directly to the request body's `firstResult` field.
2. THE Search_Endpoint_Request_Selector SHALL map the pagination slice's `pageSize` value to the request body's `numberOfResults` field.
3. WHEN the pagination slice has `firstResult` equal to 20 and `pageSize` equal to 10, THE Search_Endpoint_Request_Selector SHALL produce a request with `firstResult: 20` and `numberOfResults: 10`.

### Requirement 3: Results-Per-Page Control in RoutedSearchResults

**User Story:** As a demo user, I want to change how many search results are displayed per page, so that I can view more or fewer results at a time.

#### Acceptance Criteria

1. WHEN a turn has a routedInterface with useCase "search" and `totalPages` is greater than 1, THE RoutedSearchResults component SHALL render a results-per-page selector allowing the user to choose from predefined page size options.
2. THE RoutedSearchResults component SHALL offer page size options of 5, 10, 20, and 50 results per page.
3. WHEN the user selects a new page size from the results-per-page selector, THE RoutedSearchResults component SHALL call `paginationController.setPageSize` with the selected value, triggering a search API re-fetch that resets to the first page.
4. THE RoutedSearchResults component SHALL visually indicate the currently active page size in the results-per-page selector.

### Requirement 4: Page Navigation Controls in RoutedSearchResults

**User Story:** As a demo user, I want Previous and Next buttons and a page indicator when there are multiple pages of search results, so that I can navigate through the result set.

#### Acceptance Criteria

1. WHEN `totalPages` is greater than 1, THE RoutedSearchResults component SHALL render a "Previous" button, a "Next" button, and a page indicator showing the current page number and total pages.
2. WHEN the user clicks "Next", THE RoutedSearchResults component SHALL call `paginationController.selectPage(currentPage + 1)`, causing a search API request scoped to that sub-interface.
3. WHEN the user clicks "Previous", THE RoutedSearchResults component SHALL call `paginationController.selectPage(currentPage - 1)`, causing a search API request scoped to that sub-interface.
4. WHEN the current page is the first page (page 0), THE "Previous" button SHALL be disabled.
5. WHEN the current page is the last page (page equal to `totalPages - 1`), THE "Next" button SHALL be disabled.

### Requirement 5: Pagination State Isolation Across Sub-Interfaces

**User Story:** As a developer, I want pagination actions on one search sub-interface to not affect other sub-interfaces, so that each conversational turn's results maintain independent pagination state.

#### Acceptance Criteria

1. IF multiple search sub-interfaces are rendered simultaneously in the conversation, THEN paginating one sub-interface SHALL not modify the result list or pagination state of any other sub-interface.
2. IF multiple search sub-interfaces are rendered simultaneously, THEN changing the page size on one sub-interface SHALL not modify the page size of any other sub-interface.
3. WHEN a new search sub-interface is created by a generative response, THE Pagination_Controller for that sub-interface SHALL initialize with `page` equal to 0 and `pageSize` equal to the default value of 10.

</content>
</invoke>
