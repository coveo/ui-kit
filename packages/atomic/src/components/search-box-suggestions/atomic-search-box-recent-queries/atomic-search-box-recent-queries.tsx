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
import {once} from '../../../utils/utils';
import {SafeStorage, StorageItems} from '../../../utils/local-storage-utils';

/**
 * The `atomic-search-box-recent-queries` component can be added as a child of an `atomic-search-box` component, allowing for the configuration of recent query suggestions.
 */
@Component({
  tag: 'atomic-search-box-recent-queries',
  shadow: true,
})
export class AtomicSearchBoxRecentQueries {
  private bindings!: SearchBoxSuggestionsBindings;
  private recentQueriesList!: RecentQueriesList;
  private storage!: SafeStorage;

  @Element() private host!: HTMLElement;

  @State() public error!: Error;

  /**
   * The maximum number of suggestions that will be displayed if the user has typed something into the input field.
   */
  @Prop({reflect: true}) public maxWithQuery = 3;
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
    this.storage = new SafeStorage();
    this.recentQueriesList = buildRecentQueriesList(this.bindings.engine, {
      initialState: {queries: this.retrieveLocalStorage()},
      options: {maxLength: 1000},
    });

    this.recentQueriesList.subscribe(() => this.updateLocalStorage());

    return {
      position: Array.from(this.host.parentNode!.children).indexOf(this.host),
      onInput: () => {},
      renderItems: () => this.renderItems(),
    };
  }

  private retrieveLocalStorage() {
    return this.storage.getParsedJSON(StorageItems.RECENT_QUERIES, []);
  }

  private updateLocalStorage() {
    if (!this.recentQueriesList.state.analyticsEnabled) {
      return this.disableFeature();
    }

    return this.storage.setJSON(
      StorageItems.RECENT_QUERIES,
      this.recentQueriesList.state.queries
    );
  }

  private warnUser = once(() =>
    this.bindings.engine.logger.warn(
      'Because analytics are disabled, the recent queries feature is deactivated.'
    )
  );

  private disableFeature() {
    this.warnUser();
    this.storage.removeItem(StorageItems.RECENT_QUERIES);
  }

  private renderItems(): SearchBoxSuggestionElement[] {
    if (!this.recentQueriesList.state.analyticsEnabled) {
      return [];
    }

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
      key: `recent-${value}`,
      query: value,
      content: (
        <div class="flex items-center break-all">
          <atomic-icon icon={Clock} class="w-4 h-4 mr-2 shrink-0"></atomic-icon>
          {query === '' ? (
            <span class="break-all line-clamp-2">{value}</span>
          ) : (
            <span
              class="break-all line-clamp-2"
              // deepcode ignore DOMXSS: Value escaped in upstream code, deepcode ignore ReactSetInnerHtml: This is not React code.
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
        if (this.bindings.isStandalone) {
          this.bindings.searchBoxController.updateText(value);
          this.bindings.searchBoxController.submit();
          return;
        }

        this.recentQueriesList.executeRecentQuery(
          this.recentQueriesList.state.queries.indexOf(value)
        );
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
