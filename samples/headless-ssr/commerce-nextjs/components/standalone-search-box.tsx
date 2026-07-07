'use client';

import {useRouter} from 'next/navigation';
import {useEffect, useState} from 'react';
import {
  useInstantProducts,
  useRecentQueriesList,
  useStandaloneSearchBox,
} from '@/lib/commerce-engine';
import InstantProducts from './instant-product';
import RecentQueries from './recent-queries';

export default function StandaloneSearchBox() {
  const {state, methods} = useStandaloneSearchBox();
  const {state: recentQueriesState} = useRecentQueriesList();
  const {state: instantProductsState, methods: instantProductsController} =
    useInstantProducts();

  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isSelectingSuggestion, setIsSelectingSuggestion] = useState(false);

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

  const onSearchBoxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSelectingSuggestion(true);
    methods?.updateText(e.target.value);
    instantProductsController?.updateQuery(e.target.value);
  };

  const handleFocus = () => setIsInputFocused(true);

  const handleBlur = () => {
    if (!isSelectingSuggestion) {
      setIsInputFocused(false);
    }
  };

  const showDropdown =
    isInputFocused &&
    (recentQueriesState.queries.length > 0 ||
      state.suggestions.length > 0 ||
      instantProductsState.products.length > 0);

  return (
    <div className="SearchBox">
      <div className="SearchBoxField">
        <input
          className="SearchBoxInput"
          type="search"
          aria-label="Search"
          placeholder="Search"
          value={state.value}
          onChange={onSearchBoxInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        {state.value !== '' && (
          <button
            type="button"
            className="SearchBoxClear"
            aria-label="Clear"
            onClick={methods?.clear}
          >
            ✕
          </button>
        )}
      </div>
      <button
        type="button"
        className="SearchBoxSubmit"
        onClick={() => methods?.submit()}
      >
        Search
      </button>

      {showDropdown && (
        <div className="SearchBoxDropdown">
          {recentQueriesState.queries.length > 0 && <RecentQueries />}
          {state.suggestions.length > 0 && (
            <>
              <h4>Suggestions</h4>
              <ul className="Suggestions">
                {state.suggestions.map((suggestion) => (
                  <li key={suggestion.rawValue}>
                    <button
                      type="button"
                      onMouseEnter={() =>
                        instantProductsController?.updateQuery(
                          suggestion.rawValue
                        )
                      }
                      onClick={() =>
                        methods?.selectSuggestion(suggestion.rawValue)
                      }
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
