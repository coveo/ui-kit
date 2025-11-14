import {Schema, StringValue} from '@coveo/bueno';
import {
  buildFacetConditionsManager,
  FacetConditionsManager,
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
  NumericRangeRequest,
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
import {randomID} from '../../../../utils/utils';
import {parseDependsOn} from '../../../common/facets/depends-on';
import {FacetInfo} from '../../../common/facets/facet-common-store';
import {FacetContainer} from '../../../common/facets/facet-container/stencil-facet-container';
import {FacetGuard} from '../../../common/facets/stencil-facet-guard';
import {FacetHeader} from '../../../common/facets/facet-header/stencil-facet-header';
import {NumberInputType} from '../../../common/facets/facet-number-input/number-input-type';
import {FacetPlaceholder} from '../../../common/facets/facet-placeholder/stencil-facet-placeholder';
import {formatHumanReadable} from '../../../common/facets/numeric-facet/formatter';
import {NumericFacetValueLink} from '../../../common/facets/numeric-facet/stencil-value-link';
import {NumericFacetValuesContainer} from '../../../common/facets/numeric-facet/stencil-values-container';
import {initializePopover} from '../../../common/facets/popover/popover-type';
import {shouldDisplayInputForFacetRange} from '../../../common/facets/stencil-facet-common';
import {
  defaultNumberFormatter,
  NumberFormatter,
} from '../../../common/formats/format-common';
import {Bindings} from '../../atomic-search-interface/atomic-search-interface';

/**
 * A facet is a list of values for a certain field occurring in the results, ordered using a configurable criteria (for example, ascending, descending).
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
  public filter!: NumericFilter;
  public searchStatus!: SearchStatus;
  public tabManager!: TabManager;
  @Element() private host!: HTMLElement;
  private manualRanges: (NumericRangeRequest & {label?: string})[] = [];
  private formatter: NumberFormatter = defaultNumberFormatter;
  private facetForRangeDependenciesManager?: FacetConditionsManager;
  private facetForInputDependenciesManager?: FacetConditionsManager;
  private filterDependenciesManager?: FacetConditionsManager;

  @BindStateToController('facetForRange')
  @State()
  public facetState!: NumericFacetState;
  @BindStateToController('filter')
  @State()
  public filterState?: NumericFilterState;
  @BindStateToController('searchStatus')
  @State()
  public searchStatusState!: SearchStatusState;
  @BindStateToController('tabManager')
  @State()
  public tabManagerState!: TabManagerState;
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
    if (
      [...this.tabsIncluded].length > 0 &&
      [...this.tabsExcluded].length > 0
    ) {
      console.warn(
        'Values for both "tabs-included" and "tabs-excluded" have been provided. This is could lead to unexpected behaviors.'
      );
    }
    this.validateProps();
    this.initializeTabManager();
    this.computeFacetId();
    this.initializeFacetForInput();
    this.initializeFacetForRange();
    this.initializeFilter();
    this.initializeSearchStatus();
    this.registerFacetToStore();
  }

  public disconnectedCallback() {
    if (this.host.isConnected) {
      return;
    }
    this.facetForRangeDependenciesManager?.stopWatching();
    this.facetForInputDependenciesManager?.stopWatching();
    this.filterDependenciesManager?.stopWatching();
  }

  private initializeSearchStatus() {
    this.searchStatus = buildSearchStatus(this.bindings.engine);
  }
  private initializeTabManager() {
    this.tabManager = buildTabManager(this.bindings.engine);
  }
  private initializeFacetForInput() {
    if (!this.withInput) {
      return;
    }
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
        tabs: {
          included: [...this.tabsIncluded],
          excluded: [...this.tabsExcluded],
        },
      },
    });

    this.facetForInputDependenciesManager = this.initializeDependenciesManager(
      this.facetForInput.state.facetId
    );

    return this.facetForInput;
  }

  private initializeFacetForRange() {
    if (this.numberOfValues <= 0) {
      return;
    }

    this.manualRanges = Array.from(
      this.host.querySelectorAll('atomic-numeric-range')
    ).map(({start, end, endInclusive, label}) => ({
      ...buildNumericRange({start, end, endInclusive}),
      label,
    }));

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
        tabs: {
          included: [...this.tabsIncluded],
          excluded: [...this.tabsExcluded],
        },
      },
    });

    this.facetForRangeDependenciesManager = this.initializeDependenciesManager(
      this.facetForRange.state.facetId
    );

    return this.facetForRange;
  }

  private initializeFilter() {
    if (!this.withInput) {
      return;
    }
    this.filter = buildNumericFilter(this.bindings.engine, {
      options: {
        facetId: `${this.facetId}_input`,
        field: this.field,
        tabs: {
          included: [...this.tabsIncluded],
          excluded: [...this.tabsExcluded],
        },
      },
    });

    this.filterDependenciesManager = this.initializeDependenciesManager(
      this.filter.state.facetId
    );
  }

  private initializeDependenciesManager(facetId: string) {
    return buildFacetConditionsManager(this.bindings.engine, {
      facetId,
      conditions: parseDependsOn<FacetValueRequest | CategoryFacetValueRequest>(
        this.dependsOn
      ),
    });
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
        loadNumericFacetSetActions(
          this.bindings.engine
        ).deselectAllNumericFacetValues(this.facetId)
      );
  }

  public render() {
    const {
      searchStatusState: {firstSearchExecuted, hasError},
      bindings: {i18n},
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
              label={this.label}
              onClearFilters={() => {
                this.focusTarget.focusAfterSearch();
                if (this.filterState?.range) {
                  this.filter?.clear();
                  return;
                }
                this.facetForRange?.deselectAll();
              }}
              numberOfActiveValues={this.numberOfSelectedValues}
              isCollapsed={this.isCollapsed}
              headingLevel={this.headingLevel}
              onToggleCollapse={() => (this.isCollapsed = !this.isCollapsed)}
              headerRef={(el) => this.focusTarget.setTarget(el)}
            />
            {!this.isCollapsed && [
              this.shouldRenderValues && this.renderValues(),
              this.shouldRenderInput && (
                <atomic-facet-number-input
                  type={this.withInput!}
                  bindings={this.bindings}
                  label={this.label}
                  filter={this.filter!}
                  filterState={this.filter!.state}
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
      formatter,
    } = this;

    return (
      <NumericFacetValuesContainer i18n={i18n} label={label}>
        {this.valuesToRender.map((value) => (
          <NumericFacetValueLink
            formatter={formatter}
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
      return;
    }

    this.facetId = this.field;
  }

  private get enabled() {
    return this.facetState?.enabled ?? this.filter?.state.enabled ?? true;
  }

  private get isHidden() {
    return !this.shouldRenderFacet || !this.enabled;
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
