import {
  buildCoreCategoryFacetSearch,
  CategoryFacetSearchProps,
} from '../../core/facets/facet-search/category/headless-category-facet-search';
import {updateFacetOptions} from '../../../features/facet-options/facet-options-actions';
import {logFacetSelect} from '../../../features/facets/facet-set/facet-set-analytics-actions';
import {executeSearch} from '../../../features/search/search-actions';
import {CoreEngine} from '../../../app/engine';
import {
  CategoryFacetSearchSection,
  ConfigurationSection,
} from '../../../state/state-sections';
import {registerCategoryFacetSearch} from '../../../features/facets/facet-search-set/category/category-facet-search-actions';
import {buildGenericFacetSearch} from '../../core/facets/facet-search/facet-search';
import {defaultFacetSearchOptions} from '../../../features/facets/facet-search-set/facet-search-reducer-helpers';
import {CategoryFacetSearchResult} from '../../core/facets/category-facet/headless-core-category-facet';
import {SearchThunkExtraArguments} from '../../../app/search-thunk-extra-arguments';

export function buildCategoryFacetSearch(
  engine: CoreEngine<
    CategoryFacetSearchSection & ConfigurationSection,
    SearchThunkExtraArguments
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
      dispatch(
        executeSearch(logFacetSelect({facetId, facetValue: value.rawValue}))
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
