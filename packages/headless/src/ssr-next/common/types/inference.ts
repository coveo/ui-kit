import type {CoreEngine, CoreEngineNext} from '../../../app/engine.js';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import type {
  ControllerDefinition,
  ControllerDefinitionsMap,
  ControllerDefinitionWithoutProps,
  ControllerDefinitionWithProps,
  ControllerStaticState,
  ControllersMap,
} from './controllers.js';
import type {HasKeys} from './utilities.js';

export type InferControllerPropsFromDefinition<
  TController extends ControllerDefinition<
    CoreEngine | CoreEngineNext,
    Controller
  >,
> = TController extends ControllerDefinitionWithProps<
  CoreEngine | CoreEngineNext,
  Controller,
  infer Props
>
  ? Props
  : TController extends ControllerDefinitionWithoutProps<
        CoreEngine | CoreEngineNext,
        Controller
      >
    ? {}
    : unknown;

export type InferControllerPropsMapFromDefinitions<
  TControllers extends ControllerDefinitionsMap<
    CoreEngine | CoreEngineNext,
    Controller
  >,
> = {
  [K in keyof TControllers as HasKeys<
    InferControllerPropsFromDefinition<TControllers[K]>
  > extends false
    ? never
    : K]: InferControllerPropsFromDefinition<TControllers[K]>;
};

export type InferControllerFromDefinition<
  TDefinition extends ControllerDefinition<
    CoreEngine | CoreEngineNext,
    Controller
  >,
> = TDefinition extends ControllerDefinition<infer _, infer TController>
  ? TController
  : never;

export type InferControllersMapFromDefinition<
  TControllers extends ControllerDefinitionsMap<
    CoreEngine | CoreEngineNext,
    Controller
  >,
> = {[K in keyof TControllers]: InferControllerFromDefinition<TControllers[K]>};

export type InferControllerStaticStateFromController<
  TController extends Controller,
> = ControllerStaticState<TController['state']>;

export type InferControllerStaticStateMapFromDefinitions<
  TControllers extends ControllerDefinitionsMap<
    CoreEngine | CoreEngineNext,
    Controller
  >,
> = {
  [K in keyof TControllers]: InferControllerStaticStateFromController<
    InferControllerFromDefinition<TControllers[K]>
  >;
};

export type InferControllerStaticStateMapFromControllers<
  TControllers extends ControllersMap,
> = {
  [K in keyof TControllers]: InferControllerStaticStateFromController<
    TControllers[K]
  >;
};
