import {Schema, SchemaValues} from '@coveo/bueno';
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
import {searchBoxOptionDefinitions} from './headless-search-box-options-schema';
import {validateOptions} from '../../utils/validate-payload';
import {logQuerySuggestionClick} from '../../features/query-suggest/query-suggest-analytics-actions';

export interface SearchBoxProps {
  options: SearchBoxOptions;
}

const optionsSchema = new Schema(searchBoxOptionDefinitions);
export type SearchBoxOptions = SchemaValues<typeof optionsSchema>;

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

  const options = validateOptions(
    optionsSchema,
    props.options,
    buildSearchBox.name
  ) as Required<SearchBoxOptions>;

  dispatch(registerQuerySetQuery({id: options.id, query: ''}));
  dispatch(
    registerQuerySuggest({
      id: options.id,
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
      dispatch(updateQuerySetQuery({id: options.id, query: value}));

      if (options.numberOfSuggestions) {
        this.showSuggestions();
      }
    },

    /**
     * Clears the search box text and the suggestions.
     */
    clear() {
      dispatch(updateQuerySetQuery({id: options.id, query: ''}));
      dispatch(clearQuerySuggest({id: options.id}));
    },

    /**
     * Clears the suggestions.
     */
    hideSuggestions() {
      dispatch(clearQuerySuggestCompletions({id: options.id}));
    },

    /**
     * Shows the suggestions for the current search box value.
     */
    showSuggestions() {
      dispatch(fetchQuerySuggestions({id: options.id}));
    },

    /**
     * Selects a suggestion and calls `submit`.
     * @param value The string value of the suggestion to select
     */
    selectSuggestion(value: string) {
      dispatch(logQuerySuggestionClick({id: options.id, suggestion: value}));
      dispatch(selectQuerySuggestion({id: options.id, expression: value}));
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
      const querySuggestState = state.querySuggest[options.id]!;
      return {
        value: state.querySet[options.id],
        suggestions: querySuggestState.completions.map((completion) => ({
          value: completion.expression,
        })),
        isLoading: state.search.isLoading,
      };
    },
  };
}
