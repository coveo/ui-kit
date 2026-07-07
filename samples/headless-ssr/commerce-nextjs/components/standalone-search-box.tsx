'use client';

import {useRouter} from 'next/navigation';
import {useEffect} from 'react';
import {useSearchBoxSuggestions} from '@/hooks/use-search-box-suggestions';
import {
  useInstantProducts,
  useRecentQueriesList,
  useStandaloneSearchBox,
} from '@/lib/commerce-engine';
import InstantProducts from './instant-product';
import RecentQueries from './recent-queries';

const SUGGESTIONS_ID = 'standalone-search-box-suggestions';
const optionId = (index: number) => `standalone-search-box-suggestion-${index}`;

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
          aria-controls={SUGGESTIONS_ID}
          aria-activedescendant={
            nav.activeIndex >= 0 ? optionId(nav.activeIndex) : undefined
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
        <div className="SearchBoxDropdown">
          {recentQueriesState.queries.length > 0 && <RecentQueries />}
          {state.suggestions.length > 0 && (
            <>
              <h4>Suggestions</h4>
              <ul className="Suggestions" id={SUGGESTIONS_ID} role="listbox">
                {state.suggestions.map((suggestion, index) => (
                  <li key={suggestion.rawValue} role="presentation">
                    <button
                      type="button"
                      id={optionId(index)}
                      role="option"
                      aria-selected={index === nav.activeIndex}
                      data-suggestion-index={index}
                      className={
                        index === nav.activeIndex ? 'active' : undefined
                      }
                      onMouseEnter={() => nav.highlight(index)}
                      onClick={() => {
                        methods?.selectSuggestion(suggestion.rawValue);
                        nav.close();
                      }}
                      dangerouslySetInnerHTML={{
                        __html: suggestion.highlightedValue,
                      }}
                    />
                  </li>
                ))}
              </ul>
            </>
          )}
          {instantProductsState.products.length > 0 && (
            <>
              <h4>Instant products</h4>
              <InstantProducts />
            </>
          )}
        </div>
      )}
    </div>
  );
}
