import type {CoreEngine} from '@coveo/headless';
import type {SearchEngine} from '@coveo/headless';
import {
  buildSearchParameterManager,
  type SearchParameterManager,
  type SearchParameterManagerInitialState,
} from '@coveo/headless';
import {advancedSearchQueriesReducer as advancedSearchQueries} from '@coveo/headless/ssr-internal';
import {configurationReducer as configuration} from '@coveo/headless/ssr-internal';
import {debugReducer as debug} from '@coveo/headless/ssr-internal';
import {facetOptionsReducer as facetOptions} from '@coveo/headless/ssr-internal';
import {automaticFacetSetReducer as automaticFacetSet} from '@coveo/headless/ssr-internal';
import {categoryFacetSetReducer as categoryFacetSet} from '@coveo/headless/ssr-internal';
import {facetSetReducer as facetSet} from '@coveo/headless/ssr-internal';
import {dateFacetSetReducer as dateFacetSet} from '@coveo/headless/ssr-internal';
import {numericFacetSetReducer as numericFacetSet} from '@coveo/headless/ssr-internal';
import {paginationReducer as pagination} from '@coveo/headless/ssr-internal';
import {queryReducer as query} from '@coveo/headless/ssr-internal';
import {sortCriteriaReducer as sortCriteria} from '@coveo/headless/ssr-internal';
import {staticFilterSetReducer as staticFilterSet} from '@coveo/headless/ssr-internal';
import {tabSetReducer as tabSet} from '@coveo/headless/ssr-internal';
import {loadReducerError} from '@coveo/headless/ssr-internal';
import {MissingControllerProps} from '../../../common/errors.js';
import type {ControllerDefinitionWithProps} from '../../types/controller-definition.js';

export {
  type SearchParameterManager,
  type SearchParameterManagerInitialState,
  type SearchParameterManagerState,
  type SearchParameters,
} from '@coveo/headless';

export interface SearchParameterManagerBuildProps {
  initialState: SearchParameterManagerInitialState;
}

export interface SearchParameterManagerDefinition extends ControllerDefinitionWithProps<
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
    // TODO: KIT-5154 - Apply commerce pattern
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
