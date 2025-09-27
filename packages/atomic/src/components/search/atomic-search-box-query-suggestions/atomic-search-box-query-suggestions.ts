import {
  loadQuerySuggestActions,
  type SearchBox,
  type SearchEngine,
  type Suggestion,
} from '@coveo/headless';
import {html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {LitElementWithError} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import SearchIcon from '../../../images/search.svg';
import {
  getPartialSearchBoxSuggestionElement,
  renderQuerySuggestion,
} from '../../common/suggestions/query-suggestions';
import {dispatchSearchBoxSuggestionsEvent} from '../../common/suggestions/suggestions-events';
import type {
  SearchBoxSuggestionElement,
  SearchBoxSuggestions,
  SearchBoxSuggestionsBindings,
} from '../../common/suggestions/suggestions-types';
import type {Bindings} from '../atomic-search-interface/interfaces';

/**
 * The `atomic-search-box-query-suggestions` component can be added as a child of an `atomic-search-box` component, allowing for the configuration of query suggestion behavior.
 */
@customElement('atomic-search-box-query-suggestions')
@bindings()
@withTailwindStyles
@bindings()
export class AtomicSearchBoxQuerySuggestions
  extends LitElement
  implements SearchBoxSuggestionsComponent<Bindings>
{
  private suggestionsBindings!: SearchBoxSuggestionsBindings<
    SearchBox,
    Bindings
  >;

  @state() public error!: Error;
  @state() public bindings!: SearchBoxSuggestionsBindings<SearchBox, Bindings>;

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
  public maxWithoutQuery = 0;

  initialize(): SearchBoxSuggestions {
    return this.initializeQuerySuggestions();
  }

  connectedCallback() {
    super.connectedCallback();
    try {
      dispatchSearchBoxSuggestionsEvent<SearchBox, Bindings>(
        (bindings) => {
          this.suggestionsBindings = bindings;
          return this.initializeQuerySuggestions();
        },
        this,
        ['atomic-search-box']
      );
    } catch (error) {
      this.error = error as Error;
    }
  }

  private initializeQuerySuggestions(): SearchBoxSuggestions {
    const engine = this.suggestionsBindings.engine as SearchEngine<{
      querySet: string;
      querySuggest: string;
    }>;
    const {registerQuerySuggest, fetchQuerySuggestions} =
      loadQuerySuggestActions(engine);

    const numberOfQueries = this.suggestionsBindings.numberOfQueries;
    const maxWithQuery = this.maxWithQuery;

    if (numberOfQueries < maxWithQuery) {
      const logger = this.suggestionsBindings.engine.logger;
      logger.warn(
        `Query suggestions configuration mismatch: atomic-search-box has number-of-queries="${numberOfQueries}" but atomic-search-box-query-suggestions has max-with-query="${maxWithQuery}". ` +
          `This may cause inconsistent behavior where the search box requests ${numberOfQueries} suggestions but the component tries to display up to ${maxWithQuery}. ` +
          `Consider updating max-with-query to ${numberOfQueries} or increasing number-of-queries to ${maxWithQuery}.`
      );
    }

    engine.dispatch(
      registerQuerySuggest({
        id: this.suggestionsBindings.id,
        count: this.suggestionsBindings.numberOfQueries,
      })
    );

    return {
      position: Array.from(this.parentNode!.children).indexOf(this),
      onInput: () =>
        engine.dispatch(
          fetchQuerySuggestions({
            id: this.suggestionsBindings.id,
          })
        ),
      renderItems: () => this.renderItems(),
    };
  }

  private renderItems(): SearchBoxSuggestionElement[] {
    const hasQuery =
      this.suggestionsBindings.searchBoxController.state.value !== '';
    const max = hasQuery ? this.maxWithQuery : this.maxWithoutQuery;
    return this.suggestionsBindings.searchBoxController.state.suggestions
      .slice(0, max)
      .map((suggestion: Suggestion) => this.renderItem(suggestion));
  }

  private renderItem(suggestion: Suggestion): SearchBoxSuggestionElement {
    const partialItem = getPartialSearchBoxSuggestionElement(
      suggestion,
      this.suggestionsBindings.i18n
    );

    const icon = this.icon || SearchIcon;
    const hasQuery =
      this.suggestionsBindings.searchBoxController.state.value !== '';
    const hasMultipleKindOfSuggestions =
      this.suggestionsBindings.getSuggestions().length > 1;

    return {
      ...partialItem,
      content: renderQuerySuggestion({
        icon,
        hasQuery,
        suggestion,
        hasMultipleKindOfSuggestions,
      }),
      onSelect: () => {
        this.suggestionsBindings.searchBoxController.selectSuggestion(
          suggestion.rawValue
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
    'atomic-search-box-query-suggestions': AtomicSearchBoxQuerySuggestions;
  }
}
