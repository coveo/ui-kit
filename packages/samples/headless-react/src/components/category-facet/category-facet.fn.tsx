import {useEffect, useState, FunctionComponent} from 'react';
import {
  CategoryFacet as HeadlessCategoryFacet,
  CategoryFacetValue,
} from '@coveo/headless';
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

  function clearButton() {
    return (
      <button onClick={() => controller.deselectAll()}>All categories</button>
    );
  }

  function parents() {
    return state.parents.map((parentValue, i) => {
      const isSelectedValue = i === state.parents.length - 1;

      return (
        <span key={getUniqueKeyForValue(parentValue)}>
          &rarr;
          {!isSelectedValue ? (
            <button onClick={() => controller.toggleSelect(parentValue)}>
              {parentValue.value}
            </button>
          ) : (
            <span>{parentValue.value}</span>
          )}
        </span>
      );
    });
  }

  if (!state.hasActiveValues && state.values.length === 0) {
    return <div>No facet values</div>;
  }

  return (
    <ul>
      <li>
        <CategoryFacetSearch
          controller={controller.facetSearch}
          facetState={state.facetSearch}
        />
      </li>
      <li>
        {state.hasActiveValues && (
          <div>
            Filtering by: {clearButton()}
            {parents()}
          </div>
        )}
        <ul>
          {state.values.map((value) => (
            <li key={getUniqueKeyForValue(value)}>
              <button onClick={() => controller.toggleSelect(value)}>
                {value.value} ({value.numberOfResults}{' '}
                {value.numberOfResults === 1 ? 'result' : 'results'})
              </button>
            </li>
          ))}
        </ul>
        {state.canShowLessValues && (
          <button onClick={() => controller.showLessValues()}>Show less</button>
        )}
        {state.canShowMoreValues && (
          <button onClick={() => controller.showMoreValues()}>Show more</button>
        )}
      </li>
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
