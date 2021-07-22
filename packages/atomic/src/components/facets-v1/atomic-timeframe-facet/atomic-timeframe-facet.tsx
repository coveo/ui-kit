import {
  Component,
  h,
  State,
  Prop,
  VNode,
  Host,
  Element,
  Listen,
} from '@stencil/core';
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
  parseRelativeDate,
  DateFilter,
  DateFilterState,
  buildDateFilter,
  loadDateFacetSetActions,
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
import {Timeframe} from '../atomic-timeframe/timeframe';

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
 *
 * @part input-start - The input for the start value of the custom range.
 * @part input-end - The input for the end value of the custom range.
 * @part input-apply-button - The apply button for the custom range.
 */
@Component({
  tag: 'atomic-timeframe-facet',
  styleUrl: 'atomic-timeframe-facet.pcss',
  shadow: true,
})
export class AtomicTimeframeFacet
  implements InitializableComponent, BaseFacet<DateFacet, DateFacetState> {
  @InitializeBindings() public bindings!: Bindings;
  public facet?: DateFacet;
  public filter?: DateFilter;
  public searchStatus!: SearchStatus;
  private manualTimeframes: Timeframe[] = [];
  @Element() private host!: HTMLElement;

  @BindStateToController('facet')
  @State()
  public facetState?: DateFacetState;
  @BindStateToController('filter')
  @State()
  public filterState?: DateFilterState;
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
    this.manualTimeframes = this.getManualTimeframes();
    this.searchStatus = buildSearchStatus(this.bindings.engine);
    this.manualTimeframes.length && this.initializeFacet();
    this.withDatePicker && this.initializeFilter();
  }

  private initializeFacet() {
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

  private initializeFilter() {
    this.filter = buildDateFilter(this.bindings.engine, {
      options: {
        facetId: this.facetId ? `${this.facetId}_input` : undefined,
        field: this.field,
      },
    });
    this.bindings.store.state.dateFacets[
      this.filter.state.facetId
    ] = this.bindings.store.state.dateFacets[this.facetId!];
  }

  private getManualTimeframes(): Timeframe[] {
    return Array.from(this.host.querySelectorAll('atomic-timeframe')).map(
      ({label, amount, unit, period, useLocalTime}) => ({
        label,
        amount,
        unit,
        period,
        useLocalTime,
      })
    );
  }

  private get currentValues(): DateRangeRequest[] {
    return this.manualTimeframes.map(({period, amount, unit, useLocalTime}) =>
      buildDateRange({
        start: {period, unit, amount, useLocalTime},
        end: {period: 'now', useLocalTime},
      })
    );
  }

  @Listen('atomic/dateInputApply')
  public applyDateInput() {
    this.facetId &&
      this.bindings.engine.dispatch(
        loadDateFacetSetActions(
          this.bindings.engine
        ).deselectAllDateFacetValues(this.facetId)
      );
  }

  private get numberOfSelectedValues() {
    if (this.filterState?.range) {
      return 1;
    }

    return (
      this.facetState?.values.filter(({state}) => state === 'selected')
        .length || 0
    );
  }

  private renderHeader() {
    return (
      <FacetHeader
        i18n={this.bindings.i18n}
        label={this.label}
        onClearFilters={() => {
          if (this.filterState?.range) {
            this.filter?.clear();
            return;
          }
          this.facet?.deselectAll();
        }}
        numberOfSelectedValues={this.numberOfSelectedValues}
        isCollapsed={this.isCollapsed}
        onToggleCollapse={() => (this.isCollapsed = !this.isCollapsed)}
      ></FacetHeader>
    );
  }

  private renderDateInput() {
    return (
      <atomic-facet-date-input
        bindings={this.bindings}
        label={this.label}
        filter={this.filter!}
        filterState={this.filterState!}
      ></atomic-facet-date-input>
    );
  }

  private formatFacetValue(facetValue: DateFacetValue) {
    try {
      const relativeDate = parseRelativeDate(facetValue.start);
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
        onClick={() => this.facet!.toggleSingleSelect(facetValue)}
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
    return (
      this.facetState?.values.filter(
        (value) => value.numberOfResults || value.state !== 'idle'
      ) || []
    );
  }

  private get shouldRenderFacet() {
    return this.shouldRenderInput || this.shouldRenderValues;
  }

  private get shouldRenderValues() {
    const hasInputRange = !!this.filterState?.range;
    return !hasInputRange && !!this.valuesToRender.length;
  }

  private get shouldRenderInput() {
    if (!this.withDatePicker) {
      return false;
    }

    return this.searchStatusState.hasResults || !!this.filterState?.range;
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

    if (!this.shouldRenderFacet) {
      return <Host class="atomic-without-values"></Host>;
    }

    return (
      <Host class="atomic-with-values">
        <FacetContainer>
          {this.renderHeader()}
          {!this.isCollapsed && [
            this.shouldRenderInput && this.renderDateInput(),
            this.shouldRenderValues && this.renderValues(),
          ]}
        </FacetContainer>
      </Host>
    );
  }
}
