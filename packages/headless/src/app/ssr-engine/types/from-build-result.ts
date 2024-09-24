import {CoreEngine, CoreEngineNext} from '../../engine.js';
import {ControllersMap, EngineDefinitionBuildResult} from './common.js';

export interface FromBuildResultOptions<
  TEngine extends CoreEngine | CoreEngineNext,
  TControllers extends ControllersMap,
> {
  buildResult: EngineDefinitionBuildResult<TEngine, TControllers>;
}

export interface FromBuildResult<
  TEngine extends CoreEngine | CoreEngineNext,
  TControllers extends ControllersMap,
  TOptions,
  TReturn,
> {
  (
    options: FromBuildResultOptions<TEngine, TControllers> & TOptions
  ): Promise<TReturn>;
}
