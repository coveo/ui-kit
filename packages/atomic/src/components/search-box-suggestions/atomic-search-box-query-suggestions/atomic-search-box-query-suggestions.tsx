import {loadQuerySuggestActions, SearchEngine} from '@coveo/headless';
import {QuerySuggestionSection} from '@coveo/headless/dist/definitions/state/state-sections';
import {Component, Element, Prop, State, h} from '@stencil/core';
import {buildCustomEvent} from '../../../utils/event-utils';
import {SearchBoxSuggestionsEvent} from '../suggestions-common';

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
      const event = buildCustomEvent<SearchBoxSuggestionsEvent>(
        'atomic/searchBoxSuggestion',
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
              // TODO: limit
              searchBoxController.state.suggestions.map((suggestion) => ({
                content: <span innerHTML={suggestion.highlightedValue}></span>,
                value: suggestion.rawValue,
                onClick: () =>
                  searchBoxController.selectSuggestion(suggestion.rawValue),
              })),
          };
        }
      );

      const canceled = this.host.dispatchEvent(event);
      if (canceled) {
        throw new Error(
          'The "atomic-search-box-query-suggestions" component was not handled, as it is not a child of a "atomic-search-box" component.'
        );
      }
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
