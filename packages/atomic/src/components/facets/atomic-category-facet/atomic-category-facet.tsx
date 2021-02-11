import {Component, h, Prop, State} from '@stencil/core';
import {
  CategoryFacetState,
  CategoryFacet,
  buildCategoryFacet,
  CategoryFacetOptions,
  CategoryFacetValue,
} from '@coveo/headless';
import {
  Bindings,
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';

@Component({
  tag: 'atomic-category-facet',
  styleUrl: 'atomic-category-facet.pcss',
  shadow: true,
})
export class AtomicCategoryFacet implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  private facet!: CategoryFacet;

  @BindStateToController('facet', {subscribeOnConnectedCallback: true})
  @State()
  private facetState!: CategoryFacetState;
  @State() public error!: Error;

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
      <li onClick={() => this.facet.toggleSelect(item)}>
        <span>
          {item.value} {item.numberOfResults}
        </span>
      </li>
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
      <base-facet
        label={this.label}
        hasActiveValues={this.facetState.hasActiveValues}
        onDeselectAll={() => this.facet.deselectAll()}
      >
        <facet-search facet={this.facet} facetState={this.facetState} />
        <div>
          <div>{this.resetButton}</div>
          <div>{this.parents}</div>
          <ul class="list-none p-0">{this.values}</ul>
          <div>{this.showMore}</div>
          <div>{this.showLess}</div>
        </div>
      </base-facet>
    );
  }
}
