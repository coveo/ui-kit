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
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {FacetValue as FacetValueComponent} from '../facet-value/facet-value';
import {
  BaseFacet,
  BaseFacetController,
  BaseFacetState,
} from '../facet/base-facet';

@Component({
  tag: 'atomic-facet',
  styleUrl: 'atomic-facet.pcss',
  shadow: true,
})
export class AtomicFacet implements InitializableComponent, BaseFacetState {
  @InitializeBindings() public bindings!: Bindings;
  private facet!: Facet;

  @BindStateToController('facet', {subscribeOnConnectedCallback: true})
  @State()
  private facetState!: FacetState;
  @State() public error!: Error;

  @State() public isExpanded = false;
  @Prop({mutable: true, reflect: true}) public facetId = '';
  @Prop() public field = '';
  @Prop() public label = 'No label';

  public initialize() {
    const options: FacetOptions = {facetId: this.facetId, field: this.field};
    this.facet = buildFacet(this.bindings.engine, {options});
    this.facetId = this.facet.state.facetId;
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

  private onFacetSearch(e: CustomEvent<string>) {
    const facetSearch = this.facet.facetSearch;

    facetSearch.updateText(e.detail);
    facetSearch.search();
  }

  private get showMoreButton() {
    if (!this.facetState.canShowMoreValues) {
      return null;
    }

    return (
      <button onClick={() => this.facet.showMoreValues()}>show more</button>
    );
  }

  private get showLessButton() {
    if (!this.facetState.canShowLessValues) {
      return null;
    }

    return (
      <button onClick={() => this.facet.showLessValues()}>show less</button>
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
          <facet-search
            onFacetSearch={(e) => this.onFacetSearch(e)}
            facetSearchResults={this.facetState.facetSearch.values}
            moreValuesAvailable={
              this.facetState.facetSearch.moreValuesAvailable
            }
          />
          <ul class="list-none p-0">{this.values}</ul>
          <div>
            {this.showMoreButton}
            {this.showLessButton}
          </div>
        </div>
      </BaseFacet>
    );
  }
}
