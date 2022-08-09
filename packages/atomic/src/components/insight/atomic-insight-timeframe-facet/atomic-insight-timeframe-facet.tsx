import {Component, Element, h, Listen, Prop, State} from '@stencil/core';

import {
  FocusTarget,
  FocusTargetController,
} from '../../../utils/accessibility-utils';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {MapProp} from '../../../utils/props-utils';
import {randomID} from '../../../utils/utils';
import {BaseFacet, parseDependsOn} from '../../common/facets/facet-common';
import {FacetPlaceholder} from '../../common/facets/facet-placeholder/facet-placeholder';
import {TimeframeFacetCommon} from '../../common/facets/timeframe-facet-common';
import {InsightBindings} from '../atomic-insight-interface/atomic-insight-interface';
import {
  buildInsightDateFacet,
  buildInsightDateFilter,
  buildInsightDateRange,
  buildInsightFacetConditionsManager,
  buildInsightSearchStatus,
  deserializeInsightRelativeDate,
  InsightDateFacet,
  InsightDateFacetOptions,
  InsightDateFacetState,
  InsightDateFilter,
  InsightDateFilterState,
  InsightDateRangeRequest,
  InsightSearchStatus,
  InsightSearchStatusState,
  loadInsightDateFacetSetActions,
} from '..';

/**
 * A facet is a list of values for a certain field occurring in the results.
 * An `atomic-insight-timeframe-facet` displays a facet of the results for the current query as date intervals.
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
 * @part value-link-selected - The selected facet value when display is 'link'.
 *
 * @part input-start - The input for the starting value of the custom date range.
 * @part input-end - The input for the ending value of the custom date range.
 * @part input-label - The label for both the start and end input.
 * @part input-apply-button - The apply button for the custom range.
 *
 * @internal
 */
@Component({
  tag: 'atomic-insight-timeframe-facet',
  styleUrl: './atomic-insight-timeframe-facet.pcss',
  shadow: true,
})
export class AtomicInsightTimeframeFacet
  implements
    InitializableComponent<InsightBindings>,
    BaseFacet<InsightDateFacet>
{
  @InitializeBindings() public bindings!: InsightBindings;
  public facetForDateRange?: InsightDateFacet;
  public facetForDatePicker?: InsightDateFacet;

  private timeframeFacetCommon!: TimeframeFacetCommon;
  public filter?: InsightDateFilter;
  public searchStatus!: InsightSearchStatus;
  @Element() private host!: HTMLElement;

  @BindStateToController('facetForDateRange')
  @State()
  public facetState!: InsightDateFacetState;
  @BindStateToController('facetForDatePicker')
  @State()
  public facetForDatePickerState?: InsightDateFacetState;
  @BindStateToController('filter')
  @State()
  public filterState?: InsightDateFilterState;
  @BindStateToController('searchStatus')
  @State()
  public searchStatusState!: InsightSearchStatusState;
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
   * <atomic-insight-facet facet-id="abc" field="objecttype" ...></atomic-insight-facet>
   *
   * <!-- To show the facet when any value is selected in the facet with id "abc": -->
   * <atomic-insight-timeframe-facet
   *   depends-on-abc
   *   ...
   * ></atomic-insight-timeframe-facet>
   *
   * <!-- To show the facet when value "doc" is selected in the facet with id "abc": -->
   * <atomic-insight-timeframe-facet
   *   depends-on-abc="doc"
   *   ...
   * ></atomic-insight-timeframe-facet>
   * ```
   */
  @MapProp() @Prop() public dependsOn: Record<string, string> = {};

  @FocusTarget()
  private headerFocus!: FocusTargetController;

  public initialize() {
    this.timeframeFacetCommon = new TimeframeFacetCommon({
      host: this.host,
      bindings: this.bindings,
      label: this.label,
      field: this.field,
      headingLevel: this.headingLevel,
      dependsOn: this.dependsOn,
      withDatePicker: this.withDatePicker,
      buildDependenciesManager: () =>
        buildInsightFacetConditionsManager(this.bindings.engine, {
          facetId:
            this.facetForDateRange?.state.facetId ?? this.filter!.state.facetId,
          conditions: parseDependsOn(this.dependsOn),
        }),
      buildDateRange: buildInsightDateRange,
      getSearchStatusState: () => this.searchStatusState,
      deserializeRelativeDate: deserializeInsightRelativeDate,
      initializeFacetForDatePicker: () => this.initializeFacetForDatePicker(),
      initializeFacetForDateRange: (values: InsightDateRangeRequest[]) =>
        this.initializeFacetForDateRange(values),
      initializeFilter: () => this.initializeFilter(),
    });
    this.searchStatus = buildInsightSearchStatus(this.bindings.engine);
  }

  public disconnectedCallback() {
    this.timeframeFacetCommon.disconnectedCallback();
  }

  private initializeFacetForDatePicker() {
    this.facetForDatePicker = buildInsightDateFacet(this.bindings.engine, {
      options: {
        numberOfValues: 1,
        generateAutomaticRanges: true,
        facetId: randomID(this.facetId || this.field),
        field: this.field,
        filterFacetCount: this.filterFacetCount,
        injectionDepth: this.injectionDepth,
      },
    });
    return this.facetForDatePicker;
  }

  private initializeFacetForDateRange(values: InsightDateRangeRequest[]) {
    const options: InsightDateFacetOptions = {
      facetId: this.facetId,
      field: this.field,
      currentValues: values,
      generateAutomaticRanges: false,
      sortCriteria: 'descending',
      filterFacetCount: this.filterFacetCount,
      injectionDepth: this.injectionDepth,
    };

    this.facetForDateRange = buildInsightDateFacet(this.bindings.engine, {
      options,
    });
    this.facetId = this.facetForDateRange.state.facetId;
    return this.facetForDateRange;
  }

  private initializeFilter() {
    this.filter = buildInsightDateFilter(this.bindings.engine, {
      options: {
        facetId: this.facetId ? `${this.facetId}_input` : undefined,
        field: this.field,
      },
    });

    if (!this.facetId) {
      this.facetId = this.filter.state.facetId;
    }
    return this.filter;
  }

  @Listen('atomic/dateInputApply')
  public applyDateInput() {
    this.facetId &&
      this.bindings.engine.dispatch(
        loadInsightDateFacetSetActions(
          this.bindings.engine
        ).deselectAllDateFacetValues(this.facetId)
      );
  }

  public render() {
    if (!this.timeframeFacetCommon) {
      return (
        <FacetPlaceholder
          numberOfValues={5}
          isCollapsed={this.isCollapsed}
        ></FacetPlaceholder>
      );
    }
    return this.timeframeFacetCommon.render({
      hasError: this.searchStatusState.hasError,
      firstSearchExecuted: this.searchStatusState.firstSearchExecuted,
      isCollapsed: this.isCollapsed,
      headerFocus: this.headerFocus,
      onToggleCollapse: () => (this.isCollapsed = !this.isCollapsed),
    });
  }
}
