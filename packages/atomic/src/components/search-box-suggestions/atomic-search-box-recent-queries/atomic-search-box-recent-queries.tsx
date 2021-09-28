import {
  buildRecentQueriesList,
  HighlightUtils,
  RecentQueriesList,
} from '@coveo/headless';
import {Component, Element, Prop, State, h} from '@stencil/core';
import {
  dispatchSearchBoxSuggestionsEvent,
  SearchBoxSuggestionsBindings,
} from '../suggestions-common';

@Component({
  tag: 'atomic-search-box-recent-queries',
  shadow: true,
})
export class AtomicSearchBoxRecentQueries {
  private bindings!: SearchBoxSuggestionsBindings;
  private recentQueriesList!: RecentQueriesList;

  @Element() private host!: HTMLElement;

  @State() public error!: Error;

  @Prop() public maxWithQuery = 3;
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
      this.recentQueriesList = buildRecentQueriesList(bindings.engine, {
        // TODO: fetch initial state from cookies or local storage
        initialState: {queries: ['hello', 'hola', 'bonjour', 'buongiorno']},
        options: {maxLength: 1000},
      });

      return {
        position: Array.from(this.host.parentNode!.children).indexOf(this.host),
        onInput: () => {},
        renderItems: () => this.renderItems(),
      };
    }, this.host);
  }

  private renderItems() {
    const query = this.bindings.searchBoxController.state.value;
    const hasQuery = query !== '';
    const max = hasQuery ? this.maxWithQuery : this.maxWithoutQuery;
    const filteredQueries = this.recentQueriesList.state.queries
      .filter((recentQuery) =>
        recentQuery.toLowerCase().startsWith(query.toLowerCase())
      )
      .slice(0, max);

    // TODO: add "clear recent queries element"
    return filteredQueries.map((value) => ({
      value,
      content: (
        // TODO: add icon when other types of suggestions can appear
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
        this.recentQueriesList.executeRecentQuery(
          this.recentQueriesList.state.queries.indexOf(value)
        );
      },
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
