import type {SSRSearchEngine} from './build.js';
import type {AugmentedControllerDefinition} from './controller-definition.js';
import type {InferControllerFromDefinition} from './controller-inference.js';
import type {SearchControllerDefinitionsMap} from './engine.js';

/**
 * The engine and the live controllers returned by `hydrateStaticState()`.
 *
 * @typeParam TControllers - The controllers of the engine definition.
 */
export interface SearchHydratedState<TControllers extends SearchControllerDefinitionsMap> {
  engine: SSRSearchEngine;
  /**
   * The live controllers of the page, by name: the controllers of the engine definition, and the
   * baked-in ones (`parameterManager` and `context`).
   */
  controllers: {
    [K in keyof AugmentedControllerDefinition<TControllers>]: InferControllerFromDefinition<
      AugmentedControllerDefinition<TControllers>[K]
    >;
  };
}
