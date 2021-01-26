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
  InitializableComponent,
  InitializeBindings,
} from '../../utils/initialization-utils';

@Component({
  tag: 'atomic-category-facet',
  styleUrl: 'atomic-category-facet.pcss',
  shadow: false,
})
export class AtomicCategoryFacet implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  private facet!: CategoryFacet;

  @BindStateToController('facet', {subscribeOnConnectedCallback: true})
  @State()
  private facetState!: CategoryFacetState;

  @Prop({mutable: true, reflect: true}) public facetId = '';
  @Prop() public field = '';
  @Prop() public label = 'No label';

  public initialize() {
    const options: CategoryFacetOptions = {
      facetId: this.facetId,
      field: this.field,
      delimitingCharacter: ';',
    };
    this.facet = buildCategoryFacet(this.bindings.engine, {options});
    this.facetId = this.facet.state.facetId;
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
      <div onClick={() => !isLast && this.facet.toggleSelect(parent)}>
        <b>{parent.value}</b>
      </div>
    );
  }

  private get values() {
    return this.facetState.values.map((value) => this.buildValue(value));
  }

  private buildValue(item: CategoryFacetValue) {
    return (
      <div onClick={() => this.facet.toggleSelect(item)}>
        <span>
          {item.value} {item.numberOfResults}
        </span>
      </div>
    );
  }

  private get facetSearchInput() {
    return <input onInput={(e) => this.onFacetSearch(e)} />;
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

  private get resetButton() {
    if (!this.facetState.hasActiveValues) {
      return null;
    }

    return (
      <button onClick={() => this.facet.deselectAll()}>All Categories</button>
    );
  }

  private get sortOptions() {
    const criteria: CategoryFacetSortCriterion[] = [
      'occurrences',
      'alphanumeric',
    ];

    return criteria.map((criterion) => (
      <option value={criterion} selected={this.facet.isSortedBy(criterion)}>
        {criterion}
      </option>
    ));
  }

  private handleSelect = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    const criterion = target.value as CategoryFacetSortCriterion;
    this.facet.sortBy(criterion);
  };

  private get showMore() {
    if (!this.facetState.canShowMoreValues) {
      return null;
    }
    return (
      <button onClick={() => this.facet.showMoreValues()}>Show More</button>
    );
  }

  private get showLess() {
    if (!this.facetState.canShowLessValues) {
      return null;
    }
    return (
      <button onClick={() => this.facet.showLessValues()}>Show Less</button>
    );
  }

  public render() {
    return (
      <div>
        <div>
          <span>{this.label}</span>
          <select onInput={this.handleSelect}>{this.sortOptions}</select>
        </div>
        <div>
          {this.facetSearchInput}
          {this.facetSearchResults}
          {this.showMoreSearchResults}
        </div>
        <div>
          <div>{this.resetButton}</div>
          <div>{this.parents}</div>
          <div>{this.values}</div>
          <div>{this.showMore}</div>
          <div>{this.showLess}</div>
        </div>
      </div>
    );
  }
}
