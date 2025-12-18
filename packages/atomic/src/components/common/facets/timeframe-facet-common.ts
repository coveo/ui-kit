import type {
  DateFacet,
  DateFacetValue,
  DateFilter,
  DateRangeOptions,
  DateRangeRequest,
  FacetConditionsManager,
  RangeFacetSortCriterion,
  RelativeDate,
  RelativeDatePeriod,
  RelativeDateUnit,
  SearchStatusState,
} from '@coveo/headless';
import {html, nothing, type TemplateResult} from 'lit';
import type {InsightBindings} from '@/src/components/insight/atomic-insight-interface/atomic-insight-interface';
import type {Bindings as SearchBindings} from '@/src/components/search/atomic-search-interface/atomic-search-interface';
import type {FocusTargetController} from '@/src/utils/accessibility-utils';
import {parseDate} from '@/src/utils/date-utils';
import {getFieldValueCaption} from '@/src/utils/field-utils';
import {randomID} from '@/src/utils/utils';
import {shouldDisplayInputForFacetRange} from './facet-common';
import type {FacetInfo} from './facet-common-store';
import {renderFacetContainer} from './facet-container/facet-container';
import {renderFacetHeader} from './facet-header/facet-header';
import {renderFacetPlaceholder} from './facet-placeholder/facet-placeholder';
import {renderFacetValueLabelHighlight} from './facet-value-label-highlight/facet-value-label-highlight';
import {renderFacetValueLink} from './facet-value-link/facet-value-link';
import {renderFacetValuesGroup} from './facet-values-group/facet-values-group';
import {initializePopover} from './popover/popover-type';

export interface Timeframe {
  period: RelativeDatePeriod;
  unit?: RelativeDateUnit;
  amount?: number;
  label?: string;
}

interface TimeframeFacetCommonOptions {
  facetId?: string;
  host: HTMLElement;
  bindings: SearchBindings | InsightBindings;
  label: string;
  field: string;
  headingLevel: number;
  dependsOn: Record<string, string>;
  withDatePicker: boolean;
  setFacetId(id: string): string;
  getSearchStatusState(): SearchStatusState;
  buildDependenciesManager(facetId: string): FacetConditionsManager;
  deserializeRelativeDate(date: string): RelativeDate;
  buildDateRange(config: DateRangeOptions): DateRangeRequest;
  initializeFacetForDatePicker(): DateFacet;
  initializeFacetForDateRange(values: DateRangeRequest[]): DateFacet;
  initializeFilter(): DateFilter;
  min?: string;
  max?: string;
  sortCriteria: RangeFacetSortCriterion;
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
  private facetForDateRangeDependenciesManager?: FacetConditionsManager;
  private facetForDatePickerDependenciesManager?: FacetConditionsManager;
  private filterDependenciesManager?: FacetConditionsManager;

  constructor(private props: TimeframeFacetCommonOptions) {
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
      this.facetForDatePickerDependenciesManager =
        this.props.buildDependenciesManager(
          this.facetForDatePicker.state.facetId
        );
      this.filter = this.props.initializeFilter();
    }

    if (this.facetForDateRange) {
      this.facetForDateRangeDependenciesManager =
        this.props.buildDependenciesManager(
          this.facetForDateRange?.state.facetId
        );
    }

    if (this.filter) {
      this.filterDependenciesManager = this.props.buildDependenciesManager(
        this.filter?.state.facetId
      );
    }

    this.registerFacetToStore();
  }

  private get determineFacetId() {
    if (this.props.facetId) {
      return this.props.facetId;
    }

    if (this.props.bindings.store.state.dateFacets[this.props.field]) {
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
    this.facetForDateRangeDependenciesManager?.stopWatching();
    this.facetForDatePickerDependenciesManager?.stopWatching();
    this.filterDependenciesManager?.stopWatching();
  }

  private get isHidden() {
    return !this.shouldRenderFacet || !this.enabled;
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
    } catch (_error) {
      return this.props.bindings.i18n.t('to', {
        start: parseDate(facetValue.start).format('YYYY-MM-DD'),
        end: parseDate(facetValue.end).format('YYYY-MM-DD'),
      });
    }
  }

  private renderValues(): TemplateResult | typeof nothing {
    return this.renderValuesContainer(
      this.valuesToRender.map((value) => this.renderValue(value))
    );
  }

  private renderValue(
    facetValue: DateFacetValue
  ): TemplateResult | typeof nothing {
    const displayValue = this.formatFacetValue(facetValue);
    const isSelected = facetValue.state === 'selected';
    const isExcluded = facetValue.state === 'excluded';
    return renderFacetValueLink({
      props: {
        displayValue,
        isSelected,
        numberOfResults: facetValue.numberOfResults,
        i18n: this.props.bindings.i18n,
        onClick: () => this.facetForDateRange!.toggleSingleSelect(facetValue),
      },
    })(
      renderFacetValueLabelHighlight({
        props: {
          displayValue,
          isSelected,
          isExcluded,
        },
      })
    );
  }

  private renderValuesContainer(
    children: (TemplateResult | typeof nothing)[]
  ): TemplateResult | typeof nothing {
    return renderFacetValuesGroup({
      props: {
        i18n: this.props.bindings.i18n,
        label: this.props.label,
      },
    })(html`<ul class="mt-3" part="values">
      ${children}
    </ul>`);
  }

  private renderHeader(
    isCollapsed: boolean,
    headerFocus: FocusTargetController,
    onToggleCollapse: () => void
  ): TemplateResult | typeof nothing {
    return renderFacetHeader({
      props: {
        i18n: this.props.bindings.i18n,
        label: this.props.label,
        onClearFilters: () => {
          headerFocus.focusAfterSearch();
          if (this.filter?.state.range) {
            this.filter?.clear();
            return;
          }
          this.facetForDateRange?.deselectAll();
        },
        numberOfActiveValues: this.numberOfSelectedValues,
        isCollapsed,
        headingLevel: this.props.headingLevel,
        onToggleCollapse,
        headerRef: (el) => headerFocus.setTarget(el),
      },
    });
  }

  private renderDateInput(): TemplateResult {
    return html`<atomic-facet-date-input
      .min=${this.props.min}
      .max=${this.props.max}
      .label=${this.props.label}
      .facetId=${this.filter!.state!.facetId}
      .inputRange=${this.filter!.state.range}
      @atomic-date-input-apply=${(
        event: CustomEvent<{start: string; end: string; endInclusive: boolean}>
      ) => {
        this.filter!.setRange({
          start: event.detail.start,
          end: event.detail.end,
        });
      }}
    ></atomic-facet-date-input>`;
  }

  public render({
    hasError,
    firstSearchExecuted,
    isCollapsed,
    headerFocus,
    onToggleCollapse,
  }: TimeframeFacetCommonRenderProps): TemplateResult | typeof nothing {
    if (hasError || !this.enabled) {
      return nothing;
    }

    if (!firstSearchExecuted) {
      return renderFacetPlaceholder({
        props: {
          numberOfValues: this.currentValues.length,
          isCollapsed,
        },
      });
    }

    if (!this.shouldRenderFacet) {
      return nothing;
    }

    return renderFacetContainer()(
      html`${this.renderHeader(isCollapsed, headerFocus, onToggleCollapse)}
        ${
          !isCollapsed
            ? html`${this.shouldRenderValues ? this.renderValues() : nothing}
              ${this.shouldRenderInput ? this.renderDateInput() : nothing}`
            : nothing
        }`
    );
  }
}
