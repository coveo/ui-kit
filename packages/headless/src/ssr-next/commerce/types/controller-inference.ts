import type {Controller} from '../../../controllers/controller/headless-controller.js';
import type {InferHydratedState, InferStaticState} from '../../common/types/engine.js';
import type {HasKey} from '../../common/types/utilities.js';
import type {SolutionType} from './controller-constants.js';
import type {ControllerDefinition, ControllerDefinitionsMap} from './controller-definitions.js';

export type {InferHydratedState, InferStaticState};

export type InferControllerFromDefinition<TDefinition extends ControllerDefinition<Controller>> =
  TDefinition extends ControllerDefinition<infer TController> ? TController : never;

/**
 * The names of the controller definitions that are available to the solution type.
 */
/**
 * The names of the baked-in controllers built for the solution type: `cart` and `context` always, and
 * `parameterManager` for search and listing. The universal names are known even while the solution
 * type is a type parameter.
 */
export type BakedInControllerNames<TSolutionType extends SolutionType> =
  | 'cart'
  | 'context'
  | (TSolutionType extends SolutionType.search | SolutionType.listing ? 'parameterManager' : never);

export type AvailableControllerNames<TDefinitions, TSolutionType extends SolutionType> = {
  [K in keyof TDefinitions]: HasKey<TDefinitions[K], TSolutionType> extends never ? never : K;
}[keyof TDefinitions];

export type InferControllersMapFromDefinition<
  TControllers extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
> = {
  [
    K in keyof TControllers as HasKey<TControllers[K], TSolutionType> extends never ? never : K
  ]: InferControllerFromDefinition<TControllers[K]>;
};
