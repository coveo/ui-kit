import type {CoreEngine, CoreEngineNext} from '../../../app/engine.js';
import type {
  ControllersMap,
  ControllersPropsMap,
} from '../../common/types/controllers.js';
import type {
  SearchEngineDefinitionBuildResult,
  SearchEngineDefinitionControllersPropsOption,
} from './engine.js';

export type BuildParameters<TControllersProps extends ControllersPropsMap> =
  SearchEngineDefinitionControllersPropsOption<TControllersProps>;

/**
 * @internal
 */
export type Build<
  TEngine extends CoreEngine | CoreEngineNext,
  TControllersMap extends ControllersMap,
  TControllersProps extends ControllersPropsMap,
> = (
  props: BuildParameters<TControllersProps>
) => Promise<SearchEngineDefinitionBuildResult<TEngine, TControllersMap>>;
