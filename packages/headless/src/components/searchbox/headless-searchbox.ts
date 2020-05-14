import {checkForRedirection} from '../../features/redirection/redirection-slice';
import {
  fetchQuerySuggestions,
  clearQuerySuggest,
  clearQuerySuggestCompletions,
  updateQuerySuggestQuery,
  registerQuerySuggest,
  selectQuerySuggestion,
} from '../../features/query-suggest/query-suggest-slice';
import {Engine} from '../../app/headless-engine';

export interface SearchOptions {
  isStandalone: boolean;
  numberOfQuerySuggestions: number;
}

interface UpdateTextOptions {
  value: string;
}

export type SearchboxState = Searchbox['state'];

export class Searchbox {
  private options: SearchOptions = {
    isStandalone: false,
    numberOfQuerySuggestions: 5,
  };

  constructor(private engine: Engine, options?: Partial<SearchOptions>) {
    this.options = {...this.options, ...options};

    this.dispatch(
      registerQuerySuggest({
        q: this.engine.state.query.q,
        count: this.options.numberOfQuerySuggestions,
      })
    );
  }

  private get dispatch() {
    return this.engine.store.dispatch;
  }

  public updateText(options: UpdateTextOptions) {
    this.dispatch(updateQuerySuggestQuery({q: options.value}));

    if (this.options.numberOfQuerySuggestions) {
      this.showSuggestions();
    }
  }

  public clear() {
    this.dispatch(clearQuerySuggest());
  }

  public hideSuggestions() {
    this.dispatch(clearQuerySuggestCompletions());
  }

  public showSuggestions() {
    this.dispatch(fetchQuerySuggestions());
  }

  public selectSuggestion(options: {value: string}) {
    this.dispatch(selectQuerySuggestion({expression: options.value}));
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
    return {
      value: state.querySuggest.q,
      suggestions: state.querySuggest.completions.map(completion => ({
        value: completion.expression,
      })),
      redirectTo: state.redirection.redirectTo,
    };
  }

  public subscribe(listener: () => void) {
    return this.engine.store.subscribe(listener);
  }
}
