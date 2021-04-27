import {Component, h, Prop, State} from '@stencil/core';
import {
  CategoryFacetState,
  CategoryFacet,
  buildCategoryFacet,
  CategoryFacetOptions,
  CategoryFacetValue,
  CategoryFacetSortCriterion,
  CategoryFacetSearchResult,
  SearchStatus,
  SearchStatusState,
  buildSearchStatus,
} from '@coveo/headless';
import {
  Bindings,
  BindStateToController,
  BindStateToI18n,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {
  BaseFacet,
  BaseFacetController,
  BaseFacetState,
} from '../base-facet/base-facet';

import RightArrow from 'coveo-styleguide/resources/icons/svg/arrow-right-rounded.svg';
import LeftArrow from 'coveo-styleguide/resources/icons/svg/arrow-left-rounded.svg';
import {
  FacetSearch,
  FacetSearchComponent,
  FacetSearchStrings,
} from '../facet-search/facet-search';
import {FacetPlaceholder} from '../atomic-facet-placeholder/atomic-facet-placeholder';

const SEPARATOR = '/';
const ELLIPSIS = '...';
const PATH_MAX_LENGTH = 3;

/**
 * The `atomic-category-facet` displays a facet of values in a hierarchical fashion. In mobile browsers, this is rendered as a button which opens a facet modal.
 *
 * @part facet - The wrapper for the entire facet
 * @part label - The label of the facet
 * @part modal-button - The button to open the facet modal (mobile only)
 * @part close-button - The button to close the facet when displayed modally (mobile only)
 * @part clear-button - The button that resets the actively selected facet values
 *
 * @part search-input - The search input
 * @part search-icon - The magnifier icon of the input
 * @part search-input-clear-button - The clear button of the input
 * @part search-results - The list of search results
 * @part search-result - A search result
 * @part active-search-result - The currently active search result
 *
 * @part parent - A parent element
 * @part active-parent - The currently active parent element
 * @part child - A child element
 * @part value-label - The facet value label
 * @part value-count - The facet value count
 * @part show-more - The show more results button
 * @part show-less - The show less button
 * @part search-no-results - The label displayed when a search returns no results
 * @part placeholder - The placeholder shown before the first search is executed.
 *
 */

@Component({
  tag: 'atomic-category-facet',
  styleUrl: 'atomic-category-facet.pcss',
  shadow: true,
})
export class AtomicCategoryFacet
  implements InitializableComponent, FacetSearchComponent, BaseFacetState {
  @InitializeBindings() public bindings!: Bindings;
  public facet!: CategoryFacet;
  public searchStatus!: SearchStatus;

  @BindStateToController('facet', {subscribeOnConnectedCallback: true})
  @State()
  public facetState!: CategoryFacetState;
  @BindStateToController('searchStatus')
  @State()
  private searchStatusState!: SearchStatusState;
  @State() public error!: Error;

  private facetSearch?: FacetSearch;

  @BindStateToI18n()
  @State()
  public strings: FacetSearchStrings = {
    clear: () => this.bindings.i18n.t('clear'),
    placeholder: () => this.bindings.i18n.t('search'),
    searchBox: () =>
      this.bindings.i18n.t('facetSearch', {label: this.strings[this.label]()}),
    querySuggestionList: () => this.bindings.i18n.t('querySuggestionList'),
    showMore: () => this.bindings.i18n.t('showMore'),
    showLess: () => this.bindings.i18n.t('showLess'),
    noValuesFound: () => this.bindings.i18n.t('noValuesFound'),
    facetValue: (variables) => this.bindings.i18n.t('facetValue', variables),
    allCategories: () => this.bindings.i18n.t('allCategories'),
    pathPrefix: () => this.bindings.i18n.t('in'),
    under: (variables) => this.bindings.i18n.t('under', variables),
  };

  @State() public isExpanded = false;
  @State() public facetSearchQuery = '';

  @Prop({mutable: true, reflect: true}) public facetId = '';
  /**
   * Specifies the index field whose values the facet should use
   */
  @Prop() public field = '';
  /**
   * The non-localized label for the facet
   */
  @Prop() public label = 'noLabel';
  /**
   * The character that separates values of a multi-value field
   */
  @Prop() public delimitingCharacter = ';';
  /**
   * The number of values to request for this facet. Also determines the number of additional values to request each time this facet is expanded, and the number of values to display when this facet is collapsed.
   */
  @Prop() public numberOfValues = 5;
  /**
   * Whether this facet should contain a search box.
   */
  @Prop() public enableFacetSearch = false;
  /**
   * The sort criterion to apply to the returned facet values. Possible values are 'alphanumeric', and 'occurrences''.
   */
  @Prop() public sortCriteria: CategoryFacetSortCriterion = 'occurrences';
  /**
   * The base path shared by all values for the facet, separated by commas.
   */
  @Prop() public basePath = '';
  /**
   * Whether to use basePath as a filter for the results.
   */
  @Prop() public filterByBasePath = true;

  private get formattedBasePath() {
    return this.basePath
      .split(',')
      .map((pathFragment) => pathFragment.trim())
      .filter((pathFragment) => pathFragment !== '');
  }

  public initialize() {
    this.searchStatus = buildSearchStatus(this.bindings.engine);
    const options: CategoryFacetOptions = {
      field: this.field,
      delimitingCharacter: this.delimitingCharacter,
      sortCriteria: this.sortCriteria,
      numberOfValues: this.numberOfValues,
      basePath: this.formattedBasePath,
      filterByBasePath: this.filterByBasePath,
    };
    this.facet = buildCategoryFacet(this.bindings.engine, {options});
    this.strings[this.label] = () => this.bindings.i18n.t(this.label);
    if (this.enableFacetSearch) {
      this.facetSearch = new FacetSearch(this);
    }
    this.facetId = this.facet.state.facetId;
    this.bindings.store.state.facets[this.facetId] = {
      label: this.label,
    };
  }

  private get parents() {
    const parents = this.facetState.parents;

    return parents.map((parent, i) => {
      const isActive = i === parents.length - 1;
      if (isActive) {
        return this.buildActiveParent(parent);
      }
      return this.buildParent(parent);
    });
  }

  private buildParent(parent: CategoryFacetValue) {
    return (
      <button
        part="parent"
        class="value-button"
        onClick={() => this.facet.toggleSelect(parent)}
      >
        <div innerHTML={LeftArrow} class="facet-arrow mr-1.5" />
        <span class="ellipsed">{parent.value}</span>
      </button>
    );
  }

  private buildActiveParent(parent: CategoryFacetValue) {
    return (
      <div part="active-parent" class="value-button font-bold ml-6">
        <span part="value-label" class="ellipsed">
          {parent.value}
        </span>
        <span part="value-count" class="value-count">
          {parent.numberOfResults.toLocaleString(this.bindings.i18n.language)}
        </span>
      </div>
    );
  }

  private get children() {
    return this.facetState.values.map((value) => this.buildChildValue(value));
  }

  private buildChildValue(item: CategoryFacetValue) {
    return (
      <li>
        <button
          part="child"
          class="value-button"
          onClick={() => this.facet.toggleSelect(item)}
          aria-label={this.strings.facetValue(item)}
        >
          <span part="value-label" class="ellipsed">
            {item.value}
          </span>
          <span part="value-count" class="value-count">
            {item.numberOfResults.toLocaleString(this.bindings.i18n.language)}
          </span>
          <div innerHTML={RightArrow} class="facet-arrow ml-1.5" />
        </button>
      </li>
    );
  }

  private get allCategoriesButton() {
    if (!this.facetState.hasActiveValues) {
      return;
    }

    return (
      <button
        part="clear-button"
        onClick={() => this.facet.deselectAll()}
        class="value-button"
      >
        <div innerHTML={LeftArrow} class="facet-arrow mr-1.5" />
        {this.strings.allCategories()}
      </button>
    );
  }

  private get showMoreButton() {
    if (!this.facetState.canShowMoreValues) {
      return;
    }

    return (
      <button
        class="value-button text-primary"
        part="show-more"
        onClick={() => this.facet.showMoreValues()}
      >
        {this.strings.showMore()}
      </button>
    );
  }

  private get showLessButton() {
    if (!this.facetState.canShowLessValues) {
      return;
    }

    return (
      <button
        class="value-button text-primary"
        part="show-less"
        onClick={() => this.facet.showLessValues()}
      >
        {this.strings.showLess()}
      </button>
    );
  }

  public ariaLabelForSearchResult(searchResult: CategoryFacetSearchResult) {
    const facetValue = this.strings.facetValue({
      numberOfResults: searchResult.count,
      value: searchResult.displayValue,
    });

    return this.strings.under({
      child: facetValue,
      parent: searchResult.path.length
        ? searchResult.path.join(', ')
        : this.strings.allCategories(),
    });
  }

  private ellipsedPath(path: string[]) {
    if (path.length <= PATH_MAX_LENGTH) {
      return path;
    }
    const firstPart = path.slice(0, 1);
    const lastParts = path.slice(-PATH_MAX_LENGTH + 1);
    return firstPart.concat(ELLIPSIS, ...lastParts);
  }

  private renderPath(path: string[]) {
    if (!path.length) {
      return (
        <span class="ellipsed">{`${this.strings.pathPrefix()} ${this.strings.allCategories()}`}</span>
      );
    }

    return [
      <span class="mr-1">{this.strings.pathPrefix()}</span>,
      this.ellipsedPath(path).map((part, index) => [
        index > 0 && <span>{SEPARATOR}</span>,
        <span class={part === ELLIPSIS ? '' : 'ellipsed flex-1 max-w-max'}>
          {part}
        </span>,
      ]),
    ];
  }

  public renderSearchResult(searchResult: CategoryFacetSearchResult) {
    return [
      <div class="flex" aria-hidden>
        <span
          part="value-label"
          class="ellipsed font-bold"
          innerHTML={FacetSearch.highlightSearchResult(
            searchResult.displayValue,
            this.facetSearchQuery
          )}
        />
        <span part="value-count" class="value-count">
          {searchResult.count.toLocaleString(this.bindings.i18n.language)}
        </span>
      </div>,
      <div
        class="flex text-on-background-variant"
        aria-hidden
        title={searchResult.path.join(SEPARATOR)}
      >
        {this.renderPath(searchResult.path)}
      </div>,
    ];
  }

  public componentDidRender() {
    this.facetSearch?.updateCombobox();
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

    if (
      this.facetState.values.length === 0 &&
      this.facetState.parents.length === 0
    ) {
      return;
    }

    return (
      <BaseFacet
        controller={new BaseFacetController(this)}
        label={this.strings[this.label]()}
        hasActiveValues={this.facetState.hasActiveValues}
      >
        {this.facetSearch?.render()}
        <div class="mt-1">
          {this.allCategoriesButton}
          <div>{this.parents}</div>
          <div class={this.parents.length ? 'pl-9' : 'pl-0'}>
            <ul>{this.children}</ul>
            <div class="flex flex-col items-start space-y-1">
              {this.showLessButton}
              {this.showMoreButton}
            </div>
          </div>
        </div>
      </BaseFacet>
    );
  }
}
