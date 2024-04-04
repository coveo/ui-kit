import {CoreEngine} from '../../app/engine';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithProps} from '../../app/ssr-engine/types/common';
import {configurationReducer as configuration} from '../../features/configuration/configuration-slice';
import {debugReducer as debug} from '../../features/debug/debug-slice';
import {facetOptionsReducer as facetOptions} from '../../features/facet-options/facet-options-slice';
import {automaticFacetSetReducer as automaticFacetSet} from '../../features/facets/automatic-facet-set/automatic-facet-set-slice';
import {categoryFacetSetReducer as categoryFacetSet} from '../../features/facets/category-facet-set/category-facet-set-slice';
import {facetSetReducer as facetSet} from '../../features/facets/facet-set/facet-set-slice';
import {dateFacetSetReducer as dateFacetSet} from '../../features/facets/range-facets/date-facet-set/date-facet-set-slice';
import {numericFacetSetReducer as numericFacetSet} from '../../features/facets/range-facets/numeric-facet-set/numeric-facet-set-slice';
import {paginationReducer as pagination} from '../../features/pagination/pagination-slice';
import {queryReducer as query} from '../../features/query/query-slice';
import {sortCriteriaReducer as sortCriteria} from '../../features/sort-criteria/sort-criteria-slice';
import {staticFilterSetReducer as staticFilterSet} from '../../features/static-filter-set/static-filter-set-slice';
import {tabSetReducer as tabSet} from '../../features/tab-set/tab-set-slice';
import {loadReducerError} from '../../utils/errors';
import {advancedSearchQueriesReducer as advancedSearchQueries} from './../../features/advanced-search-queries/advanced-search-queries-slice';
import {
  SearchParameterManager,
  SearchParameterManagerInitialState,
  buildSearchParameterManager,
} from './headless-search-parameter-manager';

export * from './headless-search-parameter-manager';

/**
 * @alpha
 */
export interface SearchParameterManagerBuildProps {
  initialState: SearchParameterManagerInitialState;
}

/**
 * @alpha
 */
export const defineSearchParameterManager = (): ControllerDefinitionWithProps<
  SearchEngine,
  SearchParameterManager,
  SearchParameterManagerBuildProps
> => ({
  buildWithProps: (engine, props) => {
    if (!loadSearchParameterManagerReducers(engine)) {
      throw loadReducerError;
    }
    return buildSearchParameterManager(engine, {
      initialState: props.initialState,
    });
  },
});

function loadSearchParameterManagerReducers(
  engine: CoreEngine
): engine is CoreEngine<SearchParameterManager> {
  engine.addReducers({
    advancedSearchQueries,
    automaticFacetSet,
    categoryFacetSet,
    configuration,
    dateFacetSet,
    debug,
    facetOptions,
    facetSet,
    numericFacetSet,
    pagination,
    query,
    sortCriteria,
    staticFilterSet,
    tabSet,
  });
  return true;
}
