'use client';

import {useRouter} from 'next/navigation';
import {useEffect} from 'react';
import {useSearchBoxSuggestions} from '@/hooks/use-search-box-suggestions';
import {
  useInstantProducts,
  useRecentQueriesList,
  useStandaloneSearchBox,
} from '@/lib/commerce-engine';
import SearchBoxSuggestions, {
  suggestionOptionId,
  suggestionsListId,
} from './search-box-suggestions';

const ID_PREFIX = 'standalone-search-box';

export default function StandaloneSearchBox() {
  const {state, methods} = useStandaloneSearchBox();
  const {state: recentQueriesState} = useRecentQueriesList();
  const {state: instantProductsState, methods: instantProductsController} =
    useInstantProducts();

  const router = useRouter();

  useEffect(() => {
    if (state.redirectTo === '/search') {
      const url = `${state.redirectTo}?q=${encodeURIComponent(state.value)}`;
      router.push(url, {scroll: false});
      methods?.afterRedirection();
    } else if (state.redirectTo !== '') {
      // Handles query pipeline redirect triggers.
      window.location.replace(state.redirectTo);
    }
  }, [state.redirectTo, state.value, router, methods]);

  // Keyboard navigation, Enter/Escape and click-outside handling live in the
  // shared hook; this component only wires it to the Coveo controllers.
  const nav = useSearchBoxSuggestions({
    suggestions: state.suggestions,
    onSubmit: () => methods?.submit(),
    onSelect: (rawValue) => methods?.selectSuggestion(rawValue),
    onHighlight: (rawValue) => instantProductsController?.updateQuery(rawValue),
  });

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    methods?.updateText(e.target.value);
    instantProductsController?.updateQuery(e.target.value);
    nav.onInputChange();
  };

  const showDropdown =
    nav.isOpen &&
    (recentQueriesState.queries.length > 0 ||
      state.suggestions.length > 0 ||
      instantProductsState.products.length > 0);

  return (
    <div className="SearchBox" ref={nav.rootRef}>
      <div className="SearchBoxField">
        <input
          className="SearchBoxInput"
          type="search"
          aria-label="Search"
          aria-expanded={showDropdown}
          aria-controls={suggestionsListId(ID_PREFIX)}
          aria-activedescendant={
            nav.activeIndex >= 0
              ? suggestionOptionId(ID_PREFIX, nav.activeIndex)
              : undefined
          }
          aria-autocomplete="list"
          placeholder="Search"
          value={state.value}
          onChange={onInputChange}
          onFocus={nav.open}
          onKeyDown={nav.onKeyDown}
        />
        {state.value !== '' && (
          <button
            type="button"
            className="SearchBoxClear"
            aria-label="Clear"
            onClick={() => {
              methods?.clear();
              nav.close();
            }}
          >
            ✕
          </button>
        )}
      </div>
      <button
        type="button"
        className="SearchBoxSubmit"
        onClick={() => {
          methods?.submit();
          nav.close();
        }}
      >
        Search
      </button>

      {showDropdown && (
        <SearchBoxSuggestions
          idPrefix={ID_PREFIX}
          suggestions={state.suggestions}
          activeIndex={nav.activeIndex}
          showRecentQueries={recentQueriesState.queries.length > 0}
          showInstantProducts={instantProductsState.products.length > 0}
          onHighlightSuggestion={nav.highlight}
          onSelectSuggestion={(rawValue) => {
            methods?.selectSuggestion(rawValue);
            nav.close();
          }}
        />
      )}
    </div>
  );
}
