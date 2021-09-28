import {buildRecentQueriesList} from '@coveo/headless';
import {Component, Element, Prop, State, h} from '@stencil/core';
import {buildCustomEvent} from '../../../utils/event-utils';
import {SearchBoxSuggestionsEvent} from '../suggestions-common';

@Component({
  tag: 'atomic-search-box-recent-queries',
  shadow: true,
})
export class AtomicSearchBoxRecentQueries {
  @Element() private host!: HTMLElement;

  @State() public error!: Error;

  @Prop() public maxWithQuery?: number;
  @Prop() public maxWithoutQuery?: number;

  componentWillLoad() {
    try {
      const event = buildCustomEvent<SearchBoxSuggestionsEvent>(
        'atomic/searchBoxSuggestion',
        ({engine}) => {
          const recentQueriesList = buildRecentQueriesList(engine, {
            initialState: {queries: ['hello', 'hola', 'bonjour', 'buongiorno']},
          });

          return {
            onInput: () => {},
            renderItems: () =>
              // TODO: filter, highlight, limit
              recentQueriesList.state.queries.map((value, i) => ({
                value,
                content: <span>{value}</span>,
                onClick: () => recentQueriesList.executeRecentQuery(i),
              })),
          };
        }
      );

      const canceled = this.host.dispatchEvent(event);
      if (canceled) {
        throw new Error(
          'The "atomic-search-box-recent-queries" component was not handled, as it is not a child of a "atomic-search-box" component.'
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
