import {createStaticState} from '../controller-utils.js';
import type {SearchCompletedAction} from '../types/build.js';
import type {AugmentedControllerDefinition} from '../types/controller-definition.js';
import type {
  FetchStaticStateFunction,
  FetchStaticStateParameters,
  SearchControllerDefinitionsMap,
  SearchEngineDefinitionOptions,
} from '../types/engine.js';
import {buildFactory} from './build-factory.js';

/**
 * Factory function for creating a standalone static state fetcher.
 * Unlike the regular static state factory, this does not execute a search on the server.
 * This is useful for pages with standalone components (like search boxes) that only need
 * controller initialization without server-side search execution.
 */
export function fetchStandaloneStaticStateFactory<
  TControllerDefinitions extends SearchControllerDefinitionsMap,
>(
  controllerDefinitions: AugmentedControllerDefinition<TControllerDefinitions>,
  options: SearchEngineDefinitionOptions<TControllerDefinitions>
): FetchStaticStateFunction<TControllerDefinitions> {
  return async (params: FetchStaticStateParameters<TControllerDefinitions>) => {
    const {controllers} = await buildFactory(
      controllerDefinitions,
      options
    )(params);

    const searchActions: SearchCompletedAction[] = [];

    const staticState = createStaticState<
      SearchCompletedAction,
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
