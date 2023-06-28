import {
  buildFieldSuggestions,
  FieldSuggestions,
  FieldSuggestionsValue,
  SearchEngine,
} from '@coveo/headless';
import {
  QuerySetSection,
  QuerySuggestionSection,
} from '@coveo/headless/dist/definitions/state/state-sections';
import {Component, Element, Prop, State, h} from '@stencil/core';
import {encodeForDomAttribute} from '../../../../utils/string-utils';
import {
  dispatchSearchBoxSuggestionsEvent,
  SearchBoxSuggestionElement,
  SearchBoxSuggestions,
  SearchBoxSuggestionsBindings,
} from '../suggestions-common';

/**
 * The `atomic-search-box-field-suggestions` component can be added as a child of an `atomic-search-box-query-suggestions` component, allowing for the configuration of field suggestion behavior.
 * THIS IS THE INTENDED USE CASE! I HAVEN'T ACTUALLY BEEN ABLE TO MAKE THIS WORK... YET!
 * FOR NOW, THIS COMPONENT IS A CHILD OF THE `atomic-search-box`
 */
@Component({
  tag: 'atomic-search-box-field-suggestions',
  shadow: true,
})
export class AtomicSearchBoxFieldSuggestions {
  private bindings!: SearchBoxSuggestionsBindings;
  private fieldSuggestions!: FieldSuggestions;
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
   * The field by which suggestions will be provided.
   */
  @Prop({reflect: true}) public field?: string;

  /**
   * The maximum number of field suggestions that will be displayed if the user has typed something into the input field.
   */
  @Prop({reflect: true}) public maxWithQuery?: number = 2;

  /**
   * The maximum number of field suggestions that will be displayed initially when the input field is empty.
   */
  @Prop({reflect: true}) public maxWithoutQuery?: number = 0;

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

  private initialize(): SearchBoxSuggestions {
    const engine = this.bindings.engine as SearchEngine<
      QuerySuggestionSection & QuerySetSection
    >;

    this.fieldSuggestions = buildFieldSuggestions(engine, {
      options: {
        facet: {field: this.field ?? ''},
      },
    });

    return {
      position: Array.from(this.host.parentNode!.children).indexOf(this.host),
      onInput: () => this.onInput(),
      renderItems: () => this.renderItems(),
    };
  }

  onInput() {
    const queryString = this.bindings.searchBoxController.state.value;
    if (queryString === '') {
      this.fieldSuggestions.clear();
      return;
    }
    this.fieldSuggestions.updateText(queryString);
  }

  private renderItems(): SearchBoxSuggestionElement[] {
    const suggestions = this.fieldSuggestions.state.values;
    const hasQuery = this.bindings.searchBoxController.state.value !== '';
    const max = hasQuery ? this.maxWithQuery : this.maxWithoutQuery;

    return suggestions
      .slice(0, max)
      .map((suggestion) => this.renderItem(suggestion));
  }

  private renderItem(suggestion: FieldSuggestionsValue) {
    const querySuggestions =
      this.bindings.searchBoxController.state.suggestions;

    const topQuerySuggestion = querySuggestions.length
      ? querySuggestions[0]
      : null;

    return {
      part: 'field-suggestion-item',
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
        if (topQuerySuggestion) {
          // Ideally, we would also select the query suggestion here, but I haven't found a way to do both without Headless throwing a temper tantrum.
          this.fieldSuggestions.select(suggestion);
        }
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
