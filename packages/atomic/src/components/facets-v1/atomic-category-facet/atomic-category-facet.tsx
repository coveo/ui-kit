import {Component, h, State, Prop, VNode, Host} from '@stencil/core';
import {
  CategoryFacet,
  buildCategoryFacet,
  CategoryFacetState,
  CategoryFacetOptions,
  CategoryFacetSortCriterion,
  SearchStatus,
  SearchStatusState,
  buildSearchStatus,
  CategoryFacetSearchResult,
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

/**
 * A facet is a list of values for a certain field occurring in the results, ordered using a configurable criteria (e.g., number of occurrences).
 * An `atomic-category-facet` displays a facet of values in a browsable, hierarchical fashion.
 *
 * @part facet - The wrapper for the entire facet.
 * @part placeholder - The placeholder shown before the first search is executed.
 *
 * @part label-button - The button that displays the label and allows to expand/collapse the facet.
 * @part label-button-icon - The label button icon.
 * @part clear-button - The button that resets the actively selected facet values.
 * @part clear-button-icon - The clear button icon.
 *
 * @part search-input - The search box input.
 * @part search-icon - The search box submit button.
 * @part search-clear-button - The button to clear the search box of input.
 * @part more-matches - The label indicating there are more matches for the current facet search query.
 * @part no-matches - The label indicating there are no matches for the current facet search query.
 * @part matches-query - The highlighted query inside the matches labels.
 * @part search-highlight - The highlighted query inside the facet values.
 *
 * @part values - The facet values container.
 * @part value-label - The facet value label.
 * @part value-count - The facet value count.
 * @part value-path - The facet value path.
 * TODO: add more value parts
 *
 * @part show-more - The show more results button.
 * @part show-less - The show less results button.
 * @part show-more-less-icon - The icons of the show more & show less buttons.
 */
@Component({
  tag: 'atomic-category-facet-v1', // TODO: remove v1 when old facets are removed
  styleUrl: 'atomic-category-facet.pcss',
  shadow: true,
})
export class AtomicCategoryFacet
  implements
    InitializableComponent,
    BaseFacet<CategoryFacet, CategoryFacetState> {
  @InitializeBindings() public bindings!: Bindings;
  public facet!: CategoryFacet;
  public searchStatus!: SearchStatus;

  @BindStateToController('facet')
  @State()
  public facetState!: CategoryFacetState;
  @BindStateToController('searchStatus')
  @State()
  public searchStatusState!: SearchStatusState;
  @State() public error!: Error;
  @State() public isCollapsed = false;

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
    this.bindings.store.state.facets[this.facetId] = {
      label: this.label,
    };
  }

  public componentShouldUpdate(
    next: unknown,
    prev: unknown,
    propName: keyof AtomicCategoryFacet
  ) {
    if (propName === 'facetState') {
      return shouldUpdateFacetSearchComponent(
        (next as CategoryFacetState).facetSearch,
        (prev as CategoryFacetState).facetSearch
      );
    }

    return true;
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
        onClearFilters={() => this.facet.deselectAll()}
        numberOfSelectedValues={this.numberOfSelectedValues}
        isCollapsed={this.isCollapsed}
        onToggleCollapse={() => (this.isCollapsed = !this.isCollapsed)}
      ></FacetHeader>
    );
  }

  private renderSearchInput() {
    const shouldDisplaySearch =
      this.withSearch && this.facetState.canShowMoreValues;
    if (!shouldDisplaySearch) {
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

  private renderValue(facetValue: CategoryFacetValue) {
    const displayValue = getFieldValueCaption(
      this.facetId!,
      facetValue.value,
      this.bindings.i18n
    );
    return (
      <li>
        <div>{displayValue}</div>
      </li>
    );
  }

  private renderSearchResult(facetValue: CategoryFacetSearchResult) {
    return (
      <li>
        <div>{facetValue.displayValue}</div>
        <div>{facetValue.path.join('/')}</div>
      </li>
    );
  }

  private renderValuesContainer(children: VNode[]) {
    return (
      <ul part="values" class="mt-3">
        {children}
      </ul>
    );
  }

  private renderValues() {
    return this.renderValuesContainer(
      this.facetState.values.map((value) => this.renderValue(value))
    );
  }

  private renderSearchResults() {
    return this.renderValuesContainer(
      this.facetState.facetSearch.values.map((value) =>
        this.renderSearchResult(value)
      )
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

    if (!this.facetState.values.length) {
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
              : [this.renderValues(), this.renderShowMoreLess()],
          ]}
        </FacetContainer>
      </Host>
    );
  }
}
