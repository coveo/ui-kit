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
import {EngineProviderError, EngineProvider} from '../../utils/engine-utils';
import {RenderError} from '../../utils/render-utils';

@Component({
  tag: 'atomic-category-facet',
  styleUrl: 'atomic-category-facet.css',
  shadow: true,
})
export class AtomicCategoryFacet {
  @Prop() field = '';
  @Prop() label = 'No label';
  @State() state!: CategoryFacetState;
  @EngineProvider() engine!: Engine;
  @RenderError() error?: Error;

  private categoryFacet!: CategoryFacet;
  private unsubscribe: Unsubscribe = () => {};

  public componentWillLoad() {
    try {
      this.configure();
    } catch (error) {
      this.error = error;
    }
  }

  private configure() {
    if (!this.engine) {
      throw new EngineProviderError('atomic-category-facet');
    }

    const options: CategoryFacetOptions = {field: this.field};
    this.categoryFacet = buildCategoryFacet(this.engine, {options});
    this.unsubscribe = this.categoryFacet.subscribe(() => this.updateState());
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

  render() {
    return (
      <div>
        <div>
          <span>{this.label}</span>
          <select onInput={this.handleSelect}>{this.sortOptions}</select>
        </div>
        <div>
          <div>{this.resetButton}</div>
          <div>{this.parents}</div>
          <div>{this.values}</div>
        </div>
      </div>
    );
  }
}
