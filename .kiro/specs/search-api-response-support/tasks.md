# Implementation Plan: Search API Response Support

## Overview

This plan implements end-to-end support for the `search-api-response` activity type across `mock-converse-api` and `conversation-react`. The headless-future layer already fully supports this activity type — no changes needed there. Work is split into: (1) registering new prompt/template mappings in the mock server, (2) updating the conversation-react sample with new suggestions and enhanced search result rendering with pagination.

## Tasks

- [x] 1. Register new prompt mappings in mock-converse-api
  - [x] 1.1 Add `response6` and `response7` to the `TemplateId` type union in `packages/mock-converse-api/src/types.ts`
    - Extend the existing `TemplateId` union with `| 'response6' | 'response7'`
    - _Requirements: 1.4_

  - [x] 1.2 Add prompt-to-template mappings in `packages/mock-converse-api/src/constants.ts`
    - Add `{prompt: 'surfboard care', templateId: 'response6'}` to `PROMPT_TEMPLATE_MAP`
    - Add `{prompt: 'boating safety', templateId: 'response7'}` to `PROMPT_TEMPLATE_MAP`
    - Insert before the end of the array (before the fallback is selected in `prompt-matcher.ts`)
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 1.3 Update `packages/mock-converse-api/README.md` with new prompt entries
    - Add a row for "surfboard care" → `response6.txt` → "Search API results for surfboard care"
    - Add a row for "boating safety" → `response7.txt` → "Search API results for boating safety"
    - Insert after the existing non-fallback entries and before the fallback row
    - Preserve existing table structure and backtick-wrapped prompt formatting
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ]\* 1.4 Write unit tests for new prompt mappings
    - Create `packages/mock-converse-api/src/prompt-matcher.spec.ts` (or extend if exists)
    - Verify `matchPrompt('surfboard care')` returns `'response6'`
    - Verify `matchPrompt('boating safety')` returns `'response7'`
    - Verify case-insensitive and trimmed matching works
    - Verify existing prompts still resolve correctly (regression)
    - Verify unmatched prompts still fall back to `response5`
    - _Requirements: 1.1, 1.2, 1.3, 1.5_

  - [ ]\* 1.5 Write property test for case-insensitive whitespace-trimmed prompt matching
    - **Property 1: Case-insensitive whitespace-trimmed prompt matching**
    - **Validates: Requirements 1.3**
    - Use fast-check to generate random whitespace/casing variations of "surfboard care" and "boating safety"
    - Assert the matcher returns `'response6'` or `'response7'` respectively for all variations
    - Configure minimum 100 iterations

- [x] 2. Checkpoint - Verify mock-converse-api changes
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Add suggestions and enhance RoutedSearchResults in conversation-react
  - [x] 3.1 Add new prompts to `PROMPT_SUGGESTIONS` in `samples/headless-future/conversation-react/src/ConversePage.tsx`
    - Add `'surfboard care'` and `'boating safety'` to the `PROMPT_SUGGESTIONS` array
    - _Requirements: 4.1, 4.2_

  - [x] 3.2 Extend `RoutedSearchResults` with pagination controller and enhanced rendering in `samples/headless-future/conversation-react/src/RoutedSearchResults.tsx`
    - Import `buildPaginationController`, `PaginationControllerState`, and `PaginationController` from `@coveo/headless-future`
    - Add pagination state and controller ref (follow same pattern as `RoutedCommerceResults.tsx`)
    - Render result count: "Showing {results.length} of {totalCount} results"
    - Render each result's `clickUri` as an `<a>` element with `target="_blank"` and `rel="noopener noreferrer"`
    - Key each result list item by `uniqueId` (already done)
    - Preserve existing "No results found." empty state message
    - Add Previous/Next pagination buttons when `totalPages > 1`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 6.1, 6.2, 6.3_

  - [ ]\* 3.3 Write property test for search result field preservation through hydration
    - **Property 2: Search result field preservation through hydration**
    - **Validates: Requirements 3.1, 3.2**
    - Use fast-check to generate random arrays of result objects with required fields (`title`, `uri`, `excerpt`, `uniqueId`, `clickUri`, `printableUri`)
    - Verify that after hydration, `buildResultListController` state preserves all field values
    - Configure minimum 100 iterations

  - [ ]\* 3.4 Write property test for pagination state derivation
    - **Property 3: Pagination state derivation from response content**
    - **Validates: Requirements 3.3**
    - Use fast-check to generate random `totalCount` values (0–10000) and `pageSize > 0`
    - Verify `buildPaginationController` state has `page === 0`, correct `totalCount`, and `totalPages === ceil(totalCount / pageSize)`
    - Configure minimum 100 iterations

  - [ ]\* 3.5 Write property test for result rendering completeness
    - **Property 4: Result rendering completeness**
    - **Validates: Requirements 5.1, 5.5, 5.6**
    - Use fast-check to generate random non-empty result arrays
    - Render `RoutedSearchResults` with mock interface, verify all titles, excerpts (when present), clickUri links with `target="_blank"`, and `uniqueId` keys are present
    - Use `@testing-library/react` for rendering assertions
    - Configure minimum 100 iterations

  - [ ]\* 3.6 Write property test for result count and total count display
    - **Property 5: Result count and total count display**
    - **Validates: Requirements 5.3, 6.1, 6.2**
    - Use fast-check to generate random `(results.length, totalCount)` pairs where `totalCount > 0`
    - Render `RoutedSearchResults`, verify both the displayed result count and totalCount are present as visible text
    - Configure minimum 100 iterations

  - [ ]\* 3.7 Write property test for pagination controls conditional rendering
    - **Property 6: Pagination controls conditional rendering**
    - **Validates: Requirements 6.3**
    - Use fast-check to generate random `totalPages` values
    - Render `RoutedSearchResults`, verify Previous/Next buttons appear iff `totalPages > 1`
    - Configure minimum 100 iterations

- [x] 4. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests use fast-check with minimum 100 iterations per property
- The headless-future package requires NO changes — existing hydration and controllers already handle `search-api-response`
- The `RoutedCommerceResults.tsx` component serves as the reference pattern for pagination integration
- Facets are explicitly out of scope

## Task Dependency Graph

```json
{
  "waves": [
    {"id": 0, "tasks": ["1.1", "3.1"]},
    {"id": 1, "tasks": ["1.2", "3.2"]},
    {"id": 2, "tasks": ["1.3", "1.4", "1.5", "3.3", "3.4"]},
    {"id": 3, "tasks": ["3.5", "3.6", "3.7"]}
  ]
}
```
