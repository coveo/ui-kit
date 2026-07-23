# Requirements Document

## Introduction

The Suggestions Dropdown is a configurable dropdown component that appears below the `PromptInput` on focus, displaying grouped suggestion sections. It supports two page contexts — a Landing page with 2 sections and a Search Results page with 3 sections — and routes item selection to either a submission action or a toast notification. The component is keyboard-navigable and fully accessible.

## Glossary

- **Dropdown**: The suggestions panel rendered below the PromptInput textarea
- **SuggestionSection**: A named group of suggestion items sharing a common icon and title
- **SuggestionItem**: A single selectable entry within a section, having a label and optional subtitle
- **PromptInput**: The existing textarea component extended to integrate the dropdown
- **useSuggestions**: A React hook encapsulating data sourcing for suggestion sections
- **ActiveIndex**: The zero-based index of the currently keyboard-highlighted item across all sections
- **Landing_Page**: The initial page context displaying 2 suggestion sections (Search, Conversational)
- **Search_Results_Page**: The results page context displaying 3 suggestion sections (Search refinements, Search, Conversational)
- **Action_Router**: The logic that maps a section ID to the appropriate action (submit or toast)

## Requirements

### Requirement 1: Dropdown Visibility

**User Story:** As a user, I want the suggestions dropdown to appear when I focus the input and disappear when appropriate, so that I can access suggestions without them interfering with my workflow.

#### Acceptance Criteria

1. WHEN the PromptInput textarea receives focus, THE Dropdown SHALL become visible
2. WHEN the PromptInput textarea loses focus, THE Dropdown SHALL hide
3. WHEN a user presses the Escape key while the Dropdown is visible, THE Dropdown SHALL hide and return focus to the textarea
4. WHEN a user selects a suggestion item, THE Dropdown SHALL hide after the selection action completes
5. WHILE the Dropdown is hidden, THE Dropdown SHALL not render any DOM elements

### Requirement 2: Grouped Section Rendering

**User Story:** As a user, I want suggestions organized into clearly labeled sections, so that I can quickly identify the type of suggestion being offered.

#### Acceptance Criteria

1. WHEN the Dropdown is visible, THE Dropdown SHALL render all sections provided in the sections array
2. THE Dropdown SHALL render each section with a header containing the section icon and title
3. THE Dropdown SHALL render all items within each section below the section header
4. IF the sections array is empty, THEN THE Dropdown SHALL not render (returns null)
5. THE Dropdown SHALL preserve the order of sections as provided in the sections array

### Requirement 3: Landing Page Configuration

**User Story:** As a user on the landing page, I want to see search and conversational suggestions, so that I can quickly start a search or begin a conversation.

#### Acceptance Criteria

1. WHEN the useSuggestions hook is called with context 'landing', THE useSuggestions hook SHALL return exactly 2 sections
2. WHEN the useSuggestions hook is called with context 'landing', THE useSuggestions hook SHALL return a section with id 'search', title 'Search', and icon 'search' as the first section
3. WHEN the useSuggestions hook is called with context 'landing', THE useSuggestions hook SHALL return a section with id 'conversational', title 'Conversational', and icon 'sparkle' as the second section

### Requirement 4: Search Results Page Configuration

**User Story:** As a user on the search results page, I want to see refinement, search, and conversational suggestions, so that I can refine my results or start a new interaction.

#### Acceptance Criteria

1. WHEN the useSuggestions hook is called with context 'search-results', THE useSuggestions hook SHALL return exactly 3 sections
2. WHEN the useSuggestions hook is called with context 'search-results', THE useSuggestions hook SHALL return a section with id 'refinements', title 'Search refinements', and icon 'filter-sparkle' as the first section
3. WHEN the useSuggestions hook is called with context 'search-results', THE useSuggestions hook SHALL return a section with id 'search' as the second section
4. WHEN the useSuggestions hook is called with context 'search-results', THE useSuggestions hook SHALL return a section with id 'conversational' as the third section

### Requirement 5: Item Rendering

**User Story:** As a user, I want each suggestion item to display its label and relevant context, so that I can understand what each suggestion will do before selecting it.

#### Acceptance Criteria

1. THE SuggestionItemRow SHALL render the item label as the primary text
2. WHERE a SuggestionItem has a subtitle defined, THE SuggestionItemRow SHALL render the subtitle as secondary text below the label
3. WHERE a SuggestionItem does not have a subtitle, THE SuggestionItemRow SHALL render only the label
4. THE SuggestionItemRow SHALL render the icon associated with the parent section inline with the item
5. WHILE an item is keyboard-highlighted (active), THE SuggestionItemRow SHALL apply a distinct visual active style

### Requirement 6: Action Routing

**User Story:** As a user, I want my selection to perform the correct action based on the section type, so that search/conversational suggestions submit a prompt and refinements show a placeholder notification.

#### Acceptance Criteria

1. WHEN a user selects an item from the 'search' section, THE Action_Router SHALL submit the item label as a prompt
2. WHEN a user selects an item from the 'conversational' section, THE Action_Router SHALL submit the item label as a prompt
3. WHEN a user selects an item from the 'refinements' section, THE Action_Router SHALL display a toast notification indicating the feature is not yet supported

### Requirement 7: Keyboard Navigation

**User Story:** As a user, I want to navigate suggestions with the keyboard, so that I can efficiently browse and select items without using the mouse.

#### Acceptance Criteria

1. WHEN a user presses ArrowDown while the Dropdown is visible, THE PromptInput SHALL move the ActiveIndex to the next item in the list
2. WHEN a user presses ArrowUp while the Dropdown is visible, THE PromptInput SHALL move the ActiveIndex to the previous item in the list
3. WHEN a user presses Enter while an item is highlighted, THE PromptInput SHALL select the highlighted item and trigger the onSuggestionSelect callback
4. WHEN the ActiveIndex is on the last item and the user presses ArrowDown, THE PromptInput SHALL wrap the ActiveIndex to the first item or clamp at the last item
5. WHEN the ActiveIndex is on the first item and the user presses ArrowUp, THE PromptInput SHALL wrap the ActiveIndex to the last item or clamp at the first item
6. WHEN the Dropdown first becomes visible, THE PromptInput SHALL set the ActiveIndex to -1 (no item highlighted)

### Requirement 8: useSuggestions Hook

**User Story:** As a developer, I want a single hook that encapsulates all suggestion data sourcing, so that the data layer can be swapped to a backend without changing consumer components.

#### Acceptance Criteria

1. THE useSuggestions hook SHALL accept an options object with `inputValue` (string) and `context` ('landing' | 'search-results')
2. THE useSuggestions hook SHALL return an object containing `sections` (SuggestionSection[]) and `isLoading` (boolean)
3. WHILE in Phase 1 (hardcoded data), THE useSuggestions hook SHALL always return `isLoading` as false
4. WHILE in Phase 1, THE useSuggestions hook SHALL accept `inputValue` without using it for filtering
5. WHEN the context is 'landing', THE useSuggestions hook SHALL return sections appropriate for the landing page
6. WHEN the context is 'search-results', THE useSuggestions hook SHALL return sections appropriate for the search results page

### Requirement 9: PromptInput Integration

**User Story:** As a developer, I want the PromptInput component extended with suggestion props, so that any page can declaratively attach suggestions to its prompt input.

#### Acceptance Criteria

1. THE PromptInput SHALL accept an optional `suggestions` prop of type SuggestionSection[]
2. THE PromptInput SHALL accept an optional `onSuggestionSelect` callback prop
3. WHERE the `suggestions` prop is provided, THE PromptInput SHALL render the SuggestionsDropdown component
4. WHERE the `suggestions` prop is not provided, THE PromptInput SHALL not render any dropdown
5. WHEN a suggestion is selected (via click or keyboard), THE PromptInput SHALL invoke the `onSuggestionSelect` callback with the selected item and its section ID

### Requirement 10: Accessibility

**User Story:** As a user relying on assistive technology, I want the suggestions dropdown to be fully accessible, so that I can navigate and select suggestions using a screen reader.

#### Acceptance Criteria

1. THE Dropdown SHALL use `role="listbox"` on the suggestions container
2. THE SuggestionItemRow SHALL use `role="option"` on each item element
3. WHILE an item is highlighted via keyboard navigation, THE PromptInput textarea SHALL set `aria-activedescendant` to the ID of the highlighted item
4. THE SuggestionSectionGroup SHALL use `role="group"` with an `aria-labelledby` attribute referencing the section header
5. THE Dropdown SHALL set `aria-hidden="true"` on all decorative icons
6. WHEN the Dropdown is hidden, THE PromptInput textarea SHALL remove the `aria-activedescendant` attribute

### Requirement 11: Blur Safety

**User Story:** As a user, I want my click on a suggestion to register even when the input loses focus, so that I never experience a lost click.

#### Acceptance Criteria

1. THE SuggestionItemRow SHALL use `mousedown` event (which fires before blur) for item selection instead of `click`
2. IF `mousedown` is not used, THEN THE PromptInput SHALL delay hiding the Dropdown by at least 150ms on blur to allow the click event to register
3. WHEN a suggestion is selected via mouse interaction, THE Dropdown SHALL close only after the selection callback has been invoked
