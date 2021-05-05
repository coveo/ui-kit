import {
  fetchQuerySuggestions,
  clearQuerySuggest,
  clearQuerySuggestCompletions,
  registerQuerySuggest,
  selectQuerySuggestion,
} from '../../features/query-suggest/query-suggest-actions';
import {Engine} from '../../app/headless-engine';
import {updateQuery} from '../../features/query/query-actions';
import {
  registerQuerySetQuery,
  updateQuerySetQuery,
} from '../../features/query-set/query-set-actions';
import {executeSearch} from '../../features/search/search-actions';
import {buildController, Controller} from '../controller/headless-controller';
import {updatePage} from '../../features/pagination/pagination-actions';
import {logSearchboxSubmit} from '../../features/query/query-analytics-actions';
import {
  ConfigurationSection,
  QuerySection,
  QuerySetSection,
  QuerySuggestionSection,
  SearchSection,
} from '../../state/state-sections';
import {
  SearchBoxOptions,
  defaultSearchBoxOptions,
  searchBoxOptionsSchema,
} from './headless-search-box-options';
import {validateOptions} from '../../utils/validate-payload';
import {logQuerySuggestionClick} from '../../features/query-suggest/query-suggest-analytics-actions';
import {randomID} from '../../utils/utils';
import {QuerySuggestState} from '../../features/query-suggest/query-suggest-state';
import {SearchAction} from '../../features/analytics/analytics-utils';
import {
  getHighlightedSuggestion,
  SuggestionHighlightingOptions,
  Delimiters,
} from '../../utils/highlight';
import {
  configuration,
  query,
  querySet,
  querySuggest,
  search,
} from '../../app/reducers';
import {loadReducerError} from '../../utils/errors';
import {deselectAllFacets} from '../../features/facets/generic/facet-actions';

export {SearchBoxOptions, SuggestionHighlightingOptions, Delimiters};

export interface SearchBoxProps {
  options?: SearchBoxOptions;
}

/**
 * The `SearchBox` headless controller offers a high-level interface for designing a common search box UI controller.
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
   * Clears the suggestions.
   *
   * @deprecated Suggestions should be hidden using CSS instead for an optimal user experience.
   */
  hideSuggestions(): void;

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
   * Triggers a search query.
   */
  submit(): void;

  /**
   * The state of the `SearchBox` controller.
   */
  state: SearchBoxState;
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
 * Creates a `SearchBox` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `SearchBox` properties.
 * @returns A `SearchBox` controller instance.
 */
export function buildSearchBox(
  engine: Engine<object>,
  props: SearchBoxProps = {}
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

  dispatch(registerQuerySetQuery({id, query: ''}));
  dispatch(
    registerQuerySuggest({
      id,
      q: engine.state.query.q,
      count: options.numberOfSuggestions,
    })
  );

  const getValue = () => engine.state.querySet[options.id];

  const performSearch = (analytics: SearchAction) => {
    const {enableQuerySyntax, clearFiltersOnNewQuery} = options;

    if (clearFiltersOnNewQuery) {
      dispatch(deselectAllFacets());
    }
    dispatch(updateQuery({q: getValue(), enableQuerySyntax}));
    dispatch(updatePage(1));
    dispatch(executeSearch(analytics));
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

    hideSuggestions() {
      dispatch(clearQuerySuggestCompletions({id}));
    },

    showSuggestions() {
      if (options.numberOfSuggestions) {
        dispatch(fetchQuerySuggestions({id}));
      }
    },

    selectSuggestion(value: string) {
      dispatch(selectQuerySuggestion({id, expression: value}));
      performSearch(logQuerySuggestionClick({id, suggestion: value}));
    },

    submit() {
      performSearch(logSearchboxSubmit());
    },

    get state() {
      const state = getState();
      const querySuggestState = state.querySuggest[options.id];
      const suggestions = getSuggestions(
        querySuggestState,
        options.highlightOptions
      );

      return {
        value: getValue(),
        suggestions,
        isLoading: state.search.isLoading,
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
  engine: Engine<object>
): engine is Engine<
  QuerySection &
    QuerySuggestionSection &
    ConfigurationSection &
    QuerySetSection &
    SearchSection
> {
  engine.addReducers({query, querySuggest, configuration, querySet, search});
  return true;
}
