import {
  CategoryFacetState,
  CategoryFacetValue,
  CategoryFacet,
  SearchSummaryState,
  ProductListingSummaryState,
  Summary,
} from '@coveo/headless/commerce';
import {Component, h, State, Prop, Element, Fragment} from '@stencil/core';
import {getFieldValueCaption} from '../../../../utils/field-utils';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {
  AriaLiveRegion,
  FocusTargetController,
} from '../../../../utils/stencil-accessibility-utils';
import {CategoryFacetAllCategoryButton} from '../../../common/facets/category-facet/all-categories-button';
import {CategoryFacetChildValueLink} from '../../../common/facets/category-facet/child-value-link';
import {CategoryFacetChildrenAsTreeContainer} from '../../../common/facets/category-facet/children-as-tree-container';
import {CategoryFacetParentAsTreeContainer} from '../../../common/facets/category-facet/parent-as-tree-container';
import {CategoryFacetParentButton} from '../../../common/facets/category-facet/parent-button';
import {CategoryFacetParentValueLink} from '../../../common/facets/category-facet/parent-value-link';
import {CategoryFacetSearchResultsContainer} from '../../../common/facets/category-facet/search-results-container';
import {CategoryFacetSearchValue} from '../../../common/facets/category-facet/search-value';
import {CategoryFacetTreeValueContainer} from '../../../common/facets/category-facet/value-as-tree-container';
import {FacetInfo} from '../../../common/facets/facet-common-store';
import {FacetContainer} from '../../../common/facets/facet-container/facet-container';
import {FacetGuard} from '../../../common/facets/facet-guard';
import {FacetHeader} from '../../../common/facets/facet-header/facet-header';
import {announceFacetSearchResultsWithAriaLive} from '../../../common/facets/facet-search/facet-search-aria-live';
import {FacetSearchInput} from '../../../common/facets/facet-search/facet-search-input';
import {FacetSearchMatches} from '../../../common/facets/facet-search/facet-search-matches';
import {
  shouldUpdateFacetSearchComponent,
  shouldDisplaySearchResults,
} from '../../../common/facets/facet-search/facet-search-utils';
import {FacetShowMoreLess} from '../../../common/facets/facet-show-more-less/facet-show-more-less';
import {FacetValuesGroup} from '../../../common/facets/facet-values-group/facet-values-group';
import {initializePopover} from '../../../common/facets/popover/popover-type';
import {CommerceBindings as Bindings} from '../../atomic-commerce-interface/atomic-commerce-interface';

/**
 * A facet is a list of values for a certain field occurring in the results, ordered using a configurable criteria (e.g., number of occurrences).
 * An `atomic-commerce-category-facet` displays a facet of values in a browsable, hierarchical fashion.
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
 *
 * @alpha
 */
@Component({
  tag: 'atomic-commerce-category-facet',
  styleUrl: 'atomic-commerce-category-facet.pcss',
  shadow: true,
})
export class AtomicCategoryFacet implements InitializableComponent<Bindings> {
  @InitializeBindings() public bindings!: Bindings;
  @Element() private host!: HTMLElement;

  /**
   * The summary controller instance.
   */
  @Prop() summary!: Summary<SearchSummaryState | ProductListingSummaryState>;
  /**
   * The category facet controller instance.
   */
  @Prop() public facet!: CategoryFacet;
  /**
   * Specifies whether the facet is collapsed.
   */
  @Prop({reflect: true, mutable: true}) public isCollapsed = false;
  /**
   * The field identifier for this facet.
   */
  @Prop({reflect: true}) field?: string;

  @State()
  public facetState!: CategoryFacetState;

  @BindStateToController('summary')
  @State()
  public summaryState!: SearchSummaryState | ProductListingSummaryState;

  @State() public error!: Error;

  private resultIndexToFocusOnShowMore = 0;
  private showLessFocus?: FocusTargetController;
  private showMoreFocus?: FocusTargetController;
  private headerFocus?: FocusTargetController;
  private activeValueFocus?: FocusTargetController;
  private unsubscribeFacetController?: () => void | undefined;

  @AriaLiveRegion('facet-search')
  protected facetSearchAriaMessage!: string;

  public initialize() {
    if (!this.facet) {
      return;
    }

    this.ensureSubscribed();
    announceFacetSearchResultsWithAriaLive(
      this.facet,
      this.displayName,
      (msg) => (this.facetSearchAriaMessage = msg),
      this.bindings.i18n
    );

    const facetInfo: FacetInfo = {
      label: () => this.bindings.i18n.t(this.displayName),
      facetId: this.facetState.facetId,
      element: this.host,
      isHidden: () => this.isHidden,
    };

    initializePopover(this.host, {
      ...facetInfo,
      hasValues: () => !!this.facetState.values.length,
      numberOfActiveValues: () => (this.facetState.hasActiveValues ? 1 : 0),
    });
  }

  private get displayName() {
    return this.facetState?.displayName || 'no-label';
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
    this.unsubscribeFacetController?.();
    this.unsubscribeFacetController = undefined;
  }

  public connectedCallback(): void {
    this.ensureSubscribed();
  }

  private get isHidden() {
    return (
      this.summaryState.hasError ||
      (!this.facetState.values.length &&
        !this.facetState.selectedValueAncestry?.length)
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
    return !!this.facetState.selectedValueAncestry?.length;
  }

  private renderHeader() {
    return (
      <FacetHeader
        i18n={this.bindings.i18n}
        label={this.displayName}
        numberOfActiveValues={
          this.facetState.hasActiveValues && this.isCollapsed ? 1 : 0
        }
        isCollapsed={this.isCollapsed}
        headingLevel={0}
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
    return (
      <FacetSearchInput
        i18n={this.bindings.i18n}
        label={this.displayName}
        query={this.facetState.facetSearch.query}
        onChange={(value) => {
          if (value === '') {
            this.facet.facetSearch.clear();
            return;
          }
          this.facet.facetSearch.updateText(value);
          this.facet.facetSearch.search();
        }}
        onClear={() => this.facet.facetSearch.clear()}
      ></FacetSearchInput>
    );
  }

  private renderValuesTree(parents: CategoryFacetValue[], isRoot: boolean) {
    if (!this.hasParents) {
      return this.renderChildren();
    }

    if (isRoot) {
      return (
        <CategoryFacetTreeValueContainer>
          <CategoryFacetAllCategoryButton
            i18n={this.bindings.i18n}
            onClick={() => {
              this.focusTargets.activeValueFocus.focusAfterSearch();
              this.facet.deselectAll();
            }}
          />
          <CategoryFacetParentAsTreeContainer isTopLevel={false}>
            {this.renderValuesTree(parents, false)}
          </CategoryFacetParentAsTreeContainer>
        </CategoryFacetTreeValueContainer>
      );
    }

    if (parents.length > 1) {
      const parentValue = parents[0];

      return (
        <CategoryFacetTreeValueContainer>
          <CategoryFacetParentButton
            facetValue={parentValue}
            field={this.facetState?.field}
            i18n={this.bindings.i18n}
            onClick={() => {
              this.focusTargets.activeValueFocus.focusAfterSearch();
              this.facet.toggleSelect(parentValue);
            }}
          />
          <CategoryFacetParentAsTreeContainer isTopLevel={false}>
            {this.renderValuesTree(parents.slice(1), false)}
          </CategoryFacetParentAsTreeContainer>
        </CategoryFacetTreeValueContainer>
      );
    }

    const activeParent = parents[0];
    const activeParentDisplayValue = getFieldValueCaption(
      this.facetState?.field,
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
      this.facetState?.field,
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
    const {values, selectedValueAncestry, hasActiveValues} = this.facetState;
    const nextValues = hasActiveValues ? selectedValueAncestry : values;

    const children = nextValues?.length
      ? hasActiveValues
        ? nextValues[nextValues.length - 1].children
        : nextValues
      : [];

    return children.map((value, i) =>
      this.renderChild(value, i === 0, i === this.resultIndexToFocusOnShowMore)
    );
  }

  private renderSearchResults() {
    return (
      <CategoryFacetSearchResultsContainer>
        {this.facetState.facetSearch.values.map((value) => (
          <CategoryFacetSearchValue
            value={value}
            field={this.facetState?.field}
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
      ></FacetSearchMatches>
    );
  }

  private renderShowMoreLess() {
    return (
      <div class={this.hasParents ? 'pl-9' : ''}>
        <FacetShowMoreLess
          label={this.displayName}
          i18n={this.bindings.i18n}
          onShowMore={() => {
            this.resultIndexToFocusOnShowMore = this.facetState.values.length;
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
      facetState: {facetSearch, selectedValueAncestry, values},
    } = this;

    const {hasError, firstRequestExecuted} = this.summaryState;

    return (
      <FacetGuard
        enabled={true}
        firstSearchExecuted={firstRequestExecuted}
        hasError={hasError}
        hasResults={values.length > 0}
      >
        {
          <FacetContainer>
            {this.renderHeader()}
            {!this.isCollapsed && [
              this.renderSearchInput(),
              shouldDisplaySearchResults(facetSearch) ? (
                <Fragment>
                  {facetSearch.values.length ? (
                    <FacetValuesGroup
                      i18n={i18n}
                      label={this.displayName}
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
                  <FacetValuesGroup i18n={i18n} label={this.displayName}>
                    {this.hasParents ? (
                      <CategoryFacetParentAsTreeContainer
                        isTopLevel={true}
                        className="mt-3"
                      >
                        {selectedValueAncestry &&
                          this.renderValuesTree(selectedValueAncestry, true)}
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
        }
      </FacetGuard>
    );
  }

  private ensureSubscribed() {
    if (this.unsubscribeFacetController) {
      return;
    }
    this.unsubscribeFacetController = this.facet.subscribe(
      () => (this.facetState = this.facet.state)
    );
  }
}
