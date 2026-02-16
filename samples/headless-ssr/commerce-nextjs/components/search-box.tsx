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

  // Sync recent queries from localStorage when the component loads
  useInitializeRecentQueries(recentQueriesController?.updateRecentQueries);

  const onSearchBoxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSelectingSuggestion(true);
    methods?.updateText(e.target.value);
    instantProductsController?.updateQuery(e.target.value);
  };

  const handleFocus = () => {
    setIsInputFocused(true);
  };

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

  return (
    <div>
      <input
        type="search"
        aria-label="searchbox"
        placeholder="search"
        value={state.value}
        onChange={(e) => onSearchBoxInputChange(e)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      ></input>
      {state.value !== '' && (
        <span>
          <button type="button" onClick={methods?.clear}>
            X
          </button>
        </span>
      )}
      <button type="button" onClick={methods?.submit}>
        Search
      </button>

      {isInputFocused && (
        <>
          {recentQueriesState.queries.length > 0 && <RecentQueries />}
          {state.suggestions.length > 0 && (
            <ul>
              Suggestions :
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
                    // biome-ignore lint/security/noDangerouslySetInnerHtml: <>
                    dangerouslySetInnerHTML={{
                      __html: suggestion.highlightedValue,
                    }}
                  ></button>
                </li>
              ))}
            </ul>
          )}
          {instantProductsState.products.length > 0 && <InstantProducts />}
        </>
      )}
    </div>
  );
}
