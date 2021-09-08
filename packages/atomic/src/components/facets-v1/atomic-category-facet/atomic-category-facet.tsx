import {Component, h, State, Prop, Host, Element} from '@stencil/core';
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
} from '@coveo/headless';
import {
  Bindings,
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {FacetPlaceholder} from '../../facets/atomic-facet-placeholder/atomic-facet-placeholder';
import {FacetContainer} from '../facet-container/facet-container';
import {FacetHeader} from '../facet-header/facet-header';
import {FacetSearchInput} from '../facet-search/facet-search-input';
import {FacetShowMoreLess} from '../facet-show-more-less/facet-show-more-less';
import {FacetSearchMatches} from '../facet-search/facet-search-matches';
import {
  shouldUpdateFacetSearchComponent,
  shouldDisplaySearchResults,
} from '../facet-search/facet-search-utils';
import {BaseFacet} from '../facet-common';
import {
  getFieldCaptions,
  getFieldValueCaption,
} from '../../../utils/field-utils';
import {FacetValueLink} from '../facet-value-link/facet-value-link';
import {FacetValueLabelHighlight} from '../facet-value-label-highlight/facet-value-label-highlight';
import LeftArrow from 'coveo-styleguide/resources/icons/svg/arrow-left-rounded.svg';
import {CategoryFacetSearchResult} from '../category-facet-search-result/category-facet-search-result';
import {registerFacetToStore} from '../../../utils/store';
import {Button} from '../../common/button';

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
 *
 * @part show-more - The show more results button.
 * @part show-less - The show less results button.
 * @part show-more-less-icon - The icons of the show more & show less buttons.
 *
 * @part ripple - The ripple effect of the component's interactive elements.
 */
@Component({
  tag: 'atomic-category-facet-v1', // TODO: remove v1 when old facets are removed
  styleUrl: 'atomic-category-facet.pcss',
  shadow: true,
})
export class AtomicCategoryFacet
  implements
    InitializableComponent,
    BaseFacet<CategoryFacet, CategoryFacetState>
{
  @InitializeBindings() public bindings!: Bindings;
  public facet!: CategoryFacet;
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
   */
  @Prop() public label = 'no-label';
  /**
   * The field whose values you want to display in the facet.
   */
  @Prop() public field!: string;
  /**
   * The number of values to request for this facet.
   * Also determines the number of additional values to request each time more values are shown.
   */
  @Prop() public numberOfValues = 8;
  /**
   * Whether this facet should contain a search box.
   * When "true", the search is only enabled when more facet values are available.
   */
  @Prop() public withSearch = false;
  /**
   * The sort criterion to apply to the returned facet values.
   * Possible values are 'score', 'alphanumeric', 'occurrences', and 'automatic'.
   * TODO: add automatic (occurences when not expanded, alphanumeric when expanded)
   */
  @Prop() public sortCriteria: CategoryFacetSortCriterion = 'occurrences';
  /**
   * The character that separates values of a multi-value field.
   */
  @Prop() public delimitingCharacter = ';';
  /**
   * The base path shared by all values for the facet, separated by commas.
   */
  @Prop() public basePath?: string;
  /**
   * Whether to use basePath as a filter for the results.
   */
  @Prop() public filterByBasePath = true;
  /**
   * Specifies if the facet is collapsed.
   */
  @Prop({reflect: true, mutable: true}) public isCollapsed = false;
  // @Prop() public customSort?: string; TODO: KIT-753 add customSort to headless

  public initialize() {
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
    };
    this.facet = buildCategoryFacet(this.bindings.engine, {options});
    this.facetId = this.facet.state.facetId;
    registerFacetToStore(this.bindings.store, 'categoryFacets', {
      label: this.label,
      facetId: this.facetId!,
      element: this.host,
    });
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

  private get numberOfSelectedValues() {
    return this.facetState.values.filter(({state}) => state === 'selected')
      .length;
  }

  private renderHeader() {
    return (
      <FacetHeader
        i18n={this.bindings.i18n}
        label={this.label}
        numberOfSelectedValues={this.numberOfSelectedValues}
        isCollapsed={this.isCollapsed}
        onToggleCollapse={() => (this.isCollapsed = !this.isCollapsed)}
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
          onClick={() => this.facet.deselectAll()}
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
          onClick={() => this.facet.toggleSelect(facetValue)}
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

    return (
      <ul part="parents" class="mt-3">
        {this.renderAllCategories()}
        {nonActiveParents.map((parent) => this.renderParent(parent))}
        <li part="active-parent" class="parent-active">
          {getFieldValueCaption(
            this.field,
            activeParent.value,
            this.bindings.i18n
          )}
        </li>
      </ul>
    );
  }

  private renderValue(facetValue: CategoryFacetValue) {
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
        onClick={() => this.facet.toggleSelect(facetValue)}
        searchQuery={this.facetState.facetSearch.query}
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
        {this.facetState.values.map((value) => this.renderValue(value))}
      </ul>
    );
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
            onClick={() => this.facet.facetSearch.select(value)}
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
            this.facet.showMoreValues();
          }}
          onShowLess={() => {
            this.facet.showLessValues();
          }}
          canShowLessValues={this.facetState.canShowLessValues}
          canShowMoreValues={this.facetState.canShowMoreValues}
        ></FacetShowMoreLess>
      </div>
    );
  }

  public render() {
    if (this.searchStatusState.hasError) {
      return;
    }

    if (!this.searchStatusState.firstSearchExecuted) {
      return (
        <FacetPlaceholder
          numberOfValues={this.numberOfValues}
        ></FacetPlaceholder>
      );
    }

    if (!this.facetState.values.length && !this.facetState.parents.length) {
      return <Host class="atomic-without-values"></Host>;
    }

    return (
      <Host class="atomic-with-values">
        <FacetContainer>
          {this.renderHeader()}
          {!this.isCollapsed && [
            this.renderSearchInput(),
            shouldDisplaySearchResults(this.facetState.facetSearch)
              ? [this.renderSearchResults(), this.renderMatches()]
              : [
                  this.renderParents(),
                  this.renderValues(),
                  this.renderShowMoreLess(),
                ],
          ]}
        </FacetContainer>
      </Host>
    );
  }
}
