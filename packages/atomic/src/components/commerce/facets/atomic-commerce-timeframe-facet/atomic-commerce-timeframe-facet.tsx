import {
  DateFacet,
  buildDateRange,
  deserializeRelativeDate,
  NumericFacetState,
  ListingSummary,
  loadDateFacetSetActions,
  SearchSummary,
} from '@coveo/headless/commerce';
import {Component, Element, h, Listen, Prop, State} from '@stencil/core';
import {FocusTargetController} from '../../../../utils/accessibility-utils';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {CommerceTimeframeFacetCommon} from '../../../common/facets/comerce-timeframe-facet-common';
import {FacetPlaceholder} from '../../../common/facets/facet-placeholder/facet-placeholder';
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

  private timeframeFacetCommon?: CommerceTimeframeFacetCommon;
  // public filter?: DateFilter;
  @Element() private host!: HTMLElement;

  /**
   * The summary controller instance.
   */
  @Prop() summary!: SearchSummary | ListingSummary;
  /**
   * The numeric facet controller instance.
   */
  @Prop() public facet!: DateFacet;

  @BindStateToController('facet')
  @State()
  public facetState!: NumericFacetState;
  @State() public error!: Error;

  @State() private isCollapsed = false;

  private withDatePicker = false;
  // private filterFacetCount = true;
  // private injectionDepth = 1000;
  private min?: string;
  private max?: string;
  // private sortCriteria: RangeFacetSortCriterion = 'descending';

  private headerFocus?: FocusTargetController;

  private get state() {
    return this.facet.state; // TODO: update to facetState!
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
    this.timeframeFacetCommon = new CommerceTimeframeFacetCommon({
      facetId: this.displayName,
      host: this.host,
      bindings: this.bindings,
      label: this.displayName,
      field: this.state.field,
      headingLevel: 0,
      // dependsOn: parseDependsOn(this.dependsOn) && this.dependsOn,
      withDatePicker: this.withDatePicker,
      // setFacetId: (id: string) => (this.facet.state.facetId = id),
      // buildDependenciesManager: () =>
      //   buildFacetConditionsManager(this.bindings.engine, {
      //     facetId:
      //       this.facetForDateRange?.state.facetId ?? this.filter!.state.facetId,
      //     conditions: parseDependsOn<
      //       FacetValueRequest | CategoryFacetValueRequest
      //     >(this.dependsOn),
      //   }),
      buildDateRange,
      getSummaryState: () => this.summary.state,
      deserializeRelativeDate,
      // initializeFacetForDatePicker: () => this.initializeFacetForDatePicker(),
      // initializeFacetForDateRange: (values: DateRangeRequest[]) =>
      //   this.initializeFacetForDateRange(values),
      // initializeFilter: () => this.initializeFilter(),
      min: this.min,
      max: this.max,
      facet: this.facet,
      // sortCriteria: this.facet.state.s,
    });
  }

  // private initializeFilter() {
  //   this.filter = buildDateFilter(this.bindings.engine, {
  //     options: {
  //       facetId: `${this.displayName}_input`,
  //       field: this.state.field,
  //     },
  //   });

  //   return this.filter;
  // }

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
    const {hasError, firstSearchExecuted} = this.summary.state;
    if (!this.timeframeFacetCommon) {
      return (
        <FacetPlaceholder
          numberOfValues={5}
          isCollapsed={this.isCollapsed}
        ></FacetPlaceholder>
      );
    }
    return this.timeframeFacetCommon.render({
      hasError: hasError,
      firstSearchExecuted: firstSearchExecuted,
      isCollapsed: this.isCollapsed,
      headerFocus: this.focusTarget,
      onToggleCollapse: () => (this.isCollapsed = !this.isCollapsed),
    });
  }
}
