import {SearchEngine} from '../../app/search-engine/search-engine';
import {
  TabManager,
  TabManagerState,
  buildCoreTabManager,
} from '../core/tab-manager/headless-core-tab-manager';

export type {TabManager, TabManagerState};

export function buildTabManager(engine: SearchEngine): TabManager {
  const tabManager = buildCoreTabManager(engine);

  return {
    ...tabManager,

    get state() {
      return tabManager.state;
    },
  };
}
