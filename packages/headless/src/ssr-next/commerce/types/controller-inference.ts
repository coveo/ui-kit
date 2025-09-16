import type {Controller} from '../../../controllers/controller/headless-controller.js';
import type {
  InferHydratedState,
  InferStaticState,
} from '../../common/types/engine.js';
import type {HasKey, HasKeys} from '../../common/types/utilities.js';
import type {SolutionType} from './controller-constants.js';
import type {
  ControllerDefinition,
  ControllerDefinitionsMap,
  ControllerDefinitionWithoutProps,
  ControllerDefinitionWithProps,
  InferControllerStaticStateFromController,
} from './controller-definitions.js';

export type {InferStaticState, InferHydratedState};

type InferControllerPropsFromDefinition<
  TController extends ControllerDefinition<Controller>,
> = TController extends ControllerDefinitionWithProps<Controller, infer Props>
  ? Props
  : TController extends ControllerDefinitionWithoutProps<Controller>
    ? {}
    : unknown;

export type InferControllerPropsMapFromDefinitions<
  TControllers extends ControllerDefinitionsMap<Controller>,
> = {
  [K in keyof TControllers as HasKeys<
    InferControllerPropsFromDefinition<TControllers[K]>
  > extends false
    ? never
    : K]: InferControllerPropsFromDefinition<TControllers[K]>;
};

export type InferControllerFromDefinition<
  TDefinition extends ControllerDefinition<Controller>,
> = TDefinition extends ControllerDefinition<infer TController>
  ? TController
  : never;

export type InferControllersMapFromDefinition<
  TControllers extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
> = {
  [K in keyof TControllers as HasKey<
    TControllers[K],
    TSolutionType
  > extends never
    ? never
    : K]: InferControllerFromDefinition<TControllers[K]>;
};

export type InferControllerStaticStateMapFromDefinitionsWithSolutionType<
  TControllers extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
> = {
  [K in keyof TControllers as HasKey<
    TControllers[K],
    TSolutionType
  > extends never
    ? never
    : K]: InferControllerStaticStateFromController<
    InferControllerFromDefinition<TControllers[K]>
  > &
    InferControllerPropsFromDefinition<TControllers[K]>;
};
