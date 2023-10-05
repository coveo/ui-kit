import {Component, Element, h, Listen, Prop, State} from '@stencil/core';
import {
  buildInsightFacetConditionsManager,
  buildInsightNumericFacet,
  buildInsightNumericFilter,
  buildInsightNumericRange,
  buildInsightSearchStatus,
  InsightNumericFacet,
  InsightNumericFacetState,
  InsightNumericFilter,
  InsightNumericFilterState,
  InsightRangeFacetRangeAlgorithm,
  InsightRangeFacetSortCriterion,
  InsightSearchStatus,
  InsightSearchStatusState,
  loadInsightNumericFacetSetActions,
} from '..';
import {FocusTargetController} from '../../../utils/accessibility-utils';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {MapProp} from '../../../utils/props-utils';
import {BaseFacet, parseDependsOn} from '../../common/facets/facet-common';
import {NumberInputType} from '../../common/facets/facet-number-input/number-input-type';
import {FacetPlaceholder} from '../../common/facets/facet-placeholder/facet-placeholder';
import {
  NumericFacetCommon,
  NumericFacetDisplayValues,
  NumericRangeWithLabel,
} from '../../common/facets/numeric-facet-common';
import {
  defaultNumberFormatter,
  NumberFormatter,
} from '../../common/formats/format-common';
import {InsightBindings} from '../atomic-insight-interface/atomic-insight-interface';

/**
 * @internal
 */
@Component({
  tag: 'atomic-insight-numeric-facet',
  styleUrl: './atomic-insight-numeric-facet.pcss',
  shadow: true,
})
export class AtomicInsightNumericFacet
  implements
    InitializableComponent<InsightBindings>,
    BaseFacet<InsightNumericFacet>
{
  @InitializeBindings() public bindings!: InsightBindings;
  public facetForRange?: InsightNumericFacet;
  public facetForInput?: InsightNumericFacet;
  public filter?: InsightNumericFilter;
  public searchStatus!: InsightSearchStatus;
  private manualRanges: NumericRangeWithLabel[] = [];
  @Element() private host!: HTMLElement;
  private formatter: NumberFormatter = defaultNumberFormatter;
  private numericFacetCommon?: NumericFacetCommon;
  @BindStateToController('facetForRange')
  @State()
  public facetState!: InsightNumericFacetState;
  @BindStateToController('filter')
  @State()
  public filterState?: InsightNumericFilterState;
  @BindStateToController('searchStatus')
  @State()
  public searchStatusState!: InsightSearchStatusState;
  @State() public error!: Error;
  @BindStateToController('facetForInput')
  @State()
  public facetForInputState?: InsightNumericFacetState;

  /**
   * Specifies a unique identifier for the facet.
   */
  @Prop({mutable: true, reflect: true}) public facetId?: string;
  /**
   * The non-localized label for the facet.
   * Used in the `atomic-breadbox` component through the bindings store.
   */
  @Prop({reflect: true}) public label = 'no-label';
  /**
   * The field whose values you want to display in the facet.
   */
  @Prop({reflect: true}) public field!: string;
  /**
   * The number of values to request for this facet, when there are no manual ranges.
   * If the number of values is 0, no ranges will be displayed.
   */
  @Prop({reflect: true}) public numberOfValues = 8;
  /**
   * Whether this facet should contain an input allowing users to set custom ranges.
   * Depending on the field, the input can allow either decimal or integer values.
   */
  @Prop({reflect: true}) public withInput?: NumberInputType;
  /**
   * The sort criterion to apply to the returned facet values.
   * Possible values are 'ascending' and 'descending'.
   */
  @Prop({reflect: true}) public sortCriteria: InsightRangeFacetSortCriterion =
    'ascending';
  /**
   * The algorithm that's used for generating the ranges of this facet when they aren't manually defined. The default value of `"equiprobable"` generates facet ranges which vary in size but have a more balanced number of results within each range. The value of `"even"` generates equally sized facet ranges across all of the results.
   */
  @Prop({reflect: true})
  public rangeAlgorithm: InsightRangeFacetRangeAlgorithm = 'equiprobable';
  /**
   * Whether to display the facet values as checkboxes (multiple selection) or links (single selection).
   * Possible values are 'checkbox' and 'link'.
   */
  @Prop({reflect: true}) public displayValuesAs: NumericFacetDisplayValues =
    'checkbox';
  /**
   * Specifies if the facet is collapsed.
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
   * <atomic-insight-facet facet-id="abc" field="objecttype" ...></atomic-insight-facet>
   *
   * <!-- To show the facet when any value is selected in the facet with id "abc": -->
   * <atomic-insight-numeric-facet
   *   depends-on-abc
   *   ...
   * ></atomic-insight-numeric-facet>
   *
   * <!-- To show the facet when value "doc" is selected in the facet with id "abc": -->
   * <atomic-insight-numeric-facet
   *   depends-on-abc="doc"
   *   ...
   * ></atomic-insight-numeric-facet>
   * ```
   */
  @MapProp() @Prop() public dependsOn: Record<string, string> = {};

  private headerFocus?: FocusTargetController;

  public initialize() {
    this.numericFacetCommon = new NumericFacetCommon({
      facetId: this.facetId,
      host: this.host,
      bindings: this.bindings,
      label: this.label,
      field: this.field,
      headingLevel: this.headingLevel,
      dependsOn: this.dependsOn,
      displayValuesAs: this.displayValuesAs,
      withInput: this.withInput,
      numberOfValues: this.numberOfValues,
      setFacetId: (id: string) => (this.facetId = id),
      setManualRanges: (manualRanges) => (this.manualRanges = manualRanges),
      getFormatter: () => this.formatter,
      getSearchStatusState: () => this.searchStatusState,
      buildDependenciesManager: () =>
        buildInsightFacetConditionsManager(this.bindings.engine, {
          facetId:
            this.facetForRange?.state.facetId ?? this.filter!.state.facetId,
          conditions: parseDependsOn(this.dependsOn),
        }),
      buildNumericRange: buildInsightNumericRange,
      initializeFacetForInput: () => this.initializeFacetForInput(),
      initializeFacetForRange: () => this.initializeFacetForRange(),
      initializeFilter: () => this.initializeFilter(),
    });
    this.searchStatus = buildInsightSearchStatus(this.bindings.engine);
  }

  private get focusTarget(): FocusTargetController {
    if (!this.headerFocus) {
      this.headerFocus = new FocusTargetController(this);
    }
    return this.headerFocus;
  }

  public disconnectedCallback() {
    this.numericFacetCommon?.disconnectedCallback();
  }

  private initializeFacetForInput() {
    this.facetForInput = buildInsightNumericFacet(this.bindings.engine, {
      options: {
        facetId: `${this.facetId}_input_range`,
        numberOfValues: 1,
        generateAutomaticRanges: true,
        field: this.field,
        sortCriteria: this.sortCriteria,
        rangeAlgorithm: this.rangeAlgorithm,
        filterFacetCount: this.filterFacetCount,
        injectionDepth: this.injectionDepth,
      },
    });

    return this.facetForInput;
  }

  private initializeFacetForRange() {
    this.facetForRange = buildInsightNumericFacet(this.bindings.engine, {
      options: {
        facetId: this.facetId,
        field: this.field,
        numberOfValues: this.numberOfValues,
        sortCriteria: this.sortCriteria,
        rangeAlgorithm: this.rangeAlgorithm,
        currentValues: this.manualRanges,
        generateAutomaticRanges: !this.manualRanges.length,
        filterFacetCount: this.filterFacetCount,
        injectionDepth: this.injectionDepth,
      },
    });

    return this.facetForRange;
  }

  private initializeFilter() {
    this.filter = buildInsightNumericFilter(this.bindings.engine, {
      options: {
        facetId: `${this.facetId}_input`,
        field: this.field,
      },
    });

    if (!this.facetId) {
      this.facetId = this.filter.state.facetId;
    }
    return this.filter;
  }

  @Listen('atomic/numberFormat')
  public setFormat(event: CustomEvent<NumberFormatter>) {
    event.preventDefault();
    event.stopPropagation();
    this.formatter = event.detail;
  }

  @Listen('atomic/numberInputApply')
  public applyNumberInput() {
    this.facetId &&
      this.bindings.engine.dispatch(
        loadInsightNumericFacetSetActions(
          this.bindings.engine
        ).deselectAllNumericFacetValues(this.facetId)
      );
  }

  public render() {
    if (!this.numericFacetCommon) {
      return (
        <FacetPlaceholder
          numberOfValues={this.numberOfValues}
          isCollapsed={this.isCollapsed}
        ></FacetPlaceholder>
      );
    }
    return this.numericFacetCommon.render({
      hasError: this.searchStatusState.hasError,
      firstSearchExecuted: this.searchStatusState.firstSearchExecuted,
      isCollapsed: this.isCollapsed,
      headerFocus: this.focusTarget,
      onToggleCollapse: () => (this.isCollapsed = !this.isCollapsed),
    });
  }
}
