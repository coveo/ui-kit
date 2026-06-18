# Requirements Document

## Introduction

This feature adds end-to-end support for the `search-api-response` activity type across the mock-converse-api, thermidor, and conversation-react packages. Two new prompts ("surfboard care" and "boating safety") are introduced in the mock server, and the conversation-react sample is updated to expose these prompts and render search results with pagination when the response is received.

## Glossary

- **Mock_Converse_API**: The lightweight Node.js HTTP server (`packages/mock-converse-api`) that replays pre-recorded SSE responses to simulate the Coveo `/converse` endpoint.
- **Headless_Future**: The Redux-based headless library (`packages/thermidor`) that processes converse API streams and exposes controllers for UI consumption.
- **Conversation_React_Sample**: The React sample application (`samples/thermidor/conversation-react`) that demonstrates conversational search flows.
- **Search_API_Response**: An activity type (`search-api-response`) in the converse API stream that carries a Coveo Search API payload including results, facets, and pagination metadata.
- **Prompt_Template_Map**: The lookup table in `mock-converse-api/src/constants.ts` that maps user prompt strings to pre-recorded response template identifiers.
- **Result_List_Controller**: The thermidor controller that exposes parsed search results from a routed search interface.
- **Pagination_Controller**: The thermidor controller that exposes pagination state (total count, current page, page size) from a routed search interface.

## Requirements

### Requirement 1: Register New Prompt Mappings

**User Story:** As a developer testing with the mock server, I want "surfboard care" and "boating safety" prompts to return search-api-response payloads, so that I can develop and test the search response rendering without a live backend.

#### Acceptance Criteria

1. WHEN a request with message "surfboard care" is received, THE Mock_Converse_API SHALL stream the content of `templates/response6.txt` as a Server-Sent Events response with Content-Type `text/event-stream`.
2. WHEN a request with message "boating safety" is received, THE Mock_Converse_API SHALL stream the content of `templates/response7.txt` as a Server-Sent Events response with Content-Type `text/event-stream`.
3. THE Mock_Converse_API SHALL match prompt strings for "surfboard care" and "boating safety" by trimming leading and trailing whitespace and comparing case-insensitively.
4. THE Mock_Converse_API SHALL include `response6` and `response7` in the `TemplateId` type union.
5. IF the template file for a matched prompt does not exist on disk, THEN THE Mock_Converse_API SHALL terminate with an error indicating the missing template file path.

### Requirement 2: Update Mock Server README

**User Story:** As a developer onboarding to the project, I want the README to document the new prompts, so that I can discover available mock responses without reading source code.

#### Acceptance Criteria

1. THE Mock_Converse_API README SHALL list "surfboard care" with template `response6.txt` and description "Search API results for surfboard care" in the Supported Prompts table.
2. THE Mock_Converse_API README SHALL list "boating safety" with template `response7.txt` and description "Search API results for boating safety" in the Supported Prompts table.
3. THE Mock_Converse_API README SHALL insert the new entries after the existing non-fallback entries and before the fallback row in the Supported Prompts table.
4. THE Mock_Converse_API README SHALL preserve the existing table structure and backtick-wrapped prompt text formatting.

### Requirement 3: Parse Search API Response Activity

**User Story:** As a UI developer, I want thermidor to parse the `search-api-response` activity type into structured result, facet, and pagination state, so that I can build search UIs on top of conversational flows.

#### Acceptance Criteria

1. WHEN an ACTIVITY_SNAPSHOT event with activityType "search-api-response" is received, THE Headless_Future SHALL create a routed sub-interface with useCase "search" and attach it to the corresponding turn's `routedInterface` property, marking the turn status as "complete".
2. WHEN the search-api-response content contains a `results` array, THE Result_List_Controller SHALL expose each result with at minimum the `title`, `uri`, `excerpt`, `uniqueId`, `clickUri`, and `printableUri` fields.
3. WHEN the search-api-response content contains a `totalCount` field, THE Pagination_Controller SHALL expose the total count, current page (0-indexed), page size, and total pages as numeric values.
4. IF the search-api-response content does not contain a `results` array, THEN THE Headless_Future SHALL still create the routed sub-interface and THE Result_List_Controller SHALL expose an empty results array.

### Requirement 4: Add Suggestions to Conversation React Sample

**User Story:** As a demo user, I want to see "surfboard care" and "boating safety" in the suggestions dropdown, so that I can trigger search-api-response flows with a single click.

#### Acceptance Criteria

1. THE Conversation_React_Sample SHALL include "surfboard care" in the `PROMPT_SUGGESTIONS` array.
2. THE Conversation_React_Sample SHALL include "boating safety" in the `PROMPT_SUGGESTIONS` array.
3. WHEN the user focuses the prompt input field, THE Conversation_React_Sample SHALL display a suggestions dropdown containing all entries from the `PROMPT_SUGGESTIONS` array, including "surfboard care" and "boating safety".
4. WHEN a user selects "surfboard care" or "boating safety" from the suggestions dropdown, THE Conversation_React_Sample SHALL submit the selected text to the converse controller and clear the prompt input field without requiring additional user action.

### Requirement 5: Render Search Results in Conversation React Sample

**User Story:** As a demo user, I want to see a list of search results when a search-api-response is returned, so that I can evaluate the conversational search experience.

#### Acceptance Criteria

1. WHEN a turn has a routedInterface with useCase "search" and the result list contains one or more results, THE Conversation_React_Sample SHALL render each result's title and excerpt in a list.
2. IF a result has no excerpt, THEN THE Conversation_React_Sample SHALL render the result with its title only and omit the excerpt area.
3. WHEN a turn has a routedInterface with useCase "search", THE Conversation_React_Sample SHALL render the count of results currently displayed in the list.
4. WHEN a turn has a routedInterface with useCase "search" and the result list is empty, THE Conversation_React_Sample SHALL display a message indicating that no results were found.
5. WHEN a result has a clickUri value, THE Conversation_React_Sample SHALL render the result's clickUri as a navigable hyperlink that opens in a new browser tab.
6. THE Conversation_React_Sample SHALL identify each result item in the list using the result's uniqueId.

### Requirement 6: Render Pagination in Conversation React Sample

**User Story:** As a demo user, I want to see pagination information when search results are returned, so that I understand how many results are available and where I am in the result set.

#### Acceptance Criteria

1. WHEN a turn has a routedInterface with useCase "search" and the Pagination_Controller state has a totalCount greater than 0, THE Conversation_React_Sample SHALL display the totalCount value as a visible numeric text element.
2. IF the Pagination_Controller state totalCount exceeds the number of results currently displayed in the result list, THEN THE Conversation_React_Sample SHALL display a textual indication stating how many total results exist beyond the currently displayed set.
3. WHEN the Pagination_Controller state totalPages is greater than 1, THE Conversation_React_Sample SHALL render page navigation controls that allow the user to move to the next and previous pages.
