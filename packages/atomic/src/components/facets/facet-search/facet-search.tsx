import {Component, Event, EventEmitter, h, Prop} from '@stencil/core';
import {BaseFacetSearchResult} from '@coveo/headless/dist/api/search/facet-search/base/base-facet-search-response';

@Component({
  tag: 'facet-search',
  shadow: false,
})
export class FacetSearch {
  @Event() public resultSelected!: EventEmitter<BaseFacetSearchResult>;
  @Event() public showMoreResults!: EventEmitter<void>;
  @Event() public facetSearch!: EventEmitter<string>;
  @Prop() public facetSearchResults!: BaseFacetSearchResult[];
  @Prop() public moreValuesAvailable!: boolean;

  private get facetSearchInput() {
    return (
      <input
        onInput={(e) =>
          this.facetSearch.emit((e.target as HTMLInputElement).value)
        }
        class="apply-border-on-background-variant w-full rounded"
      />
    );
  }

  private get facetSearchResultList() {
    return this.facetSearchResults.map((searchResult) => (
      <div onClick={() => this.resultSelected.emit(searchResult)}>
        {searchResult.displayValue} {searchResult.count}
      </div>
    ));
  }

  private get showMoreSearchResults() {
    if (!this.moreValuesAvailable) {
      return null;
    }

    return (
      <button onClick={() => this.showMoreResults.emit()}>show more</button>
    );
  }

  public render() {
    return (
      <div>
        {this.facetSearchInput}
        {this.facetSearchResultList}
        {this.showMoreSearchResults}
      </div>
    );
  }
}
