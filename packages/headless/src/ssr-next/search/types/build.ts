import type {CoreEngine, CoreEngineNext} from '../../../app/engine.js';
import type {
  ControllersMap,
  ControllersPropsMap,
} from '../../common/types/controllers.js';
import type {
  OptionsExtender,
  OptionsTuple,
} from '../../common/types/utilities.js';
import type {
  SearchEngineDefinitionBuildResult,
  SearchEngineDefinitionControllersPropsOption,
} from './engine.js';

interface BuildOptions<TEngineOptions> {
  extend?: OptionsExtender<TEngineOptions>;
}

/**
 * @internal
 */
export type Build<
  TEngine extends CoreEngine | CoreEngineNext,
  TEngineOptions,
  TControllersMap extends ControllersMap,
  TControllersProps extends ControllersPropsMap,
> = (
  ...params: OptionsTuple<
    BuildOptions<TEngineOptions> &
      SearchEngineDefinitionControllersPropsOption<TControllersProps>
  >
) => Promise<SearchEngineDefinitionBuildResult<TEngine, TControllersMap>>;
