import {
  SearchBoxState,
  SearchBox as SearchBoxController,
  RecentQueriesList as RecentQueriesListController,
  RecentQueriesState,
  InstantProductsState,
  InstantProducts as InstantProductsController,
} from '@coveo/headless/ssr-commerce';
import {useEffect, useState, FunctionComponent} from 'react';
import {InstantProducts} from './instant-product';
import {RecentQueries} from './recent-queries';

interface SearchBoxProps {
  staticState: SearchBoxState;
  controller?: SearchBoxController;
  staticStateRecentQueries: RecentQueriesState;
  recentQueriesController?: RecentQueriesListController;
  staticStateInstantProducts: InstantProductsState;
  instantProductsController?: InstantProductsController;
}

export const SearchBox: FunctionComponent<SearchBoxProps> = ({
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
      <button onClick={controller?.submit}>Search</button>
      {state.suggestions.length > 0 && (
        <>
          <ul>
            {state.suggestions.map((suggestion, index) => (
              <li key={index}>
                <button
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
      {staticStateRecentQueries.queries.length > 0 && (
        <RecentQueries
          staticState={staticStateRecentQueries}
          controller={recentQueriesController}
        />
      )}
    </div>
  );
};
