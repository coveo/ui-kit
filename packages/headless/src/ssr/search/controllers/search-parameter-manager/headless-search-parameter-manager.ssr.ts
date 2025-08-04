import type {CoreEngine} from '../../../../app/engine.js';
import type {SearchEngine} from '../../../../app/search-engine/search-engine.js';
import {
  buildSearchParameterManager,
  type SearchParameterManager,
  type SearchParameterManagerInitialState,
} from '../../../../controllers/search-parameter-manager/headless-search-parameter-manager.js';
import {advancedSearchQueriesReducer as advancedSearchQueries} from '../../../../features/advanced-search-queries/advanced-search-queries-slice.js';
import {configurationReducer as configuration} from '../../../../features/configuration/configuration-slice.js';
import {debugReducer as debug} from '../../../../features/debug/debug-slice.js';
import {facetOptionsReducer as facetOptions} from '../../../../features/facet-options/facet-options-slice.js';
import {automaticFacetSetReducer as automaticFacetSet} from '../../../../features/facets/automatic-facet-set/automatic-facet-set-slice.js';
import {categoryFacetSetReducer as categoryFacetSet} from '../../../../features/facets/category-facet-set/category-facet-set-slice.js';
import {facetSetReducer as facetSet} from '../../../../features/facets/facet-set/facet-set-slice.js';
import {dateFacetSetReducer as dateFacetSet} from '../../../../features/facets/range-facets/date-facet-set/date-facet-set-slice.js';
import {numericFacetSetReducer as numericFacetSet} from '../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-set-slice.js';
import {paginationReducer as pagination} from '../../../../features/pagination/pagination-slice.js';
import {queryReducer as query} from '../../../../features/query/query-slice.js';
import {sortCriteriaReducer as sortCriteria} from '../../../../features/sort-criteria/sort-criteria-slice.js';
import {staticFilterSetReducer as staticFilterSet} from '../../../../features/static-filter-set/static-filter-set-slice.js';
import {tabSetReducer as tabSet} from '../../../../features/tab-set/tab-set-slice.js';
import {loadReducerError} from '../../../../utils/errors.js';
import {MissingControllerProps} from '../../../common/errors.js';
import type {ControllerDefinitionWithProps} from '../../../common/types/controllers.js';

export * from '../../../../controllers/search-parameter-manager/headless-search-parameter-manager.js';

export interface SearchParameterManagerBuildProps {
  initialState: SearchParameterManagerInitialState;
}

export interface SearchParameterManagerDefinition
  extends ControllerDefinitionWithProps<
    SearchEngine,
    SearchParameterManager,
    SearchParameterManagerBuildProps
  > {}

/**
 * Defines a `SearchParameterManager` controller instance.
 * @group Definers
 *
 * @returns The `SearchParameterManager` controller definition.
 * */
export function defineSearchParameterManager(): SearchParameterManagerDefinition {
  return {
    buildWithProps: (engine, props) => {
      if (props === undefined) {
        throw new MissingControllerProps('SearchParameterManager');
      }
      if (!loadSearchParameterManagerReducers(engine)) {
        throw loadReducerError;
      }
      return buildSearchParameterManager(engine, {
        initialState: props.initialState,
      });
    },
  };
}

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
