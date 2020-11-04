import {Engine} from '../../app/headless-engine';
import {
  disableInfiniteScrolling,
  enableInfiniteScrolling,
  logFetchMoreResults,
} from '../../features/infinite-scrolling/infinite-scrolling-actions';
import {executeSearch} from '../../features/search/search-actions';
import {buildController} from '../controller/headless-controller';

/**
 * The InfiniteScrolling controller is responsible for toggling whether previous search results should be kept.
 */
export type InfiniteScrolling = ReturnType<typeof buildInfiniteScrolling>;
export type InfiniteScrollingState = InfiniteScrolling['state'];

export const buildInfiniteScrolling = (engine: Engine) => {
  const controller = buildController(engine);
  const {dispatch} = engine;

  dispatch(enableInfiniteScrolling());

  return {
    ...controller,
    get state() {
      return {
        enabled: engine.state.search.infiniteScrollingEnabled,
        isLoading: engine.state.search.isLoading,
      };
    },
    enableInfiniteScrolling() {
      dispatch(enableInfiniteScrolling());
    },
    disableInfiniteScrolling() {
      dispatch(disableInfiniteScrolling());
    },
    async fetchMoreResults() {
      await dispatch(executeSearch(logFetchMoreResults()));
    },
  };
};
