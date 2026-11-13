import type {Controller} from '../../../controllers/controller/headless-controller.js';
import type {HasKey} from '../../common/types/utilities.js';
import type {SSRCommerceEngine} from '../factories/build-factory.js';
import type {SolutionType} from './controller-constants.js';
import type {
  AugmentedControllerDefinition,
  ControllerDefinitionsMap,
} from './controller-definitions.js';
import type {InferControllerFromDefinition} from './controller-inference.js';

/**
 * The engine and the live controllers returned by `hydrateStaticState()`.
 *
 * @typeParam TControllers - The controllers of the engine definition.
 * @typeParam TSolutionType - The kind of page the engine definition serves.
 */
export interface CommerceHydratedState<
  TControllers extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
> {
  engine: SSRCommerceEngine;
  /**
   * The live controllers of the page, by name: the controllers of the engine definition that are
   * available to the solution type, and the baked-in ones (`context` and `cart` everywhere,
   * `parameterManager` for search and listing).
   */
  controllers: {
    [
      K in keyof AugmentedControllerDefinition<TControllers> as HasKey<
        AugmentedControllerDefinition<TControllers>[K],
        TSolutionType
      > extends never
        ? never
        : K
    ]: InferControllerFromDefinition<AugmentedControllerDefinition<TControllers>[K]>;
  };
}
