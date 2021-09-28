import {loadQuerySuggestActions, SearchEngine} from '@coveo/headless';
import {QuerySuggestionSection} from '@coveo/headless/dist/definitions/state/state-sections';
import {Component, Element, Prop, State, h} from '@stencil/core';
import {
  dispatchSearchBoxSuggestionsEvent,
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

  private renderItems() {
    // TODO: filter out identical recent queries, might require "context"
    const hasQuery = this.bindings.searchBoxController.state.value !== '';
    const max = hasQuery ? this.maxWithQuery : this.maxWithoutQuery;
    return this.bindings.searchBoxController.state.suggestions
      .slice(0, max)
      .map((suggestion) => ({
        content: (
          // TODO: add icon when other types of suggestions can appear
          <span innerHTML={suggestion.highlightedValue}></span>
        ),
        value: suggestion.rawValue,
        onClick: () =>
          this.bindings.searchBoxController.selectSuggestion(
            suggestion.rawValue
          ),
      }));
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
