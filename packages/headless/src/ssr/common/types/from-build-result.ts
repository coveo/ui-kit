import type {CoreEngine, CoreEngineNext} from '../../../app/engine.js';
import type {ControllersMap} from './controllers.js';
import type {EngineDefinition, EngineDefinitionBuildResult} from './engine.js';

/**
 * @deprecated This type is deprecated and will be removed in a future version.
 * {@link EngineDefinition.build} will be removed in a future version.
 */
export interface FromBuildResultOptions<
  TEngine extends CoreEngine | CoreEngineNext,
  TControllers extends ControllersMap,
> {
  buildResult: EngineDefinitionBuildResult<TEngine, TControllers>;
  allowedRecommendationKeys?: (keyof TControllers)[];
}

/**
 * @deprecated This type is deprecated and will be removed in a future version.
 * {@link EngineDefinition.build} will be removed in a future version.
 */
export type FromBuildResult<
  TEngine extends CoreEngine | CoreEngineNext,
  TControllers extends ControllersMap,
  TOptions,
  TReturn,
> = (
  options: FromBuildResultOptions<TEngine, TControllers> & TOptions
) => Promise<TReturn>;
