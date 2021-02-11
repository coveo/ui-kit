import {Component, h, State, Prop} from '@stencil/core';
import {
  Facet,
  buildFacet,
  FacetState,
  FacetValue,
  FacetOptions,
} from '@coveo/headless';
import {
  Bindings,
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';

@Component({
  tag: 'atomic-facet',
  styleUrl: 'atomic-facet.pcss',
  shadow: true,
})
export class AtomicFacet implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  private facet!: Facet;

  @BindStateToController('facet', {subscribeOnConnectedCallback: true})
  @State()
  private facetState!: FacetState;
  @State() public error!: Error;
  @State() public isExpanded: Boolean = false;

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
      <facet-value
        label={`${item.value}`}
        isSelected={isSelected}
        numberOfResults={item.numberOfResults}
        onFacetValueSelected={() => {
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
      <base-facet
        label={this.label}
        hasActiveValues={this.facetState.hasActiveValues}
        onDeselectAll={() => this.facet.deselectAll()}
      >
        <div>
          <facet-search
            facet={this.facet}
            facetState={this.facetState}
            onSelectValue={(e: CustomEvent<number>) => {
              const value = this.facetState.facetSearch.values[e.detail];
              this.facet.facetSearch.select(value);
            }}
          />
          <ul class="list-none p-0">{this.values}</ul>
          <div>
            {this.showMoreButton}
            {this.showLessButton}
          </div>
        </div>
      </base-facet>
    );
  }
}
