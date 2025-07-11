import type {InsightEngine} from '../../../app/insight-engine/insight-engine.js';
import {executeSearch} from '../../../features/insight-search/insight-search-actions.js';
import type {SearchParameters} from '../../../features/search-parameters/search-parameter-actions.js';
import {parametersChange} from '../../../features/search-parameters/search-parameter-analytics-actions.js';
import {logParametersChange} from '../../../features/search-parameters/search-parameter-insight-analytics-actions.js';
import {deepEqualAnyOrder} from '../../../utils/compare-utils.js';
import {
  buildCoreSearchParameterManager,
  enrichParameters,
  getCoreActiveSearchParameters,
  type SearchParameterManager,
  type SearchParameterManagerInitialState,
  type SearchParameterManagerProps,
  type SearchParameterManagerState,
} from '../../core/search-parameter-manager/headless-core-search-parameter-manager.js';

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
 *
 * @group Controllers
 * @category SearchParameterManager
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
      dispatch(
        executeSearch({
          legacy: logParametersChange(oldParams, newParams),
          next: parametersChange(oldParams, newParams),
        })
      );
    },

    get state() {
      return controller.state;
    },
  };
}
