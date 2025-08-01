import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import {
  interfaceChange,
  logInterfaceChange,
} from '../../features/analytics/analytics-actions.js';
import {executeSearch} from '../../features/search/search-actions.js';
import {
  buildCoreTab,
  type Tab,
  type TabInitialState,
  type TabOptions,
  type TabProps,
  type TabState,
} from '../core/tab/headless-core-tab.js';

export type {Tab, TabProps, TabState, TabInitialState, TabOptions};

/**
 * Creates a `Tab` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `Tab` properties.
 * @returns A `Tab` controller instance.
 *
 * @group Controllers
 * @category Tab
 */
export function buildTab(engine: SearchEngine, props: TabProps): Tab {
  const {dispatch} = engine;
  const tab = buildCoreTab(engine, props);
  const search = () =>
    dispatch(
      executeSearch({
        legacy: logInterfaceChange(),
        next: interfaceChange(),
      })
    );

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
