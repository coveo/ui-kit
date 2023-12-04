import {SearchAnalyticsProvider} from '../../api/analytics/search-analytics';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {logInterfaceChange} from '../../features/analytics/analytics-actions';
import {SearchPageEvents} from '../../features/analytics/search-action-cause';
import {executeSearch} from '../../features/search/search-actions';
import {
  buildCoreTab,
  Tab,
  TabProps,
  TabState,
  TabInitialState,
  TabOptions,
} from '../core/tab/headless-core-tab';

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
  const search = () =>
    dispatch(
      executeSearch({
        legacy: logInterfaceChange(),
        next: {
          actionCause: SearchPageEvents.interfaceChange,
          getEventExtraPayload: (state) =>
            new SearchAnalyticsProvider(
              () => state
            ).getInterfaceChangeMetadata(),
        },
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
