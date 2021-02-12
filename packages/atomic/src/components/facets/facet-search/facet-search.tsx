import {Component, Event, EventEmitter, h, Prop, State} from '@stencil/core';
import {BaseFacetSearchResult} from '@coveo/headless/dist/api/search/facet-search/base/base-facet-search-response';
import {
  CategoryFacet,
  CategoryFacetState,
  Facet,
  FacetState,
} from '@coveo/headless';
import {randomID} from '../../../utils/utils';
import {
  Bindings,
  BindStateToI18n,
  I18nState,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';

@Component({
  tag: 'facet-search',
  styleUrl: 'facet-search.pcss',
  shadow: false,
})
export class FacetSearch implements InitializableComponent {
  @State() public searchValue = '';
  @Prop() public facet!: Facet | CategoryFacet;
  @Prop() public facetState!: FacetState | CategoryFacetState;
  @Prop({reflect: true, attribute: 'data-id'}) public _id = randomID(
    'atomic-facet-search-'
  );
  @Event() public selectValue!: EventEmitter<number>;

  @InitializeBindings() public bindings!: Bindings;
  @State() public error!: Error;

  @BindStateToI18n()
  @State()
  public strings: I18nState = {
    clear: () => this.bindings.i18n.t('clear'),
    search: () => this.bindings.i18n.t('search'),
    searchBox: () => this.bindings.i18n.t('searchBox'),
    querySuggestionList: () => this.bindings.i18n.t('querySuggestionList'),
  };

  private static getSuggestionValue(value: BaseFacetSearchResult) {
    return `<span class="label">${value.rawValue}</span>
          <span class="number-of-values">${value.count}</span>`;
  }

  public render() {
    return (
      <base-search
        _id={this._id}
        strings={this.strings}
        value={this.searchValue}
        moreValuesAvailable={this.facetState.facetSearch.moreValuesAvailable}
        hideSubmitButton={true}
        suggestionValues={(this.facetState.facetSearch
          .values as BaseFacetSearchResult[]).map((value) => ({
          ...value,
          value: FacetSearch.getSuggestionValue(value),
        }))}
        onClear={() => {
          this.searchValue = '';
          this.facet.facetSearch.updateText('');
          this.facet.facetSearch.search();
        }}
        onTextChange={(event: CustomEvent<string>) => {
          this.searchValue = event.detail;
          this.facet.facetSearch.updateText(event.detail);
          this.facet.facetSearch.search();
        }}
        onShowMoreResults={() => this.facet.facetSearch.showMoreResults()}
        onHideSuggestions={() => this.facet.facetSearch.clearResults()}
        onShowSuggestions={() => this.facet.facetSearch.search()}
      />
    );
  }
}
