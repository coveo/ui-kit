import {SearchEngine} from '../../app/search-engine/search-engine';
import {getDebugInitialState} from '../../features/debug/debug-state';
import {getPaginationInitialState} from '../../features/pagination/pagination-state';
import {getQueryInitialState} from '../../features/query/query-state';
import {SearchParameters} from '../../features/search-parameters/search-parameter-actions';
import {
  legacyLogParametersChange,
  parametersChange,
} from '../../features/search-parameters/search-parameter-analytics-actions';
import {executeSearch} from '../../features/search/search-actions';
import {StaticFilterValue} from '../../features/static-filter-set/static-filter-set-state';
import {SearchParametersState} from '../../state/search-app-state';
import {deepEqualAnyOrder} from '../../utils/compare-utils';
import {
  buildCoreSearchParameterManager,
  enrichParameters,
  getCoreActiveSearchParameters,
  SearchParameterManager,
  SearchParameterManagerInitialState,
  SearchParameterManagerProps,
  SearchParameterManagerState,
  validateParams,
} from '../core/search-parameter-manager/headless-core-search-parameter-manager';

export type {
  SearchParameters,
  SearchParameterManager,
  SearchParameterManagerInitialState,
  SearchParameterManagerState,
  SearchParameterManagerProps,
};

/**
 * Creates a `SearchParameterManager` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `SearchParameterManager` properties.
 * @returns A `SearchParameterManager` controller instance.
 */
export function buildSearchParameterManager(
  engine: SearchEngine,
  props: SearchParameterManagerProps
): SearchParameterManager {
  const {dispatch} = engine;
  const controller = buildCoreSearchParameterManager(engine, props);

  return {
    ...controller,

    synchronize(parameters: SearchParameters) {
      const activeParams = getActiveSearchParameters(engine);
      const oldParams = enrichParameters(engine, activeParams);
      const newParams = enrichParameters(engine, parameters);

      if (deepEqualAnyOrder(oldParams, newParams)) {
        return;
      }

      if (!validateParams(engine, newParams)) {
        return;
      }

      controller.synchronize(parameters);
      dispatch(
        executeSearch({
          legacy: legacyLogParametersChange(oldParams, newParams),
          next: parametersChange(oldParams, newParams),
        })
      );
    },

    get state() {
      const parameters = getActiveSearchParameters(engine);
      return {parameters};
    },
  };
}

function getActiveSearchParameters(engine: SearchEngine): SearchParameters {
  const state = engine.state;
  return {
    ...getCoreActiveSearchParameters(engine),
    ...getEnableQuerySyntax(state),
    ...getAq(state),
    ...getCq(state),
    ...getFirstResult(state),
    ...getNumberOfResults(state),
    ...getDebug(state),
    ...getStaticFilters(state),
  };
}

function getEnableQuerySyntax(state: Partial<SearchParametersState>) {
  if (state.query === undefined) {
    return {};
  }

  const enableQuerySyntax = state.query.enableQuerySyntax;
  const shouldInclude =
    enableQuerySyntax !== undefined &&
    enableQuerySyntax !== getQueryInitialState().enableQuerySyntax;
  return shouldInclude ? {enableQuerySyntax} : {};
}

function getAq(state: Partial<SearchParametersState>) {
  if (state.advancedSearchQueries === undefined) {
    return {};
  }

  const {aq, defaultFilters} = state.advancedSearchQueries;
  const shouldInclude = aq !== defaultFilters.aq;
  return shouldInclude ? {aq} : {};
}

function getCq(state: Partial<SearchParametersState>) {
  if (state.advancedSearchQueries === undefined) {
    return {};
  }

  const {cq, defaultFilters} = state.advancedSearchQueries;
  const shouldInclude = cq !== defaultFilters.cq;
  return shouldInclude ? {cq} : {};
}

function getFirstResult(state: Partial<SearchParametersState>) {
  if (state.pagination === undefined) {
    return {};
  }

  const firstResult = state.pagination.firstResult;
  const shouldInclude = firstResult !== getPaginationInitialState().firstResult;
  return shouldInclude ? {firstResult} : {};
}

function getNumberOfResults(state: Partial<SearchParametersState>) {
  if (state.pagination === undefined) {
    return {};
  }

  const {numberOfResults, defaultNumberOfResults} = state.pagination;
  const shouldInclude = numberOfResults !== defaultNumberOfResults;
  return shouldInclude ? {numberOfResults} : {};
}

function getStaticFilters(state: Partial<SearchParametersState>) {
  if (state.staticFilterSet === undefined) {
    return {};
  }

  const sf = Object.entries(state.staticFilterSet)
    .map(([id, filter]) => {
      const selectedCaptions = getSelectedStaticFilterCaptions(filter.values);
      return selectedCaptions.length ? {[id]: selectedCaptions} : {};
    })
    .reduce((acc, obj) => ({...acc, ...obj}), {});

  return Object.keys(sf).length ? {sf} : {};
}

function getSelectedStaticFilterCaptions(values: StaticFilterValue[]) {
  return values.filter((v) => v.state === 'selected').map((v) => v.caption);
}

function getDebug(state: Partial<SearchParametersState>) {
  if (state.debug === undefined) {
    return {};
  }

  const debug = state.debug;
  const shouldInclude = debug !== getDebugInitialState();
  return shouldInclude ? {debug} : {};
}
