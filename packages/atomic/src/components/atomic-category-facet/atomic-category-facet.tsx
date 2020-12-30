import {Component, h, Prop, State} from '@stencil/core';
import {
  CategoryFacetState,
  CategoryFacet,
  buildCategoryFacet,
  CategoryFacetOptions,
  CategoryFacetValue,
  Unsubscribe,
  Engine,
  CategoryFacetSortCriterion,
} from '@coveo/headless';
import {Initialization} from '../../utils/initialization-utils';

@Component({
  tag: 'atomic-category-facet',
  styleUrl: 'atomic-category-facet.css',
  shadow: true,
})
export class AtomicCategoryFacet {
  @Prop({mutable: true}) engine?: Engine;
  @Prop({mutable: true}) facetId = '';
  @Prop() field = '';
  @Prop() label = 'No label';
  @State() state!: CategoryFacetState;

  private categoryFacet!: CategoryFacet;
  private unsubscribe: Unsubscribe = () => {};

  @Initialization()
  public initialize() {
    const options: CategoryFacetOptions = {
      facetId: this.facetId,
      field: this.field,
      delimitingCharacter: ';',
    };
    this.categoryFacet = buildCategoryFacet(this.engine!, {options});
    this.facetId = this.categoryFacet.state.facetId;
    this.subscribe();
  }

  private subscribe() {
    this.unsubscribe = this.categoryFacet.subscribe(() => this.updateState());
  }

  public connectedCallback() {
    this.categoryFacet && this.subscribe();
  }

  public disconnectedCallback() {
    this.unsubscribe();
  }

  private updateState() {
    this.state = this.categoryFacet.state;
  }

  private get parents() {
    const parents = this.state.parents;

    return parents.map((parent, i) => {
      const isLast = i === parents.length - 1;
      return this.buildParent(parent, isLast);
    });
  }

  private buildParent(parent: CategoryFacetValue, isLast: boolean) {
    return (
      <div onClick={() => !isLast && this.categoryFacet.toggleSelect(parent)}>
        <b>{parent.value}</b>
      </div>
    );
  }

  private get values() {
    return this.state.values.map((value) => this.buildValue(value));
  }

  private buildValue(item: CategoryFacetValue) {
    return (
      <div onClick={() => this.categoryFacet.toggleSelect(item)}>
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
    const facetSearch = this.categoryFacet.facetSearch;

    facetSearch.updateText(value);
    facetSearch.search();
  }

  private get facetSearchResults() {
    return this.state.facetSearch.values.map((searchResult) => (
      <div onClick={() => this.categoryFacet.facetSearch.select(searchResult)}>
        {searchResult.displayValue} {searchResult.count}
      </div>
    ));
  }

  private get showMoreSearchResults() {
    if (!this.state.facetSearch.moreValuesAvailable) {
      return null;
    }

    return (
      <button onClick={() => this.categoryFacet.facetSearch.showMoreResults()}>
        show more
      </button>
    );
  }

  private get resetButton() {
    if (!this.state.hasActiveValues) {
      return null;
    }

    return (
      <button onClick={() => this.categoryFacet.deselectAll()}>
        All Categories
      </button>
    );
  }

  private get sortOptions() {
    const criteria: CategoryFacetSortCriterion[] = [
      'occurrences',
      'alphanumeric',
    ];

    return criteria.map((criterion) => (
      <option
        value={criterion}
        selected={this.categoryFacet.isSortedBy(criterion)}
      >
        {criterion}
      </option>
    ));
  }

  private handleSelect = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    const criterion = target.value as CategoryFacetSortCriterion;
    this.categoryFacet.sortBy(criterion);
  };

  private get showMore() {
    if (!this.state.canShowMoreValues) {
      return null;
    }
    return (
      <button onClick={() => this.categoryFacet.showMoreValues()}>
        Show More
      </button>
    );
  }

  private get showLess() {
    if (!this.state.canShowLessValues) {
      return null;
    }
    return (
      <button onClick={() => this.categoryFacet.showLessValues()}>
        Show Less
      </button>
    );
  }

  render() {
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
