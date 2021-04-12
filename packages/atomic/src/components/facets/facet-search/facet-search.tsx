import {h} from '@stencil/core';
import ClearIcon from 'coveo-styleguide/resources/icons/svg/clear.svg';
import {Combobox} from '../../../utils/combobox';
import {Bindings, I18nState} from '../../../utils/initialization-utils';
import {
  CategoryFacet,
  Facet,
  SpecificFacetSearchResult,
  CategoryFacetSearchResult,
} from '@coveo/headless';
import {randomID} from '../../../utils/utils';
import SearchIcon from 'coveo-styleguide/resources/icons/svg/search.svg';
import {sanitize} from '../../../utils/xss-utils';
import {regexEncode} from '../../../utils/string-utils';

type FacetSearchResult = SpecificFacetSearchResult &
  Partial<Pick<CategoryFacetSearchResult, 'path'>>;

const SEPARATOR = '/';
const ELLIPSIS = '...';
const PATH_MAX_LENGTH = 3;

export interface FacetSearchComponent {
  bindings: Bindings;
  strings: I18nState;
  facetSearchQuery: string;
  showFacetSearchResults: boolean;
  facet: Facet | CategoryFacet;
}

export class FacetSearch {
  private static ShowMoreResultsValue = -1;
  private inputRef!: HTMLInputElement;
  private valuesRef!: HTMLElement;
  private containerRef!: HTMLElement;
  private combobox: Combobox;

  constructor(public component: FacetSearchComponent) {
    this.combobox = new Combobox({
      id: randomID('facet-search'),
      strings: this.component.strings,
      containerRef: () => this.containerRef,
      inputRef: () => this.inputRef,
      valuesRef: () => this.valuesRef,
      onChange: (value) => {
        this.component.showFacetSearchResults = true;
        this.text = value;
      },
      onSubmit: () => {},
      onSelectValue: (element) => {
        const value = (element as HTMLLIElement).value;
        if (value === FacetSearch.ShowMoreResultsValue) {
          return this.facetSearch.showMoreResults();
        }
        this.onSelectValue(this.values[value]);
      },
      onBlur: () => (this.component.showFacetSearchResults = false),
      activeClass: 'active',
      activePartName: 'active-suggestion',
    });
  }

  public updateCombobox() {
    this.combobox.updateAccessibilityAttributes();
  }

  private get facetSearch() {
    return this.component.facet.facetSearch;
  }

  private get facetSearchState() {
    return this.component.facet.state.facetSearch;
  }

  private get values(): FacetSearchResult[] {
    return this.component.facet.state.facetSearch.values;
  }

  private get strings() {
    return this.component.strings;
  }

  private set text(text: string) {
    this.component.facetSearchQuery = text;
    this.facetSearch.updateText(text);
    this.facetSearch.search();
  }

  private onSelectValue(value: FacetSearchResult) {
    this.facetSearch.select(value as CategoryFacetSearchResult);
    this.text = '';
    this.combobox.onInputBlur();
  }

  private onFocus() {
    this.component.showFacetSearchResults = true;
    if (this.values.length === 0) {
      this.facetSearch.search();
    }
  }

  private get clearButton() {
    if (this.component.facetSearchQuery === '') {
      return null;
    }

    return (
      <button
        type="button"
        part="search-input-clear-button"
        class="clear-button mr-2"
        onClick={() => {
          this.text = '';
          this.inputRef.focus();
        }}
      >
        <div
          innerHTML={ClearIcon}
          class="text-on-background fill-current h-2.5 w-2.5"
        />
      </button>
    );
  }

  private get input() {
    return (
      <input
        part="search-input"
        ref={(el) => (this.inputRef = el as HTMLInputElement)}
        onFocus={() => this.onFocus()}
        onBlur={() => this.combobox.onInputBlur()}
        onInput={(e) => this.combobox.onInputChange(e)}
        onKeyUp={(e) => this.combobox.onInputKeyup(e)}
        onKeyDown={(e) => this.combobox.onInputKeydown(e)}
        type="text"
        class={
          'search-input placeholder-on-background-variant flex-grow outline-none focus:outline-none mx-2'
        }
        placeholder={this.strings.placeholder()}
        value={this.component.facetSearchQuery}
      />
    );
  }

  private highlightSuggestion(suggestion: string) {
    const sanitizedSuggestion = sanitize(suggestion);
    if (this.component.facetSearchQuery.trim() === '') {
      return sanitizedSuggestion;
    }

    const search = regexEncode(this.component.facetSearchQuery);
    const regex = new RegExp(`(${search})`, 'ig');
    return sanitize(suggestion).replace(regex, '<b>$1</b>');
  }

  private get suggestionClasses() {
    return 'suggestion cursor-pointer px-2 py-1 text-sm';
  }

  private get suggestions() {
    return this.values.map((suggestion, index) => (
      <li
        onClick={() => this.onSelectValue(suggestion)}
        onMouseDown={(e) => e.preventDefault()}
        part="suggestion"
        class={`${this.suggestionClasses} flex flex-col justify-center`}
        value={index}
        aria-label={this.suggestionLabel(suggestion)}
      >
        <div class="flex" aria-hidden>
          <span
            class="whitespace-nowrap overflow-ellipsis overflow-hidden"
            innerHTML={this.highlightSuggestion(suggestion.displayValue)}
          />
          <span class="number-of-values ml-1 text-on-background-variant">
            (
            {suggestion.count.toLocaleString(
              this.component.bindings.i18n.language
            )}
            )
          </span>
        </div>
        {suggestion.path && (
          <div
            class="flex text-on-background-variant"
            aria-hidden
            title={suggestion.path.join(SEPARATOR)}
          >
            {this.renderPath(suggestion.path)}
          </div>
        )}
      </li>
    ));
  }

  private suggestionLabel(suggestion: FacetSearchResult) {
    const facetValue = this.strings.facetValue({
      numberOfResults: suggestion.count,
      value: suggestion.displayValue,
    });

    if (!suggestion.path) {
      return facetValue;
    }

    return this.strings.under({
      child: facetValue,
      parent: suggestion.path.length
        ? suggestion.path.join(', ')
        : this.strings.allCategories(),
    });
  }

  private renderPath(path: string[]) {
    const ellipsisClasses =
      'whitespace-nowrap overflow-ellipsis overflow-hidden';

    if (!path.length) {
      return (
        <span
          class={ellipsisClasses}
        >{`${this.strings.pathPrefix()} ${this.strings.allCategories()}`}</span>
      );
    }

    return [
      <span class="mr-1">{this.strings.pathPrefix()}</span>,
      this.pathToRender(path).map((part, index) => [
        index > 0 && <span>{SEPARATOR}</span>,
        <span
          class={part === ELLIPSIS ? '' : `${ellipsisClasses} flex-1 max-w-max`}
        >
          {part}
        </span>,
      ]),
    ];
  }

  private pathToRender(path: string[]) {
    if (path.length <= PATH_MAX_LENGTH) {
      return path;
    }
    const firstPart = path.slice(0, 1);
    const lastParts = path.slice(-PATH_MAX_LENGTH + 1);
    return firstPart.concat(ELLIPSIS, ...lastParts);
  }

  private get showMoreSearchResults() {
    if (!this.facetSearchState.moreValuesAvailable) {
      return null;
    }

    return (
      <li
        onClick={() => this.facetSearch.showMoreResults()}
        onMouseDown={(e) => e.preventDefault()}
        part="show-more"
        class={`${this.suggestionClasses} text-primary`}
        value={FacetSearch.ShowMoreResultsValue}
      >
        <button onMouseDown={(e) => e.preventDefault()}>
          {this.strings.showMore()}
        </button>
      </li>
    );
  }

  private get suggestionList() {
    const showResults = this.component.showFacetSearchResults;
    return (
      <ul
        part="suggestions"
        class={
          'suggestions z-10 absolute w-full bg-background border-divider-t-0 empty:border-none rounded-b ' +
          (showResults ? 'block' : 'hidden')
        }
        ref={(el) => (this.valuesRef = el as HTMLElement)}
      >
        {this.suggestions}
        {this.showMoreSearchResults}
      </ul>
    );
  }

  private get inputWrapperClasses() {
    const hasValues =
      this.facetSearchState.values.length > 0 &&
      this.component.showFacetSearchResults;

    return (
      'input-wrapper flex flex-grow items-center apply-border-divider rounded ' +
      (hasValues ? 'rounded-br-none	rounded-bl-none' : '')
    );
  }

  public render() {
    return (
      <div class="combobox relative flex flex-grow">
        <div
          class={this.inputWrapperClasses}
          ref={(el) => (this.containerRef = el as HTMLElement)}
        >
          <div
            class={'ml-2 w-3 h-3 text-on-background-variant fill-current'}
            innerHTML={SearchIcon}
          />
          {this.input}
          {this.clearButton}
        </div>
        {this.suggestionList}
      </div>
    );
  }
}
