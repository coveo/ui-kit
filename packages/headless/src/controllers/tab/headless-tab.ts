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
  const {dispatch} = engine;
  const tab = buildCoreTab(engine, props);
  const search = () => dispatch(executeSearch(logInterfaceChange()));

  return {
    ...tab,

    get state() {
      return tab.state;
    },

    select() {
      tab.select();
      search();
    },
  };
}
