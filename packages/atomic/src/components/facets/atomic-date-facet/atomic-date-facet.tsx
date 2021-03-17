import {Component, Prop, State, h, Element} from '@stencil/core';
import dayjs from 'dayjs';

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
  public strings: I18nState = {
    clear: () => this.bindings.i18n.t('clear'),
    facetValue: (variables) => this.bindings.i18n.t('facetValue', variables),
    to: (variables) => this.bindings.i18n.t('to', variables),
  };

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
   * The format that the date will be displayed in. See https://day.js.org/docs/en/display/format for formatting details.
   */
  @Prop() public dateFormat = 'DD/MM/YYYY';

  private buildManualRanges() {
    const options = Array.from(this.host.querySelectorAll('atomic-date-range'));
    return options.map(({start, end, endInclusive}) =>
      buildDateRange({start, end, endInclusive})
    );
  }

  public initialize() {
    const manualRanges = this.buildManualRanges();
    const options: DateFacetOptions = {
      facetId: this.facetId,
      field: this.field,
      generateAutomaticRanges: manualRanges.length === 0,
      currentValues: manualRanges,
    };
    this.strings[this.label] = () => this.bindings.i18n.t(this.label);
    this.facet = buildDateFacet(this.bindings.engine, {options});
    this.facetId = this.facet.state.facetId;
    this.bindings.store.state.facets[this.facetId] = {
      label: this.label,
      formatting: this.dateFormat,
    };
  }

  private get values() {
    return this.facetState.values.map((listItem) => {
      if (!listItem.numberOfResults && !this.facet.isValueSelected(listItem)) {
        return null;
      }
      return this.buildListItem(listItem);
    });
  }

  private buildListItem(item: DateFacetValue) {
    const isSelected = this.facet.isValueSelected(item);
    const start = dayjs(item.start).format(this.dateFormat);
    const end = dayjs(item.end).format(this.dateFormat);
    const value = this.strings.to({start, end});
    return (
      <FacetValue
        label={value}
        isSelected={isSelected}
        numberOfResults={item.numberOfResults}
        facetValueSelected={() => {
          this.facet.toggleSelect(item);
        }}
        ariaLabel={this.strings.facetValue({
          value,
          numberOfResults: item.numberOfResults,
        })}
      />
    );
  }

  public get totalNumberOfResults() {
    return this.facetState.values.reduce(
      (accum, value) => accum + value.numberOfResults,
      0
    );
  }

  public render() {
    if (!this.facetState.hasActiveValues && this.totalNumberOfResults === 0) {
      return null;
    }

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
