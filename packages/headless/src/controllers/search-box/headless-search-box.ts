import {Schema, SchemaValues, StringValue, NumberValue} from '@coveo/bueno';
import {
  fetchQuerySuggestions,
  clearQuerySuggest,
  clearQuerySuggestCompletions,
  registerQuerySuggest,
  selectQuerySuggestion,
} from '../../features/query-suggest/query-suggest-actions';
import {Engine} from '../../app/headless-engine';
import {randomID} from '../../utils/utils';
import {updateQuery} from '../../features/query/query-actions';
import {
  registerQuerySetQuery,
  updateQuerySetQuery,
} from '../../features/query-set/query-set-actions';
import {executeSearch} from '../../features/search/search-actions';
import {buildController} from '../controller/headless-controller';
import {updatePage} from '../../features/pagination/pagination-actions';
import {logSearchboxSubmit} from '../../features/query/query-analytics-actions';

export interface SearchBoxProps {
  options: SearchBoxOptions;
}

const optionsSchema = new Schema({
  /**
   * A unique identifier for the controller.
   * By default, a unique random identifier is generated.
   */
  id: new StringValue({
    default: () => randomID('search_box'),
    emptyAllowed: false,
  }),
  /**
   * The number of query suggestions to request from Coveo ML (e.g., `3`).
   *
   * Using the value `0` disables the query suggest feature.
   *
   * @default 5
   */
  numberOfSuggestions: new NumberValue({default: 5, min: 0}),
});

export type SearchBoxOptions = SchemaValues<typeof optionsSchema>;

/**
 * A scoped and simplified part of the headless state that is relevant to the `SearchBox` controller.
 */
export type SearchBoxState = SearchBox['state'];
/**
 * The `SearchBox` headless controller offers a high-level interface for designing a common search box UI controller.
 */
export type SearchBox = ReturnType<typeof buildSearchBox>;

export const buildSearchBox = (
  engine: Engine,
  props: Partial<SearchBoxProps> = {}
) => {
  const controller = buildController(engine);
  const {dispatch} = engine;

  const options = optionsSchema.validate(props.options) as Required<
    SearchBoxOptions
  >;

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
      dispatch(selectQuerySuggestion({id: options.id, expression: value}));
      this.submit();
    },

    /**
     * Triggers a search query.
     */
    submit() {
      dispatch(updateQuery({q: this.state.value}));
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
};
