import {isNullOrUndefined} from '@coveo/bueno';
import {configuration} from '../../app/common-reducers';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {StateWithHistory} from '../../app/undoable';
import {facetOrderReducer as facetOrder} from '../../features/facets/facet-order/facet-order-slice';
import {back, forward} from '../../features/history/history-actions';
import {
  logNavigateBackward,
  logNavigateForward,
  logNoResultsBack,
  historyBackward,
  historyForward,
  noResultsBack,
} from '../../features/history/history-analytics-actions';
import {history} from '../../features/history/history-slice';
import {HistoryState} from '../../features/history/history-state';
import {executeSearch} from '../../features/search/search-actions';
import {ConfigurationSection, HistorySection} from '../../state/state-sections';
import {loadReducerError} from '../../utils/errors';
import {buildController, Controller} from '../controller/headless-controller';

/**
 * The `HistoryManager` controller is in charge of allowing navigating back and forward in the search interface history.
 */
export interface HistoryManager extends Controller {
  /**
   * Move backward in the interface history.
   *
   * @returns A promise that resolves when the previous state has been restored.
   */
  back(): Promise<void>;

  /**
   * Move forward in the interface history.
   *
   * @returns A promise that resolves when the next state has been restored.
   */
  forward(): Promise<void>;

  /**
   * Move backward in the interface history when there are no results.
   *
   * @returns A promise that resolves when the previous state has been restored.
   */
  backOnNoResults(): Promise<void>;

  /**
   * The state relevant to the `HistoryManager` controller.
   * */
  state: HistoryManagerState;
}

export type HistoryManagerState = StateWithHistory<HistoryState>;

/**
 * Creates a `HistoryManager` controller instance.
 *
 * @param engine - The headless engine.
 * @returns A `HistoryManager` controller instance.
 */
export function buildHistoryManager(engine: SearchEngine): HistoryManager {
  if (!loadHistoryManagerReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;
  const getState = () => engine.state;

  const canGoBack = (state: HistoryManagerState) => {
    return state.past.length > 0 && !isNullOrUndefined(state.present);
  };

  return {
    ...controller,
    get state() {
      return getState().history;
    },

    async back() {
      if (!canGoBack(this.state)) {
        return;
      }
      await dispatch(back());
      dispatch(
        executeSearch({
          legacy: logNavigateBackward(),
          next: historyBackward(),
        })
      );
    },

    async forward() {
      if (!this.state.future.length || !this.state.present) {
        return;
      }
      await dispatch(forward());
      dispatch(
        executeSearch({
          legacy: logNavigateForward(),
          next: historyForward(),
        })
      );
    },

    async backOnNoResults() {
      if (!canGoBack(this.state)) {
        return;
      }
      await dispatch(back());
      dispatch(
        executeSearch({
          legacy: logNoResultsBack(),
          next: noResultsBack(),
        })
      );
    },
  };
}

function loadHistoryManagerReducers(
  engine: SearchEngine
): engine is SearchEngine<HistorySection & ConfigurationSection> {
  engine.addReducers({history, configuration, facetOrder});
  return true;
}
