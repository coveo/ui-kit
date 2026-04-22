import {useCallback, useEffect, useRef, useState} from 'react';
import type {Search, SearchBox, SearchState} from '@coveo/headless/commerce';

export interface CommerceSearchHookState {
  products: SearchState['products'];
  results: SearchState['results'];
  isLoading: boolean;
  error: SearchState['error'];
  responseId: string;
}

export function useCommerceSearch(search: Search, searchBox: SearchBox) {
  const [state, setState] = useState<CommerceSearchHookState>(() => ({
    products: search.state.products,
    results: search.state.results,
    isLoading: search.state.isLoading,
    error: search.state.error,
    responseId: search.state.responseId,
  }));

  const searchBoxRef = useRef(searchBox);
  searchBoxRef.current = searchBox;

  useEffect(() => {
    const unsubscribe = search.subscribe(() => {
      const s = search.state;
      setState({
        products: s.products,
        results: s.results,
        isLoading: s.isLoading,
        error: s.error,
        responseId: s.responseId,
      });
    });
    return unsubscribe;
  }, [search]);

  const submitSearch = useCallback((query: string) => {
    searchBoxRef.current.updateText(query);
    searchBoxRef.current.submit();
  }, []);

  return {state, submitSearch};
}
