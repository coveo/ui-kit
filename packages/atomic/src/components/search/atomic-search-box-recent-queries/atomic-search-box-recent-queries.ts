import {
  buildRecentQueriesList,
  type RecentQueriesList,
  type SearchBox,
} from '@coveo/headless';
import {LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {bindings} from '../../../decorators/bindings';
import type {LitElementWithError} from '../../../decorators/types';
import Clock from '../../../images/clock.svg';
import {SafeStorage, StorageItems} from '../../../utils/local-storage-utils';
import {once} from '../../../utils/utils';
import {
  getPartialRecentQueryClearElement,
  getPartialRecentQueryElement,
  renderRecentQuery,
  renderRecentQueryClear,
} from '../../common/suggestions/recent-queries';
import {dispatchSearchBoxSuggestionsEvent} from '../../common/suggestions/suggestions-events';
import type {
  SearchBoxSuggestionElement,
  SearchBoxSuggestions,
  SearchBoxSuggestionsBindings,
} from '../../common/suggestions/suggestions-types';
import type {Bindings} from '../atomic-search-interface/atomic-search-interface';

/**
 * The `atomic-search-box-recent-queries` component can be added as a child of an `atomic-search-box` component, allowing for the configuration of recent query suggestions.
 */
@customElement('atomic-search-box-recent-queries')
@bindings()
export class AtomicSearchBoxRecentQueries
  extends LitElement
  implements LitElementWithError
{
  private suggestionsBindings!: SearchBoxSuggestionsBindings<
    SearchBox,
    Bindings
  >;
  private recentQueriesList!: RecentQueriesList;
  private storage!: SafeStorage;

  @state() public error!: Error;
  @state() bindings!: Bindings;

  /**
   * The SVG icon to display.
   *
   * - Use a value that starts with `http://`, `https://`, `./`, or `../`, to fetch and display an icon from a given location.
   * - Use a value that starts with `assets://`, to display an icon from the Atomic package.
   * - Use a stringified SVG to display it directly.
   */
  @property() public icon?: string;

  /**
   * The maximum number of suggestions that will be displayed if the user has typed something into the input field.
   */
  @property({type: Number, attribute: 'max-with-query'}) public maxWithQuery =
    3;

  /**
   * The maximum number of suggestions that will be displayed initially when the input field is empty.
   */
  @property({type: Number, attribute: 'max-without-query'})
  public maxWithoutQuery?: number;

  initialize() {
    this.initializeRecentQueries();
  }

  connectedCallback() {
    super.connectedCallback();

    try {
      dispatchSearchBoxSuggestionsEvent<SearchBox, Bindings>(
        (bindings) => {
          this.suggestionsBindings = bindings;
          return this.initializeRecentQueries();
        },
        this,
        ['atomic-search-box']
      );
    } catch (error) {
      this.error = error as Error;
    }
  }

  private renderIcon() {
    return this.icon || Clock;
  }

  private initializeRecentQueries(): SearchBoxSuggestions {
    this.storage = new SafeStorage();
    this.recentQueriesList = buildRecentQueriesList(
      this.suggestionsBindings.engine,
      {
        initialState: {queries: this.retrieveLocalStorage()},
        options: {
          maxLength: 1000,
          clearFilters: this.suggestionsBindings.clearFilters,
        },
      }
    );

    this.recentQueriesList.subscribe(() => this.updateLocalStorage());

    return {
      position: Array.from(this.parentNode!.children).indexOf(this),
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
    this.suggestionsBindings.engine.logger.warn(
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

    const query = this.suggestionsBindings.searchBoxController.state.value;
    const hasQuery = query !== '';
    const max = hasQuery ? this.maxWithQuery : this.maxWithoutQuery;
    const filteredQueries = this.recentQueriesList.state.queries
      .filter((recentQuery) =>
        recentQuery.toLowerCase().startsWith(query.toLowerCase())
      )
      .slice(0, max);

    const suggestionElements: SearchBoxSuggestionElement[] =
      filteredQueries.map((value) => this.renderItem(value));
    if (suggestionElements.length) {
      suggestionElements.unshift(this.renderClear());
    }

    return suggestionElements;
  }

  private renderClear(): SearchBoxSuggestionElement {
    const partialItem = getPartialRecentQueryClearElement(
      this.suggestionsBindings.i18n
    );

    return {
      ...partialItem,
      content: renderRecentQueryClear({i18n: this.suggestionsBindings.i18n}),
      onSelect: () => {
        this.recentQueriesList.clear();
        this.suggestionsBindings.triggerSuggestions();
      },
    };
  }

  private renderItem(value: string): SearchBoxSuggestionElement {
    const query = this.suggestionsBindings.searchBoxController.state.value;
    const partialItem = getPartialRecentQueryElement(
      value,
      this.suggestionsBindings.i18n
    );
    return {
      ...partialItem,
      content: renderRecentQuery({
        icon: this.renderIcon(),
        query,
        value,
      }),

      onSelect: () => {
        if (this.suggestionsBindings.isStandalone) {
          this.suggestionsBindings.searchBoxController.updateText(value);
          this.suggestionsBindings.searchBoxController.submit();
          return;
        }

        this.recentQueriesList.executeRecentQuery(
          this.recentQueriesList.state.queries.indexOf(value)
        );
      },
    };
  }

  render() {
    return nothing;
  }
}
