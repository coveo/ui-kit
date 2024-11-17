import type {Controller} from '../../../controllers/controller/headless-controller.js';
import type {CoreEngine, CoreEngineNext} from '../../engine.js';
import type {
  ControllersMap,
  ControllersPropsMap,
  EngineDefinitionBuildResult,
  OptionsExtender,
  OptionsTuple,
} from '../../ssr-engine/types/common.js';
import {
  ControllerDefinitionsMap,
  EngineDefinitionControllersPropsOption,
  SolutionType,
} from './common.js';

export interface BuildOptions<TEngineOptions> {
  extend?: OptionsExtender<TEngineOptions>;
}

export type Build<
  TEngine extends CoreEngine | CoreEngineNext,
  TEngineOptions,
  TControllersMap extends ControllersMap,
  TControllersProps extends ControllersPropsMap,
  TControllersDefinitionsMap extends ControllerDefinitionsMap<
    TEngine,
    Controller
  >,
  TSolutionType extends SolutionType,
> = TSolutionType extends SolutionType.recommendation
  ? {
      /**
       * Initializes an engine and controllers from the definition.
       */
      (
        controllers: (keyof TControllersMap)[]
      ): Promise<EngineDefinitionBuildResult<TEngine, TControllersMap>>;
    }
  : {
      /**
       * Initializes an engine and controllers from the definition.
       */
      (
        ...params: OptionsTuple<
          BuildOptions<TEngineOptions> &
            EngineDefinitionControllersPropsOption<
              TControllersDefinitionsMap,
              TControllersProps,
              TSolutionType
            >
        >
      ): Promise<EngineDefinitionBuildResult<TEngine, TControllersMap>>;
    };
