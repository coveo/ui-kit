import {ControllersMap} from '../../ssr-engine/types/common.js';
import {SSRCommerceEngine} from '../factories/build-factory.js';
import {EngineDefinitionBuildResult} from './common.js';

export interface FromBuildResultOptions<TControllers extends ControllersMap> {
  /**
   * The build result of the engine
   */
  buildResult: EngineDefinitionBuildResult<SSRCommerceEngine, TControllers>;
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
  TControllers extends ControllersMap,
  TOptions,
  TReturn,
> {
  (options: FromBuildResultOptions<TControllers> & TOptions): Promise<TReturn>;
}
