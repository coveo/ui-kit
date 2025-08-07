import type {UnknownAction} from '@reduxjs/toolkit';
import type {CoreEngine, CoreEngineNext} from '../../app/engine.js';
import type {Controller} from '../../controllers/controller/headless-controller.js';
import {clone, mapObject} from '../../utils/utils.js';
import {HydratedControllerBuilder} from './builders/hydrated-controller-builder.js';
import {createStaticControllerBuilder} from './builders/static-controller-builder.js';
import type {ControllerDefinitionsMap} from './types/controllers.js';
import type {EngineStaticState} from './types/engine.js';
import type {
  InferControllerPropsMapFromDefinitions,
  InferControllerStaticStateMapFromDefinitions,
  InferControllersMapFromDefinition,
} from './types/inference.js';

export function buildControllerDefinitions<
  TControllerDefinitionsMap extends ControllerDefinitionsMap<
    CoreEngine | CoreEngineNext,
    Controller
  >,
  TEngine extends CoreEngine | CoreEngineNext,
>({
  definitionsMap,
  engine,
  propsMap,
}: {
  definitionsMap: TControllerDefinitionsMap;
  engine: TEngine;
  propsMap?: InferControllerPropsMapFromDefinitions<TControllerDefinitionsMap>;
}): InferControllersMapFromDefinition<TControllerDefinitionsMap> {
  return mapObject(definitionsMap, (definition, key) => {
    const props = propsMap?.[key as keyof typeof propsMap];
    return new HydratedControllerBuilder(definition, engine, props).build();
  }) as InferControllersMapFromDefinition<TControllerDefinitionsMap>;
}

export function createStaticState<
  TSearchAction extends UnknownAction,
  TControllerDefinitions extends ControllerDefinitionsMap<
    CoreEngine | CoreEngineNext,
    Controller
  >,
>({
  searchAction,
  controllers,
}: {
  searchAction: TSearchAction;
  controllers: InferControllersMapFromDefinition<TControllerDefinitions>;
}): EngineStaticState<
  TSearchAction,
  InferControllerStaticStateMapFromDefinitions<TControllerDefinitions>
> {
  return {
    controllers: mapObject(controllers, (controller) =>
      createStaticControllerBuilder(controller).build()
    ) as InferControllerStaticStateMapFromDefinitions<TControllerDefinitions>,
    searchAction: clone(searchAction),
  };
}
