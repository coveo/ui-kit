import {
  buildCategoryFacet,
  CategoryFacet as HeadlessCategoryFacet,
  CategoryFacetOptions,
  CategoryFacetState,
  CategoryFacetValue,
  Unsubscribe,
} from '@coveo/headless';
import {Component, ContextType} from 'react';
import {AppContext} from '../../context/engine';
import {CategoryFacetSearch} from './category-facet-search';

interface CategoryFacetProps extends CategoryFacetOptions {
  facetId: string;
}

export class CategoryFacet extends Component<
  CategoryFacetProps,
  CategoryFacetState
> {
  static contextType = AppContext;
  context!: ContextType<typeof AppContext>;

  private controller!: HeadlessCategoryFacet;
  private unsubscribe: Unsubscribe = () => {};

  componentDidMount() {
    this.controller = buildCategoryFacet(this.context.engine!, {
      options: this.props,
    });
    this.updateState();

    this.unsubscribe = this.controller.subscribe(() => this.updateState());
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  private updateState() {
    this.setState(this.controller.state);
  }

  private getUniqueKeyForValue(value: CategoryFacetValue) {
    return value.path.join('>');
  }

  private renderSearch() {
    return (
      <CategoryFacetSearch
        controller={this.controller.facetSearch}
        searchState={this.state.facetSearch}
      />
    );
  }

  private renderClearButton() {
    return (
      <button onClick={() => this.controller.deselectAll()}>
        All categories
      </button>
    );
  }

  private renderValues() {
    return (
      this.state.hasActiveValues && (
        <div>
          Filtering by: {this.renderClearButton()}
          {this.state.valuesAsTrees.map(this.renderFacetValue)}
        </div>
      )
    );
  }

  private renderFacetValue(value: CategoryFacetValue) {
    return (
      <li key={this.getUniqueKeyForValue(value)}>
        {value.children.length === 0
          ? this.renderChildValue(value)
          : value.children.map(this.renderFacetValue)}
        {value.state === 'selected' && this.renderCanShowMoreLess()}
      </li>
    );
  }

  private renderChildValue(value: CategoryFacetValue) {
    return (
      <button onClick={() => this.controller.toggleSelect(value)}>
        {value.value} ({value.numberOfResults}{' '}
        {value.numberOfResults === 1 ? 'result' : 'results'})
      </button>
    );
  }

  private renderCanShowMoreLess() {
    return (
      <div>
        {this.state.canShowLessValues && (
          <button onClick={() => this.controller.showLessValues()}>
            Show less
          </button>
        )}
        {this.state.canShowMoreValues && (
          <button onClick={() => this.controller.showMoreValues()}>
            Show more
          </button>
        )}
      </div>
    );
  }

  render() {
    if (!this.state) {
      return null;
    }

    if (!this.state.hasActiveValues && this.state.values.length === 0) {
      return <div>No facet values</div>;
    }

    return (
      <ul>
        <li>{this.renderSearch()}</li>
        <li>{this.renderValues()}</li>
      </ul>
    );
  }
}
