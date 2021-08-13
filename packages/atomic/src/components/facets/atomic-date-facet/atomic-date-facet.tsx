import {Component, Prop, State, h, Element, Host} from '@stencil/core';
import dayjs from 'dayjs';
import {
  DateFacet,
  buildDateFacet,
  DateFacetState,
  DateFacetOptions,
  DateFacetValue,
  buildDateRange,
  SearchStatusState,
  SearchStatus,
  buildSearchStatus,
  RangeFacetRangeAlgorithm,
} from '@coveo/headless';
import {
  Bindings,
  BindStateToController,
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
import {FacetPlaceholder} from '../atomic-facet-placeholder/atomic-facet-placeholder';
import {registerFacetToStore} from '../../../utils/store';

/**
 * The `atomic-date-facet` component displays facet values as date ranges. In mobile browsers, this is rendered as a button that opens a facet modal.
 *
 * @part facet - The wrapper for the entire facet.
 * @part label - The label of the facet.
 * @part modal-button - The button to open the facet modal (mobile only).
 * @part close-button - The button to close the facet when displayed modally (mobile only).
 * @part clear-button - The button that resets the actively selected facet values.
 *
 * @part placeholder - The placeholder shown before the first search is executed.
 * @part value - A single facet value.
 * @part value-label - The facet value label.
 * @part value-count - The facet value count.
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
  public searchStatus!: SearchStatus;

  @BindStateToController('facet')
  @State()
  private facetState!: DateFacetState;
  @State() public error!: Error;
  @BindStateToController('searchStatus')
  @State()
  private searchStatusState!: SearchStatusState;

  public strings: I18nState = {
    clear: () => this.bindings.i18n.t('clear'),
    facetValue: (variables) => this.bindings.i18n.t('facet-value', variables),
    to: (variables) => this.bindings.i18n.t('to', variables),
  };

  @State() public isExpanded = false;

  /**
   * Specifies a unique identifier for the facet.
   */
  @Prop({mutable: true, reflect: true}) public facetId = '';
  /**
   * Specifies the index field whose values the facet should use.
   */
  @Prop() public field = '';
  /**
   * The non-localized label for the facet.
   */
  @Prop() public label = 'no-label';
  /**
   * The format that the date will be displayed in. See https://day.js.org/docs/en/display/format for formatting details.
   */
  @Prop() public dateFormat = 'DD/MM/YYYY';
  /**
   * The number of values to request for this facet, when there are no manual ranges.
   */
  @Prop({mutable: true}) public numberOfValues = 8;
  /**
   * The algorithm that's used for generating the ranges of this facet when they aren't manually defined. The default value of `"even"` generates equally sized facet ranges across all of the results. The value `"equiprobable"` generates facet ranges which vary in size, but have a more balanced number of results in each facet range.
   */
  @Prop() public rangeAlgorithm: RangeFacetRangeAlgorithm = 'even';

  private buildManualRanges() {
    const options = Array.from(this.host.querySelectorAll('atomic-date-range'));
    return options.map(({start, end}) => buildDateRange({start, end}));
  }

  public initialize() {
    this.searchStatus = buildSearchStatus(this.bindings.engine);
    const manualRanges = this.buildManualRanges();
    if (manualRanges.length) {
      this.numberOfValues = manualRanges.length;
    }

    const options: DateFacetOptions = {
      facetId: this.facetId,
      field: this.field,
      generateAutomaticRanges: manualRanges.length === 0,
      currentValues: manualRanges,
      numberOfValues: this.numberOfValues,
      rangeAlgorithm: this.rangeAlgorithm,
    };
    this.strings[this.label] = () => this.bindings.i18n.t(this.label);
    this.facet = buildDateFacet(this.bindings.engine, {options});
    this.facetId = this.facet.state.facetId;
    registerFacetToStore(this.bindings.store, 'dateFacets', {
      label: this.label,
      facetId: this.facetId!,
      element: this.host,
      format: (value) => this.formatValue(value),
    });
  }

  private get values() {
    return this.facetState.values.map((listItem) => {
      if (!listItem.numberOfResults && !this.facet.isValueSelected(listItem)) {
        return null;
      }
      return this.buildListItem(listItem);
    });
  }

  private formatValue(facetValue: DateFacetValue) {
    const start = dayjs(facetValue.start).format(this.dateFormat);
    const end = dayjs(facetValue.end).format(this.dateFormat);
    return this.strings.to({start, end});
  }

  private buildListItem(item: DateFacetValue) {
    const isSelected = this.facet.isValueSelected(item);
    const value = this.formatValue(item);
    return (
      <FacetValue
        label={value}
        isSelected={isSelected}
        numberOfResults={item.numberOfResults.toLocaleString(
          this.bindings.i18n.language
        )}
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
    if (this.searchStatusState.hasError) {
      return;
    }

    if (!this.searchStatusState.firstSearchExecuted) {
      return (
        <FacetPlaceholder
          numberOfValues={this.numberOfValues}
        ></FacetPlaceholder>
      );
    }

    if (!this.facetState.hasActiveValues && this.totalNumberOfResults === 0) {
      return <Host class="atomic-without-values"></Host>;
    }

    return (
      <Host class="atomic-with-values">
        <BaseFacet
          controller={new BaseFacetController(this)}
          label={this.strings[this.label]()}
          hasActiveValues={this.facetState.hasActiveValues}
          clearAll={() => this.facet.deselectAll()}
        >
          <ul>{this.values}</ul>
        </BaseFacet>
      </Host>
    );
  }
}
