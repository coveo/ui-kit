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
  BindStateToI18n,
  I18nState,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {FacetValue} from '../facet-value/facet-value';
import {
  BaseFacet,
  BaseFacetController,
  BaseFacetState,
} from '../base-facet/base-facet';

/**
 * A facet who's values are expressed as date ranges. It is displayed as a regular facet in desktop browsers and as
 * a button which opens a facet modal in mobile browsers.
 *
 * @part facet - The wrapping div for the entire facet
 * @part facet-values - The list of facet values
 * @part facet-value - A single facet value
 * @part close-button - The button to close the facet when displayed modally (mobile only)
 * @part reset-button - The button that resets the actively selected facet values
 *
 */
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

  @BindStateToI18n()
  @State()
  public strings: I18nState = {};

  @State() public isExpanded = false;
  @Prop({mutable: true, reflect: true}) public facetId = '';
  /**
   * Specifies the index field whose values the facet should use
   */
  @Prop() public field = '';
  /**
   * The non-localized label for the facet
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
    this.strings[this.label] = () => this.bindings.i18n.t(this.label);
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
        label={this.strings[this.label]()}
        hasActiveValues={this.facetState.hasActiveValues}
        deselectAll={() => this.facet.deselectAll()}
      >
        <ul class="list-none p-0">{this.values}</ul>
      </BaseFacet>
    );
  }
}
