import {
  StandaloneSearchBoxState,
  StandaloneSearchBox as StandaloneSearchBoxController,
  RecentQueriesState,
  InstantProductsState,
  RecentQueriesList as RecentQueriesListController,
  InstantProducts as InstantProductsController,
} from '@coveo/headless/ssr-commerce';
import {useRouter} from 'next/navigation';
import {useEffect, useState, FunctionComponent} from 'react';
import {InstantProducts} from './instant-product';
import {RecentQueries} from './recent-queries';

interface StandaloneSearchBoxProps {
  staticState: StandaloneSearchBoxState;
  controller?: StandaloneSearchBoxController;
  staticStateRecentQueries: RecentQueriesState;
  recentQueriesController?: RecentQueriesListController;
  staticStateInstantProducts: InstantProductsState;
  instantProductsController?: InstantProductsController;
}

export const StandaloneSearchBox: FunctionComponent<
  StandaloneSearchBoxProps
> = ({
  staticState,
  controller,
  staticStateRecentQueries,
  recentQueriesController,
  staticStateInstantProducts,
  instantProductsController,
}) => {
  const [state, setState] = useState(staticState);

  useEffect(
    () => controller?.subscribe(() => setState({...controller.state})),
    [controller]
  );
  const router = useRouter();

  useEffect(() => {
    if (state.redirectTo === '/search') {
      const url = `${state.redirectTo}#q=${encodeURIComponent(state.value)}`;
      router.push(url, {scroll: false});
      controller?.afterRedirection();
    }
  }, [state.redirectTo, state.value, router, controller]);

  const onSearchBoxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    controller?.updateText(e.target.value);
    instantProductsController?.updateQuery(e.target.value);
  };

  return (
    <div>
      <input
        value={state.value}
        onChange={(e) => onSearchBoxInputChange(e)}
      ></input>
      {state.value !== '' && (
        <span>
          <button onClick={controller?.clear}>X</button>
        </span>
      )}
      <button onClick={() => controller?.submit()}>Search</button>
      {staticStateRecentQueries.queries.length > 0 && (
        <RecentQueries
          staticState={staticStateRecentQueries}
          controller={recentQueriesController}
          instantProductsController={instantProductsController}
        />
      )}
      {state.suggestions.length > 0 && (
        <>
          <ul>
            {state.suggestions.map((suggestion, index) => (
              <li key={index}>
                <button
                  onMouseEnter={() =>
                    controller?.updateText(suggestion.rawValue)
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
          <InstantProducts
            staticState={staticStateInstantProducts}
            controller={instantProductsController}
          />
        </>
      )}
    </div>
  );
};
