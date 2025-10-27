import type {UnknownAction} from '@reduxjs/toolkit';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import {createStaticState} from '../controller-utils.js';
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

export function fetchStaticStateFactory<
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
>['fetchStaticState'] {
  return async (params) => {
    const {engine, controllers} = await buildFactory(
      controllerDefinitions,
      options
    )(params);

    engine.executeFirstSearch();
    const searchActions = [await engine.waitForSearchCompletedAction()];

    const staticState = createStaticState<
      UnknownAction,
      TControllerDefinitions
    >({
      searchActions,
      controllers,
    });

    return {
      ...params,
      ...staticState,
    };
  };
}
