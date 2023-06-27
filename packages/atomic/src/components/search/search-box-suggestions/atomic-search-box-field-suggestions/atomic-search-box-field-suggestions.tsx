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
//import SearchIcon from '../../../../images/search.svg';
import {encodeForDomAttribute} from '../../../../utils/string-utils';
import {
  dispatchSearchBoxSuggestionsEvent,
  SearchBoxSuggestionElement,
  SearchBoxSuggestions,
  SearchBoxSuggestionsBindings,
} from '../suggestions-common';

/**
 * The `atomic-search-box-field-suggestions` component can be added as a child of an `atomic-search-box` component, allowing for the configuration of query suggestion behavior.
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
   * The field that does the thing
   */
  @Prop({reflect: true}) public field?: string;

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
      console.log('THIS IS A TEST');
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

  // private renderIcon() {
  //   return this.icon || SearchIcon;
  // }

  private renderItems(): SearchBoxSuggestionElement[] {
    const suggestions = this.fieldSuggestions.state.values;
    const hasQuery = this.bindings.searchBoxController.state.value !== '';
    const max = hasQuery ? this.maxWithQuery : this.maxWithoutQuery;
    console.log(suggestions);
    return suggestions
      .slice(0, max)
      .map((suggestion) => this.renderItem(suggestion));
  }

  private renderItem(suggestion: FieldSuggestionsValue) {
    //const hasQuery = this.bindings.searchBoxController.state.value !== '';
    return {
      part: 'field-suggestion-item',
      content: (
        <div part="field-suggestion-content" class="flex items-center">
          <span part="field-suggestion-text" class="break-all line-clamp-2">
            Test - {suggestion.rawValue}
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
