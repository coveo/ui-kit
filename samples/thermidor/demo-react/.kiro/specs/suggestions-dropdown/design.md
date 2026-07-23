# Design Document: Suggestions Dropdown

## Overview

The Suggestions Dropdown is a shared, configurable dropdown component that appears below the `PromptInput` when it receives focus. It displays grouped suggestions — each group having a label, icon, and list of items — and dispatches different actions depending on which group an item belongs to.

The component supports two configurations: a two-section layout (Search + Conversational) used on the Landing page, and a three-section layout (Search refinements + Search + Conversational) used on the Search Results page. The architecture separates data (suggestion definitions), presentation (dropdown rendering), and behavior (action dispatch) to allow future replacement of hardcoded data with backend-driven suggestions (Task 12).

## Architecture

The dropdown is a pure presentational component: it renders whatever `SuggestionSection[]` it receives. Visibility is managed by the parent (`PromptInput` wrapper) based on focus state. A `useSuggestions` hook owns all data-sourcing logic — today returning hardcoded data, tomorrow subscribing to backend-provided suggestions via the converse controller or a dedicated suggestions controller.

The architecture diagram shows:
- PromptInput manages focus/blur events and controls SuggestionsDropdown visibility
- SuggestionsDropdown renders N SuggestionSection groups, each containing SuggestionItem rows
- LandingPage uses useSuggestions('landing') to get 2 sections
- SearchResultsPage uses useSuggestions('search-results') to get 3 sections
- The onSelect callback routes to either ConverseController (submit) or Toast (not supported)
- The useSuggestions hook currently returns hardcoded data, but will subscribe to the unified API / Converse Endpoint in the future

## Data Sourcing Hook

### `useSuggestions` Hook

**Purpose**: Encapsulates all suggestion data sourcing behind a single hook. Today it returns hardcoded data; in the future it will subscribe to the ConverseController's suggestion state once the unified API exposes suggestions through the converse endpoint.

**Interface**:

```typescript
interface UseSuggestionsOptions {
  /** Current text in the input — will be used for filtering/debouncing when real backend arrives */
  inputValue: string;
  /** Which page context the suggestions are for — determines which sections to include */
  context: 'landing' | 'search-results';
}

interface UseSuggestionsResult {
  sections: SuggestionSection[];
  isLoading: boolean;
}

function useSuggestions(options: UseSuggestionsOptions): UseSuggestionsResult;
```

**Phase 1 (current)**: Returns hardcoded sections based on `context`. `isLoading` is always `false`. `inputValue` is accepted but unused.

**Future integration path**: When the converse controller (or a dedicated suggestions controller built on the unified API) provides real suggestion data, this hook is the **only place that changes**. It will:
- Subscribe to suggestion state from the controller
- Map the backend response shape into `SuggestionSection[]`
- Use `inputValue` to trigger debounced suggestion requests
- Potentially merge backend-provided search suggestions with still-hardcoded conversational/refinement sections (until those are also backend-driven)
- Set `isLoading` based on the controller's request state

The dropdown component and page-level action handlers remain untouched — they only consume `SuggestionSection[]`.

## Components and Interfaces

### Component 1: SuggestionsDropdown

**Purpose**: Renders the full dropdown panel with N grouped sections. Manages keyboard navigation across all items.

**Interface**:

```typescript
interface SuggestionItem {
  id: string;
  label: string;
  subtitle?: string;
}

type SuggestionIconType = 'search' | 'sparkle' | 'filter-sparkle';

interface SuggestionSection {
  id: string;
  title: string;
  icon: SuggestionIconType;
  items: SuggestionItem[];
}

interface SuggestionsDropdownProps {
  sections: SuggestionSection[];
  onSelect: (item: SuggestionItem, sectionId: string) => void;
  visible: boolean;
  activeIndex?: number;
  inputValue?: string;
}
```

**Responsibilities**:
- Render grouped sections with headers and icons
- Delegate item rendering to SuggestionItemRow
- Manage ARIA attributes for accessibility (listbox role, option roles, aria-activedescendant)
- Report selected item + section to parent via `onSelect`

### Component 2: SuggestionSectionGroup

**Purpose**: Renders a single section header (icon + title) and its list of items.

**Interface**:

```typescript
interface SuggestionSectionGroupProps {
  section: SuggestionSection;
  onSelect: (item: SuggestionItem) => void;
  activeItemId?: string;
  startIndex: number;
}
```

**Responsibilities**:
- Render section header with icon and label
- Render list of SuggestionItemRow components
- Pass active state for keyboard navigation highlighting

### Component 3: SuggestionItemRow

**Purpose**: Renders a single suggestion item, optionally with a subtitle.

**Interface**:

```typescript
interface SuggestionItemRowProps {
  item: SuggestionItem;
  icon: SuggestionIconType;
  isActive: boolean;
  onSelect: () => void;
  id: string;
}
```

**Responsibilities**:
- Render the item label and optional subtitle
- Render the section's icon inline with the item
- Apply active/highlighted styling when keyboard-navigated
- Trigger `onSelect` on click (via mousedown for blur safety)

### Component 4: PromptInput (extended)

**Purpose**: Extended to integrate the dropdown. Manages focus state and keyboard navigation delegation.

**Interface** (additions to existing props):

```typescript
interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  disabled?: boolean;
  placeholder?: string;
  initialValue?: string;
  suggestions?: SuggestionSection[];
  onSuggestionSelect?: (item: SuggestionItem, sectionId: string) => void;
}
```

**Responsibilities**:
- Show/hide dropdown on focus/blur (with delay to allow click registration)
- Intercept ArrowUp/ArrowDown/Enter for keyboard navigation when dropdown is open
- Pass `activeIndex` to dropdown for highlight state
- Call `onSuggestionSelect` when an item is chosen (keyboard or click)
- Close dropdown after selection or on Escape
- Auto-expand textarea height to fit content, capped at ~10 lines (~272px)
- Show vertical scrollbar only when content exceeds the max height threshold (overflow-y toggled from hidden to auto dynamically)

## Data Models

### Suggestion Configuration

```typescript
interface SuggestionItem {
  id: string;
  label: string;
  subtitle?: string;
}

type SuggestionIconType = 'search' | 'sparkle' | 'filter-sparkle';

interface SuggestionSection {
  id: string;
  title: string;
  icon: SuggestionIconType;
  items: SuggestionItem[];
}
```

**Validation Rules**:
- `id` must be unique within the section
- `label` must be a non-empty string
- `sections` array must have at least one section
- Each section must have at least one item

### Hardcoded Data (Phase 1)

```typescript
const LANDING_SECTIONS: SuggestionSection[] = [
  {
    id: 'search',
    title: 'Search',
    icon: 'search',
    items: [
      { id: 's1', label: 'Surfboards' },
      { id: 's2', label: 'Wetsuits' },
      { id: 's3', label: 'Kayaks' },
      { id: 's4', label: 'Snorkeling gear' },
    ],
  },
  {
    id: 'conversational',
    title: 'Conversational',
    icon: 'sparkle',
    items: [
      { id: 'c1', label: 'Build a beginner surfing kit', subtitle: 'Surfing / Budget options' },
      { id: 'c2', label: 'What should I pack for a snorkeling trip?', subtitle: 'Snorkeling / Trip planning' },
      { id: 'c3', label: 'Compare wetsuits for cold-water surfing', subtitle: 'Surfing / Comparison' },
    ],
  },
];

const SEARCH_RESULTS_SECTIONS: SuggestionSection[] = [
  {
    id: 'refinements',
    title: 'Search refinements',
    icon: 'filter-sparkle',
    items: [
      { id: 'r1', label: 'Show boards under $400' },
      { id: 'r2', label: 'Beginner-friendly only' },
      { id: 'r3', label: 'Sort by price low to high' },
    ],
  },
  ...LANDING_SECTIONS,
];
```

### Action Routing

```typescript
type SuggestionActionType = 'submit' | 'toast';

const SECTION_ACTIONS: Record<string, SuggestionActionType> = {
  search: 'submit',
  conversational: 'submit',
  refinements: 'toast',
};
```

## Sequence Diagrams

### Landing Page: User Selects a Suggestion

1. User focuses the textarea in PromptInput
2. PromptInput sets dropdown visible = true
3. SuggestionsDropdown renders with 2 sections
4. User clicks "Surfboards" in the search section
5. SuggestionsDropdown calls onSuggestionSelect with item and sectionId='search'
6. PromptInput forwards to LandingPage's handler
7. LandingPage calls ConverseController.submit({ prompt: 'Surfboards' })
8. PromptInput hides the dropdown

### Search Results Page: User Selects a Refinement (Toast)

1. User focuses the textarea in PromptInput
2. PromptInput sets dropdown visible = true
3. SuggestionsDropdown renders with 3 sections
4. User clicks "Show boards under $400" in the refinements section
5. SuggestionsDropdown calls onSuggestionSelect with item and sectionId='refinements'
6. PromptInput forwards to SearchResultsPage's handler
7. SearchResultsPage shows toast: "Not supported yet"
8. PromptInput hides the dropdown

### Keyboard Navigation

1. User focuses textarea — dropdown becomes visible, activeIndex = -1
2. User presses ArrowDown — activeIndex becomes 0 (first item highlighted)
3. User presses ArrowDown — activeIndex becomes 1
4. User presses Enter — item at activeIndex is selected
5. onSuggestionSelect fires with the selected item and its sectionId
6. Dropdown hides

## Error Handling

### Error Scenario 1: Empty Sections Array

**Condition**: `sections` prop is an empty array
**Response**: Dropdown does not render (returns null)
**Recovery**: N/A — defensive rendering

### Error Scenario 2: Blur During Click

**Condition**: User clicks a suggestion item, but blur fires before the click event registers
**Response**: Use a `mousedown` event (fires before blur) or delay dropdown hiding with `setTimeout` (~150ms) to allow click to register
**Recovery**: Dropdown closes after the selection completes

### Error Scenario 3: Keyboard Navigation Beyond Bounds

**Condition**: User presses ArrowUp on first item or ArrowDown on last item
**Response**: Wrap around (last → first, first → last) or clamp (stay in place)
**Recovery**: No crash; index stays within valid bounds

### Error Scenario 4: Loading State (Future)

**Condition**: `useSuggestions` returns `isLoading: true` while awaiting backend response
**Response**: Dropdown shows a subtle loading indicator (e.g., skeleton items or a spinner) instead of sections
**Recovery**: Sections render normally once data arrives

## Testing Strategy

### Unit Testing Approach

- Test `SuggestionsDropdown` renders correct number of sections and items
- Test click on item calls `onSelect` with correct `item` and `sectionId`
- Test dropdown does not render when `visible` is false
- Test `PromptInput` shows dropdown on focus and hides on blur
- Test keyboard ArrowDown/ArrowUp changes active index
- Test Enter key selects the active item
- Test Escape key closes the dropdown
- Test action routing: search/conversational items call submit, refinement items trigger toast
- Test `useSuggestions` returns correct sections for each context ('landing' vs 'search-results')

### Property-Based Testing Approach

**Property Test Library**: fast-check (via vitest)

Property-based tests will validate the keyboard navigation logic and the action routing guarantees across all possible section configurations.

### Integration Testing Approach

- Landing page integration: focus input → dropdown appears → click suggestion → submission fires
- Search results page integration: focus input → three-section dropdown → refinement click → toast shows
- Verify dropdown closes after any selection

## Accessibility Considerations

- Dropdown uses `role="listbox"` with items having `role="option"`
- Active item indicated via `aria-activedescendant` on the input
- Section headers use `role="group"` with `aria-labelledby`
- Escape closes the dropdown and returns focus to the input
- All icons have `aria-hidden="true"` (decorative)
- Focus trap: keyboard navigation within dropdown does not move DOM focus away from the textarea

## Performance Considerations

- Dropdown renders only when `visible` is true (no hidden DOM)
- Item list is small and hardcoded — no virtualization needed
- Event listeners (keydown) attached only while dropdown is open
- `mousedown` used instead of `click` for reliable blur handling
- Future: `useSuggestions` hook will debounce backend requests based on `inputValue` changes

## Dependencies

- React (existing)
- CSS Modules (existing project pattern)
- No new external dependencies
