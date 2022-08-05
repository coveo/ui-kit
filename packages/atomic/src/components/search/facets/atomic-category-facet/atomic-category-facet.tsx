import {Component, h, State, Prop, Element, Fragment} from '@stencil/core';
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
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {FacetPlaceholder} from '../../../common/facets/facet-placeholder/facet-placeholder';
import {FacetContainer} from '../../../common/facets/facet-container/facet-container';
import {FacetHeader} from '../../../common/facets/facet-header/facet-header';
import {FacetSearchInput} from '../../../common/facets/facet-search/facet-search-input';
import {FacetShowMoreLess} from '../../../common/facets/facet-show-more-less/facet-show-more-less';
import {FacetSearchMatches} from '../../../common/facets/facet-search/facet-search-matches';
import {
  shouldUpdateFacetSearchComponent,
  shouldDisplaySearchResults,
} from '../../../common/facets/facet-search/facet-search-utils';
import {
  parseDependsOn,
  validateDependsOn,
} from '../../../common/facets/facet-common';
import {
  getFieldCaptions,
  getFieldValueCaption,
} from '../../../../utils/field-utils';
import {FacetValueLink} from '../../../common/facets/facet-value-link/facet-value-link';
import {FacetValueLabelHighlight} from '../../../common/facets/facet-value-label-highlight/facet-value-label-highlight';
import LeftArrow from 'coveo-styleguide/resources/icons/svg/arrow-left-rounded.svg';
import {CategoryFacetSearchResult} from '../category-facet-search-result/category-facet-search-result';
import {Button} from '../../../common/button';
import {Hidden} from '../../../common/hidden';
import {
  FocusTarget,
  FocusTargetController,
} from '../../../../utils/accessibility-utils';
import {MapProp} from '../../../../utils/props-utils';
import {FacetValuesGroup} from '../../../common/facets/facet-values-group/facet-values-group';
import {Bindings} from '../../atomic-search-interface/atomic-search-interface';
import {BaseFacet} from '../../../common/facets/facet-common';

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
 * @part parents - The parent values container.
 * @part all-categories-button - The "View all" button displayed first along the parents.
 * @part parent-button - The clickable parent button.
 * @part active-parent - The non-clickable active parent.
 * @part back-arrow - The back arrow displayed before the clickable parents.
 *
 * @part values - The facet values child container.
 * @part value-link - The child facet value.
 * @part value-label - The facet value label.
 * @part value-count - The facet value count.
 * @part leaf-value - A facet value with no child value
 * @part node-value - A facet value with children values
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
   */
  @Prop({reflect: true}) public delimitingCharacter = ';';
  /**
   * The base path shared by all values for the facet, separated by commas.
   */
  @Prop({reflect: true}) public basePath?: string;
  /**
   * Whether to use basePath as a filter for the results.
   */
  @Prop({reflect: true}) public filterByBasePath = true;
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

  @FocusTarget()
  private showLessFocus!: FocusTargetController;

  @FocusTarget()
  private showMoreFocus!: FocusTargetController;

  @FocusTarget()
  private headerFocus!: FocusTargetController;

  @FocusTarget()
  private activeValueFocus!: FocusTargetController;

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
      basePath: this.basePath
        ? this.basePath.split(',').map((value) => value.trim())
        : undefined,
      delimitingCharacter: this.delimitingCharacter,
      filterByBasePath: this.filterByBasePath,
      injectionDepth: this.injectionDepth,
      filterFacetCount: this.filterFacetCount,
    };
    this.facet = buildCategoryFacet(this.bindings.engine, {options});
    this.facetId = this.facet.state.facetId;
    this.bindings.store.registerFacet('categoryFacets', {
      label: this.label,
      facetId: this.facetId!,
      element: this.host,
    });
    this.inititalizeDependenciesManager();
  }

  public disconnectedCallback() {
    if (this.host.isConnected) {
      return;
    }
    this.dependenciesManager?.stopWatching();
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

  private inititalizeDependenciesManager() {
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
          this.headerFocus.focusAfterSearch();
          this.facet.deselectAll();
        }}
        headerRef={(header) => {
          this.headerFocus.setTarget(header);
          if (!this.hasParents) {
            this.activeValueFocus.setTarget(header);
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

  private renderAllCategories() {
    const allCategories = this.bindings.i18n.t('all-categories');
    return (
      <li key={allCategories}>
        <Button
          style="text-neutral"
          part="all-categories-button"
          class="parent-button"
          onClick={() => {
            this.activeValueFocus.focusAfterSearch();
            this.facet.deselectAll();
          }}
        >
          <atomic-icon
            aria-hidden="true"
            icon={LeftArrow}
            part="back-arrow"
            class="back-arrow"
          ></atomic-icon>
          <span class="truncate">{allCategories}</span>
        </Button>
      </li>
    );
  }

  private renderParent(facetValue: CategoryFacetValue) {
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
      <li key={displayValue}>
        <Button
          style="text-neutral"
          part="parent-button"
          class="parent-button"
          ariaPressed="false"
          onClick={() => {
            this.activeValueFocus.focusAfterSearch();
            this.facet.toggleSelect(facetValue);
          }}
          ariaLabel={ariaLabel}
        >
          <atomic-icon
            aria-hidden="true"
            icon={LeftArrow}
            part="back-arrow"
            class="back-arrow"
          ></atomic-icon>
          <span class="truncate">{displayValue}</span>
        </Button>
      </li>
    );
  }

  private renderParents() {
    if (!this.hasParents) {
      return;
    }

    const nonActiveParents = this.facetState.parents.slice(0, -1);
    const activeParent = this.facetState.parents.slice(-1)[0];
    const activeParentDisplayValue = getFieldValueCaption(
      this.field,
      activeParent.value,
      this.bindings.i18n
    );

    return (
      <ul part="parents" class="mt-3">
        {this.renderAllCategories()}
        {nonActiveParents.map((parent) => this.renderParent(parent))}
        <FacetValueLink
          displayValue={activeParentDisplayValue}
          numberOfResults={activeParent.numberOfResults}
          isSelected={true}
          i18n={this.bindings.i18n}
          onClick={() => {
            this.activeValueFocus.focusAfterSearch();
            this.facet.deselectAll();
          }}
          searchQuery={this.facetState.facetSearch.query}
          part={`active-parent ${this.getIsLeafOrNodePart(activeParent)}`}
          class="parent-active"
          buttonRef={this.activeValueFocus.setTarget}
        >
          <FacetValueLabelHighlight
            displayValue={activeParentDisplayValue}
            isSelected={true}
          ></FacetValueLabelHighlight>
        </FacetValueLink>
      </ul>
    );
  }

  private renderValue(
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
          this.activeValueFocus.focusAfterSearch();
          this.facet.toggleSelect(facetValue);
        }}
        searchQuery={this.facetState.facetSearch.query}
        buttonRef={(element) => {
          isShowLessFocusTarget && this.showLessFocus.setTarget(element);
          isShowMoreFocusTarget && this.showMoreFocus.setTarget(element);
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

  private renderValues() {
    if (!this.facetState.values.length) {
      return;
    }

    return (
      <ul part="values" class={this.hasParents ? 'pl-9' : 'mt-3'}>
        {this.facetState.values.map((value, i) =>
          this.renderValue(
            value,
            i === 0,
            i === this.resultIndexToFocusOnShowMore
          )
        )}
      </ul>
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
              this.activeValueFocus.focusAfterSearch();
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
            this.showMoreFocus.focusAfterSearch();
            this.facet.showMoreValues();
          }}
          onShowLess={() => {
            this.showLessFocus.focusAfterSearch();
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
                {this.renderParents()}
                {this.renderValues()}
              </FacetValuesGroup>
              {this.renderShowMoreLess()}
            </Fragment>
          ),
        ]}
      </FacetContainer>
    );
  }
}
