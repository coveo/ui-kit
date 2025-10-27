import type {Controller} from '../../../controllers/controller/headless-controller.js';
import type {SSRSearchEngine} from '../types/build.js';
import type {
  AugmentedControllerDefinition,
  ControllerDefinitionsMap,
} from '../types/controller-definition.js';
import type {
  SearchEngineDefinition,
  SearchEngineDefinitionOptions,
} from '../types/engine.js';
import {buildFactory} from './build-factory.js';

export function hydratedStaticStateFactory<
  TControllerDefinitions extends ControllerDefinitionsMap<
    SSRSearchEngine,
    Controller
  >,
>(
  controllerDefinitions: AugmentedControllerDefinition<TControllerDefinitions>,
  options: SearchEngineDefinitionOptions<TControllerDefinitions>
): SearchEngineDefinition<
  SSRSearchEngine,
  TControllerDefinitions
>['hydrateStaticState'] {
  return async (params) => {
    const {engine, controllers} = await buildFactory(
      controllerDefinitions,
      options
    )(params);

    params.searchActions.forEach((action) => {
      engine.dispatch(action);
    });

    await engine.waitForSearchCompletedAction();

    return {engine, controllers};
  };
}
