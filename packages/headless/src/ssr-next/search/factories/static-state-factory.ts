import {toSerializableNavigatorContext} from '../../common/serializable-navigator-context.js';
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

export function fetchStaticStateFactory<
  TControllerDefinitions extends SearchControllerDefinitionsMap,
>(
  controllerDefinitions: AugmentedControllerDefinition<TControllerDefinitions>,
  options: SearchEngineDefinitionOptions<TControllerDefinitions>
): FetchStaticStateFunction<TControllerDefinitions> {
  return async (params: FetchStaticStateParameters<TControllerDefinitions>) => {
    const {engine, controllers} = await buildFactory(controllerDefinitions, options)(params);

    engine.executeFirstSearch();
    const searchActions = [await engine.waitForSearchCompletedAction()];

    const staticState = createStaticState<SearchCompletedAction, TControllerDefinitions>({
      searchActions,
      controllers,
    });

    const {controllers: controllerProps, ...restParams} = params as {
      controllers?: Record<string, unknown>;
    } & typeof params;

    return {
      ...restParams,
      ...staticState,
      navigatorContext: toSerializableNavigatorContext(params.navigatorContext),
      ...(controllerProps && {controllerProps}),
    };
  };
}
