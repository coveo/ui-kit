import {Engine} from '../../../../app/headless-engine';
import {registerCategoryFacetSearch} from '../../../../features/facets/facet-search-set/category/category-facet-search-actions';
import {buildGenericFacetSearch} from '../facet-search';
import {FacetSearchOptions} from '../../../../features/facets/facet-search-set/facet-search-request-options';

export interface CategoryFacetSearchProps {
  options: FacetSearchOptions;
}

export type CategoryFacetSearch = ReturnType<typeof buildCategoryFacetSearch>;

export function buildCategoryFacetSearch(
  engine: Engine,
  props: CategoryFacetSearchProps
) {
  const {dispatch} = engine;
  const {options} = props;
  const {facetId} = options;
  const getFacetSearch = () => engine.state.categoryFacetSearchSet[facetId];

  dispatch(registerCategoryFacetSearch(options));

  const genericFacetSearch = buildGenericFacetSearch(engine, {
    options,
    getFacetSearch,
  });

  return {
    ...genericFacetSearch,

    get state() {
      return genericFacetSearch.state;
    },
  };
}
