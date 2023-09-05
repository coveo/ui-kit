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
} from '@coveo/headless';
import {Component, h, State, Prop, Element, Fragment} from '@stencil/core';
import LeftArrow from '../../../../images/arrow-left-rounded.svg';
import {
  AriaLiveRegion,
  FocusTargetController,
} from '../../../../utils/accessibility-utils';
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
import {Button} from '../../../common/button';
import {
  parseDependsOn,
  validateDependsOn,
} from '../../../common/facets/facet-common';
import {BaseFacet} from '../../../common/facets/facet-common';
import {FacetInfo} from '../../../common/facets/facet-common-store';
import {FacetContainer} from '../../../common/facets/facet-container/facet-container';
import {FacetHeader} from '../../../common/facets/facet-header/facet-header';
import {FacetPlaceholder} from '../../../common/facets/facet-placeholder/facet-placeholder';
import {announceFacetSearchResultsWithAriaLive} from '../../../common/facets/facet-search/facet-search-aria-live';
import {FacetSearchInput} from '../../../common/facets/facet-search/facet-search-input';
import {FacetSearchMatches} from '../../../common/facets/facet-search/facet-search-matches';
import {
  shouldUpdateFacetSearchComponent,
  shouldDisplaySearchResults,
} from '../../../common/facets/facet-search/facet-search-utils';
import {FacetShowMoreLess} from '../../../common/facets/facet-show-more-less/facet-show-more-less';
import {FacetValueLabelHighlight} from '../../../common/facets/facet-value-label-highlight/facet-value-label-highlight';
import {FacetValueLink} from '../../../common/facets/facet-value-link/facet-value-link';
import {FacetValuesGroup} from '../../../common/facets/facet-values-group/facet-values-group';
import {Hidden} from '../../../common/hidden';
import {Bindings} from '../../atomic-search-interface/atomic-search-interface';
import {initializePopover} from '../atomic-popover/popover-type';
import {CategoryFacetSearchResult} from '../category-facet-search-result/category-facet-search-result';

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
export class AtomicCategoryFacet
  implements InitializableComponent, BaseFacet<CategoryFacet>
{
  @InitializeBindings() public bindings!: Bindings;
  public facet!: CategoryFacet;
  private dependenciesManager?: FacetConditionsManager;
  private resultIndexToFocusOnShowMore = 0;
  public searchStatus!: SearchStatus;
  @Element() private host!: HTMLElement;

  @BindStateToController('facet')
  @State()
  public facetState!: CategoryFacetState;
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
   * Used in the `atomic-breadbox` component through the bindings store.
   */
  @Prop({reflect: true}) public label = 'no-label';
  /**
   * The field whose values you want to display in the facet.
   */
  @Prop({reflect: true}) public field!: string;
  /**
   * The number of values to request for this facet.
   * Also determines the number of additional values to request each time more values are shown.
   */
  @Prop({reflect: true}) public numberOfValues = 8;
  /**
   * Whether this facet should contain a search box.
   * When "true", the search is only enabled when more facet values are available.
   */
  @Prop({reflect: true}) public withSearch = false;
  /**
   * The sort criterion to apply to the returned facet values.
   * Possible values are 'alphanumeric' and 'occurrences'.
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

  private validateProps() {
    validateDependsOn(this.dependsOn);
  }

  public initialize() {
    this.validateProps();
    this.searchStatus = buildSearchStatus(this.bindings.engine);
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
      hasValues: () => !!this.facet.state.values.length,
      numberOfSelectedValues: () => (this.facetState.hasActiveValues ? 1 : 0),
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
      (!this.facet.state.values.length && !this.facet.state.parents.length)
    );
  }

  public componentShouldUpdate(
    next: unknown,
    prev: unknown,
    propName: keyof AtomicCategoryFacet
  ) {
    if (propName === 'facetState' && prev && this.withSearch) {
      return shouldUpdateFacetSearchComponent(
        (next as CategoryFacetState).facetSearch,
        (prev as CategoryFacetState).facetSearch
      );
    }

    return true;
  }

  private get hasParents() {
    return !!this.facetState.parents.length;
  }

  private initializeDependenciesManager() {
    this.dependenciesManager = buildFacetConditionsManager(
      this.bindings.engine,
      {
        facetId: this.facetId!,
        conditions: parseDependsOn(this.dependsOn),
      }
    );
  }

  private renderHeader() {
    return (
      <FacetHeader
        i18n={this.bindings.i18n}
        label={this.label}
        numberOfSelectedValues={
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

  private renderAllCategoriesButton() {
    const allCategories = this.bindings.i18n.t('all-categories');
    return (
      <Button
        style="text-neutral"
        part="all-categories-button"
        onClick={() => {
          this.focusTargets.activeValueFocus.focusAfterSearch();
          this.facet.deselectAll();
        }}
      >
        <atomic-icon
          aria-hidden="true"
          icon={LeftArrow}
          part="back-arrow"
        ></atomic-icon>
        <span class="truncate">{allCategories}</span>
      </Button>
    );
  }

  private renderParentButton(facetValue: CategoryFacetValue) {
    const displayValue = getFieldValueCaption(
      this.field,
      facetValue.value,
      this.bindings.i18n
    );
    const ariaLabel = this.bindings.i18n.t('facet-value', {
      value: displayValue,
      count: facetValue.numberOfResults,
    });

    return (
      <Button
        style="text-neutral"
        part="parent-button"
        ariaPressed="false"
        onClick={() => {
          this.focusTargets.activeValueFocus.focusAfterSearch();
          this.facet.toggleSelect(facetValue);
        }}
        ariaLabel={ariaLabel}
      >
        <atomic-icon
          icon={LeftArrow}
          part="back-arrow"
          class="back-arrow"
        ></atomic-icon>
        <span class="truncate">{displayValue}</span>
      </Button>
    );
  }

  private renderValuesTree(parents: CategoryFacetValue[], isRoot: boolean) {
    if (!this.hasParents) {
      return this.renderChildren();
    }

    if (isRoot) {
      return (
        <li class="contents">
          {this.renderAllCategoriesButton()}
          <ul part="sub-parents">{this.renderValuesTree(parents, false)}</ul>
        </li>
      );
    }

    if (parents.length > 1) {
      return (
        <li class="contents">
          {this.renderParentButton(parents[0])}
          <ul part="sub-parents">
            {this.renderValuesTree(parents.slice(1), false)}
          </ul>
        </li>
      );
    }

    const activeParent = parents[0];
    const activeParentDisplayValue = getFieldValueCaption(
      this.field,
      activeParent.value,
      this.bindings.i18n
    );

    return (
      <FacetValueLink
        displayValue={activeParentDisplayValue}
        numberOfResults={activeParent.numberOfResults}
        isSelected={true}
        i18n={this.bindings.i18n}
        onClick={() => {
          this.focusTargets.activeValueFocus.focusAfterSearch();
          this.facet.deselectAll();
        }}
        searchQuery={this.facetState.facetSearch.query}
        part={`active-parent ${this.getIsLeafOrNodePart(activeParent)}`}
        class="contents"
        buttonRef={this.focusTargets.activeValueFocus.setTarget}
        subList={<ul part="values">{this.renderChildren()}</ul>}
      >
        <FacetValueLabelHighlight
          displayValue={activeParentDisplayValue}
          isSelected={true}
        ></FacetValueLabelHighlight>
      </FacetValueLink>
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
      <FacetValueLink
        displayValue={displayValue}
        numberOfResults={facetValue.numberOfResults}
        isSelected={isSelected}
        i18n={this.bindings.i18n}
        onClick={() => {
          this.focusTargets.activeValueFocus.focusAfterSearch();
          this.facet.toggleSelect(facetValue);
        }}
        searchQuery={this.facetState.facetSearch.query}
        buttonRef={(element) => {
          isShowLessFocusTarget &&
            this.focusTargets.showLessFocus.setTarget(element);
          isShowMoreFocusTarget &&
            this.focusTargets.showMoreFocus.setTarget(element);
        }}
        additionalPart={this.getIsLeafOrNodePart(facetValue)}
      >
        <FacetValueLabelHighlight
          displayValue={displayValue}
          isSelected={isSelected}
        ></FacetValueLabelHighlight>
      </FacetValueLink>
    );
  }

  private renderChildren() {
    if (!this.facetState.values.length) {
      return;
    }

    return this.facetState.values.map((value, i) =>
      this.renderChild(value, i === 0, i === this.resultIndexToFocusOnShowMore)
    );
  }

  private getIsLeafOrNodePart(value: CategoryFacetValue) {
    return value.isLeafValue ? 'leaf-value' : 'node-value';
  }

  private renderSearchResults() {
    return (
      <ul part="search-results" class="mt-3">
        {this.facetState.facetSearch.values.map((value) => (
          <CategoryFacetSearchResult
            result={value}
            field={this.field}
            i18n={this.bindings.i18n}
            searchQuery={this.facetState.facetSearch.query}
            onClick={() => {
              this.focusTargets.activeValueFocus.focusAfterSearch();
              this.facet.facetSearch.select(value);
            }}
          ></CategoryFacetSearchResult>
        ))}
      </ul>
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
          label={this.label}
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

    if (!this.facetState.values.length && !this.facetState.parents.length) {
      return <Hidden></Hidden>;
    }

    return (
      <FacetContainer>
        {this.renderHeader()}
        {!this.isCollapsed && [
          this.renderSearchInput(),
          shouldDisplaySearchResults(this.facetState.facetSearch) ? (
            <Fragment>
              {this.facetState.facetSearch.values.length ? (
                <FacetValuesGroup
                  i18n={this.bindings.i18n}
                  label={this.label}
                  query={this.facetState.facetSearch.query}
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
              <FacetValuesGroup i18n={this.bindings.i18n} label={this.label}>
                {this.hasParents ? (
                  <ul part="parents" class="mt-3">
                    {this.renderValuesTree(this.facetState.parents, true)}
                  </ul>
                ) : (
                  <ul part="values" class="mt-3">
                    {this.renderChildren()}
                  </ul>
                )}
              </FacetValuesGroup>
              {this.renderShowMoreLess()}
            </Fragment>
          ),
        ]}
      </FacetContainer>
    );
  }
}
