import type {SearchEngine} from '../../../app/search-engine/search-engine.js';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import type {ControllerDefinitionsMap} from '../../common/types/controllers.js';
import type {
  BuildParameters,
  HydrateStaticStateParameters,
  SearchEngineDefinitionOptions,
} from '../types/engine.js';
import {buildFactory} from './build.js';

export function hydratedStaticStateFactory<
  TControllerDefinitions extends ControllerDefinitionsMap<
    SearchEngine,
    Controller
  >,
>(
  controllerDefinitions: TControllerDefinitions | undefined,
  options: SearchEngineDefinitionOptions<TControllerDefinitions>
) {
  return async (
    ...params: HydrateStaticStateParameters<TControllerDefinitions>
  ) => {
    const searchEngineFactory = buildFactory(controllerDefinitions, options);
    const {engine, controllers} = await searchEngineFactory(
      ...(params as BuildParameters<TControllerDefinitions>)
    );
    engine.dispatch(params[0]!.searchAction);
    await engine.waitForSearchCompletedAction();
    return {engine, controllers};
  };
}
