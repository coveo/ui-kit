import {loadQuerySuggestActions, SearchEngine} from '@coveo/headless';
import {QuerySuggestionSection} from '@coveo/headless/dist/definitions/state/state-sections';
import {Component, Element, Prop, State, h} from '@stencil/core';
import {dispatchSearchBoxSuggestionsEvent} from '../suggestions-common';

@Component({
  tag: 'atomic-search-box-query-suggestions',
  shadow: true,
})
export class AtomicSearchBoxQuerySuggestions {
  @Element() private host!: HTMLElement;

  @State() public error!: Error;

  @Prop() public maxWithQuery?: number;
  @Prop() public maxWithoutQuery?: number;

  componentWillLoad() {
    try {
      dispatchSearchBoxSuggestionsEvent(
        ({engine, id, searchBoxController, numberOfQueries}) => {
          const {registerQuerySuggest, fetchQuerySuggestions} =
            loadQuerySuggestActions(engine);

          (engine as SearchEngine<QuerySuggestionSection>).dispatch(
            registerQuerySuggest({
              id,
              count: numberOfQueries,
            })
          );

          return {
            onInput: () =>
              (engine as SearchEngine<QuerySuggestionSection>).dispatch(
                fetchQuerySuggestions({
                  id,
                })
              ),
            renderItems: () =>
              // TODO: limit values according to maxWithQuery/maxWithoutQuery
              searchBoxController.state.suggestions.map((suggestion) => ({
                content: <span innerHTML={suggestion.highlightedValue}></span>,
                value: suggestion.rawValue,
                onClick: () =>
                  searchBoxController.selectSuggestion(suggestion.rawValue),
              })),
          };
        },
        this.host
      );
    } catch (error) {
      this.error = error as Error;
    }
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
