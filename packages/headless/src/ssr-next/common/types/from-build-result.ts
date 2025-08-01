import type {CoreEngine, CoreEngineNext} from '../../../app/engine.js';
import type {ControllersMap} from './controllers.js';
import type {EngineDefinitionBuildResult} from './engine.js';

export interface FromBuildResultOptions<
  TEngine extends CoreEngine | CoreEngineNext,
  TControllers extends ControllersMap,
> {
  buildResult: EngineDefinitionBuildResult<TEngine, TControllers>;
  allowedRecommendationKeys?: (keyof TControllers)[];
}

// TODO: KIT-4610: Remove this type
export type FromBuildResult<
  TEngine extends CoreEngine | CoreEngineNext,
  TControllers extends ControllersMap,
  TOptions,
  TReturn,
> = (
  options: FromBuildResultOptions<TEngine, TControllers> & TOptions
) => Promise<TReturn>;
