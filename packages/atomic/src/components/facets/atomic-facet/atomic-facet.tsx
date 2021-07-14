import {Component, h, State, Prop, Host} from '@stencil/core';
import {
  Facet,
  buildFacet,
  FacetState,
  FacetOptions,
  FacetValue,
  FacetSortCriterion,
  SpecificFacetSearchResult,
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
import {FacetValue as FacetValueComponent} from '../facet-value/facet-value';
import {
  BaseFacet,
  BaseFacetController,
  BaseFacetState,
} from '../base-facet/base-facet';
import {
  FacetSearch,
  FacetSearchComponent,
  FacetSearchStrings,
} from '../facet-search/facet-search';
import {FacetPlaceholder} from '../atomic-facet-placeholder/atomic-facet-placeholder';

/**
 * A facet is a list of values for a certain field occurring in the results, ordered using a configurable criteria (e.g., number of occurrences).
 * An `atomic-facet` displays a facet of the results for the current query. In mobile browsers, this is rendered as a button that opens a facet modal.
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
 * @part search-no-results - The label displayed when a search returns no results.
 * @part active-search-result - The currently active search result.

 * @part placeholder - The placeholder shown before the first search is executed.
 * @part value - A single facet value.
 * @part value-label - The facet value label.
 * @part value-count - The facet value count.
 * @part show-more - The show more results button.
 * @part show-less - The show less button.
 *
 */
@Component({
  tag: 'atomic-facet',
  styleUrl: 'atomic-facet.pcss',
  shadow: true,
})
export class AtomicFacet
  implements InitializableComponent, FacetSearchComponent, BaseFacetState {
  @InitializeBindings() public bindings!: Bindings;
  public facet!: Facet;
  public searchStatus!: SearchStatus;
  private facetSearch?: FacetSearch;

  @BindStateToController('facet')
  @State()
  public facetState!: FacetState;
  @BindStateToController('searchStatus')
  @State()
  private searchStatusState!: SearchStatusState;
  @State() public error!: Error;

  public strings: FacetSearchStrings = {
    clear: () => this.bindings.i18n.t('clear'),
    searchBox: () =>
      this.bindings.i18n.t('facet-search', {label: this.strings[this.label]()}),
    placeholder: () => this.bindings.i18n.t('search'),
    querySuggestionList: () => this.bindings.i18n.t('query-suggestion-list'),
    showMore: () => this.bindings.i18n.t('show-more'),
    showLess: () => this.bindings.i18n.t('show-less'),
    noValuesFound: () => this.bindings.i18n.t('no-values-found'),
    facetValue: (variables) => this.bindings.i18n.t('facet-value', variables),
  };

  @State() public isExpanded = false;

  /**
   * Specifies a unique identifier for the facet.
   */
  @Prop({mutable: true, reflect: true}) public facetId = '';
  /**
   * The field whose values you want to display in the facet.
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
  @Prop() public enableFacetSearch = true;
  /**
   * The sort criterion to apply to the returned facet values. Possible values are 'score', 'numeric', 'occurrences', and 'automatic'.
   */
  @Prop() public sortCriteria: FacetSortCriterion = 'automatic';

  public initialize() {
    this.searchStatus = buildSearchStatus(this.bindings.engine);
    const options: FacetOptions = {
      field: this.field,
      delimitingCharacter: this.delimitingCharacter,
      numberOfValues: this.numberOfValues,
      sortCriteria: this.sortCriteria,
      facetSearch: {numberOfValues: this.numberOfValues * 2},
    };
    this.facet = buildFacet(this.bindings.engine, {options});
    this.strings[this.label] = () => this.bindings.i18n.t(this.label);
    if (this.enableFacetSearch) {
      this.facetSearch = new FacetSearch(this);
    }
    this.facetId = this.facet.state.facetId;
    this.bindings.store.state.facets[this.facetId] = {
      label: this.label,
    };
  }

  private get values() {
    return this.facetState.values.map((listItem) =>
      this.buildListItem(listItem)
    );
  }

  private buildListItem(item: FacetValue) {
    const isSelected = this.facet.isValueSelected(item);
    return (
      <FacetValueComponent
        label={`${item.value}`}
        ariaLabel={this.strings.facetValue(item)}
        isSelected={isSelected}
        numberOfResults={item.numberOfResults.toLocaleString(
          this.bindings.i18n.language
        )}
        facetValueSelected={() => {
          this.facet.toggleSelect(item);
        }}
      />
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

  public renderSearchResult(searchResult: SpecificFacetSearchResult) {
    return (
      <div class="flex items-baseline" aria-hidden="true">
        <span
          part="value-label"
          class="ellipsed font-bold"
          innerHTML={FacetSearch.highlightSearchResult(
            searchResult.displayValue,
            this.facetState.facetSearch.query
          )}
        />
        <span part="value-count" class="value-count">
          {searchResult.count.toLocaleString(this.bindings.i18n.language)}
        </span>
      </div>
    );
  }

  public ariaLabelForSearchResult(searchResult: SpecificFacetSearchResult) {
    return this.strings.facetValue({
      numberOfResults: searchResult.count,
      value: searchResult.displayValue,
    });
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

    if (this.facetState.values.length === 0) {
      return <Host class="atomic-without-values"></Host>;
    }

    return (
      <Host class="atomic-with-values">
        <BaseFacet
          controller={new BaseFacetController(this)}
          label={this.strings[this.label]()}
          hasActiveValues={this.facetState.hasActiveValues}
          clearAll={() => this.facet.deselectAll()}
        >
          {this.facetState.canShowMoreValues && this.facetSearch?.render()}
          <div class="mt-1">
            <ul>{this.values}</ul>
            <div class="flex flex-col items-start space-y-1">
              {this.showLessButton}
              {this.showMoreButton}
            </div>
          </div>
        </BaseFacet>
      </Host>
    );
  }
}
