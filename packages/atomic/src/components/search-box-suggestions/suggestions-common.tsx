import {
  buildRecentQueriesList,
  loadQuerySuggestActions,
  SearchBox,
  SearchEngine,
} from '@coveo/headless';
import {QuerySuggestionSection} from '@coveo/headless/dist/definitions/state/state-sections';
import {VNode, h} from '@stencil/core';
import {Bindings} from '../../utils/initialization-utils';

export interface SearchBoxSuggestionElement {
  value: string;
  onClick(): void;
  content: VNode;
}

export interface SearchBoxSuggestions {
  onInput(): Promise<unknown> | void;
  renderItems(): SearchBoxSuggestionElement[];
}

export interface SearchBoxSuggestionsBindings extends Bindings {
  id: string;
  searchBoxController: SearchBox;
}

// TODO: move into atomic-search-box-query-suggestions
export const querySuggestions: (
  bindings: SearchBoxSuggestionsBindings
) => SearchBoxSuggestions = ({engine, id, searchBoxController}) => {
  const {registerQuerySuggest, fetchQuerySuggestions} =
    loadQuerySuggestActions(engine);

  (engine as SearchEngine<QuerySuggestionSection>).dispatch(
    registerQuerySuggest({
      id,
    })
  );

  return {
    onInput: () =>
      (engine as SearchEngine<QuerySuggestionSection>).dispatch(
        fetchQuerySuggestions({
          id,
        })
      ),
    renderItems: () =>
      // TODO: limit
      searchBoxController.state.suggestions.map((suggestion) => ({
        content: <span innerHTML={suggestion.highlightedValue}></span>,
        value: suggestion.rawValue,
        onClick: () =>
          searchBoxController.selectSuggestion(suggestion.rawValue),
      })),
  };
};

// TODO: move into atomic-search-box-recent-queries
export const recentQueries: (
  bindings: SearchBoxSuggestionsBindings
) => SearchBoxSuggestions = ({engine}) => {
  const recentQueriesList = buildRecentQueriesList(engine, {
    initialState: {queries: ['hello', 'hola', 'bonjour', 'buongiorno']},
  });

  return {
    onInput: () => {},
    renderItems: () =>
      // TODO: filter, highlight, limit
      recentQueriesList.state.queries.map((value, i) => ({
        value,
        content: <span>{value}</span>,
        onClick: () => recentQueriesList.executeRecentQuery(i),
      })),
  };
};
