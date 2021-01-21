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
  Initialization,
  Bindings,
  AtomicComponentInterface,
} from '../../utils/initialization-utils';

@Component({
  tag: 'atomic-facet',
  styleUrl: 'atomic-facet.css',
  shadow: true,
})
export class AtomicFacet implements AtomicComponentInterface {
  @Prop({mutable: true}) facetId = '';
  @Prop() field = '';
  @Prop() label = 'No label';
  @State() controllerState!: FacetState;
  public bindings!: Bindings;

  public controller!: Facet;

  @Initialization({resubscribeControllerOnConnectedCallback: true})
  public initialize() {
    const options: FacetOptions = {facetId: this.facetId, field: this.field};
    this.controller = buildFacet(this.bindings.engine, {options});
    this.facetId = this.controller.state.facetId;
  }

  private get values() {
    return this.controllerState.values.map((listItem) =>
      this.buildListItem(listItem)
    );
  }

  private buildListItem(item: FacetValue) {
    const isSelected = this.controller.isValueSelected(item);

    return (
      <div onClick={() => this.controller.toggleSelect(item)}>
        <input type="checkbox" checked={isSelected}></input>
        <span>
          {item.value} {item.numberOfResults}
        </span>
      </div>
    );
  }

  private get resetButton() {
    return this.controllerState.hasActiveValues ? (
      <button onClick={() => this.controller.deselectAll()}>X</button>
    ) : null;
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

  private get sortSelector() {
    return (
      <select name="facetSort" onChange={(val) => this.onFacetSortChange(val)}>
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
      <option
        value={criterion}
        selected={this.controller.isSortedBy(criterion)}
      >
        {criterion}
      </option>
    ));
  }

  private onFacetSortChange(e: Event) {
    const select = e.composedPath()[0] as HTMLSelectElement;
    const criterion = select.value as FacetSortCriterion;

    this.controller.sortBy(criterion);
  }

  private get showMoreButton() {
    if (!this.controllerState.canShowMoreValues) {
      return null;
    }

    return (
      <button onClick={() => this.controller.showMoreValues()}>
        show more
      </button>
    );
  }

  private get showLessButton() {
    if (!this.controllerState.canShowLessValues) {
      return null;
    }

    return (
      <button onClick={() => this.controller.showLessValues()}>
        show less
      </button>
    );
  }

  // TODO: improve loading style
  public renderLoading() {
    return (
      <div class="loading">
        {Array.from(Array(10)).map(() => (
          <p></p>
        ))}
      </div>
    );
  }

  render() {
    if (this.controllerState.isLoading) {
      return this.renderLoading();
    }

    return (
      <div>
        <div>
          <span>{this.label}</span>
          {this.sortSelector}
          {this.resetButton}
        </div>
        <div>
          {this.facetSearchInput}
          {this.facetSearchResults}
          {this.showMoreSearchResults}
        </div>
        <div>{this.values}</div>
        <div>
          {this.showMoreButton}
          {this.showLessButton}
        </div>
      </div>
    );
  }
}
