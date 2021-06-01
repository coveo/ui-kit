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
  BindStateToI18n,
  I18nState,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {FacetPlaceholder} from '../../facets/atomic-facet-placeholder/atomic-facet-placeholder';
import {FacetWrapper} from '../facet-wrapper/facet-wrapper';
import {FacetHeader} from '../facet-header/facet-header';
import {FacetSearchInput} from '../facet-search-input/facet-search-input';
import {FacetValueCheckbox} from '../facet-value-checkbox/facet-value-checkbox';
import {FacetValueLink} from '../facet-value-link/facet-value-link';
import {FacetValueBox} from '../facet-value-box/facet-value-box';
import {FacetShowLess} from '../facet-show-less/facet-show-less';
import {FacetShowMore} from '../facet-show-more/facet-show-more';

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
 */
@Component({
  tag: 'atomic-facet-v1', // TODO: remove v1 when old facets are removed
  styleUrl: 'atomic-facet.pcss',
  shadow: true,
})
export class AtomicFacet implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  public facet!: Facet;
  public searchStatus!: SearchStatus;

  @BindStateToController('facet', {subscribeOnConnectedCallback: true})
  @State()
  public facetState!: FacetState;
  @BindStateToController('searchStatus')
  @State()
  private searchStatusState!: SearchStatusState;
  @State() public error!: Error;
  @State() isCollapsed = false;

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
   */
  @Prop() public withSearch = true;
  /**
   * The sort criterion to apply to the returned facet values.
   * Possible values are 'score', 'numeric', 'occurrences', and 'automatic'.
   */
  @Prop() public sortCriteria: FacetSortCriterion = 'automatic';
  /**
   * Whether to display the facet values as checkboxes (multiple selection), links (single selection) or boxes (multiple selection).
   * Possible values are 'checkbox', 'link', and 'box'.
   */
  @Prop() public displayValuesAs: 'checkbox' | 'link' | 'box' = 'checkbox';
  // @Prop() public customSort?: string; TODO: add customSort to headless

  @BindStateToI18n()
  @State()
  public strings: I18nState = {
    label: () => this.bindings.i18n.t(this.label),
    showMore: () => this.bindings.i18n.t('showMore'),
    showLess: () => this.bindings.i18n.t('showLess'),
    clearFilters: () =>
      this.bindings.i18n.t('clearFilters', {
        count: this.numberOfSelectedValues,
      }),
    clearFiltersAria: () =>
      this.bindings.i18n.t('clearFiltersForFacet', {
        count: this.numberOfSelectedValues,
        label: this.strings.label(),
      }),
    collapseAria: () =>
      this.bindings.i18n.t(this.isCollapsed ? 'expandFacet' : 'collapseFacet', {
        label: this.strings.label(),
      }),
  };

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

  private get numberOfSelectedValues() {
    return this.facetState.values.filter(({state}) => state === 'selected')
      .length;
  }

  private renderHeader() {
    return (
      <FacetHeader
        label={this.strings.label()}
        clearFilters={this.strings.clearFilters()}
        clearFiltersAria={this.strings.clearFiltersAria()}
        collapseAria={this.strings.collapseAria()}
        onClearFilters={() => this.facet.deselectAll()}
        hasActiveValues={this.facetState.hasActiveValues}
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
        query={this.facetState.facetSearch.query}
      ></FacetSearchInput>
    );
  }

  private renderValue(facetValue: FacetValue) {
    switch (this.displayValuesAs) {
      case 'checkbox':
        return (
          <FacetValueCheckbox value={facetValue.value}></FacetValueCheckbox>
        );
      case 'link':
        return <FacetValueLink value={facetValue.value}></FacetValueLink>;
      case 'box':
        return <FacetValueBox value={facetValue.value}></FacetValueBox>;
    }
  }

  private renderValues() {
    return this.facetState.values.map((value) => this.renderValue(value));
  }

  private renderShowMoreLess() {
    return [
      this.facetState.canShowLessValues && (
        <FacetShowLess label={this.strings.showLess()}></FacetShowLess>
      ),
      this.facetState.canShowMoreValues && (
        <FacetShowMore label={this.strings.showMore()}></FacetShowMore>
      ),
    ];
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
      <FacetWrapper>
        {this.renderHeader()}
        {!this.isCollapsed && [
          this.renderSearchInput(),
          this.renderValues(),
          this.renderShowMoreLess(),
        ]}
      </FacetWrapper>
    );
  }
}
