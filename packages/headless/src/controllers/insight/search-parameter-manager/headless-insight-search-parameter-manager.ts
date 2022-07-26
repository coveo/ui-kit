import {SearchParameters} from '../../../features/search-parameters/search-parameter-actions';
import {
  buildCoreSearchParameterManager,
  enrichParameters,
  getCoreActiveSearchParameters,
  SearchParameterManager,
  SearchParameterManagerInitialState,
  SearchParameterManagerProps,
  SearchParameterManagerState,
} from '../../core/search-parameter-manager/headless-core-search-parameter-manager';
import {InsightEngine} from '../../../insight.index';
import {deepEqualAnyOrder} from '../../../utils/compare-utils';
import {executeSearch} from '../../../features/insight-search/insight-search-actions';
import {logParametersChange} from '../../../features/search-parameters/search-parameter-insight-analytics-actions';

export type {
  SearchParameters,
  SearchParameterManager,
  SearchParameterManagerInitialState,
  SearchParameterManagerProps,
  SearchParameterManagerState,
};

/**
 * Creates an insight `SearchParameterManager` controller instance.
 *
 * @param engine - The insight engine.
 * @param props - The configurable `SearchParameterManager` properties.
 * @returns A `SearchParameterManager` controller instance.
 */
export function buildSearchParameterManager(
  engine: InsightEngine,
  props: SearchParameterManagerProps
): SearchParameterManager {
  const {dispatch} = engine;
  const controller = buildCoreSearchParameterManager(engine, props);

  return {
    ...controller,

    synchronize(parameters: SearchParameters) {
      const activeParams = getCoreActiveSearchParameters(engine);
      const oldParams = enrichParameters(engine, activeParams);
      const newParams = enrichParameters(engine, parameters);

      if (deepEqualAnyOrder(oldParams, newParams)) {
        return;
      }
      controller.synchronize(parameters);
      dispatch(executeSearch(logParametersChange(oldParams, newParams)));
    },

    get state() {
      return controller.state;
    },
  };
}
