import {Component, Prop, State, h} from '@stencil/core';
import {
  DateFacet,
  buildDateFacet,
  DateFacetState,
  DateFacetOptions,
  DateFacetValue,
} from '@coveo/headless';
import {
  Bindings,
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';

@Component({
  tag: 'atomic-date-facet',
  styleUrl: 'atomic-date-facet.pcss',
  shadow: true,
})
export class AtomicDateFacet implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  private facet!: DateFacet;

  @BindStateToController('facet', {subscribeOnConnectedCallback: true})
  @State()
  private facetState!: DateFacetState;
  @State() public error!: Error;

  @Prop({mutable: true, reflect: true}) public facetId = '';
  @Prop() public field = '';
  @Prop() public label = 'No label';

  public initialize() {
    const options: DateFacetOptions = {
      facetId: this.facetId,
      field: this.field,
      generateAutomaticRanges: true,
    };

    this.facet = buildDateFacet(this.bindings.engine, {options});
    this.facetId = this.facet.state.facetId;
  }

  private get values() {
    return this.facetState.values.map((listItem) =>
      this.buildListItem(listItem)
    );
  }

  private buildListItem(item: DateFacetValue) {
    const isSelected = this.facet.isValueSelected(item);

    return (
      <facet-value
        label={` ${item.start}-${item.end}`}
        isSelected={isSelected}
        numberOfResults={item.numberOfResults}
        onFacetValueSelected={() => {
          this.facet.toggleSelect(item);
        }}
      />
    );
  }

  public render() {
    return (
      <base-facet
        label={this.label}
        hasActiveValues={this.facetState.hasActiveValues}
        onDeselectAll={() => this.facet.deselectAll()}
      >
        <ul class="list-none p-0">{this.values}</ul>
      </base-facet>
    );
  }
}
