import type {ControllersMap} from '../../common/types/controllers.js';
import type {SSRCommerceEngine} from '../factories/build-factory.js';
import type {EngineDefinitionBuildResult} from './controller-definitions.js';

/**
 * @deprecated This type is deprecated and will be removed in future major version.
 */
interface FromBuildResultOptions<TControllers extends ControllersMap> {
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
  allowedRecommendationKeys?: string[];
}

/**
 * @deprecated This type is deprecated and will be removed in future major version.
 */
export type FromBuildResult<
  TControllers extends ControllersMap,
  TOptions,
  TReturn,
> = (
  options: FromBuildResultOptions<TControllers> & TOptions
) => Promise<TReturn>;
