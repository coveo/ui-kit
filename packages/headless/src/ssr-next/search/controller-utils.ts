import type {UnknownAction} from '@reduxjs/toolkit';
import type {CoreEngine, CoreEngineNext} from '../../app/engine.js';
import type {Controller} from '../../controllers/controller/headless-controller.js';
import {clone, mapObject} from '../../utils/utils.js';
import type {BuildConfig} from './types/build.js';
import type {ControllerDefinitionsMap} from './types/controller-definition.js';
import type {InferControllersMapFromDefinition} from './types/controller-inference.js';
import type {SearchControllerDefinitionsMap} from './types/engine.js';
import type {SearchStaticState} from './types/fetch-static-state.js';

/**
 * Builds every controller of the definition with the page facts of the request.
 */
export function buildControllerDefinitions<
  TControllerDefinitionsMap extends ControllerDefinitionsMap<
    CoreEngine | CoreEngineNext,
    Controller
  >,
  TEngine extends CoreEngine | CoreEngineNext,
>({
  definitionsMap,
  engine,
  buildConfig,
}: {
  definitionsMap: TControllerDefinitionsMap;
  engine: TEngine;
  buildConfig: BuildConfig;
}): InferControllersMapFromDefinition<TControllerDefinitionsMap> {
  return mapObject(definitionsMap, (definition) =>
    definition.build(engine, {buildConfig})
  ) as InferControllersMapFromDefinition<TControllerDefinitionsMap>;
}

export function createStaticState<
  TSearchAction extends UnknownAction,
  TControllerDefinitions extends SearchControllerDefinitionsMap,
>({
  searchActions,
  controllers,
}: {
  searchActions: TSearchAction[];
  controllers: Record<string, Controller>;
}) {
  return {
    controllers: mapObject(controllers, (controller) => ({
      state: clone(controller.state),
    })) as SearchStaticState<TControllerDefinitions>['controllers'],
    searchActions: clone(searchActions),
  };
}
