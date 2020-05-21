import {checkForRedirection} from '../../features/redirection/redirection-slice';
import {
  fetchQuerySuggestions,
  clearQuerySuggest,
  clearQuerySuggestCompletions,
  updateQuerySuggestQuery,
  registerQuerySuggest,
  selectQuerySuggestion,
  unregisterQuerySuggest,
} from '../../features/query-suggest/query-suggest-slice';
import {Engine} from '../../app/headless-engine';
import {randomID} from '../../utils/utils';

export interface SearchOptions {
  id: string;
  isStandalone: boolean;
  numberOfQuerySuggestions: number;
}

interface UpdateTextOptions {
  value: string;
}

export type SearchboxState = Searchbox['state'];

export class Searchbox {
  private options: SearchOptions = {
    id: randomID('searchbox_'),
    isStandalone: false,
    numberOfQuerySuggestions: 5,
  };

  constructor(private engine: Engine, options?: Partial<SearchOptions>) {
    this.options = {...this.options, ...options};

    this.dispatch(
      registerQuerySuggest({
        id: this.id,
        q: this.engine.state.query.q,
        count: this.options.numberOfQuerySuggestions,
      })
    );
  }

  public get id() {
    return this.options.id;
  }

  private get dispatch() {
    return this.engine.store.dispatch;
  }

  public updateText(options: UpdateTextOptions) {
    this.dispatch(updateQuerySuggestQuery({id: this.id, q: options.value}));

    if (this.options.numberOfQuerySuggestions) {
      this.showSuggestions();
    }
  }

  public clear() {
    this.dispatch(clearQuerySuggest({id: this.id}));
  }

  public hideSuggestions() {
    this.dispatch(clearQuerySuggestCompletions({id: this.id}));
  }

  public showSuggestions() {
    this.dispatch(fetchQuerySuggestions({id: this.id}));
  }

  public selectSuggestion(options: {value: string}) {
    this.dispatch(
      selectQuerySuggestion({id: this.id, expression: options.value})
    );
    this.submit();
  }

  public submit() {
    if (this.options.isStandalone) {
      this.engine.store.dispatch(checkForRedirection());
      return;
    }

    // Dispatch search
  }

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

  public subscribe(listener: () => void) {
    return this.engine.store.subscribe(listener);
  }

  public delete() {
    this.engine.store.dispatch(unregisterQuerySuggest({id: this.id}));
  }
}
