import {CoreEngine} from '../../../app/engine';
import {ProductListingThunkExtraArguments} from '../../../app/product-listing-thunk-extra-arguments';
import {updateFacetOptions} from '../../../features/facet-options/facet-options-actions';
import {registerCategoryFacetSearch} from '../../../features/facets/facet-search-set/category/category-facet-search-actions';
import {defaultFacetSearchOptions} from '../../../features/facets/facet-search-set/facet-search-reducer-helpers';
import {
  executeFacetSearch,
  executeFieldSuggest,
} from '../../../features/facets/facet-search-set/generic/generic-facet-search-actions';
import {logFacetSelect} from '../../../features/facets/facet-set/facet-set-product-listing-analytics-actions';
import {fetchProductListing} from '../../../features/product-listing/product-listing-actions';
import {
  CategoryFacetSearchSection,
  ConfigurationSection,
  ProductListingSection,
} from '../../../state/state-sections';
import {CategoryFacetSearchResult} from '../../core/facets/category-facet/headless-core-category-facet';
import {
  buildCoreCategoryFacetSearch,
  CategoryFacetSearchProps,
} from '../../core/facets/facet-search/category/headless-category-facet-search';
import {buildGenericFacetSearch} from '../../core/facets/facet-search/facet-search';

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
    executeFacetSearchActionCreator: executeFacetSearch,
    executeFieldSuggestActionCreator: executeFieldSuggest,
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
