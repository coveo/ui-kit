import {
  loadQuerySuggestActions,
  SearchBox,
  SearchEngine,
  Suggestion,
} from '@coveo/headless';
import {Component, Element, Prop, State, h} from '@stencil/core';
import SearchIcon from '../../../../images/search.svg';
import {
  getPartialSearchBoxSuggestionElement,
  QuerySuggestionContainer,
  QuerySuggestionIcon,
  QuerySuggestionText,
} from '../../../common/suggestions/query-suggestions';
import {
  dispatchSearchBoxSuggestionsEvent,
  SearchBoxSuggestionElement,
  SearchBoxSuggestions,
  SearchBoxSuggestionsBindings,
} from '../../../common/suggestions/suggestions-common';

/**
 * The `atomic-search-box-query-suggestions` component can be added as a child of an `atomic-search-box` component, allowing for the configuration of query suggestion behavior.
 */
@Component({
  tag: 'atomic-search-box-query-suggestions',
  shadow: true,
})
export class AtomicSearchBoxQuerySuggestions {
  private bindings!: SearchBoxSuggestionsBindings<SearchBox>;
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
      dispatchSearchBoxSuggestionsEvent<SearchBox>((bindings) => {
        this.bindings = bindings;
        return this.initialize();
      }, this.host);
    } catch (error) {
      this.error = error as Error;
    }
  }

  private initialize(): SearchBoxSuggestions {
    const engine = this.bindings.engine as SearchEngine<{
      querySet: string;
      querySuggest: string;
    }>;
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
    const partialItem = getPartialSearchBoxSuggestionElement(
      suggestion,
      this.bindings.i18n
    );

    return {
      ...partialItem,
      content: (
        <QuerySuggestionContainer>
          <QuerySuggestionIcon
            icon={this.icon || SearchIcon}
            hasSuggestion={this.bindings.getSuggestions().length > 1}
          />

          <QuerySuggestionText suggestion={suggestion} hasQuery={hasQuery} />
        </QuerySuggestionContainer>
      ),
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
