import {Component, h, State, Prop} from '@stencil/core';
import {
  Facet,
  buildFacet,
  FacetState,
  FacetValue,
  FacetOptions,
  FacetSortCriterion,
} from '@coveo/headless';
import {
  Bindings,
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../utils/initialization-utils';
import CloseIcon from 'coveo-styleguide/resources/icons/svg/close.svg';
import {randomID} from '../../utils/utils';

@Component({
  tag: 'atomic-facet',
  styleUrl: 'atomic-facet.pcss',
  shadow: true,
})
export class AtomicFacet implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  private facet!: Facet;

  @BindStateToController('facet', {subscribeOnConnectedCallback: true})
  @State()
  private facetState!: FacetState;
  @State() public error!: Error;
  @State() public isExpanded: Boolean = false;

  @Prop({mutable: true, reflect: true}) public facetId = '';
  @Prop() public field = '';
  @Prop() public label = 'No label';

  public initialize() {
    const options: FacetOptions = {facetId: this.facetId, field: this.field};
    this.facet = buildFacet(this.bindings.engine, {options});
    this.facetId = this.facet.state.facetId;
  }

  private get values() {
    return this.facetState.values.map((listItem) =>
      this.buildListItem(listItem)
    );
  }

  private buildListItem(item: FacetValue) {
    const isSelected = this.facet.isValueSelected(item);
    const id = randomID('');
    return (
      <li class="value" onClick={() => this.facet.toggleSelect(item)}>
        <input type="checkbox" checked={isSelected} id={`${id}-input`} />
        <label htmlFor={`${id}-input`} class="label">
          {item.value}
          <span class="number-of-results">({item.numberOfResults})</span>
        </label>
      </li>
    );
  }

  private get resetButton() {
    return this.facetState.hasActiveValues ? (
      <button onClick={() => this.facet.deselectAll()}>X</button>
    ) : null;
  }

  private get facetSearchInput() {
    return (
      <input
        onInput={(e) => this.onFacetSearch(e)}
        class="apply-border-on-background rounded"
      />
    );
  }

  private onFacetSearch(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    const facetSearch = this.facet.facetSearch;

    facetSearch.updateText(value);
    facetSearch.search();
  }

  private get facetSearchResults() {
    return this.facetState.facetSearch.values.map((searchResult) => (
      <div onClick={() => this.facet.facetSearch.select(searchResult)}>
        {searchResult.displayValue} {searchResult.count}
      </div>
    ));
  }

  private get showMoreSearchResults() {
    if (!this.facetState.facetSearch.moreValuesAvailable) {
      return null;
    }

    return (
      <button onClick={() => this.facet.facetSearch.showMoreResults()}>
        show more
      </button>
    );
  }

  private get sortSelector() {
    return (
      <select
        class="sort"
        name="facetSort"
        onChange={(val) => this.onFacetSortChange(val)}
      >
        {this.sortOptions}
      </select>
    );
  }

  private get sortOptions() {
    const criteria: FacetSortCriterion[] = [
      'automatic',
      'occurrences',
      'score',
      'alphanumeric',
    ];

    return criteria.map((criterion) => (
      <option value={criterion} selected={this.facet.isSortedBy(criterion)}>
        {criterion}
      </option>
    ));
  }

  private onFacetSortChange(e: Event) {
    const select = e.composedPath()[0] as HTMLSelectElement;
    const criterion = select.value as FacetSortCriterion;

    this.facet.sortBy(criterion);
  }

  private get closeButton() {
    return this.isExpanded ? (
      <button
        onClick={() => {
          this.isExpanded = false;
          document.body.classList.remove('overflow-hidden');
        }}
        class="close-button ml-2"
      >
        <div innerHTML={CloseIcon} />
      </button>
    ) : null;
  }

  private get showMoreButton() {
    if (!this.facetState.canShowMoreValues) {
      return null;
    }

    return (
      <button onClick={() => this.facet.showMoreValues()}>show more</button>
    );
  }

  private get showLessButton() {
    if (!this.facetState.canShowLessValues) {
      return null;
    }

    return (
      <button onClick={() => this.facet.showLessValues()}>show less</button>
    );
  }

  public render() {
    return (
      <div class="facet">
        <button
          class="open-button"
          onClick={() => {
            this.isExpanded = true;
            document.body.classList.add('overflow-hidden');
          }}
        >
          {this.label}
        </button>
        <div class={'content ' + (this.isExpanded ? 'active' : '')}>
          <div class="header">
            <span class="label">{this.label}</span>
            <span class="buttons">
              {this.resetButton}
              {this.closeButton}
            </span>
          </div>
          <div>
            {this.facetSearchInput}
            {this.facetSearchResults}
            {this.showMoreSearchResults}
          </div>
          <ul class="list-none">{this.values}</ul>
          <div>
            {this.showMoreButton}
            {this.showLessButton}
          </div>
        </div>
      </div>
    );
  }
}
