'use client';

import {useState} from 'react';
import {useInitializeRecentQueries} from '@/hooks/use-recent-queries';
import {
  useInstantProducts,
  useRecentQueriesList,
  useSearchBox,
} from '@/lib/commerce-engine';
import InstantProducts from './instant-product';
import RecentQueries from './recent-queries';

export default function SearchBox() {
  const {state, methods} = useSearchBox();
  const {state: recentQueriesState, methods: recentQueriesController} =
    useRecentQueriesList();
  const {state: instantProductsState, methods: instantProductsController} =
    useInstantProducts();

  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isSelectingSuggestion, setIsSelectingSuggestion] = useState(false);

  // Sync recent queries from localStorage when the component loads.
  useInitializeRecentQueries(recentQueriesController?.updateRecentQueries);

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      methods?.submit();
    }
  };

  const showDropdown =
    isInputFocused &&
    (recentQueriesState.queries.length > 0 ||
      state.suggestions.length > 0 ||
      instantProductsState.products.length > 0);

  return (
    <div className="SearchBox">
      <input
        className="SearchBoxInput"
        type="search"
        aria-label="Search"
        placeholder="Search"
        value={state.value}
        onChange={onSearchBoxInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
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
      <button
        type="button"
        className="SearchBoxSubmit"
        onClick={methods?.submit}
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
