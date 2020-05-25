import {checkForRedirection} from '../../features/redirection/redirection-actions';
import {
  fetchQuerySuggestions,
  clearQuerySuggest,
  clearQuerySuggestCompletions,
  updateQuerySuggestQuery,
  registerQuerySuggest,
  selectQuerySuggestion,
} from '../../features/query-suggest/query-suggest-actions';
import {Engine} from '../../app/headless-engine';
import {randomID} from '../../utils/utils';

export interface SearchBoxOptions {
  /**
   * A unique identifier for the component.
   * By default, a unique random identifier is generated.
   */
  id: string;
  /**
   * The number of query suggestions to request from Coveo ML (e.g., `3`).
   *
   * Using the value `0` disables the query suggest feature.
   *
   * @default 5
   */
  numberOfSuggestions: number;
  /**
   * Whether the search box is standalone.
   *
   * Submitting a query from a standalone search box will redirect the user to another page.
   */
  isStandalone: boolean;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `SearchBox` component.
 */
export type SearchBoxState = SearchBox['state'];

/**
 * The `SearchBox` headless component offers a high-level interface for designing a common search box UI component.
 */
export class SearchBox {
  private currentState: SearchBoxState;
  private options: SearchBoxOptions = {
    id: randomID('searchBox_'),
    isStandalone: false,
    numberOfSuggestions: 5,
  };

  constructor(private engine: Engine, options: Partial<SearchBoxOptions> = {}) {
    this.options = {...this.options, ...options};

    this.dispatch(
      registerQuerySuggest({
        id: this.id,
        q: this.engine.state.query.q,
        count: this.options.numberOfSuggestions,
      })
    );

    this.currentState = this.state;
  }

  /**
   * A unique identifier for the component.
   */
  public get id() {
    return this.options.id;
  }

  private get dispatch() {
    return this.engine.dispatch;
  }

  /**
   * Updates the search box text value and shows the suggestions for that value.
   * @param options object with the following properties:
   * - `value`: The string value to update the search box with
   */
  public updateText(options: {value: string}) {
    this.dispatch(updateQuerySuggestQuery({id: this.id, q: options.value}));

    if (this.options.numberOfSuggestions) {
      this.showSuggestions();
    }
  }

  /**
   * Clears the search box text and the suggestions.
   */
  public clear() {
    this.dispatch(clearQuerySuggest({id: this.id}));
  }

  /**
   * Clears the suggestions.
   */
  public hideSuggestions() {
    this.dispatch(clearQuerySuggestCompletions({id: this.id}));
  }

  /**
   * Shows the suggestions for the current search box value.
   */
  public showSuggestions() {
    this.dispatch(fetchQuerySuggestions({id: this.id}));
  }

  /**
   * Selects a suggestion and calls `submit`.
   * @param options object with the following properties:
   * - `value`: The string value of the suggestion to select
   */
  public selectSuggestion(options: {value: string}) {
    this.dispatch(
      selectQuerySuggestion({id: this.id, expression: options.value})
    );
    this.submit();
  }

  /**
   * If the `standalone` option is `true`, gets the redirection URL.
   * If the `standalone` option is `false`, triggers a search query.
   */
  public submit() {
    if (this.options.isStandalone) {
      this.dispatch(checkForRedirection());
      return;
    }

    // Dispatch search
  }

  /**
   * @returns A scoped and simplified part of the headless state that is relevant to the `SearchBox` component.
   */
  public get state() {
    const state = this.engine.state;
    const querySuggestState = state.querySuggest[this.id]!;
    return {
      value: querySuggestState.q,
      suggestions: querySuggestState.completions.map((completion) => ({
        value: completion.expression,
      })),
      redirectTo: state.redirection.redirectTo,
    };
  }

  /**
   * Adds a change listener. It will be called when an action is dispatched and the component’s state has changed.
   *
   * @param listener A callback to be invoked on every component state change.
   * @returns A function to remove this change listener.
   */
  public subscribe(listener: () => void) {
    return this.engine.subscribe(() => {
      const nextState = this.state;
      if (JSON.stringify(nextState) === JSON.stringify(this.currentState)) {
        return;
      }

      this.currentState = nextState;
      listener();
    });
  }
}
