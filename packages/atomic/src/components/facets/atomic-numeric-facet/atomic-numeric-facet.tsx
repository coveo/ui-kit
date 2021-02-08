import {Component, h, Prop, State} from '@stencil/core';
import {
  NumericFacet,
  buildNumericFacet,
  buildNumericRange,
  NumericFacetState,
  NumericFacetOptions,
  NumericFacetValue,
} from '@coveo/headless';
import {
  Bindings,
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';

@Component({
  tag: 'atomic-numeric-facet',
  styleUrl: 'atomic-numeric-facet.pcss',
  shadow: true,
})
export class AtomicNumericFacet implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  private facet!: NumericFacet;

  @BindStateToController('facet', {subscribeOnConnectedCallback: true})
  @State()
  private facetState!: NumericFacetState;
  @State() public error!: Error;
  @State() public isExpanded: Boolean = false;
  @Prop({mutable: true}) public facetId = '';
  @Prop() public field = '';
  @Prop() public label = 'No label';

  public initialize() {
    const options: NumericFacetOptions = {
      facetId: this.facetId,
      field: this.field,
      generateAutomaticRanges: false,
      currentValues: [
        buildNumericRange({start: 0, end: 20}),
        buildNumericRange({start: 20, end: 40}),
        buildNumericRange({start: 40, end: 60}),
        buildNumericRange({start: 60, end: 80}),
        buildNumericRange({start: 80, end: 100}),
      ],
    };

    this.facet = buildNumericFacet(this.bindings.engine, {options});
    this.facetId = this.facet.state.facetId;
  }

  private get values() {
    return this.facetState.values.map((listItem) =>
      this.buildListItem(listItem)
    );
  }

  private buildListItem(item: NumericFacetValue) {
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
