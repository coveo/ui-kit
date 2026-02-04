import {NumberValue, Schema, StringValue} from '@coveo/bueno';
import {
  buildDateFacet,
  buildDateFilter,
  buildDateRange,
  buildFacetConditionsManager,
  buildSearchStatus,
  buildTabManager,
  type CategoryFacetValueRequest,
  type DateFacet,
  type DateFilter,
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
import {type CSSResultGroup, html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import {parseDependsOn} from '@/src/components/common/facets/depends-on';
import facetCommonStyles from '@/src/components/common/facets/facet-common.tw.css';
import {renderFacetPlaceholder} from '@/src/components/common/facets/facet-placeholder/facet-placeholder';
import {TimeframeFacetCommon} from '@/src/components/common/facets/timeframe-facet-common';
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
import {mapProperty} from '@/src/utils/props-utils';

/**
 * The `atomic-timeframe-facet` component displays a facet of results for the current query as date intervals.
 *
 * @slot default - The atomic-timeframe components defining the timeframes to display.
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
  private static readonly propsSchema = new Schema({
    injectionDepth: new NumberValue({min: 0, required: false}),
    headingLevel: new NumberValue({min: 0, max: 6, required: false}),
    min: new StringValue({
      required: false,
      emptyAllowed: true,
    }),
    max: new StringValue({
      required: false,
      emptyAllowed: true,
    }),
    sortCriteria: new StringValue({
      constrainTo: ['ascending', 'descending'],
      required: false,
    }),
  });

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
  @mapProperty({attributePrefix: 'depends-on'})
  public dependsOn!: Record<string, string>;
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

  @bindStateToController('searchStatus')
  @state()
  searchStatusState!: SearchStatusState;

  @bindStateToController('tabManager')
  @state()
  tabManagerState!: TabManagerState;

  public searchStatus!: SearchStatus;
  public tabManager!: TabManager;

  private headerFocus?: FocusTargetController;
  private timeframeFacetCommon?: TimeframeFacetCommon;

  constructor() {
    super();

    new ValidatePropsController(
      this,
      () => ({
        injectionDepth: this.injectionDepth,
        headingLevel: this.headingLevel,
        min: this.min,
        max: this.max,
        sortCriteria: this.sortCriteria as string,
      }),
      AtomicTimeframeFacet.propsSchema,
      false
    );
  }

  private get focusTarget(): FocusTargetController {
    if (!this.headerFocus) {
      this.headerFocus = new FocusTargetController(this, this.bindings);
    }
    return this.headerFocus;
  }

  public initialize() {
    if (this.tabsIncluded.length > 0 && this.tabsExcluded.length > 0) {
      console.warn(
        'Values for both "tabs-included" and "tabs-excluded" have been provided. This could lead to unexpected behaviors.'
      );
    }

    this.timeframeFacetCommon = new TimeframeFacetCommon({
      facetId: this.facetId,
      host: this,
      bindings: this.bindings,
      label: this.label,
      field: this.field,
      headingLevel: this.headingLevel,
      dependsOn: parseDependsOn(this.dependsOn) ? this.dependsOn : {},
      withDatePicker: this.withDatePicker,
      setFacetId: (id: string) => {
        this.facetId = id;
        return id;
      },
      getSearchStatusState: () => this.searchStatusState,
      buildDependenciesManager: (facetId: string) =>
        buildFacetConditionsManager(this.bindings.engine, {
          facetId,
          conditions: parseDependsOn<
            FacetValueRequest | CategoryFacetValueRequest
          >(this.dependsOn),
        }),
      deserializeRelativeDate,
      buildDateRange,
      initializeFacetForDatePicker: () => this.initializeFacetForDatePicker(),
      initializeFacetForDateRange: (values: DateRangeRequest[]) =>
        this.initializeFacetForDateRange(values),
      initializeFilter: () => this.initializeFilter(),
      min: this.min,
      max: this.max,
      sortCriteria: this.sortCriteria,
    });

    this.searchStatus = buildSearchStatus(this.bindings.engine);
    this.tabManager = buildTabManager(this.bindings.engine);

    this.addEventListener(
      'atomic-date-input-apply',
      this.handleDateInputApply as EventListener
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.timeframeFacetCommon?.disconnectedCallback();
    this.removeEventListener(
      'atomic-date-input-apply',
      this.handleDateInputApply as EventListener
    );
  }

  private initializeFacetForDatePicker(): DateFacet {
    return buildDateFacet(this.bindings.engine, {
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
  }

  private initializeFacetForDateRange(values: DateRangeRequest[]): DateFacet {
    return buildDateFacet(this.bindings.engine, {
      options: {
        facetId: this.facetId!,
        field: this.field,
        currentValues: values,
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
  }

  private initializeFilter(): DateFilter {
    return buildDateFilter(this.bindings.engine, {
      options: {
        facetId: `${this.facetId}_input`,
        field: this.field,
        tabs: {
          included: this.tabsIncluded,
          excluded: this.tabsExcluded,
        },
      },
    });
  }

  private handleDateInputApply = () => {
    if (this.facetId) {
      this.bindings.engine.dispatch(
        loadDateFacetSetActions(
          this.bindings.engine
        ).deselectAllDateFacetValues(this.facetId)
      );
    }
  };

  @bindingGuard()
  @errorGuard()
  protected render() {
    return html`${when(
      this.timeframeFacetCommon,
      () =>
        this.timeframeFacetCommon!.render({
          hasError: this.searchStatusState.hasError,
          firstSearchExecuted: this.searchStatusState.firstSearchExecuted,
          isCollapsed: this.isCollapsed,
          headerFocus: this.focusTarget,
          onToggleCollapse: () => {
            this.isCollapsed = !this.isCollapsed;
            return this.isCollapsed;
          },
        }),
      () =>
        renderFacetPlaceholder({
          props: {
            numberOfValues: 5,
            isCollapsed: this.isCollapsed,
          },
        })
    )}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-timeframe-facet': AtomicTimeframeFacet;
  }
}
