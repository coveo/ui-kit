# Implementation Plan: Search API Pagination

## Overview

Add a results-per-page `<select>` control to the `RoutedSearchResults` component in the `conversation-react` sample app, mirroring the existing pattern in `RoutedCommerceResults`. No headless-future package changes are needed — the existing `buildPaginationController` and search endpoint request selector already support search interfaces with pagination.

## Tasks

- [x] 1. Add results-per-page selector to RoutedSearchResults
  - [x] 1.1 Add `<select>` element with page size options to the pagination controls section
    - Add a `<select>` element after the "Next →" button inside the `paginationState.totalPages > 1` conditional block
    - Options: 5 per page, 10 per page, 20 per page, 50 per page
    - Bind the `value` to `paginationState.pageSize`
    - On change, call `paginationRef.current?.setPageSize(Number(e.target.value))`
    - Style with `marginLeft: 'auto'` to push it to the right (matching `RoutedCommerceResults`)
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ]\* 1.2 Write unit tests for RoutedSearchResults pagination controls
    - Verify `<select>` renders with options [5, 10, 20, 50] when `totalPages > 1`
    - Verify `<select>` value reflects current `pageSize`
    - Verify no pagination controls render when `totalPages <= 1`
    - Verify `setPageSize` is called with correct numeric value on change
    - Verify Previous button is disabled when `page === 0`
    - Verify Next button is disabled when `page === totalPages - 1`
    - Verify `selectPage(currentPage + 1)` called on Next click
    - Verify `selectPage(currentPage - 1)` called on Previous click
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 2. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Property-based tests for pagination controller behavior
  - [x]\* 3.1 Write property test for pagination state derivation
    - **Property 1: Pagination state derivation**
    - Generate random `(firstResult, pageSize, totalCount)` triples and verify `page = floor(firstResult / pageSize)`, `totalPages = ceil(totalCount / pageSize)`
    - Use `fc.nat()` for firstResult/totalCount, `fc.integer({min:1, max:100})` for pageSize
    - Minimum 100 iterations
    - **Validates: Requirements 1.1**

  - [x]\* 3.2 Write property test for selectPage guard logic
    - **Property 2: selectPage correctness with guards**
    - Generate random pagination states + target pages and verify dispatch occurs only when page is valid (non-negative, < totalPages, != currentPage)
    - **Validates: Requirements 1.2, 1.4**

  - [x]\* 3.3 Write property test for setPageSize behavior
    - **Property 3: setPageSize resets to first page**
    - Generate random page sizes (positive and non-positive) and verify that positive values dispatch `setFirstResult(0)` + `setPageSize(newSize)` + search thunk, and non-positive values are no-ops
    - **Validates: Requirements 1.3, 1.5**

  - [x]\* 3.4 Write property test for search endpoint request mapping
    - **Property 4: Search endpoint request field mapping**
    - Generate random `(firstResult, pageSize)` pairs and verify the selector produces `{firstResult: firstResult, numberOfResults: pageSize}`
    - **Validates: Requirements 2.1, 2.2, 2.3**

- [x] 4. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- The only code change required is in `samples/headless-future/conversation-react/src/RoutedSearchResults.tsx`
- The implementation mirrors `RoutedCommerceResults.tsx` which already has the same pagination select pattern
- No headless-future package changes needed — controller and selector already support search interfaces
- Property tests validate the existing pagination controller and selector behavior (regression safety)
- Each task references specific requirements for traceability

## Task Dependency Graph

```json
{
  "waves": [
    {"id": 0, "tasks": ["1.1"]},
    {"id": 1, "tasks": ["1.2", "3.1", "3.4"]},
    {"id": 2, "tasks": ["3.2", "3.3"]}
  ]
}
```
