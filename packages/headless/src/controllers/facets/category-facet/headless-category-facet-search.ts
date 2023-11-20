import {CoreEngine} from '../../../app/engine';
import {SearchThunkExtraArguments} from '../../../app/search-thunk-extra-arguments';
import {updateFacetOptions} from '../../../features/facet-options/facet-options-actions';
import {registerCategoryFacetSearch} from '../../../features/facets/facet-search-set/category/category-facet-search-actions';
import {defaultFacetSearchOptions} from '../../../features/facets/facet-search-set/facet-search-reducer-helpers';
import {logFacetSelect} from '../../../features/facets/facet-set/facet-set-analytics-actions';
import {executeSearch} from '../../../features/search/search-actions';
import {
  CategoryFacetSearchSection,
  ConfigurationSection,
} from '../../../state/state-sections';
import {CategoryFacetSearchResult} from '../../core/facets/category-facet/headless-core-category-facet';
import {
  buildCoreCategoryFacetSearch,
  CategoryFacetSearchProps,
} from '../../core/facets/facet-search/category/headless-category-facet-search';
import {buildGenericFacetSearch} from '../../core/facets/facet-search/facet-search';

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
    isForFieldSuggestions: props.isForFieldSuggestions,
  });

  dispatch(registerCategoryFacetSearch(options));

  const genericFacetSearch = buildGenericFacetSearch(engine, {
    options,
    getFacetSearch,
    isForFieldSuggestions: props.isForFieldSuggestions,
  });

  return {
    ...genericFacetSearch,
    ...coreFacetSearch,

    select: (value: CategoryFacetSearchResult) => {
      coreFacetSearch.select(value);
      dispatch(updateFacetOptions());
      dispatch(
        executeSearch({
          legacy: logFacetSelect({facetId, facetValue: value.rawValue}),
        })
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
