import {
  defaultSearchBoxOptions,
  SearchBoxOptions,
  searchBoxOptionsSchema,
} from './headless-core-search-box-options';
import {
  SuggestionHighlightingOptions,
  Delimiters,
  getHighlightedSuggestion,
} from '../../../utils/highlight';
import {
  buildController,
  Controller,
} from '../../controller/headless-controller';
import {CoreEngine} from '../../..';
import {
  ConfigurationSection,
  QuerySection,
  QuerySetSection,
  QuerySuggestionSection,
  SearchSection,
} from '../../../state/state-sections';
import {
  configuration,
  query,
  querySet,
  querySuggest,
  search,
} from '../../../app/reducers';
import {loadReducerError} from '../../../utils/errors';
import {randomID} from '../../../utils/utils';
import {validateOptions} from '../../../utils/validate-payload';
import {
  registerQuerySetQuery,
  updateQuerySetQuery,
} from '../../../features/query-set/query-set-actions';
import {
  clearQuerySuggest,
  FetchQuerySuggestionsActionCreatorPayload,
  registerQuerySuggest,
  selectQuerySuggestion,
} from '../../../features/query-suggest/query-suggest-actions';
import {SearchAction} from '../../../features/analytics/analytics-utils';
import {prepareForSearchWithQuery} from '../../../features/search/search-actions';
import {logQuerySuggestionClick} from '../../../features/query-suggest/query-suggest-analytics-actions';
import {logSearchboxSubmit} from '../../../features/query/query-analytics-actions';
import {QuerySuggestState} from '../../../features/query-suggest/query-suggest-state';
import {AsyncThunkAction} from '@reduxjs/toolkit';

export type {SearchBoxOptions, SuggestionHighlightingOptions, Delimiters};

export interface SearchBoxProps {
  /**
   * The `SearchBox` controller options.
   */
  options?: SearchBoxOptions;

  /**
   * The action creator for the `executeSearch` thunk action.
   */
  executeSearchActionCreator: (
    arg: SearchAction
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) => AsyncThunkAction<any, SearchAction, any>;

  /**
   * The action creator for the `fetchQuerySuggestions` thunk action.
   */
  fetchQuerySuggestionsActionCreator: (
    arg: FetchQuerySuggestionsActionCreatorPayload
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) => AsyncThunkAction<any, FetchQuerySuggestionsActionCreatorPayload, any>;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `SearchBox` controller.
 */
export interface SearchBoxState {
  /**
   * The current query in the search box.
   */
  value: string;

  /**
   * The query suggestions for the search box query.
   */
  suggestions: Suggestion[];

  /**
   * Determines if a search is in progress.
   */
  isLoading: boolean;

  /**
   * Determines if a query suggest request is in progress.
   */
  isLoadingSuggestions: boolean;
}

export interface Suggestion {
  /**
   * The suggestion after applying any `highlightOptions`.
   */
  highlightedValue: string;

  /**
   * The suggestion text.
   */
  rawValue: string;
}

/**
 * The `SearchBox` headless controller offers a high-level interface for designing a common search box UI controller
 * with [highlighting for query suggestions](https://docs.coveo.com/en/headless/latest/usage/highlighting/).
 */
export interface SearchBox extends Controller {
  /**
   * Updates the search box text value and shows the suggestions for that value.
   *
   * @param value - The string value to update the search box with.
   */
  updateText(value: string): void;

  /**
   * Clears the search box text and the suggestions.
   */
  clear(): void;

  /**
   * Shows the suggestions for the current search box value.
   */
  showSuggestions(): void;

  /**
   * Selects a suggestion and calls `submit`.
   *
   * @param value - The string value of the suggestion to select
   */
  selectSuggestion(value: string): void;

  /**
   * Deselects all facets and triggers a search query.
   */
  submit(): void;

  /**
   * The state of the `SearchBox` controller.
   */
  state: SearchBoxState;
}

/**
 * Creates a `SearchBox` controller instance.
 *
 * @param engine - The headless engine instance.
 * @returns A `SearchBox` controller instance.
 */
export function buildCoreSearchBox(
  engine: CoreEngine,
  props: SearchBoxProps
): SearchBox {
  if (!loadSearchBoxReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;
  const getState = () => engine.state;

  const id = props.options?.id || randomID('search_box');
  const options: Required<SearchBoxOptions> = {
    id,
    highlightOptions: {...props.options?.highlightOptions},
    ...defaultSearchBoxOptions,
    ...props.options,
  };

  validateOptions(engine, searchBoxOptionsSchema, options, 'buildSearchBox');
  dispatch(registerQuerySetQuery({id, query: engine.state.query.q}));
  if (options.numberOfSuggestions) {
    dispatch(
      registerQuerySuggest({
        id,
        q: engine.state.query.q,
        count: options.numberOfSuggestions,
      })
    );
  }

  const getValue = () => engine.state.querySet[options.id];

  const performSearch = async (analytics: SearchAction) => {
    const {enableQuerySyntax, clearFilters} = options;

    dispatch(
      prepareForSearchWithQuery({
        q: getValue(),
        enableQuerySyntax,
        clearFilters,
      })
    );

    await dispatch(props.executeSearchActionCreator(analytics));
  };

  return {
    ...controller,

    updateText(value: string) {
      dispatch(updateQuerySetQuery({id, query: value}));
      this.showSuggestions();
    },

    clear() {
      dispatch(updateQuerySetQuery({id, query: ''}));
      dispatch(clearQuerySuggest({id}));
    },

    showSuggestions() {
      if (options.numberOfSuggestions) {
        dispatch(props.fetchQuerySuggestionsActionCreator({id}));
      }
    },

    selectSuggestion(value: string) {
      dispatch(selectQuerySuggestion({id, expression: value}));
      performSearch(logQuerySuggestionClick({id, suggestion: value})).then(
        () => {
          dispatch(clearQuerySuggest({id}));
        }
      );
    },

    submit() {
      performSearch(logSearchboxSubmit());
      dispatch(clearQuerySuggest({id}));
    },

    get state() {
      const state = getState();
      const querySuggest = state.querySuggest[options.id];
      const suggestions = getSuggestions(
        querySuggest,
        options.highlightOptions
      );
      const isLoadingSuggestions = querySuggest
        ? querySuggest.isLoading
        : false;

      return {
        value: getValue(),
        suggestions,
        isLoading: state.search.isLoading,
        isLoadingSuggestions,
      };
    },
  };
}

function getSuggestions(
  state: QuerySuggestState | undefined,
  highlightOptions: SuggestionHighlightingOptions
) {
  if (!state) {
    return [];
  }

  return state.completions.map((completion) => ({
    highlightedValue: getHighlightedSuggestion(
      completion.highlighted,
      highlightOptions
    ),
    rawValue: completion.expression,
  }));
}

function loadSearchBoxReducers(
  engine: CoreEngine
): engine is CoreEngine<
  QuerySection &
    QuerySuggestionSection &
    ConfigurationSection &
    QuerySetSection &
    SearchSection
> {
  engine.addReducers({query, querySuggest, configuration, querySet, search});
  return true;
}
