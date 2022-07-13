import {executeSearch} from '../../features/search/search-actions';
import {logInterfaceChange} from '../../features/analytics/analytics-actions';
import {
  buildCoreTab,
  Tab,
  TabProps,
  TabState,
  TabInitialState,
  TabOptions,
} from '../core/tab/headless-core-tab';
import {SearchEngine} from '../../app/search-engine/search-engine';

export type {Tab, TabProps, TabState, TabInitialState, TabOptions};
/**
 * Creates a `Tab` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `Tab` properties.
 * @returns A `Tab` controller instance.
 */
export function buildTab(engine: SearchEngine, props: TabProps): Tab {
  const controller = buildCoreTab(engine, props);
  const {dispatch} = engine;

  return {
    ...controller,

    select() {
      controller.select();
      dispatch(executeSearch(logInterfaceChange()));
    },

    get state() {
      return {
        ...controller.state,
      };
    },
  };
}
