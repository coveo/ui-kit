import type {UnknownAction} from '@reduxjs/toolkit';
import type {CoreEngine, CoreEngineNext} from '../../app/engine.js';
import type {Controller} from '../../controllers/controller/headless-controller.js';
import {clone, mapObject} from '../../utils/utils.js';
import type {InferControllerStaticStateMapFromControllers} from '../common/types/controller-inference.js';
import type {BuildConfig} from './types/build.js';
import type {
  BakedInSearchControllers,
  ControllerDefinitionsMap,
} from './types/controller-definition.js';
import type {
  InferControllerStaticStateMapFromDefinitions,
  InferControllersMapFromDefinition,
} from './types/controller-inference.js';

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
  TControllerDefinitions extends ControllerDefinitionsMap<CoreEngine | CoreEngineNext, Controller>,
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
    })) as InferControllerStaticStateMapFromDefinitions<TControllerDefinitions> &
      InferControllerStaticStateMapFromControllers<BakedInSearchControllers>,
    searchActions: clone(searchActions),
  };
}
