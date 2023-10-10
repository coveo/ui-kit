import {h, VNode} from '@stencil/core';
import {FocusTargetController} from '../../../utils/accessibility-utils';
import {parseDate} from '../../../utils/date-utils';
import {getFieldValueCaption} from '../../../utils/field-utils';
import {randomID} from '../../../utils/utils';
import {initializePopover} from '../../search/facets/atomic-popover/popover-type';
import {Hidden} from '../hidden';
import {AnyBindings} from '../interface/bindings';
import {
  DateFacet,
  DateFacetValue,
  DateFilter,
  DateRangeOptions,
  DateRangeRequest,
  FacetConditionsManager,
  RelativeDate,
  RelativeDatePeriod,
  RelativeDateUnit,
  SearchStatusState,
} from '../types';
import {
  shouldDisplayInputForFacetRange,
  validateDependsOn,
} from './facet-common';
import {FacetInfo} from './facet-common-store';
import {FacetContainer} from './facet-container/facet-container';
import {FacetHeader} from './facet-header/facet-header';
import {FacetPlaceholder} from './facet-placeholder/facet-placeholder';
import {FacetValueLabelHighlight} from './facet-value-label-highlight/facet-value-label-highlight';
import {FacetValueLink} from './facet-value-link/facet-value-link';
import {FacetValuesGroup} from './facet-values-group/facet-values-group';

export interface Timeframe {
  period: RelativeDatePeriod;
  unit?: RelativeDateUnit;
  amount?: number;
  label?: string;
}

interface TimeframeFacetCommonOptions {
  facetId?: string;
  host: HTMLElement;
  bindings: AnyBindings;
  label: string;
  field: string;
  headingLevel: number;
  dependsOn: Record<string, string>;
  withDatePicker: boolean;
  setFacetId(id: string): string;
  getSearchStatusState(): SearchStatusState;
  buildDependenciesManager(): FacetConditionsManager;
  deserializeRelativeDate(date: string): RelativeDate;
  buildDateRange(config: DateRangeOptions): DateRangeRequest;
  initializeFacetForDatePicker(): DateFacet;
  initializeFacetForDateRange(values: DateRangeRequest[]): DateFacet;
  initializeFilter(): DateFilter;
  min?: string;
  max?: string;
}

interface TimeframeFacetCommonRenderProps {
  hasError: boolean;
  firstSearchExecuted: boolean;
  isCollapsed: boolean;
  headerFocus: FocusTargetController;
  onToggleCollapse: () => boolean;
}

export class TimeframeFacetCommon {
  private facetId?: string;
  private facetForDatePicker?: DateFacet;
  private facetForDateRange?: DateFacet;
  private filter?: DateFilter;
  private manualTimeframes: Timeframe[] = [];
  private dependenciesManager?: FacetConditionsManager;

  constructor(private props: TimeframeFacetCommonOptions) {
    this.validateProps();
    this.facetId = this.determineFacetId;
    this.props.setFacetId(this.facetId);

    this.manualTimeframes = this.getManualTimeframes();

    // Initialize two facets: One that is actually used to display values for end users, which only exists
    // if we need to display something to the end user (ie: timeframes > 0)

    // A second facet is initialized only to verify the results count. It is never used to display results to end user.
    // It serves as a way to determine if the input should be rendered or not, independent of the ranges configured in the component
    if (this.manualTimeframes.length > 0) {
      this.facetForDateRange = this.props.initializeFacetForDateRange(
        this.currentValues
      );
    }

    if (this.props.withDatePicker) {
      this.facetForDatePicker = this.props.initializeFacetForDatePicker();
      this.filter = this.props.initializeFilter();
    }

    if (this.facetForDateRange || this.filter) {
      this.dependenciesManager = this.props.buildDependenciesManager();
    }
    this.registerFacetToStore();
  }

  private get determineFacetId() {
    if (this.props.facetId) {
      return this.props.facetId;
    }

    if (this.props.bindings.store.get('dateFacets')[this.props.field]) {
      return randomID(`${this.props.field}_`);
    }

    return this.props.field;
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
      hasInput: this.props.withDatePicker,
      hasInputRange: this.hasInputRange,
      searchStatusState: this.props.getSearchStatusState(),
      facetValues: this.facetForDatePicker?.state?.values || [],
    });
  }

  private get hasValues() {
    if (this.facetForDatePicker?.state.values.length) {
      return true;
    }

    return !!this.valuesToRender.length;
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

  public get currentValues(): DateRangeRequest[] {
    return this.manualTimeframes.map(({period, amount, unit}) =>
      period === 'past'
        ? this.props.buildDateRange({
            start: {period, unit, amount},
            end: {period: 'now'},
          })
        : this.props.buildDateRange({
            start: {period: 'now'},
            end: {period, unit, amount},
          })
    );
  }

  public disconnectedCallback() {
    if (this.props.host.isConnected) {
      return;
    }
    this.dependenciesManager?.stopWatching();
  }

  private get isHidden() {
    return !this.shouldRenderFacet || !this.enabled;
  }

  private validateProps() {
    validateDependsOn(this.props.dependsOn);
  }

  private registerFacetToStore() {
    const facetInfo: FacetInfo = {
      label: () => this.props.bindings.i18n.t(this.props.label),
      facetId: this.facetId!,
      element: this.props.host,
      isHidden: () => this.isHidden,
    };

    this.props.bindings.store.registerFacet('dateFacets', {
      ...facetInfo,
      format: (value) => this.formatFacetValue(value),
    });

    initializePopover(this.props.host, {
      ...facetInfo,
      hasValues: () => this.hasValues,
      numberOfActiveValues: () => this.numberOfSelectedValues,
    });

    if (this.filter) {
      this.props.bindings.store.state.dateFacets[this.filter.state.facetId] =
        this.props.bindings.store.state.dateFacets[this.facetId!];
    }
  }

  private getManualTimeframes(): Timeframe[] {
    return Array.from(this.props.host.querySelectorAll('atomic-timeframe')).map(
      ({label, amount, unit, period}) => ({
        label,
        amount,
        unit,
        period,
      })
    );
  }

  private formatFacetValue(facetValue: DateFacetValue) {
    try {
      const startDate = this.props.deserializeRelativeDate(facetValue.start);
      const relativeDate =
        startDate.period === 'past'
          ? startDate
          : this.props.deserializeRelativeDate(facetValue.end);
      const timeframe = this.getManualTimeframes().find(
        (timeframe) =>
          timeframe.period === relativeDate.period &&
          timeframe.unit === relativeDate.unit &&
          timeframe.amount === relativeDate.amount
      );

      if (timeframe?.label) {
        return getFieldValueCaption(
          this.props.field,
          timeframe.label,
          this.props.bindings.i18n
        );
      }
      return this.props.bindings.i18n.t(
        `${relativeDate.period}-${relativeDate.unit}`,
        {
          count: relativeDate.amount,
        }
      );
    } catch (error) {
      return this.props.bindings.i18n.t('to', {
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
        i18n={this.props.bindings.i18n}
        onClick={() => this.facetForDateRange!.toggleSingleSelect(facetValue)}
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
      <FacetValuesGroup
        i18n={this.props.bindings.i18n}
        label={this.props.label}
      >
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
        i18n={this.props.bindings.i18n}
        label={this.props.label}
        onClearFilters={() => {
          headerFocus.focusAfterSearch();
          if (this.filter?.state.range) {
            this.filter?.clear();
            return;
          }
          this.facetForDateRange?.deselectAll();
        }}
        numberOfActiveValues={this.numberOfSelectedValues}
        isCollapsed={isCollapsed}
        headingLevel={this.props.headingLevel}
        onToggleCollapse={onToggleCollapse}
        headerRef={(el) => headerFocus.setTarget(el)}
      ></FacetHeader>
    );
  }

  private renderDateInput() {
    return (
      <atomic-facet-date-input
        min={this.props.min}
        max={this.props.max}
        bindings={this.props.bindings}
        label={this.props.label}
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
