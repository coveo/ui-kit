import {isNullOrUndefined} from '@coveo/bueno';
import {configuration} from '../../app/common-reducers.js';
import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import type {StateWithHistory} from '../../app/undoable.js';
import {facetOrderReducer as facetOrder} from '../../features/facets/facet-order/facet-order-slice.js';
import {back, forward} from '../../features/history/history-actions.js';
import {
  logNavigateBackward,
  logNavigateForward,
  logNoResultsBack,
} from '../../features/history/history-analytics-actions.js';
import {history} from '../../features/history/history-slice.js';
import type {HistoryState} from '../../features/history/history-state.js';
import {executeSearch} from '../../features/search/search-actions.js';
import type {
  ConfigurationSection,
  HistorySection,
} from '../../state/state-sections.js';
import {loadReducerError} from '../../utils/errors.js';
import {
  buildController,
  type Controller,
} from '../controller/headless-controller.js';

/**
 * The `HistoryManager` controller is in charge of allowing navigating back and forward in the search interface history.
 *
 * Example: [history-manager.fn.tsx](https://github.com/coveo/ui-kit/blob/main/samples/headless/search-react/src/components/history-manager/history-manager.fn.tsx)
 *
 * @group Controllers
 * @category HistoryManager
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

/**
 * A scoped and simplified part of the headless state that is relevant to the `HistoryManager` controller.
 *
 * @group Controllers
 * @category HistoryManager
 */
export type HistoryManagerState = StateWithHistory<HistoryState>;

/**
 * Creates a `HistoryManager` controller instance.
 *
 * @param engine - The headless engine.
 * @returns A `HistoryManager` controller instance.
 *
 * @group Controllers
 * @category HistoryManager
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
    // TODO: https://coveord.atlassian.net/browse/KIT-2969:
    // Should be able to get rid of this local optimization following history management change
    subscribe(listener: () => void) {
      listener();
      let previous = JSON.stringify(getState().history.present);
      const strictListener = () => {
        const current = JSON.stringify(getState().history.present);
        const hasChanged = previous !== current;
        if (hasChanged) {
          previous = current;
          listener();
        }
      };
      return engine.subscribe(() => strictListener());
    },
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
