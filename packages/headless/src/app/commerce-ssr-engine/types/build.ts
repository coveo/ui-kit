import {CoreEngine, CoreEngineNext} from '../../engine.js';
import {
  ControllersMap,
  ControllersPropsMap,
  EngineDefinitionBuildResult,
  EngineDefinitionControllersPropsOption,
  OptionsExtender,
  OptionsTuple,
} from '../../ssr-engine/types/common.js';

export interface BuildOptions<TEngineOptions> {
  extend?: OptionsExtender<TEngineOptions>;
}

export interface BuildWithList<
  TEngine extends CoreEngine | CoreEngineNext,
  TControllersMap extends ControllersMap,
> {
  /**
   * Initializes an engine and controllers from the definition.
   */
  (
    c: (keyof TControllersMap)[]
  ): Promise<EngineDefinitionBuildResult<TEngine, TControllersMap>>;
}

export interface Build<
  TEngine extends CoreEngine | CoreEngineNext,
  TEngineOptions,
  TControllersMap extends ControllersMap,
  TControllersProps extends ControllersPropsMap,
> {
  /**
   * Initializes an engine and controllers from the definition.
   */
  (
    ...params: OptionsTuple<
      BuildOptions<TEngineOptions> &
        EngineDefinitionControllersPropsOption<TControllersProps>
    >
  ): Promise<EngineDefinitionBuildResult<TEngine, TControllersMap>>;
}
