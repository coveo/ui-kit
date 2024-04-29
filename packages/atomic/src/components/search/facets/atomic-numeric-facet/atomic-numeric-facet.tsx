import {
  buildFacetConditionsManager,
  buildNumericFacet,
  buildNumericFilter,
  buildNumericRange,
  buildSearchStatus,
  CategoryFacetValueRequest,
  FacetValueRequest,
  loadNumericFacetSetActions,
  NumericFacet,
  NumericFacetState,
  NumericFilter,
  NumericFilterState,
  RangeFacetRangeAlgorithm,
  RangeFacetSortCriterion,
  SearchStatus,
  SearchStatusState,
} from '@coveo/headless';
import {Component, Element, h, Listen, Prop, State} from '@stencil/core';
import {FocusTargetController} from '../../../../utils/accessibility-utils';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {MapProp} from '../../../../utils/props-utils';
import {parseDependsOn} from '../../../common/facets/depends-on';
import {NumberInputType} from '../../../common/facets/facet-number-input/number-input-type';
import {FacetPlaceholder} from '../../../common/facets/facet-placeholder/facet-placeholder';
import {
  NumericFacetCommon,
  NumericRangeWithLabel,
} from '../../../common/facets/numeric-facet-common';
import {
  defaultNumberFormatter,
  NumberFormatter,
} from '../../../common/formats/format-common';
import {Bindings} from '../../atomic-search-interface/atomic-search-interface';

/**
 * A facet is a list of values for a certain field occurring in the results, ordered using a configurable criteria (e.g., ascending, descending).
 * An `atomic-numeric-facet` displays a facet of the results for the current query as numeric ranges.
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
 *
 * @part value-checkbox - The facet value checkbox, available when display is 'checkbox'.
 * @part value-checkbox-checked - The checked facet value checkbox, available when display is 'checkbox'.
 * @part value-checkbox-label - The facet value checkbox clickable label, available when display is 'checkbox'.
 * @part value-checkbox-icon - The facet value checkbox icon, available when display is 'checkbox'.
 * @part value-link - The facet value when display is 'link'.
 * @part value-link-selected - The selected facet value when display is 'link'.

 * @part input-form - The form that comprises the labels, inputs, and 'apply' button for the custom numeric range.
 * @part label-start - The label for the starting value of the custom numeric range.
 * @part label-end - The label for the ending value of the custom numeric range.
 * @part input-start - The input for the starting value of the custom numeric range.
 * @part input-end - The input for the ending value of the custom numeric range.
 * @part input-apply-button - The apply button for the custom range.
 */
@Component({
  tag: 'atomic-numeric-facet',
  styleUrl: './atomic-numeric-facet.pcss',
  shadow: true,
})
export class AtomicNumericFacet implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  public facetForRange?: NumericFacet;
  public facetForInput?: NumericFacet;
  public filter?: NumericFilter;
  public searchStatus!: SearchStatus;
  @Element() private host!: HTMLElement;
  private manualRanges: NumericRangeWithLabel[] = [];
  private formatter: NumberFormatter = defaultNumberFormatter;
  private numericFacetCommon?: NumericFacetCommon;

  @BindStateToController('facetForRange')
  @State()
  public facetState!: NumericFacetState;
  @BindStateToController('filter')
  @State()
  public filterState?: NumericFilterState;
  @BindStateToController('searchStatus')
  @State()
  public searchStatusState!: SearchStatusState;
  @State() public error!: Error;
  @BindStateToController('facetForInput')
  @State()
  public facetForInputState?: NumericFacetState;

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
  @Prop({reflect: true}) public sortCriteria: RangeFacetSortCriterion =
    'ascending';
  /**
   * The algorithm that's used for generating the ranges of this facet when they aren't manually defined. The default value of `"equiprobable"` generates facet ranges which vary in size but have a more balanced number of results within each range. The value of `"even"` generates equally sized facet ranges across all of the results.
   */
  @Prop({reflect: true}) public rangeAlgorithm: RangeFacetRangeAlgorithm =
    'equiprobable';
  /**
   * Whether to display the facet values as checkboxes (multiple selection) or links (single selection).
   * Possible values are 'checkbox' and 'link'.
   */
  @Prop({reflect: true}) public displayValuesAs: 'checkbox' | 'link' =
    'checkbox';
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
   * <atomic-numeric-facet
   *   depends-on-abc
   *   ...
   * ></atomic-numeric-facet>
   *
   * <!-- To show the facet when value "doc" is selected in the facet with id "abc": -->
   * <atomic-numeric-facet
   *   depends-on-abc="doc"
   *   ...
   * ></atomic-numeric-facet>
   * ```
   */
  @MapProp() @Prop() public dependsOn: Record<string, string> = {};

  private headerFocus?: FocusTargetController;

  private get focusTarget(): FocusTargetController {
    if (!this.headerFocus) {
      this.headerFocus = new FocusTargetController(this);
    }
    return this.headerFocus;
  }

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
        buildFacetConditionsManager(this.bindings.engine, {
          facetId:
            this.facetForRange?.state.facetId ?? this.filter!.state.facetId,
          conditions: parseDependsOn<
            FacetValueRequest | CategoryFacetValueRequest
          >(this.dependsOn),
        }),
      buildNumericRange: buildNumericRange,
      initializeFacetForInput: () => this.initializeFacetForInput(),
      initializeFacetForRange: () => this.initializeFacetForRange(),
      initializeFilter: () => this.initializeFilter(),
    });
    this.searchStatus = buildSearchStatus(this.bindings.engine);
  }

  public disconnectedCallback() {
    this.numericFacetCommon?.disconnectedCallback();
  }

  private initializeFacetForInput() {
    this.facetForInput = buildNumericFacet(this.bindings.engine, {
      options: {
        numberOfValues: 1,
        generateAutomaticRanges: true,
        facetId: `${this.facetId}_input_range`,
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
    this.facetForRange = buildNumericFacet(this.bindings.engine, {
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
    this.filter = buildNumericFilter(this.bindings.engine, {
      options: {
        facetId: `${this.facetId}_input`,
        field: this.field,
      },
    });

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
        loadNumericFacetSetActions(
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
