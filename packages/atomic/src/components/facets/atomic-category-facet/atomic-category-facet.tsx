import {Component, h, Prop, State, Host, Element} from '@stencil/core';
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
import {registerFacetToStore} from '../../../utils/store';

const SEPARATOR = '/';
const ELLIPSIS = '...';
const PATH_MAX_LENGTH = 3;

/**
 * The `atomic-category-facet` displays a facet of values in a hierarchical fashion. In mobile browsers, this is rendered as a button which opens a facet modal.
 *
 * @part facet - The wrapper for the entire facet.
 * @part label - The label of the facet.
 * @part modal-button - The button to open the facet modal (mobile only).
 * @part close-button - The button to close the facet when displayed modally (mobile only).
 * @part clear-button - The button that resets the actively selected facet values.
 *
 * @part search-input - The search input.
 * @part search-icon - The magnifier icon of the input.
 * @part search-input-clear-button - The clear button of the input.
 * @part search-results - The list of search results.
 * @part search-result - A search result.
 * @part search-result-path - The search result path.
 * @part active-search-result - The currently active search result.
 *
 * @part parent - A parent element.
 * @part active-parent - The currently active parent element.
 * @part child - A child element.
 * @part value-label - The facet value label.
 * @part value-count - The facet value count.
 * @part show-more - The show more results button.
 * @part show-less - The show less button.
 * @part search-no-results - The label displayed when a search returns no results.
 * @part placeholder - The placeholder shown before the first search is executed.
 *
 */

@Component({
  tag: 'atomic-category-facet',
  styleUrl: 'atomic-category-facet.pcss',
  shadow: true,
})
export class AtomicCategoryFacet
  implements InitializableComponent, FacetSearchComponent, BaseFacetState
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
  private searchStatusState!: SearchStatusState;
  @State() public error!: Error;

  private facetSearch?: FacetSearch;

  public strings: FacetSearchStrings = {
    clear: () => this.bindings.i18n.t('clear'),
    placeholder: () => this.bindings.i18n.t('search'),
    searchBox: () =>
      this.bindings.i18n.t('facet-search', {label: this.strings[this.label]()}),
    querySuggestionList: () => this.bindings.i18n.t('query-suggestion-list'),
    showMore: () => this.bindings.i18n.t('show-more'),
    showLess: () => this.bindings.i18n.t('show-less'),
    noValuesFound: () => this.bindings.i18n.t('no-values-found'),
    facetValue: (variables) => this.bindings.i18n.t('facet-value', variables),
    allCategories: () => this.bindings.i18n.t('all-categories'),
    pathPrefix: () => this.bindings.i18n.t('in'),
    under: (variables) => this.bindings.i18n.t('under', variables),
  };

  @State() public isExpanded = false;

  /**
   * Specifies a unique identifier for the facet.
   */
  @Prop({mutable: true, reflect: true}) public facetId = '';
  /**
   * Specifies the index field whose values the facet should use.
   */
  @Prop() public field = '';
  /**
   * The non-localized label for the facet.
   */
  @Prop() public label = 'no-label';
  /**
   * The character that separates values of a multi-value field.
   */
  @Prop() public delimitingCharacter = ';';
  /**
   * The number of values to request for this facet. Also determines the number of additional values to request each time this facet is expanded, and the number of values to display when this facet is collapsed.
   */
  @Prop() public numberOfValues = 8;
  /**
   * Whether this facet should contain a search box.
   */
  @Prop() public enableFacetSearch = false;
  /**
   * The sort criterion to apply to the returned facet values. Possible values are `alphanumeric`, and `occurrences`.
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
      facetSearch: {numberOfValues: this.numberOfValues * 2},
    };
    this.facet = buildCategoryFacet(this.bindings.engine, {options});
    this.strings[this.label] = () => this.bindings.i18n.t(this.label);
    if (this.enableFacetSearch) {
      this.facetSearch = new FacetSearch(this);
    }
    this.facetId = this.facet.state.facetId;
    registerFacetToStore(this.bindings.store, 'categoryFacets', {
      label: this.label,
      facetId: this.facetId!,
      element: this.host,
    });
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
        <atomic-icon icon={LeftArrow} class="facet-arrow mr-1.5"></atomic-icon>
        <span class="truncate">{parent.value}</span>
      </button>
    );
  }

  private buildActiveParent(parent: CategoryFacetValue) {
    return (
      <div part="active-parent" class="value-button font-bold ml-6">
        <span part="value-label" class="truncate">
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
          <span part="value-label" class="truncate">
            {item.value}
          </span>
          <span part="value-count" class="value-count">
            {item.numberOfResults.toLocaleString(this.bindings.i18n.language)}
          </span>
          <atomic-icon
            icon={RightArrow}
            class="facet-arrow ml-1.5"
          ></atomic-icon>
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
        <atomic-icon icon={LeftArrow} class="facet-arrow mr-1.5"></atomic-icon>
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
        class="show-more"
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
        class="show-less"
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
        <span class="truncate">{`${this.strings.pathPrefix()} ${this.strings.allCategories()}`}</span>
      );
    }

    return [
      <span class="mr-1">{this.strings.pathPrefix()}</span>,
      this.ellipsedPath(path).map((part, index) => [
        index > 0 && <span>{SEPARATOR}</span>,
        <span class={part === ELLIPSIS ? '' : 'truncate flex-1 max-w-max'}>
          {part}
        </span>,
      ]),
    ];
  }

  public renderSearchResult(searchResult: CategoryFacetSearchResult) {
    return [
      <div class="flex items-baseline" aria-hidden="true">
        <span
          part="value-label"
          class="truncate font-bold"
          innerHTML={FacetSearch.highlightSearchResult(
            searchResult.displayValue,
            this.facetState.facetSearch.query
          )}
        />
        <span part="value-count" class="value-count">
          {searchResult.count.toLocaleString(this.bindings.i18n.language)}
        </span>
      </div>,
      <div
        class="flex text-neutral-dark"
        aria-hidden="true"
        title={searchResult.path.join(SEPARATOR)}
        part="search-result-path"
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
      return <Host class="atomic-without-values"></Host>;
    }

    return (
      <Host class="atomic-with-values">
        <BaseFacet
          controller={new BaseFacetController(this)}
          label={this.strings[this.label]()}
          hasActiveValues={this.facetState.hasActiveValues}
        >
          {this.facetSearch?.render()}
          <div class="mt-1 text-lg lg:text-base">
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
      </Host>
    );
  }
}
