import {Engine} from '../../app/headless-engine';
import {configuration, facetOrder, history} from '../../app/reducers';
import {StateWithHistory} from '../../app/undoable';
import {back, forward} from '../../features/history/history-actions';
import {
  logNavigateBackward,
  logNavigateForward,
} from '../../features/history/history-analytics-actions';
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
export function buildHistoryManager(engine: Engine<object>): HistoryManager {
  if (!loadHistoryManagerReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;
  const getState = () => engine.state;

  return {
    ...controller,
    get state() {
      return getState().history;
    },

    async back() {
      if (!this.state.past.length || !this.state.present) {
        return;
      }
      await dispatch(back());
      dispatch(executeSearch(logNavigateBackward()));
    },

    async forward() {
      if (!this.state.future.length || !this.state.present) {
        return;
      }
      await dispatch(forward());
      dispatch(executeSearch(logNavigateForward()));
    },
  };
}

function loadHistoryManagerReducers(
  engine: Engine<object>
): engine is Engine<HistorySection & ConfigurationSection> {
  engine.addReducers({history, configuration, facetOrder});
  return true;
}
