import type {FrankensteinEngine} from '../../app/frankenstein-engine/frankenstein-engine.js';
import {ensureSearchEngine} from '../../app/frankenstein-engine/frankenstein-engine-utils.js';
import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import {
  buildCoreTabManager,
  type TabManager,
  type TabManagerState,
} from '../core/tab-manager/headless-core-tab-manager.js';

export type {TabManager, TabManagerState};

/**
 * Creates a `Tab Manager` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `Tab Manager` properties.
 * @returns A `Tab Manager` controller instance.
 *
 * @group Controllers
 * @category TabManager
 */
export function buildTabManager(
  engine: SearchEngine | FrankensteinEngine
): TabManager {
  const tabManager = buildCoreTabManager(ensureSearchEngine(engine));

  return {
    ...tabManager,

    get state() {
      return tabManager.state;
    },
  };
}
