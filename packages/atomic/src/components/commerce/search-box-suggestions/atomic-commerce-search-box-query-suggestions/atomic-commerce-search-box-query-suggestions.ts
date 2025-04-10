import {
  getPartialSearchBoxSuggestionElement,
  querySuggestionContainer,
  querySuggestionIcon,
  querySuggestionText,
} from '@/src/components/common/suggestions/query-suggestions';
import {
  dispatchSearchBoxSuggestionsEvent,
  SearchBoxSuggestionElement,
  SearchBoxSuggestions,
  SearchBoxSuggestionsBindings,
} from '@/src/components/common/suggestions/suggestions-common';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {errorGuard} from '@/src/decorators/error-guard';
import {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {
  CommerceEngine,
  loadQuerySuggestActions,
  SearchBox,
  Suggestion,
} from '@coveo/headless/commerce';
import {html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import SearchIcon from '../../../../images/search.svg';
import {CommerceBindings} from '../../atomic-commerce-interface/atomic-commerce-interface';

/**
 * The `atomic-commerce-search-box-query-suggestions` component can be added as a child of an `atomic-search-box` component, allowing for the configuration of query suggestion behavior.
 * @alpha
 */
@customElement('atomic-commerce-search-box-query-suggestions')
@withTailwindStyles
export class AtomicCommerceSearchBoxQuerySuggestions
  extends LitElement
  implements InitializableComponent<CommerceBindings>
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

  willUpdate() {
    try {
      dispatchSearchBoxSuggestionsEvent<SearchBox, CommerceBindings>(
        (bindings) => {
          this.bindings = bindings;
          return this.initialize();
        },
        this
      );
    } catch (error) {
      this.error = error as Error;
    }
  }

  public initialize(): SearchBoxSuggestions {
    const engine = this.bindings.engine as CommerceEngine<{querySet: string}>;
    const {registerQuerySuggest, fetchQuerySuggestions} =
      loadQuerySuggestActions(engine);

    console.log(this.bindings.id);
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
    const hasQuery = this.bindings.searchBoxController.state.value !== '';
    const partialItem = getPartialSearchBoxSuggestionElement(
      suggestion,
      this.bindings.i18n
    );

    return {
      ...partialItem,
      content: querySuggestionContainer({props: {}})(html`
        ${querySuggestionIcon({
          props: {
            icon: this.icon || SearchIcon,
            hasSuggestion: this.bindings.getSuggestions().length > 1,
          },
        })}
        ${querySuggestionText({props: {suggestion, hasQuery}})}
      `),
      onSelect: () => {
        this.bindings.searchBoxController.selectSuggestion(suggestion.rawValue);
      },
    };
  }

  @bindingGuard()
  @errorGuard()
  render() {
    return html`TODO`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-commerce-search-box-query-suggestions': AtomicCommerceSearchBoxQuerySuggestions;
  }
}
