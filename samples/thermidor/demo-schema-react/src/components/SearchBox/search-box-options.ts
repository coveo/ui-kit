import {createContext, useContext} from 'react';

/** What the page decides about its search box: submitting a prompt stays application logic. */
export interface SearchBoxOptions {
  onSubmit: (prompt: string) => void;
  isStreaming: boolean;
  placeholder?: string;
  clearOnSubmit?: boolean;
}

export const SearchBoxOptionsContext = createContext<SearchBoxOptions | null>(null);

export function useSearchBoxOptions(): SearchBoxOptions {
  const options = useContext(SearchBoxOptionsContext);
  if (!options) {
    throw new Error('useSearchBoxOptions must be used within a SearchBox');
  }
  return options;
}
