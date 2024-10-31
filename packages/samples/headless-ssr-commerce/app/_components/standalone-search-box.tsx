'use client';

import {useRouter} from 'next/navigation';
import {useEffect, useState} from 'react';
import {
  useInstantProducts,
  useRecentQueriesList,
  useStandaloneSearchBox,
} from '../_lib/commerce-engine';
import InstantProducts from './instant-product';
import RecentQueries from './recent-queries';

export default function StandaloneSearchBox() {
  const {state, controller} = useStandaloneSearchBox();
  const {state: recentQueriesState} = useRecentQueriesList();
  const {state: instantProductsState, controller: instantProductsController} =
    useInstantProducts();

  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isSelectingSuggestion, setIsSelectingSuggestion] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (state.redirectTo === '/search') {
      const url = `${state.redirectTo}#q=${encodeURIComponent(state.value)}`;
      router.push(url, {scroll: false});
      controller?.afterRedirection();
    }
  }, [state.redirectTo, state.value, router, controller]);

  const onSearchBoxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSelectingSuggestion(true);
    controller?.updateText(e.target.value);
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
        value={state.value}
        onChange={(e) => onSearchBoxInputChange(e)}
        onFocus={handleFocus}
        onBlur={handleBlur}
      ></input>
      {state.value !== '' && (
        <span>
          <button onClick={controller?.clear}>X</button>
        </span>
      )}
      <button onClick={() => controller?.submit()}>Search</button>

      {isInputFocused && (
        <>
          {recentQueriesState.queries.length > 0 && <RecentQueries />}
          {state.suggestions.length > 0 && (
            <ul>
              Suggestions :
              {state.suggestions.map((suggestion, index) => (
                <li key={index}>
                  <button
                    onMouseEnter={() =>
                      instantProductsController?.updateQuery(
                        suggestion.rawValue
                      )
                    }
                    onClick={() =>
                      controller?.selectSuggestion(suggestion.rawValue)
                    }
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
