import {ArrayValue, MapValue, NumberValue, Schema} from '@coveo/bueno';
import {
  buildDateFacet,
  buildDateFilter,
  buildDateRange,
  buildFacetConditionsManager,
  buildSearchStatus,
  buildTabManager,
  type CategoryFacetValueRequest,
  type DateFacet,
  type DateFacetState,
  type DateFacetValue,
  type DateFilter,
  type DateFilterState,
  type DateRangeRequest,
  deserializeRelativeDate,
  type FacetValueRequest,
  loadDateFacetSetActions,
  type RangeFacetSortCriterion,
  type SearchStatus,
  type SearchStatusState,
  type TabManager,
  type TabManagerState,
} from '@coveo/headless';
import {type CSSResultGroup, html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import {parseDependsOn} from '@/src/components/common/facets/depends-on';
import {shouldDisplayInputForFacetRange} from '@/src/components/common/facets/facet-common';
import facetCommonStyles from '@/src/components/common/facets/facet-common.tw.css';
import type {FacetInfo} from '@/src/components/common/facets/facet-common-store';
import {renderFacetContainer} from '@/src/components/common/facets/facet-container/facet-container';
import {renderFacetHeader} from '@/src/components/common/facets/facet-header/facet-header';
import {renderFacetPlaceholder} from '@/src/components/common/facets/facet-placeholder/facet-placeholder';
import {renderFacetValueLabelHighlight} from '@/src/components/common/facets/facet-value-label-highlight/facet-value-label-highlight';
import {renderFacetValueLink} from '@/src/components/common/facets/facet-value-link/facet-value-link';
import {renderFacetValuesGroup} from '@/src/components/common/facets/facet-values-group/facet-values-group';
import {initializePopover} from '@/src/components/common/facets/popover/popover-type';
import {ValidatePropsController} from '@/src/components/common/validate-props-controller/validate-props-controller';
import type {Bindings} from '@/src/components/search/atomic-search-interface/atomic-search-interface';
import {arrayConverter} from '@/src/converters/array-converter';
import {booleanConverter} from '@/src/converters/boolean-converter';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {FocusTargetController} from '@/src/utils/accessibility-utils';
import {parseDate} from '@/src/utils/date-utils';
import {getFieldValueCaption} from '@/src/utils/field-utils';
import {mapProperty} from '@/src/utils/props-utils';
import {randomID} from '@/src/utils/utils';
import '../../common/atomic-facet-date-input/atomic-facet-date-input';
import type {FacetDateInputEventDetails} from '../../common/atomic-facet-date-input/atomic-facet-date-input';

interface Timeframe {
  period: 'past' | 'next' | 'now';
  unit?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  amount?: number;
  label?: string;
}

/**
 * The `atomic-timeframe-facet` component displays a facet of results for the current query as date intervals.
 *
 * @part facet - The wrapper for the entire facet.
 * @part placeholder - The placeholder shown before the first search is executed.
 * @part label-button - The button that displays the label and allows to expand/collapse the facet.
 * @part label-button-icon - The label button icon.
 * @part clear-button - The button that resets the actively selected facet values.
 * @part clear-button-icon - The clear button icon.
 * @part values - The facet values container.
 * @part value-link - A facet value button.
 * @part value-link-selected - A selected facet value button.
 * @part value-count - The result count for a facet value.
 * @part value-label - The label text of a facet value.
 * @part input-start - The starting value of the custom date range.
 * @part input-end - The ending value of the custom date range.
 * @part input-label - The label for both the start and end input.
 * @part input-apply-button - The apply button for the custom range.
 */
@customElement('atomic-timeframe-facet')
@bindings()
@withTailwindStyles
export class AtomicTimeframeFacet
  extends LitElement
  implements InitializableComponent<Bindings>
{
  static styles: CSSResultGroup = facetCommonStyles;

  /**
   * The non-localized label for the facet.
   * Used in the atomic-breadbox component through the bindings store.
   */
  @property({reflect: true}) label = 'no-label';
  /**
   * The field whose values you want to display in the facet.
   */
  @property({reflect: true}) field = 'date';
  /**
   * The tabs on which the facet can be displayed. This property should not be used at the same time as `tabs-excluded`.
   *
   * Set this property as a stringified JSON array, for example:
   * ```html
   *  <atomic-timeframe-facet tabs-included='["tabIDA", "tabIDB"]'></atomic-timeframe-facet>
   * ```
   * If you don't set this property, the facet can be displayed on any tab. Otherwise, the facet can only be displayed on the specified tabs.
   */
  @property({
    reflect: true,
    converter: arrayConverter,
    attribute: 'tabs-included',
  })
  tabsIncluded: string[] = [];
  /**
   * The tabs on which this facet must not be displayed. This property should not be used at the same time as `tabs-included`.
   *
   * Set this property as a stringified JSON array, for example:
   * ```html
   *  <atomic-timeframe-facet tabs-excluded='["tabIDA", "tabIDB"]'></atomic-timeframe-facet>
   * ```
   * If you don't set this property, the facet can be displayed on any tab. Otherwise, the facet won't be displayed on any of the specified tabs.
   */
  @property({
    reflect: true,
    converter: arrayConverter,
    attribute: 'tabs-excluded',
  })
  tabsExcluded: string[] = [];
  /**
   * Whether this facet should contain a datepicker allowing users to set custom ranges.
   */
  @property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter,
    attribute: 'with-date-picker',
  })
  withDatePicker = false;
  /**
   * Specifies whether the facet is collapsed. When the facet is the child of an `atomic-facet-manager` component, the facet manager controls this property.
   */
  @property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter,
    attribute: 'is-collapsed',
  })
  isCollapsed = false;
  /**
   * The [heading level](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements) to use for the heading over the facet, from 1 to 6.
   */
  @property({type: Number, reflect: true, attribute: 'heading-level'})
  headingLevel = 0;
  /**
   * Whether to exclude the parents of folded results when estimating the result count for each facet value.
   *
   * Note: Resulting count is only an estimation, in some cases this value could be incorrect.
   */
  @property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter,
    attribute: 'filter-facet-count',
  })
  filterFacetCount = true;
  /**
   * The maximum number of results to scan in the index to ensure that the facet lists all potential facet values.
   * Note: A high injectionDepth may negatively impact the facet request performance.
   * Minimum: `0`
   * Default: `1000`
   */
  @property({type: Number, reflect: true, attribute: 'injection-depth'})
  injectionDepth = 1000;
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
  @property() dependsOn: Record<string, string> = {};
  /**
   * The earliest date to accept from user input when the `withDatepicker` option is enabled.
   *
   * This value must be a valid date string in the format `YYYY-MM-DD`.
   *
   * If this format is not respected, the date picker ignores this property, behaving as if no `min` value had been set.
   *
   * See also [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/date#min).
   */
  @property({reflect: true}) min?: string;
  /**
   * The latest date to accept from user input when the `withDatepicker` option is enabled.
   *
   * This value must be a valid date string in the format `YYYY-MM-DD`.
   *
   * If this format is not respected, the date picker ignores this property, behaving as if no `max` value had been set.
   *
   * See also [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/date#max).
   */
  @property({reflect: true}) max?: string;
  /**
   * The sort criterion to apply to the returned facet values.
   * Possible values are 'ascending' and 'descending'.
   */
  @property({
    reflect: true,
    attribute: 'sort-criteria',
  })
  sortCriteria: RangeFacetSortCriterion = 'descending';
  /**
   * Specifies a unique identifier for the facet.
   */
  @property({reflect: true, attribute: 'facet-id'}) facetId?: string;

  @state() bindings!: Bindings;
  @state() error!: Error;

  @bindStateToController('facetForDateRange')
  @state()
  facetState?: DateFacetState;

  @bindStateToController('facetForDatePicker')
  @state()
  facetForDatePickerState?: DateFacetState;

  @bindStateToController('filter')
  @state()
  filterState?: DateFilterState;

  @bindStateToController('searchStatus')
  @state()
  searchStatusState!: SearchStatusState;

  @bindStateToController('tabManager')
  @state()
  tabManagerState!: TabManagerState;

  public facetForDateRange?: DateFacet;
  public facetForDatePicker?: DateFacet;
  public filter?: DateFilter;
  public searchStatus!: SearchStatus;
  public tabManager!: TabManager;

  private headerFocus?: FocusTargetController;
  private manualTimeframes: Timeframe[] = [];
  private facetForDateRangeDependenciesManager?: ReturnType<
    typeof buildFacetConditionsManager
  >;
  private facetForDatePickerDependenciesManager?: ReturnType<
    typeof buildFacetConditionsManager
  >;
  private filterDependenciesManager?: ReturnType<
    typeof buildFacetConditionsManager
  >;

  constructor() {
    super();

    new ValidatePropsController(
      this,
      () => ({
        injectionDepth: this.injectionDepth,
        tabsIncluded: this.tabsIncluded,
        tabsExcluded: this.tabsExcluded,
        dependsOn: this.dependsOn,
      }),
      new Schema({
        injectionDepth: new NumberValue({min: 0, required: false}),
        tabsIncluded: new ArrayValue({required: false}),
        tabsExcluded: new ArrayValue({required: false}),
        dependsOn: new MapValue({required: false}),
      })
    );
  }

  private get focusTarget(): FocusTargetController {
    if (!this.headerFocus) {
      this.headerFocus = new FocusTargetController(this, this.bindings);
    }
    return this.headerFocus;
  }

  private get determineFacetId() {
    if (this.facetId) {
      return this.facetId;
    }

    if (this.bindings.store.state.dateFacets[this.field]) {
      return randomID(`${this.field}_`);
    }

    return this.field;
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
    return shouldDisplayInputForFacetRange({
      hasInput: this.withDatePicker,
      hasInputRange: this.hasInputRange,
      searchStatusState: this.searchStatusState,
      facetValues: this.facetForDatePickerState?.values || [],
    });
  }

  private get hasValues() {
    if (this.facetForDatePickerState?.values.length) {
      return true;
    }

    return !!this.valuesToRender.length;
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

  private get hasInputRange() {
    return !!this.filterState?.range;
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

  private get isHidden() {
    return !this.shouldRenderFacet || !this.enabled;
  }

  public initialize() {
    if (this.tabsIncluded.length > 0 && this.tabsExcluded.length > 0) {
      console.warn(
        'Values for both "tabs-included" and "tabs-excluded" have been provided. This could lead to unexpected behaviors.'
      );
    }

    this.facetId = this.determineFacetId;
    this.manualTimeframes = this.getManualTimeframes();

    if (this.manualTimeframes.length > 0) {
      this.facetForDateRange = buildDateFacet(this.bindings.engine, {
        options: {
          facetId: this.facetId,
          field: this.field,
          currentValues: this.currentValues,
          generateAutomaticRanges: false,
          sortCriteria: this.sortCriteria,
          filterFacetCount: this.filterFacetCount,
          injectionDepth: this.injectionDepth,
          tabs: {
            included: this.tabsIncluded,
            excluded: this.tabsExcluded,
          },
        },
      });

      if (parseDependsOn(this.dependsOn)) {
        this.facetForDateRangeDependenciesManager = buildFacetConditionsManager(
          this.bindings.engine,
          {
            facetId: this.facetForDateRange.state.facetId,
            conditions: parseDependsOn<
              FacetValueRequest | CategoryFacetValueRequest
            >(this.dependsOn),
          }
        );
      }
    }

    if (this.withDatePicker) {
      this.facetForDatePicker = buildDateFacet(this.bindings.engine, {
        options: {
          facetId: `${this.facetId}_input_range`,
          numberOfValues: 1,
          generateAutomaticRanges: true,
          field: this.field,
          filterFacetCount: this.filterFacetCount,
          injectionDepth: this.injectionDepth,
          tabs: {
            included: this.tabsIncluded,
            excluded: this.tabsExcluded,
          },
        },
      });

      if (parseDependsOn(this.dependsOn)) {
        this.facetForDatePickerDependenciesManager =
          buildFacetConditionsManager(this.bindings.engine, {
            facetId: this.facetForDatePicker.state.facetId,
            conditions: parseDependsOn<
              FacetValueRequest | CategoryFacetValueRequest
            >(this.dependsOn),
          });
      }

      this.filter = buildDateFilter(this.bindings.engine, {
        options: {
          facetId: `${this.facetId}_input`,
          field: this.field,
          tabs: {
            included: this.tabsIncluded,
            excluded: this.tabsExcluded,
          },
        },
      });

      if (parseDependsOn(this.dependsOn)) {
        this.filterDependenciesManager = buildFacetConditionsManager(
          this.bindings.engine,
          {
            facetId: this.filter.state.facetId,
            conditions: parseDependsOn<
              FacetValueRequest | CategoryFacetValueRequest
            >(this.dependsOn),
          }
        );
      }
    }

    this.searchStatus = buildSearchStatus(this.bindings.engine);
    this.tabManager = buildTabManager(this.bindings.engine);

    this.registerFacetToStore();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.isConnected) {
      return;
    }
    this.facetForDateRangeDependenciesManager?.stopWatching();
    this.facetForDatePickerDependenciesManager?.stopWatching();
    this.filterDependenciesManager?.stopWatching();
  }

  private registerFacetToStore() {
    const facetInfo: FacetInfo = {
      label: () => this.bindings.i18n.t(this.label),
      facetId: this.facetId!,
      element: this,
      isHidden: () => this.isHidden,
    };

    this.bindings.store.registerFacet('dateFacets', {
      ...facetInfo,
      format: (value) => this.formatFacetValue(value),
    });

    initializePopover(this, {
      ...facetInfo,
      hasValues: () => this.hasValues,
      numberOfActiveValues: () => this.numberOfSelectedValues,
    });

    if (this.filter) {
      this.bindings.store.state.dateFacets[this.filter.state.facetId] =
        this.bindings.store.state.dateFacets[this.facetId!];
    }
  }

  private getManualTimeframes(): Timeframe[] {
    return Array.from(this.querySelectorAll('atomic-timeframe')).map(
      (element) => {
        const timeframeElement = element as unknown as {
          label?: string;
          amount?: number;
          unit?: 'day' | 'week' | 'month' | 'quarter' | 'year';
          period: 'past' | 'next' | 'now';
        };
        return {
          label: timeframeElement.label,
          amount: timeframeElement.amount,
          unit: timeframeElement.unit,
          period: timeframeElement.period,
        };
      }
    );
  }

  private formatFacetValue(facetValue: DateFacetValue) {
    try {
      const startDate = deserializeRelativeDate(facetValue.start);
      const relativeDate =
        startDate.period === 'past'
          ? startDate
          : deserializeRelativeDate(facetValue.end);
      const timeframe = this.manualTimeframes.find(
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
    } catch (_error) {
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
    return renderFacetValueLink({
      props: {
        displayValue,
        isSelected,
        numberOfResults: facetValue.numberOfResults,
        i18n: this.bindings.i18n,
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

  private renderValuesContainer(children: unknown[]) {
    return renderFacetValuesGroup({
      props: {
        i18n: this.bindings.i18n,
        label: this.label,
      },
    })(
      html`<ul class="mt-3" part="values">
        ${children}
      </ul>`
    );
  }

  private renderHeader() {
    return renderFacetHeader({
      props: {
        i18n: this.bindings.i18n,
        label: this.label,
        onClearFilters: () => {
          this.focusTarget.focusAfterSearch();
          if (this.filterState?.range) {
            this.filter?.clear();
            return;
          }
          this.facetForDateRange?.deselectAll();
        },
        numberOfActiveValues: this.numberOfSelectedValues,
        isCollapsed: this.isCollapsed,
        headingLevel: this.headingLevel,
        onToggleCollapse: () => {
          this.isCollapsed = !this.isCollapsed;
        },
        headerRef: (el) => this.focusTarget.setTarget(el),
      },
    });
  }

  private renderDateInput() {
    return html`
      <atomic-facet-date-input
        .min=${this.min}
        .max=${this.max}
        .label=${this.label}
        .inputRange=${this.filterState?.range}
        .facetId=${this.filter!.state.facetId}
        @atomic-date-input-apply=${(
          event: CustomEvent<FacetDateInputEventDetails>
        ) => {
          const {start, end, endInclusive} = event.detail;
          this.filter!.setRange({
            start,
            end,
            endInclusive,
          });
          if (this.facetId) {
            this.bindings.engine.dispatch(
              loadDateFacetSetActions(
                this.bindings.engine
              ).deselectAllDateFacetValues(this.facetId)
            );
          }
        }}
      ></atomic-facet-date-input>
    `;
  }

  @bindingGuard()
  @errorGuard()
  protected render() {
    const {hasError, firstSearchExecuted} = this.searchStatusState;

    if (hasError || !this.enabled) {
      return nothing;
    }

    if (!firstSearchExecuted) {
      return renderFacetPlaceholder({
        props: {
          numberOfValues: this.currentValues.length || 5,
          isCollapsed: this.isCollapsed,
        },
      });
    }

    if (!this.shouldRenderFacet) {
      return nothing;
    }

    return html`${renderFacetContainer()(
      html`${this.renderHeader()}
        ${when(
          !this.isCollapsed,
          () => html`
            ${when(this.shouldRenderValues, () => this.renderValues())}
            ${when(this.shouldRenderInput, () => this.renderDateInput())}
          `
        )}`
    )}`;
  }
}

mapProperty(AtomicTimeframeFacet, 'dependsOn');

declare global {
  interface HTMLElementTagNameMap {
    'atomic-timeframe-facet': AtomicTimeframeFacet;
  }
}
