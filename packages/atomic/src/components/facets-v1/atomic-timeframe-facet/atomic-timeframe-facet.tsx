import {Component, h, State, Prop, VNode, Host, Element} from '@stencil/core';
import {
  SearchStatus,
  SearchStatusState,
  buildSearchStatus,
  DateFacet,
  DateFacetState,
  buildDateFacet,
  DateFacetOptions,
  DateFacetValue,
  DateRangeRequest,
  buildDateRange,
  deserializeRelativeDate,
} from '@coveo/headless';
import {
  Bindings,
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {FacetPlaceholder} from '../../facets/atomic-facet-placeholder/atomic-facet-placeholder';
import {FacetContainer} from '../facet-container/facet-container';
import {FacetHeader} from '../facet-header/facet-header';
import {FacetValueLink} from '../facet-value-link/facet-value-link';
import {BaseFacet} from '../facet-common';
import {defaultTimeframes, Timeframe} from '../atomic-timeframe/timeframe';

/**
 * A facet is a list of values for a certain field occurring in the results.
 * An `atomic-timeframe-facet` displays a facet of the results for the current query as date intervals.
 *
 * @part facet - The wrapper for the entire facet.
 * @part placeholder - The placeholder shown before the first search is executed.
 *
 * @part label-button - The button that displays the label and allows to expand/collapse the facet.
 * @part label-button-icon - The label button icon.
 * @part clear-button - The button that resets the actively selected facet values.
 * @part clear-button-icon - The clear button icon.
 *
 * @part values - The facet values container.
 * @part value-label - The facet value label, common for all displays.
 * @part value-count - The facet value count, common for all displays.
 * @part value-link - The facet value when display is 'link'.
 */
@Component({
  tag: 'atomic-timeframe-facet',
  styleUrl: 'atomic-timeframe-facet.pcss',
  shadow: true,
})
export class AtomicTimeframeFacet
  implements InitializableComponent, BaseFacet<DateFacet, DateFacetState> {
  @InitializeBindings() public bindings!: Bindings;
  public facet!: DateFacet;
  public searchStatus!: SearchStatus;
  @Element() private host!: HTMLElement;

  @BindStateToController('facet')
  @State()
  public facetState!: DateFacetState;
  @BindStateToController('searchStatus')
  @State()
  public searchStatusState!: SearchStatusState;
  @State() public error!: Error;
  @State() public isCollapsed = false;

  /**
   * Specifies a unique identifier for the facet.
   */
  @Prop({mutable: true, reflect: true}) public facetId?: string;
  /**
   * The non-localized label for the facet.
   */
  @Prop() public label = 'no-label';
  /**
   * The field whose values you want to display in the facet.
   */
  @Prop() public field = 'date';
  /**
   * Whether this facet should contain an datepicker allowing users to set custom ranges.
   */
  @Prop() public withDatePicker = false;

  public initialize() {
    this.searchStatus = buildSearchStatus(this.bindings.engine);
    const options: DateFacetOptions = {
      facetId: this.facetId,
      field: this.field,
      currentValues: this.currentValues,
      generateAutomaticRanges: false,
      sortCriteria: 'descending',
    };
    this.facet = buildDateFacet(this.bindings.engine, {options});
    this.facetId = this.facet.state.facetId;
    this.bindings.store.state.dateFacets[this.facetId] = {
      label: this.label,
      format: (value) => this.formatFacetValue(value),
    };
  }

  private getManualTimeframes(): Timeframe[] {
    return Array.from(this.host.querySelectorAll('atomic-timeframe')).map(
      ({label, amount, unit, period}) => ({
        label,
        amount,
        unit,
        period,
      })
    );
  }

  private get currentValues(): DateRangeRequest[] {
    const manualTimeframes = this.getManualTimeframes();
    const timeframes = manualTimeframes.length
      ? manualTimeframes
      : defaultTimeframes();

    return timeframes.map(({period, amount, unit}) =>
      buildDateRange({
        start: {period, unit, amount},
        end: {period: 'now'},
      })
    );
  }

  private get numberOfSelectedValues() {
    return this.facetState.values.filter(({state}) => state === 'selected')
      .length;
  }

  private renderHeader() {
    return (
      <FacetHeader
        i18n={this.bindings.i18n}
        label={this.label}
        onClearFilters={() => this.facet.deselectAll()}
        numberOfSelectedValues={this.numberOfSelectedValues}
        isCollapsed={this.isCollapsed}
        onToggleCollapse={() => (this.isCollapsed = !this.isCollapsed)}
      ></FacetHeader>
    );
  }

  private formatFacetValue(facetValue: DateFacetValue) {
    try {
      const relativeDate = deserializeRelativeDate(facetValue.start);
      const timeframe = this.getManualTimeframes().find(
        (timeframe) =>
          timeframe.period === relativeDate.period &&
          timeframe.unit === relativeDate.unit &&
          timeframe.amount === relativeDate.amount
      );

      if (timeframe?.label) {
        return this.bindings.i18n.t(timeframe.label);
      }
      return this.bindings.i18n.t(
        `${relativeDate.period}-${relativeDate.unit}`,
        {
          count: relativeDate.amount,
        }
      );
    } catch (error) {
      return this.bindings.i18n.t('to', {
        start: facetValue.start,
        end: facetValue.end,
      });
    }
  }

  private renderValue(facetValue: DateFacetValue) {
    return (
      <FacetValueLink
        displayValue={this.formatFacetValue(facetValue)}
        numberOfResults={facetValue.numberOfResults}
        isSelected={facetValue.state === 'selected'}
        i18n={this.bindings.i18n}
        onClick={() => this.facet.toggleSingleSelect(facetValue)}
      ></FacetValueLink>
    );
  }

  private renderValuesContainer(children: VNode[]) {
    return (
      <ul part="values" class="mt-3">
        {children}
      </ul>
    );
  }

  private renderValues() {
    return this.renderValuesContainer(
      this.valuesToRender.map((value) => this.renderValue(value))
    );
  }

  private get valuesToRender() {
    return this.facetState.values.filter(
      (value) => value.numberOfResults || value.state !== 'idle'
    );
  }

  public render() {
    if (this.searchStatusState.hasError) {
      return;
    }

    if (!this.searchStatusState.firstSearchExecuted) {
      return (
        <FacetPlaceholder
          numberOfValues={this.currentValues.length}
        ></FacetPlaceholder>
      );
    }

    if (!this.valuesToRender.length) {
      return <Host class="atomic-without-values"></Host>;
    }

    return (
      <Host class="atomic-with-values">
        <FacetContainer>
          {this.renderHeader()}
          {!this.isCollapsed && this.renderValues()}
          {/* TODO: add date picker */}
        </FacetContainer>
      </Host>
    );
  }
}
