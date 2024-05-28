import {
  DateFacet,
  deserializeRelativeDate,
  NumericFacetState,
  ListingSummary,
  loadDateFacetSetActions,
  SearchSummary,
  DateFacetValue,
} from '@coveo/headless/commerce';
import {Component, Element, h, Listen, Prop, State, VNode} from '@stencil/core';
import {FocusTargetController} from '../../../../utils/accessibility-utils';
import {parseDate} from '../../../../utils/date-utils';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {shouldDisplayInputForFacetRange} from '../../../common/facets/facet-common';
import {FacetInfo} from '../../../common/facets/facet-common-store';
import {FacetContainer} from '../../../common/facets/facet-container/facet-container';
import {FacetGuard} from '../../../common/facets/facet-guard';
import {FacetHeader} from '../../../common/facets/facet-header/facet-header';
import {FacetPlaceholder} from '../../../common/facets/facet-placeholder/facet-placeholder';
import {FacetValueLabelHighlight} from '../../../common/facets/facet-value-label-highlight/facet-value-label-highlight';
import {FacetValueLink} from '../../../common/facets/facet-value-link/facet-value-link';
import {FacetValuesGroup} from '../../../common/facets/facet-values-group/facet-values-group';
import {initializePopover} from '../../../search/facets/atomic-popover/popover-type';
import {CommerceBindings as Bindings} from '../../atomic-commerce-interface/atomic-commerce-interface';

export type Range = {start: Date; end: Date}; // TODO: find a better type (maybe re-use the one from the other component)

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
  @State() private range?: Range; // TODO: move outside this class (should be in the parent component)

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
    this.registerFacetToStore();
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

  @Listen('atomic/numberInputApply')
  public applyNumberInput({detail}: CustomEvent<Range>) {
    this.range = {start: detail.start, end: detail.end};
  }

  private get valuesToRender() {
    return (
      // this.facetForDateRange?.state.values.filter(
      this.facet?.state.values.filter(
        (value) => value.numberOfResults || value.state !== 'idle'
      ) || []
    );
  }

  private get shouldRenderValues() {
    return !this.hasInputRange && !!this.valuesToRender.length;
  }

  private get shouldRenderFacet() {
    return this.shouldRenderInput || this.shouldRenderValues;
  }

  private get shouldRenderInput() {
    const {
      firstSearchExecuted,
      hasError,
      isLoading,
      hasProducts: hasResults,
    } = this.summary.state;
    return shouldDisplayInputForFacetRange({
      hasInputRange: this.hasInputRange,
      searchStatusState: {
        firstSearchExecuted,
        hasError,
        hasResults,
        isLoading,
      },
      facetValues: this.facet?.state?.values || [],
      // facetValues: this.facetForDatePicker?.state?.values || [],
      hasInput: true,
    });
  }

  private get hasValues() {
    if (this.facet?.state.values.length) {
      // if (this.facetForDatePicker?.state.values.length) {
      return true;
    }

    return !!this.valuesToRender.length;
  }

  private get numberOfSelectedValues() {
    if (this.range) {
      return 1;
    }

    return (
      this.facet?.state.values.filter(
        // this.facetForDateRange?.state.values.filter(
        ({state}) => state === 'selected'
      ).length || 0
    );
  }

  private get hasInputRange() {
    return !!this.range;
  }

  public disconnectedCallback() {
    if (this.host.isConnected) {
      return;
    }
    // this.dependenciesManager?.stopWatching();
  }

  private get isHidden() {
    return !this.shouldRenderFacet;
  }

  private registerFacetToStore() {
    const facetInfo: FacetInfo = {
      label: () => this.bindings.i18n.t(this.displayName),
      facetId: this.state.facetId!,
      element: this.host,
      isHidden: () => this.isHidden,
    };

    this.bindings.store.registerFacet('dateFacets', {
      ...facetInfo,
      format: (value) => this.formatFacetValue(value),
    });

    initializePopover(this.host, {
      ...facetInfo,
      hasValues: () => this.hasValues,
      numberOfActiveValues: () => this.numberOfSelectedValues,
    });

    // if (this.filter) {
    //   // TODO: WTF!!!!!??
    //   this.bindings.store.state.dateFacets[this.filter.state.facetId] =
    //     this.bindings.store.state.dateFacets[this.facetId!];
    // }
  }

  private formatFacetValue(facetValue: DateFacetValue) {
    try {
      const startDate = deserializeRelativeDate(facetValue.start);
      const relativeDate =
        startDate.period === 'past' // TODO: is this still possible even if it is coming from the api
          ? startDate
          : deserializeRelativeDate(facetValue.end);

      return this.bindings.i18n.t(
        `${relativeDate.period}-${relativeDate.unit}`,
        {
          count: relativeDate.amount,
        }
      );
    } catch (error) {
      return this.bindings.i18n.t('to', {
        start: parseDate(facetValue.start).format('YYYY-MM-DD'),
        end: parseDate(facetValue.end).format('YYYY-MM-DD'),
      });
    }
  }
  private renderValues() {
    return this.renderValuesContainer(
      this.valuesToRender.map((value) => this.renderValue(value))
    );
  }

  private renderValue(facetValue: DateFacetValue) {
    const displayValue = this.formatFacetValue(facetValue);
    const isSelected = facetValue.state === 'selected';
    const isExcluded = facetValue.state === 'excluded';
    return (
      <FacetValueLink
        displayValue={displayValue}
        isSelected={isSelected}
        numberOfResults={facetValue.numberOfResults}
        i18n={this.bindings.i18n}
        // onClick={() => this.facetForDateRange!.toggleSingleSelect(facetValue)}
        onClick={() => this.facet!.toggleSingleSelect(facetValue)}
      >
        <FacetValueLabelHighlight
          displayValue={displayValue}
          isSelected={isSelected}
          isExcluded={isExcluded}
        ></FacetValueLabelHighlight>
      </FacetValueLink>
    );
  }

  private renderValuesContainer(children: VNode[]) {
    return (
      <FacetValuesGroup i18n={this.bindings.i18n} label={this.displayName}>
        <ul class="mt-3" part="values">
          {children}
        </ul>
      </FacetValuesGroup>
    );
  }

  private renderHeader() {
    return (
      <FacetHeader
        i18n={this.bindings.i18n}
        label={this.displayName}
        onClearFilters={() => {
          this.focusTarget.focusAfterSearch();
          if (this.range) {
            this.facet.setRanges([]);
            return;
          }
          // this.facetForDateRange?.deselectAll();
          this.facet.deselectAll();
        }}
        numberOfActiveValues={this.numberOfSelectedValues}
        isCollapsed={this.isCollapsed}
        headingLevel={0}
        onToggleCollapse={() => (this.isCollapsed = !this.isCollapsed)}
        headerRef={(el) => this.focusTarget.setTarget(el)}
      ></FacetHeader>
    );
  }

  private renderDateInput() {
    return (
      <atomic-commerce-facet-date-input // TODO: try to re-use same component
        min={this.min}
        max={this.max}
        bindings={this.bindings}
        label={this.displayName}
        facet={this.facet}
        range={this.range}
        // filter={this.filter!}
        // filterState={(this.filter || {})!.state as unknown as DateFilterState} // TODO: revisit
      ></atomic-commerce-facet-date-input>
    );
  }

  public render() {
    const {hasError, firstSearchExecuted} = this.summary.state;

    return (
      <FacetGuard
        enabled={true}
        firstSearchExecuted={firstSearchExecuted}
        hasError={hasError}
        hasResults={this.shouldRenderFacet}
      >
        {firstSearchExecuted ? (
          <FacetContainer>
            {this.renderHeader()}
            {!this.isCollapsed && [
              this.shouldRenderValues && this.renderValues(),
              this.shouldRenderInput && this.renderDateInput(),
            ]}
          </FacetContainer>
        ) : (
          <FacetPlaceholder isCollapsed={this.isCollapsed} numberOfValues={8} />
        )}
      </FacetGuard>
    );
  }
}
