import {CoreEngine} from '../../../app/engine.js';
import {ProductListingThunkExtraArguments} from '../../../app/product-listing-thunk-extra-arguments.js';
import {updateFacetOptions} from '../../../features/facet-options/facet-options-actions.js';
import {registerCategoryFacetSearch} from '../../../features/facets/facet-search-set/category/category-facet-search-actions.js';
import {defaultFacetSearchOptions} from '../../../features/facets/facet-search-set/facet-search-reducer-helpers.js';
import {logFacetSelect} from '../../../features/facets/facet-set/facet-set-analytics-actions.js';
import {fetchProductListing} from '../../../features/product-listing/product-listing-actions.js';
import {
  CategoryFacetSearchSection,
  ConfigurationSection,
  ProductListingSection,
} from '../../../state/state-sections.js';
import {CategoryFacetSearchResult} from '../../core/facets/category-facet/headless-core-category-facet.js';
import {
  buildCoreCategoryFacetSearch,
  CategoryFacetSearchProps,
} from '../../core/facets/facet-search/category/headless-category-facet-search.js';
import {buildGenericFacetSearch} from '../../core/facets/facet-search/facet-search.js';

export function buildCategoryFacetSearch(
  engine: CoreEngine<
    ProductListingSection & CategoryFacetSearchSection & ConfigurationSection,
    ProductListingThunkExtraArguments
  >,
  props: CategoryFacetSearchProps
) {
  const {dispatch} = engine;
  const options = {...defaultFacetSearchOptions, ...props.options};
  const {facetId} = options;
  const getFacetSearch = () => engine.state.categoryFacetSearchSet[facetId];

  const coreFacetSearch = buildCoreCategoryFacetSearch(engine, {
    options: {
      ...options,
    },
    isForFieldSuggestions: false,
  });

  dispatch(registerCategoryFacetSearch(options));

  const genericFacetSearch = buildGenericFacetSearch(engine, {
    options,
    getFacetSearch,
    isForFieldSuggestions: false,
  });

  return {
    ...genericFacetSearch,
    ...coreFacetSearch,

    select: (value: CategoryFacetSearchResult) => {
      coreFacetSearch.select(value);
      dispatch(updateFacetOptions());
      dispatch(fetchProductListing()).then(() =>
        logFacetSelect({facetId: facetId, facetValue: value.rawValue})
      );
    },

    get state() {
      return {
        ...genericFacetSearch.state,
        ...coreFacetSearch.state,
      };
    },
  };
}
