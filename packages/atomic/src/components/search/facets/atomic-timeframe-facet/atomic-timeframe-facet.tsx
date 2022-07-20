import {Component, h, State, Prop, VNode, Element, Listen} from '@stencil/core';
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
  DateFilter,
  DateFilterState,
  buildDateFilter,
  loadDateFacetSetActions,
  deserializeRelativeDate,
  buildFacetConditionsManager,
  FacetConditionsManager,
} from '@coveo/headless';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {FacetPlaceholder} from '../atomic-facet-placeholder/atomic-facet-placeholder';
import {FacetContainer} from '../facet-container/facet-container';
import {FacetHeader} from '../facet-header/facet-header';
import {FacetValueLink} from '../facet-value-link/facet-value-link';
import {
  BaseFacet,
  parseDependsOn,
  shouldDisplayInputForFacetRange,
  validateDependsOn,
} from '../facet-common';
import {Timeframe} from '../atomic-timeframe/timeframe';
import {FacetValueLabelHighlight} from '../facet-value-label-highlight/facet-value-label-highlight';
import dayjs from 'dayjs';
import {getFieldValueCaption} from '../../../../utils/field-utils';
import {Hidden} from '../../../common/hidden';
import {
  FocusTarget,
  FocusTargetController,
} from '../../../../utils/accessibility-utils';
import {MapProp} from '../../../../utils/props-utils';
import {FacetValuesGroup} from '../facet-values-group/facet-values-group';
import {randomID} from '../../../../utils/utils';
import {Bindings} from '../../atomic-search-interface/atomic-search-interface';

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
 * @part selected-value - The selected facet value of any display.
 *
 * @part input-start - The input for the starting value of the custom date range.
 * @part input-end - The input for the ending value of the custom date range.
 * @part input-label - The label for both the start and end input.
 * @part input-apply-button - The apply button for the custom range.
 *
 * @part ripple - The ripple effect of the component's interactive elements.
 */
@Component({
  tag: 'atomic-timeframe-facet',
  styleUrl: 'atomic-timeframe-facet.pcss',
  shadow: true,
})
export class AtomicTimeframeFacet
  implements InitializableComponent, BaseFacet<DateFacet>
{
  @InitializeBindings() public bindings!: Bindings;
  public facetForDateRange?: DateFacet;
  public facetForDatePicker?: DateFacet;

  private dependenciesManager?: FacetConditionsManager;
  public filter?: DateFilter;
  public searchStatus!: SearchStatus;
  private manualTimeframes: Timeframe[] = [];
  @Element() private host!: HTMLElement;

  @BindStateToController('facetForDateRange')
  @State()
  public facetState!: DateFacetState;
  @BindStateToController('facetForDatePicker')
  @State()
  public facetForDatePickerState?: DateFacetState;
  @BindStateToController('filter')
  @State()
  public filterState?: DateFilterState;
  @BindStateToController('searchStatus')
  @State()
  public searchStatusState!: SearchStatusState;
  @State() public error!: Error;

  /**
   * Specifies a unique identifier for the facet.
   */
  @Prop({mutable: true, reflect: true}) public facetId?: string;
  /**
   * The non-localized label for the facet.
   * Used in the atomic-breadbox component through the bindings store.
   */
  @Prop({reflect: true}) public label = 'no-label';
  /**
   * The field whose values you want to display in the facet.
   */
  @Prop({reflect: true}) public field = 'date';
  /**
   * Whether this facet should contain an datepicker allowing users to set custom ranges.
   */
  @Prop({reflect: true}) public withDatePicker = false;
  /**
   * Specifies if the facet is collapsed.
   */
  @Prop({reflect: true, mutable: true}) public isCollapsed = false;
  /**
   * The [heading level](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements) to use for the heading over the facet, from 1 to 6.
   */
  @Prop({reflect: true}) public headingLevel = 0;
  /**
   * Whether to exclude the parents of folded results when estimating the result count for each facet value.
   */
  @Prop({reflect: true}) public filterFacetCount = true;
  /**
   * The maximum number of results to scan in the index to ensure that the facet lists all potential facet values.
   * Note: A high injectionDepth may negatively impact the facet request performance.
   * Minimum: `0`
   * Default: `1000`
   */
  @Prop({reflect: true}) public injectionDepth = 1000;

  /**
   * The required facets and values for this facet to be displayed.
   * Examples:
   * ```html
   * <atomic-facet facet-id="abc" field="objecttype" ...></atomic-facet>
   *
   * <!-- To show the facet when any value is selected in the facet with id "abc": -->
   * <atomic-timeframe-facet
   *   depends-on-abc
   *   ...
   * ></atomic-timeframe-facet>
   *
   * <!-- To show the facet when value "doc" is selected in the facet with id "abc": -->
   * <atomic-timeframe-facet
   *   depends-on-abc="doc"
   *   ...
   * ></atomic-timeframe-facet>
   * ```
   */
  @MapProp() @Prop() public dependsOn: Record<string, string> = {};

  @FocusTarget()
  private headerFocus!: FocusTargetController;

  private validateProps() {
    validateDependsOn(this.dependsOn);
  }

  public initialize() {
    this.validateProps();
    this.manualTimeframes = this.getManualTimeframes();
    this.searchStatus = buildSearchStatus(this.bindings.engine);
    this.initializeFacets();
    this.withDatePicker && this.initializeFilter();
    this.inititalizeDependenciesManager();
    this.registerFacetToStore();
  }

  public disconnectedCallback() {
    if (this.host.isConnected) {
      return;
    }
    this.dependenciesManager?.stopWatching();
  }

  private initializeFacets() {
    // Initialize two facets: One that is actually used to display values for end users, which only exists
    // if we need to display something to the end user (ie: timeframes > 0)

    // A second facet is initialized only to verify the results count. It is never used to display results to end user.
    // It serves as a way to determine if the input should be rendered or not, independent of the ranges configured in the component
    if (this.manualTimeframes.length > 0) {
      this.initializeFacetForDateRange();
    }
    if (this.withDatePicker) {
      this.initializeFacetForDatePicker();
    }
  }

  private initializeFacetForDatePicker() {
    this.facetForDatePicker = buildDateFacet(this.bindings.engine, {
      options: {
        numberOfValues: 1,
        generateAutomaticRanges: true,
        facetId: randomID(this.facetId || this.field),
        field: this.field,
        filterFacetCount: this.filterFacetCount,
        injectionDepth: this.injectionDepth,
      },
    });
  }

  private initializeFacetForDateRange() {
    const options: DateFacetOptions = {
      facetId: this.facetId,
      field: this.field,
      currentValues: this.currentValues,
      generateAutomaticRanges: false,
      sortCriteria: 'descending',
      filterFacetCount: this.filterFacetCount,
      injectionDepth: this.injectionDepth,
    };
    this.facetForDateRange = buildDateFacet(this.bindings.engine, {options});
    this.facetId = this.facetForDateRange.state.facetId;
  }

  private initializeFilter() {
    this.filter = buildDateFilter(this.bindings.engine, {
      options: {
        facetId: this.facetId ? `${this.facetId}_input` : undefined,
        field: this.field,
      },
    });

    if (!this.facetId) {
      this.facetId = this.filter.state.facetId;
    }
  }

  private registerFacetToStore() {
    if (!this.facetForDateRange) {
      return;
    }
    this.bindings.store.registerFacet('dateFacets', {
      label: this.label,
      facetId: this.facetId!,
      element: this.host,
      format: (value) => this.formatFacetValue(value),
    });

    if (this.filter) {
      this.bindings.store.state.dateFacets[this.filter.state.facetId] =
        this.bindings.store.state.dateFacets[this.facetId!];
    }
  }

  private inititalizeDependenciesManager() {
    if (!this.facetForDateRange && !this.filter) {
      return;
    }
    this.dependenciesManager = buildFacetConditionsManager(
      this.bindings.engine,
      {
        facetId:
          this.facetForDateRange?.state.facetId ?? this.filter!.state.facetId,
        conditions: parseDependsOn(this.dependsOn),
      }
    );
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
    return this.manualTimeframes.map(({period, amount, unit}) =>
      period === 'past'
        ? buildDateRange({
            start: {period, unit, amount},
            end: {period: 'now'},
          })
        : buildDateRange({
            start: {period: 'now'},
            end: {period, unit, amount},
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
          this.headerFocus.focusAfterSearch();
          if (this.filterState?.range) {
            this.filter?.clear();
            return;
          }
          this.facetForDateRange?.deselectAll();
        }}
        numberOfSelectedValues={this.numberOfSelectedValues}
        isCollapsed={this.isCollapsed}
        headingLevel={this.headingLevel}
        onToggleCollapse={() => (this.isCollapsed = !this.isCollapsed)}
        headerRef={this.headerFocus.setTarget}
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
      const startDate = deserializeRelativeDate(facetValue.start);
      const relativeDate =
        startDate.period === 'past'
          ? startDate
          : deserializeRelativeDate(facetValue.end);
      const timeframe = this.getManualTimeframes().find(
        (timeframe) =>
          timeframe.period === relativeDate.period &&
          timeframe.unit === relativeDate.unit &&
          timeframe.amount === relativeDate.amount
      );

      if (timeframe?.label) {
        return getFieldValueCaption(
          this.field,
          timeframe.label,
          this.bindings.i18n
        );
      }
      return this.bindings.i18n.t(
        `${relativeDate.period}-${relativeDate.unit}`,
        {
          count: relativeDate.amount,
        }
      );
    } catch (error) {
      return this.bindings.i18n.t('to', {
        start: dayjs(facetValue.start).format('YYYY-MM-DD'),
        end: dayjs(facetValue.end).format('YYYY-MM-DD'),
      });
    }
  }

  private renderValue(facetValue: DateFacetValue) {
    const displayValue = this.formatFacetValue(facetValue);
    const isSelected = facetValue.state === 'selected';
    return (
      <FacetValueLink
        displayValue={displayValue}
        isSelected={isSelected}
        numberOfResults={facetValue.numberOfResults}
        i18n={this.bindings.i18n}
        onClick={() => this.facetForDateRange!.toggleSingleSelect(facetValue)}
      >
        <FacetValueLabelHighlight
          displayValue={displayValue}
          isSelected={isSelected}
        ></FacetValueLabelHighlight>
      </FacetValueLink>
    );
  }

  private renderValuesContainer(children: VNode[]) {
    return (
      <FacetValuesGroup i18n={this.bindings.i18n} label={this.label}>
        <ul class="mt-3" part="values">
          {children}
        </ul>
      </FacetValuesGroup>
    );
  }

  private renderValues() {
    return this.renderValuesContainer(
      this.valuesToRender.map((value) => this.renderValue(value))
    );
  }

  private get enabled() {
    return this.facetState?.enabled ?? this.filterState?.enabled ?? true;
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
    return !this.hasInputRange && !!this.valuesToRender.length;
  }

  private get hasInputRange() {
    return !!this.filterState?.range;
  }

  private get shouldRenderInput() {
    return shouldDisplayInputForFacetRange({
      hasInput: this.withDatePicker,
      hasInputRange: this.hasInputRange,
      searchStatusState: this.searchStatusState,
      facetValues: this.facetForDatePickerState?.values || [],
    });
  }

  public render() {
    if (this.searchStatusState.hasError || !this.enabled) {
      return <Hidden></Hidden>;
    }

    if (!this.searchStatusState.firstSearchExecuted) {
      return (
        <FacetPlaceholder
          numberOfValues={this.currentValues.length}
          isCollapsed={this.isCollapsed}
        ></FacetPlaceholder>
      );
    }

    if (!this.shouldRenderFacet) {
      return <Hidden></Hidden>;
    }

    return (
      <FacetContainer>
        {this.renderHeader()}
        {!this.isCollapsed && [
          this.shouldRenderValues && this.renderValues(),
          this.shouldRenderInput && this.renderDateInput(),
        ]}
      </FacetContainer>
    );
  }
}
