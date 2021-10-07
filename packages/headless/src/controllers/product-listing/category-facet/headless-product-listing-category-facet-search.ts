import {
  buildCoreCategoryFacetSearch,
  CategoryFacetSearchProps,
} from '../../core/facets/facet-search/category/headless-category-facet-search';
import {updateFacetOptions} from '../../../features/facet-options/facet-options-actions';
import {fetchProductListing} from '../../../features/product-listing/product-listing-actions';
import {logFacetSelect} from '../../../features/facets/facet-set/facet-set-analytics-actions';
import {CategoryFacetSearchResult} from '../../core/facets/category-facet/headless-core-category-facet';
import {CoreEngine} from '../../../app/engine';
import {
  CategoryFacetSearchSection,
  ConfigurationSection,
  ProductListingSection,
} from '../../../state/state-sections';
import {defaultFacetSearchOptions} from '../../../features/facets/facet-search-set/facet-search-reducer-helpers';
import {registerCategoryFacetSearch} from '../../../features/facets/facet-search-set/category/category-facet-search-actions';
import {buildGenericFacetSearch} from '../../core/facets/facet-search/facet-search';
import {ProductListingThunkExtraArguments} from '../../../app/product-listing-thunk-extra-arguments';

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
  });

  dispatch(registerCategoryFacetSearch(options));

  const genericFacetSearch = buildGenericFacetSearch(engine, {
    options,
    getFacetSearch,
  });

  return {
    ...genericFacetSearch,
    ...coreFacetSearch,

    select: (value: CategoryFacetSearchResult) => {
      coreFacetSearch.select(value);
      dispatch(updateFacetOptions({freezeFacetOrder: true}));
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
