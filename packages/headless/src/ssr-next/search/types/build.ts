import type {CoreEngine, CoreEngineNext} from '../../../app/engine.js';
import type {NavigatorContextProvider} from '../../../app/navigator-context-provider.js';
import type {
  ControllersMap,
  ControllersPropsMap,
} from '../../common/types/controllers.js';
import type {
  SearchEngineDefinitionBuildResult,
  SearchEngineDefinitionControllersPropsOption,
} from './engine.js';

export type BuildConfig = {
  navigatorContextProvider: NavigatorContextProvider;
};

/**
 * @internal
 */
export type Build<
  TEngine extends CoreEngine | CoreEngineNext,
  TControllersMap extends ControllersMap,
  TControllersProps extends ControllersPropsMap,
> = (
  props: SearchEngineDefinitionControllersPropsOption<TControllersProps>
) => Promise<SearchEngineDefinitionBuildResult<TEngine, TControllersMap>>;
