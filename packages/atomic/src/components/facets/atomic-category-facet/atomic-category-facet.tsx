import {Component, h, Prop, State} from '@stencil/core';
import {
  CategoryFacetState,
  CategoryFacet,
  buildCategoryFacet,
  CategoryFacetOptions,
  CategoryFacetValue,
  CategoryFacetSortCriterion,
} from '@coveo/headless';
import {
  Bindings,
  BindStateToController,
  BindStateToI18n,
  I18nState,
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
  FacetSearchController,
  FacetSearchState,
} from '../facet-search/facet-search';

/**
 * The `atomic-category-facet` displays a facet of values in a hierarchical fashion. In mobile browsers, this is rendered as a button which opens a facet modal.
 *
 * @part facet - The wrapping div for the entire facet
 * @part facet-values - The list of facet values (children)
 * @part facet-value - A single facet value
 * @part close-button - The button to close the facet when displayed modally (mobile only)
 * @part reset-button - The button that resets the actively selected facet values
 * @part show-more - The show more results button
 * @part show-less - The show less button
 */
@Component({
  tag: 'atomic-category-facet',
  styleUrl: 'atomic-category-facet.pcss',
  shadow: true,
})
export class AtomicCategoryFacet
  implements InitializableComponent, FacetSearchState, BaseFacetState {
  @InitializeBindings() public bindings!: Bindings;
  public facet!: CategoryFacet;

  @BindStateToController('facet', {subscribeOnConnectedCallback: true})
  @State()
  public facetState!: CategoryFacetState;
  @State() public error!: Error;

  private facetSearch?: FacetSearch;

  @BindStateToI18n()
  @State()
  public strings: I18nState = {
    clear: () => this.bindings.i18n.t('clear'),
    placeholder: () => this.bindings.i18n.t('search'),
    searchBox: () =>
      this.bindings.i18n.t('facetSearch', {label: this.strings[this.label]()}),
    querySuggestionList: () => this.bindings.i18n.t('querySuggestionList'),
    showMore: () => this.bindings.i18n.t('showMore'),
    showLess: () => this.bindings.i18n.t('showLess'),
    facetValue: (variables) => this.bindings.i18n.t('facetValue', variables),
    allCategories: () => this.bindings.i18n.t('allCategories'),
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

  public initialize() {
    const options: CategoryFacetOptions = {
      field: this.field,
      delimitingCharacter: this.delimitingCharacter,
      sortCriteria: this.sortCriteria,
    };
    this.facet = buildCategoryFacet(this.bindings.engine, {options});
    this.strings[this.label] = () => this.bindings.i18n.t(this.label);
    if (this.enableFacetSearch) {
      this.facetSearch = new FacetSearch({
        controller: new FacetSearchController(this),
      });
    }
    this.facetId = this.facet.state.facetId;
    this.bindings.store.state.facets[this.facetId] = {
      label: this.label,
    };
  }

  public componentDidRender() {
    this.facetSearch?.updateCombobox();
  }

  private get parents() {
    const parents = this.facetState.parents;

    return parents.map((parent, i) => {
      const isLast = i === parents.length - 1;
      return this.buildParent(parent, isLast);
    });
  }

  private buildParent(parent: CategoryFacetValue, isLast: boolean) {
    return (
      <li>
        <button
          class="w-full flex items-center text-lg lg:text-base py-1 lg:py-0.5"
          onClick={() => !isLast && this.facet.toggleSelect(parent)}
        >
          {!isLast ? (
            <div
              innerHTML={LeftArrow}
              class="arrow-size text-secondary fill-current"
            />
          ) : null}
          {isLast ? (
            <b class="ml-8 lg:ml-6">
              {parent.value} ({parent.numberOfResults})
            </b>
          ) : (
            <span class="ml-2">{parent.value}</span>
          )}
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
          <span class="my-auto">{item.value}</span>
          <span class="ml-auto my-auto self-end text-on-background-variant">
            {item.numberOfResults}
          </span>
          <div
            innerHTML={RightArrow}
            class="ml-2 arrow-size text-secondary fill-current"
          />
        </button>
      </li>
    );
  }

  private get resetButton() {
    if (!this.facetState.hasActiveValues) {
      return null;
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
      return null;
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
      return null;
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

  public render() {
    if (
      this.facetState.values.length === 0 &&
      this.facetState.parents.length === 0
    ) {
      return null;
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
