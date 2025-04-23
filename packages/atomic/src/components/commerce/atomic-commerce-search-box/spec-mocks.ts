import {
  SearchBox,
  SearchBoxState,
  StandaloneSearchBox,
  StandaloneSearchBoxState,
} from '@coveo/headless/commerce';
import {vi} from 'vitest';
import {SuggestionManager} from '../../common/suggestions/suggestion-manager';

interface Mocks {
  searchBoxState: SearchBoxState | StandaloneSearchBoxState;
  suggestionManager: SuggestionManager<SearchBox>;
  searchBox:
    | Omit<SearchBox, 'state'>
    | Omit<StandaloneSearchBox, 'state'>
    | undefined;
}

const mocks: Mocks = {
  searchBoxState: {
    value: 'query',
    isLoading: false,
    suggestions: [],
    isLoadingSuggestions: false,
    searchBoxId: 'default-search-box-id',
  },
  searchBox: {
    updateRedirectUrl: vi.fn(),
    afterRedirection: vi.fn(),
    updateText: vi.fn(),
    submit: vi.fn(),
    clear: vi.fn(),
    showSuggestions: vi.fn(),
    selectSuggestion: vi.fn(),
    subscribe: vi.fn(),
  },
  suggestionManager: {
    hasSuggestions: true,
    suggestions: [],
    leftSuggestionElements: [],
    rightSuggestionElements: [],
    allSuggestionElements: [],
    leftPanel: undefined,
    rightPanel: undefined,
    initializeSuggestions: vi.fn(),
    clearSuggestions: vi.fn(),
    forceUpdate: vi.fn(),
    triggerSuggestions: vi.fn(),
  } as unknown as SuggestionManager<SearchBox>,
};

export default mocks;
