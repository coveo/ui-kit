import {
  buildFacet,
  buildFacetConditionsManager,
  buildSearchStatus,
  CategoryFacetValueRequest,
  Facet,
  FacetConditionsManager,
  FacetOptions,
  FacetSortCriterion,
  FacetState,
  FacetValue,
  FacetValueRequest,
  SearchStatus,
  SearchStatusState,
  buildTabManager,
  TabManager,
  TabManagerState,
} from '@coveo/headless';
import {Component, h, Prop, State, VNode} from '@stencil/core';
import {getFieldValueCaption} from '../../../../utils/field-utils';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {ArrayProp, MapProp} from '../../../../utils/props-utils';
import {parseDependsOn} from '../../../common/facets/depends-on';
import {FacetValuesGroup} from '../../../common/facets/facet-values-group/stencil-facet-values-group';
import {Hidden} from '../../../common/stencil-hidden';
import {Bindings} from '../../atomic-search-interface/atomic-search-interface';
import {FacetSegmentedValue} from '../facet-segmented-value/stencil-facet-segmented-value';

/**
 * The `atomic-segmented-facet` displays a horizontal facet of the results for the current query.
 * @part segmented-container - The container that holds the segmented facets.
 * @part label - The facet value label.
 * @part values - The facet values container.
 * @part value-box - The facet value.
 * @part value-box-selected - The selected facet value.
 * @part placeholder - The placeholder displayed when the facet is loading.
 */
@Component({
  tag: 'atomic-segmented-facet',
  styleUrl: 'atomic-segmented-facet.pcss',
  shadow: true,
})
export class AtomicSegmentedFacet implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  public searchStatus!: SearchStatus;
  public tabManager!: TabManager;
  @State()
  public searchStatusState!: SearchStatusState;
  @BindStateToController('tabManager')
  @State()
  public tabManagerState!: TabManagerState;
  @BindStateToController('facet')
  @State()
  public facetState!: FacetState;
  public facet!: Facet;
  @State() public error!: Error;

  /**
   * Specifies a unique identifier for the facet.
   */
  @Prop({mutable: true, reflect: true}) public facetId?: string;
  /**
   * The field whose values you want to display in the facet.
   */
  @Prop({reflect: true}) public field!: string;
  /**
   * The non-localized label for the facet.
   * Used in the `atomic-breadbox` component through the bindings store.
   */
  @Prop({reflect: true}) public label?: string;
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
  @Prop() public injectionDepth = 1000;
  /**
   * The number of values to request for this facet.
   * Also determines the number of additional values to request each time more values are shown.
   */
  @Prop({reflect: true}) public numberOfValues = 6;
  /**
   * The sort criterion to apply to the returned facet values.
   * Possible values are 'score', 'alphanumeric', 'alphanumericDescending', 'occurrences', alphanumericNatural', 'alphanumericNaturalDescending' and 'automatic'.
   */
  @Prop({reflect: true}) public sortCriteria: FacetSortCriterion = 'automatic';

  /**
   * The required facets and values for this facet to be displayed.
   * Examples:
   * ```html
   * <atomic-segmented-facet facet-id="abc" field="objecttype" ...></atomic-segmented-facet>
   *
   * <!-- To show the facet when any value is selected in the facet with id "abc": -->
   * <atomic-segmented-facet
   *   depends-on-abc
   *   ...
   * ></atomic-segmented-facet>
   *
   * <!-- To show the facet when value "doc" is selected in the facet with id "abc": -->
   * <atomic-facet
   *   depends-on-abc="doc"
   *   ...
   * ></atomic-segmented-facet>
   * ```
   */
  @MapProp() @Prop() public dependsOn: Record<string, string> = {};
  /**
   * Specifies an explicit list of `allowedValues` in the Search API request. This list is in the form of a JSON string.
   *
   * If you specify a list of values for this option, the facet only uses these values (if they are available in
   * the current result set).
   *
   * Example:
   *
   * The following facet only uses the `Contact`, `Account`, and `File` values of the `objecttype` field. Even if the
   * current result set contains other `objecttype` values, such as `Message` or `Product`, the facet does not use
   * them.
   *
   * ```html
   * <atomic-segmented-facet field="objecttype" allowed-values='["Contact","Account","File"]'></atomic-segmented-facet>
   * ```
   *
   * The maximum amount of allowed values is 25.
   *
   * The default value is `undefined`, and the facet uses all available values for its `field` in the current result set.
   */
  @ArrayProp()
  @Prop({mutable: true})
  public allowedValues: string[] | string = '[]';

  /**
   * Identifies the facet values that must appear at the top, in this order.
   * This parameter can be used in conjunction with the `sortCriteria` parameter.
   *
   * Facet values not part of the `customSort` list will be sorted according to the `sortCriteria`.
   *
   * Example:
   *
   * The following facet will sort the `Contact`, `Account`, and `File` values at the top of the list for the `objecttype` field.
   *
   * If there are more than these 3 values available, the rest of the list will be sorted using `occurrences`.
   *
   * ```html
   * <atomic-segmented-facet field="objecttype" custom-sort='["Contact","Account","File"]' sort-criteria='occurrences'></atomic-segmented-facet>
   * ```
   * The maximum amount of custom sort values is 25.
   *
   * The default value is `undefined`, and the facet values will be sorted using only the `sortCriteria`.
   */
  @ArrayProp()
  @Prop({mutable: true})
  public customSort: string[] | string = '[]';

  private dependenciesManager!: FacetConditionsManager;

  public initialize() {
    if (
      [...this.tabsIncluded].length > 0 &&
      [...this.tabsExcluded].length > 0
    ) {
      console.warn(
        'Values for both "tabs-included" and "tabs-excluded" have been provided. This is could lead to unexpected behaviors.'
      );
    }
    this.searchStatus = buildSearchStatus(this.bindings.engine);
    this.tabManager = buildTabManager(this.bindings.engine);

    this.facet = buildFacet(this.bindings.engine, {options: this.facetOptions});
    this.facetId = this.facet.state.facetId;
    this.dependenciesManager = buildFacetConditionsManager(
      this.bindings.engine,
      {
        facetId: this.facetId!,
        conditions: parseDependsOn<
          FacetValueRequest | CategoryFacetValueRequest
        >(this.dependsOn),
      }
    );
  }

  disconnectedCallback() {
    this.dependenciesManager.stopWatching();
  }

  private renderValuesContainer(children: VNode[]) {
    const classes = 'box-container flex h-10';
    return (
      <FacetValuesGroup i18n={this.bindings.i18n} label={this.label}>
        <ul class={classes} part="values">
          {children}
        </ul>
      </FacetValuesGroup>
    );
  }

  private renderValue(facetValue: FacetValue, onClick: () => void) {
    const displayValue = getFieldValueCaption(
      this.field,
      facetValue.value,
      this.bindings.i18n
    );
    const isSelected = facetValue.state !== 'idle';

    return (
      <FacetSegmentedValue
        displayValue={displayValue}
        numberOfResults={facetValue.numberOfResults}
        isSelected={isSelected}
        i18n={this.bindings.i18n}
        onClick={onClick}
        searchQuery={this.facetState.facetSearch.query}
      ></FacetSegmentedValue>
    );
  }

  private renderValues() {
    return this.renderValuesContainer(
      this.facetState.values.map((value) =>
        this.renderValue(value, () => this.facet.toggleSingleSelect(value))
      )
    );
  }

  private renderLabel() {
    if (!this.label) {
      return;
    }
    return (
      <b class="mr-2" part="label">
        {this.label}:
      </b>
    );
  }

  private get facetOptions(): FacetOptions {
    return {
      facetId: this.facetId,
      field: this.field,
      numberOfValues: this.numberOfValues,
      sortCriteria: this.sortCriteria,
      facetSearch: {numberOfValues: this.numberOfValues},
      filterFacetCount: this.filterFacetCount,
      injectionDepth: this.injectionDepth,
      hasBreadcrumbs: false,
      allowedValues: this.allowedValues.length
        ? [...this.allowedValues]
        : undefined,
      customSort: this.customSort.length ? [...this.customSort] : undefined,
      tabs: {
        included: [...this.tabsIncluded],
        excluded: [...this.tabsExcluded],
      },
    };
  }

  public render() {
    if (this.searchStatus.state.hasError || !this.facet.state.enabled) {
      return <Hidden></Hidden>;
    }

    if (!this.searchStatus.state.firstSearchExecuted) {
      return (
        <div
          part="placeholder"
          aria-hidden
          class="bg-neutral h-8 w-48 animate-pulse rounded"
        ></div>
      );
    }

    if (!this.facetState.values.length) {
      return <Hidden></Hidden>;
    }

    return (
      <div
        part="segmented-container"
        class="mr-2 flex h-10 items-center whitespace-nowrap"
      >
        {this.renderLabel()}
        {this.renderValues()}
      </div>
    );
  }
}
