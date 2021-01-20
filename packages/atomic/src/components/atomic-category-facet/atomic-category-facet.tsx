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
  Initialization,
  Bindings,
  AtomicComponentInterface,
} from '../../utils/initialization-utils';

@Component({
  tag: 'atomic-category-facet',
  styleUrl: 'atomic-category-facet.css',
  shadow: true,
})
export class AtomicCategoryFacet implements AtomicComponentInterface {
  @Prop({mutable: true}) facetId = '';
  @Prop() field = '';
  @Prop() label = 'No label';
  @State() controllerState!: CategoryFacetState;

  public bindings!: Bindings;
  public controller!: CategoryFacet;

  @Initialization({resubscribeControllerOnConnectedCallback: true})
  public initialize() {
    const options: CategoryFacetOptions = {
      facetId: this.facetId,
      field: this.field,
      delimitingCharacter: ';',
    };
    this.controller = buildCategoryFacet(this.bindings.engine, {options});
    this.facetId = this.controller.state.facetId;
  }

  private get parents() {
    const parents = this.controllerState.parents;

    return parents.map((parent, i) => {
      const isLast = i === parents.length - 1;
      return this.buildParent(parent, isLast);
    });
  }

  private buildParent(parent: CategoryFacetValue, isLast: boolean) {
    return (
      <div onClick={() => !isLast && this.controller.toggleSelect(parent)}>
        <b>{parent.value}</b>
      </div>
    );
  }

  private get values() {
    return this.controllerState.values.map((value) => this.buildValue(value));
  }

  private buildValue(item: CategoryFacetValue) {
    return (
      <div onClick={() => this.controller.toggleSelect(item)}>
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
    const facetSearch = this.controller.facetSearch;

    facetSearch.updateText(value);
    facetSearch.search();
  }

  private get facetSearchResults() {
    return this.controllerState.facetSearch.values.map((searchResult) => (
      <div onClick={() => this.controller.facetSearch.select(searchResult)}>
        {searchResult.displayValue} {searchResult.count}
      </div>
    ));
  }

  private get showMoreSearchResults() {
    if (!this.controllerState.facetSearch.moreValuesAvailable) {
      return null;
    }

    return (
      <button onClick={() => this.controller.facetSearch.showMoreResults()}>
        show more
      </button>
    );
  }

  private get resetButton() {
    if (!this.controllerState.hasActiveValues) {
      return null;
    }

    return (
      <button onClick={() => this.controller.deselectAll()}>
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
        selected={this.controller.isSortedBy(criterion)}
      >
        {criterion}
      </option>
    ));
  }

  private handleSelect = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    const criterion = target.value as CategoryFacetSortCriterion;
    this.controller.sortBy(criterion);
  };

  private get showMore() {
    if (!this.controllerState.canShowMoreValues) {
      return null;
    }
    return (
      <button onClick={() => this.controller.showMoreValues()}>
        Show More
      </button>
    );
  }

  private get showLess() {
    if (!this.controllerState.canShowLessValues) {
      return null;
    }
    return (
      <button onClick={() => this.controller.showLessValues()}>
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
