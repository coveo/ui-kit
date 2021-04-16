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
  showMore: () => string;
}

export interface FacetSearchComponent {
  strings: FacetSearchStrings;
  facetSearchQuery: string;
  showFacetSearchResults: boolean;
  facet: Facet | CategoryFacet;
  renderSearchResult: (searchResult: FacetSearchResult) => HTMLLIElement[];
  ariaLabelForSearchResult: (searchResult: FacetSearchResult) => string;
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
          return this.facetSearchController.showMoreResults();
        }
        this.onSelectValue(value);
      },
      onBlur: () => (this.component.showFacetSearchResults = false),
      activeClass: 'active',
      activePartName: 'active-search-result',
    });
  }

  public static highlightSearchResult(resultValue: string, query: string) {
    const sanitizedResult = sanitize(resultValue);
    if (query.trim() === '') {
      return sanitizedResult;
    }

    const search = regexEncode(query);
    const regex = new RegExp(`(${search})`, 'ig');
    return sanitize(resultValue).replace(regex, '<b>$1</b>');
  }

  public static get searchResultClasses() {
    return 'search-result cursor-pointer px-2 py-1 text-sm flex flex-col justify-center';
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
    this.component.facetSearchQuery = text;
    this.facetSearchController.updateText(text);
    this.facetSearchController.search();
  }

  public onSelectValue(index: number) {
    this.facetSearchController.select(this.facetSearchResults[index]);
    this.text = '';
    this.combobox.onInputBlur();
  }

  private onFocus() {
    this.component.showFacetSearchResults = true;
    if (this.facetSearchState.values.length === 0) {
      this.facetSearchController.search();
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

  private get showMoreSearchResults() {
    if (!this.facetSearchState.moreValuesAvailable) {
      return null;
    }

    return (
      <li
        onClick={() => this.facetSearchController.showMoreResults()}
        onMouseDown={(e) => e.preventDefault()}
        part="show-more"
        class={`${FacetSearch.searchResultClasses} text-primary`}
        value={FacetSearch.ShowMoreResultsValue}
      >
        <button onMouseDown={(e) => e.preventDefault()}>
          {this.strings.showMore()}
        </button>
      </li>
    );
  }

  private get resultList() {
    return this.facetSearchResults.map((searchResult, index) => (
      <li
        onClick={() => this.onSelectValue(index)}
        onMouseDown={(e) => e.preventDefault()}
        part="search-result"
        class={FacetSearch.searchResultClasses}
        value={index}
        aria-label={this.component.ariaLabelForSearchResult(searchResult)}
      >
        {this.component.renderSearchResult(searchResult)}
      </li>
    ));
  }

  private get searchResults() {
    const showResults = this.component.showFacetSearchResults;
    return (
      <ul
        part="search-results"
        class={
          'search-results z-10 absolute w-full bg-background border-divider-t-0 empty:border-none rounded-b ' +
          (showResults ? 'block' : 'hidden')
        }
        ref={(el) => (this.valuesRef = el as HTMLElement)}
      >
        {this.resultList}
        {this.showMoreSearchResults}
      </ul>
    );
  }

  private get inputWrapperClasses() {
    const hasValues =
      this.facetSearchState.values.length > 0 &&
      this.component.showFacetSearchResults;

    return (
      'input-wrapper flex flex-grow items-center border border-divider rounded ' +
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
        {this.searchResults}
      </div>
    );
  }
}
