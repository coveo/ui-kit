import {Component, h, State, Prop} from '@stencil/core';
import {
  Facet,
  buildFacet,
  FacetState,
  FacetOptions,
  FacetValue,
  FacetSortCriterion,
} from '@coveo/headless';
import {
  Bindings,
  BindStateToController,
  BindStateToI18n,
  I18nState,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {FacetValue as FacetValueComponent} from '../facet-value/facet-value';
import {
  BaseFacet,
  BaseFacetController,
  BaseFacetState,
} from '../base-facet/base-facet';
import {FacetSearch, FacetSearchComponent} from '../facet-search/facet-search';

/**
 * A facet is a list of values for a certain field occurring in the results, ordered using a configurable criteria (e.g., number of occurrences).
 * An `atomic-facet` displays a facet of the results for the current query. In mobile browsers, this is rendered as a button which opens a facet modal.
 *
 * @part facet - The wrapping div for the entire facet
 * @part facet-values - The list of facet values
 * @part facet-value - A single facet value
 * @part close-button - The button to close the facet when displayed modally (mobile only)
 * @part reset-button - The button that resets the actively selected facet values
 * @part show-more - The show more results button
 * @part show-less - The show less button
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
  private facetSearch?: FacetSearch;
  @BindStateToController('facet', {subscribeOnConnectedCallback: true})
  @State()
  public facetState!: FacetState;
  @State() public error!: Error;

  @BindStateToI18n()
  @State()
  public strings: I18nState = {
    clear: () => this.bindings.i18n.t('clear'),
    searchBox: () =>
      this.bindings.i18n.t('facetSearch', {label: this.strings[this.label]()}),
    placeholder: () => this.bindings.i18n.t('search'),
    querySuggestionList: () => this.bindings.i18n.t('querySuggestionList'),
    showMore: () => this.bindings.i18n.t('showMore'),
    showLess: () => this.bindings.i18n.t('showLess'),
    facetValue: (variables) => this.bindings.i18n.t('facetValue', variables),
  };

  @State() public isExpanded = false;
  @State() public facetSearchQuery = '';
  @State() public showFacetSearchResults = false;

  @Prop({mutable: true, reflect: true}) public facetId = '';
  /**
   * The field whose values you want to display in the facet.
   */
  @Prop() public field = '';
  /**
   * The non-localized label for the facet.
   */
  @Prop() public label = 'No label';
  /**
   * The character that separates values of a multi-value field.
   */
  @Prop() public delimitingCharacter = ';';
  /**
   * The number of values to request for this facet. Also determines the number of additional values to request each time this facet is expanded, and the number of values to display when this facet is collapsed.
   */
  @Prop() public numberOfValues = 10;
  /**
   * Whether this facet should contain a search box.
   */
  @Prop() public enableFacetSearch = true;
  /**
   * The sort criterion to apply to the returned facet values. Possible values are 'score', 'numeric', 'occurrences', and 'automatic'.
   */
  @Prop() public sortCriteria: FacetSortCriterion = 'automatic';

  public initialize() {
    const options: FacetOptions = {
      field: this.field,
      delimitingCharacter: this.delimitingCharacter,
      numberOfValues: this.numberOfValues,
      sortCriteria: this.sortCriteria,
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

  public componentDidRender() {
    this.facetState.canShowMoreValues && this.facetSearch?.updateCombobox();
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
        numberOfResults={item.numberOfResults}
        facetValueSelected={() => {
          this.facet.toggleSelect(item);
        }}
      />
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
    if (this.facetState.values.length === 0) {
      return null;
    }

    return (
      <BaseFacet
        controller={new BaseFacetController(this)}
        label={this.strings[this.label]()}
        hasActiveValues={this.facetState.hasActiveValues}
        deselectAll={() => this.facet.deselectAll()}
      >
        <div>
          {this.facetState.canShowMoreValues && this.facetSearch?.render()}
          <ul class="mt-1 list-none p-0">{this.values}</ul>
          <div class="flex flex-col items-start space-y-1">
            {this.showLessButton}
            {this.showMoreButton}
          </div>
        </div>
      </BaseFacet>
    );
  }
}
