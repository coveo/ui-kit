import type {Controller} from '../../../controllers/controller/headless-controller.js';
import type {InferHydratedState, InferStaticState} from '../../common/types/engine.js';
import type {HasKey} from '../../common/types/utilities.js';
import type {SolutionType} from './controller-constants.js';
import type {
  ControllerDefinition,
  ControllerDefinitionsMap,
  InferControllerStaticStateFromController,
} from './controller-definitions.js';

export type {InferHydratedState, InferStaticState};

export type InferControllerFromDefinition<TDefinition extends ControllerDefinition<Controller>> =
  TDefinition extends ControllerDefinition<infer TController> ? TController : never;

export type InferControllersMapFromDefinition<
  TControllers extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
> = {
  [
    K in keyof TControllers as HasKey<TControllers[K], TSolutionType> extends never ? never : K
  ]: InferControllerFromDefinition<TControllers[K]>;
};

export type InferControllerStaticStateMapFromDefinitionsWithSolutionType<
  TControllers extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
> = {
  [
    K in keyof TControllers as HasKey<TControllers[K], TSolutionType> extends never ? never : K
  ]: InferControllerStaticStateFromController<InferControllerFromDefinition<TControllers[K]>>;
};
