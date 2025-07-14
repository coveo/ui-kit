import type {CoreEngine, CoreEngineNext} from '../../engine.js';
import type {ControllersMap, EngineDefinitionBuildResult} from './common.js';

export interface FromBuildResultOptions<
  TEngine extends CoreEngine | CoreEngineNext,
  TControllers extends ControllersMap,
> {
  buildResult: EngineDefinitionBuildResult<TEngine, TControllers>;
  allowedRecommendationKeys?: (keyof TControllers)[];
}

export type FromBuildResult<
  TEngine extends CoreEngine | CoreEngineNext,
  TControllers extends ControllersMap,
  TOptions,
  TReturn,
> = (
  options: FromBuildResultOptions<TEngine, TControllers> & TOptions
) => Promise<TReturn>;
