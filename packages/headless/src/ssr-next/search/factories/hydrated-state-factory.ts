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
import type {BuildParameters} from '../types/build.js';
import {buildFactory} from './build-factory.js';

export function hydratedStaticStateFactory<
  TControllerDefinitions extends ControllerDefinitionsMap<SSRSearchEngine, Controller>,
>(
  controllerDefinitions: AugmentedControllerDefinition<TControllerDefinitions>,
  options: SearchEngineDefinitionOptions<TControllerDefinitions>
): HydrateStaticStateFunction<TControllerDefinitions> {
  return async (params: HydrateStaticStateParameters<TControllerDefinitions>) => {
    const {controllerProps, ...restParams} = params;

    const buildParameters: BuildParameters = {
      ...restParams,
      ...(controllerProps && {controllers: controllerProps}),
    };

    const {engine, controllers} = await buildFactory(
      controllerDefinitions,
      options
    )(buildParameters);

    if (params.searchActions.length > 0) {
      await engine.waitForSearchCompletedAction();
    }

    return {engine, controllers};
  };
}
