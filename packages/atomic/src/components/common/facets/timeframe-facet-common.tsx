import {h, VNode} from '@stencil/core';
import {
  DateFacet,
  DateFacetValue,
  DateFilter,
  DateRangeRequest,
  FacetConditionsManager,
  RelativeDate,
  SearchStatusState,
} from '@coveo/headless';
import dayjs from 'dayjs';
import {FocusTargetController} from '../../../utils/accessibility-utils';
import {getFieldValueCaption} from '../../../utils/field-utils';
import {
  InsightDateFacet,
  InsightDateFacetValue,
  InsightDateFilter,
  InsightDateRangeOptions,
  InsightDateRangeRequest,
  InsightFacetConditionsManager,
  InsightRelativeDate,
  InsightSearchStatusState,
} from '../../insight';
import {InsightBindings} from '../../insight/atomic-insight-interface/atomic-insight-interface';
import {Bindings} from '../../search/atomic-search-interface/atomic-search-interface';
import {Hidden} from '../hidden';
import {
  shouldDisplayInputForFacetRange,
  validateDependsOn,
} from './facet-common';
import {FacetContainer} from './facet-container/facet-container';
import {FacetPlaceholder} from './facet-placeholder/facet-placeholder';
import {FacetValueLink} from './facet-value-link/facet-value-link';
import {FacetValueLabelHighlight} from './facet-value-label-highlight/facet-value-label-highlight';
import {FacetValuesGroup} from './facet-values-group/facet-values-group';
import {FacetHeader} from './facet-header/facet-header';

export interface Timeframe extends RelativeDate {
  label?: string;
}

export interface InsightTimeframe extends InsightRelativeDate {
  label?: string;
}

interface TimeframeFacetCommonOptions {
  host: HTMLElement;
  bindings: Bindings | InsightBindings;
  label: string;
  field: string;
  headingLevel: number;
  dependsOn: Record<string, string>;
  withDatePicker: boolean;
  getSearchStatusState(): InsightSearchStatusState | SearchStatusState;
  buildDependenciesManager():
    | InsightFacetConditionsManager
    | FacetConditionsManager;
  deserializeRelativeDate(date: string): InsightRelativeDate | RelativeDate;
  buildDateRange(
    config: InsightDateRangeOptions | InsightDateRangeOptions
  ): InsightDateRangeRequest | DateRangeRequest;
  initializeFacetForDatePicker(): InsightDateFacet | DateFacet;
  initializeFacetForDateRange(
    values: InsightDateRangeRequest[] | DateRangeRequest[]
  ): InsightDateFacet | DateFacet;
  initializeFilter(): InsightDateFilter | DateFilter;
}

interface TimeframeFacetCommonRenderProps {
  hasError: boolean;
  firstSearchExecuted: boolean;
  isCollapsed: boolean;
  headerFocus: FocusTargetController;
  onToggleCollapse: () => boolean;
}

export class TimeframeFacetCommon {
  private host: HTMLElement;
  private bindings: Bindings | InsightBindings;
  private label: string;
  private field: string;
  private headingLevel: number;
  private dependsOn: Record<string, string>;
  private withDatePicker: boolean;
  private facetId?: string;
  private facetForDatePicker?: InsightDateFacet | DateFacet;
  private facetForDateRange?: InsightDateFacet | DateFacet;
  private filter?: InsightDateFilter | DateFilter;
  private manualTimeframes: Timeframe[] | InsightTimeframe[] = [];
  private dependenciesManager?:
    | InsightFacetConditionsManager
    | FacetConditionsManager;
  private deserializeRelativeDate: (
    date: string
  ) => InsightRelativeDate | RelativeDate;
  private getSearchStatusState: () =>
    | InsightSearchStatusState
    | SearchStatusState;

  private buildDateRange: (
    config: InsightDateRangeOptions | InsightDateRangeOptions
  ) => InsightDateRangeRequest | DateRangeRequest;

  constructor(props: TimeframeFacetCommonOptions) {
    this.host = props.host;
    this.bindings = props.bindings;
    this.label = props.label;
    this.field = props.field;
    this.headingLevel = props.headingLevel;
    this.dependsOn = props.dependsOn;
    this.withDatePicker = props.withDatePicker;
    this.deserializeRelativeDate = props.deserializeRelativeDate;
    this.getSearchStatusState = props.getSearchStatusState;
    this.buildDateRange = props.buildDateRange;

    this.validateProps();

    this.manualTimeframes = this.getManualTimeframes();

    // Initialize two facets: One that is actually used to display values for end users, which only exists
    // if we need to display something to the end user (ie: timeframes > 0)

    // A second facet is initialized only to verify the results count. It is never used to display results to end user.
    // It serves as a way to determine if the input should be rendered or not, independent of the ranges configured in the component
    if (this.manualTimeframes.length > 0) {
      this.facetForDateRange = props.initializeFacetForDateRange(
        this.currentValues
      );
      this.facetId = this.facetForDateRange.state.facetId;
    }
    if (this.withDatePicker) {
      this.facetForDatePicker = props.initializeFacetForDatePicker();
      this.filter = props.initializeFilter();

      if (!this.facetId) {
        this.facetId = this.filter.state.facetId;
      }
    }
    if (this.facetForDateRange || this.filter) {
      this.dependenciesManager = props.buildDependenciesManager();
    }
    this.registerFacetToStore();
  }

  private get enabled() {
    return (
      this.facetForDateRange?.state.enabled ??
      this.filter?.state.enabled ??
      true
    );
  }

  private get valuesToRender() {
    return (
      this.facetForDateRange?.state.values.filter(
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
    return shouldDisplayInputForFacetRange({
      hasInput: this.withDatePicker,
      hasInputRange: this.hasInputRange,
      searchStatusState: this.getSearchStatusState(),
      facetValues: this.facetForDatePicker?.state?.values || [],
    });
  }

  private get numberOfSelectedValues() {
    if (this.filter?.state?.range) {
      return 1;
    }

    return (
      this.facetForDateRange?.state.values.filter(
        ({state}) => state === 'selected'
      ).length || 0
    );
  }

  private get hasInputRange() {
    return !!this.filter?.state.range;
  }

  public get currentValues(): InsightDateRangeRequest[] | DateRangeRequest[] {
    return this.manualTimeframes.map(({period, amount, unit}) =>
      period === 'past'
        ? this.buildDateRange({
            start: {period, unit, amount},
            end: {period: 'now'},
          })
        : this.buildDateRange({
            start: {period: 'now'},
            end: {period, unit, amount},
          })
    );
  }

  public disconnectedCallback() {
    if (this.host.isConnected) {
      return;
    }
    this.dependenciesManager?.stopWatching();
  }

  private validateProps() {
    validateDependsOn(this.dependsOn);
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

  private formatFacetValue(facetValue: InsightDateFacetValue | DateFacetValue) {
    try {
      const startDate = this.deserializeRelativeDate(facetValue.start);
      const relativeDate =
        startDate.period === 'past'
          ? startDate
          : this.deserializeRelativeDate(facetValue.end);
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
  private renderValues() {
    return this.renderValuesContainer(
      this.valuesToRender.map((value) => this.renderValue(value))
    );
  }
  private renderValue(facetValue: InsightDateFacetValue) {
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

  private renderHeader(
    isCollapsed: boolean,
    headerFocus: FocusTargetController,
    onToggleCollapse: () => void
  ) {
    return (
      <FacetHeader
        i18n={this.bindings.i18n}
        label={this.label}
        onClearFilters={() => {
          headerFocus.focusAfterSearch();
          if (this.filter?.state.range) {
            this.filter?.clear();
            return;
          }
          this.facetForDateRange?.deselectAll();
        }}
        numberOfSelectedValues={this.numberOfSelectedValues}
        isCollapsed={isCollapsed}
        headingLevel={this.headingLevel}
        onToggleCollapse={onToggleCollapse}
        headerRef={headerFocus.setTarget}
      ></FacetHeader>
    );
  }

  private renderDateInput() {
    return (
      <atomic-facet-date-input
        bindings={this.bindings}
        label={this.label}
        filter={this.filter!}
        filterState={this.filter!.state!}
      ></atomic-facet-date-input>
    );
  }

  public render({
    hasError,
    firstSearchExecuted,
    isCollapsed,
    headerFocus,
    onToggleCollapse,
  }: TimeframeFacetCommonRenderProps) {
    if (hasError || !this.enabled) {
      return <Hidden></Hidden>;
    }

    if (!firstSearchExecuted) {
      return (
        <FacetPlaceholder
          numberOfValues={this.currentValues.length}
          isCollapsed={isCollapsed}
        ></FacetPlaceholder>
      );
    }

    if (!this.shouldRenderFacet) {
      return <Hidden></Hidden>;
    }

    return (
      <FacetContainer>
        {this.renderHeader(isCollapsed, headerFocus, onToggleCollapse)}
        {!isCollapsed && [
          this.shouldRenderValues && this.renderValues(),
          this.shouldRenderInput && this.renderDateInput(),
        ]}
      </FacetContainer>
    );
  }
}
