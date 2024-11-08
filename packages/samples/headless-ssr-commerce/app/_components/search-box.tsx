'use client';

import {useState} from 'react';
import {
  useInstantProducts,
  useRecentQueriesList,
  useSearchBox,
} from '../_lib/commerce-engine';
import InstantProducts from './instant-product';
import RecentQueries from './recent-queries';

export default function SearchBox() {
  const {state, methods} = useSearchBox();
  const {state: recentQueriesState} = useRecentQueriesList();
  const {state: instantProductsState, methods: instantProductsController} =
    useInstantProducts();

  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isSelectingSuggestion, setIsSelectingSuggestion] = useState(false);

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
        value={state.value}
        onChange={(e) => onSearchBoxInputChange(e)}
        onFocus={handleFocus}
        onBlur={handleBlur}
      ></input>
      {state.value !== '' && (
        <span>
          <button onClick={methods?.clear}>X</button>
        </span>
      )}
      <button onClick={methods?.submit}>Search</button>

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
                      methods?.selectSuggestion(suggestion.rawValue)
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
