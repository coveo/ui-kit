import type {CoreEngine, CoreEngineNext} from '../../../app/engine.js';
import type {
  ControllersMap,
  ControllersPropsMap,
  EngineDefinitionBuildResult,
  EngineDefinitionControllersPropsOption,
  OptionsExtender,
  OptionsTuple,
} from './common.js';

interface BuildOptions<TEngineOptions> {
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
