import Clock from '../../../images/clock.svg';
import {
  buildRecentQueriesList,
  HighlightUtils,
  RecentQueriesList,
} from '@coveo/headless';
import {Component, Element, Prop, State, h} from '@stencil/core';
import {
  dispatchSearchBoxSuggestionsEvent,
  SearchBoxSuggestionElement,
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

  private renderItems(): SearchBoxSuggestionElement[] {
    const query = this.bindings.searchBoxController.state.value;
    const hasQuery = query !== '';
    const max = hasQuery ? this.maxWithQuery : this.maxWithoutQuery;
    const filteredQueries = this.recentQueriesList.state.queries
      .filter(
        (recentQuery) =>
          recentQuery !== query &&
          recentQuery.toLowerCase().startsWith(query.toLowerCase())
      )
      .slice(0, max);

    const suggestionElements = filteredQueries.map((value) =>
      this.renderItem(value)
    );
    if (suggestionElements.length) {
      suggestionElements.unshift(this.renderClear());
    }

    return suggestionElements;
  }

  private renderClear(): SearchBoxSuggestionElement {
    return {
      key: 'recent-query-clear',
      content: (
        <div class="flex justify-between w-full">
          <span class="font-bold">
            {this.bindings.i18n.t('recent-searches')}
          </span>
          <span>{this.bindings.i18n.t('clear')}</span>
        </div>
      ),
      onSelect: () => {
        this.recentQueriesList.clear();
        this.bindings.triggerSuggestions();
      },
    };
  }

  private renderItem(value: string): SearchBoxSuggestionElement {
    const query = this.bindings.searchBoxController.state.value;
    return {
      key: value,
      query: value,
      content: (
        <div class="flex items-center">
          <atomic-icon
            icon={Clock}
            class="w-5 h-5 text-neutral mr-2 -ml-1"
          ></atomic-icon>
          {query === '' ? (
            <span>{value}</span>
          ) : (
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
          )}
        </div>
      ),
      onSelect: () => {
        // TODO: save state to local storage
        this.recentQueriesList.executeRecentQuery(
          this.recentQueriesList.state.queries.indexOf(value)
        );
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
