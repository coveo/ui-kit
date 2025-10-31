import {
  CategoryFacet,
  buildCategoryFacet,
  CategoryFacetState,
  CategoryFacetOptions,
  CategoryFacetSortCriterion,
  SearchStatus,
  SearchStatusState,
  buildSearchStatus,
  CategoryFacetValue,
  buildFacetConditionsManager,
  FacetConditionsManager,
  FacetValueRequest,
  CategoryFacetValueRequest,
  TabManagerState,
  TabManager,
  buildTabManager,
} from '@coveo/headless';
import {Component, h, State, Prop, Element, Fragment} from '@stencil/core';
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
import {CategoryFacetAllCategoryButton} from '../../../common/facets/category-facet/stencil-all-categories-button';
import {CategoryFacetChildValueLink} from '../../../common/facets/category-facet/stencil-child-value-link';
import {CategoryFacetChildrenAsTreeContainer} from '../../../common/facets/category-facet/stencil-children-as-tree-container';
import {CategoryFacetParentAsTreeContainer} from '../../../common/facets/category-facet/stencil-parent-as-tree-container';
import {CategoryFacetParentButton} from '../../../common/facets/category-facet/stencil-parent-button';
import {CategoryFacetParentValueLink} from '../../../common/facets/category-facet/stencil-parent-value-link';
import {CategoryFacetSearchResultsContainer} from '../../../common/facets/category-facet/stencil-search-results-container';
import {CategoryFacetSearchValue} from '../../../common/facets/category-facet/stencil-search-value';
import {CategoryFacetTreeValueContainer} from '../../../common/facets/category-facet/stencil-value-as-tree-container';
import {parseDependsOn} from '../../../common/facets/depends-on';
import {FacetInfo} from '../../../common/facets/facet-common-store';
import {FacetContainer} from '../../../common/facets/facet-container/stencil-facet-container';
import {FacetGuard} from '../../../common/facets/stencil-facet-guard';
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
import {FacetValuesGroup} from '../../../common/facets/facet-values-group/stencil-facet-values-group';
import {initializePopover} from '../../../common/facets/popover/popover-type';
import {Bindings} from '../../atomic-search-interface/atomic-search-interface';

/**
 * A facet is a list of values for a certain field occurring in the results, ordered using a configurable criteria (e.g., number of occurrences).
 * An `atomic-category-facet` displays a facet of values in a browsable, hierarchical fashion.
 *
 * @part facet - The wrapper for the entire facet.
 * @part placeholder - The placeholder shown before the first search is executed.
 *
 * @part label-button - The button that displays the label and allows to expand/collapse the facet.
 * @part label-button-icon - The label button icon.
 *
 * @part search-wrapper - The search box wrapper.
 * @part search-input - The search box input.
 * @part search-icon - The search box submit button.
 * @part search-clear-button - The button to clear the search box of input.
 * @part more-matches - The label indicating there are more matches for the current facet search query.
 * @part no-matches - The label indicating there are no matches for the current facet search query.
 * @part matches-query - The highlighted query inside the matches labels.
 * @part search-results - The search results container.
 * @part search-result - The search result value.
 * @part search-result-path - The search result path.
 * @part search-highlight - The highlighted query inside the facet values.
 *
 * @part parents - The container surrounding the whole hierarchy of values.
 * @part sub-parents - The container surrounding a sub-hierarchy of values.
 * @part values - The container surrounding either the children of the active value or the values at the base.
 * @part all-categories-button - The "View all" button displayed first within the parents.
 * @part parent-button - The clickable parent button displayed first within sub-parents.
 * @part active-parent - The clickable active parent displayed first within the last sub-parents.
 * @part value-link - The clickable value displayed first within values.
 * @part back-arrow - The back arrow displayed before the clickable parents.
 * @part value-label - The facet value label within a value button.
 * @part value-count - The facet value count within a value button.
 * @part leaf-value - A facet value with no child value.
 * @part node-value - A facet value with child values.
 *
 * @part show-more - The show more results button.
 * @part show-less - The show less results button.
 * @part show-more-less-icon - The icons of the show more & show less buttons.
 */
@Component({
  tag: 'atomic-category-facet',
  styleUrl: 'atomic-category-facet.pcss',
  shadow: true,
})
export class AtomicCategoryFacet implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  public facet!: CategoryFacet;
  private dependenciesManager?: FacetConditionsManager;
  private resultIndexToFocusOnShowMore = 0;
  public searchStatus!: SearchStatus;
  public tabManager!: TabManager;
  @Element() private host!: HTMLElement;

  @BindStateToController('facet')
  @State()
  public facetState!: CategoryFacetState;
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
  @Prop({reflect: true}) public withSearch = false;
  /**
   * The sort criterion to apply to the returned facet values.
   * Possible values are 'alphanumeric' and 'occurrences'.
   * For this criterion to apply to the top-layer facet values, disable
   * [facet value ordering](https://docs.coveo.com/en/l1qf4156/#facet-value-ordering)
   * in your Dynamic Navigation Experience configuration.
   */
  // TODO: add automatic (occurrences when not expanded, alphanumeric when expanded)
  @Prop({reflect: true}) public sortCriteria: CategoryFacetSortCriterion =
    'occurrences';
  /**
   * The character that separates values of a multi-value field.
   *
   * *Note:* If you use the [example formatting](https://docs.coveo.com/en/atomic/latest/reference/components/atomic-category-facet/#usage-notes) for the associated multi-value field, you must set this value to `|` or the facet won't display properly.
   */
  @Prop({reflect: true}) public delimitingCharacter = ';';
  /**
   * The base path shared by all values for the facet.
   *
   * Specify the property as an array using a JSON string representation:
   * ```html
   *  <atomic-category-facet base-path='["first value", "second value"]' ></atomic-category-facet>
   * ```
   */
  @ArrayProp()
  @Prop({reflect: true, mutable: true})
  public basePath: string[] | string = '[]';

  /**
   * Whether to use basePath as a filter for the results.
   */
  @Prop({reflect: true}) public filterByBasePath = true;
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
   * <atomic-category-facet
   *   depends-on-abc
   *   ...
   * ></atomic-category-facet>
   *
   * <!-- To show the facet when value "doc" is selected in the facet with id "abc": -->
   * <atomic-category-facet
   *   depends-on-abc="doc"
   *   ...
   * ></atomic-category-facet>
   * ```
   */
  @MapProp() @Prop() public dependsOn: Record<string, string> = {};

  private showLessFocus?: FocusTargetController;

  private showMoreFocus?: FocusTargetController;

  private headerFocus?: FocusTargetController;

  private activeValueFocus?: FocusTargetController;

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
    this.tabManager = buildTabManager(this.bindings.engine);
    const options: CategoryFacetOptions = {
      facetId: this.facetId,
      field: this.field,
      numberOfValues: this.numberOfValues,
      sortCriteria: this.sortCriteria,
      facetSearch: {numberOfValues: this.numberOfValues},
      basePath: [...this.basePath],
      delimitingCharacter: this.delimitingCharacter,
      filterByBasePath: this.filterByBasePath,
      injectionDepth: this.injectionDepth,
      filterFacetCount: this.filterFacetCount,
      tabs: {
        included: [...this.tabsIncluded],
        excluded: [...this.tabsExcluded],
      },
    };
    this.facet = buildCategoryFacet(this.bindings.engine, {options});
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
    this.bindings.store.registerFacet('categoryFacets', facetInfo);
    initializePopover(this.host, {
      ...facetInfo,
      hasValues: () => !!this.facet.state.valuesAsTrees.length,
      numberOfActiveValues: () => (this.facetState.hasActiveValues ? 1 : 0),
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
    if (!this.activeValueFocus) {
      this.activeValueFocus = new FocusTargetController(this);
    }

    return {
      showLessFocus: this.showLessFocus,
      showMoreFocus: this.showMoreFocus,
      headerFocus: this.headerFocus,
      activeValueFocus: this.activeValueFocus,
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
      (!this.facet.state.selectedValueAncestry.length &&
        !this.facet.state.valuesAsTrees.length)
    );
  }

  public componentShouldUpdate(
    next: unknown,
    prev: unknown,
    propName: keyof AtomicCategoryFacet
  ) {
    if (
      this.isCategoryFacetState(prev, propName) &&
      this.isCategoryFacetState(next, propName)
    ) {
      return shouldUpdateFacetSearchComponent(
        next.facetSearch,
        prev.facetSearch
      );
    }
    return true;
  }

  private get hasParents() {
    return !!this.facetState.selectedValueAncestry.length;
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
        numberOfActiveValues={
          this.facetState.hasActiveValues && this.isCollapsed ? 1 : 0
        }
        isCollapsed={this.isCollapsed}
        headingLevel={this.headingLevel}
        onToggleCollapse={() => (this.isCollapsed = !this.isCollapsed)}
        onClearFilters={() => {
          this.focusTargets.headerFocus.focusAfterSearch();
          this.facet.deselectAll();
        }}
        headerRef={(header) => {
          this.focusTargets.headerFocus.setTarget(header);
          if (!this.hasParents) {
            this.focusTargets.activeValueFocus.setTarget(header);
          }
        }}
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

  private renderValuesTree(
    valuesAsTrees: CategoryFacetValue[],
    isRoot: boolean
  ) {
    if (!this.hasParents) {
      return this.renderChildren();
    }

    if (isRoot) {
      return (
        <CategoryFacetTreeValueContainer>
          <CategoryFacetAllCategoryButton
            i18n={this.bindings.i18n}
            facetId={this.facet.state.facetId}
            field={this.field}
            onClick={() => {
              this.focusTargets.activeValueFocus.focusAfterSearch();
              this.facet.deselectAll();
            }}
          />
          <CategoryFacetParentAsTreeContainer isTopLevel={false}>
            {this.renderValuesTree(valuesAsTrees, false)}
          </CategoryFacetParentAsTreeContainer>
        </CategoryFacetTreeValueContainer>
      );
    }

    if (valuesAsTrees.length > 1) {
      const parentValue = valuesAsTrees[0];

      return (
        <CategoryFacetTreeValueContainer>
          <CategoryFacetParentButton
            facetValue={parentValue}
            field={this.field}
            i18n={this.bindings.i18n}
            onClick={() => {
              this.focusTargets.activeValueFocus.focusAfterSearch();
              this.facet.toggleSelect(parentValue);
            }}
          />
          <CategoryFacetParentAsTreeContainer isTopLevel={false}>
            {this.renderValuesTree(valuesAsTrees.slice(1), false)}
          </CategoryFacetParentAsTreeContainer>
        </CategoryFacetTreeValueContainer>
      );
    }

    const activeParent = valuesAsTrees[0];
    const activeParentDisplayValue = getFieldValueCaption(
      this.field,
      activeParent.value,
      this.bindings.i18n
    );

    return (
      <CategoryFacetParentValueLink
        displayValue={activeParentDisplayValue}
        numberOfResults={activeParent.numberOfResults}
        i18n={this.bindings.i18n}
        isLeafValue={activeParent.isLeafValue}
        onClick={() => {
          this.focusTargets.activeValueFocus.focusAfterSearch();
          this.facet.deselectAll();
        }}
        searchQuery={this.facetState.facetSearch.query}
        setRef={(el) => this.focusTargets.activeValueFocus.setTarget(el)}
      >
        <CategoryFacetChildrenAsTreeContainer>
          {this.renderChildren()}
        </CategoryFacetChildrenAsTreeContainer>
      </CategoryFacetParentValueLink>
    );
  }

  private renderChild(
    facetValue: CategoryFacetValue,
    isShowLessFocusTarget: boolean,
    isShowMoreFocusTarget: boolean
  ) {
    const displayValue = getFieldValueCaption(
      this.field,
      facetValue.value,
      this.bindings.i18n
    );
    const isSelected = facetValue.state === 'selected';
    return (
      <CategoryFacetChildValueLink
        displayValue={displayValue}
        i18n={this.bindings.i18n}
        isLeafValue={facetValue.isLeafValue}
        isSelected={isSelected}
        numberOfResults={facetValue.numberOfResults}
        onClick={() => {
          this.focusTargets.activeValueFocus.focusAfterSearch();
          this.facet.toggleSelect(facetValue);
        }}
        searchQuery={this.facetState.facetSearch.query}
        setRef={(element) => {
          isShowLessFocusTarget &&
            this.focusTargets.showLessFocus.setTarget(element);
          isShowMoreFocusTarget &&
            this.focusTargets.showMoreFocus.setTarget(element);
        }}
      ></CategoryFacetChildValueLink>
    );
  }

  private renderChildren() {
    if (!this.facetState.valuesAsTrees.length) {
      return;
    }
    if (this.facetState.selectedValueAncestry.length > 0) {
      return this.facetState.selectedValueAncestry
        .find((value) => value.state === 'selected')
        ?.children.map((value, i) =>
          this.renderChild(
            value,
            i === 0,
            i === this.resultIndexToFocusOnShowMore
          )
        );
    }

    return this.facetState.valuesAsTrees.map((value, i) =>
      this.renderChild(value, i === 0, i === this.resultIndexToFocusOnShowMore)
    );
  }

  private renderSearchResults() {
    return (
      <CategoryFacetSearchResultsContainer>
        {this.facetState.facetSearch.values.map((value) => (
          <CategoryFacetSearchValue
            value={value}
            field={this.field}
            facetId={this.facetId}
            i18n={this.bindings.i18n}
            searchQuery={this.facetState.facetSearch.query}
            onClick={() => {
              this.focusTargets.activeValueFocus.focusAfterSearch();
              this.facet.facetSearch.select(value);
            }}
          ></CategoryFacetSearchValue>
        ))}
      </CategoryFacetSearchResultsContainer>
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
      <div class={this.hasParents ? 'pl-9' : ''}>
        <FacetShowMoreLess
          label={this.label}
          i18n={this.bindings.i18n}
          onShowMore={() => {
            this.resultIndexToFocusOnShowMore =
              this.facetState.valuesAsTrees[0].children.length;
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
      </div>
    );
  }

  private isCategoryFacetState(
    state: unknown,
    propName: string
  ): state is CategoryFacetState {
    return (
      propName === 'facetState' &&
      typeof (state as CategoryFacetState)?.facetId === 'string'
    );
  }

  public render() {
    const {
      bindings: {i18n},
      label,
      facetState: {facetSearch, enabled, valuesAsTrees, selectedValueAncestry},
      searchStatusState: {hasError, firstSearchExecuted},
    } = this;

    return (
      <FacetGuard
        enabled={enabled}
        firstSearchExecuted={firstSearchExecuted}
        hasError={hasError}
        hasResults={valuesAsTrees.length > 0}
      >
        {firstSearchExecuted ? (
          <FacetContainer>
            {this.renderHeader()}
            {!this.isCollapsed && [
              this.renderSearchInput(),
              shouldDisplaySearchResults(facetSearch) ? (
                <Fragment>
                  {facetSearch.values.length ? (
                    <FacetValuesGroup
                      i18n={i18n}
                      label={label}
                      query={facetSearch.query}
                    >
                      {this.renderSearchResults()}
                    </FacetValuesGroup>
                  ) : (
                    <div class="mt-3"></div>
                  )}
                  {this.renderMatches()}
                </Fragment>
              ) : (
                <Fragment>
                  <FacetValuesGroup i18n={i18n} label={label}>
                    {this.hasParents ? (
                      <CategoryFacetParentAsTreeContainer
                        isTopLevel={true}
                        className="mt-3"
                      >
                        {this.renderValuesTree(selectedValueAncestry, true)}
                      </CategoryFacetParentAsTreeContainer>
                    ) : (
                      <CategoryFacetChildrenAsTreeContainer className="mt-3">
                        {this.renderChildren()}
                      </CategoryFacetChildrenAsTreeContainer>
                    )}
                  </FacetValuesGroup>
                  {this.renderShowMoreLess()}
                </Fragment>
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
}
