import {
  type CommerceEngine,
  loadQuerySuggestActions,
  type SearchBox,
  type Suggestion,
} from '@coveo/headless/commerce';
import {html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {
  getPartialSearchBoxSuggestionElement,
  renderQuerySuggestion,
} from '@/src/components/common/suggestions/query-suggestions';
import {dispatchSearchBoxSuggestionsEvent} from '@/src/components/common/suggestions/suggestions-events';
import type {
  SearchBoxSuggestionElement,
  SearchBoxSuggestions,
  SearchBoxSuggestionsBindings,
} from '@/src/components/common/suggestions/suggestions-types';
import {errorGuard} from '@/src/decorators/error-guard';
import type {SearchBoxSuggestionsComponent} from '@/src/decorators/types';
import SearchIcon from '../../../images/search.svg';
import type {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';

/**
 * The `atomic-commerce-search-box-query-suggestions` component can be added as a child of an `atomic-commerce-search-box` component, allowing for the configuration of query suggestion behavior.
 */
@customElement('atomic-commerce-search-box-query-suggestions')
export class AtomicCommerceSearchBoxQuerySuggestions
  extends LitElement
  implements SearchBoxSuggestionsComponent<CommerceBindings>
{
  public bindings!: SearchBoxSuggestionsBindings<SearchBox, CommerceBindings>;

  @state() public error!: Error;

  /**
   * The SVG icon to display.
   *
   * - Use a value that starts with `http://`, `https://`, `./`, or `../`, to fetch and display an icon from a given location.
   * - Use a value that starts with `assets://`, to display an icon from the Atomic package.
   * - Use a stringified SVG to display it directly.
   */
  @property() icon?: string;

  /**
   * The maximum number of suggestions that will be displayed if the user has typed something into the input field.
   */
  @property({type: Number, attribute: 'max-with-query', reflect: true})
  public maxWithQuery = 3;

  /**
   * The maximum number of suggestions that will be displayed initially when the input field is empty.
   */
  @property({type: Number, attribute: 'max-without-query', reflect: true})
  public maxWithoutQuery?: number;

  connectedCallback() {
    super.connectedCallback();
    try {
      dispatchSearchBoxSuggestionsEvent<SearchBox, CommerceBindings>(
        (bindings) => {
          this.bindings = bindings;
          return this.initialize();
        },
        this,
        ['atomic-commerce-search-box']
      );
    } catch (error) {
      this.error = error as Error;
    }
  }

  public initialize(): SearchBoxSuggestions {
    const engine = this.bindings.engine as CommerceEngine<{querySet: string}>;
    const {registerQuerySuggest, fetchQuerySuggestions} =
      loadQuerySuggestActions(engine);

    const numberOfQueries = this.bindings.numberOfQueries;
    const maxWithQuery = this.maxWithQuery;

    if (numberOfQueries < maxWithQuery) {
      const logger = this.bindings.engine.logger;
      logger.warn(
        `Query suggestions configuration mismatch: atomic-commerce-search-box has number-of-queries="${numberOfQueries}" but atomic-commerce-search-box-query-suggestions has max-with-query="${maxWithQuery}". ` +
          `This may cause inconsistent behavior where the search box requests ${numberOfQueries} suggestions but the component tries to display up to ${maxWithQuery}. ` +
          `Consider updating max-with-query to ${numberOfQueries} or increasing number-of-queries to ${maxWithQuery}.`
      );
    }

    engine.dispatch(
      registerQuerySuggest({
        id: this.bindings.id,
        count: this.bindings.numberOfQueries,
      })
    );

    return {
      position: Array.from(this.parentNode!.children).indexOf(this),
      onInput: () =>
        engine.dispatch(
          fetchQuerySuggestions({
            id: this.bindings.id,
          })
        ),
      renderItems: () => this.renderItems(),
    };
  }

  private renderItems(): SearchBoxSuggestionElement[] {
    const hasQuery = this.bindings.searchBoxController.state.value !== '';
    const max = hasQuery ? this.maxWithQuery : this.maxWithoutQuery;
    return this.bindings.searchBoxController.state.suggestions
      .slice(0, max)
      .map((suggestion) => this.renderItem(suggestion));
  }

  private renderItem(suggestion: Suggestion) {
    const partialItem = getPartialSearchBoxSuggestionElement(
      suggestion,
      this.bindings.i18n
    );

    const icon = this.icon ? this.icon : SearchIcon;
    const hasQuery = this.bindings.searchBoxController.state.value !== '';
    const hasMultipleKindOfSuggestions =
      this.bindings.getSuggestions().length > 1;

    return {
      ...partialItem,
      content: renderQuerySuggestion({
        icon,
        hasQuery,
        suggestion,
        hasMultipleKindOfSuggestions,
      }),
      onSelect: () => {
        this.bindings.searchBoxController.selectSuggestion(suggestion.rawValue);
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
    'atomic-commerce-search-box-query-suggestions': AtomicCommerceSearchBoxQuerySuggestions;
  }
}
