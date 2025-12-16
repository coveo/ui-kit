import {
  buildDateFacet as buildInsightDateFacet,
  buildDateFilter as buildInsightDateFilter,
  buildDateRange as buildInsightDateRange,
  buildFacetConditionsManager as buildInsightFacetConditionsManager,
  buildSearchStatus as buildInsightSearchStatus,
  deserializeRelativeDate as deserializeInsightRelativeDate,
  DateFacet as InsightDateFacet,
  DateFacetState as InsightDateFacetState,
  DateFilter as InsightDateFilter,
  DateFilterState as InsightDateFilterState,
  DateRangeRequest as InsightDateRangeRequest,
  SearchStatus as InsightSearchStatus,
  SearchStatusState as InsightSearchStatusState,
  loadDateFacetSetActions as loadInsightDateFacetSetActions,
  RangeFacetSortCriterion as InsightRangeFacetSortCriterion,
  FacetValueRequest as InsightFacetValueRequest,
  CategoryFacetValueRequest as InsightCategoryFacetValueRequest,
} from '@coveo/headless/insight';
import {Component, Element, h, Listen, Prop, State} from '@stencil/core';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {MapProp} from '../../../utils/props-utils';
import {FocusTargetController} from '../../../utils/stencil-accessibility-utils';
import {parseDependsOn} from '../../common/facets/depends-on';
import {FacetPlaceholder} from '../../common/facets/facet-placeholder/stencil-facet-placeholder';
import {TimeframeFacetCommon} from '../../common/facets/stencil-timeframe-facet-common';
import {InsightBindings} from '../atomic-insight-interface/atomic-insight-interface';

/**
 * @internal
 */
@Component({
  tag: 'atomic-insight-timeframe-facet',
  styleUrl: './atomic-insight-timeframe-facet.pcss',
  shadow: true,
})
export class AtomicInsightTimeframeFacet
  implements InitializableComponent<InsightBindings>
{
  @InitializeBindings() public bindings!: InsightBindings;
  public facetForDateRange?: InsightDateFacet;
  public facetForDatePicker?: InsightDateFacet;

  private timeframeFacetCommon?: TimeframeFacetCommon;
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
   *
   *
   * Note: Resulting count is only an estimation, in some cases this value could be incorrect.
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

  /**
   * The sort criterion to apply to the returned facet values.
   * Possible values are 'ascending' and 'descending'.
   */
  @Prop({reflect: true}) public sortCriteria: InsightRangeFacetSortCriterion =
    'descending';

  private headerFocus?: FocusTargetController;

  public initialize() {
    this.timeframeFacetCommon = new TimeframeFacetCommon({
      facetId: this.facetId,
      host: this.host,
      bindings: this.bindings,
      label: this.label,
      field: this.field,
      headingLevel: this.headingLevel,
      dependsOn: this.dependsOn,
      withDatePicker: this.withDatePicker,
      setFacetId: (id: string) => (this.facetId = id),
      buildDependenciesManager: (facetId: string) =>
        buildInsightFacetConditionsManager(this.bindings.engine, {
          facetId,
          conditions: parseDependsOn<
            InsightFacetValueRequest | InsightCategoryFacetValueRequest
          >(this.dependsOn),
        }),
      buildDateRange: buildInsightDateRange,
      getSearchStatusState: () => this.searchStatusState,
      deserializeRelativeDate: deserializeInsightRelativeDate,
      initializeFacetForDatePicker: () => this.initializeFacetForDatePicker(),
      initializeFacetForDateRange: (values: InsightDateRangeRequest[]) =>
        this.initializeFacetForDateRange(values),
      initializeFilter: () => this.initializeFilter(),
      sortCriteria: this.sortCriteria,
    });
    this.searchStatus = buildInsightSearchStatus(this.bindings.engine);
  }

  private get focusTarget(): FocusTargetController {
    if (!this.headerFocus) {
      this.headerFocus = new FocusTargetController(this);
    }
    return this.headerFocus;
  }

  public disconnectedCallback() {
    this.timeframeFacetCommon?.disconnectedCallback();
  }

  private initializeFacetForDatePicker() {
    this.facetForDatePicker = buildInsightDateFacet(this.bindings.engine, {
      options: {
        facetId: `${this.facetId}_input_range`,
        numberOfValues: 1,
        generateAutomaticRanges: true,
        field: this.field,
        filterFacetCount: this.filterFacetCount,
        injectionDepth: this.injectionDepth,
      },
    });
    return this.facetForDatePicker;
  }

  private initializeFacetForDateRange(values: InsightDateRangeRequest[]) {
    this.facetForDateRange = buildInsightDateFacet(this.bindings.engine, {
      options: {
        facetId: this.facetId,
        field: this.field,
        currentValues: values,
        generateAutomaticRanges: false,
        sortCriteria: 'descending',
        filterFacetCount: this.filterFacetCount,
        injectionDepth: this.injectionDepth,
      },
    });

    return this.facetForDateRange;
  }

  private initializeFilter() {
    this.filter = buildInsightDateFilter(this.bindings.engine, {
      options: {
        facetId: `${this.facetId}_input`,
        field: this.field,
      },
    });

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
      headerFocus: this.focusTarget,
      onToggleCollapse: () => (this.isCollapsed = !this.isCollapsed),
    });
  }
}
