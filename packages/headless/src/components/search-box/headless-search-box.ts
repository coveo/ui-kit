import {
  Schema,
  SchemaValues,
  StringValue,
  NumberValue,
  BooleanValue,
} from '@coveo/bueno';
import {checkForRedirection} from '../../features/redirection/redirection-actions';
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
import {
  logTriggerRedirect,
  logSearchboxSubmit,
} from '../../features/analytics/analytics-actions';
import {Component} from '../component/headless-component';
import {updatePage} from '../../features/pagination/pagination-actions';

export interface SearchBoxProps {
  options: Partial<SearchBoxOptions>;
}

const SearchBoxOptionsSchema = new Schema({
  /**
   * A unique identifier for the component.
   * By default, a unique random identifier is generated.
   */
  id: new StringValue({default: () => randomID('search_box')}),
  /**
   * The number of query suggestions to request from Coveo ML (e.g., `3`).
   *
   * Using the value `0` disables the query suggest feature.
   *
   * @default 5
   */
  numberOfSuggestions: new NumberValue({default: 5, min: 0}),
  /**
   * Whether the search box is standalone.
   *
   * Submitting a query from a standalone search box will redirect the user to another page.
   *
   * @default false
   */
  isStandalone: new BooleanValue({default: false}),
});

export type SearchBoxOptions = SchemaValues<typeof SearchBoxOptionsSchema>;

/**
 * A scoped and simplified part of the headless state that is relevant to the `SearchBox` component.
 */
export type SearchBoxState = SearchBox['state'];

/**
 * The `SearchBox` headless component offers a high-level interface for designing a common search box UI component.
 */
export class SearchBox extends Component {
  public text = '';
  private options: Required<SearchBoxOptions>;

  constructor(engine: Engine, props: Partial<SearchBoxProps> = {}) {
    super(engine);
    this.options = SearchBoxOptionsSchema.validate(props.options) as Required<
      SearchBoxOptions
    >;

    this.registerQuery();
    this.registerQuerySuggest();
  }

  /**
   * A unique identifier for the component.
   */
  public get id() {
    return this.options.id;
  }

  /**
   * Updates the search box text value and shows the suggestions for that value.
   * @param value  The string value to update the search box with.
   */
  public updateText(value: string) {
    this.dispatch(updateQuerySetQuery({id: this.options.id, query: value}));

    if (this.options.numberOfSuggestions) {
      this.showSuggestions();
    }
  }

  /**
   * Clears the search box text and the suggestions.
   */
  public clear() {
    this.dispatch(clearQuerySuggest({id: this.options.id}));
  }

  /**
   * Clears the suggestions.
   */
  public hideSuggestions() {
    this.dispatch(clearQuerySuggestCompletions({id: this.options.id}));
  }

  /**
   * Shows the suggestions for the current search box value.
   */
  public showSuggestions() {
    this.dispatch(fetchQuerySuggestions({id: this.options.id}));
  }

  /**
   * Selects a suggestion and calls `submit`.
   * @param value The string value of the suggestion to select
   */
  public selectSuggestion(value: string) {
    this.dispatch(
      selectQuerySuggestion({id: this.options.id, expression: value})
    );
    this.submit();
  }

  /**
   * If the `standalone` option is `true`, gets the redirection URL.
   * If the `standalone` option is `false`, triggers a search query.
   */
  public submit() {
    this.dispatch(updateQuery({q: this.state.value}));
    this.dispatch(updatePage(1));

    if (this.options.isStandalone) {
      this.dispatch(checkForRedirection()).then(() =>
        this.dispatch(logTriggerRedirect())
      );
      return;
    }

    this.dispatch(executeSearch()).then(() =>
      this.dispatch(logSearchboxSubmit())
    );
  }

  /**
   * @returns The state of the `SearchBox` component.
   */
  public get state() {
    const state = this.engine.state;
    const querySuggestState = state.querySuggest[this.options.id]!;
    return {
      value: state.querySet[this.options.id],
      suggestions: querySuggestState.completions.map((completion) => ({
        value: completion.expression,
      })),
      redirectTo: state.redirection.redirectTo,
    };
  }

  private registerQuery() {
    const action = registerQuerySetQuery({id: this.options.id, query: ''});
    this.dispatch(action);
  }

  private registerQuerySuggest() {
    this.dispatch(
      registerQuerySuggest({
        id: this.options.id,
        q: this.engine.state.query.q,
        count: this.options.numberOfSuggestions,
      })
    );
  }
}
