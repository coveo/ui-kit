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
      // This handles query pipeline redirect triggers.
      window.location.replace(state.redirectTo);
    }
  }, [state.redirectTo, state.value, router, methods]);

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
      ></input>
      {state.value !== '' && (
        <span>
          <button type="button" onClick={methods?.clear}>
            X
          </button>
        </span>
      )}
      <button type="button" onClick={() => methods?.submit()}>
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
