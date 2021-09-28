import {buildRecentQueriesList, HighlightUtils} from '@coveo/headless';
import {Component, Element, Prop, State, h} from '@stencil/core';
import {dispatchSearchBoxSuggestionsEvent} from '../suggestions-common';

@Component({
  tag: 'atomic-search-box-recent-queries',
  shadow: true,
})
export class AtomicSearchBoxRecentQueries {
  @Element() private host!: HTMLElement;

  @State() public error!: Error;

  @Prop() public maxWithQuery = 3;
  @Prop() public maxWithoutQuery?: number;

  componentWillLoad() {
    try {
      dispatchSearchBoxSuggestionsEvent(({engine, searchBoxController}) => {
        const recentQueriesList = buildRecentQueriesList(engine, {
          // TODO: fetch initial state from cookies or local storage
          initialState: {queries: ['hello', 'hola', 'bonjour', 'buongiorno']},
          options: {maxLength: 1000},
        });

        return {
          position: Array.from(this.host.parentNode!.children).indexOf(
            this.host
          ),
          onInput: () => {},
          renderItems: () => {
            const query = searchBoxController.state.value;
            const hasQuery = query !== '';
            const max = hasQuery ? this.maxWithQuery : this.maxWithoutQuery;
            const filteredQueries = recentQueriesList.state.queries
              .filter((recentQuery) =>
                recentQuery.toLowerCase().startsWith(query.toLowerCase())
              )
              .slice(0, max);

            // TODO: add "clear recent queries element"
            return filteredQueries.map((value) => ({
              value,
              content: (
                <span
                  innerHTML={HighlightUtils.highlightString({
                    content: value,
                    openingDelimiter: '<span class="font-bold">',
                    closingDelimiter: '</span>',
                    highlights: [
                      {
                        offset: query.length,
                        length: value.length - query.length,
                      },
                    ],
                  })}
                ></span>
              ),
              onClick: () => {
                // TODO: save state to local storage
                recentQueriesList.executeRecentQuery(
                  recentQueriesList.state.queries.indexOf(value)
                );
              },
            }));
          },
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
