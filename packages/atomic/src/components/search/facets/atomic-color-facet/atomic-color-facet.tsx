import {
  Facet,
  buildFacet,
  FacetState,
  FacetOptions,
  FacetSortCriterion,
  SearchStatus,
  SearchStatusState,
  buildSearchStatus,
  FacetValue,
  buildFacetConditionsManager,
  FacetConditionsManager,
  FacetResultsMustMatch,
  FacetValueRequest,
  CategoryFacetValueRequest,
  buildTabManager,
  TabManager,
  TabManagerState,
} from '@coveo/headless';
import {Component, h, State, Prop, VNode, Element} from '@stencil/core';
import {
  getFieldCaptions,
  getFieldValueCaption,
} from '../../../../utils/field-utils';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {ArrayProp, MapProp} from '../../../../utils/props-utils';
import {
  AriaLiveRegion,
  FocusTargetController,
} from '../../../../utils/stencil-accessibility-utils';
import {parseDependsOn} from '../../../common/facets/depends-on';
import {FacetInfo} from '../../../common/facets/facet-common-store';
import {FacetContainer} from '../../../common/facets/facet-container/stencil-facet-container';
import {FacetHeader} from '../../../common/facets/facet-header/stencil-facet-header';
import {FacetPlaceholder} from '../../../common/facets/facet-placeholder/stencil-facet-placeholder';
import {announceFacetSearchResultsWithAriaLive} from '../../../common/facets/facet-search/facet-search-aria-live';
import {
  shouldUpdateFacetSearchComponent,
  shouldDisplaySearchResults,
} from '../../../common/facets/facet-search/facet-search-utils';
import {FacetSearchInput} from '../../../common/facets/facet-search/stencil-facet-search-input';
import {FacetSearchMatches} from '../../../common/facets/facet-search/stencil-facet-search-matches';
import {FacetShowMoreLess} from '../../../common/facets/facet-show-more-less/stencil-facet-show-more-less';
import {FacetValueBox} from '../../../common/facets/facet-value-box/stencil-facet-value-box';
import {FacetValueLabelHighlight} from '../../../common/facets/facet-value-label-highlight/stencil-facet-value-label-highlight';
import {FacetValuesGroup} from '../../../common/facets/facet-values-group/stencil-facet-values-group';
import {initializePopover} from '../../../common/facets/popover/popover-type';
import {Hidden} from '../../../common/stencil-hidden';
import {Bindings} from '../../atomic-search-interface/atomic-search-interface';
import {ColorFacetCheckbox} from '../color-facet-checkbox/color-facet-checkbox';

/**
 * A facet is a list of values for a certain field occurring in the results, ordered using a configurable criteria (e.g., number of occurrences).
 * An `atomic-color-facet` displays a facet of the results for the current query as colors.
 *
 * @part facet - The wrapper for the entire facet.
 * @part placeholder - The placeholder shown before the first search is executed.
 *
 * @part label-button - The button that displays the label and allows to expand/collapse the facet.
 * @part label-button-icon - The label button icon.
 * @part clear-button - The button that resets the actively selected facet values.
 * @part clear-button-icon - The clear button icon.
 *
 * @part search-wrapper - The search box wrapper.
 * @part search-input - The search box input.
 * @part search-icon - The search box submit button.
 * @part search-clear-button - The button to clear the search box of input.
 * @part more-matches - The label indicating there are more matches for the current facet search query.
 * @part no-matches - The label indicating there are no matches for the current facet search query.
 * @part matches-query - The highlighted query inside the matches labels.
 * @part search-highlight - The highlighted query inside the facet values.
 *
 * @part values - The facet values container.
 * @part value-label - The facet value label, common for all displays.
 * @part value-count - The facet value count, common for all displays.
 * @part default-color-value - The default part name used to customize color facet values. Should be defined before dynamic parts.
 * @part value-* - The dynamic part name used to customize a facet value. The `*` is a syntactical placeholder for a specific facet value. For example, if the component's `field` property is set to 'filetype' and your source has a `YouTubeVideo` file type, the part would be targeted like this: `atomic-color-facet::part(value-YouTubeVideo)...`.
 *
 * @part value-box - The facet value when display is 'box'.
 * @part value-box-selected - The selected facet value when display is 'box'.
 * @part value-checkbox - The facet value checkbox, available when display is 'checkbox'.
 * @part value-checkbox-checked - The checked facet value checkbox, available when display is 'checkbox'.
 * @part value-checkbox-label - The facet value checkbox clickable label, available when display is 'checkbox'.
 *
 * @part show-more - The show more results button.
 * @part show-less - The show less results button.
 * @part show-more-less-icon - The icons of the show more & show less buttons.
 */
@Component({
  tag: 'atomic-color-facet',
  styleUrl: 'atomic-color-facet.pcss',
  shadow: true,
})
export class AtomicColorFacet implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  public facet!: Facet;
  private dependenciesManager?: FacetConditionsManager;
  private resultIndexToFocusOnShowMore = 0;
  public searchStatus!: SearchStatus;
  public tabManager!: TabManager;
  @Element() private host!: HTMLElement;

  @BindStateToController('facet')
  @State()
  public facetState!: FacetState;
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
   * Set this property as a stringified JSON array, e.g.,
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
   * Set this property as a stringified JSON array, e.g.,
   * ```html
   *  <atomic-timeframe-facet tabs-excluded='["tabIDA", "tabIDB"]'></atomic-timeframe-facet>
   * ```
   * If you don't set this property, the facet can be displayed on any tab. Otherwise, the facet won't be displayed on any of the specified tabs.
   */
  @ArrayProp()
  @Prop({reflect: true, mutable: true})
  public tabsExcluded: string[] | string = '[]';

  /**
   * The number of values to request for this facet.
   * Also determines the number of additional values to request each time more values are shown.
   */
  @Prop({reflect: true}) public numberOfValues = 8;
  /**
   * Whether this facet should contain a search box.
   *
   */
  @Prop({reflect: true}) public withSearch = true;
  /**
   * The sort criterion to apply to the returned facet values.
   * Possible values are 'score', 'alphanumeric', 'alphanumericDescending', 'occurrences', alphanumericNatural', 'alphanumericNaturalDescending' and 'automatic'.
   */
  @Prop({reflect: true}) public sortCriteria: FacetSortCriterion = 'automatic';
  /**
   * Specifies how a result must match the selected facet values.
   * Allowed values:
   * - `atLeastOneValue`: A result will match if at least one of the corresponding facet values is selected.
   * - `allValues`: A result will match if all corresponding facet values are selected.
   */
  @Prop({reflect: true}) public resultsMustMatch: FacetResultsMustMatch =
    'atLeastOneValue';
  /**
   * Whether to display the facet values as checkboxes (multiple selection) or boxes (multiple selection).
   * Possible values are 'checkbox', and 'box'.
   */
  @Prop({reflect: true}) public displayValuesAs: 'checkbox' | 'box' = 'box';
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
  // @Prop() public customSort?: string; TODO: KIT-753 Add customSort option for facet

  /**
   * The required facets and values for this facet to be displayed.
   * Examples:
   * ```html
   * <atomic-facet facet-id="abc" field="objecttype" ...></atomic-facet>
   *
   * <!-- To show the facet when any value is selected in the facet with id "abc": -->
   * <atomic-color-facet
   *   depends-on-abc
   *   ...
   * ></atomic-color-facet>
   *
   * <!-- To show the facet when value "doc" is selected in the facet with id "abc": -->
   * <atomic-color-facet
   *   depends-on-abc="doc"
   *   ...
   * ></atomic-color-facet>
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
   * <atomic-color-facet field="objecttype" allowed-values='["Contact","Account","File"]'></atomic-color-facet>
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
   * <atomic-color-facet field="objecttype" custom-sort='["Contact","Account","File"]' sort-criteria='occurrences'></atomic-color-facet>
   * ```
   * The maximum amount of custom sort values is 25.
   *
   * The default value is `undefined`, and the facet values will be sorted using only the `sortCriteria`.
   */
  @ArrayProp()
  @Prop({mutable: true})
  public customSort: string[] | string = '[]';

  private showLessFocus?: FocusTargetController;

  private showMoreFocus?: FocusTargetController;

  private headerFocus?: FocusTargetController;

  @AriaLiveRegion('facet-search')
  protected facetSearchAriaMessage!: string;

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
    this.facet = buildFacet(this.bindings.engine, {options: this.facetOptions});
    this.tabManager = buildTabManager(this.bindings.engine);
    announceFacetSearchResultsWithAriaLive(
      this.facet,
      this.label,
      (msg) => (this.facetSearchAriaMessage = msg),
      this.bindings.i18n
    );
    this.facetId = this.facet.state.facetId;
    const facetInfo: FacetInfo = {
      label: () => this.bindings.i18n.t(this.label),
      facetId: this.facetId!,
      element: this.host,
      isHidden: () => this.isHidden,
    };
    this.bindings.store.registerFacet('facets', facetInfo);
    initializePopover(this.host, {
      ...facetInfo,
      hasValues: () => !!this.facet.state.values.length,
      numberOfActiveValues: () => this.numberOfSelectedValues,
    });
    this.initializeDependenciesManager();
  }

  private get focusTargets() {
    if (!this.showLessFocus) {
      this.showLessFocus = new FocusTargetController(this);
    }
    if (!this.showMoreFocus) {
      this.showMoreFocus = new FocusTargetController(this);
    }
    if (!this.headerFocus) {
      this.headerFocus = new FocusTargetController(this);
    }

    return {
      showLessFocus: this.showLessFocus,
      showMoreFocus: this.showMoreFocus,
      headerFocus: this.headerFocus,
    };
  }

  public disconnectedCallback() {
    if (this.host.isConnected) {
      return;
    }
    this.dependenciesManager?.stopWatching();
  }

  private get isHidden() {
    return (
      this.searchStatusState.hasError ||
      !this.facet.state.enabled ||
      !this.facet.state.values.length
    );
  }

  public componentShouldUpdate(
    next: unknown,
    prev: unknown,
    propName: keyof AtomicColorFacet
  ) {
    if (propName === 'facetState' && prev && this.withSearch) {
      return shouldUpdateFacetSearchComponent(
        (next as FacetState).facetSearch,
        (prev as FacetState).facetSearch
      );
    }

    return true;
  }

  private get numberOfSelectedValues() {
    return this.facetState.values.filter(({state}) => state === 'selected')
      .length;
  }

  private initializeDependenciesManager() {
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

  private renderHeader() {
    return (
      <FacetHeader
        i18n={this.bindings.i18n}
        label={this.label}
        onClearFilters={() => {
          this.focusTargets.headerFocus.focusAfterSearch();
          this.facet.deselectAll();
        }}
        numberOfActiveValues={this.numberOfSelectedValues}
        isCollapsed={this.isCollapsed}
        headingLevel={this.headingLevel}
        onToggleCollapse={() => (this.isCollapsed = !this.isCollapsed)}
        headerRef={(el) => this.focusTargets.headerFocus.setTarget(el)}
      ></FacetHeader>
    );
  }

  private renderSearchInput() {
    if (!this.withSearch) {
      return;
    }

    return (
      <FacetSearchInput
        i18n={this.bindings.i18n}
        label={this.label}
        query={this.facetState.facetSearch.query}
        onChange={(value) => {
          if (value === '') {
            this.facet.facetSearch.clear();
            return;
          }
          this.facet.facetSearch.updateCaptions(
            getFieldCaptions(this.field, this.bindings.i18n)
          );
          this.facet.facetSearch.updateText(value);
          this.facet.facetSearch.search();
        }}
        onClear={() => this.facet.facetSearch.clear()}
      ></FacetSearchInput>
    );
  }

  private renderValue(
    facetValue: FacetValue,
    onClick: () => void,
    isShowLessFocusTarget: boolean,
    isShowMoreFocusTarget: boolean
  ) {
    const displayValue = getFieldValueCaption(
      this.facetId!,
      facetValue.value,
      this.bindings.i18n
    );
    const isSelected = facetValue.state === 'selected';
    const isExcluded = facetValue.state === 'excluded';
    const partValueWithDisplayValue = displayValue.replace(/[^a-z0-9]/gi, '');
    const partValueWithAPIValue = facetValue.value.replace(/[^a-z0-9]/gi, '');
    switch (this.displayValuesAs) {
      case 'checkbox':
        return (
          <ColorFacetCheckbox
            displayValue={displayValue}
            numberOfResults={facetValue.numberOfResults}
            isSelected={isSelected}
            i18n={this.bindings.i18n}
            onClick={onClick}
            searchQuery={this.facetState.facetSearch.query}
            buttonRef={(element) => {
              isShowLessFocusTarget &&
                this.focusTargets.showLessFocus.setTarget(element);
              isShowMoreFocusTarget &&
                this.focusTargets.showMoreFocus.setTarget(element);
            }}
          >
            <FacetValueLabelHighlight
              displayValue={displayValue}
              isSelected={isSelected}
              searchQuery={this.facetState.facetSearch.query}
            ></FacetValueLabelHighlight>
          </ColorFacetCheckbox>
        );
      case 'box':
        return (
          <FacetValueBox
            displayValue={displayValue}
            numberOfResults={facetValue.numberOfResults}
            isSelected={isSelected}
            i18n={this.bindings.i18n}
            onClick={onClick}
            searchQuery={this.facetState.facetSearch.query}
            buttonRef={(element) => {
              isShowLessFocusTarget &&
                this.focusTargets.showLessFocus.setTarget(element);
              isShowMoreFocusTarget &&
                this.focusTargets.showMoreFocus.setTarget(element);
            }}
          >
            <div
              part={`value-${partValueWithDisplayValue} value-${partValueWithAPIValue} default-color-value`}
              class="value-box-color bg-neutral-dark mb-2 h-12 w-full rounded-md"
            ></div>
            <FacetValueLabelHighlight
              displayValue={displayValue}
              isSelected={isSelected}
              isExcluded={isExcluded}
              searchQuery={this.facetState.facetSearch.query}
            ></FacetValueLabelHighlight>
          </FacetValueBox>
        );
    }
  }

  private renderValuesContainer(children: VNode[], query?: string) {
    const classes = `mt-3 ${
      this.displayValuesAs === 'box' ? 'box-color-container' : ''
    }`;
    return (
      <FacetValuesGroup
        i18n={this.bindings.i18n}
        label={this.label}
        query={query}
      >
        <ul class={classes} part="values">
          {children}
        </ul>
      </FacetValuesGroup>
    );
  }

  private renderValues() {
    return this.renderValuesContainer(
      this.facetState.values.map((value, i) =>
        this.renderValue(
          value,
          () => this.facet.toggleSelect(value),
          i === 0,
          i ===
            (this.sortCriteria === 'automatic'
              ? 0
              : this.resultIndexToFocusOnShowMore)
        )
      )
    );
  }

  private renderSearchResults() {
    return this.renderValuesContainer(
      this.facetState.facetSearch.values.map((value) =>
        this.renderValue(
          {
            state: 'idle',
            numberOfResults: value.count,
            value: value.rawValue,
          },
          () => this.facet.facetSearch.select(value),
          false,
          false
        )
      ),
      this.facetState.facetSearch.query
    );
  }

  private renderMatches() {
    return (
      <FacetSearchMatches
        i18n={this.bindings.i18n}
        query={this.facetState.facetSearch.query}
        numberOfMatches={this.facetState.facetSearch.values.length}
        hasMoreMatches={this.facetState.facetSearch.moreValuesAvailable}
        showMoreMatches={() => this.facet.facetSearch.showMoreResults()}
      ></FacetSearchMatches>
    );
  }

  private renderShowMoreLess() {
    return (
      <FacetShowMoreLess
        label={this.label}
        i18n={this.bindings.i18n}
        onShowMore={() => {
          this.resultIndexToFocusOnShowMore = this.facet.state.values.length;
          this.focusTargets.showMoreFocus.focusAfterSearch();
          this.facet.showMoreValues();
        }}
        onShowLess={() => {
          this.focusTargets.showLessFocus.focusAfterSearch();
          this.facet.showLessValues();
        }}
        canShowLessValues={this.facetState.canShowLessValues}
        canShowMoreValues={this.facetState.canShowMoreValues}
      ></FacetShowMoreLess>
    );
  }

  private get facetOptions(): FacetOptions {
    return {
      facetId: this.facetId,
      field: this.field,
      numberOfValues: this.numberOfValues,
      sortCriteria: this.sortCriteria,
      resultsMustMatch: this.resultsMustMatch,
      facetSearch: {numberOfValues: this.numberOfValues},
      injectionDepth: this.injectionDepth,
      filterFacetCount: this.filterFacetCount,
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
    if (this.searchStatusState.hasError || !this.facet.state.enabled) {
      return <Hidden></Hidden>;
    }

    if (!this.searchStatusState.firstSearchExecuted) {
      return (
        <FacetPlaceholder
          numberOfValues={this.numberOfValues}
          isCollapsed={this.isCollapsed}
        ></FacetPlaceholder>
      );
    }

    if (!this.facetState.values.length) {
      return <Hidden></Hidden>;
    }

    return (
      <FacetContainer>
        {this.renderHeader()}
        {!this.isCollapsed && [
          this.renderSearchInput(),
          shouldDisplaySearchResults(this.facetState.facetSearch)
            ? [this.renderSearchResults(), this.renderMatches()]
            : [this.renderValues(), this.renderShowMoreLess()],
        ]}
      </FacetContainer>
    );
  }
}
