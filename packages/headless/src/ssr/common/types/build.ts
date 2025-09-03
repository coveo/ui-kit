import type {CoreEngine, CoreEngineNext} from '../../../app/engine.js';
import type {ControllersMap, ControllersPropsMap} from './controllers.js';
import type {
  EngineDefinitionBuildResult,
  EngineDefinitionControllersPropsOption,
} from './engine.js';
import type {OptionsExtender, OptionsTuple} from './utilities.js';

interface BuildOptions<TEngineOptions> {
  /**
   * @deprecated This option will be removed in the next major version.
   */
  extend?: OptionsExtender<TEngineOptions>;
}

// TODO: KIT-4610: Remove this type
export type Build<
  TEngine extends CoreEngine | CoreEngineNext,
  TEngineOptions,
  TControllersMap extends ControllersMap,
  TControllersProps extends ControllersPropsMap,
> = (
  ...params: OptionsTuple<
    BuildOptions<TEngineOptions> &
      EngineDefinitionControllersPropsOption<TControllersProps>
  >
) => Promise<EngineDefinitionBuildResult<TEngine, TControllersMap>>;
