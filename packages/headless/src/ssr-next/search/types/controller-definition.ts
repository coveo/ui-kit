import type {CoreEngine, CoreEngineNext} from '../../../app/engine.js';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import type {InferHydratedState, InferStaticState} from '../../common/types/engine.js';
import type {ContextDefinition} from '../controllers/context/headless-context.ssr.js';
import type {SearchParameterManagerDefinition} from '../controllers/search-parameter-manager/headless-search-parameter-manager.ssr.js';
import type {ControllerBuildContext} from './build.js';

export type {InferHydratedState, InferStaticState};

/**
 * The definition of a controller: how to build it for a request.
 */
export interface ControllerDefinition<
  TEngine extends CoreEngine | CoreEngineNext,
  TController extends Controller,
> {
  /**
   * Creates an instance of the controller.
   *
   * @param engine - The engine of the request.
   * @param context - The page facts passed to `fetchStaticState()`.
   * @returns The controller.
   */
  build(engine: TEngine, context: ControllerBuildContext): TController;
}

export interface ControllerDefinitionsMap<
  TEngine extends CoreEngine | CoreEngineNext,
  TController extends Controller,
> {
  [customName: string]: ControllerDefinition<TEngine, TController>;
}

type BakedInControllerDefinitions = {
  parameterManager: SearchParameterManagerDefinition;
  context: ContextDefinition;
};

/**
 * Map of baked-in controllers for search engine (runtime controllers)
 */
export type BakedInSearchControllers = {
  [K in keyof BakedInControllerDefinitions]: ReturnType<BakedInControllerDefinitions[K]['build']>;
};

/**
 * Map of controller definitions available to the search engine definition.
 *
 * This type combines user-defined controllers with the system's baked-in controllers
 * (parameterManager and context).
 *
 * @template TControllerDefinitions - The controller definitions map
 */
export type AugmentedControllerDefinition<
  TControllerDefinitions extends ControllerDefinitionsMap<CoreEngine | CoreEngineNext, Controller>,
> = TControllerDefinitions & BakedInControllerDefinitions;
