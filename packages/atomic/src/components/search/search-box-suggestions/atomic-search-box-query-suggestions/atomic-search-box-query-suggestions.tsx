import {
  loadQuerySuggestActions,
  SearchEngine,
  Suggestion,
} from '@coveo/headless';
import {
  QuerySetSection,
  QuerySuggestionSection,
} from '@coveo/headless/dist/definitions/state/state-sections';
import {Component, Element, Prop, State, h} from '@stencil/core';
import SearchIcon from '../../../../images/search.svg';
import {encodeForDomAttribute} from '../../../../utils/string-utils';
import {
  dispatchSearchBoxSuggestionsEvent,
  SearchBoxSuggestionElement,
  SearchBoxSuggestions,
  SearchBoxSuggestionsBindings,
} from '../suggestions-common';

/**
 * The `atomic-search-box-query-suggestions` component can be added as a child of an `atomic-search-box` component, allowing for the configuration of query suggestion behavior.
 */
@Component({
  tag: 'atomic-search-box-query-suggestions',
  shadow: true,
})
export class AtomicSearchBoxQuerySuggestions {
  private bindings!: SearchBoxSuggestionsBindings;
  @Element() private host!: HTMLElement;

  @State() public error!: Error;

  /**
   * The SVG icon to display.
   *
   * - Use a value that starts with `http://`, `https://`, `./`, or `../`, to fetch and display an icon from a given location.
   * - Use a value that starts with `assets://`, to display an icon from the Atomic package.
   * - Use a stringified SVG to display it directly.
   */
  @Prop() public icon?: string;

  /**
   * The maximum number of suggestions that will be displayed if the user has typed something into the input field.
   */
  @Prop({reflect: true}) public maxWithQuery?: number;
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

  private renderIcon() {
    return this.icon || SearchIcon;
  }

  private initialize(): SearchBoxSuggestions {
    const engine = this.bindings.engine as SearchEngine<
      QuerySuggestionSection & QuerySetSection
    >;
    const {registerQuerySuggest, fetchQuerySuggestions} =
      loadQuerySuggestActions(engine);

    engine.dispatch(
      registerQuerySuggest({
        id: this.bindings.id,
        count: this.bindings.numberOfQueries,
      })
    );

    return {
      position: Array.from(this.host.parentNode!.children).indexOf(this.host),
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
    return {
      part: 'query-suggestion-item',
      content: (
        <div part="query-suggestion-content" class="flex items-center">
          {this.bindings.getSuggestions().length > 1 && (
            <atomic-icon
              part="query-suggestion-icon"
              icon={this.renderIcon()}
              class="w-4 h-4 mr-2 shrink-0"
            ></atomic-icon>
          )}
          {hasQuery ? (
            <span
              part="query-suggestion-text"
              class="break-all line-clamp-2"
              innerHTML={suggestion.highlightedValue}
            ></span>
          ) : (
            <span part="query-suggestion-text" class="break-all line-clamp-2">
              {suggestion.rawValue}
            </span>
          )}
        </div>
      ),
      key: `qs-${encodeForDomAttribute(suggestion.rawValue)}`,
      query: suggestion.rawValue,
      ariaLabel: this.bindings.i18n.t('query-suggestion-label', {
        query: suggestion.rawValue,
        interpolation: {escapeValue: false},
      }),
      onSelect: () => {
        this.bindings.searchBoxController.selectSuggestion(suggestion.rawValue);
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
