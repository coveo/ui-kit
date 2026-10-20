import type {Controller} from '../../../controllers/controller/headless-controller.js';
import type {SSRSearchEngine} from '../types/build.js';
import type {
  AugmentedControllerDefinition,
  ControllerDefinitionsMap,
} from '../types/controller-definition.js';
import type {
  HydrateStaticStateFunction,
  HydrateStaticStateParameters,
  SearchEngineDefinitionOptions,
} from '../types/engine.js';
import {buildFactory} from './build-factory.js';

export function hydratedStaticStateFactory<
  TControllerDefinitions extends ControllerDefinitionsMap<SSRSearchEngine, Controller>,
>(
  controllerDefinitions: AugmentedControllerDefinition<TControllerDefinitions>,
  options: SearchEngineDefinitionOptions<TControllerDefinitions>
): HydrateStaticStateFunction<TControllerDefinitions> {
  return async (params: HydrateStaticStateParameters<TControllerDefinitions>) => {
    const {controllerProps, ...restParams} = params;

    const paramsWithControllerProps = {
      ...restParams,
      ...(controllerProps && {controllers: controllerProps}),
    } as HydrateStaticStateParameters<TControllerDefinitions>;

    const {engine, controllers} = await buildFactory(
      controllerDefinitions,
      options
    )(paramsWithControllerProps);

    if (params.searchActions.length > 0) {
      await engine.waitForSearchCompletedAction();
    }

    return {engine, controllers};
  };
}
