import {Component, h, State, Prop} from '@stencil/core';
import {
  Facet,
  buildFacet,
  FacetState,
  FacetOptions,
  FacetValue,
} from '@coveo/headless';
import {
  Bindings,
  BindStateToController,
  BindStateToI18n,
  I18nState,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {FacetValue as FacetValueComponent} from '../facet-value/facet-value';
import {
  BaseFacet,
  BaseFacetController,
  BaseFacetState,
} from '../base-facet/base-facet';
import {
  FacetSearch,
  FacetSearchController,
  FacetSearchState,
} from '../facet-search/facet-search';

@Component({
  tag: 'atomic-facet',
  styleUrl: 'atomic-facet.pcss',
  shadow: true,
})
export class AtomicFacet
  implements InitializableComponent, FacetSearchState, BaseFacetState {
  @InitializeBindings() public bindings!: Bindings;
  public facet!: Facet;
  private facetSearchProps = {
    controller: new FacetSearchController(this),
  };
  private facetSearch!: FacetSearch;
  @BindStateToController('facet', {subscribeOnConnectedCallback: true})
  @State()
  public facetState!: FacetState;
  @State() public error!: Error;

  @BindStateToI18n()
  @State()
  public strings: I18nState = {
    clear: () => this.bindings.i18n.t('clear'),
    searchBox: () => this.bindings.i18n.t('facetSearch'),
    querySuggestionList: () => this.bindings.i18n.t('querySuggestionList'),
    showMore: () => this.bindings.i18n.t('showMore'),
    showLess: () => this.bindings.i18n.t('showLess'),
  };

  @State() public isExpanded = false;
  @State() public facetSearchQuery = '';
  @State() public showFacetSearchResults = false;

  /**
   * The field whose values you want to display in the facet.
   */
  @Prop() public field = '';
  /**
   * The displayed label for the facet.
   */
  @Prop() public label = 'No label';
  /**
   * The character that separates values of a multi-value field
   */
  @Prop() public delimitingCharacter?: string;
  /**
   * The number of values to request for this facet. Also determines the number of additional values to request each time this facet is expanded, and the number of values to display when this facet is collapsed.
   */
  @Prop() public numberOfValues = 10;

  public initialize() {
    const options: FacetOptions = {
      field: this.field,
      delimitingCharacter: this.delimitingCharacter,
      numberOfValues: this.numberOfValues,
    };
    this.facet = buildFacet(this.bindings.engine, {options});
    this.facetSearch = new FacetSearch(this.facetSearchProps);
  }

  componentDidRender() {
    this.facetSearch.updateCombobox();
  }

  private get values() {
    return this.facetState.values.map((listItem) =>
      this.buildListItem(listItem)
    );
  }

  private buildListItem(item: FacetValue) {
    const isSelected = this.facet.isValueSelected(item);
    return (
      <FacetValueComponent
        label={`${item.value}`}
        isSelected={isSelected}
        numberOfResults={item.numberOfResults}
        facetValueSelected={() => {
          this.facet.toggleSelect(item);
        }}
      />
    );
  }

  private get showMoreButton() {
    if (!this.facetState.canShowMoreValues) {
      return null;
    }

    return (
      <button onClick={() => this.facet.showMoreValues()}>
        {this.strings.showMore()}
      </button>
    );
  }

  private get showLessButton() {
    if (!this.facetState.canShowLessValues) {
      return null;
    }

    return (
      <button onClick={() => this.facet.showLessValues()}>
        {this.strings.showLess()}
      </button>
    );
  }

  public render() {
    return (
      <BaseFacet
        controller={new BaseFacetController(this)}
        label={this.label}
        hasActiveValues={this.facetState.hasActiveValues}
        deselectAll={() => this.facet.deselectAll()}
      >
        <div>
          {this.facetSearch.render()}
          <ul class="list-none p-0">{this.values}</ul>
          <div class="space-y-1">
            {this.showMoreButton}
            {this.showLessButton}
          </div>
        </div>
      </BaseFacet>
    );
  }
}
