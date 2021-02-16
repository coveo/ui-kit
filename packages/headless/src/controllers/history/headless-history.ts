import {Engine} from '../../app/headless-engine';
import {buildController} from '../controller/headless-controller';
import {back, forward} from '../../features/history/history-actions';
import {executeSearch} from '../../features/search/search-actions';
import {
  logNavigateBackward,
  logNavigateForward,
} from '../../features/history/history-analytics-actions';

/**
 * The `History` controller is in charge of allowing navigating back and forward in the search interface history.
 */
export type History = ReturnType<typeof buildHistory>;
/** The state relevant to the `History` controller.*/
export type HistoryState = History['state'];

export const buildHistory = (engine: Engine) => {
  const controller = buildController(engine);
  const {dispatch} = engine;

  return {
    ...controller,
    get state() {
      return engine.state.history;
    },

    /**
     * Move backward in the interface history.
     */
    async back() {
      if (!this.state.past.length || !this.state.present) {
        return;
      }
      await dispatch(back());
      dispatch(executeSearch(logNavigateBackward()));
    },

    /**
     * Move forward in the interface history.
     */
    async forward() {
      if (!this.state.future.length || !this.state.present) {
        return;
      }
      await dispatch(forward());
      dispatch(executeSearch(logNavigateForward()));
    },
  };
};
