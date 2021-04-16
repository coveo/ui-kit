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
 * A hierarchical category facet component. It is displayed as a facet in desktop browsers and as
 * a button which opens a facet modal in mobile browsers.
 * @part facet - The wrapping div for the entire facet
 * @part facet-values - The list of facet values (children)
 * @part facet-value - A single facet value
 * @part close-button - The button to close the facet when displayed modally (mobile only)
 * @part reset-button - The button that resets the actively selected facet values
 * @part show-more - The show more results button
 * @part show-less - The show less button
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
    facetValue: (variables) => this.bindings.i18n.t('facetValue', variables),
    allCategories: () => this.bindings.i18n.t('allCategories'),
    pathPrefix: () => this.bindings.i18n.t('in'),
    under: (variables) => this.bindings.i18n.t('under', variables),
  };

  @State() public isExpanded = false;
  @State() public facetSearchQuery = '';
  @State() public showFacetSearchResults = false;

  @Prop({mutable: true, reflect: true}) public facetId = '';
  /**
   * Specifies the index field whose values the facet should use
   */
  @Prop() public field = '';
  /**
   * The non-localized label for the facet
   */
  @Prop() public label = 'No label';
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
      const isLast = i === parents.length - 1;
      return this.buildParent(parent, isLast);
    });
  }

  private buildParent(parent: CategoryFacetValue, isLast: boolean) {
    const listClass = 'text-lg lg:text-base py-1 lg:py-0.5';
    if (isLast) {
      return (
        <li class={`${listClass} flex font-bold`}>
          <span class="ml-8 lg:ml-6 ellipsed">{parent.value}</span>
          <span class="ml-1.5 text-on-background-variant">
            (
            {parent.numberOfResults.toLocaleString(this.bindings.i18n.language)}
            )
          </span>
        </li>
      );
    }

    return (
      <li class={listClass}>
        <button
          class="w-full flex items-center"
          onClick={() => this.facet.toggleSelect(parent)}
        >
          <div
            innerHTML={LeftArrow}
            class="arrow-size text-secondary fill-current"
          />
          <span class="ml-2 ellipsed">{parent.value}</span>
        </button>
      </li>
    );
  }

  private get values() {
    return this.facetState.values.map((value) => this.buildValue(value));
  }

  private buildValue(item: CategoryFacetValue) {
    return (
      <li aria-label={this.strings.facetValue(item)}>
        <button
          class="w-full flex items-center text-left text-lg lg:text-base py-1 lg:py-0.5"
          onClick={() => this.facet.toggleSelect(item)}
        >
          <span class="ellipsed">{item.value}</span>
          <span class="ml-1.5 text-on-background-variant">
            ({item.numberOfResults.toLocaleString(this.bindings.i18n.language)})
          </span>
          <div
            innerHTML={RightArrow}
            class="ml-1.5 arrow-size text-secondary fill-current"
          />
        </button>
      </li>
    );
  }

  private get resetButton() {
    if (!this.facetState.hasActiveValues) {
      return;
    }

    return (
      <div class="text-lg lg:text-base flex items-center">
        <div
          innerHTML={LeftArrow}
          class="mr-2 arrow-size text-secondary fill-current"
        />
        <button onClick={() => this.facet.deselectAll()}>
          {this.strings.allCategories()}
        </button>
      </div>
    );
  }

  private get showMoreButton() {
    if (!this.facetState.canShowMoreValues) {
      return;
    }

    return (
      <button
        class="text-primary"
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
        class="text-primary"
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
          class="ellipsed"
          innerHTML={FacetSearch.highlightSearchResult(
            searchResult.displayValue,
            this.facetSearchQuery
          )}
        />
        <span class="number-of-values ml-1 text-on-background-variant">
          ({searchResult.count.toLocaleString(this.bindings.i18n.language)})
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
        deselectAll={() => this.facet.deselectAll()}
      >
        {this.facetSearch?.render()}
        <div class="mt-1">
          <div>{this.resetButton}</div>
          <ul part="parents" class="list-none p-0">
            {this.parents}
          </ul>
          <div class={this.parents.length > 0 ? 'pl-11 lg:pl-9' : 'pl-0'}>
            <ul class="list-none p-0">{this.values}</ul>
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
