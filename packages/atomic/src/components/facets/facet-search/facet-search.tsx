import {Component, Event, EventEmitter, h, Prop, State} from '@stencil/core';
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
  @Event() public selectValue!: EventEmitter<number>;

  @State()
  public strings: I18nState = {
    clear: () => 'clear',
    search: () => 'search',
    searchBox: () => 'searchbox',
    querySuggestionList: () => 'querySuggestionList',
  };

  private getSuggestionValue(value: BaseFacetSearchResult) {
    return `<span class="label">${value.rawValue}</span>
          <span class="number-of-values">${value.count}</span>`;
  }

  public render() {
    return (
      <base-search
        _id={this._id}
        moreValuesAvailable={this.facetState.facetSearch.moreValuesAvailable}
        strings={this.strings}
        hideSubmit={true}
        suggestionValues={(this.facetState.facetSearch
          .values as BaseFacetSearchResult[]).map((value) => ({
          ...value,
          value: this.getSuggestionValue(value),
        }))}
        onTextChange={(event: CustomEvent<string>) => {
          this.facet.facetSearch.updateText(event.detail);
          this.facet.facetSearch.search();
        }}
        onShowMoreResults={() => this.facet.facetSearch.showMoreResults()}
      />
    );
  }
}
