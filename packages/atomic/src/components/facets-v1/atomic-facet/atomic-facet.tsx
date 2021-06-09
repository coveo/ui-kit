import {Component, h, State, Prop} from '@stencil/core';
import {
  Facet,
  buildFacet,
  FacetState,
  FacetOptions,
  FacetSortCriterion,
  SearchStatus,
  SearchStatusState,
  buildSearchStatus,
  FacetValue,
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
import {FacetValueCheckbox} from '../facet-value-checkbox/facet-value-checkbox';
import {FacetValueLink} from '../facet-value-link/facet-value-link';
import {FacetValueBox} from '../facet-value-box/facet-value-box';
import {FacetShowMoreLess} from '../facet-show-more-less/facet-show-more-less';
import {FacetSearchMatches} from '../facet-search/facet-search-matches';
import {
  shouldUpdateFacetSearchComponent,
  shouldDisplaySearchResults,
} from '../facet-search/facet-search-utils';
import {AtomicBaseFacet} from '../facet-common';

/**
 * A facet is a list of values for a certain field occurring in the results, ordered using a configurable criteria (e.g., number of occurrences).
 * An `atomic-facet` displays a facet of the results for the current query. In mobile browsers, this is rendered as a button that opens a facet modal.
 *
 * @part facet - The wrapper for the entire facet.
 *
 * @part label-button - The button that displays the label and allows to expand/collapse the facet.
 * @part label-button-icon - The label button icon.
 * @part clear-button - The button that resets the actively selected facet values.
 * @part clear-button-icon - The clear button icon.
 *
 * @part search-input - The search box input.
 * @part search-icon - The search box submit button.
 * @part search-clear-button - The button to clear the search box of input.
 *
 * @part values - The facet values.
 * @part value - A single facet value.
 * @part value-label - The facet value label.
 * @part value-count - The facet value count.
 *
 * @part show-more - The show more results button.
 * @part show-less - The show less results button.
 * @part show-more-less-icon - The icons of the show more & show less buttons.
 */
@Component({
  tag: 'atomic-facet-v1', // TODO: remove v1 when old facets are removed
  styleUrl: 'atomic-facet.pcss',
  shadow: true,
})
export class AtomicFacet
  implements InitializableComponent, AtomicBaseFacet<Facet, FacetState> {
  @InitializeBindings() public bindings!: Bindings;
  public facet!: Facet;
  public searchStatus!: SearchStatus;

  @BindStateToController('facet', {subscribeOnConnectedCallback: true})
  @State()
  public facetState!: FacetState;
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
  @Prop() public label = 'noLabel';
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
  @Prop() public withSearch = true;
  /**
   * The sort criterion to apply to the returned facet values.
   * Possible values are 'score', 'alphanumeric', 'occurrences', and 'automatic'.
   */
  @Prop() public sortCriteria: FacetSortCriterion = 'automatic';
  /**
   * Whether to display the facet values as checkboxes (multiple selection), links (single selection) or boxes (multiple selection).
   * Possible values are 'checkbox', 'link', and 'box'.
   */
  @Prop() public displayValuesAs: 'checkbox' | 'link' | 'box' = 'checkbox';
  // @Prop() public customSort?: string; TODO: add customSort to headless

  public initialize() {
    this.searchStatus = buildSearchStatus(this.bindings.engine);
    const options: FacetOptions = {
      facetId: this.facetId,
      field: this.field,
      numberOfValues: this.numberOfValues,
      sortCriteria: this.sortCriteria,
      facetSearch: {numberOfValues: this.numberOfValues},
    };
    this.facet = buildFacet(this.bindings.engine, {options});
    this.facetId = this.facet.state.facetId;
    this.bindings.store.state.facets[this.facetId] = {
      label: this.label,
    };
  }

  public componentShouldUpdate(
    next: unknown,
    prev: unknown,
    propName: keyof AtomicFacet
  ) {
    if (propName === 'facetState') {
      return shouldUpdateFacetSearchComponent(
        (next as FacetState).facetSearch,
        (prev as FacetState).facetSearch
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
          this.facet.facetSearch.updateText(value);
          this.facet.facetSearch.search();
        }}
        onClear={() => this.facet.facetSearch.clear()}
      ></FacetSearchInput>
    );
  }

  private renderValue(facetValue: FacetValue, onClick: () => void) {
    switch (this.displayValuesAs) {
      case 'checkbox':
        return (
          <FacetValueCheckbox
            value={facetValue.value}
            numberOfResults={facetValue.numberOfResults}
            state={facetValue.state}
            i18n={this.bindings.i18n}
            onClick={onClick}
          ></FacetValueCheckbox>
        );
      case 'link':
        return <FacetValueLink value={facetValue.value}></FacetValueLink>;
      case 'box':
        return <FacetValueBox value={facetValue.value}></FacetValueBox>;
    }
  }

  private renderValues() {
    return (
      <ul part="values">
        {this.facetState.values.map((value) =>
          this.renderValue(value, () => this.facet.toggleSelect(value))
        )}
      </ul>
    );
  }

  private renderSearchResults() {
    return this.facetState.facetSearch.values.map((value) =>
      this.renderValue(
        {
          state: 'idle',
          numberOfResults: value.count,
          value: value.rawValue,
        },
        () => this.facet.facetSearch.select(value)
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
      return;
    }

    return (
      <FacetContainer>
        {this.renderHeader()}
        {!this.isCollapsed && [
          this.renderSearchInput(),
          shouldDisplaySearchResults(this.facetState.facetSearch)
            ? [this.renderSearchResults(), this.renderMatches()]
            : [this.renderValues(), this.renderShowMoreLess()],
        ]}
      </FacetContainer>
    );
  }
}
