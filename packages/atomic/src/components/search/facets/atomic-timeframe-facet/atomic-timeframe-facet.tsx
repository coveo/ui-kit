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
  loadDateFacetSetActions,
  SearchStatus,
  SearchStatusState,
} from '@coveo/headless';
import {Component, Element, h, Listen, Prop, State} from '@stencil/core';
import {
  FocusTarget,
  FocusTargetController,
} from '../../../../utils/accessibility-utils';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {MapProp} from '../../../../utils/props-utils';
import {BaseFacet, parseDependsOn} from '../../../common/facets/facet-common';
import {FacetPlaceholder} from '../../../common/facets/facet-placeholder/facet-placeholder';
import {TimeframeFacetCommon} from '../../../common/facets/timeframe-facet-common';
import {Bindings} from '../../atomic-search-interface/atomic-search-interface';

/**
 * A facet is a list of values for a certain field occurring in the results.
 * An `atomic-timeframe-facet` displays a facet of the results for the current query as date intervals.
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
export class AtomicTimeframeFacet
  implements InitializableComponent, BaseFacet<DateFacet>
{
  @InitializeBindings() public bindings!: Bindings;
  public facetForDateRange?: DateFacet;
  public facetForDatePicker?: DateFacet;

  private timeframeFacetCommon?: TimeframeFacetCommon;
  public filter?: DateFilter;
  public searchStatus!: SearchStatus;
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
   * The earliest date to accept when the `withDatepicker` option is enabled.
   *
   * This value must be a valid date string in the format `YYYY-MM-DD`.
   *
   * If the format is not respected, the datepicker will behave as if there was no `min` value set.
   *
   * See also [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/date#min).
   */
  @Prop({reflect: true}) public min?: string;

  /**
   * The latest date to accept when the `withDatepicker` option is enabled.
   *
   * This value must be a valid date string in the format `YYYY-MM-DD`.
   *
   * If the format is not respected, the datepicker will behave as if there was no `max` value set.
   *
   * See also [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/date#max).
   */
  @Prop({reflect: true}) public max?: string;

  @FocusTarget()
  private headerFocus!: FocusTargetController;

  public initialize() {
    this.timeframeFacetCommon = new TimeframeFacetCommon({
      facetId: this.facetId,
      host: this.host,
      bindings: this.bindings,
      label: this.label,
      field: this.field,
      headingLevel: this.headingLevel,
      dependsOn: this.dependsOn,
      withDatePicker: this.withDatePicker,
      setFacetId: (id: string) => (this.facetId = id),
      buildDependenciesManager: () =>
        buildFacetConditionsManager(this.bindings.engine, {
          facetId:
            this.facetForDateRange?.state.facetId ?? this.filter!.state.facetId,
          conditions: parseDependsOn(this.dependsOn),
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
    });
    this.searchStatus = buildSearchStatus(this.bindings.engine);
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
        sortCriteria: 'descending',
        filterFacetCount: this.filterFacetCount,
        injectionDepth: this.injectionDepth,
      },
    });
    return this.facetForDateRange;
  }

  private initializeFilter() {
    this.filter = buildDateFilter(this.bindings.engine, {
      options: {
        facetId: `${this.facetId}_input`,
        field: this.field,
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
      headerFocus: this.headerFocus,
      onToggleCollapse: () => (this.isCollapsed = !this.isCollapsed),
    });
  }
}
