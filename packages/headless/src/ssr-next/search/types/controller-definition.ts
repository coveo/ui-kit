import type {CoreEngine, CoreEngineNext} from '../../../app/engine.js';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import type {
  InferControllerStaticStateFromController,
  InferControllerStaticStateMapFromControllers,
} from '../../common/types/controller-inference.js';
import type {
  InferHydratedState,
  InferStaticState,
} from '../../common/types/engine.js';
import type {SearchParameterManagerDefinition} from '../controllers/search-parameter-manager/headless-search-parameter-manager.ssr.js';

export type {
  InferStaticState,
  InferHydratedState,
  InferControllerStaticStateFromController,
  InferControllerStaticStateMapFromControllers,
};

export interface ControllerDefinitionWithoutProps<
  TEngine extends CoreEngine | CoreEngineNext,
  TController extends Controller,
> {
  /**
   * Creates an instance of the given controller.
   *
   * @param engine - The search engine.
   * @returns The controller.
   */
  build(engine: TEngine): TController;
}

export interface ControllerDefinitionWithProps<
  TEngine extends CoreEngine | CoreEngineNext,
  TController extends Controller,
  TProps,
> {
  /**
   * Creates an instance of the given controller.
   *
   * @param engine - The search engine.
   * @param props - The controller properties.
   * @returns The controller.
   */
  buildWithProps(engine: TEngine, props?: TProps): TController;
}

export type ControllerDefinition<
  TEngine extends CoreEngine | CoreEngineNext,
  TController extends Controller,
> =
  | ControllerDefinitionWithoutProps<TEngine, TController>
  | ControllerDefinitionWithProps<TEngine, TController, unknown>;

export interface ControllerDefinitionsMap<
  TEngine extends CoreEngine | CoreEngineNext,
  TController extends Controller,
> {
  [customName: string]: ControllerDefinition<TEngine, TController>;
}

type BakedInControllerDefinitions = {
  parameterManager: SearchParameterManagerDefinition;
};

/**
 * Map of baked-in controllers for search engine (runtime controllers)
 */
export type BakedInSearchControllers = {
  [K in keyof BakedInControllerDefinitions]: ReturnType<
    BakedInControllerDefinitions[K]['buildWithProps']
  >;
};

/**
 * Map of controller definitions available to the search engine definition.
 *
 * This type combines user-defined controllers with the system's baked-in controllers
 * (parameterManager).
 *
 * @template TControllerDefinitions - The controller definitions map
 */
export type AugmentedControllerDefinition<
  TControllerDefinitions extends ControllerDefinitionsMap<
    CoreEngine | CoreEngineNext,
    Controller
  >,
> = TControllerDefinitions & BakedInControllerDefinitions;
