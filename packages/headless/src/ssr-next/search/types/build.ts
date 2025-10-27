import type {CoreEngine, CoreEngineNext} from '../../../app/engine.js';
import type {NavigatorContext} from '../../../app/navigator-context-provider.js';
import type {SearchEngine} from '../../../app/search-engine/search-engine.js';
import type {LegacySearchAction} from '../../../features/analytics/analytics-utils.js';
import type {
  ControllersMap,
  ControllersPropsMap,
} from '../../common/types/controllers.js';
import type {SearchParameterManagerInitialState} from '../controllers/search-parameter-manager/headless-search-parameter-manager.ssr.js';
import type {
  SearchEngineDefinitionBuildResult,
  SearchEngineDefinitionControllersPropsOption,
} from './engine.js';

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
};

/**
 * @internal
 */
export type Build<
  TEngine extends CoreEngine | CoreEngineNext,
  TControllersMap extends ControllersMap,
  TControllersProps extends ControllersPropsMap,
> = (
  props: SearchEngineDefinitionControllersPropsOption<TControllersProps> &
    BuildConfig
) => Promise<SearchEngineDefinitionBuildResult<TEngine, TControllersMap>>;
