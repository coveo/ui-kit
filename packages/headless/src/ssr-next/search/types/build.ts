import type {NavigatorContext} from '../../../app/navigator-context-provider.js';
import type {SearchEngine} from '../../../app/search-engine/search-engine.js';
import type {LegacySearchAction} from '../../../features/analytics/analytics-utils.js';
import type {SearchParameterManagerInitialState} from '../controllers/search-parameter-manager/headless-search-parameter-manager.ssr.js';

/**
 * The SSR search engine.
 *
 * @group Engine
 */
export interface SSRSearchEngine extends SearchEngine {
  /**
   * Waits for the search to be completed and returns a promise that resolves to a `SearchCompletedAction`.
   */
  waitForSearchCompletedAction(): Promise<SearchCompletedAction>;
}

export type SearchCompletedAction = ReturnType<
  LegacySearchAction['fulfilled' | 'rejected']
>;

export type BuildConfig = {
  navigatorContext: NavigatorContext;
  searchParams?: SearchParameterManagerInitialState['parameters'];
  /**
   * Whether to skip executing the search on the server side.
   * When true, the engine initializes without executing a search,
   * useful for standalone search boxes that only need query suggestions.
   * @defaultValue `false`
   */
  skipSearch?: boolean;
};
