import {
  buildCategoryFacet,
  type CategoryFacetOptions,
  type CategoryFacetState,
  type CategoryFacetValue,
  type CategoryFacet as HeadlessCategoryFacet,
  type Unsubscribe,
} from '@coveo/headless';
import {Component, type ContextType} from 'react';
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

  private renderParents() {
    return (
      this.state.hasActiveValues && (
        <div>
          Filtering by: {this.renderClearButton()}
          {this.state.valuesAsTrees.map((parentValue, i) => {
            const isSelectedValue = i === this.state.valuesAsTrees.length - 1;

            return (
              <span key={this.getUniqueKeyForValue(parentValue)}>
                &rarr;
                {!isSelectedValue ? (
                  <button
                    onClick={() => this.controller.toggleSelect(parentValue)}
                  >
                    {parentValue.value}
                  </button>
                ) : (
                  <span>{parentValue.value}</span>
                )}
              </span>
            );
          })}
        </div>
      )
    );
  }

  private renderActiveValues() {
    return (
      <ul>
        {this.state.selectedValueAncestry.map((value) => (
          <li key={this.getUniqueKeyForValue(value)}>
            <button onClick={() => this.controller.toggleSelect(value)}>
              {value.value} ({value.numberOfResults}{' '}
              {value.numberOfResults === 1 ? 'result' : 'results'})
            </button>
          </li>
        ))}
      </ul>
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

    if (
      !this.state.hasActiveValues &&
      this.state.selectedValueAncestry.length === 0
    ) {
      return <div>No facet values</div>;
    }

    return (
      <ul>
        <li>{this.renderSearch()}</li>
        <li>
          {this.renderParents()}
          {this.renderActiveValues()}
          {this.renderCanShowMoreLess()}
        </li>
      </ul>
    );
  }
}
