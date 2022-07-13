import {
  buildCoreTab,
  Tab,
  TabProps,
  TabState,
  TabInitialState,
  TabOptions,
} from '../../core/tab/headless-core-tab';
import {InsightEngine} from '../../../app/insight-engine/insight-engine';
import {logInsightInterfaceChange} from '../../../features/analytics/analytics-actions';
import {executeSearch} from '../../../features/insight-search/insight-search-actions';

export type {Tab, TabProps, TabState, TabInitialState, TabOptions};
/**
 * Creates an insight `Tab` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `Tab` properties.
 * @returns An insight `Tab` controller instance.
 */
export function buildTab(engine: InsightEngine, props: TabProps): Tab {
  const controller = buildCoreTab(engine, props);
  const {dispatch} = engine;

  return {
    ...controller,

    select() {
      controller.select();
      dispatch(executeSearch(logInsightInterfaceChange()));
    },

    get state() {
      return {
        ...controller.state,
      };
    },
  };
}
