import {Component, Prop, State, h, Element} from '@stencil/core';
import {
  DateFacet,
  buildDateFacet,
  DateFacetState,
  DateFacetOptions,
  DateFacetValue,
  buildDateRange,
} from '@coveo/headless';
import {
  Bindings,
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {FacetValue} from '../facet-value/facet-value';
import {
  BaseFacet,
  BaseFacetController,
  BaseFacetState,
} from '../base-facet/base-facet';

@Component({
  tag: 'atomic-date-facet',
  styleUrl: 'atomic-date-facet.pcss',
  shadow: true,
})
export class AtomicDateFacet implements InitializableComponent, BaseFacetState {
  @Element() host!: HTMLElement;
  @InitializeBindings() public bindings!: Bindings;
  private facet!: DateFacet;

  @BindStateToController('facet', {subscribeOnConnectedCallback: true})
  @State()
  private facetState!: DateFacetState;
  @State() public error!: Error;

  @State() public isExpanded = false;
  @Prop({mutable: true, reflect: true}) public facetId = '';
  /**
   * Specifies the index field whose values the facet should use
   */
  @Prop() public field = '';
  /**
   * The displayed label for the facet
   */
  @Prop() public label = 'No label';
  /**
   * Whether or not the index should automatically generate options for the facet
   */
  @Prop() public generateAutomaticRanges = true;

  public buildOptions() {
    const options = Array.from(this.host.querySelectorAll('atomic-date-range'));
    return options.map(({start, end, endInclusive}) =>
      buildDateRange({start, end, endInclusive})
    );
  }

  public initialize() {
    const options: DateFacetOptions = {
      facetId: this.facetId,
      field: this.field,
      generateAutomaticRanges: this.generateAutomaticRanges,
      currentValues: this.buildOptions(),
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
      <FacetValue
        label={` ${item.start}-${item.end}`}
        isSelected={isSelected}
        numberOfResults={item.numberOfResults}
        facetValueSelected={() => {
          this.facet.toggleSelect(item);
        }}
      />
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
        <ul class="list-none p-0">{this.values}</ul>
      </BaseFacet>
    );
  }
}
