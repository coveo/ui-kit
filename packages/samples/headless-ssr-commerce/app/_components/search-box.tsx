import {
  SearchBoxState,
  SearchBox as SearchBoxController,
  RecentQueriesList as RecentQueriesListController,
  RecentQueriesState,
} from '@coveo/headless/ssr-commerce';
import {useEffect, useState, FunctionComponent} from 'react';
import {RecentQueries} from './recent-queries';

interface SearchBoxProps {
  staticState: SearchBoxState;
  controller?: SearchBoxController;
  staticStateRecentQueries: RecentQueriesState;
  recentQueriesController?: RecentQueriesListController;
}

export const SearchBox: FunctionComponent<SearchBoxProps> = ({
  staticState,
  controller,
  staticStateRecentQueries,
  recentQueriesController,
}) => {
  const [state, setState] = useState(staticState);

  useEffect(
    () => controller?.subscribe(() => setState({...controller.state})),
    [controller]
  );

  return (
    <div>
      <input
        value={state.value}
        onChange={(e) => controller?.updateText(e.target.value)}
      ></input>
      {state.value !== '' && (
        <span>
          <button onClick={controller?.clear}>X</button>
        </span>
      )}
      <button onClick={controller?.submit}>Search</button>
      {state.suggestions.length > 0 && (
        <ul>
          {state.suggestions.map((suggestion, index) => (
            <li key={index}>
              <button
                onClick={() =>
                  controller?.selectSuggestion(suggestion.rawValue)
                }
                dangerouslySetInnerHTML={{__html: suggestion.highlightedValue}}
              ></button>
            </li>
          ))}
        </ul>
      )}
      {staticStateRecentQueries.queries.length > 0 && (
        <RecentQueries
          staticState={staticStateRecentQueries}
          controller={recentQueriesController}
        ></RecentQueries>
      )}
    </div>
  );
};
