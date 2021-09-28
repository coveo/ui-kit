import {buildRecentQueriesList} from '@coveo/headless';
import {Component, Element, Prop, State, h} from '@stencil/core';
import {dispatchSearchBoxSuggestionsEvent} from '../suggestions-common';

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
      dispatchSearchBoxSuggestionsEvent(({engine, numberOfQueries}) => {
        const recentQueriesList = buildRecentQueriesList(engine, {
          // TODO: fetch initial state from cookies or local storage
          initialState: {queries: ['hello', 'hola', 'bonjour', 'buongiorno']},
          options: {maxLength: numberOfQueries},
        });

        return {
          onInput: () => {},
          renderItems: () =>
            // TODO: limit values according to maxWithQuery/maxWithoutQuery
            // TODO: filter values according to query
            // TODO: add "clear recent queries element"
            recentQueriesList.state.queries.map((value, i) => ({
              value,
              // TODO: highlight values
              content: <span>{value}</span>,
              // TODO: save state to local storage
              onClick: () => recentQueriesList.executeRecentQuery(i),
            })),
        };
      }, this.host);
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
