import {Component, h, Prop, State} from '@stencil/core';
import {BaseFacetSearchResult} from '@coveo/headless/dist/api/search/facet-search/base/base-facet-search-response';
import {
  CategoryFacet,
  CategoryFacetState,
  Facet,
  FacetState,
} from '@coveo/headless';
import {CategoryFacetSearchResult} from '@coveo/headless/dist/api/search/facet-search/category-facet-search/category-facet-search-response';
import {Combobox} from '../../../utils/combobox';
import {randomID} from '../../../utils/utils';
import {I18nState} from '../../../utils/initialization-utils';

@Component({
  tag: 'facet-search',
  styleUrl: 'facet-search.pcss',
  shadow: false,
})
export class FacetSearch {
  @Prop() public facet!: Facet | CategoryFacet;
  @Prop() public facetState!: FacetState | CategoryFacetState;
  @Prop({reflect: true, attribute: 'data-id'}) public _id = randomID(
    'atomic-facet-search-'
  );

  @State()
  public strings: I18nState = {
    clear: () => 'clear',
    search: () => 'search',
    searchBox: () => 'searchbox',
    querySuggestionList: () => 'querySuggestionList',
  };

  private inputRef!: HTMLInputElement;
  private valuesRef!: HTMLElement;
  private containerRef!: HTMLElement;
  private combobox!: Combobox;

  constructor() {
    this.combobox = new Combobox({
      id: this._id,
      strings: this.strings,
      containerRef: () => this.containerRef,
      inputRef: () => this.inputRef,
      valuesRef: () => this.valuesRef,
      onChange: (value) => {
        this.facet.facetSearch.updateText(value);
        this.facet.facetSearch.search();
      },
      onSubmit: () => {},
      onSelectValue: (element) => {
        this.facet.facetSearch.select(
          // @ts-ignore
          this.facetState.facetSearch.values[(element as HTMLLIElement).value]
        );
      },
      onBlur: () => {
        // setTimeout(() => this.searchBox.hideSuggestions(), 100);
      },
      activeClass: 'active',
      activePartName: 'active-suggestion',
    });
  }

  public componentDidRender() {
    this.combobox.updateAccessibilityAttributes();
  }

  private get facetSearchInput() {
    return (
      <input
        onInput={(e) => {
          this.facet.facetSearch.updateText(
            (e.target as HTMLInputElement).value
          );
          this.facet.facetSearch.search();
        }}
        onBlur={() => this.combobox.onInputBlur()}
        onKeyUp={(e) => this.combobox.onInputKeyup(e)}
        onKeyDown={(e) => this.combobox.onInputKeydown(e)}
        ref={(el) => (this.inputRef = el as HTMLInputElement)}
        class="search-input px-1 apply-border-on-background w-full rounded focus:outline-none focus-within:rounded-b-none"
      />
    );
  }

  private get facetSearchResultList() {
    return (this.facetState.facetSearch.values as BaseFacetSearchResult[]).map(
      (searchResult: BaseFacetSearchResult | CategoryFacetSearchResult) => {
        return (
          <li
            class="suggestion cursor-pointer flex flex-row h-5 items-center px-1 text-sm"
            onClick={() => {
              // @ts-ignore
              this.facet.facetSearch.select(searchResult);
            }}
          >
            <span class="font-semibold">{searchResult.displayValue}</span>
            <span class="ml-auto">{searchResult.count}</span>
          </li>
        );
      }
    );
  }

  private get showMoreSearchResults() {
    if (!this.facetState.facetSearch.moreValuesAvailable) {
      return null;
    }

    return (
      <button class="px-1 text-primary" onClick={() => this.facet.facetSearch.showMoreResults()}>
        show more
      </button>
    );
  }

  public render() {
    return (
      <div
        class="w-full relative"
        ref={(el) => (this.containerRef = el as HTMLElement)}
      >
        <div>{this.facetSearchInput}</div>
        <div
          class={
            'suggestion-list ' +
            (this.facetState.facetSearch.values.length > 0
              ? 'border-t-0 apply-border-on-background rounded-b'
              : 'border-none')
          }
        >
          <ul ref={(el) => (this.valuesRef = el as HTMLElement)}>
            {this.facetSearchResultList}
          </ul>
          {this.showMoreSearchResults}
        </div>
      </div>
    );
  }
}
