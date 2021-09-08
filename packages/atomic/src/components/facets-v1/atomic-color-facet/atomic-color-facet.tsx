import {Component, h, State, Prop, VNode, Host, Element} from '@stencil/core';
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
import {ColorFacetCheckbox} from '../color-facet-checkbox/color-facet-checkbox';
import {FacetValueBox} from '../facet-value-box/facet-value-box';
import {FacetShowMoreLess} from '../facet-show-more-less/facet-show-more-less';
import {FacetSearchMatches} from '../facet-search/facet-search-matches';
import {
  shouldUpdateFacetSearchComponent,
  shouldDisplaySearchResults,
} from '../facet-search/facet-search-utils';
import {BaseFacet} from '../facet-common';
import {FacetValueLabelHighlight} from '../facet-value-label-highlight/facet-value-label-highlight';
import {
  getFieldCaptions,
  getFieldValueCaption,
} from '../../../utils/field-utils';
import {registerFacetToStore} from '../../../utils/store';

/**
 * A facet is a list of values for a certain field occurring in the results, ordered using a configurable criteria (e.g., number of occurrences).
 * An `atomic-color-facet` displays a facet of the results for the current query as colors.
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
 * @part value-label - The facet value label, common for all displays.
 * @part value-count - The facet value count, common for all displays.
 *
 * @part value-box - The facet value when display is 'box'.
 * @part value-checkbox-label - The facet value checkbox clickable label, available when display is 'checkbox'.
 *
 * @part show-more - The show more results button.
 * @part show-less - The show less results button.
 * @part show-more-less-icon - The icons of the show more & show less buttons.
 *
 * @part ripple - The ripple effect of the component's interactive elements.
 */
@Component({
  tag: 'atomic-color-facet',
  styleUrl: 'atomic-color-facet.pcss',
  shadow: true,
})
export class AtomicColorFacet
  implements InitializableComponent, BaseFacet<Facet, FacetState>
{
  @InitializeBindings() public bindings!: Bindings;
  public facet!: Facet;
  public searchStatus!: SearchStatus;
  @Element() private host!: HTMLElement;

  @BindStateToController('facet')
  @State()
  public facetState!: FacetState;
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
  @Prop() public withSearch = true;
  /**
   * The sort criterion to apply to the returned facet values.
   * Possible values are 'score', 'alphanumeric', 'occurrences', and 'automatic'.
   */
  @Prop() public sortCriteria: FacetSortCriterion = 'automatic';
  /**
   * Whether to display the facet values as checkboxes (multiple selection) or boxes (multiple selection).
   * Possible values are 'checkbox', and 'box'.
   */
  @Prop() public displayValuesAs: 'checkbox' | 'box' = 'box';
  /**
   * Specifies if the facet is collapsed.
   */
  @Prop({reflect: true, mutable: true}) public isCollapsed = false;
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
    registerFacetToStore(this.bindings.store, 'facets', {
      label: this.label,
      facetId: this.facetId!,
      element: this.host,
    });
  }

  public componentShouldUpdate(
    next: unknown,
    prev: unknown,
    propName: keyof AtomicColorFacet
  ) {
    if (propName === 'facetState' && prev && this.withSearch) {
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

  private renderValue(facetValue: FacetValue, onClick: () => void) {
    const displayValue = getFieldValueCaption(
      this.facetId!,
      facetValue.value,
      this.bindings.i18n
    );
    const isSelected = facetValue.state === 'selected';
    const partValue = displayValue
      .match(new RegExp('-?[_a-zA-Z]+[_a-zA-Z0-9-]*'))
      ?.toString();
    switch (this.displayValuesAs) {
      case 'checkbox':
        return (
          <ColorFacetCheckbox
            displayValue={displayValue}
            numberOfResults={facetValue.numberOfResults}
            isSelected={isSelected}
            i18n={this.bindings.i18n}
            onClick={onClick}
            searchQuery={this.facetState.facetSearch.query}
          >
            <FacetValueLabelHighlight
              displayValue={displayValue}
              isSelected={isSelected}
              searchQuery={this.facetState.facetSearch.query}
            ></FacetValueLabelHighlight>
          </ColorFacetCheckbox>
        );
      case 'box':
        return (
          <FacetValueBox
            displayValue={displayValue}
            numberOfResults={facetValue.numberOfResults}
            isSelected={isSelected}
            i18n={this.bindings.i18n}
            onClick={onClick}
            searchQuery={this.facetState.facetSearch.query}
          >
            <div
              part={`value-${partValue}`}
              class="value-box-color w-full h-12 bg-neutral-dark rounded-md mb-2"
            ></div>
            <FacetValueLabelHighlight
              displayValue={displayValue}
              isSelected={isSelected}
              searchQuery={this.facetState.facetSearch.query}
            ></FacetValueLabelHighlight>
          </FacetValueBox>
        );
    }
  }

  private renderValuesContainer(children: VNode[]) {
    const classes = `mt-3 ${
      this.displayValuesAs === 'box' ? 'box-color-container' : ''
    }`;
    return (
      <ul part="values" class={classes}>
        {children}
      </ul>
    );
  }

  private renderValues() {
    return this.renderValuesContainer(
      this.facetState.values.map((value) =>
        this.renderValue(value, () => this.facet.toggleSelect(value))
      )
    );
  }

  private renderSearchResults() {
    return this.renderValuesContainer(
      this.facetState.facetSearch.values.map((value) =>
        this.renderValue(
          {
            state: 'idle',
            numberOfResults: value.count,
            value: value.rawValue,
          },
          () => this.facet.facetSearch.select(value)
        )
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
