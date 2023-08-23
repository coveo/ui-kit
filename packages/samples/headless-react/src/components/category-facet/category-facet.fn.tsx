import {
  CategoryFacet as HeadlessCategoryFacet,
  CategoryFacetValue,
} from '@coveo/headless';
import {useEffect, useState, FunctionComponent} from 'react';
import {CategoryFacetSearch} from './category-facet-search';

interface CategoryFacetProps {
  controller: HeadlessCategoryFacet;
}

export const CategoryFacet: FunctionComponent<CategoryFacetProps> = (props) => {
  const {controller} = props;
  const [state, setState] = useState(controller.state);

  useEffect(() => controller.subscribe(() => setState(controller.state)), []);

  function getUniqueKeyForValue(value: CategoryFacetValue) {
    return value.path.join('>');
  }

  function renderSearch() {
    return (
      <CategoryFacetSearch
        controller={controller.facetSearch}
        searchState={state.facetSearch}
      />
    );
  }

  function renderClearButton() {
    return (
      <button onClick={() => controller.deselectAll()}>All categories</button>
    );
  }

  function renderValues() {
    return (
      state.hasActiveValues && (
        <div>
          Filtering by: {renderClearButton()}
          <ul>{state.valuesAsTrees.map(renderFacetValue)}</ul>
        </div>
      )
    );
  }

  function renderFacetValue(value: CategoryFacetValue) {
    return (
      <li key={getUniqueKeyForValue(value)}>
        {value.children.length === 0
          ? renderChildValue(value)
          : value.children.map(renderFacetValue)}
        {value.state === 'selected' && renderCanShowMoreLess()}
      </li>
    );
  }

  function renderChildValue(value: CategoryFacetValue) {
    return (
      <button onClick={() => controller.toggleSelect(value)}>
        {value.value} ({value.numberOfResults}{' '}
        {value.numberOfResults === 1 ? 'result' : 'results'})
      </button>
    );
  }

  function renderCanShowMoreLess() {
    return (
      <div>
        {state.canShowLessValues && (
          <button onClick={() => controller.showLessValues()}>Show less</button>
        )}
        {state.canShowMoreValues && (
          <button onClick={() => controller.showMoreValues()}>Show more</button>
        )}
      </div>
    );
  }

  if (!state.hasActiveValues && state.valuesAsTrees.length === 0) {
    return <div>No facet values</div>;
  }

  return (
    <ul>
      <li>{renderSearch()}</li>
      <li>{renderValues()}</li>
    </ul>
  );
};

// usage

/**
 * ```tsx
 * const options: CategoryFacetOptions = {field: 'geographicalhierarchy'};
 * const controller = buildCategoryFacet(engine, {options});
 *
 * <CategoryFacet controller={controller} />;
 * ```
 */
