import {InsightEngine} from '../../../app/insight-engine/insight-engine';
import {executeSearch} from '../../../features/insight-search/insight-search-actions';
import {logInsightInterfaceChange} from '../../../features/insight-search/insight-search-analytics-actions';
import {
  buildCoreTab,
  Tab,
  TabProps,
  TabState,
  TabInitialState,
  TabOptions,
} from '../../core/tab/headless-core-tab';

export type {Tab, TabProps, TabState, TabInitialState, TabOptions};

/**
 * Creates an insight `Tab` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `Tab` properties.
 * @returns An insight `Tab` controller instance.
 */
export function buildTab(engine: InsightEngine, props: TabProps): Tab {
  const {dispatch} = engine;
  const tab = buildCoreTab(engine, props);
  const search = () => dispatch(executeSearch(logInsightInterfaceChange()));

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
