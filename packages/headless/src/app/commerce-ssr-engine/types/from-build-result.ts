import {CoreEngine, CoreEngineNext} from '../../engine.js';
import {ControllersMap} from '../../ssr-engine/types/common.js';
import {EngineDefinitionBuildResult} from './common.js';

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
   * If a recommendation key defined in your engine definition is present in this list, the associate recommendation controller
   * will query the API.
   *
   * This is applicable only if the engine is a recommendation engine.
   */
  allowedRecommendationKeys?: (keyof TControllers)[];
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
