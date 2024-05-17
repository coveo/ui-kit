import {
  buildDateFacet,
  buildDateFilter,
  buildDateRange,
  buildFacetConditionsManager,
  buildSearchStatus,
  DateFacet,
  DateFilter,
  DateRangeRequest,
  deserializeRelativeDate,
  RangeFacetSortCriterion,
  loadDateFacetSetActions,
  SearchStatus,
  SearchStatusState,
  FacetValueRequest,
  CategoryFacetValueRequest,
  NumericFacetState,
  ListingSummary,
  SearchSummary,
  buildListingSummary,
  buildSearchSummary,
} from '@coveo/headless/commerce';
import {Component, Element, h, Listen, Prop, State} from '@stencil/core';
import {FocusTargetController} from '../../../../utils/accessibility-utils';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {parseDependsOn} from '../../../common/facets/depends-on';
import {FacetPlaceholder} from '../../../common/facets/facet-placeholder/facet-placeholder';
import {TimeframeFacetCommon} from '../../../common/facets/timeframe-facet-common';
import {CommerceBindings as Bindings} from '../../atomic-commerce-interface/atomic-commerce-interface';

@Component({
  tag: 'atomic-commerce-timeframe-facet',
  styleUrl: './atomic-commerce-timeframe-facet.pcss',
  shadow: true,
})
export class AtomicCommerceTimeframeFacet
  implements InitializableComponent<Bindings>
{
  @InitializeBindings() public bindings!: Bindings;
  public facetForDateRange?: DateFacet;
  public facetForDatePicker?: DateFacet;

  private timeframeFacetCommon?: TimeframeFacetCommon;
  public filter?: DateFilter;
  public searchStatus!: SearchStatus;
  @Element() private host!: HTMLElement;

  @BindStateToController('facet')
  @State()
  public facetState!: NumericFacetState;

  public searchStatusState!: SearchStatusState;
  @State() public error!: Error;

  private summary!: ListingSummary | SearchSummary;
  private isCollapsed = false;

  private withDatePicker = false;
  private headingLevel = 0;
  private filterFacetCount = true;
  private injectionDepth = 1000;
  private min?: string;
  private max?: string;
  private sortCriteria: RangeFacetSortCriterion = 'descending';

  private headerFocus?: FocusTargetController;

  @Prop({reflect: true}) public facet!: DateFacet;

  private get state() {
    return this.facet.state;
  }

  private get displayName() {
    return this.state.displayName || 'no-label';
  }

  private get focusTarget(): FocusTargetController {
    if (!this.headerFocus) {
      this.headerFocus = new FocusTargetController(this);
    }
    return this.headerFocus;
  }

  public initialize() {
    this.initializeSummary();
    this.timeframeFacetCommon = new TimeframeFacetCommon({
      facetId: this.displayName,
      host: this.host,
      bindings: this.bindings,
      label: this.displayName,
      field: this.state.field,
      headingLevel: this.headingLevel,
      dependsOn: parseDependsOn(this.dependsOn) && this.dependsOn,
      withDatePicker: this.withDatePicker,
      setFacetId: (id: string) => (this.displayName = id),
      buildDependenciesManager: () =>
        buildFacetConditionsManager(this.bindings.engine, {
          facetId:
            this.facetForDateRange?.state.facetId ?? this.filter!.state.facetId,
          conditions: parseDependsOn<
            FacetValueRequest | CategoryFacetValueRequest
          >(this.dependsOn),
        }),
      buildDateRange,
      getSearchStatusState: () => this.searchStatusState,
      deserializeRelativeDate,
      initializeFacetForDatePicker: () => this.initializeFacetForDatePicker(),
      initializeFacetForDateRange: (values: DateRangeRequest[]) =>
        this.initializeFacetForDateRange(values),
      initializeFilter: () => this.initializeFilter(),
      min: this.min,
      max: this.max,
      sortCriteria: this.sortCriteria,
    });
    this.searchStatus = buildSearchStatus(this.bindings.engine);
  }

  private initializeSummary() {
    if (this.bindings.interfaceElement.type === 'product-listing') {
      this.summary = buildListingSummary(this.bindings.engine);
    } else {
      this.summary = buildSearchSummary(this.bindings.engine);
    }
  }

  private initializeFacetForDatePicker() {
    this.facetForDatePicker = buildDateFacet(this.bindings.engine, {
      options: {
        facetId: `${this.displayName}_input_range`,
        numberOfValues: 1,
        generateAutomaticRanges: true,
        field: this.state.field,
        filterFacetCount: this.filterFacetCount,
        injectionDepth: this.injectionDepth,
      },
    });
    return this.facetForDatePicker;
  }

  private initializeFacetForDateRange(values: DateRangeRequest[]) {
    this.facetForDateRange = buildDateFacet(this.bindings.engine, {
      options: {
        facetId: this.displayName,
        field: this.state.field,
        currentValues: values,
        generateAutomaticRanges: false,
        sortCriteria: this.sortCriteria,
        filterFacetCount: this.filterFacetCount,
        injectionDepth: this.injectionDepth,
      },
    });
    return this.facetForDateRange;
  }

  private initializeFilter() {
    this.filter = buildDateFilter(this.bindings.engine, {
      options: {
        facetId: `${this.displayName}_input`,
        field: this.state.field,
      },
    });

    return this.filter;
  }

  @Listen('atomic/dateInputApply')
  public applyDateInput() {
    this.displayName &&
      this.bindings.engine.dispatch(
        loadDateFacetSetActions(
          this.bindings.engine
        ).deselectAllDateFacetValues(this.displayName)
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
