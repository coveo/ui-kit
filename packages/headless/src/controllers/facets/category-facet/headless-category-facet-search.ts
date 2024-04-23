import {CoreEngine} from '../../../app/engine';
import {SearchThunkExtraArguments} from '../../../app/search-thunk-extra-arguments';
import {registerCategoryFacetSearch} from '../../../features/facets/facet-search-set/category/category-facet-search-actions';
import {defaultFacetSearchOptions} from '../../../features/facets/facet-search-set/facet-search-reducer-helpers';
import {
  executeFacetSearch,
  executeFieldSuggest,
} from '../../../features/facets/facet-search-set/generic/generic-facet-search-actions';
import {
  CategoryFacetSearchSection,
  ConfigurationSection,
} from '../../../state/state-sections';
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
  const {
    executeFacetSearchActionCreator,
    executeFieldSuggestActionCreator,
    select: propsSelect,
    isForFieldSuggestions,
  } = props;
  const {dispatch} = engine;
  const options = {...defaultFacetSearchOptions, ...props.options};
  const {facetId} = options;
  const getFacetSearch = () => engine.state.categoryFacetSearchSet[facetId];

  const coreFacetSearch = buildCoreCategoryFacetSearch(engine, {
    options: {
      ...options,
    },
    executeFacetSearchActionCreator,
    executeFieldSuggestActionCreator,
    select: propsSelect,
    isForFieldSuggestions,
  });

  dispatch(registerCategoryFacetSearch(options));

  const genericFacetSearch = buildGenericFacetSearch(engine, {
    options,
    getFacetSearch,
    isForFieldSuggestions: props.isForFieldSuggestions,
    executeFacetSearchActionCreator: executeFacetSearch,
    executeFieldSuggestActionCreator: executeFieldSuggest,
  });

  return {
    ...genericFacetSearch,
    ...coreFacetSearch,

    get state() {
      return {
        ...genericFacetSearch.state,
        ...coreFacetSearch.state,
      };
    },
  };
}
