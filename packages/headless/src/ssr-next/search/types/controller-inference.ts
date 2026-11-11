import type {CoreEngine, CoreEngineNext} from '../../../app/engine.js';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import type {InferControllerStaticStateFromController} from '../../common/types/controller-inference.js';
import type {ControllerDefinition, ControllerDefinitionsMap} from './controller-definition.js';

export type InferControllerFromDefinition<
  TDefinition extends ControllerDefinition<CoreEngine | CoreEngineNext, Controller>,
> = TDefinition extends ControllerDefinition<infer _, infer TController> ? TController : never;

export type InferControllersMapFromDefinition<
  TControllers extends ControllerDefinitionsMap<CoreEngine | CoreEngineNext, Controller>,
> = {[K in keyof TControllers]: InferControllerFromDefinition<TControllers[K]>};

export type InferControllerStaticStateMapFromDefinitions<
  TControllers extends ControllerDefinitionsMap<CoreEngine | CoreEngineNext, Controller>,
> = {
  [K in keyof TControllers]: InferControllerStaticStateFromController<
    InferControllerFromDefinition<TControllers[K]>
  >;
};
