import {
  StandaloneSearchBoxState,
  StandaloneSearchBox as StandaloneSearchBoxController,
  RecentQueriesState,
  InstantProductsState,
  RecentQueriesList as RecentQueriesListController,
  InstantProducts as InstantProductsController,
} from '@coveo/headless/ssr-commerce';
import {useRouter} from 'next/navigation';
import {useEffect, useState} from 'react';
import InstantProducts from './instant-product';
import RecentQueries from './recent-queries';

interface StandaloneSearchBoxProps {
  staticState: StandaloneSearchBoxState;
  controller?: StandaloneSearchBoxController;
  staticStateRecentQueries: RecentQueriesState;
  recentQueriesController?: RecentQueriesListController;
  staticStateInstantProducts: InstantProductsState;
  instantProductsController?: InstantProductsController;
}

export default function StandaloneSearchBox({
  staticState,
  controller,
  staticStateRecentQueries,
  recentQueriesController,
  staticStateInstantProducts,
  instantProductsController,
}: StandaloneSearchBoxProps) {
  const [state, setState] = useState(staticState);
  const [recentQueriesState, setRecentQueriesState] = useState(
    staticStateRecentQueries
  );
  const [instantProductsState, setInstantProductsState] = useState(
    staticStateInstantProducts
  );
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isSelectingSuggestion, setIsSelectingSuggestion] = useState(false);

  useEffect(() => {
    controller?.subscribe(() => setState({...controller.state}));
    recentQueriesController?.subscribe(() =>
      setRecentQueriesState({...recentQueriesController.state})
    );
    instantProductsController?.subscribe(() =>
      setInstantProductsState({...instantProductsController.state})
    );
  }, [controller, instantProductsController, recentQueriesController]);
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
          {recentQueriesState.queries.length > 0 && (
            <RecentQueries
              staticState={staticStateRecentQueries}
              controller={recentQueriesController}
              instantProductsController={instantProductsController}
            />
          )}
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
          {instantProductsState.products.length > 0 && (
            <InstantProducts
              staticState={staticStateInstantProducts}
              controller={instantProductsController}
            />
          )}
        </>
      )}
    </div>
  );
}
