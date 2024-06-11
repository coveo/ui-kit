import {
  DateFacet,
  DateFilterRange,
  deserializeRelativeDate,
  DateFacetValue,
  DateFacetState,
  DateRangeRequest,
  SearchSummaryState,
  ProductListingSummaryState,
  Summary,
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
import {FacetValueLabelHighlight} from '../../../common/facets/facet-value-label-highlight/facet-value-label-highlight';
import {FacetValueLink} from '../../../common/facets/facet-value-link/facet-value-link';
import {FacetValuesGroup} from '../../../common/facets/facet-values-group/facet-values-group';
import {initializePopover} from '../../../search/facets/atomic-popover/popover-type';
import {CommerceBindings as Bindings} from '../../atomic-commerce-interface/atomic-commerce-interface';

/**
 * A facet is a list of values for a certain field occurring in the results.
 * An `atomic-commerce-timeframe-facet` displays a facet of the results for the current query as date intervals.
 *
 * @internal
 */
@Component({
  tag: 'atomic-commerce-timeframe-facet',
  styleUrl: './atomic-commerce-timeframe-facet.pcss',
  shadow: true,
})
export class AtomicCommerceTimeframeFacet
  implements InitializableComponent<Bindings>
{
  @InitializeBindings() public bindings!: Bindings;
  @Element() private host!: HTMLElement;

  /**
   * The summary controller instance.
   */
  @Prop() summary!: Summary<SearchSummaryState | ProductListingSummaryState>;
  /**
   * The date facet controller instance.
   */
  @Prop() public facet!: DateFacet;

  @BindStateToController('facet')
  @State()
  public facetState?: DateFacetState;
  @State() public error!: Error;

  @State() private isCollapsed = false;
  @State() private inputRange?: DateFilterRange;

  private headerFocus?: FocusTargetController;

  private get state() {
    return this.facetState;
  }

  private get displayName() {
    return this.state?.displayName || 'no-label';
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

  @Listen('atomic/dateInputApply')
  public applyDateInput({detail}: CustomEvent<DateFilterRange>) {
    this.inputRange = {start: detail.start, end: detail.end};
  }

  private get valuesToRender() {
    return (
      this.facetState?.values.filter(
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
      firstRequestExecuted: firstSearchExecuted,
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
      hasInput: true,
    });
  }

  private get hasValues() {
    if (this.facet?.state.values.length) {
      return true;
    }

    return !!this.valuesToRender.length;
  }

  private get numberOfSelectedValues() {
    if (this.hasInputRange) {
      return 1;
    }

    return (
      this.facetState?.values?.filter(({state}) => state === 'selected')
        .length || 0
    );
  }

  private get hasInputRange() {
    return !!this.inputRange;
  }

  public disconnectedCallback() {
    if (this.host.isConnected) {
      return;
    }
  }

  private get isHidden() {
    return !this.shouldRenderFacet;
  }

  private resetRange() {
    this.inputRange = undefined;
    this.facet.setRanges([]);
  }

  private registerFacetToStore() {
    const facetInfo: FacetInfo = {
      label: () => this.bindings.i18n.t(this.displayName),
      facetId: this.facet.state?.facetId,
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
  }

  private formatFacetValue(facetValue: DateFacetValue) {
    try {
      const startDate = deserializeRelativeDate(facetValue.start);
      const relativeDate =
        startDate.period === 'past'
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
        onClick={() => this.facet.toggleSingleSelect(facetValue)}
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
          if (this.hasInputRange) {
            this.resetRange();
            return;
          }
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
      <atomic-facet-date-input
        bindings={this.bindings}
        label={this.displayName}
        rangeGetter={() => this.inputRange}
        facetId={this.facet.state.facetId}
        rangeSetter={({start, end, endInclusive}: DateRangeRequest) => {
          this.facet.setRanges([
            {
              start,
              end,
              endInclusive,
              state: 'selected',
            },
          ]);
        }}
      ></atomic-facet-date-input>
    );
  }

  public render() {
    const {hasError, firstRequestExecuted} = this.summary.state;

    return (
      <FacetGuard
        enabled={true}
        firstSearchExecuted={firstRequestExecuted}
        hasError={hasError}
        hasResults={this.shouldRenderFacet}
      >
        {
          <FacetContainer>
            {this.renderHeader()}
            {!this.isCollapsed && [
              this.shouldRenderValues && this.renderValues(),
              this.shouldRenderInput && this.renderDateInput(),
            ]}
          </FacetContainer>
        }
      </FacetGuard>
    );
  }
}
