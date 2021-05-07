import {h} from '@stencil/core';
import SearchIcon from 'coveo-styleguide/resources/icons/svg/search.svg';
import ClearIcon from 'coveo-styleguide/resources/icons/svg/clear.svg';
import {Combobox, ComboboxStrings} from '../../../utils/combobox';
import {Facet, CategoryFacet, CategoryFacetSearchResult} from '@coveo/headless';
import {randomID} from '../../../utils/utils';
import {sanitize} from '../../../utils/xss-utils';
import {regexEncode} from '../../../utils/string-utils';

type FacetSearchResult = CategoryFacetSearchResult;

export interface FacetSearchStrings extends ComboboxStrings {
  placeholder: () => string;
  noValuesFound: () => string;
  clear: () => string;
}

export interface FacetSearchComponent {
  strings: FacetSearchStrings;
  facet: Facet | CategoryFacet;
  renderSearchResult: (searchResult: FacetSearchResult) => HTMLLIElement[];
  ariaLabelForSearchResult: (searchResult: FacetSearchResult) => string;
}

export class FacetSearch {
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
      onChange: (value) => this.onChange(value),
      onSubmit: () => {},
      onSelectValue: (element) => {
        const value = (element as HTMLLIElement).value;
        this.onSelectValue(value);
      },
      onBlur: () => this.onBlur(),
      activeClass: 'active-search-result',
      activePartName: 'active-search-result',
    });
  }

  public static highlightSearchResult(resultValue: string, query: string) {
    const sanitizedResult = sanitize(resultValue);
    if (query.trim() === '') {
      return sanitizedResult;
    }

    const search = regexEncode(query);
    const regex = new RegExp(`(${search})`, 'i');
    return sanitize(resultValue).replace(
      regex,
      '<span class="font-normal">$1</span>'
    );
  }

  public updateCombobox() {
    this.combobox.updateAccessibilityAttributes();
  }

  private get facetSearchController() {
    return this.component.facet.facetSearch;
  }

  private get facetSearchState() {
    return this.component.facet.state.facetSearch;
  }

  private get facetSearchResults() {
    return this.component.facet.state.facetSearch.values as FacetSearchResult[];
  }

  private get strings() {
    return this.component.strings;
  }

  private set text(text: string) {
    this.facetSearchController.updateText(text);
  }

  private triggerSearch() {
    this.facetSearchController.search();
    this.scrollTop();
  }

  private onChange(value: string) {
    this.text = value;
    this.triggerSearch();
  }

  public onSelectValue(index: number) {
    this.facetSearchController.select(this.facetSearchResults[index]);
    this.text = '';
    this.inputRef.blur();
  }

  private onFocus() {
    this.triggerSearch();
  }

  private onBlur() {
    this.facetSearchController.clear();
    this.text = '';
  }

  private scrollTop() {
    this.valuesRef.scrollTo({top: 0});
  }

  private onScroll() {
    const scrollPixelBuffer = 50;
    const scrollEndReached =
      this.valuesRef.scrollTop + this.valuesRef.clientHeight >=
      this.valuesRef.scrollHeight - scrollPixelBuffer;

    if (this.facetSearchState.moreValuesAvailable && scrollEndReached) {
      this.facetSearchController.showMoreResults();
    }
  }

  private get isEmptyQuery() {
    return this.facetSearchState.query === '';
  }

  private get clearButton() {
    if (this.isEmptyQuery) {
      return;
    }

    return (
      <button
        type="button"
        part="search-input-clear-button"
        class="clear-button mr-2"
        aria-label={this.strings.clear()}
        onClick={() => {
          this.text = '';
          this.inputRef.focus();
          this.triggerSearch();
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
          'placeholder-on-background-variant flex-grow outline-none focus:outline-none mx-2'
        }
        placeholder={this.strings.placeholder()}
        value={this.facetSearchState.query}
      />
    );
  }

  private get resultList() {
    return this.facetSearchResults.map((searchResult, index) => (
      <li part="search-result" class="search-result">
        <button
          onClick={() => this.onSelectValue(index)}
          onMouseDown={(e) => e.preventDefault()}
          part="search-result-button"
          value={index}
          aria-label={this.component.ariaLabelForSearchResult(searchResult)}
        >
          {this.component.renderSearchResult(searchResult)}
        </button>
      </li>
    ));
  }

  private get showNoValuesFound() {
    return (
      this.facetSearchState.query !== '' &&
      !this.facetSearchResults.length &&
      !this.facetSearchState.isLoading
    );
  }

  private get noValuesFound() {
    if (this.showNoValuesFound) {
      return (
        <div part="search-no-results" class="search-results">
          {this.strings.noValuesFound()}
        </div>
      );
    }
  }

  private get searchResults() {
    return (
      <ul
        part="search-results"
        class="search-results"
        ref={(el) => (this.valuesRef = el as HTMLElement)}
        onScroll={() => this.onScroll()}
      >
        {this.resultList}
      </ul>
    );
  }

  private get inputWrapperClasses() {
    const isOpen =
      this.showNoValuesFound || this.facetSearchState.values.length;
    return (
      'input-wrapper flex flex-grow items-center border border-divider rounded-md ' +
      (isOpen ? 'rounded-br-none	rounded-bl-none' : '')
    );
  }

  public render() {
    return (
      <div class="combobox relative flex flex-grow mb-2 mt-3">
        <div
          class={this.inputWrapperClasses}
          ref={(el) => (this.containerRef = el as HTMLElement)}
        >
          <div
            part="search-icon"
            class={'ml-2 w-3 h-3 text-on-background-variant fill-current'}
            innerHTML={SearchIcon}
          />
          {this.input}
          {this.clearButton}
        </div>
        {this.noValuesFound}
        {this.searchResults}
      </div>
    );
  }
}
