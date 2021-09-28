import SearchIcon from 'coveo-styleguide/resources/icons/svg/search.svg';
import {
  loadQuerySuggestActions,
  SearchEngine,
  Suggestion,
} from '@coveo/headless';
import {QuerySuggestionSection} from '@coveo/headless/dist/definitions/state/state-sections';
import {Component, Element, Prop, State, h} from '@stencil/core';
import {
  dispatchSearchBoxSuggestionsEvent,
  SearchBoxSuggestionElement,
  SearchBoxSuggestionsBindings,
} from '../suggestions-common';

@Component({
  tag: 'atomic-search-box-query-suggestions',
  shadow: true,
})
export class AtomicSearchBoxQuerySuggestions {
  private bindings!: SearchBoxSuggestionsBindings;
  @Element() private host!: HTMLElement;

  @State() public error!: Error;

  @Prop() public maxWithQuery?: number;
  @Prop() public maxWithoutQuery?: number;

  componentWillLoad() {
    try {
      this.initialize();
    } catch (error) {
      this.error = error as Error;
    }
  }

  private initialize() {
    dispatchSearchBoxSuggestionsEvent((bindings) => {
      this.bindings = bindings;
      const engine = bindings.engine as SearchEngine<QuerySuggestionSection>;
      const {registerQuerySuggest, fetchQuerySuggestions} =
        loadQuerySuggestActions(engine);

      engine.dispatch(
        registerQuerySuggest({
          id: bindings.id,
          count: bindings.numberOfQueries,
        })
      );

      return {
        position: Array.from(this.host.parentNode!.children).indexOf(this.host),
        onInput: () =>
          engine.dispatch(
            fetchQuerySuggestions({
              id: bindings.id,
            })
          ),
        renderItems: () => this.renderItems(),
      };
    }, this.host);
  }

  private renderItems(): SearchBoxSuggestionElement[] {
    const hasQuery = this.bindings.searchBoxController.state.value !== '';
    const max = hasQuery ? this.maxWithQuery : this.maxWithoutQuery;
    return this.bindings.searchBoxController.state.suggestions
      .slice(0, max)
      .map((suggestion) => this.renderItem(suggestion));
  }

  private renderItem(suggestion: Suggestion) {
    const hasQuery = this.bindings.searchBoxController.state.value !== '';
    return {
      content: (
        <div class="flex items-center">
          {this.bindings.getSuggestions().length > 1 && (
            <atomic-icon
              icon={SearchIcon}
              class="w-4 h-4 text-neutral mr-2"
            ></atomic-icon>
          )}
          {hasQuery ? (
            <span innerHTML={suggestion.highlightedValue}></span>
          ) : (
            <span>{suggestion.rawValue}</span>
          )}
        </div>
      ),
      key: suggestion.rawValue,
      query: suggestion.rawValue,
      onSelect: () => {
        this.bindings.searchBoxController.selectSuggestion(suggestion.rawValue);
        this.bindings.inputRef.blur();
      },
    };
  }

  public render() {
    if (this.error) {
      return (
        <atomic-component-error
          element={this.host}
          error={this.error}
        ></atomic-component-error>
      );
    }
  }
}
