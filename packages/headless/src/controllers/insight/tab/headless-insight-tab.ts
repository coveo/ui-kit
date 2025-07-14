import type {InsightEngine} from '../../../app/insight-engine/insight-engine.js';
import {interfaceChange} from '../../../features/analytics/analytics-actions.js';
import {executeSearch} from '../../../features/insight-search/insight-search-actions.js';
import {logInsightInterfaceChange} from '../../../features/insight-search/insight-search-analytics-actions.js';
import {
  buildCoreTab,
  type Tab,
  type TabInitialState,
  type TabOptions,
  type TabProps,
  type TabState,
} from '../../core/tab/headless-core-tab.js';

export type {Tab, TabProps, TabState, TabInitialState, TabOptions};

/**
 * Creates an insight `Tab` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `Tab` properties.
 * @returns An insight `Tab` controller instance.
 *
 * @group Controllers
 * @category Tab
 */
export function buildTab(engine: InsightEngine, props: TabProps): Tab {
  const {dispatch} = engine;
  const tab = buildCoreTab(engine, props);
  const search = () =>
    dispatch(
      executeSearch({
        legacy: logInsightInterfaceChange(),
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
