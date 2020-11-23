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
import {buildController} from '../controller/headless-controller';
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

export {SearchBoxOptions};
export interface SearchBoxProps {
  options: SearchBoxOptions;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `SearchBox` controller.
 */
export type SearchBoxState = SearchBox['state'];
/**
 * The `SearchBox` headless controller offers a high-level interface for designing a common search box UI controller.
 */
export type SearchBox = ReturnType<typeof buildSearchBox>;

export function buildSearchBox(
  engine: Engine<
    QuerySection &
      QuerySuggestionSection &
      ConfigurationSection &
      QuerySetSection &
      SearchSection
  >,
  props: Partial<SearchBoxProps> = {}
) {
  const controller = buildController(engine);
  const {dispatch} = engine;

  const id = props.options?.id || randomID('search_box');
  const options: Required<SearchBoxOptions> = {
    id,
    ...defaultSearchBoxOptions,
    ...props.options,
  };

  validateOptions(searchBoxOptionsSchema, options, buildSearchBox.name);

  dispatch(registerQuerySetQuery({id, query: ''}));
  dispatch(
    registerQuerySuggest({
      id,
      q: engine.state.query.q,
      count: options.numberOfSuggestions,
    })
  );

  return {
    ...controller,

    /**
     * Updates the search box text value and shows the suggestions for that value.
     * @param value  The string value to update the search box with.
     */
    updateText(value: string) {
      dispatch(updateQuerySetQuery({id, query: value}));
      this.showSuggestions();
    },

    /**
     * Clears the search box text and the suggestions.
     */
    clear() {
      dispatch(updateQuerySetQuery({id, query: ''}));
      dispatch(clearQuerySuggest({id}));
    },

    /**
     * Clears the suggestions.
     */
    hideSuggestions() {
      dispatch(clearQuerySuggestCompletions({id}));
    },

    /**
     * Shows the suggestions for the current search box value.
     */
    showSuggestions() {
      if (options.numberOfSuggestions) {
        dispatch(fetchQuerySuggestions({id}));
      }
    },

    /**
     * Selects a suggestion and calls `submit`.
     * @param value The string value of the suggestion to select
     */
    selectSuggestion(value: string) {
      dispatch(logQuerySuggestionClick({id, suggestion: value}));
      dispatch(selectQuerySuggestion({id, expression: value}));
      this.submit();
    },

    /**
     * Triggers a search query.
     */
    submit() {
      dispatch(
        updateQuery({
          q: this.state.value,
          enableQuerySyntax: options.enableQuerySyntax,
        })
      );
      dispatch(updatePage(1));
      dispatch(executeSearch(logSearchboxSubmit()));
    },

    /**
     * @returns The state of the `SearchBox` controller.
     */
    get state() {
      const state = engine.state;
      const querySuggestState = state.querySuggest[options.id];
      const suggestions = getSuggestions(querySuggestState);

      return {
        value: state.querySet[options.id],
        suggestions,
        isLoading: state.search.isLoading,
      };
    },
  };
}

function getSuggestions(state: QuerySuggestState | undefined) {
  if (!state) {
    return [];
  }

  return state.completions.map((completion) => ({
    value: completion.expression,
  }));
}
