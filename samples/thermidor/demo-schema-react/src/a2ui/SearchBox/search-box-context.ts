import {createContext, useContext} from 'react';
import type {SuggestionSection} from '../../components/SuggestionsDropdown/index.js';

/** What the page decides about the session shell's search box: submitting stays the page's. */
export interface SearchBoxOptions {
  onSubmit: (prompt: string) => void;
  /** Blocks submitting while a request locks the page. Typing and completions stay available. */
  busy: boolean;
  placeholder?: string;
  clearOnSubmit?: boolean;
  /** Where the completions open, relative to the input. Defaults to below. */
  suggestionsPlacement?: 'below' | 'above';
}

export const SearchBoxOptionsContext = createContext<SearchBoxOptions | null>(null);

export function useSearchBoxOptions(): SearchBoxOptions {
  const options = useContext(SearchBoxOptionsContext);
  if (!options) {
    throw new Error('useSearchBoxOptions must be used within a SearchBoxOptionsContext provider');
  }
  return options;
}

/** What the `SearchBox` renderer gives its children. */
export interface SearchBoxQuery {
  /** What the input holds, as the shopper typed it. */
  query: string;
  /** Whether the input was submitted since the last keystroke. */
  submitted: boolean;
  /** Shows these suggestions in the search box's dropdown. */
  showSuggestions: (sections: SuggestionSection[]) => void;
}

export const SearchBoxQueryContext = createContext<SearchBoxQuery | null>(null);

export function useSearchBoxQuery(): SearchBoxQuery {
  const searchBox = useContext(SearchBoxQueryContext);
  if (!searchBox) {
    throw new Error('useSearchBoxQuery must be used within a SearchBox');
  }
  return searchBox;
}
