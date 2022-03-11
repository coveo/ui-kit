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

/**
 * The `atomic-search-box-query-suggestions` component can be added as a child of an `atomic-search-box` component, allowing for the configuration of query suggestion behavior.
 */
@Component({
  tag: 'atomic-search-box-query-suggestions',
  shadow: true,
})
export class AtomicSearchBoxQuerySuggestions {
  private bindings!: SearchBoxSuggestionsBindings;
  @Element() private host!: HTMLElement;

  @State() public error!: Error;

  /**
   * The maximum number of suggestions that will be displayed if the user has typed something into the input field.
   */
  @Prop({reflect: true}) public maxWithQuery?: number;
  /**
   * The maximum number of suggestions that will be displayed initially when the input field is empty.
   */
  @Prop({reflect: true}) public maxWithoutQuery?: number;

  componentWillLoad() {
    try {
      dispatchSearchBoxSuggestionsEvent((bindings) => {
        this.bindings = bindings;
        return this.initialize();
      }, this.host);
    } catch (error) {
      this.error = error as Error;
    }
  }

  private initialize() {
    const engine = this.bindings.engine as SearchEngine<QuerySuggestionSection>;
    const {registerQuerySuggest, fetchQuerySuggestions} =
      loadQuerySuggestActions(engine);

    engine.dispatch(
      registerQuerySuggest({
        id: this.bindings.id,
        count: this.bindings.numberOfQueries,
      })
    );

    return {
      position: Array.from(this.host.parentNode!.children).indexOf(this.host),
      onInput: () =>
        engine.dispatch(
          fetchQuerySuggestions({
            id: this.bindings.id,
          })
        ),
      renderItems: () => this.renderItems(),
    };
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
            <atomic-icon icon={SearchIcon} class="w-4 h-4 mr-2"></atomic-icon>
          )}
          {hasQuery ? (
            // deepcode ignore ReactSetInnerHtml: This is not React code, deepcode ignore DOMXSS: Value escaped in upstream code.
            <span innerHTML={suggestion.highlightedValue}></span>
          ) : (
            <span>{suggestion.rawValue}</span>
          )}
        </div>
      ),
      key: `qs-${suggestion.rawValue}`,
      query: suggestion.rawValue,
      onSelect: () => {
        this.bindings.searchBoxController.selectSuggestion(suggestion.rawValue);
        this.bindings.clearSuggestions();
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
