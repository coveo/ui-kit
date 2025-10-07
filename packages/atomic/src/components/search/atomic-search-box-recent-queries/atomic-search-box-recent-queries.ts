import {
  buildRecentQueriesList,
  type RecentQueriesList,
  type SearchBox,
} from '@coveo/headless';
import {html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {errorGuard} from '@/src/decorators/error-guard';
import type {SearchBoxSuggestionsComponent} from '@/src/decorators/types';
import {SafeStorage, StorageItems} from '@/src/utils/local-storage-utils';
import {once} from '@/src/utils/utils';
import Clock from '../../../images/clock.svg';
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
import type {Bindings} from '../atomic-search-interface/interfaces';

/**
 * The `atomic-search-box-recent-queries` component can be added as a child of an `atomic-search-box` component, allowing for the configuration of recent query suggestions.
 */
@customElement('atomic-search-box-recent-queries')
export class AtomicSearchBoxRecentQueries
  extends LitElement
  implements SearchBoxSuggestionsComponent<Bindings>
{
  public bindings!: SearchBoxSuggestionsBindings<SearchBox, Bindings>;
  private recentQueriesList!: RecentQueriesList;
  private storage!: SafeStorage;

  @state() public error!: Error;

  /**
   * The SVG icon to display.
   *
   * - Use a value that starts with `http://`, `https://`, `./`, or `../`, to fetch and display an icon from a given location.
   * - Use a value that starts with `assets://`, to display an icon from the Atomic package.
   * - Use a stringified SVG to display it directly.
   */
  @property() public icon?: string;

  /**
   * The maximum number of suggestions to display when the user types in the input field.
   */
  @property({type: Number, attribute: 'max-with-query', reflect: true})
  public maxWithQuery = 3;
  /**
   * The maximum number of suggestions to display initially, when the input field is empty.
   */
  @property({type: Number, attribute: 'max-without-query', reflect: true})
  public maxWithoutQuery?: number;

  connectedCallback() {
    super.connectedCallback();

    try {
      dispatchSearchBoxSuggestionsEvent<SearchBox, Bindings>(
        (bindings) => {
          this.bindings = bindings;
          return this.initialize();
        },
        this,
        ['atomic-search-box']
      );
    } catch (error) {
      this.error = error as Error;
    }
  }

  public initialize(): SearchBoxSuggestions {
    this.storage = new SafeStorage();
    this.recentQueriesList = buildRecentQueriesList(this.bindings.engine, {
      initialState: {queries: this.retrieveLocalStorage()},
      options: {
        maxLength: 1000,
        clearFilters: this.bindings.clearFilters,
      },
    });

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
    this.bindings.engine.logger.warn(
      'The recent queries feature is deactivated because analytics are disabled.'
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
    const partialItem = getPartialRecentQueryClearElement(this.bindings.i18n);

    return {
      ...partialItem,
      content: renderRecentQueryClear({i18n: this.bindings.i18n}),
      onSelect: () => {
        this.recentQueriesList.clear();
        this.bindings.triggerSuggestions();
      },
    };
  }

  private renderItem(value: string): SearchBoxSuggestionElement {
    const query = this.bindings.searchBoxController.state.value;
    const partialItem = getPartialRecentQueryElement(value, this.bindings.i18n);
    return {
      ...partialItem,
      content: renderRecentQuery({
        icon: this.icon || Clock,
        query,
        value,
      }),
      onSelect: () => {
        if (this.bindings.isStandalone) {
          this.bindings.searchBoxController.updateText(value);
          this.bindings.searchBoxController.submit();
          return;
        }

        this.recentQueriesList.executeRecentQuery(
          this.recentQueriesList.state.queries.indexOf(value)
        );
      },
    };
  }

  @errorGuard()
  render() {
    return html`${nothing}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-search-box-recent-queries': AtomicSearchBoxRecentQueries;
  }
}
