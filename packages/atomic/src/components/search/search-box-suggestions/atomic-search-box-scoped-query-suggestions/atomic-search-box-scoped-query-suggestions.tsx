import {
  buildFieldSuggestions,
  FieldSuggestions,
  FieldSuggestionsValue,
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
  tag: 'atomic-search-box-scoped-query-suggestions',
  shadow: true,
})
export class AtomicSearchBoxQuerySuggestions {
  private bindings!: SearchBoxSuggestionsBindings;
  private fieldSuggestions!: FieldSuggestions;
  @Element() private host!: HTMLElement;

  @State() public error!: Error;

  /**
   * The field by which suggestions will be provided.
   */
  @Prop({reflect: true}) public field?: string;

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

    this.fieldSuggestions = buildFieldSuggestions(engine, {
      options: {
        facet: {field: this.field ?? ''},
      },
    });

    return {
      position: Array.from(this.host.parentNode!.children).indexOf(this.host),
      onInput: () => {
        engine.dispatch(
          fetchQuerySuggestions({
            id: this.bindings.id,
          })
        );

        if (this.bindings.searchBoxController.state.suggestions.length) {
          this.fieldSuggestions.updateText(
            this.bindings.searchBoxController.state.suggestions[0].rawValue
          );
        }
      },
      renderItems: () => this.renderItems(),
    };
  }

  private renderItems(): SearchBoxSuggestionElement[] {
    const hasQuery = this.bindings.searchBoxController.state.value !== '';
    const max = hasQuery ? this.maxWithQuery : this.maxWithoutQuery;
    const suggestions: SearchBoxSuggestionElement[] = [];

    suggestions.push(
      ...this.bindings.searchBoxController.state.suggestions
        .slice(0, max)
        .map((suggestion) => this.renderItem(suggestion))
    );

    if (this.fieldSuggestions.state.values.length) {
      suggestions.splice(
        1,
        0,
        ...this.fieldSuggestions.state.values.map((s) =>
          this.renderFieldSuggestion(s)
        )
      );
    }

    return [
      ...this.bindings.searchBoxController.state.suggestions
        .slice(0, 1)
        .map((suggestion) => this.renderItem(suggestion)),
      ...this.fieldSuggestions.state.values.map((s) =>
        this.renderFieldSuggestion(s)
      ),
      ...this.bindings.searchBoxController.state.suggestions
        .slice(this.fieldSuggestions.state.values.length + 1, max)
        .map((suggestion) => this.renderItem(suggestion)),
    ];
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
            // deepcode ignore ReactSetInnerHtml: This is not React code, deepcode ignore DOMXSS: Value escaped in upstream code.
            <span
              part="query-suggestion-text"
              class="break-all line-clamp-2"
              // deepcode ignore ReactSetInnerHtml: This is not React code, deepcode ignore DOMXSS: Value escaped in upstream code.
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

  private renderFieldSuggestion(suggestion: FieldSuggestionsValue) {
    const querySuggestions =
      this.bindings.searchBoxController.state.suggestions;

    const topQuerySuggestion = querySuggestions.length
      ? querySuggestions[0]
      : null;

    return {
      part: 'query-suggestion-item',
      content: topQuerySuggestion && (
        <div part="field-suggestion-content" class="flex items-center">
          <span part="field-suggestion-text" class="break-all line-clamp-2">
            <span innerHTML={topQuerySuggestion.highlightedValue}></span> in{' '}
            {suggestion.rawValue}
          </span>
        </div>
      ),
      key: `qs-${encodeForDomAttribute(suggestion.rawValue)}`,
      query: suggestion.rawValue,
      ariaLabel: this.bindings.i18n.t('query-suggestion-label', {
        query: suggestion.rawValue,
        interpolation: {escapeValue: false},
      }),
      onSelect: () => {
        this.bindings.clearSuggestions();
        this.bindings.searchBoxController.updateText(
          this.fieldSuggestions.state.query
        );
        this.bindings.searchBoxController.submit();
        this.fieldSuggestions.select(suggestion);
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
