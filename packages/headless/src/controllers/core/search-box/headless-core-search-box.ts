import type {AsyncThunkAction} from '@reduxjs/toolkit';
import {configuration} from '../../../app/common-reducers.js';
import type {CoreEngine} from '../../../app/engine.js';
import type {
  InsightAction,
  LegacySearchAction,
} from '../../../features/analytics/analytics-utils.js';
import {logSearchboxSubmit} from '../../../features/query/query-analytics-actions.js';
import {queryReducer as query} from '../../../features/query/query-slice.js';
import {
  registerQuerySetQuery,
  updateQuerySetQuery,
} from '../../../features/query-set/query-set-actions.js';
import {querySetReducer as querySet} from '../../../features/query-set/query-set-slice.js';
import {
  clearQuerySuggest,
  type FetchQuerySuggestionsActionCreatorPayload,
  registerQuerySuggest,
  selectQuerySuggestion,
} from '../../../features/query-suggest/query-suggest-actions.js';
import {
  logQuerySuggestionClick,
  omniboxAnalytics,
} from '../../../features/query-suggest/query-suggest-analytics-actions.js';
import {querySuggestReducer as querySuggest} from '../../../features/query-suggest/query-suggest-slice.js';
import type {QuerySuggestState} from '../../../features/query-suggest/query-suggest-state.js';
import {
  prepareForSearchWithQuery,
  type SearchAction,
  type TransitiveSearchAction,
} from '../../../features/search/search-actions.js';
import {searchReducer as search} from '../../../features/search/search-slice.js';
import type {
  ConfigurationSection,
  QuerySection,
  QuerySetSection,
  QuerySuggestionSection,
  SearchSection,
} from '../../../state/state-sections.js';
import {loadReducerError} from '../../../utils/errors.js';
import {
  type Delimiters,
  getHighlightedSuggestion,
  type SuggestionHighlightingOptions,
} from '../../../utils/highlight.js';
import {randomID} from '../../../utils/utils.js';
import {validateOptions} from '../../../utils/validate-payload.js';
import {
  buildController,
  type Controller,
} from '../../controller/headless-controller.js';
import {
  defaultSearchBoxOptions,
  type SearchBoxOptions,
  searchBoxOptionsSchema,
} from './headless-core-search-box-options.js';

export type {SearchBoxOptions, SuggestionHighlightingOptions, Delimiters};

export type SearchBoxProps = SearchBoxPropsBase &
  (NextSearchBoxProps | LegacySearchBoxProps);

interface NextSearchBoxProps {
  /**
   * The action creator for the `executeSearch` thunk action.
   */
  executeSearchActionCreator: (
    arg: TransitiveSearchAction
    // biome-ignore lint/suspicious/noExplicitAny: third-party API requires 'any'
  ) => AsyncThunkAction<any, TransitiveSearchAction, any>;

  isNextAnalyticsReady: true;
}

interface LegacySearchBoxProps {
  /**
   * The action creator for the `executeSearch` thunk action.
   */
  executeSearchActionCreator: (
    arg: LegacySearchAction
    // biome-ignore lint/suspicious/noExplicitAny: third-party API requires 'any'
  ) => AsyncThunkAction<any, LegacySearchAction, any>;

  isNextAnalyticsReady: false;
}

interface SearchBoxPropsBase {
  /**
   * The `SearchBox` controller options.
   */
  options?: SearchBoxOptions;

  /**
   * The action creator for the `executeSearch` thunk action.
   */
  executeSearchActionCreator:
    | ((
        arg: TransitiveSearchAction
        // biome-ignore lint/suspicious/noExplicitAny: third-party API requires 'any'
      ) => AsyncThunkAction<any, TransitiveSearchAction, any>)
    | ((
        arg: LegacySearchAction
        // biome-ignore lint/suspicious/noExplicitAny: third-party API requires 'any'
      ) => AsyncThunkAction<any, LegacySearchAction, any>);

  /**
   * The action creator for the `fetchQuerySuggestions` thunk action.
   */
  fetchQuerySuggestionsActionCreator: (
    arg: FetchQuerySuggestionsActionCreatorPayload
    // biome-ignore lint/suspicious/noExplicitAny: third-party API requires 'any'
  ) => AsyncThunkAction<any, FetchQuerySuggestionsActionCreatorPayload, any>;
  //Indicate if the executeSearchActionCreator can use the new analytics logic.
  isNextAnalyticsReady: boolean;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `SearchBox` controller.
 *
 * @group Controllers
 * @category SearchBox
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

  /**
   * The search box ID.
   */
  searchBoxId: string;
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
 * @internal
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
   *
   * @param legacyAnalytics -  The legacy analytics action to log after submitting a query.
   * @param nextAnalytics - The next analytics action to log after submitting a query.
   */
  submit(
    legacyAnalytics?: LegacySearchAction,
    nextAnalytics?: SearchAction
  ): void;

  /**
   * The state of the `SearchBox` controller.
   */
  state: SearchBoxState;
}

/**
 * @internal
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
        count: options.numberOfSuggestions,
      })
    );
  }

  const getValue = () => engine.state.querySet[options.id];

  const performSearch = async (analytics: TransitiveSearchAction) => {
    const {enableQuerySyntax, clearFilters} = options;

    dispatch(
      prepareForSearchWithQuery({
        q: getValue(),
        enableQuerySyntax,
        clearFilters,
      })
    );
    if (props.isNextAnalyticsReady) {
      dispatch(props.executeSearchActionCreator(analytics));
    } else {
      dispatch(props.executeSearchActionCreator(analytics.legacy));
    }
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
      performSearch({
        legacy: logQuerySuggestionClick({id, suggestion: value}),
        next: omniboxAnalytics(),
      }).then(() => {
        dispatch(clearQuerySuggest({id}));
      });
    },

    submit(
      legacyAnalytics:
        | LegacySearchAction
        | InsightAction = logSearchboxSubmit(),
      nextAnalytics: SearchAction
    ) {
      performSearch({legacy: legacyAnalytics, next: nextAnalytics});
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
        searchBoxId: id,
        value: getValue(),
        suggestions,
        isLoading: state.search.isLoading,
        isLoadingSuggestions,
      };
    },
  };
}

export function getSuggestions(
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
