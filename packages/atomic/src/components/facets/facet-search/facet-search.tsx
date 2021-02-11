import {Component, h, Prop, State} from '@stencil/core';
import {BaseFacetSearchResult} from '@coveo/headless/dist/api/search/facet-search/base/base-facet-search-response';
import {
  CategoryFacet,
  CategoryFacetState,
  Facet,
  FacetState,
} from '@coveo/headless';
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

  public render() {
    return (
      <base-search
        id={this._id}
        moreValuesAvailable={this.facetState.facetSearch.moreValuesAvailable}
        strings={this.strings}
        hideSubmit={true}
        suggestionValues={(this.facetState.facetSearch
          .values as BaseFacetSearchResult[]).map(
          (value: BaseFacetSearchResult) => ({
            ...value,
            value: `<span class="label">${value.rawValue}</span>
          <span class="number-of-values">${value.count}</span>`,
          })
        )}
        onSelectValue={(e: CustomEvent<number>) => {
          const value = this.facetState.facetSearch.values[e.detail];
          this.facet.facetSearch.select(value as any);
        }}
        onTextChange={(event: CustomEvent<string>) => {
          this.facet.facetSearch.updateText(event.detail);
          this.facet.facetSearch.search();
        }}
        onShowMoreResults={() => this.facet.facetSearch.showMoreResults()}
      />
    );
  }
}
