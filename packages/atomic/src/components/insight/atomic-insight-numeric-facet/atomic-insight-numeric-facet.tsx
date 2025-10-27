import {Schema, StringValue} from '@coveo/bueno';
import {
  buildFacetConditionsManager as buildInsightFacetConditionsManager,
  buildNumericFacet as buildInsightNumericFacet,
  buildNumericFilter as buildInsightNumericFilter,
  buildNumericRange as buildInsightNumericRange,
  buildSearchStatus as buildInsightSearchStatus,
  CategoryFacetValueRequest as InsightCategoryFacetValueRequest,
  FacetConditionsManager as InsightFacetConditionsManager,
  FacetValueRequest as InsightFacetValueRequest,
  NumericFacet as InsightNumericFacet,
  NumericFacetState as InsightNumericFacetState,
  NumericFilter as InsightNumericFilter,
  NumericFilterState as InsightNumericFilterState,
  NumericRangeRequest as InsightNumericRangeRequest,
  RangeFacetRangeAlgorithm as InsightRangeFacetRangeAlgorithm,
  RangeFacetSortCriterion as InsightRangeFacetSortCriterion,
  SearchStatus as InsightSearchStatus,
  SearchStatusState as InsightSearchStatusState,
  loadNumericFacetSetActions as loadInsightNumericFacetSetActions,
} from '@coveo/headless/insight';
import {Component, Element, h, Listen, Prop, State} from '@stencil/core';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {MapProp} from '../../../utils/props-utils';
import {FocusTargetController} from '../../../utils/stencil-accessibility-utils';
import {randomID} from '../../../utils/utils';
import {parseDependsOn} from '../../common/facets/depends-on';
import {FacetInfo} from '../../common/facets/facet-common-store';
import {FacetContainer} from '../../common/facets/facet-container/stencil-facet-container';
import {FacetGuard} from '../../common/facets/stencil-facet-guard';
import {FacetHeader} from '../../common/facets/facet-header/stencil-facet-header';
import {NumberInputType} from '../../common/facets/facet-number-input/number-input-type';
import {FacetPlaceholder} from '../../common/facets/facet-placeholder/stencil-facet-placeholder';
import {formatHumanReadable} from '../../common/facets/numeric-facet/formatter';
import {NumericFacetValueLink} from '../../common/facets/numeric-facet/stencil-value-link';
import {NumericFacetValuesContainer} from '../../common/facets/numeric-facet/stencil-values-container';
import {initializePopover} from '../../common/facets/popover/popover-type';
import {shouldDisplayInputForFacetRange} from '../../common/facets/stencil-facet-common';
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
  implements InitializableComponent<InsightBindings>
{
  @InitializeBindings() public bindings!: InsightBindings;
  public facetForRange?: InsightNumericFacet;
  public facetForInput?: InsightNumericFacet;
  public filter?: InsightNumericFilter;
  public searchStatus!: InsightSearchStatus;
  private manualRanges: (InsightNumericRangeRequest & {label?: string})[] = [];
  private dependenciesManager?: InsightFacetConditionsManager;

  @Element() private host!: HTMLElement;
  private formatter: NumberFormatter = defaultNumberFormatter;
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
  @Prop({reflect: true}) public displayValuesAs: 'checkbox' | 'link' =
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
    this.validateProps();
    this.computeFacetId();
    this.initializeFacetForInput();
    this.initializeFacetForRange();
    this.initializeFilter();
    this.initializeDependenciesManager();
    this.initializeSearchStatus();
    this.registerFacetToStore();
  }

  private get focusTarget(): FocusTargetController {
    if (!this.headerFocus) {
      this.headerFocus = new FocusTargetController(this);
    }
    return this.headerFocus;
  }

  public disconnectedCallback() {
    if (this.host.isConnected) {
      return;
    }
    this.dependenciesManager?.stopWatching();
  }

  private initializeFacetForInput() {
    if (!this.withInput) {
      return;
    }
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
    if (this.numberOfValues <= 0) {
      return;
    }

    this.manualRanges = Array.from(
      this.host.querySelectorAll('atomic-numeric-range')
    ).map(({start, end, endInclusive, label}) => ({
      ...buildInsightNumericRange({start, end, endInclusive}),
      label,
    }));

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
    if (!this.withInput) {
      return;
    }

    this.filter = buildInsightNumericFilter(this.bindings.engine, {
      options: {
        facetId: `${this.facetId}_input`,
        field: this.field,
      },
    });
  }

  private initializeDependenciesManager() {
    this.dependenciesManager = buildInsightFacetConditionsManager(
      this.bindings.engine,
      {
        facetId:
          this.facetForRange?.state.facetId ?? this.filter!.state.facetId,
        conditions: parseDependsOn<
          InsightFacetValueRequest | InsightCategoryFacetValueRequest
        >(this.dependsOn),
      }
    );
  }

  private initializeSearchStatus() {
    this.searchStatus = buildInsightSearchStatus(this.bindings.engine);
  }

  private registerFacetToStore() {
    const facetInfo: FacetInfo = {
      label: () => this.bindings.i18n.t(this.label),
      facetId: this.facetId!,
      element: this.host,
      isHidden: () => this.isHidden,
    };

    this.bindings.store.registerFacet('numericFacets', {
      ...facetInfo,
      format: (value) =>
        formatHumanReadable({
          facetValue: value,
          logger: this.bindings.engine.logger,
          i18n: this.bindings.i18n,
          field: this.field,
          manualRanges: this.manualRanges,
          formatter: this.formatter,
        }),
    });

    initializePopover(this.host, {
      ...facetInfo,
      hasValues: () => this.hasValues,
      numberOfActiveValues: () => this.numberOfSelectedValues,
    });

    if (this.filter) {
      this.bindings.store.state.numericFacets[this.filter.state.facetId] =
        this.bindings.store.state.numericFacets[this.facetId!];
    }
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
    const {
      searchStatusState: {firstSearchExecuted, hasError},
      bindings: {i18n},
      label,
      numberOfSelectedValues,
      isCollapsed,
      headingLevel,
      focusTarget,
      withInput,
      filter,
    } = this;
    return (
      <FacetGuard
        enabled={this.enabled}
        firstSearchExecuted={firstSearchExecuted}
        hasError={hasError}
        hasResults={this.shouldRenderFacet}
      >
        {firstSearchExecuted ? (
          <FacetContainer>
            <FacetHeader
              i18n={i18n}
              label={label}
              onClearFilters={() => {
                focusTarget.focusAfterSearch();
                if (this.filterState?.range) {
                  this.filter?.clear();
                  return;
                }
                this.facetForRange?.deselectAll();
              }}
              numberOfActiveValues={numberOfSelectedValues}
              isCollapsed={isCollapsed}
              headingLevel={headingLevel}
              onToggleCollapse={() => (this.isCollapsed = !this.isCollapsed)}
              headerRef={(el) => focusTarget.setTarget(el)}
            />
            {!isCollapsed && [
              this.shouldRenderValues && this.renderValues(),
              this.shouldRenderInput && (
                <atomic-facet-number-input
                  type={withInput!}
                  bindings={this.bindings}
                  label={label}
                  filter={filter!}
                  filterState={filter!.state}
                ></atomic-facet-number-input>
              ),
            ]}
          </FacetContainer>
        ) : (
          <FacetPlaceholder
            isCollapsed={this.isCollapsed}
            numberOfValues={this.numberOfValues}
          />
        )}
      </FacetGuard>
    );
  }

  private renderValues() {
    const {
      displayValuesAs,
      field,
      manualRanges,
      label,
      bindings: {
        i18n,
        engine: {logger},
      },
    } = this;

    return (
      <NumericFacetValuesContainer i18n={i18n} label={label}>
        {this.valuesToRender.map((value) => (
          <NumericFacetValueLink
            formatter={this.formatter}
            displayValuesAs={displayValuesAs}
            facetValue={value}
            field={field}
            i18n={i18n}
            logger={logger}
            manualRanges={manualRanges}
            onClick={() =>
              this.displayValuesAs === 'link'
                ? this.facetForRange!.toggleSingleSelect(value)
                : this.facetForRange!.toggleSelect(value)
            }
          />
        ))}
      </NumericFacetValuesContainer>
    );
  }

  private get numberOfSelectedValues() {
    if (this.filter?.state.range) {
      return 1;
    }

    return (
      this.facetForRange?.state.values.filter(({state}) => state === 'selected')
        .length || 0
    );
  }

  private get shouldRenderValues() {
    return (
      !this.hasInputRange &&
      this.numberOfValues > 0 &&
      !!this.valuesToRender.length
    );
  }

  private get hasInputRange() {
    return !!this.filter?.state.range;
  }

  private get valuesToRender() {
    return (
      this.facetForRange?.state.values.filter(
        (value) => value.numberOfResults || value.state !== 'idle'
      ) || []
    );
  }

  private get shouldRenderInput() {
    return shouldDisplayInputForFacetRange({
      hasInputRange: this.hasInputRange,
      searchStatusState: this.searchStatusState,
      facetValues: this.facetForInput?.state.values || [],
      hasInput: !!this.withInput,
    });
  }

  private computeFacetId() {
    if (this.facetId) {
      return;
    }

    if (this.bindings.store.state.numericFacets[this.field]) {
      this.facetId = randomID(`${this.field}_`);
    }

    this.facetId = this.field;
  }

  private get isHidden() {
    return !this.shouldRenderFacet || !this.facetState.enabled;
  }

  private get shouldRenderFacet() {
    return this.shouldRenderInput || this.shouldRenderValues;
  }

  private get hasValues() {
    if (this.facetForInput?.state.values.length) {
      return true;
    }

    return !!this.valuesToRender.length;
  }

  private get enabled() {
    return this.facetState?.enabled ?? this.filter?.state.enabled ?? true;
  }

  private validateProps() {
    new Schema({
      displayValuesAs: new StringValue({constrainTo: ['checkbox', 'link']}),
      withInput: new StringValue({constrainTo: ['integer', 'decimal']}),
    }).validate({
      displayValuesAs: this.displayValuesAs,
      withInput: this.withInput,
    });
  }
}
