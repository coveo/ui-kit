import {
  buildDateFacet,
  buildDateFilter,
  buildDateRange,
  buildFacetConditionsManager,
  buildSearchStatus,
  DateFacet,
  DateFacetState,
  DateFilter,
  DateFilterState,
  DateRangeRequest,
  deserializeRelativeDate,
  RangeFacetSortCriterion,
  loadDateFacetSetActions,
  SearchStatus,
  SearchStatusState,
  FacetValueRequest,
  CategoryFacetValueRequest,
  buildTabManager,
  TabManager,
  TabManagerState,
} from '@coveo/headless';
import {Component, Element, h, Listen, Prop, State} from '@stencil/core';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {ArrayProp, MapProp} from '../../../../utils/props-utils';
import {FocusTargetController} from '../../../../utils/stencil-accessibility-utils';
import {parseDependsOn} from '../../../common/facets/depends-on';
import {FacetPlaceholder} from '../../../common/facets/facet-placeholder/stencil-facet-placeholder';
import {TimeframeFacetCommon} from '../../../common/facets/stencil-timeframe-facet-common';
import {Bindings} from '../../atomic-search-interface/atomic-search-interface';

/**
 * A facet is a list of values for a certain field occurring in the results.
 * An `atomic-timeframe-facet` displays a facet of the results for the current query as date intervals.
 *
 * @slot default - The `atomic-timeframe` components defining the timeframes to display.
 *
 * @part facet - The wrapper for the entire facet.
 * @part placeholder - The placeholder shown before the first search is executed.
 *
 * @part label-button - The button that displays the label and allows to expand/collapse the facet.
 * @part label-button-icon - The label button icon.
 * @part clear-button - The button that resets the actively selected facet values.
 * @part clear-button-icon - The clear button icon.
 *
 * @part values - The facet values container.
 * @part value-label - The facet value label, common for all displays.
 * @part value-count - The facet value count, common for all displays.
 * @part value-link - The facet value when display is 'link'.
 * @part value-link-selected - The selected facet value when display is 'link'.
 *
 * @part input-start - The input for the starting value of the custom date range.
 * @part input-end - The input for the ending value of the custom date range.
 * @part input-label - The label for both the start and end input.
 * @part input-apply-button - The apply button for the custom range.
 */
@Component({
  tag: 'atomic-timeframe-facet',
  styleUrl: './atomic-timeframe-facet.pcss',
  shadow: true,
})
export class AtomicTimeframeFacet implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  public facetForDateRange?: DateFacet;
  public facetForDatePicker?: DateFacet;

  private timeframeFacetCommon?: TimeframeFacetCommon;
  public filter?: DateFilter;
  public searchStatus!: SearchStatus;
  public tabManager!: TabManager;
  @Element() private host!: HTMLElement;

  @BindStateToController('facetForDateRange')
  @State()
  public facetState!: DateFacetState;
  @BindStateToController('facetForDatePicker')
  @State()
  public facetForDatePickerState?: DateFacetState;
  @BindStateToController('filter')
  @State()
  public filterState?: DateFilterState;
  @BindStateToController('searchStatus')
  @State()
  public searchStatusState!: SearchStatusState;
  @BindStateToController('tabManager')
  @State()
  public tabManagerState!: TabManagerState;
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
   * The tabs on which the facet can be displayed. This property should not be used at the same time as `tabs-excluded`.
   *
   * Set this property as a stringified JSON array, for example:
   * ```html
   *  <atomic-timeframe-facet tabs-included='["tabIDA", "tabIDB"]'></atomic-timeframe-facet>
   * ```
   * If you don't set this property, the facet can be displayed on any tab. Otherwise, the facet can only be displayed on the specified tabs.
   */
  @ArrayProp()
  @Prop({reflect: true, mutable: true})
  public tabsIncluded: string[] | string = '[]';

  /**
   * The tabs on which this facet must not be displayed. This property should not be used at the same time as `tabs-included`.
   *
   * Set this property as a stringified JSON array, for example:
   * ```html
   *  <atomic-timeframe-facet tabs-excluded='["tabIDA", "tabIDB"]'></atomic-timeframe-facet>
   * ```
   * If you don't set this property, the facet can be displayed on any tab. Otherwise, the facet won't be displayed on any of the specified tabs.
   */
  @ArrayProp()
  @Prop({reflect: true, mutable: true})
  public tabsExcluded: string[] | string = '[]';

  /**
   * Whether this facet should contain an datepicker allowing users to set custom ranges.
   */
  @Prop({reflect: true}) public withDatePicker = false;
  /**
   * Specifies whether the facet is collapsed. When the facet is the child of an `atomic-facet-manager` component, the facet manager controls this property.
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
  @MapProp() @Prop() public dependsOn: Record<string, string> = {};

  /**
   * The earliest date to accept from user input when the `withDatepicker` option is enabled.
   *
   * This value must be a valid date string in the format `YYYY-MM-DD`.
   *
   * If this format is not respected, the date picker ignores this property, behaving as if no `min` value had been set.
   *
   * See also [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/date#min).
   */
  @Prop({reflect: true}) public min?: string;

  /**
   * The latest date to accept from user input when the `withDatepicker` option is enabled.
   *
   * This value must be a valid date string in the format `YYYY-MM-DD`.
   *
   * If this format is not respected, the date picker ignores this property, behaving as if no `max` value had been set.
   *
   * See also [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/date#max).
   */
  @Prop({reflect: true}) public max?: string;

  /**
   * The sort criterion to apply to the returned facet values.
   * Possible values are 'ascending' and 'descending'.
   */
  @Prop({reflect: true}) public sortCriteria: RangeFacetSortCriterion =
    'descending';

  private headerFocus?: FocusTargetController;

  private get focusTarget(): FocusTargetController {
    if (!this.headerFocus) {
      this.headerFocus = new FocusTargetController(this);
    }
    return this.headerFocus;
  }

  public initialize() {
    if (
      [...this.tabsIncluded].length > 0 &&
      [...this.tabsExcluded].length > 0
    ) {
      console.warn(
        'Values for both "tabs-included" and "tabs-excluded" have been provided. This is could lead to unexpected behaviors.'
      );
    }
    this.timeframeFacetCommon = new TimeframeFacetCommon({
      facetId: this.facetId,
      host: this.host,
      bindings: this.bindings,
      label: this.label,
      field: this.field,
      headingLevel: this.headingLevel,
      dependsOn: parseDependsOn(this.dependsOn) && this.dependsOn,
      withDatePicker: this.withDatePicker,
      setFacetId: (id: string) => (this.facetId = id),
      buildDependenciesManager: (facetId: string) =>
        buildFacetConditionsManager(this.bindings.engine, {
          facetId,
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
    this.tabManager = buildTabManager(this.bindings.engine);
  }

  public disconnectedCallback() {
    this.timeframeFacetCommon?.disconnectedCallback();
  }

  private initializeFacetForDatePicker() {
    this.facetForDatePicker = buildDateFacet(this.bindings.engine, {
      options: {
        facetId: `${this.facetId}_input_range`,
        numberOfValues: 1,
        generateAutomaticRanges: true,
        field: this.field,
        filterFacetCount: this.filterFacetCount,
        injectionDepth: this.injectionDepth,
        tabs: {
          included: [...this.tabsIncluded],
          excluded: [...this.tabsExcluded],
        },
      },
    });
    return this.facetForDatePicker;
  }

  private initializeFacetForDateRange(values: DateRangeRequest[]) {
    this.facetForDateRange = buildDateFacet(this.bindings.engine, {
      options: {
        facetId: this.facetId,
        field: this.field,
        currentValues: values,
        generateAutomaticRanges: false,
        sortCriteria: this.sortCriteria,
        filterFacetCount: this.filterFacetCount,
        injectionDepth: this.injectionDepth,
        tabs: {
          included: [...this.tabsIncluded],
          excluded: [...this.tabsExcluded],
        },
      },
    });
    return this.facetForDateRange;
  }

  private initializeFilter() {
    this.filter = buildDateFilter(this.bindings.engine, {
      options: {
        facetId: `${this.facetId}_input`,
        field: this.field,
        tabs: {
          included: [...this.tabsIncluded],
          excluded: [...this.tabsExcluded],
        },
      },
    });

    return this.filter;
  }

  @Listen('atomic/dateInputApply')
  public applyDateInput() {
    this.facetId &&
      this.bindings.engine.dispatch(
        loadDateFacetSetActions(
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
