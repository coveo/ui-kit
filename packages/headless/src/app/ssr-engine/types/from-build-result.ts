import {CoreEngine, CoreEngineNext} from '../../engine.js';
import {ControllersMap, EngineDefinitionBuildResult} from './common.js';

export interface FromBuildResultOptions<
  TEngine extends CoreEngine | CoreEngineNext,
  TControllers extends ControllersMap,
> {
  /**
   * The build result of the engine
   */
  buildResult: EngineDefinitionBuildResult<TEngine, TControllers>;
  /**
   * An optional array of keys representing the recommendation controllers to refresh.
   * If a recommendation key defined in your engine definition is present in this list, a recommendation query will be triggered against the API.
   * This is applicable only if the engine is a recommendation engine.
   */
  recommendationControllerKeys?: (keyof TControllers)[];
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
