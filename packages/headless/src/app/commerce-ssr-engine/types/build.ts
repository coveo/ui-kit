import type {CoreEngine, CoreEngineNext} from '../../engine.js';
import type {
  ControllersMap,
  ControllersPropsMap,
  EngineDefinitionBuildResult,
  EngineDefinitionControllersPropsOption,
  OptionsExtender,
  OptionsTuple,
} from '../../ssr-engine/types/common.js';
import {SolutionType} from './common.js';

export interface BuildOptions<TEngineOptions> {
  extend?: OptionsExtender<TEngineOptions>;
}

export type Build<
  TEngine extends CoreEngine | CoreEngineNext,
  TEngineOptions,
  TControllersMap extends ControllersMap,
  TControllersProps extends ControllersPropsMap,
  TSolutionType extends SolutionType,
> = TSolutionType extends SolutionType.recommendation
  ? {
      /**
       * Initializes an engine and controllers from the definition.
       */
      (
        c: (keyof TControllersMap)[]
      ): Promise<EngineDefinitionBuildResult<TEngine, TControllersMap>>;
    }
  : {
      /**
       * Initializes an engine and controllers from the definition.
       */
      (
        ...params: OptionsTuple<
          BuildOptions<TEngineOptions> &
            EngineDefinitionControllersPropsOption<TControllersProps>
        >
      ): Promise<EngineDefinitionBuildResult<TEngine, TControllersMap>>;
    };
