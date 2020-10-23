import {Engine} from '../../../../app/headless-engine';
import {
  registerCategoryFacetSearch,
  selectCategoryFacetSearchResult,
} from '../../../../features/facets/facet-search-set/category/category-facet-search-actions';
import {buildGenericFacetSearch} from '../facet-search';
import {FacetSearchOptions} from '../../../../features/facets/facet-search-set/facet-search-request-options';
import {CategoryFacetSearchResult} from '../../../../api/search/facet-search/category-facet-search/category-facet-search-response';
import {
  CategoryFacetSearchSection,
  ConfigurationSection,
} from '../../../../state/state-sections';

export interface CategoryFacetSearchProps {
  options: FacetSearchOptions;
}

export type CategoryFacetSearch = ReturnType<typeof buildCategoryFacetSearch>;

export function buildCategoryFacetSearch(
  engine: Engine<CategoryFacetSearchSection & ConfigurationSection>,
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

    select(value: CategoryFacetSearchResult) {
      dispatch(selectCategoryFacetSearchResult({facetId, value}));
      genericFacetSearch.select(value);
    },

    get state() {
      return genericFacetSearch.state;
    },
  };
}
